import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const SOURCE_REVISION = '7eb18a5ee62f27b9b93bd6689ea272d76dd23b8f';
const SOURCE_URL = `https://raw.githubusercontent.com/openbibleinfo/Bible-Geocoding-Data/${SOURCE_REVISION}/data/ancient.jsonl`;
const DEFAULT_OUTPUT = path.resolve('src/data/generated/openBiblePlaces.json');

const MAJOR_PLACES = new Set([
  'alexandria', 'antioch', 'assyria', 'athens', 'babylon', 'canaan',
  'corinth', 'damascus', 'egypt', 'ephesus', 'galilee', 'jericho',
  'jerusalem', 'jordan', 'judea', 'mediterranean sea', 'nineveh', 'rome',
  'samaria', 'sea of galilee', 'sinai', 'tyre', 'ur',
]);

const PREFERRED_NAMES = new Set([
  ...MAJOR_PLACES,
  'beersheba', 'bethel', 'bethany', 'bethlehem', 'caesarea', 'capernaum',
  'gaza', 'gibeon', 'hebron', 'kadesh-barnea', 'megiddo', 'mount carmel',
  'mount hermon', 'mount nebo', 'mount of olives', 'mount sinai', 'nazareth',
  'patmos', 'shechem', 'shiloh', 'sidon', 'susa', 'tarsus',
]);

const KIND_BY_TYPE = new Map([
  ['settlement', 'settlement'], ['settlement and spring', 'settlement'],
  ['region', 'region'], ['people group', 'region'], ['island', 'region'],
  ['natural area', 'region'],
  ['river', 'water'], ['body of water', 'water'], ['spring', 'water'],
  ['pool', 'water'], ['well', 'water'], ['wadi', 'water'], ['canal', 'water'],
  ['ford', 'water'],
  ['mountain', 'landform'], ['mountain range', 'landform'],
  ['mountain ridge', 'landform'], ['mountain pass', 'landform'],
  ['hill', 'landform'], ['valley', 'landform'], ['cliff', 'landform'],
  ['rock', 'landform'], ['cave', 'landform'], ['promontory', 'landform'],
  ['forest', 'landform'], ['field', 'landform'], ['garden', 'landform'],
  ['tree', 'landform'],
  ['gate', 'structure'], ['structure', 'structure'], ['altar', 'structure'],
  ['hall', 'structure'], ['room', 'structure'], ['fortification', 'structure'],
  ['district in settlement', 'structure'], ['stone heap', 'structure'],
  ['road', 'route'], ['campsite', 'campsite'],
]);

