/** Historical membership is editorial study relevance, never an occupation date. */
export interface ScriptureReference { book: string; chapter: number; verse: number; endVerse?: number }
export interface HistoricalEvidence {
  id: string; claim: string; title: string; url: string; locator: string;
  accessed: string; license?: string; note?: string;
}
export interface HistoricalEra {
  id: string; order: number; label: string; summary: string; dateLabel: string;
  chronologyNote: string; evidenceIds: string[]; bounds: [[number, number], [number, number]];
  defaultSnapshotId: string; snapshotIds: string[]; defaultRouteIds: string[];
}
export interface HistoricalSnapshot {
  id: string; eraId: string; label: string; description: string; evidenceIds: string[]; areaIds: string[];
}
export interface EraPlaceAnnotation {
  id: string; placeId: string; eraId: string; snapshotIds?: string[];
  reason: string; references: ScriptureReference[]; evidenceIds: string[]; status: 'reviewed' | 'draft';
}
export interface HistoricalNameAssertion {
  id: string; placeId: string; name: string; eraIds: string[]; snapshotIds?: string[];
  kind: 'period-name' | 'translation-variant'; evidenceIds: string[]; relatedPlaceIds?: string[];
  status: 'reviewed' | 'draft';
}
export interface HistoricalAreaSnapshot {
  id: string; polityId: string; snapshotIds: string[]; name: string;
  kind: 'dated-reconstruction' | 'general-region' | 'attested-sites' | 'unresolved';
  siteIds: string[]; geometry?: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  evidenceIds: string[]; uncertainty: string; anchor: [number, number]; color: string; status: 'reviewed' | 'draft';
}
export interface RouteStop {
  id: string; order: number; label: string; placeId?: string; identificationId?: string;
  unresolved?: string;
}
export interface RouteSegment {
  id: string; from: string; to: string; mode: 'land' | 'sea' | 'unknown';
  kind: 'reconstructed' | 'schematic' | 'unmapped'; geometry?: GeoJSON.LineString; evidenceIds: string[];
}
export interface HistoricalRoute {
  id: string; eraIds: string[]; snapshotIds?: string[]; title: string; description: string;
  stops: RouteStop[]; segments: RouteSegment[]; interpretation: string; evidenceIds: string[];
  uncertainty: string; status: 'reviewed' | 'draft';
}
export interface EraReleaseManifest {
  schemaVersion: number; dataVersion: string; catalogRevision: string; reviewedEraIds: string[];
  expectedPlaceIds: string[]; expectedAreaIds: string[]; expectedRouteIds: string[];
  unresolved: string[]; sourceIds: string[];
}
export interface HistoricalEraContent {
  eras: HistoricalEra[]; snapshots: HistoricalSnapshot[]; annotations: EraPlaceAnnotation[];
  names: HistoricalNameAssertion[]; areas: HistoricalAreaSnapshot[]; routes: HistoricalRoute[];
  evidence: HistoricalEvidence[]; manifest: EraReleaseManifest;
}
export interface EraSelection { eraId: string | null; snapshotId: string | null }
export interface EraLayers { areas: boolean; journeys: boolean; names: boolean }
