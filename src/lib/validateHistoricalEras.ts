import type { HistoricalEraContent } from './historicalEraTypes';
import { BIBLICAL_PLACE_CLUSTERS, BIBLICAL_PLACE_SOURCE } from '../data/biblicalPlaces';
import { getVersesInChapter } from './bibleBooks';

/** Reject unsupported joins before content reaches the production resolver. */
export function validateHistoricalEras(data: HistoricalEraContent): string[] {
  const errors: string[] = [];
  const check = (ok: unknown, message: string) => { if (!ok) errors.push(message); };
  const unique = (rows: { id: string }[], label: string) => {
    const seen = new Set<string>(); rows.forEach(r => { check(!seen.has(r.id), `${label}: duplicate ID ${r.id}`); seen.add(r.id); }); return seen;
  };
  const eras = unique(data.eras, 'eras'), snapshots = unique(data.snapshots, 'snapshots');
  const areas = unique(data.areas, 'areas'), routes = unique(data.routes, 'routes');
  const sources = unique(data.evidence, 'evidence');
  unique(data.annotations, 'annotations'); unique(data.names, 'names');
  const places = new Map(BIBLICAL_PLACE_CLUSTERS.map(p => [p.id, p]));
  const evidence = (ids: string[], owner: string) => { check(ids.length, `${owner}: missing evidence`); ids.forEach(id => check(sources.has(id), `${owner}: missing evidence ${id}`)); };
  const coords = (p: number[], owner: string) => check(p.length >= 2 && p.every(Number.isFinite) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90, `${owner}: invalid coordinate ${p}`);
  const geometry = (g: GeoJSON.Geometry, owner: string) => {
    if (g.type === 'LineString') { check(g.coordinates.length >= 2, `${owner}: line needs two points`); g.coordinates.forEach(p => coords(p, owner)); }
    else if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
      const polygons = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      check(polygons.length, `${owner}: empty polygon`);
      polygons.forEach(p => { check(p.length, `${owner}: missing rings`); p.forEach(ring => {
        check(ring.length >= 4, `${owner}: ring needs four points`); ring.forEach(p => coords(p, owner));
        check(JSON.stringify(ring[0]) === JSON.stringify(ring[ring.length - 1]), `${owner}: unclosed ring`);
      }); });
    } else check(false, `${owner}: unsupported geometry ${g.type}`);
  };
  const scope = (ids: string[] | undefined, owner: string) => ids?.forEach(id => check(snapshots.has(id), `${owner}: unknown snapshot ${id}`));
  data.evidence.forEach(e => { check(/^https:\/\//.test(e.url) && e.claim && e.locator && e.accessed, `${e.id}: incomplete source provenance`); });
  data.eras.forEach((e, i) => {
    check(e.order === i, `${e.id}: inconsistent order`);
    evidence(e.evidenceIds, e.id); coords(e.bounds[0], e.id); coords(e.bounds[1], e.id);
    check(e.bounds[0][0] < e.bounds[1][0] && e.bounds[0][1] < e.bounds[1][1], `${e.id}: inverted bounds`);
    check(e.snapshotIds.includes(e.defaultSnapshotId), `${e.id}: invalid default snapshot`);
    check(e.summary && e.dateLabel && e.chronologyNote, `${e.id}: missing editorial metadata`);
    e.snapshotIds.forEach(id => check(data.snapshots.some(s => s.id === id && s.eraId === e.id), `${e.id}: incompatible snapshot ${id}`));
    e.defaultRouteIds.forEach(id => check(data.routes.some(r => r.id === id && r.eraIds.includes(e.id) && r.status === 'reviewed'), `${e.id}: invalid default route ${id}`));
    check(data.annotations.some(a => a.eraId === e.id && a.status === 'reviewed'), `${e.id}: missing reviewed places`);
  });
  data.snapshots.forEach(s => { check(eras.has(s.eraId), `${s.id}: unknown era`); evidence(s.evidenceIds, s.id); check(s.areaIds.length, `${s.id}: missing area outcome`); s.areaIds.forEach(id => check(data.areas.some(a => a.id === id && a.snapshotIds.includes(s.id) && a.status === 'reviewed'), `${s.id}: invalid area ${id}`)); });
  data.annotations.forEach(a => {
    check(places.has(a.placeId), `${a.id}: unknown place ${a.placeId}`); check(eras.has(a.eraId), `${a.id}: unknown era`); scope(a.snapshotIds, a.id); evidence(a.evidenceIds, a.id);
    a.snapshotIds?.forEach(id => check(data.snapshots.find(s => s.id === id)?.eraId === a.eraId, `${a.id}: incompatible snapshot`));
    if (data.manifest.reviewedEraIds.includes(a.eraId)) check(a.status === 'reviewed', `${a.id}: draft in released era`);
    a.references.forEach(r => { const max = getVersesInChapter(r.book, r.chapter); check(Number.isInteger(r.chapter) && Number.isInteger(r.verse) && r.verse > 0 && max && r.verse <= max && (!r.endVerse || Number.isInteger(r.endVerse) && r.endVerse >= r.verse && r.endVerse <= max), `${a.id}: invalid Scripture reference ${r.book} ${r.chapter}:${r.verse}`); });
  });
  const names = new Set<string>();
  data.names.forEach(n => {
    check(places.has(n.placeId), `${n.id}: unknown name place`); evidence(n.evidenceIds, n.id); scope(n.snapshotIds, n.id);
    n.relatedPlaceIds?.forEach(id => check(places.has(id), `${n.id}: unknown related identity ${id}`));
    n.eraIds.forEach(id => { check(eras.has(id), `${n.id}: unknown era`); if (data.manifest.reviewedEraIds.includes(id)) check(n.status === 'reviewed', `${n.id}: draft name in released era`);
      (n.snapshotIds ?? ['era']).forEach(snapshot => { if (snapshot !== 'era') check(data.snapshots.find(s => s.id === snapshot)?.eraId === id, `${n.id}: incompatible name snapshot`); const key = `${n.placeId}/${id}/${snapshot}/${n.kind}`; if (n.kind === 'period-name') { check(!names.has(key), `${n.id}: contradictory preferred names`); names.add(key); } });
    });
  });
  data.areas.forEach(a => { scope(a.snapshotIds, a.id); evidence(a.evidenceIds, a.id); coords(a.anchor, a.id); a.siteIds.forEach(id => check(places.has(id), `${a.id}: unknown site ${id}`)); if (a.geometry) geometry(a.geometry, a.id); if (a.kind === 'dated-reconstruction') check(a.geometry, `${a.id}: reconstruction lacks geometry`); check(a.uncertainty, `${a.id}: missing uncertainty`); check(a.status === 'reviewed', `${a.id}: draft area in release`); });
  data.routes.forEach(r => {
    evidence(r.evidenceIds, r.id); scope(r.snapshotIds, r.id); check(r.status === 'reviewed', `${r.id}: draft route in release`);
    r.eraIds.forEach(id => check(eras.has(id), `${r.id}: unknown era`));
    r.snapshotIds?.forEach(id => check(r.eraIds.includes(data.snapshots.find(s => s.id === id)?.eraId ?? ''), `${r.id}: incompatible route snapshot`));
    const stops = unique(r.stops, r.id), segments = unique(r.segments, r.id); check(segments.size === r.segments.length, `${r.id}: repeated segments`);
    r.stops.forEach((s, i) => { check(s.order === i + 1, `${s.id}: invalid order`); check(Boolean(s.placeId) !== Boolean(s.unresolved), `${s.id}: stop must be mapped or explicitly unresolved`); if (s.placeId) check(places.has(s.placeId), `${s.id}: unknown place`); if (s.identificationId) check(places.get(s.placeId ?? '')?.identifications.some(i => i.id === s.identificationId), `${s.id}: unknown identification`); });
    r.segments.forEach(s => { check(stops.has(s.from) && stops.has(s.to), `${s.id}: missing endpoint`); evidence(s.evidenceIds, s.id);
      if (s.kind !== 'unmapped') {
        check(s.geometry, `${s.id}: mapped segment lacks geometry`); if (s.geometry) geometry(s.geometry, s.id);
        const from = r.stops.find(t => t.id === s.from), to = r.stops.find(t => t.id === s.to);
        check(from?.placeId && to?.placeId, `${s.id}: mapped segment bridges an unresolved stop`);
        [from, to].forEach((stop, i) => { const place = places.get(stop?.placeId ?? ''); const location = place?.identifications.find(p => p.id === stop?.identificationId) ?? place; const point = i ? s.geometry?.coordinates[s.geometry.coordinates.length - 1] : s.geometry?.coordinates[0]; if (location && point) check(point[0] === location.lng && point[1] === location.lat, `${s.id}: geometry does not meet its stop`); });
      } else check(!s.geometry, `${s.id}: unresolved segment has geometry`);
    });
  });
  const m = data.manifest;
  check(m.schemaVersion === 1 && m.catalogRevision === BIBLICAL_PLACE_SOURCE.revision, 'manifest: schema or base catalog revision mismatch');
  const manifestSet = (expected: string[], actual: Set<string>, label: string) => { check(new Set(expected).size === expected.length, `manifest: duplicate ${label}`); expected.forEach(id => check(actual.has(id), `manifest: absent ${label} ${id}`)); actual.forEach(id => check(expected.includes(id), `manifest: unlisted ${label} ${id}`)); };
  manifestSet(m.reviewedEraIds, eras, 'era'); manifestSet(m.expectedAreaIds, areas, 'area'); manifestSet(m.expectedRouteIds, routes, 'route'); manifestSet(m.sourceIds, sources, 'source'); manifestSet(m.expectedPlaceIds, new Set(data.annotations.map(a => a.placeId)), 'place');
  return errors;
}
