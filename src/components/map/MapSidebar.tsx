import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Entity, MapPath } from '@/lib/types';
import { BIBLE_BOOKS } from '@/lib/bibleBooks';
import PassageMapPanel from './PassageMapPanel';
import { PassagePlaceMatch, PassageSelection, PassageStudy } from '@/lib/passagePlaces';
import TravelInsightPanel from './TravelInsightPanel';
import { TravelInsight, TravelPlace, TravelRouteOption } from '@/lib/travelInsights';
import TerritoryEvidenceCard from './TerritoryEvidenceCard';
import { HistoricalMapSelection } from '@/data/biblicalTerritories';

type SidebarSection = 'explore' | 'places-in-book' | 'distance' | 'paths' | 'library';

interface RouteStop { name: string; type: string; order: number; }

interface MapSidebarProps {
  searchSlot?: ReactNode;
  territorySelection: HistoricalMapSelection | null; onClearTerritory: () => void;
  selectedPersonId: string | null; onSelectPerson: (id: string | null) => void; people: Entity[];
  savedPlaces: Entity[]; selectedSavedPlaceId: string | null; onFocusSavedPlace: (place: Entity) => void; onEditSavedPlace: (place: Entity) => void; onDeleteSavedPlace: (place: Entity) => void; onStartAddingPlace: () => void; isAddingPlace: boolean;
  savedPaths: MapPath[]; activePathIds: Set<string>; onTogglePathVisibility: (id: string) => void; onFocusPath: (path: MapPath) => void; onEditPath: (path: MapPath) => void; onDeletePath: (path: MapPath) => void; onStartDrawingPath: () => void; isDrawingPath: boolean; onOpenCreatePathModal: () => void;
  biblicalPlaceCount: number; selectedBook: string | null; onSelectBook: (book: string | null) => void; showBiblicalPlaces: boolean; onToggleBiblicalPlaces: () => void;
  passageStudy: PassageStudy | null; passageLoading: boolean; passageError: string | null; onMapPassage: (selection: PassageSelection) => void; onClearPassage: () => void; onFocusPassagePlace: (match: PassagePlaceMatch) => void;
  travelPlaces: TravelPlace[]; travelStart: TravelPlace | null; travelEnd: TravelPlace | null; travelInsight: TravelInsight | null; selectedTravelOptionId: TravelRouteOption['id']; onSelectTravelStart: (place: TravelPlace) => void; onSelectTravelEnd: (place: TravelPlace) => void; onClearTravelStart: () => void; onClearTravelEnd: () => void; onSelectTravelOption: (id: TravelRouteOption['id']) => void; onClearTravelInsight: () => void; onSaveTravelAsPath?: () => void;
  routeStops?: RouteStop[];
}

