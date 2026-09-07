import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useEntities } from '@/hooks/useEntities';
import { usePeopleAtlas } from '@/hooks/usePeopleAtlas';
import { useMapPaths } from '@/hooks/useMapPaths';
import { Entity, MapPath, MapPathPoint, PathLineStyle } from '@/lib/types';
import CreatePlaceModal from './CreatePlaceModal';
import CreatePathModal from './CreatePathModal';
import PathDrawingToolbar from './PathDrawingToolbar';
import MapSidebar from './MapSidebar';
import MapSearchBar, { SearchContext } from './MapSearchBar';
import HistoricalPlaceDetails from './HistoricalPlaceDetails';
import {
  BIBLICAL_PLACE_CLUSTERS,
  BIBLICAL_PLACE_COUNT,
  BiblicalPlaceCluster,
  HistoricalPlaceCoverage,
  HistoricalPlaceIdentification,
  HistoricalPlaceKind,
} from '@/data/biblicalPlaces';
import { BIBLICAL_AREAS } from '@/data/biblicalAreas';
import { HistoricalMapSelection } from '@/data/biblicalTerritories';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { fetchKjvBook, fetchKjvVerseRange } from '@/lib/bibleApi';
import { getVersesInChapter } from '@/lib/bibleBooks';
import {
  PassagePlaceMatch,
  PassageSelection,
  PassageStudy,
  BookPlaceMatch,
  findPlacesInBook,
  findPlacesInPassage,
} from '@/lib/passagePlaces';
import {
  TravelPlace,
  TravelRouteOption,
  buildTravelInsight,
  distanceInKm,
} from '@/lib/travelInsights';
import { clusterHistoricalPlaces } from '@/lib/mapClustering';
import { useHistoricalEra } from '@/hooks/useHistoricalEra';
import { useHistoricalBaseMap } from '@/hooks/useHistoricalBaseMap';
import { useHistoricalEraLayers } from '@/hooks/useHistoricalEraLayers';
import { getEraAnnotation, labelPlace, resolveHistoricalView, resolvePlaceLabel } from '@/lib/historicalEraResolver';
import HistoricalEraControl from './HistoricalEraControl';
import HistoricalEraPanel from './HistoricalEraPanel';

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!)); }


function getStudyPadding(map: L.Map, shell: HTMLElement | null): L.FitBoundsOptions {
    const rect = map.getContainer().getBoundingClientRect();
    let left = 24, right = 50, bottom = 24;
    shell?.querySelectorAll<HTMLElement>('[data-map-obstruction]').forEach(el => {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      if (window.innerWidth < 640) bottom = Math.max(bottom, rect.bottom - r.top + 16);
      else if (el.dataset.mapObstruction === 'dock') left = Math.max(left, r.right - rect.left + 16);
      else if (el.dataset.mapObstruction === 'details') right = Math.max(right, rect.right - r.left + 16);
      else bottom = Math.max(bottom, rect.bottom - r.top + 16);
    });
    return { paddingTopLeft: [Math.min(left, rect.width * .4), 24], paddingBottomRight: [Math.min(right, rect.width * .35), Math.min(bottom, rect.height * .65)] };
}

// Create a proper default icon
const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Relationship types for person-place connections
const PLACE_REL_TYPES = [
  'visited', 'born-in', 'died-in', 'lived-in', 'preached-in',
  'ruled-over', 'traveled-to', 'exiled-to', 'fled-to', 'built',
];

function createNumberedIcon(num: number, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};color:white;font-weight:700;font-size:13px;
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

function calculatePointsDistance(points: MapPathPoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += distanceInKm(
      { lat: points[i].lat, lng: points[i].lng },
      { lat: points[i + 1].lat, lng: points[i + 1].lng }
    );
  }
  return Math.round(total * 10) / 10;
}

