import assert from 'node:assert/strict';
import { createServer } from 'vite';
import path from 'node:path';
const server = await createServer({ configFile: false, resolve: { alias: { '@': path.resolve('src') } }, server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] } });
let count = 0;
const test = (name, fn) => { fn(); count++; console.log(`✓ ${name}`); };
try {
  const { HISTORICAL_CONTENT: data } = await server.ssrLoadModule('/src/data/historicalEraContent.ts');
  const { BIBLICAL_PLACE_CLUSTERS: places } = await server.ssrLoadModule('/src/data/biblicalPlaces.ts');
  const { validateHistoricalEras } = await server.ssrLoadModule('/src/lib/validateHistoricalEras.ts');
  const { validateEraSelection: select, resolveHistoricalView: resolve, resolvePlaceLabel: label } = await server.ssrLoadModule('/src/lib/historicalEraResolver.ts');
  const { readEraUrl, eraUrl } = await server.ssrLoadModule('/src/hooks/useHistoricalEra.ts');
  const view = (era, more = {}) => resolve({ selection: select(era), bookPlaces: places, book: null, coverage: 'all', kind: 'all', journeys: true, ...more });
  const reject = (mutate, message) => { const fixture = structuredClone(data); mutate(fixture); assert(validateHistoricalEras(fixture).some(e => e.includes(message)), message); };
  test('complete source manifest is valid', () => assert.deepEqual(validateHistoricalEras(data), []));
  test('all 12 eras have places, context and only compatible journeys', () => data.eras.forEach(e => { const v = view(e.id); assert(v.normal.length); assert(v.areas.length); assert(v.routes.every(r => r.eraIds.includes(e.id))); }));
  test('era + incompatible book is empty without widening', () => { const v = view('jesus-ministry', { bookPlaces: places.filter(p => p.books.includes('Philemon')), book: 'Philemon', journeys: false }); assert.equal(v.normal.length, 0); assert.equal(v.records.length, 0); } );
  test('passage overrides survive density and era filters without double counting', () => {
    const id = 'openbible-afc8e7a'; const v = view('jesus-ministry', { passageActive: true, passageIds: [id,id,'openbible-a15257a'], focusId: id, kind: 'water', journeys: false });
    assert.equal(v.records.length, 2); assert.equal(v.counts.overrides, 2); assert(!v.eligibleIds.has(id)); assert(v.overrideReasons.get(id).includes('Passage study'));
  });
  test('unclassified catalog records remain available in All eras', () => { assert.equal(view(null, {journeys: false}).normal.length, places.length); });
  test('Laish and Sebaste names change by scope without catalog mutation', () => {
    assert.equal(label('openbible-a513646','judges','judges-study',null),'Laish'); assert.equal(label('openbible-a513646','divided-monarchy','divided-monarchy-study',null),'Dan');
    assert.equal(label('openbible-a041bb3','herodian','herodian-study',null),'Sebaste'); assert.equal(label('openbible-a041bb3',null,null,null),'Samaria 1');
    assert.equal(places.find(p => p.id === 'openbible-a513646').name,'Dan');
  });
  test('co-located ancient identities remain distinct', () => { const v = view(null); assert(v.records.some(p=>p.id==='openbible-a403c45')); assert(v.records.some(p=>p.id==='openbible-a15257a')); });
  test('snapshot switches change the eligible sites and selected journey together', () => {
    const first = view('judges');
    const second = view('judges', { selection: select('judges', 'judges-levite') });
    assert(first.eligibleIds.has('openbible-a513646')); assert(!second.eligibleIds.has('openbible-a513646'));
    assert.deepEqual(first.routes.map(r=>r.id),['danite-scouts']); assert.deepEqual(second.routes.map(r=>r.id),['levite-journey']);
    assert.equal(label('openbible-a513646','judges','judges-levite',null),'Dan');
  });
  test('route selection replaces default and outdated routes cannot leak to next era', () => { assert.deepEqual(view('early-church', { routeId:'paul-rome' }).routes.map(r=>r.id),['paul-rome']); assert(view('jesus-ministry', {routeId:'paul-rome'}).routes.every(r=>r.id!=='paul-rome')); });
  test('route stops override book and density; journeys switch removes those overrides', () => { assert(view('early-church', { bookPlaces: [], coverage:'major', routeId:'paul-rome' }).records.length > 0); assert.equal(view('early-church', { bookPlaces: [], journeys:false }).records.length,0); });
  test('no segment bridges an unresolved wilderness stage', () => { const r=data.routes.find(r=>r.id==='wilderness-stations'); for (const s of r.segments) if (r.stops.some(t=>[s.from,s.to].includes(t.id)&&t.unresolved)) assert.equal(s.geometry,undefined); });
  test('URL preserves unrelated parameters, validates scope and treats removed values as All eras', () => {
    assert.equal(eraUrl('?foo=keep&snapshot=bad',select('judges')),'?foo=keep&era=judges'); assert.equal(select('judges','herodian-study').snapshotId,'judges-study'); assert.equal(readEraUrl('?era=bogus').invalid,true); assert.equal(readEraUrl('?foo=keep').selection.eraId,null); assert.equal(readEraUrl('?era=all').invalid,false);
  });
  test('validator rejects duplicate IDs',()=>reject(d=>d.eras.push(d.eras[0]),'duplicate ID'));
  test('validator rejects unknown place IDs',()=>reject(d=>d.annotations[0].placeId='missing','unknown place'));
  test('validator rejects missing evidence',()=>reject(d=>d.routes[0].evidenceIds=['missing'],'missing evidence'));
  test('validator rejects invalid chapter/verse',()=>reject(d=>d.annotations[0].references[0].verse=999,'invalid Scripture'));
  test('validator rejects incompatible snapshots',()=>reject(d=>d.eras[0].defaultSnapshotId='missing','invalid default snapshot'));
  test('validator rejects conflicting names',()=>reject(d=>d.names.push({...d.names[0],id:'conflict',name:'Wrong'}),'contradictory preferred names'));
  test('validator rejects draft release content',()=>reject(d=>d.annotations[0].status='draft','draft in released era'));
  test('validator rejects missing route endpoints',()=>reject(d=>d.routes[0].segments[0].from='missing','missing endpoint'));
  test('validator rejects invalid coordinates',()=>reject(d=>d.routes[0].segments[0].geometry.coordinates[0]=[999,NaN],'invalid coordinate'));
  test('validator rejects unclosed polygon',()=>reject(d=>d.areas[0].geometry={type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1]]]},'unclosed ring'));
  test('validator rejects unmapped stops with geometry',()=>reject(d=>d.routes[0].stops[0]={id:d.routes[0].stops[0].id,order:1,label:'Unknown',unresolved:'Unknown'},'bridges an unresolved stop'));
  test('validator rejects absent manifest entries',()=>reject(d=>d.manifest.expectedRouteIds.push('missing'),'absent route'));
  const started=performance.now(); for(let i=0;i<1200;i++) view(data.eras[i%12].id); console.log(`1200 pure resolver switches: ${Math.round(performance.now()-started)} ms (not a browser rendering benchmark).`);
  console.log(`${count} historical era tests passed.`);
} finally { await server.close(); }
