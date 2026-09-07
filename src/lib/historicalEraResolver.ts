import { BIBLICAL_PLACE_CLUSTERS, type BiblicalPlaceCluster, type HistoricalPlaceCoverage, type HistoricalPlaceKind } from '../data/biblicalPlaces';
import { HISTORICAL_CONTENT as content } from '../data/historicalEraContent';
import type { EraSelection } from './historicalEraTypes';

export const ERAS = content.eras;
export const PLACE_BY_ID = new Map(BIBLICAL_PLACE_CLUSTERS.map(place => [place.id, place]));
const annotationIndex = new Map(ERAS.map(era => [era.id, content.annotations.filter(a => a.eraId === era.id && a.status === 'reviewed')]));
const nameIndex = new Map(BIBLICAL_PLACE_CLUSTERS.map(place => [place.id, content.names.filter(n => n.placeId === place.id && n.status === 'reviewed')]));
export const ALL_ERAS: EraSelection = { eraId: null, snapshotId: null };
export function validateEraSelection(eraId?: string | null, snapshotId?: string | null): EraSelection {
  const era = ERAS.find(e => e.id === eraId);
  return era ? { eraId: era.id, snapshotId: snapshotId && era.snapshotIds.includes(snapshotId) ? snapshotId : era.defaultSnapshotId } : ALL_ERAS;
}
export function getEraAnnotation(placeId: string, selection: EraSelection) {
  return annotationIndex.get(selection.eraId ?? '')?.find(a => a.placeId === placeId && (!a.snapshotIds || a.snapshotIds.includes(selection.snapshotId ?? '')));
}
export function getNameAssertion(placeId: string, selection: EraSelection) {
  const names = nameIndex.get(placeId)?.filter(n => n.kind === 'period-name' && n.eraIds.includes(selection.eraId ?? '') && (!n.snapshotIds || n.snapshotIds.includes(selection.snapshotId ?? ''))) ?? [];
  return names.find(n => n.snapshotIds) ?? names[0];
}
export function resolvePlaceLabel(placeId: string, eraId: string | null, snapshotId: string | null, selectedBook: string | null, place = PLACE_BY_ID.get(placeId)): string {
  return getNameAssertion(placeId, { eraId, snapshotId })?.name ?? (selectedBook ? place?.namesByBook[selectedBook]?.[0] : undefined) ?? place?.name ?? 'Unresolved place';
}
export function labelPlace(place: BiblicalPlaceCluster, selection: EraSelection, book: string | null): BiblicalPlaceCluster {
  const name = resolvePlaceLabel(place.id, selection.eraId, selection.snapshotId, book, place);
  return { ...place, name, aliases: [...new Set([place.name, ...place.aliases, ...(nameIndex.get(place.id) ?? []).map(n => n.name)])].filter(n => n !== name) };
}
export function resolveHistoricalView(input: {
  selection: EraSelection; bookPlaces: BiblicalPlaceCluster[]; book: string | null;
  coverage: HistoricalPlaceCoverage; kind: HistoricalPlaceKind | 'all';
  passageIds?: string[]; passageActive?: boolean; focusId?: string | null;
  routeId?: string | null; journeys: boolean;
}) {
  const { selection } = input;
  const era = ERAS.find(e => e.id === selection.eraId);
  const eligible = BIBLICAL_PLACE_CLUSTERS.filter(p => !era || getEraAnnotation(p.id, selection));
  const eligibleIds = new Set(eligible.map(p => p.id));
  const searchPlaces = input.bookPlaces.filter(p => eligibleIds.has(p.id)).map(p => labelPlace(p, selection, input.book));
  const max = input.coverage === 'major' ? 1 : input.coverage === 'major-regional' ? 2 : 3;
  const normal = searchPlaces.filter(p => p.importance <= max && (input.kind === 'all' || p.kind === input.kind));
  const availableRoutes = content.routes.filter(r => r.status === 'reviewed' && r.eraIds.includes(selection.eraId ?? '') && (!r.snapshotIds || r.snapshotIds.includes(selection.snapshotId ?? '')));
  const chosen = availableRoutes.find(r => r.id === input.routeId);
  const routes = input.journeys ? (chosen ? [chosen] : availableRoutes.filter(r => era?.defaultRouteIds.includes(r.id))) : [];
  const overrideReasons = new Map<string, string[]>();
  const add = (id: string | undefined, reason: string) => { if (id && PLACE_BY_ID.has(id)) overrideReasons.set(id, [...new Set([...(overrideReasons.get(id) ?? []), reason])]); };
  input.passageIds?.forEach(id => add(id, 'Passage study'));
  routes.forEach(r => r.stops.forEach(s => add(s.placeId, 'Historical journey')));
  add(input.focusId ?? undefined, 'Temporary study pin');
  const base = input.passageActive ? [] : normal;
  const records = new Map(base.map(p => [p.id, p]));
  overrideReasons.forEach((_, id) => records.set(id, labelPlace(PLACE_BY_ID.get(id)!, selection, input.book)));
  const baseIds = new Set(base.map(p => p.id));
  const overrides = [...overrideReasons.keys()].filter(id => !baseIds.has(id));
  return {
    era, normal, searchPlaces, records: [...records.values()], overrides, overrideReasons,
    eligibleIds, availableRoutes, routes,
    areas: content.areas.filter(a => a.status === 'reviewed' && a.snapshotIds.includes(selection.snapshotId ?? '')),
    counts: { eligible: eligible.length, filtered: normal.length, overrides: overrides.length, represented: records.size },
  };
}