export default function BibleMap() {
  const { entities, createEntity, updateEntity, deleteEntity } = useEntities();
  const { relationships, createRelationship, deleteRelationship } = usePeopleAtlas();
  const { paths: savedPaths, createPath, updatePath, deletePath } = useMapPaths();

  const historical = useHistoricalEra();
  const { selection: eraSelection } = historical;
  const [readyMap, setReadyMap] = useState<L.Map | null>(null);
  const [basemap, setBasemap] = useState<'physical' | 'modern'>('physical');
  const [historicalRouteId, setHistoricalRouteId] = useState<string | null>(null);
  const [studyFocusId, setStudyFocusId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 640);
  const [representedCount, setRepresentedCount] = useState(0);
  const searchTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const passageOperation = useRef(0);
  const snapPlaces = useRef<BiblicalPlaceCluster[]>([]);
  const mapShellRef = useRef<HTMLDivElement>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clickCoord, setClickCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [showBiblicalLayer, setShowBiblicalLayer] = useState(true);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Entity | null>(null);
  const [placePendingDeletion, setPlacePendingDeletion] = useState<Entity | null>(null);
  const [selectedSavedPlaceId, setSelectedSavedPlaceId] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [placeKind, setPlaceKind] = useState<HistoricalPlaceKind | 'all'>('all');
  const [placeCoverage, setPlaceCoverage] = useState<HistoricalPlaceCoverage>('all');
  const [selectedBiblicalPlace, setSelectedBiblicalPlace] = useState<BiblicalPlaceCluster | null>(null);
  const [bookResults, setBookResults] = useState<{ book: string | null; matches: BookPlaceMatch[] }>({ book: null, matches: [] });
  const bookPlaceMatches = useMemo(() => bookResults.book === selectedBook ? bookResults.matches : [], [bookResults, selectedBook]);
  const [passageStudy, setPassageStudy] = useState<PassageStudy | null>(null);
  const [passageLoading, setPassageLoading] = useState(false);
  const [passageError, setPassageError] = useState<string | null>(null);
  const [travelStart, setTravelStart] = useState<TravelPlace | null>(null);
  const [travelEnd, setTravelEnd] = useState<TravelPlace | null>(null);
  const [selectedTravelOptionId, setSelectedTravelOptionId] = useState<TravelRouteOption['id']>('overland');
  const [selectedTerritory, setSelectedTerritory] = useState<HistoricalMapSelection | null>(null);

  // ─── Marked Paths & Routes State ──────────────────────────────────────────
  const [activePathIds, setActivePathIds] = useState<Set<string>>(() => new Set());
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<MapPathPoint[]>([]);
  const [showCreatePathModal, setShowCreatePathModal] = useState(false);
  const [editingPath, setEditingPath] = useState<MapPath | null>(null);
  const [pathPendingDeletion, setPathPendingDeletion] = useState<MapPath | null>(null);
  const [focusedPath, setFocusedPath] = useState<MapPath | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Layer[]>([]);
  const travelInsightLayersRef = useRef<L.Layer[]>([]);
  const savedPathLayersRef = useRef<L.Layer[]>([]);
  const drawingLayersRef = useRef<L.Layer[]>([]);
  const biblicalLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const territoryLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const searchPinRef = useRef<L.Marker | null>(null);
  const isAddingPlaceRef = useRef(false);
  const isDrawingPathRef = useRef(false);
  const drawingPointsRef = useRef<MapPathPoint[]>([]);

  const people = useMemo(() => entities.filter(e => e.type === 'person'), [entities]);
  const visibleBiblicalPlaces = useMemo(() => {
    if (!selectedBook) return BIBLICAL_PLACE_CLUSTERS;

    const visible = new Map<string, BiblicalPlaceCluster>();
    for (const place of BIBLICAL_PLACE_CLUSTERS) {
      if (place.books.includes(selectedBook)) visible.set(place.id, place);
    }

    for (const match of bookPlaceMatches) {
      const place = visible.get(match.place.id) ?? match.place;
      const references = Array.from(new Set([
        ...place.references,
        ...match.references,
      ]));
      const bookReferences = Array.from(new Set([
        ...(place.referencesByBook[selectedBook] ?? []),
        ...match.references,
      ]));
      const bookNames = Array.from(new Set([
        ...(place.namesByBook[selectedBook] ?? []),
        ...match.matchedNames,
      ]));

      visible.set(place.id, {
        ...place,
        references,
        aliases: Array.from(new Set([...place.aliases, ...match.matchedNames]))
          .filter(name => name.toLowerCase() !== place.name.toLowerCase()),
        books: Array.from(new Set([...place.books, selectedBook])),
        referencesByBook: { ...place.referencesByBook, [selectedBook]: bookReferences },
        namesByBook: { ...place.namesByBook, [selectedBook]: bookNames },
        mentionCountByBook: { ...place.mentionCountByBook, [selectedBook]: bookReferences.length },
      });
    }

    return Array.from(visible.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookPlaceMatches, selectedBook]);
  const eraView = useMemo(() => resolveHistoricalView({
    selection: eraSelection, bookPlaces: visibleBiblicalPlaces, book: selectedBook,
    coverage: placeCoverage, kind: placeKind, passageActive: Boolean(passageStudy),
    passageIds: passageStudy?.matches.map(m => m.place.id), focusId: studyFocusId,
    routeId: historicalRouteId, journeys: historical.layers.journeys,
  }), [eraSelection.eraId, eraSelection.snapshotId, visibleBiblicalPlaces, selectedBook, placeCoverage, placeKind, passageStudy, studyFocusId, historicalRouteId, historical.layers.journeys]);
  const placeLabel = useCallback((place: BiblicalPlaceCluster) => resolvePlaceLabel(place.id, eraSelection.eraId, eraSelection.snapshotId, selectedBook, place), [eraSelection.eraId, eraSelection.snapshotId, selectedBook]);
  useHistoricalBaseMap(readyMap, basemap);
  useHistoricalEraLayers(readyMap, eraView.areas, eraView.routes, eraView.records, historical.layers, showBiblicalLayer);
  useEffect(() => { snapPlaces.current = showBiblicalLayer ? eraView.records : []; }, [eraView.records, showBiblicalLayer]);
  useEffect(() => {
    mapRef.current?.stop();
    mapRef.current?.closePopup();
    mapRef.current?.eachLayer(layer => { if (layer instanceof L.Tooltip && !layer.options.permanent) layer.remove(); });
    setStudyFocusId(null);
    setHistoricalRouteId(null);
    if (eraSelection.eraId && selectedTerritory) { setSelectedTerritory(null); historical.announce('Previous territory highlight cleared; its outline has no reviewed era date.'); }
  }, [eraSelection.eraId, eraSelection.snapshotId]);
  useEffect(() => {
    searchTimers.current.forEach(clearTimeout); searchTimers.current = [];
    searchPinRef.current?.remove(); searchPinRef.current = null;
    return () => { searchTimers.current.forEach(clearTimeout); searchPinRef.current?.remove(); };
  }, [eraSelection.eraId, eraSelection.snapshotId, selectedBook, showBiblicalLayer]);
  useEffect(() => () => { passageOperation.current++; }, []);
  const fitEra = useCallback(() => {
    if (!readyMap || !eraView.era) return;
    const padding = getStudyPadding(readyMap, mapShellRef.current);
    const [[west, south], [east, north]] = eraView.era.bounds;
    readyMap.fitBounds([[south, west], [north, east]], { ...padding, animate: false });
  }, [readyMap, eraView.era]);

  useEffect(() => {
    if (!selectedBook) {
      setBookResults({ book: selectedBook, matches: [] });
      return;
    }

    let cancelled = false;
    fetchKjvBook(selectedBook)
      .then(text => {
        if (!cancelled) setBookResults({ book: selectedBook, matches: findPlacesInBook(selectedBook, text) });
      })
      .catch(() => {
        // The catalog's cited references remain available if the local KJV
        // file cannot be loaded.
        if (!cancelled) setBookResults({ book: selectedBook, matches: [] });
      });

    return () => { cancelled = true; };
  }, [selectedBook]);
  const visibleAreas = useMemo(
    () => selectedBook && !eraSelection.eraId ? BIBLICAL_AREAS.filter(area => area.books.includes(selectedBook)) : [],
    [selectedBook, eraSelection.eraId]
  );

  const places = useMemo(() => {
    return entities.filter(
      e =>
        (e.type === 'place' || e.type === 'nation') &&
        e.lat != null &&
        e.lng != null
    );
  }, [entities]);

  const travelPlaces = useMemo<TravelPlace[]>(() => [
    ...BIBLICAL_PLACE_CLUSTERS.map(place => ({
      id: place.id,
      name: placeLabel(place),
      lat: place.lat,
      lng: place.lng,
      kind: 'biblical' as const,
      detail: place.references.slice(0, 1)[0],
    })),
    ...places.map(place => ({
      id: place.id,
      name: place.name,
      lat: place.lat!,
      lng: place.lng!,
      kind: 'saved' as const,
      detail: place.description || undefined,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name)), [places, placeLabel]);

  const travelInsight = useMemo(
    () => travelStart && travelEnd && travelStart.id !== travelEnd.id ? buildTravelInsight(travelPlaces.find(p => p.id === travelStart.id) ?? travelStart, travelPlaces.find(p => p.id === travelEnd.id) ?? travelEnd) : null,
    [travelStart, travelEnd, travelPlaces],
  );
  const selectedTravelOption = useMemo(
    () => travelInsight?.options.find(option => option.id === selectedTravelOptionId) ?? null,
    [travelInsight, selectedTravelOptionId],
  );

  useEffect(() => {
    isAddingPlaceRef.current = isAddingPlace;
  }, [isAddingPlace]);

  useEffect(() => {
    isDrawingPathRef.current = isDrawingPath;
  }, [isDrawingPath]);

  useEffect(() => {
    drawingPointsRef.current = drawingPoints;
  }, [drawingPoints]);

  // Ensure all saved paths are initially active / visible
  useEffect(() => {
    if (savedPaths.length > 0) {
      setActivePathIds(prev => {
        const next = new Set(prev);
        savedPaths.forEach(p => {
          if (!prev.has(p.id)) next.add(p.id);
        });
        return next;
      });
    }
  }, [savedPaths]);

  // placeId -> Map<personId, relationshipId>
  const placePersonLinks = useMemo(() => {
    const links = new Map<string, Map<string, string>>();
    const placeIds = new Set(places.map(p => p.id));
    const personIds = new Set(people.map(p => p.id));

    for (const rel of relationships) {
      let placeId: string | null = null;
      let personId: string | null = null;

      if (placeIds.has(rel.from_entity_id) && personIds.has(rel.to_entity_id)) {
        placeId = rel.from_entity_id;
        personId = rel.to_entity_id;
      } else if (personIds.has(rel.from_entity_id) && placeIds.has(rel.to_entity_id)) {
        placeId = rel.to_entity_id;
        personId = rel.from_entity_id;
      }

      if (placeId && personId) {
        if (!links.has(placeId)) links.set(placeId, new Map());
        links.get(placeId)!.set(personId, rel.id);
      }
    }
    return links;
  }, [places, people, relationships]);

  // Ordered route for selected person
  const selectedPersonRoute = useMemo(() => {
    if (!selectedPersonId) return [];
    const placeIds = new Set(places.map(p => p.id));
    const personIds = new Set(people.map(p => p.id));

    return relationships
      .filter(r => {
        const isFrom = r.from_entity_id === selectedPersonId && placeIds.has(r.to_entity_id);
        const isTo = r.to_entity_id === selectedPersonId && placeIds.has(r.from_entity_id);
        if (isFrom && !personIds.has(r.to_entity_id)) return true;
        if (isTo && !personIds.has(r.from_entity_id)) return true;
        return false;
      })
      .map(r => ({
        rel: r,
        placeId: r.from_entity_id === selectedPersonId ? r.to_entity_id : r.from_entity_id,
        sortOrder: r.sort_order ?? 0,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(item => {
        const place = places.find(p => p.id === item.placeId);
        if (!place || place.lat == null || place.lng == null) return null;
        return {
          place,
          sortOrder: item.sortOrder,
          relId: item.rel.id,
          relType: item.rel.type,
          coords: [place.lat, place.lng] as [number, number],
        };
      })
      .filter(Boolean) as { place: Entity; sortOrder: number; relId: string; relType: string; coords: [number, number] }[];
  }, [selectedPersonId, relationships, places, people]);

  const filteredPlaces = useMemo(() => {
    if (!selectedPersonId) return places;
    return places.filter(p => {
      const linked = placePersonLinks.get(p.id);
      return linked && linked.has(selectedPersonId);
    });
  }, [places, placePersonLinks, selectedPersonId]);

  const selectedPerson = useMemo(
    () => people.find(p => p.id === selectedPersonId) || null,
    [people, selectedPersonId]
  );
  const routeColor = selectedPerson?.color || '#6366f1';

  const handleFlyTo = useCallback((lat: number, lng: number, zoom = 11, context?: SearchContext) => {
    const map = mapRef.current;
    if (!map) return;
    searchTimers.current.forEach(clearTimeout); searchTimers.current = [];
    searchPinRef.current?.remove(); searchPinRef.current = null;
    if (context?.placeId) {
      const place = BIBLICAL_PLACE_CLUSTERS.find(p => p.id === context.placeId);
      if (place) { setSelectedBiblicalPlace(place); setStudyFocusId(place.id); }
    }
    map.flyTo([lat, lng], zoom, { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.75 });
    if (context && (context.source !== 'biblical' || showBiblicalLayer)) {
      searchTimers.current.push(setTimeout(() => {
        if (mapRef.current !== map) return;
        const label = document.createElement('div'); label.className = 'era-study-pin'; label.textContent = context.name;
        const details = document.createElement('div'); details.textContent = `${context.name} — ${context.description || 'Personal study content'}`;
        searchPinRef.current = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: label, iconSize: [160, 36], iconAnchor: [80, 36] }), title: context.name, zIndexOffset: 1000 }).addTo(map).bindPopup(details);
      }, 300));
    }
  }, [showBiblicalLayer]);

  const handleMapPassage = async (selection: PassageSelection) => {
    const maxVerse = getVersesInChapter(selection.book, selection.chapter);
    if (!maxVerse) {
      setPassageError('That chapter is not available in the local Bible text.');
      return;
    }

    const operation = ++passageOperation.current;
    setPassageLoading(true);
    setPassageError(null);
    try {
      const passageText = await fetchKjvVerseRange(
        selection.book,
        selection.chapter,
        selection.verseStart,
        selection.verseEnd,
      );
      if (operation !== passageOperation.current) return;
      const matches = findPlacesInPassage(selection, passageText);
      setPassageStudy({ selection, matches });
      setSelectedBook(selection.book);
      setShowBiblicalLayer(true);
      if (matches.length && mapRef.current) mapRef.current.fitBounds(L.latLngBounds(matches.map(m => [m.place.lat, m.place.lng] as [number, number])), { ...getStudyPadding(mapRef.current, mapShellRef.current), maxZoom: 10, animate: false });
      if (!passageText) setPassageError('The passage text could not load; results use cataloged verse references only.');
    } catch {
      if (operation !== passageOperation.current) return;
      setPassageError('The passage text could not load. Please try again.');
    } finally {
      if (operation === passageOperation.current) setPassageLoading(false);
    }
  };

  const handleFocusPassagePlace = useCallback((match: PassagePlaceMatch) => {
    setSelectedBiblicalPlace(match.place);
    mapRef.current?.flyTo([match.place.lat, match.place.lng], 11, { duration: 0.75 });
  }, []);

  const handleViewIdentification = useCallback((identification: HistoricalPlaceIdentification) => {
    mapRef.current?.flyTo([identification.lat, identification.lng], identification.precision === 'site' ? 13 : 10, { duration: 0.8 });
  }, []);

  const handleSelectTravelStart = useCallback((place: TravelPlace) => {
    setTravelStart(place);
    setSelectedTravelOptionId('overland');
    if (travelEnd?.id === place.id) setTravelEnd(null);
  }, [travelEnd]);

  const handleSelectTravelEnd = useCallback((place: TravelPlace) => {
    setTravelEnd(place);
    setSelectedTravelOptionId('overland');
    if (travelStart?.id === place.id) setTravelStart(null);
  }, [travelStart]);

  const handleCreatePlace = async (name: string, description: string) => {
    if (!clickCoord) return;
    await createEntity({
      name,
      description,
      type: 'place',
      color: '#ef4444',
      metadata: {},
      lat: clickCoord.lat,
      lng: clickCoord.lng,
      timeline_period_id: null,
      atlas_x: 0,
      atlas_y: 0,
    });
    setIsAddingPlace(false);
  };

  const handleSavePlace = async (name: string, description: string) => {
    if (editingPlace) {
      await updateEntity(editingPlace.id, { name, description });
      setEditingPlace(null);
      return;
    }
    await handleCreatePlace(name, description);
  };

  const handleFocusSavedPlace = useCallback((place: Entity) => {
    if (place.lat == null || place.lng == null) return;
    setSelectedSavedPlaceId(place.id);
    mapRef.current?.flyTo([place.lat, place.lng], 12, { duration: 0.8 });
  }, []);

  const handleDeleteSavedPlace = async () => {
    if (!placePendingDeletion) return;
    try {
      await deleteEntity(placePendingDeletion.id);
      if (selectedSavedPlaceId === placePendingDeletion.id) setSelectedSavedPlaceId(null);
    } catch (err) {
      console.error('Failed to delete saved place:', err);
    } finally {
      setPlacePendingDeletion(null);
    }
  };

  // ─── Labeled Path Handlers ────────────────────────────────────────────────
  const handleSavePath = async (data: {
    name: string;
    description: string;
    color: string;
    style: PathLineStyle;
    points: MapPathPoint[];
    total_distance_km: number;
  }) => {
    if (editingPath) {
      await updatePath(editingPath.id, data);
      setEditingPath(null);
    } else {
      const created = await createPath(data);
      setActivePathIds(prev => new Set([...prev, created.id]));
      handleFocusPath(created);
    }
    setIsDrawingPath(false);
    setDrawingPoints([]);
  };

  const handleDeletePath = async () => {
    if (!pathPendingDeletion) return;
    try {
      await deletePath(pathPendingDeletion.id);
      if (focusedPath?.id === pathPendingDeletion.id) setFocusedPath(null);
      setActivePathIds(prev => {
        const next = new Set(prev);
        next.delete(pathPendingDeletion.id);
        return next;
      });
    } catch (err) {
      console.error('Failed to delete path:', err);
    } finally {
      setPathPendingDeletion(null);
    }
  };

  const handleFocusPath = useCallback((path: MapPath) => {
    const map = mapRef.current;
    if (!map || !path.points || path.points.length === 0) return;
    setFocusedPath(path);
    if (!activePathIds.has(path.id)) {
      setActivePathIds(prev => new Set([...prev, path.id]));
    }
    const coords = path.points.map(p => [p.lat, p.lng] as [number, number]);
    if (coords.length === 1) {
      map.flyTo(coords[0], 11, { duration: 0.9 });
    } else {
      map.fitBounds(L.latLngBounds(coords), { padding: [60, 60], maxZoom: 10, animate: true });
    }
  }, [activePathIds]);

  const handleTogglePathVisibility = useCallback((pathId: string) => {
    setActivePathIds(prev => {
      const next = new Set(prev);
      if (next.has(pathId)) {
        next.delete(pathId);
        if (focusedPath?.id === pathId) setFocusedPath(null);
      } else {
        next.add(pathId);
      }
      return next;
    });
  }, [focusedPath]);

  const handleStartDrawingPath = () => {
    if (isDrawingPath) {
      setIsDrawingPath(false);
      setDrawingPoints([]);
    } else {
      setIsDrawingPath(true);
      setIsAddingPlace(false);
      setDrawingPoints([]);
    }
  };

  const handleUndoDrawingPoint = () => {
    setDrawingPoints(prev => prev.slice(0, -1));
  };

  const handleFinishDrawingPath = () => {
    if (drawingPoints.length >= 2) {
      setShowCreatePathModal(true);
    }
  };

  const handleCancelDrawingPath = () => {
    setIsDrawingPath(false);
    setDrawingPoints([]);
  };

  const handleSaveTravelAsPath = () => {
    if (!travelInsight || !selectedTravelOption) return;
    const pathCoords = selectedTravelOption.path;
    const points: MapPathPoint[] = [];

    // Start point
    points.push({
      id: `pt-start-${Date.now()}`,
      name: travelInsight.start.name,
      lat: travelInsight.start.lat,
      lng: travelInsight.start.lng,
      place_id: travelInsight.start.id,
      kind: travelInsight.start.kind,
    });

    // Intermediate pass / waypoint if present
    if (pathCoords.length > 2) {
      for (let i = 1; i < pathCoords.length - 1; i++) {
        points.push({
          id: `pt-mid-${i}-${Date.now()}`,
          name: `Pass / Corridor ${i}`,
          lat: pathCoords[i][0],
          lng: pathCoords[i][1],
          kind: 'custom',
        });
      }
    }

    // End point
    points.push({
      id: `pt-end-${Date.now()}`,
      name: travelInsight.end.name,
      lat: travelInsight.end.lat,
      lng: travelInsight.end.lng,
      place_id: travelInsight.end.id,
      kind: travelInsight.end.kind,
    });

    setDrawingPoints(points);
    setShowCreatePathModal(true);
  };

  const handleLinkPerson = useCallback(
    async (placeId: string, personId: string, type: string) => {
      const placeIdSet = new Set(places.map(p => p.id));
      const existingCount = relationships.filter(r => {
        const isFrom = r.from_entity_id === personId && placeIdSet.has(r.to_entity_id);
        const isTo = r.to_entity_id === personId && placeIdSet.has(r.from_entity_id);
        return isFrom || isTo;
      }).length;

      await createRelationship({
        from_entity_id: personId,
        to_entity_id: placeId,
        type,
        description: '',
        sort_order: existingCount + 1,
      });
    },
    [createRelationship, relationships, places]
  );

  const handleUnlinkPerson = useCallback(
    async (relationshipId: string) => {
      await deleteRelationship(relationshipId);
    },
    [deleteRelationship]
  );

  // ─── Initialize map once ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [31.7683, 35.2137],
      zoom: 7,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);


    // Biblical overlay layer group
    const layerGroup = L.layerGroup().addTo(map);
    biblicalLayerGroupRef.current = layerGroup;

    // Historical territories stay below pins and paths and never intercept map gestures.
    const territoryPane = map.createPane('historical-territory');
    territoryPane.style.zIndex = '330';
    territoryPane.style.pointerEvents = 'none';
    territoryLayerGroupRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (isDrawingPathRef.current) {
        // Find nearby biblical or saved place within ~4km (0.04 deg) to snap name cleanly
        const nearbyBiblical = snapPlaces.current.find(
          p => Math.hypot(p.lat - lat, p.lng - lng) < 0.04
        );
        const name = nearbyBiblical?.name || `Waypoint ${drawingPointsRef.current.length + 1}`;
        const newPt: MapPathPoint = {
          id: `pt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name,
          lat: nearbyBiblical?.lat ?? lat,
          lng: nearbyBiblical?.lng ?? lng,
          place_id: nearbyBiblical?.id,
          kind: nearbyBiblical ? 'biblical' : 'custom',
        };
        setDrawingPoints(prev => [...prev, newPt]);
        return;
      }

      if (isAddingPlaceRef.current) {
        setClickCoord({ lat, lng });
        setShowCreateModal(true);
      }
    });

    mapRef.current = map;
    setReadyMap(map);

    return () => {
      map.remove();
      mapRef.current = null;
      biblicalLayerGroupRef.current = null;
      territoryLayerGroupRef.current = null;
    };
  }, []);

  // ─── Historical people & kingdom territory overlay ─────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const group = territoryLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!selectedTerritory || eraSelection.eraId) return;

    if ('sites' in selectedTerritory) {
      const boundsPoints: [number, number][] = [];
      selectedTerritory.sites.forEach(site => {
        const point: [number, number] = [site.lat, site.lng];
        boundsPoints.push(point);
        const marker = L.circleMarker(point, {
          pane: 'historical-territory',
          radius: 7,
          color: '#2e6f7e',
          weight: 2,
          opacity: 0.9,
          fillColor: '#dceff1',
          fillOpacity: 0.95,
          interactive: false,
        }).bindTooltip(site.name, { permanent: true, direction: 'top', offset: [0, -5], className: 'historical-site-label' });
        group.addLayer(marker);
      });

      const bounds = L.latLngBounds(boundsPoints);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          paddingTopLeft: [390, 64],
          paddingBottomRight: [64, 64],
          maxZoom: selectedTerritory.sites.length === 1 ? 11 : 8,
          animate: true,
        });
      }
      return;
    }

    if (!('geometry' in selectedTerritory)) return;

    const bands = selectedTerritory.geometry.coordinates;
    const boundsPoints: [number, number][] = [];

    bands.forEach((polygon, index) => {
      const intensity = (index + 1) / bands.length;
      const latLngPolygon = polygon.map(ring => ring.map(([lng, lat]) => {
        const point: [number, number] = [lat, lng];
        boundsPoints.push(point);
        return point;
      }));

      const contour = L.polygon(latLngPolygon as L.LatLngExpression[][], {
        pane: 'historical-territory',
        color: '#2e6f7e',
        weight: intensity > 0.65 ? 1.45 : 1,
        opacity: 0.28 + intensity * 0.42,
        dashArray: selectedTerritory.confidence === 'source-rough-boundary' || intensity < 0.45 ? '3 7' : undefined,
        fillColor: '#2e6f7e',
        fillOpacity: 0.012 + intensity * 0.02,
        interactive: false,
      });
      group.addLayer(contour);
    });

    const bounds = L.latLngBounds(boundsPoints);
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        paddingTopLeft: [390, 44],
        paddingBottomRight: [44, 44],
        maxZoom: 9,
        animate: true,
      });
    }
  }, [selectedTerritory, eraSelection.eraId]);

  // ─── Biblical places overlay ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const group = biblicalLayerGroupRef.current;
    if (!map || !group) return;

    const renderOverlay = () => {
      group.clearLayers();
      if (!showBiblicalLayer) { setRepresentedCount(0); return; }

      const zoom = map.getZoom();
      const bounds = map.getBounds().pad(0.15);

      visibleAreas.forEach(area => {
        const polygon = L.polygon(area.boundary, {
          color: area.color,
          weight: 2,
          opacity: 0.45,
          fillColor: area.color,
          fillOpacity: 0.04,
          interactive: false,
        });
        polygon.bindTooltip(area.name, {
          permanent: false,
          direction: 'center',
          className: 'biblical-area-label',
          opacity: 0.9,
        });
        group.addLayer(polygon);
      });

      const placesToRender = eraView.records.filter(place => eraView.overrideReasons.has(place.id) || bounds.contains([place.lat, place.lng]));
      setRepresentedCount(placesToRender.filter(place => bounds.contains([place.lat, place.lng])).length);
      const mapClusters = clusterHistoricalPlaces(
        placesToRender,
        zoom,
        (lat, lng) => map.project([lat, lng], zoom),
      );

      mapClusters.forEach(mapCluster => {
        if (mapCluster.places.length > 1) {
          const count = mapCluster.places.length;
          const diameter = count >= 100 ? 48 : count >= 20 ? 42 : count >= 5 ? 36 : 32;
          const clusterMarker = L.marker([mapCluster.lat, mapCluster.lng], {
            icon: L.divIcon({
              className: 'historical-place-cluster-icon',
              html: `<div class="historical-place-cluster" style="width:${diameter}px;height:${diameter}px"><strong>${count}</strong><span>places</span></div>`,
              iconSize: [diameter, diameter],
              iconAnchor: [diameter / 2, diameter / 2],
            }),
            keyboard: true,
            title: `${count} historical places`,
          });
          clusterMarker.bindTooltip(`${count} historical places · zoom to explore`, { direction: 'top', className: 'biblical-place-tooltip' });
          clusterMarker.on('click', event => {
            L.DomEvent.stopPropagation(event);
            if (map.getZoom() < 13) {
              map.flyTo([mapCluster.lat, mapCluster.lng], Math.min(13, map.getZoom() + 2), { duration: 0.65 });
              return;
            }

            const popupContent = document.createElement('div');
            popupContent.className = 'historical-cluster-list';
            const heading = document.createElement('strong');
            heading.textContent = `${count} records at this site`;
            popupContent.appendChild(heading);
            mapCluster.places.slice(0, 30).forEach(place => {
              const button = document.createElement('button');
              button.type = 'button';
              button.textContent = placeLabel(place);
              button.onclick = () => {
                setSelectedBiblicalPlace(place);
                map.closePopup();
              };
              popupContent.appendChild(button);
            });
            if (count > 30) {
              const remainder = document.createElement('small');
              remainder.textContent = `+${count - 30} more records — refine with the type filter`;
              popupContent.appendChild(remainder);
            }
            L.popup({ maxWidth: 300, maxHeight: 360 })
              .setLatLng([mapCluster.lat, mapCluster.lng])
              .setContent(popupContent)
              .openOn(map);
          });
          group.addLayer(clusterMarker);
          return;
        }

        const place = mapCluster.places[0];
        const passageMatch = passageStudy?.matches.find(match => match.place.id === place.id);
        const isPassagePlace = Boolean(passageMatch);
        const isTravelEndpoint = travelStart?.id === place.id || travelEnd?.id === place.id;
        const isSelected = selectedBiblicalPlace?.id === place.id;
        const circleColor = isPassagePlace ? '#4f46e5' : isTravelEndpoint ? '#0f766e' : place.importance === 1 ? '#92400e' : place.importance === 2 ? '#b45309' : '#d97706';
        const radius = isSelected ? 9 : isPassagePlace || isTravelEndpoint ? 8 : place.importance === 1 ? 7 : place.importance === 2 ? 6 : 5;
        const displayName = placeLabel(place);

        const circle = L.circleMarker([place.lat, place.lng], {
          radius,
          color: isSelected ? '#2e6f7e' : '#fff',
          weight: isSelected ? 4 : 1.5,
          fillColor: circleColor,
          fillOpacity: 0.96,
          interactive: true,
          bubblingMouseEvents: true,
        });
        circle.bindTooltip(escapeHtml(displayName), {
          direction: 'top',
          offset: [0, -radius - 2],
          className: 'biblical-place-tooltip',
          opacity: 0.97,
        });
        circle.on('click', event => {
          L.DomEvent.stopPropagation(event);
          if (isDrawingPathRef.current) {
            const newPoint: MapPathPoint = {
              id: `pt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              name: displayName,
              lat: place.lat,
              lng: place.lng,
              place_id: place.id,
              kind: 'biblical',
            };
            setDrawingPoints(current => [...current, newPoint]);
            return;
          }
          setSelectedBiblicalPlace(BIBLICAL_PLACE_CLUSTERS.find(p => p.id === place.id) ?? place);
        });
        group.addLayer(circle);
        const element = circle.getElement();
        if (element) {
          element.setAttribute('tabindex', '0'); element.setAttribute('role', 'button'); element.setAttribute('aria-label', displayName);
          element.addEventListener('keydown', event => { const key = (event as KeyboardEvent).key; if (key === 'Enter' || key === ' ') { event.preventDefault(); circle.fire('click'); } });
        }
      });
    };

    renderOverlay();
    let frame: number | null = null;
    const scheduleRender = () => {
      if (frame === null) frame = requestAnimationFrame(() => { frame = null; renderOverlay(); });
    };
    map.on('moveend zoomend', scheduleRender);
    return () => {
      map.off('moveend zoomend', scheduleRender);
      if (frame !== null) cancelAnimationFrame(frame);
      group.clearLayers();
    };
  }, [selectedBook, showBiblicalLayer, visibleAreas, eraView.records, placeLabel, passageStudy, travelStart, travelEnd, selectedBiblicalPlace]);

  // ─── Click anywhere on map dismisses search pin ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => {
      searchTimers.current.forEach(clearTimeout); searchTimers.current = [];
      setStudyFocusId(null);
      if (searchPinRef.current) {
        searchPinRef.current.remove();
        searchPinRef.current = null;
      }
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, []);

  // ─── Sync saved places markers & person routes with data ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    routeLinesRef.current.forEach(l => map.removeLayer(l));
    routeLinesRef.current = [];

    filteredPlaces.forEach(place => {
      const routeIndex = selectedPersonId
        ? selectedPersonRoute.findIndex(r => r.place.id === place.id)
        : -1;

      const icon = routeIndex >= 0 ? createNumberedIcon(routeIndex + 1, routeColor) : DefaultIcon;

      const marker = L.marker([place.lat!, place.lng!], { icon }).addTo(map);
      marker.on('click', e => {
        if (isDrawingPathRef.current) {
          L.DomEvent.stopPropagation(e);
          const newPt: MapPathPoint = {
            id: `pt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            name: place.name,
            lat: place.lat!,
            lng: place.lng!,
            place_id: place.id,
            kind: 'saved',
          };
          setDrawingPoints(prev => [...prev, newPt]);
          return;
        }
        setSelectedSavedPlaceId(place.id);
      });

      const linkedMap = placePersonLinks.get(place.id) || new Map<string, string>();
      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '220px';
      popupEl.innerHTML = buildPopupHtml(place, people, linkedMap, PLACE_REL_TYPES);

      marker.bindPopup(popupEl);
      marker.on('popupopen', () => {
        // Edit place button
        const editBtn = popupEl.querySelector('[data-action="edit-place"]') as HTMLElement;
        if (editBtn) {
          editBtn.onclick = () => {
            marker.closePopup();
            setEditingPlace(place);
          };
        }

        // Delete place button
        const deleteBtn = popupEl.querySelector('[data-action="delete-place"]') as HTMLElement;
        if (deleteBtn) {
          deleteBtn.onclick = () => {
            marker.closePopup();
            setPlacePendingDeletion(place);
          };
        }

        // "Link Person" toggle
        const addBtn = popupEl.querySelector('[data-action="show-add"]') as HTMLElement;
        const addForm = popupEl.querySelector('[data-section="add-form"]') as HTMLElement;
        if (addBtn && addForm) {
          addBtn.onclick = () => {
            addBtn.style.display = 'none';
            addForm.style.display = 'block';
          };
        }

        // Cancel link
        const cancelBtn = popupEl.querySelector('[data-action="cancel-add"]') as HTMLElement;
        if (cancelBtn && addBtn && addForm) {
          cancelBtn.onclick = () => {
            addForm.style.display = 'none';
            addBtn.style.display = 'block';
          };
        }

        // Link person
        const linkBtn = popupEl.querySelector('[data-action="link"]') as HTMLElement;
        const personSelect = popupEl.querySelector('[data-input="person"]') as HTMLSelectElement;
        const typeSelect = popupEl.querySelector('[data-input="type"]') as HTMLSelectElement;
        if (linkBtn && personSelect && typeSelect) {
          linkBtn.onclick = () => {
            const pid = personSelect.value;
            const typ = typeSelect.value;
            if (pid) {
              handleLinkPerson(place.id, pid, typ);
              marker.closePopup();
            }
          };
        }

        // Unlink buttons
        popupEl.querySelectorAll('[data-action="unlink"]').forEach(btn => {
          (btn as HTMLElement).onclick = () => {
            const relId = (btn as HTMLElement).dataset.relid;
            if (relId) {
              handleUnlinkPerson(relId);
              marker.closePopup();
            }
          };
        });
      });

      markersRef.current.push(marker);
    });

    // Draw route lines + arrows for selected person
    if (selectedPersonId && selectedPersonRoute.length >= 2) {
      for (let i = 0; i < selectedPersonRoute.length - 1; i++) {
        const from = selectedPersonRoute[i].coords;
        const to = selectedPersonRoute[i + 1].coords;

        const line = L.polyline([from, to], {
          color: routeColor,
          weight: 3,
          opacity: 0.8,
          dashArray: '8 6',
        }).addTo(map);
        routeLinesRef.current.push(line);

        const midLat = (from[0] + to[0]) / 2;
        const midLng = (from[1] + to[1]) / 2;
        const angle = Math.atan2(to[1] - from[1], to[0] - from[0]) * (180 / Math.PI);

        const arrowIcon = L.divIcon({
          className: '',
          html: `<div style="transform:rotate(${-angle + 90}deg);color:${routeColor};font-size:18px;font-weight:900;text-shadow:0 0 3px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">&#9660;</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const arrowMarker = L.marker([midLat, midLng], { icon: arrowIcon, interactive: false }).addTo(map);
        routeLinesRef.current.push(arrowMarker);
      }
    }
  }, [filteredPlaces, selectedPersonId, selectedPersonRoute, routeColor, people, placePersonLinks, handleLinkPerson, handleUnlinkPerson]);

  // ─── Render Saved Labeled Paths ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    savedPathLayersRef.current.forEach(layer => map.removeLayer(layer));
    savedPathLayersRef.current = [];

    const activePaths = savedPaths.filter(p => activePathIds.has(p.id));

    activePaths.forEach(path => {
      if (!path.points || path.points.length < 2) return;
      const latLngs = path.points.map(pt => [pt.lat, pt.lng] as [number, number]);

      const polyline = L.polyline(latLngs, {
        color: path.color || '#4f46e5',
        weight: focusedPath?.id === path.id ? 5 : 4,
        opacity: 0.9,
        dashArray: path.style === 'dashed' ? '10 6' : path.style === 'dotted' ? '3 6' : undefined,
      }).addTo(map);

      // Midpoint direction arrows along segments
      for (let i = 0; i < latLngs.length - 1; i++) {
        const from = latLngs[i];
        const to = latLngs[i + 1];
        const midLat = (from[0] + to[0]) / 2;
        const midLng = (from[1] + to[1]) / 2;
        const angle = Math.atan2(to[1] - from[1], to[0] - from[0]) * (180 / Math.PI);

        const arrowIcon = L.divIcon({
          className: '',
          html: `<div style="transform:rotate(${-angle + 90}deg);color:${path.color || '#4f46e5'};font-size:16px;font-weight:900;text-shadow:0 0 3px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">&#9660;</div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        const arrowMarker = L.marker([midLat, midLng], { icon: arrowIcon, interactive: false }).addTo(map);
        savedPathLayersRef.current.push(arrowMarker);
      }

      // Point milestone badges
      path.points.forEach((pt, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === path.points.length - 1;
        const num = idx + 1;
        const pointIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:${isStart || isEnd ? '26px' : '20px'};
            height:${isStart || isEnd ? '26px' : '20px'};
            border-radius:50%;
            background:${path.color || '#4f46e5'};
            color:white;
            font-weight:700;
            font-size:${isStart || isEnd ? '11px' : '9px'};
            display:flex;align-items:center;justify-content:center;
            border:2px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,0.35);
          ">${num}</div>`,
          iconSize: [isStart || isEnd ? 26 : 20, isStart || isEnd ? 26 : 20],
          iconAnchor: [isStart || isEnd ? 13 : 10, isStart || isEnd ? 13 : 10],
        });

        const marker = L.marker([pt.lat, pt.lng], { icon: pointIcon }).addTo(map);
        marker.bindTooltip(`<b>${num}. ${pt.name}</b><br/><span style="color:#6b7280;font-size:10px">${path.name}</span>`, {
          direction: 'top',
          offset: [0, -12],
        });
        savedPathLayersRef.current.push(marker);
      });

      // Rich interactive popup on polyline click
      const stopsList = path.points.map((p, i) => `${i + 1}. ${p.name}`).join(' → ');
      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '220px';
      popupEl.style.maxWidth = '280px';
      popupEl.style.fontFamily = 'system-ui, sans-serif';
      popupEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${path.color};display:inline-block;flex-shrink:0;"></span>
          <strong style="font-size:14px;color:#111827;">${path.name}</strong>
        </div>
        ${path.description ? `<p style="font-size:12px;color:#6b7280;margin:0 0 6px;line-height:1.4;">${path.description}</p>` : ''}
        <div style="font-size:11px;color:#4338ca;font-weight:600;margin-bottom:4px;">
          📏 ${Math.round(path.total_distance_km || 0)} km · ${path.points.length} stops
        </div>
        <div style="font-size:11px;color:#4b5563;background:#f3f4f6;padding:4px 6px;border-radius:6px;margin-bottom:6px;line-height:1.35;">
          ${stopsList}
        </div>
        <div style="display:flex;gap:4px;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px;">
          <button data-action="focus-path" style="flex:1;padding:4px 6px;font-size:11px;border-radius:4px;border:1px solid #d1d5db;background:white;cursor:pointer;font-weight:600;">Focus</button>
          <button data-action="edit-path" style="flex:1;padding:4px 6px;font-size:11px;border-radius:4px;border:1px solid #d1d5db;background:white;cursor:pointer;">Edit</button>
          <button data-action="delete-path" style="padding:4px 6px;font-size:11px;border-radius:4px;border:none;background:#fee2e2;color:#dc2626;cursor:pointer;">Delete</button>
        </div>
      `;

      polyline.bindPopup(popupEl);
      polyline.on('popupopen', () => {
        const focusBtn = popupEl.querySelector('[data-action="focus-path"]') as HTMLElement;
        if (focusBtn) {
          focusBtn.onclick = () => {
            handleFocusPath(path);
            map.closePopup();
          };
        }
        const editBtn = popupEl.querySelector('[data-action="edit-path"]') as HTMLElement;
        if (editBtn) {
          editBtn.onclick = () => {
            setEditingPath(path);
            map.closePopup();
          };
        }
        const deleteBtn = popupEl.querySelector('[data-action="delete-path"]') as HTMLElement;
        if (deleteBtn) {
          deleteBtn.onclick = () => {
            setPathPendingDeletion(path);
            map.closePopup();
          };
        }
      });

      savedPathLayersRef.current.push(polyline);
    });

    return () => {
      savedPathLayersRef.current.forEach(layer => map.removeLayer(layer));
      savedPathLayersRef.current = [];
    };
  }, [savedPaths, activePathIds, focusedPath, handleFocusPath]);

  // ─── Render Active Drawing Path on Map ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    drawingLayersRef.current.forEach(layer => map.removeLayer(layer));
    drawingLayersRef.current = [];

    if (drawingPoints.length > 0) {
      if (drawingPoints.length >= 2) {
        const latLngs = drawingPoints.map(p => [p.lat, p.lng] as [number, number]);
        const line = L.polyline(latLngs, {
          color: '#6366f1',
          weight: 4,
          dashArray: '6 6',
          opacity: 0.9,
        }).addTo(map);
        drawingLayersRef.current.push(line);
      }

      drawingPoints.forEach((pt, idx) => {
        const markerIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:24px;height:24px;border-radius:50%;
            background:#4f46e5;color:white;
            font-weight:700;font-size:11px;
            display:flex;align-items:center;justify-content:center;
            border:2px solid white;
            box-shadow:0 2px 8px rgba(79,70,229,0.5);
          ">${idx + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([pt.lat, pt.lng], { icon: markerIcon, interactive: false }).addTo(map);
        drawingLayersRef.current.push(marker);
      });
    }

    return () => {
      drawingLayersRef.current.forEach(layer => map.removeLayer(layer));
      drawingLayersRef.current = [];
    };
  }, [drawingPoints]);

  // ─── Render Travel Insight Route Overlay ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    travelInsightLayersRef.current.forEach(layer => map.removeLayer(layer));
    travelInsightLayersRef.current = [];
    if (!travelInsight || !selectedTravelOption) return;

    const line = L.polyline(selectedTravelOption.path, {
      color: '#0f766e',
      weight: selectedTravelOption.id === 'direct' ? 3 : 4,
      opacity: 0.9,
      dashArray: selectedTravelOption.id === 'direct' ? '4 8' : selectedTravelOption.id === 'overland' ? '10 6' : undefined,
    }).addTo(map);
    travelInsightLayersRef.current.push(line);

    const endpointIcon = (label: 'A' | 'B') => L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#0f766e;color:#fff;border:3px solid #fff;font:700 12px system-ui,sans-serif;box-shadow:0 2px 8px rgba(15,118,110,.45)">${label}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const startMarker = L.marker([travelInsight.start.lat, travelInsight.start.lng], { icon: endpointIcon('A'), interactive: false }).addTo(map);
    const endMarker = L.marker([travelInsight.end.lat, travelInsight.end.lng], { icon: endpointIcon('B'), interactive: false }).addTo(map);
    travelInsightLayersRef.current.push(startMarker, endMarker);

    return () => {
      travelInsightLayersRef.current.forEach(layer => map.removeLayer(layer));
      travelInsightLayersRef.current = [];
    };
  }, [travelInsight, selectedTravelOption]);

  return (
    <div ref={mapShellRef} data-sidebar-collapsed={sidebarCollapsed} className="era-map-shell isolate relative h-full w-full overflow-hidden">
      {/* Map fills 100% of viewport */}
      <div
        ref={mapContainerRef}
        className={`absolute inset-0 ${isAddingPlace || isDrawingPath ? 'cursor-crosshair' : ''}`}
      />

      {/* Floating Path Drawing Mode Toolbar */}
      {isDrawingPath && (
        <PathDrawingToolbar
          pointCount={drawingPoints.length}
          totalDistanceKm={calculatePointsDistance(drawingPoints)}
          onUndo={handleUndoDrawingPoint}
          onFinish={handleFinishDrawingPath}
          onCancel={handleCancelDrawingPath}
        />
      )}

      <div className="era-desktop-timeline"><HistoricalEraControl selection={eraSelection} onPreview={historical.preview} onCommit={historical.commit} onFit={fitEra} /></div>
      {eraView.era && !representedCount && showBiblicalLayer && sidebarCollapsed && <button className="era-mobile-fit" onClick={fitEra}>No places here · Fit era</button>}
      {historical.status.startsWith('Unknown era') && <p className="absolute right-3 top-3 z-[1190] max-w-72 rounded-lg bg-white p-3 text-xs text-slate-700 shadow">{historical.status}</p>}
      <p className="sr-only" role="status" aria-live="polite">{historical.status}</p>
      {/* Sidebar overlays from the left */}
      <MapSidebar
        eraLabel={eraView.era?.label ?? 'All eras'}
        onCollapsedChange={setSidebarCollapsed}
        detailPlaceId={selectedBiblicalPlace?.id ?? null}
        onReturnToAllEras={() => historical.commit({ eraId: null, snapshotId: null })}
        eraControl={<HistoricalEraControl selection={eraSelection} onPreview={historical.preview} onCommit={historical.commit} onFit={fitEra} />}
        eraPanel={<>
          <HistoricalEraPanel era={eraView.era} selection={eraSelection} layers={historical.layers} onLayers={historical.setLayers} showPlaces={showBiblicalLayer} onPlaces={() => setShowBiblicalLayer(v => !v)} routeId={historicalRouteId} routes={eraView.availableRoutes} onRoute={setHistoricalRouteId} book={selectedBook} onSnapshot={snapshotId => historical.commit({ ...eraSelection, snapshotId })} onFocus={id => { const p = BIBLICAL_PLACE_CLUSTERS.find(p => p.id === id); if (p) handleFlyTo(p.lat, p.lng, 10, { name: placeLabel(p), source: 'biblical', description: 'Historical journey study stop', placeId: id }); }} />
          <div className="mt-3 space-y-2 text-xs leading-5"><label className="block">Backdrop<select aria-label="Map backdrop" value={basemap} onChange={e => setBasemap(e.target.value as 'physical' | 'modern')} className="ml-2 rounded border bg-transparent p-2"><option value="physical">Physical geography</option><option value="modern">Modern map</option></select></label><p>{basemap === 'physical' ? 'Natural Earth 5.1.2: schematic modern coastlines, not reconstructed ancient geography. Close-up detail is available in Modern map.' : 'Modern geographic reference. Modern labels and borders remain visible; external tiles are not available reliably offline.'}</p></div>
          <p className="mt-3 text-xs">{eraView.counts.eligible} eligible catalog records · {eraView.counts.filtered} match filters · {representedCount} represented in this view · {eraView.counts.overrides} study overrides.</p>
          {(!representedCount || !eraView.counts.filtered) && <div className="mt-3 space-y-2 text-xs"><p>{!showBiblicalLayer ? 'Historical places are hidden.' : 'No ordinary places match the filters or current viewport.'} Book: {selectedBook ?? 'all'}; type: {placeKind}; coverage: {placeCoverage}. Passage and journey overrides remain separate.</p><div className="flex flex-wrap gap-2"><button onClick={() => { setSelectedBook(null); setPlaceKind('all'); setPlaceCoverage('all'); }}>Clear book/type/coverage</button><button onClick={fitEra}>Fit era</button><button onClick={() => historical.commit({ eraId: null, snapshotId: null })}>All eras</button></div></div>}
          {historical.status && <p className="mt-2 text-xs">{historical.status}</p>}
          {eraSelection.eraId && selectedTerritory && <p className="mt-2 text-xs">This general territory has no reviewed date for this era. Its evidence remains available; its outline is hidden. <button className="underline" onClick={() => historical.commit({ eraId: null, snapshotId: null })}>Return to All eras</button></p>}
        </>}
        searchSlot={<MapSearchBar places={places} biblicalPlaces={eraView.searchPlaces} eraSelection={eraSelection} eraAreas={eraView.areas} onSelectEraArea={area => { historical.setLayers(current => ({ ...current, areas: true })); historical.announce(`${area.name}: ${area.uncertainty}`); fitEra(); }} selectedBook={selectedBook} onFlyTo={handleFlyTo} onSelectTerritory={setSelectedTerritory} />}
        territorySelection={selectedTerritory}
        onClearTerritory={() => setSelectedTerritory(null)}
        selectedPersonId={selectedPersonId}
        onSelectPerson={setSelectedPersonId}
        people={people}
        savedPlaces={places}
        selectedSavedPlaceId={selectedSavedPlaceId}
        onFocusSavedPlace={handleFocusSavedPlace}
        onEditSavedPlace={setEditingPlace}
        onDeleteSavedPlace={setPlacePendingDeletion}
        onStartAddingPlace={() => {
          setIsAddingPlace(value => !value);
          if (isDrawingPath) setIsDrawingPath(false);
        }}
        isAddingPlace={isAddingPlace}
        savedPaths={savedPaths}
        activePathIds={activePathIds}
        onTogglePathVisibility={handleTogglePathVisibility}
        onFocusPath={handleFocusPath}
        onEditPath={setEditingPath}
        onDeletePath={setPathPendingDeletion}
        onStartDrawingPath={handleStartDrawingPath}
        isDrawingPath={isDrawingPath}
        onOpenCreatePathModal={() => {
          setDrawingPoints([]);
          setShowCreatePathModal(true);
        }}
        biblicalPlaceCount={representedCount}
        totalBiblicalPlaceCount={BIBLICAL_PLACE_COUNT}
        selectedBook={selectedBook}
        onSelectBook={book => {
          passageOperation.current++; setPassageLoading(false);
          setSelectedBook(book);
          if (passageStudy && passageStudy.selection.book !== book) {
            setPassageStudy(null);
            setPassageError(null);
          }
        }}
        showBiblicalPlaces={showBiblicalLayer}
        onToggleBiblicalPlaces={() => setShowBiblicalLayer(value => !value)}
        placeKind={placeKind}
        onSelectPlaceKind={setPlaceKind}
        placeCoverage={placeCoverage}
        onSelectPlaceCoverage={setPlaceCoverage}
        passageStudy={passageStudy ? { ...passageStudy, matches: passageStudy.matches.map(m => ({ ...m, place: labelPlace(m.place, eraSelection, selectedBook) })) } : null}
        eraSelection={eraSelection}
        passageLoading={passageLoading}
        passageError={passageError}
        onMapPassage={handleMapPassage}
        onClearPassage={() => {
          passageOperation.current++; setPassageLoading(false);
          setPassageStudy(null);
          setPassageError(null);
        }}
        onFocusPassagePlace={handleFocusPassagePlace}
        travelPlaces={travelPlaces}
        travelStart={travelInsight?.start ?? travelStart}
        travelEnd={travelInsight?.end ?? travelEnd}
        travelInsight={travelInsight}
        selectedTravelOptionId={selectedTravelOptionId}
        onSelectTravelStart={handleSelectTravelStart}
        onSelectTravelEnd={handleSelectTravelEnd}
        onClearTravelStart={() => setTravelStart(null)}
        onClearTravelEnd={() => setTravelEnd(null)}
        onSelectTravelOption={setSelectedTravelOptionId}
        onClearTravelInsight={() => {
          setTravelStart(null);
          setTravelEnd(null);
          setSelectedTravelOptionId('overland');
        }}
        onSaveTravelAsPath={handleSaveTravelAsPath}
        routeStops={selectedPersonRoute.map(r => ({
          name: r.place.name,
          type: r.relType,
          order: r.sortOrder,
        }))}
      />

      {selectedBiblicalPlace && (
        <HistoricalPlaceDetails
          place={selectedBiblicalPlace}
          displayName={placeLabel(selectedBiblicalPlace)}
          eraSelection={eraSelection}
          isRepresented={showBiblicalLayer && eraView.records.some(p => p.id === selectedBiblicalPlace.id)}
          onViewRelated={id => { const p = BIBLICAL_PLACE_CLUSTERS.find(p => p.id === id); if (p) handleFlyTo(p.lat, p.lng, 11, { name: placeLabel(p), source: 'biblical', description: 'Related ancient identity', placeId: id }); }}
          onShowOnMap={() => { setShowBiblicalLayer(true); handleFlyTo(selectedBiblicalPlace.lat, selectedBiblicalPlace.lng, 11, { name: placeLabel(selectedBiblicalPlace), source: 'biblical', description: getEraAnnotation(selectedBiblicalPlace.id, eraSelection)?.reason ?? 'Not classified for this era', placeId: selectedBiblicalPlace.id }); }}
          selectedBook={selectedBook}
          onClose={() => setSelectedBiblicalPlace(null)}
          onViewIdentification={handleViewIdentification}
        />
      )}

      {/* Floating active-study badge */}
      {(passageStudy || travelInsight || focusedPath) && (
        <div className="absolute bottom-16 left-1/2 z-[1190] w-[calc(100%-2rem)] -translate-x-1/2 sm:bottom-36 sm:z-[1190] sm:w-auto">
          <div className="flex max-w-full items-center gap-3 overflow-x-auto rounded-full border border-white/50 bg-white/90 px-4 py-2 shadow-lg shadow-black/10 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90">
            {passageStudy && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-300" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{passageStudy.selection.book} {passageStudy.selection.chapter}</span>
                <span className="text-[10px] text-slate-500">· {passageStudy.matches.length} places</span>
                <button onClick={() => { passageOperation.current++; setPassageLoading(false); setPassageStudy(null); setPassageError(null); }} className="ml-1 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Clear passage">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            {passageStudy && travelInsight && <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />}
            {travelInsight && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-700 dark:bg-slate-300" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{travelInsight.start.name} → {travelInsight.end.name}</span>
                <span className="text-[10px] text-slate-500">· Study estimate · {Math.round(travelInsight.directDistanceKm)} km</span>
                <button onClick={() => { setTravelStart(null); setTravelEnd(null); setSelectedTravelOptionId('overland'); }} className="ml-1 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Clear travel">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            {focusedPath && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: focusedPath.color }} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{focusedPath.name}</span>
                <span className="text-[10px] text-slate-500">· {Math.round(focusedPath.total_distance_km || 0)} km</span>
                <button onClick={() => setFocusedPath(null)} className="ml-1 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Clear path focus">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Place Modal */}
      <CreatePlaceModal
        open={showCreateModal || Boolean(editingPlace)}
        onClose={() => {
          setShowCreateModal(false);
          setClickCoord(null);
          setEditingPlace(null);
          setIsAddingPlace(false);
        }}
        onSubmit={handleSavePlace}
        coord={editingPlace ? { lat: editingPlace.lat!, lng: editingPlace.lng! } : clickCoord}
        place={editingPlace}
      />

      {/* Create / Edit Marked Path Modal */}
      <CreatePathModal
        open={showCreatePathModal || Boolean(editingPath)}
        onClose={() => {
          setShowCreatePathModal(false);
          setEditingPath(null);
          if (isDrawingPath) {
            setIsDrawingPath(false);
            setDrawingPoints([]);
          }
        }}
        onSubmit={handleSavePath}
        initialPath={editingPath}
        initialPoints={drawingPoints}
        availablePlaces={travelPlaces}
      />

      {/* Confirm Dialog for Saved Place Deletion */}
      <ConfirmDialog
        open={Boolean(placePendingDeletion)}
        onClose={() => setPlacePendingDeletion(null)}
        onConfirm={() => { void handleDeleteSavedPlace(); }}
        title="Remove saved place?"
        message={`Remove ${placePendingDeletion?.name ?? 'this place'} from your study map? This cannot be undone.`}
        confirmText="Remove place"
      />

      {/* Confirm Dialog for Path Deletion */}
      <ConfirmDialog
        open={Boolean(pathPendingDeletion)}
        onClose={() => setPathPendingDeletion(null)}
        onConfirm={() => { void handleDeletePath(); }}
        title="Delete marked path?"
        message={`Remove ${pathPendingDeletion?.name ?? 'this path'} from your study map? This cannot be undone.`}
        confirmText="Delete path"
      />
    </div>
  );
}

// ─── Helper: build popup HTML for saved places ──────────────────────────────
function buildPopupHtml(
  place: Entity,
  people: Entity[],
  linkedMap: Map<string, string>,
  relTypes: string[]
) {
  const linkedHtml = Array.from(linkedMap.entries())
    .map(([personId, relId]) => {
      const person = people.find(p => p.id === personId);
      if (!person) return '';
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0">
        <span style="font-size:12px;color:#1f2937;display:flex;align-items:center;gap:4px">
          <span style="width:8px;height:8px;border-radius:50%;background:${person.color};display:inline-block;flex-shrink:0"></span>
          ${person.name}
        </span>
        <button data-action="unlink" data-relid="${relId}" style="font-size:11px;color:#ef4444;background:none;border:none;cursor:pointer;padding:0 2px">Remove</button>
      </div>`;
    })
    .join('');

  const linkedPersonIds = new Set(linkedMap.keys());
  const availablePeople = people.filter(p => p.type === 'person' && !linkedPersonIds.has(p.id));

  const personOptions = availablePeople.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  const typeOptions = relTypes.map(t => `<option value="${t}">${t.replace(/-/g, ' ')}</option>`).join('');

  return `
    <div style="font-family:system-ui,sans-serif;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px;">
        <h3 style="font-weight:700;font-size:15px;margin:0;color:#111827;">${place.name}</h3>
        <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
          <button data-action="edit-place" style="font-size:11px;font-weight:600;color:#4f46e5;background:#eef2ff;border:1px solid #c7d2fe;border-radius:4px;padding:2px 5px;cursor:pointer;" title="Edit place">✎ Edit</button>
          <button data-action="delete-place" style="font-size:11px;font-weight:600;color:#ef4444;background:#fef2f2;border:1px solid #fecaca;border-radius:4px;padding:2px 5px;cursor:pointer;" title="Delete place">✕ Delete</button>
        </div>
      </div>
      ${place.description ? `<p style="font-size:12px;color:#6b7280;margin:0 0 8px;line-height:1.4;">${place.description}</p>` : ''}
      ${
        linkedHtml
          ? `<div style="border-top:1px solid #e5e7eb;padding-top:6px;margin-top:4px">
              <p style="font-size:11px;font-weight:600;color:#374151;margin:0 0 4px">Linked People</p>
              ${linkedHtml}
            </div>`
          : ''
      }
      <button data-action="show-add" style="margin-top:8px;width:100%;padding:5px 0;border:1px dashed #d1d5db;border-radius:6px;background:none;cursor:pointer;font-size:12px;color:#6366f1;font-weight:500">+ Link Person</button>
      <div data-section="add-form" style="display:none;margin-top:8px;border-top:1px solid #e5e7eb;padding-top:8px">
        <select data-input="person" style="width:100%;font-size:12px;padding:4px 6px;border-radius:6px;border:1px solid #d1d5db;margin-bottom:4px">
          <option value="">Select a person...</option>
          ${personOptions}
        </select>
        <select data-input="type" style="width:100%;font-size:12px;padding:4px 6px;border-radius:6px;border:1px solid #d1d5db;margin-bottom:6px">
          ${typeOptions}
        </select>
        <div style="display:flex;gap:4px">
          <button data-action="cancel-add" style="flex:1;padding:4px 0;font-size:12px;border-radius:6px;border:1px solid #d1d5db;background:white;cursor:pointer">Cancel</button>
          <button data-action="link" style="flex:1;padding:4px 0;font-size:12px;border-radius:6px;border:none;background:#6366f1;color:white;cursor:pointer;font-weight:500">Link</button>
        </div>
      </div>
    </div>
  `;
}