const KIND_PRIORITY = ['settlement', 'region', 'water', 'landform', 'structure', 'route', 'campsite', 'unknown'];

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function cleanText(value = '') {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanName(value = '') {
  // OpenBible's numeric suffixes disambiguate different ancient places with
  // the same biblical name (for example Ai 1 / Ai 2); they are identity data.
  return cleanText(value).trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function classifyKind(types) {
  const kinds = new Set(types.map(type => KIND_BY_TYPE.get(type)).filter(Boolean));
  return KIND_PRIORITY.find(kind => kinds.has(kind)) ?? 'unknown';
}

function classifyConfidence(score) {
  if (!Number.isFinite(score) || score <= 0) return 'unknown';
  if (score >= 750) return 'high';
  if (score >= 400) return 'medium';
  return 'low';
}

function classifyPrecision(resolution) {
  if (resolution.ancient_geometry === 'point' || resolution.lonlat_type === 'point') return 'site';
  if (resolution.ancient_geometry === 'path') return 'representative';
  return 'regional';
}

function toCandidate(record, identification, resolution, identificationIndex, resolutionIndex) {
  if (!resolution.lonlat) return null;
  const [lng, lat] = resolution.lonlat.split(',').map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const modernId = resolution.modern_basis_id || identification.id || `${record.id}-${identificationIndex}-${resolutionIndex}`;
  const association = record.modern_associations?.[modernId];
  const score = Math.max(
    0,
    Math.min(1000, Math.round(identification.score?.time_total ?? resolution.best_time_score ?? resolution.best_path_score ?? association?.score ?? 0)),
  );
  const type = resolution.type || identification.types?.[0] || record.types?.[0] || 'unknown';
  const description = cleanText(resolution.description || identification.description || association?.name || '');

  return {
    id: modernId,
    name: cleanText(association?.name || description || record.friendly_id),
    lat,
    lng,
    type,
    description,
    score,
    confidence: classifyConfidence(score),
    precision: classifyPrecision(resolution),
  };
}

function choosePrimaryName(names) {
  return [...names].sort((a, b) => {
    const aPreferred = PREFERRED_NAMES.has(a.toLowerCase()) ? 0 : 1;
    const bPreferred = PREFERRED_NAMES.has(b.toLowerCase()) ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;
    const aNumbered = /\s+\d+$/.test(a) ? 1 : 0;
    const bNumbered = /\s+\d+$/.test(b) ? 1 : 0;
    if (aNumbered !== bNumbered) return aNumbered - bNumbered;
    return a.length - b.length || a.localeCompare(b);
  })[0];
}

async function loadSource(inputPath) {
  if (inputPath) return readFile(path.resolve(inputPath), 'utf8');
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`OpenBible download failed: ${response.status} ${response.statusText}`);
  return response.text();
}

const inputPath = readArg('--input');
const outputPath = path.resolve(readArg('--output') || DEFAULT_OUTPUT);
const sourceText = await loadSource(inputPath);
const sourceRecords = sourceText.split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
const groups = new Map();

for (const record of sourceRecords) {
  const candidates = [];
  (record.identifications || []).forEach((identification, identificationIndex) => {
    (identification.resolutions || []).forEach((resolution, resolutionIndex) => {
      const candidate = toCandidate(record, identification, resolution, identificationIndex, resolutionIndex);
      if (candidate) candidates.push(candidate);
    });
  });

  candidates.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  const primary = candidates[0];
  if (!primary) continue;

  // Ancient identities must remain separate even when several records resolve
  // to the same modern point (for example Jerusalem, its gates, and districts).
  // Screen-space clustering handles overlap without flattening these records
  // into aliases of a single place.
  const groupKey = record.id;
  const group = groups.get(groupKey) || {
    key: groupKey,
    lat: primary.lat,
    lng: primary.lng,
    primaryIdentificationId: primary.id,
    primaryScore: primary.score,
    friendlyNames: [],
    names: [],
    references: [],
    types: [],
    notes: [],
    ancientIds: [],
    candidates: new Map(),
  };

  if (primary.score > group.primaryScore) {
    group.lat = primary.lat;
    group.lng = primary.lng;
    group.primaryIdentificationId = primary.id;
    group.primaryScore = primary.score;
  }

  group.friendlyNames.push(cleanName(record.friendly_id));
  group.names.push(cleanName(record.friendly_id), ...Object.keys(record.translation_name_counts || {}).map(cleanName));
  group.references.push(...(record.verses || []).map(verse => verse.readable).filter(Boolean));
  group.types.push(...(record.types || []));
  if (record.comment) group.notes.push(cleanText(record.comment));
  group.ancientIds.push(record.id);

  candidates.forEach(candidate => {
    const key = `${candidate.id}:${candidate.lat.toFixed(5)},${candidate.lng.toFixed(5)}`;
    const existing = group.candidates.get(key);
    if (!existing || candidate.score > existing.score) group.candidates.set(key, candidate);
  });
  groups.set(groupKey, group);
}

const places = [...groups.values()].map(group => {
  const friendlyNames = unique(group.friendlyNames);
  const name = cleanName(choosePrimaryName(friendlyNames));
  const aliases = unique(group.names.map(cleanName))
    .filter(alias => alias.toLowerCase() !== name.toLowerCase())
    .sort((a, b) => a.localeCompare(b));
  const references = unique(group.references);
  const types = unique(group.types);
  const kind = classifyKind(types);
  const primaryNameIsMajor = [name, ...aliases].some(value => MAJOR_PLACES.has(value.toLowerCase()));
  const importance = primaryNameIsMajor ? 1 : kind === 'region' || references.length >= 5 ? 2 : 3;
  const identifications = [...group.candidates.values()].sort((a, b) => {
    const aPrimary = a.id === group.primaryIdentificationId ? 0 : 1;
    const bPrimary = b.id === group.primaryIdentificationId ? 0 : 1;
    return aPrimary - bPrimary || b.score - a.score || a.name.localeCompare(b.name);
  });
  const primary = identifications[0];

  return {
    id: `openbible-${group.key}`,
    openBibleIds: unique(group.ancientIds),
    primaryIdentificationId: group.primaryIdentificationId,
    name,
    aliases,
    lat: group.lat,
    lng: group.lng,
    importance,
    kind,
    types,
    references,
    note: unique(group.notes)[0] || undefined,
    confidence: primary?.confidence || 'unknown',
    confidenceScore: primary?.score || 0,
    locationPrecision: primary?.precision || 'representative',
    identifications,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

const catalog = {
  metadata: {
    source: 'OpenBible.info Bible Geocoding Data',
    sourceUrl: 'https://github.com/openbibleinfo/Bible-Geocoding-Data',
    license: 'CC BY 4.0',
    revision: SOURCE_REVISION,
    sourceRecordCount: sourceRecords.length,
    mappedPlaceCount: places.length,
  },
  places,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(catalog)}\n`);
console.log(`Wrote ${places.length} mapped historical places from ${sourceRecords.length} OpenBible records to ${outputPath}`);
