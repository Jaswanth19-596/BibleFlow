import { HISTORICAL_CONTENT } from '@/data/historicalEraContent';
import { PLACE_BY_ID, resolvePlaceLabel } from '@/lib/historicalEraResolver';
import type { EraLayers, EraSelection, HistoricalEra, HistoricalRoute } from '@/lib/historicalEraTypes';
export function EvidenceLinks({ ids }: { ids: string[] }) {
  return <ul className="space-y-1">{[...new Set(ids)].map(id => { const e = HISTORICAL_CONTENT.evidence.find(e => e.id === id); return e ? <li key={id}><a className="underline decoration-slate-300 underline-offset-2" href={e.url} target="_blank" rel="noreferrer">{e.title} · {e.locator}</a></li> : null; })}</ul>;
}
export default function HistoricalEraPanel({ era, selection, layers, onLayers, showPlaces, onPlaces, routeId, routes, onRoute, onFocus, onSnapshot, book }: {
  era: HistoricalEra | undefined; selection: EraSelection; layers: EraLayers; onLayers: (layers: EraLayers) => void;
  showPlaces: boolean; onPlaces: () => void; routeId: string | null; routes: HistoricalRoute[];
  onRoute: (id: string | null) => void; onFocus: (id: string) => void; onSnapshot: (id: string) => void; book: string | null;
}) {
  if (!era) return <p className="text-xs leading-5 text-slate-500">Choose an era to explore sourced places, narrative journeys and geographic context. All eras keeps the complete catalog available.</p>;
  const snapshot = HISTORICAL_CONTENT.snapshots.find(s => s.id === selection.snapshotId);
  const route = routes.find(r => r.id === routeId) ?? routes.find(r => era.defaultRouteIds.includes(r.id));
  return <div className="space-y-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
    <p>{era.summary}</p>
    <label className="block font-semibold">Map snapshot<select aria-label="Historical snapshot" className="mt-1 block w-full rounded border bg-transparent p-2" value={selection.snapshotId ?? ''} onChange={e => onSnapshot(e.target.value)}>{era.snapshotIds.map(id => <option key={id} value={id}>{HISTORICAL_CONTENT.snapshots.find(s => s.id === id)?.label}</option>)}</select></label>
    <p>{snapshot?.description}</p>
    <div className="grid grid-cols-2 gap-2">{(['places', 'areas', 'journeys', 'names'] as const).map(key => <label key={key} className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={key === 'places' ? showPlaces : layers[key]} onChange={() => key === 'places' ? onPlaces() : onLayers({ ...layers, [key]: !layers[key] })} />{{places: 'Places', areas: 'Historical areas', journeys: 'Historical journeys', names: 'Names'}[key]}</label>)}</div>
    <p>○ Site halos indicate narrative context, not territorial control. Dashed links show narrative order. Names toggles persistent labels.</p>
    {routes.length > 0 ? <><label className="block font-semibold">Historical journey<select aria-label="Historical journey" className="mt-1 block w-full rounded border bg-transparent p-2" value={route?.id ?? ''} onChange={e => onRoute(e.target.value)}>{routes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
      {route && <div><p>{route.description}</p><ol className="my-2 list-inside list-decimal space-y-1">{route.stops.map(stop => <li key={stop.id}>{stop.placeId ? <button className="underline underline-offset-2" onClick={() => onFocus(stop.placeId!)}>{resolvePlaceLabel(stop.placeId, selection.eraId, selection.snapshotId, book, PLACE_BY_ID.get(stop.placeId))}</button> : <span>{stop.label} — unmapped</span>}</li>)}</ol><p>{route.interpretation} {route.uncertainty}</p><details className="mt-2"><summary>Journey evidence</summary><EvidenceLinks ids={route.evidenceIds} /></details></div>}</> : <p>No reviewed itinerary for this snapshot.</p>}
    <p>{era.chronologyNote}</p><details><summary>Reading and evidence</summary><EvidenceLinks ids={era.evidenceIds} /></details>
    <p>Curated study selection. Unclassified places remain available through broader search and All eras. Personal places, paths and travel estimates have no inferred era assignment.</p>
  </div>;
}