const SECTIONS: { id: SidebarSection; label: string; iconPath: string }[] = [
  { id: 'explore', label: 'Explore', iconPath: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'places-in-book', label: 'All places in a book', iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'distance', label: 'Distance between two places', iconPath: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
  { id: 'paths', label: 'Marked Paths & Routes', iconPath: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  { id: 'library', label: 'Library', iconPath: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
];

export default function MapSidebar(props: MapSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openSection, setOpenSection] = useState<SidebarSection | null>(null);
  const routeStops = props.routeStops ?? [];
  const selectedPerson = props.people.find(person => person.id === props.selectedPersonId);

  const toggleSection = (id: SidebarSection) => {
    setOpenSection(current => current === id ? null : id);
  };

  // ── Collapsed icon rail ──────────────────────────────────────────────
  if (collapsed) {
    return (
      <aside className="absolute left-0 top-0 bottom-0 z-[450] flex w-12 flex-col items-center gap-1 border-r border-slate-200/60 bg-white/90 py-3 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-slate-800 dark:bg-[#111716]/95" aria-label="Map sidebar (collapsed)">
        <button onClick={() => setCollapsed(false)} className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Expand sidebar" title="Expand sidebar">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>

        <Link to="/" className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-indigo-600 transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40" title="Back to Topics">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>

        <div className="my-1 h-px w-6 bg-slate-200 dark:bg-slate-700" />

        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => { setCollapsed(false); setOpenSection(section.id); }}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
              openSection === section.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white'
            }`}
            title={section.label}
            aria-label={section.label}
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={section.iconPath} /></svg>
          </button>
        ))}
      </aside>
    );
  }

  // ── Expanded sidebar ─────────────────────────────────────────────────
  return (
    <aside className="absolute left-0 top-0 bottom-0 z-[450] flex w-[360px] flex-col border-r border-slate-200/60 bg-white/95 shadow-xl shadow-black/8 backdrop-blur-xl dark:border-slate-800 dark:bg-[#111716]/97" aria-label="Map sidebar">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <Link to="/" className="group flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">
          <svg className="h-4 w-4 transition group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <svg className="h-5 w-5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Bible Flow
        </Link>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">{props.selectedBook ?? `${props.biblicalPlaceCount} places`}</span>
          <button onClick={() => setCollapsed(true)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Collapse sidebar" title="Collapse sidebar">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" /></svg>
          </button>
        </div>
      </div>

      {/* ── Search (always visible) ───────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        {props.searchSlot}
      </div>
      <TerritoryEvidenceCard selection={props.territorySelection} onClear={props.onClearTerritory} />

      {/* ── Scrollable accordion body ────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

        {/* ── Explore ──────────────────────────────────────────────────── */}
        <AccordionSection id="explore" label="Explore" iconPath={SECTIONS[0].iconPath} isOpen={openSection === 'explore'} onToggle={() => toggleSection('explore')}>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Reading in</span>
              <select value={props.selectedBook ?? ''} onChange={e => props.onSelectBook(e.target.value || null)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white" aria-label="Filter map by Bible book">
                <option value="">All books</option>
                <optgroup label="Old Testament">{BIBLE_BOOKS.filter(b => b.testament === 'OT').map(b => <option key={b.name} value={b.name}>{b.name}</option>)}</optgroup>
                <optgroup label="New Testament">{BIBLE_BOOKS.filter(b => b.testament === 'NT').map(b => <option key={b.name} value={b.name}>{b.name}</option>)}</optgroup>
              </select>
            </label>

            <button onClick={props.onToggleBiblicalPlaces} className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold transition hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600">
              <span className={`h-2.5 w-2.5 rounded-full transition ${props.showBiblicalPlaces ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span className="text-slate-700 dark:text-slate-200">{props.showBiblicalPlaces ? 'Biblical places visible' : 'Biblical places hidden'}</span>
            </button>
          </div>
        </AccordionSection>

        {/* ── All places in a book ───────────────────────────────────────── */}
        <AccordionSection id="places-in-book" label="All places in a book" iconPath={SECTIONS[1].iconPath} isOpen={openSection === 'places-in-book'} onToggle={() => toggleSection('places-in-book')} badge={props.passageStudy ? `${props.passageStudy.matches.length} places` : undefined}>
          <PassageMapPanel study={props.passageStudy} loading={props.passageLoading} error={props.passageError} onMapPassage={props.onMapPassage} onClear={props.onClearPassage} onFocusPlace={props.onFocusPassagePlace} />
        </AccordionSection>

        {/* ── Distance between two places ───────────────────────────────── */}
        <AccordionSection id="distance" label="Distance between two places" iconPath={SECTIONS[2].iconPath} isOpen={openSection === 'distance'} onToggle={() => toggleSection('distance')} badge={props.travelInsight ? `${Math.round(props.travelInsight.directDistanceKm)} km` : undefined}>
          <TravelInsightPanel places={props.travelPlaces} start={props.travelStart} end={props.travelEnd} insight={props.travelInsight} selectedOptionId={props.selectedTravelOptionId} onSelectStart={props.onSelectTravelStart} onSelectEnd={props.onSelectTravelEnd} onClearStart={props.onClearTravelStart} onClearEnd={props.onClearTravelEnd} onSelectOption={props.onSelectTravelOption} onClear={props.onClearTravelInsight} onSaveAsPath={props.onSaveTravelAsPath} />
        </AccordionSection>

        {/* ── Marked Paths & Routes ────────────────────────────────────── */}
        <AccordionSection id="paths" label="Marked Paths & Routes" iconPath={SECTIONS[3].iconPath} isOpen={openSection === 'paths'} onToggle={() => toggleSection('paths')} badge={props.savedPaths.length ? `${props.savedPaths.length}` : undefined}>
          <div className="space-y-4">
            {/* Top Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={props.onStartDrawingPath}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 px-2.5 text-xs font-bold transition ${
                  props.isDrawingPath
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
                    : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {props.isDrawingPath ? '✕ Cancel Drawing' : 'Draw on Map'}
              </button>

              <button
                onClick={props.onOpenCreatePathModal}
                className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New Route
              </button>
            </div>

            {props.isDrawingPath && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                Click biblical places or any location on the map to add route stops.
              </p>
            )}

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
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
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
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No paths saved yet</p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 leading-4">
                  Draw custom journeys on the map or measure distances to save labeled study routes.
                </p>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* ── Library ──────────────────────────────────────────────────── */}
        <AccordionSection id="library" label="Library" iconPath={SECTIONS[4].iconPath} isOpen={openSection === 'library'} onToggle={() => toggleSection('library')} badge={props.savedPlaces.length ? `${props.savedPlaces.length}` : undefined}>
          <div className="space-y-5">
            {/* Saved Places */}
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Saved places</p>
                <button onClick={props.onStartAddingPlace} className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${props.isAddingPlace ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200' : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300'}`}>
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
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
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

            {/* Divider */}
            <div className="h-px bg-slate-200 dark:bg-slate-700" />

            {/* People Routes */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">People routes</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => props.onSelectPerson(null)} className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${props.selectedPersonId === null ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'}`}>
                  All places
                </button>
                {props.people.map(person => (
                  <button key={person.id} onClick={() => props.onSelectPerson(person.id)} className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition ${props.selectedPersonId === person.id ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15'}`}>
                    {person.name}
                  </button>
                ))}
              </div>
              {selectedPerson && routeStops.length > 0 && (
                <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-400">
                  <span className="font-semibold">{selectedPerson.name}:</span>{' '}
                  {routeStops.map(stop => stop.name).join(' → ')}
                </p>
              )}
            </div>
          </div>
        </AccordionSection>
      </div>
    </aside>
  );
}

// ─── Accordion Section ─────────────────────────────────────────────────────
interface AccordionSectionProps {
  id: string;
  label: string;
  iconPath: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string;
  children: ReactNode;
}

function AccordionSection({ id, label, iconPath, isOpen, onToggle, badge, children }: AccordionSectionProps) {
  return (
    <section className="border-b border-slate-100 dark:border-slate-800" aria-labelledby={`section-${id}`}>
      <button
        id={`section-${id}`}
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${isOpen ? 'bg-slate-50 dark:bg-white/5' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
      >
        <svg className={`h-[18px] w-[18px] shrink-0 transition ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
        <span className={`flex-1 text-sm font-semibold transition ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{label}</span>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{badge}</span>
        )}
        <svg className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </section>
  );
}
