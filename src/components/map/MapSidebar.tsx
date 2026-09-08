import { useEffect, useState, type ReactNode } from 'react';
import type { EraSelection } from '@/lib/historicalEraTypes';
import { Entity, MapPath } from '@/lib/types';
import { BIBLE_BOOKS } from '@/lib/bibleBooks';
import PassageMapPanel from './PassageMapPanel';
import { PassagePlaceMatch, PassageSelection, PassageStudy } from '@/lib/passagePlaces';
import TravelInsightPanel from './TravelInsightPanel';
import { TravelInsight, TravelPlace, TravelRouteOption } from '@/lib/travelInsights';
import TerritoryEvidenceCard from './TerritoryEvidenceCard';
import { HistoricalMapSelection } from '@/data/biblicalTerritories';
import {
  HISTORICAL_PLACE_KIND_LABELS,
  HistoricalPlaceCoverage,
  HistoricalPlaceKind,
} from '@/data/biblicalPlaces';

type SidebarSection = 'explore' | 'places-in-book' | 'distance' | 'library';


interface MapSidebarProps {
  searchSlot?: ReactNode;
  detailPlaceId: string | null; onReturnToAllEras: () => void;
  eraSelection: EraSelection; onCollapsedChange: (collapsed: boolean) => void;
  territorySelection: HistoricalMapSelection | null; onClearTerritory: () => void;
  savedPlaces: Entity[]; selectedSavedPlaceId: string | null; onFocusSavedPlace: (place: Entity) => void; onEditSavedPlace: (place: Entity) => void; onDeleteSavedPlace: (place: Entity) => void; onStartAddingPlace: () => void; isAddingPlace: boolean;
  savedPaths: MapPath[]; activePathIds: Set<string>; onTogglePathVisibility: (id: string) => void; onFocusPath: (path: MapPath) => void; onEditPath: (path: MapPath) => void; onDeletePath: (path: MapPath) => void; onStartDrawingPath: () => void; isDrawingPath: boolean; onOpenCreatePathModal: () => void;
  biblicalPlaceCount: number; totalBiblicalPlaceCount: number; selectedBook: string | null; onSelectBook: (book: string | null) => void; showBiblicalPlaces: boolean; onToggleBiblicalPlaces: () => void;
  placeKind: HistoricalPlaceKind | 'all'; onSelectPlaceKind: (kind: HistoricalPlaceKind | 'all') => void; placeCoverage: HistoricalPlaceCoverage; onSelectPlaceCoverage: (coverage: HistoricalPlaceCoverage) => void;
  passageStudy: PassageStudy | null; passageLoading: boolean; passageError: string | null; onMapPassage: (selection: PassageSelection) => void; onClearPassage: () => void; onFocusPassagePlace: (match: PassagePlaceMatch) => void;
  travelPlaces: TravelPlace[]; travelStart: TravelPlace | null; travelEnd: TravelPlace | null; travelInsight: TravelInsight | null; selectedTravelOptionId: TravelRouteOption['id']; onSelectTravelStart: (place: TravelPlace) => void; onSelectTravelEnd: (place: TravelPlace) => void; onClearTravelStart: () => void; onClearTravelEnd: () => void; onSelectTravelOption: (id: TravelRouteOption['id']) => void; onClearTravelInsight: () => void; onSaveTravelAsPath?: () => void;
}

const DESTINATIONS = [
  { id: 'explore', label: 'Explore places', short: 'Explore', description: 'Find places and set map filters', icon: '⌖' },
  { id: 'places-in-book', label: 'Study a passage', short: 'Passage', description: 'See Scripture on the map', icon: '▤' },
  { id: 'distance', label: 'Journeys', short: 'Journeys', description: 'Measure distance or draw a route', icon: '↗' },
  { id: 'library', label: 'Your saved items', short: 'Saved', description: 'Revisit your places and routes', icon: '☆' },
] as const;

