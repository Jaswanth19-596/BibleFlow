import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';
import path from 'node:path';

const bible = JSON.parse(fs.readFileSync('public/kjv.json', 'utf8'));
function worker(source) {
  let handler;
  let fetches = 0;
  const results = [];
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: {}, console,
    fetch: async () => { fetches++; return { ok: true, json: async () => bible }; },
    self: { addEventListener: (_type, callback) => { handler = callback; }, postMessage: result => results.push(result) },
  });
  return { request: async (type, payload) => { await handler({ data: { jobId: 1, type, payload } }); return results.pop(); }, fetches: () => fetches };
}
const before = worker(execFileSync('git', ['show', 'HEAD:src/lib/bibleWorker.ts'], { encoding: 'utf8' }));
const after = worker(fs.readFileSync('src/lib/bibleWorker.ts', 'utf8'));
const requests = [
  ['fetchKjvVerseRange', { book: 'GENESIS', chapter: 1, verseStart: 1, verseEnd: 8 }],
  ['fetchKjvVerseRange', { book: 'John', chapter: 3, verseStart: 16, verseEnd: null }],
  ['fetchKjvVerseRange', { book: 'Missing', chapter: 1, verseStart: 1 }],
  ['fetchKjvBook', { book: 'Psalms' }],
  ['fetchKjvCustomVerses', { book: 'John', selections: [{ chapter: 3, verseStart: 16, verseEnd: 18 }, { chapter: 1, verseStart: 5, verseEnd: 2 }, { chapter: 3, verseStart: 16, verseEnd: 16 }] }],
];
for (const [type, payload] of requests) assert.deepEqual(JSON.parse(JSON.stringify(await after.request(type, payload))), JSON.parse(JSON.stringify(await before.request(type, payload))));
assert.equal(after.fetches(), 1);
for (const [label, instance] of [['full scan', before], ['indexed', after]]) {
  const start = performance.now();
  for (let i = 0; i < 500; i++) await instance.request(...requests[1]);
  console.log(`500 warm worker range lookups (${label}): ${(performance.now() - start).toFixed(1)} ms`);
}
console.log('Worker regression: range, missing book, full book, custom ordering/duplicates and shared fetch passed.');

const server = await createServer({ configFile: false, resolve: { alias: { '@': path.resolve('src') } }, server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] } });
try {
  const { clusterHistoricalPlaces: cluster } = await server.ssrLoadModule('/src/lib/mapClustering.ts');
  const { BIBLICAL_PLACE_CLUSTERS: places } = await server.ssrLoadModule('/src/data/biblicalPlaces.ts');
  for (const zoom of [4, 8, 11, 14]) {
    const clusters = cluster(places, zoom, (lat, lng) => ({ x: lng * 10, y: lat * 10 }));
    assert.equal(clusters.reduce((n, c) => n + c.places.length, 0), places.length);
    assert.equal(new Set(clusters.flatMap(c => c.places.map(p => p.id))).size, places.length);
    assert(clusters.every(c => Number.isFinite(c.lat) && Number.isFinite(c.lng)));
  }
  const oldSource = execFileSync('git', ['show', 'HEAD:src/lib/passagePlaces.ts'], { encoding: 'utf8' });
  // Compile the previous matcher against exactly the same catalog, isolating the optimization.
  const oldModule = { exports: {} };
  vm.runInNewContext(ts.transpileModule(oldSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: oldModule.exports, require: () => ({ BIBLICAL_PLACE_CLUSTERS: places }),
  });
  const current = await server.ssrLoadModule('/src/lib/passagePlaces.ts');
  const text = bible.verses.filter(v => v.book_name === 'Judges').map(v => `[${v.chapter}:${v.verse}] ${v.text}`).join('\n');
  const results = [];
  for (const [label, matcher] of [['previous', oldModule.exports], ['cached normalization', current]]) {
    const start = performance.now();
    results.push(matcher.findPlacesInBook('Judges', text));
    console.log(`Judges catalog match (${label}): ${(performance.now() - start).toFixed(1)} ms`);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(results[1])), JSON.parse(JSON.stringify(results[0])));
  const selection = { book: 'Judges', chapter: 1, verseStart: 1, verseEnd: 36 };
  assert.deepEqual(JSON.parse(JSON.stringify(current.findPlacesInPassage(selection, text))), JSON.parse(JSON.stringify(oldModule.exports.findPlacesInPassage(selection, text))));
  console.log('Map regression: all identities preserved at four zoom levels; book and passage matches unchanged.');
} finally { await server.close(); }