export default function MapSidebar(props: MapSidebarProps) {
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 640);
  const [openSection, setOpenSection] = useState<SidebarSection>('explore');
  useEffect(() => props.onCollapsedChange(collapsed), [collapsed, props.onCollapsedChange]);
  useEffect(() => { if (props.detailPlaceId && window.innerWidth < 640) setCollapsed(true); }, [props.detailPlaceId]);

  const [savedTab, setSavedTab] = useState<'places' | 'routes'>('places');
  const current = DESTINATIONS.find(item => item.id === openSection) ?? DESTINATIONS[0];
  const filters = [
    ...(props.selectedBook ? [{ label: props.selectedBook, clear: () => props.onSelectBook(null) }] : []),
    ...(props.placeKind !== 'all' ? [{ label: HISTORICAL_PLACE_KIND_LABELS[props.placeKind], clear: () => props.onSelectPlaceKind('all') }] : []),
    ...(props.placeCoverage !== 'all' ? [{ label: props.placeCoverage === 'major' ? 'Major only' : 'Major + regional', clear: () => props.onSelectPlaceCoverage('all') }] : []),
  ];
  const navigation = <nav className="study-navigation" aria-label="Map workspaces">
    {DESTINATIONS.map(item => <button key={item.id} aria-pressed={openSection === item.id && !collapsed} onClick={() => { setOpenSection(item.id); setCollapsed(false); }}>
      <span aria-hidden="true" className="study-nav-icon">{item.icon}</span>
      <span className="study-nav-label">{item.label}<small>{item.description}</small></span>
      <span className="study-nav-short">{item.short}</span>
    </button>)}
  </nav>;
  return <>
    <aside data-map-obstruction="dock" className={`study-dock ${collapsed ? 'is-collapsed' : ''}`} aria-label="Bible map tools">
      {!collapsed && <>
        <div className="study-dock-heading"><div><strong>Bible map</strong><span>Explore the world of Scripture</span></div><button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar">Hide</button></div>
        <div className="study-context">
          {props.searchSlot}
          {filters.length > 0 && <div className="study-filter-chips">{filters.map(filter => <button key={filter.label} onClick={filter.clear} aria-label={`Remove ${filter.label} filter`}>{filter.label} ×</button>)}<button onClick={() => filters.forEach(filter => filter.clear())}>Reset filters</button></div>}
        </div>
      </>}
      {navigation}
      {!collapsed && <div className="study-workspace">
        <TerritoryEvidenceCard selection={props.territorySelection} onClear={props.onClearTerritory} onReturnToAllEras={props.eraSelection.eraId ? props.onReturnToAllEras : undefined} />
        <div className="study-workspace-title"><h2>{current.label}</h2><p>{current.description}</p></div>
        {openSection === 'library' && <div className="study-saved-tabs" aria-label="Saved item type"><button aria-pressed={savedTab === 'places'} onClick={() => setSavedTab('places')}>Places ({props.savedPlaces.length})</button><button aria-pressed={savedTab === 'routes'} onClick={() => setSavedTab('routes')}>Routes ({props.savedPaths.length})</button></div>}
        {/* ── Explore ──────────────────────────────────────────────────── */}
        {openSection === 'explore' && <section>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold text-slate-500">Reading in</span>
              <select value={props.selectedBook ?? ''} onChange={e => props.onSelectBook(e.target.value || null)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" aria-label="Filter map by Bible book">
                <option value="">All books</option>
                <optgroup label="Old Testament">{BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => <option key={b.name} value={b.name}>{b.name}</option>)}</optgroup>
                <optgroup label="New Testament">{BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => <option key={b.name} value={b.name}>{b.name}</option>)}</optgroup>
              </select>
            </label>

            <button role="switch" aria-checked={props.showBiblicalPlaces} onClick={props.onToggleBiblicalPlaces} className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold transition hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full transition ${props.showBiblicalPlaces ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span className="text-left text-slate-700 dark:text-slate-200">{props.showBiblicalPlaces ? `${props.biblicalPlaceCount} places represented` : 'Historical places hidden'}</span>
            </button>

            <div className="border-l-2 border-amber-600/60 pl-3 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
              Nearby records consolidate into numbered clusters. Zoom in to separate them; exact shared sites remain grouped so no record is buried beneath another.
            </div>
          </div>
        </section>}

        {/* ── All places in a book ───────────────────────────────────────── */}
        {openSection === 'places-in-book' && <section>
          <PassageMapPanel eraSelection={props.eraSelection} study={props.passageStudy} loading={props.passageLoading} error={props.passageError} onMapPassage={props.onMapPassage} onClear={props.onClearPassage} onFocusPlace={props.onFocusPassagePlace} />
        </section>}

        {/* ── Distance between two places ───────────────────────────────── */}
        {openSection === 'distance' && <section>            {/* Top Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { props.onStartDrawingPath(); if (window.innerWidth < 640) setCollapsed(true); }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 px-2.5 text-xs font-bold transition ${
                  props.isDrawingPath
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
                    : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {props.isDrawingPath ? '✕ Cancel Drawing' : 'Draw route'}
              </button>

              <button
                onClick={props.onOpenCreatePathModal}
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create route
              </button>
            </div>

            {props.isDrawingPath && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                Click biblical places or any location on the map to add route stops.
              </p>
            )}

<h3 className="study-subheading">Measure distance</h3>
          <TravelInsightPanel places={props.travelPlaces} start={props.travelStart} end={props.travelEnd} insight={props.travelInsight} selectedOptionId={props.selectedTravelOptionId} onSelectStart={props.onSelectTravelStart} onSelectEnd={props.onSelectTravelEnd} onClearStart={props.onClearTravelStart} onClearEnd={props.onClearTravelEnd} onSelectOption={props.onSelectTravelOption} onClear={props.onClearTravelInsight} onSaveAsPath={props.onSaveTravelAsPath} />
        </section>}

        {/* ── Marked Paths & Routes ────────────────────────────────────── */}
        {openSection === 'library' && savedTab === 'routes' && <section>
          <div className="space-y-4">
            {/* Saved Paths List */}
            {props.savedPaths.length > 0 ? (
              <div className="space-y-1.5">
                {props.savedPaths.map(path => {
                  const isVisible = props.activePathIds.has(path.id);
                  const stopsCount = path.points?.length ?? 0;
                  const firstStop = path.points?.[0]?.name;
                  const lastStop = path.points?.[stopsCount - 1]?.name;

                  return (
                    <div
                      key={path.id}
                      className={`group flex items-start gap-2.5 rounded-xl p-2.5 transition ${
                        isVisible
                          ? 'bg-slate-50 border border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700/80'
                          : 'hover:bg-slate-50/70 border border-transparent dark:hover:bg-white/5'
                      }`}
                    >
                      {/* Visibility Toggle Eye */}
                      <button
                        onClick={() => props.onTogglePathVisibility(path.id)}
                        className={`mt-0.5 rounded-lg p-1 transition ${
                          isVisible
                            ? 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50'
                            : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 dark:text-slate-500'
                        }`}
                        title={isVisible ? 'Hide from map' : 'Show on map'}
                        aria-label={isVisible ? 'Hide path from map' : 'Show path on map'}
                      >
                        {isVisible ? (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        )}
                      </button>

                      {/* Path Details */}
                      <button
                        onClick={() => {
                          if (!isVisible) props.onTogglePathVisibility(path.id);
                          props.onFocusPath(path);
                        }}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: path.color }}
                          />
                          <span className="truncate text-sm font-bold text-slate-800 dark:text-white">
                            {path.name}
                          </span>
                        </div>

                        {path.description && (
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                            {path.description}
                          </span>
                        )}

                        <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                          {firstStop && lastStop ? (
                            <span className="truncate">{firstStop} → {lastStop}</span>
                          ) : (
                            <span>{stopsCount} stops</span>
                          )}
                          {path.total_distance_km ? (
                            <span>· {Math.round(path.total_distance_km)} km</span>
                          ) : null}
                          <span className="capitalize">· {path.style}</span>
                        </div>
                      </button>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex shrink-0 items-center gap-0.5 opacity-100">
                        <button
                          onClick={() => props.onEditPath(path)}
                          aria-label={`Edit ${path.name}`}
                          className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                          title="Edit path"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => props.onDeletePath(path)}
                          aria-label={`Delete ${path.name}`}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                          title="Delete path"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No routes saved yet</p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 leading-4">
                  Open Journeys to draw a route or save a measured journey.
                </p>
              </div>
            )}
          </div>
        </section>}

        {/* ── Library ──────────────────────────────────────────────────── */}
        {openSection === 'library' && savedTab === 'places' && <section>
          <div className="space-y-5">
            {/* Saved Places */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-500">Saved places</p>
                <button onClick={() => { props.onStartAddingPlace(); if (window.innerWidth < 640) setCollapsed(true); }} className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${props.isAddingPlace ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300'}`}>
                  {props.isAddingPlace ? '✕ Cancel placement' : '+ Add place'}
                </button>
              </div>
              {props.isAddingPlace && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  Click anywhere on the map to place a pin.
                </p>
              )}
              {props.savedPlaces.length ? (
                <div className="mt-2 space-y-1">
                  {props.savedPlaces.map(place => (
                    <div key={place.id} className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 transition ${props.selectedSavedPlaceId === place.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      <button onClick={() => props.onFocusSavedPlace(place)} className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-white">{place.name}</span>
                        <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{place.description || 'Saved study place'}</span>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-100">
                        <button onClick={() => props.onEditSavedPlace(place)} aria-label={`Edit ${place.name}`} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" title="Edit">✎</button>
                        <button onClick={() => props.onDeleteSavedPlace(place)} aria-label={`Delete ${place.name}`} className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400" title="Delete">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Add a place when it matters to your study.</p>
              )}
            </div>

          </div>
        </section>}
      </div>}
    </aside>
  </>;
}
