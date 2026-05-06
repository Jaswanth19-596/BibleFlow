import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useEntities } from '@/hooks/useEntities';
import { usePeopleAtlas } from '@/hooks/usePeopleAtlas';
import { Entity } from '@/lib/types';
import CreatePlaceModal from './CreatePlaceModal';
import MapSidebar from './MapSidebar';
import MapSearchBar, { SearchContext } from './MapSearchBar';
import { BIBLICAL_PLACES } from '@/data/biblicalPlaces';

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

export default function BibleMap() {
  const { entities, createEntity } = useEntities();
  const { relationships, createRelationship, deleteRelationship } = usePeopleAtlas();

  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clickCoord, setClickCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [showBiblicalLayer, setShowBiblicalLayer] = useState(true);
  const [mapStyle, setMapStyle] = useState<'modern' | 'terrain'>('modern');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Layer[]>([]);
  const biblicalLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const searchPinRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const people = useMemo(() => entities.filter(e => e.type === 'person'), [entities]);

  const places = useMemo(() => {
    return entities.filter(
      e =>
        (e.type === 'place' || e.type === 'nation') &&
        e.lat != null &&
        e.lng != null
    );
  }, [entities]);

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

    // Remove previous search pin
    if (searchPinRef.current) {
      searchPinRef.current.remove();
      searchPinRef.current = null;
    }

    map.flyTo([lat, lng], zoom, { duration: 1.5 });

    if (context) {
      // Wait for fly animation to settle, then drop pin
      setTimeout(() => {
        if (!mapRef.current) return;

        const isSource = context.source === 'biblical';
        const pinIcon = L.divIcon({
          className: '',
          html: `<div style="
            position:relative;
            display:flex;flex-direction:column;align-items:center;
          ">
            <div style="
              background:${isSource ? '#b45309' : '#4f46e5'};
              color:white;
              padding:5px 10px;
              border-radius:8px;
              font-size:13px;
              font-weight:700;
              white-space:nowrap;
              box-shadow:0 3px 10px rgba(0,0,0,0.35);
              border:2px solid white;
              max-width:200px;
              overflow:hidden;
              text-overflow:ellipsis;
            ">${context.name}</div>
            <div style="
              width:0;height:0;
              border-left:7px solid transparent;
              border-right:7px solid transparent;
              border-top:10px solid ${isSource ? '#b45309' : '#4f46e5'};
              margin-top:-1px;
            "></div>
            <div style="
              width:10px;height:10px;border-radius:50%;
              background:${isSource ? '#b45309' : '#4f46e5'};
              border:2px solid white;
              margin-top:-2px;
              box-shadow:0 2px 6px rgba(0,0,0,0.3);
            "></div>
          </div>`,
          iconSize: [200, 60],
          iconAnchor: [100, 58],
        });

        const popupContent = `
          <div style="min-width:180px;font-family:system-ui,sans-serif;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:18px;">${isSource ? '✝️' : '📍'}</span>
              <h3 style="font-weight:700;font-size:15px;margin:0;color:#111827;">${context.name}</h3>
            </div>
            ${context.description ? `<p style="font-size:12px;color:#6b7280;margin:0 0 6px;line-height:1.4;">${context.description}</p>` : ''}
            <div style="font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:6px;margin-top:4px;">
              ${isSource ? '📖 Biblical location' : '🌍 Modern location'}
            </div>
          </div>
        `;

        const pin = L.marker([lat, lng], { icon: pinIcon, zIndexOffset: 1000 })
          .addTo(mapRef.current)
          .bindPopup(popupContent, { offset: [0, -55], maxWidth: 240 });

        // Auto-open popup after brief delay
        setTimeout(() => pin.openPopup(), 400);
        searchPinRef.current = pin;
      }, 800);
    }
  }, []);

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
      zoomControl: true,
    });

    const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);
    tileLayerRef.current = tile;

    // Biblical overlay layer group
    const layerGroup = L.layerGroup().addTo(map);
    biblicalLayerGroupRef.current = layerGroup;

    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickCoord({ lat: e.latlng.lat, lng: e.latlng.lng });
      setShowCreateModal(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      biblicalLayerGroupRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // ─── Biblical places overlay ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const group = biblicalLayerGroupRef.current;
    if (!map || !group) return;

    const renderOverlay = () => {
      group.clearLayers();
      if (!showBiblicalLayer) return;

      const zoom = map.getZoom();
      const bounds = map.getBounds().pad(0.15); // slight padding so labels near edges show

      // Determine which tiers to show based on zoom
      const minImportance = zoom >= 10 ? 3 : zoom >= 7 ? 2 : 1;

      BIBLICAL_PLACES.forEach(place => {
        const imp = place.importance ?? 3;
        if (imp > minImportance) return;
        if (!bounds.contains([place.lat, place.lng])) return;

        const isPrimary = imp === 1;
        const isSecondary = imp === 2;

        const circleColor = isPrimary ? '#92400e' : isSecondary ? '#b45309' : '#d97706';
        const radius = isPrimary ? 5 : isSecondary ? 4 : 3;
        const fontWeight = isPrimary ? '700' : isSecondary ? '600' : '500';
        const fontSize = isPrimary ? '12px' : isSecondary ? '11px' : '10px';
        const textColor = isPrimary ? '#78350f' : '#92400e';

        const circle = L.circleMarker([place.lat, place.lng], {
          radius,
          color: 'white',
          weight: 1.5,
          fillColor: circleColor,
          fillOpacity: 0.9,
          interactive: true,
        });

        circle.bindTooltip(place.name, {
          permanent: imp <= 2,       // Tier 1+2: always-on label; Tier 3: hover only
          direction: 'top',
          offset: [0, -radius - 2],
          className: '',             // We style via options below
          opacity: 0.95,
        });

        // Override tooltip style via the DOM after binding
        circle.on('add', () => {
          const el = (circle as unknown as { _tooltip?: { _container?: HTMLElement } })._tooltip?._container;
          if (el) {
            Object.assign(el.style, {
              background: 'rgba(255,251,235,0.92)',
              border: '1px solid #d97706',
              borderRadius: '4px',
              color: textColor,
              fontSize,
              fontWeight,
              fontFamily: 'system-ui, sans-serif',
              padding: '2px 5px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
              whiteSpace: 'nowrap',
            });
            const tipEl = el.querySelector('.leaflet-tooltip-top') as HTMLElement;
            if (tipEl) tipEl.style.borderTopColor = '#d97706';
          }
        });

        // Popup with verse reference
        circle.bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:160px;">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:5px;">
              <span style="font-size:16px;">✝️</span>
              <strong style="font-size:14px;color:#111827;">${place.name}</strong>
            </div>
            ${place.note ? `<p style="font-size:12px;color:#6b7280;margin:0 0 5px;">${place.note}</p>` : ''}
            <div style="font-size:11px;color:#d97706;font-weight:600;">📖 ${place.verses}</div>
          </div>
        `, { maxWidth: 220 });

        group.addLayer(circle);
      });
    };

    renderOverlay();

    map.on('moveend zoomend', renderOverlay);
    return () => {
      map.off('moveend zoomend', renderOverlay);
      group.clearLayers();
    };
  }, [showBiblicalLayer]);

  // ─── Map style switcher ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileLayerRef.current) return;

    const TILE_URLS = {
      modern: {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
      },
      terrain: {
        url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://stamen.com">Stamen Design</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    };

    tileLayerRef.current.remove();
    const { url, attribution } = TILE_URLS[mapStyle];
    const newTile = L.tileLayer(url, { attribution, maxZoom: 19 }).addTo(map);
    tileLayerRef.current = newTile;
    // Re-add biblical layer group so it renders above the new basemap
    if (biblicalLayerGroupRef.current) {
      biblicalLayerGroupRef.current.remove();
      biblicalLayerGroupRef.current.addTo(map);
    }
  }, [mapStyle]);

  // ─── Click anywhere on map dismisses the search pin ───────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => {
      if (searchPinRef.current) {
        searchPinRef.current.remove();
        searchPinRef.current = null;
      }
    };
    // Use a small delay so the pin's own click doesn't close it
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, []);

  // ─── Sync markers & route with data ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Clear old route lines
    routeLinesRef.current.forEach(l => map.removeLayer(l));
    routeLinesRef.current = [];

    // Add markers for filtered places
    filteredPlaces.forEach(place => {
      const routeIndex = selectedPersonId
        ? selectedPersonRoute.findIndex(r => r.place.id === place.id)
        : -1;

      const icon = routeIndex >= 0 ? createNumberedIcon(routeIndex + 1, routeColor) : DefaultIcon;

      const marker = L.marker([place.lat!, place.lng!], { icon }).addTo(map);

      // Build popup content
      const linkedMap = placePersonLinks.get(place.id) || new Map<string, string>();
      const popupEl = document.createElement('div');
      popupEl.style.minWidth = '200px';
      popupEl.innerHTML = buildPopupHtml(place, people, linkedMap, PLACE_REL_TYPES);

      // Bind event listeners for popup buttons
      marker.bindPopup(popupEl);
      marker.on('popupopen', () => {
        // "Link Person" toggle
        const addBtn = popupEl.querySelector('[data-action="show-add"]') as HTMLElement;
        const addForm = popupEl.querySelector('[data-section="add-form"]') as HTMLElement;
        if (addBtn && addForm) {
          addBtn.onclick = () => {
            addBtn.style.display = 'none';
            addForm.style.display = 'block';
          };
        }
        // Cancel
        const cancelBtn = popupEl.querySelector('[data-action="cancel-add"]') as HTMLElement;
        if (cancelBtn && addBtn && addForm) {
          cancelBtn.onclick = () => {
            addForm.style.display = 'none';
            addBtn.style.display = 'block';
          };
        }
        // Link
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
        // Remove buttons
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

    // Draw route lines + arrows
    if (selectedPersonId && selectedPersonRoute.length >= 2) {
      for (let i = 0; i < selectedPersonRoute.length - 1; i++) {
        const from = selectedPersonRoute[i].coords;
        const to = selectedPersonRoute[i + 1].coords;

        // Dashed polyline
        const line = L.polyline([from, to], {
          color: routeColor,
          weight: 3,
          opacity: 0.8,
          dashArray: '8 6',
        }).addTo(map);
        routeLinesRef.current.push(line);

        // Arrow at midpoint
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

  return (
    <div className="flex h-full relative">
      <MapSidebar
        selectedPersonId={selectedPersonId}
        onSelectPerson={setSelectedPersonId}
        people={people}
        totalPlaces={filteredPlaces.length}
        routeStops={selectedPersonRoute.map(r => ({
          name: r.place.name,
          type: r.relType,
          order: r.sortOrder,
        }))}
      />

      <div className="flex-1 relative z-0">
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

        <MapSearchBar places={places} onFlyTo={handleFlyTo} />

        {/* ─── Top-left control panel ───────────────────────────────── */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">

          {/* Title card */}
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-md border border-gray-200/80 pointer-events-auto">
            <h1 className="font-bold text-gray-900 text-base leading-tight">✝️ Biblical Map</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {selectedPerson
                ? `${selectedPerson.name}'s route — ${selectedPersonRoute.length} stops`
                : 'Click anywhere to pin a location'}
            </p>
          </div>

          {/* Layer toggles */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/80 overflow-hidden pointer-events-auto">

            {/* Biblical Places toggle */}
            <button
              onClick={() => setShowBiblicalLayer(v => !v)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors ${
                showBiblicalLayer
                  ? 'bg-amber-50 hover:bg-amber-100/70'
                  : 'hover:bg-gray-50'
              }`}
              title="Toggle biblical place names overlay"
            >
              <div className={`w-8 h-4.5 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0 ${
                showBiblicalLayer ? 'bg-amber-500' : 'bg-gray-300'
              }`} style={{ height: '18px' }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                  showBiblicalLayer ? 'translate-x-3.5' : 'translate-x-0'
                }`} style={{ width: '14px', height: '14px' }} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-semibold leading-tight ${showBiblicalLayer ? 'text-amber-800' : 'text-gray-500'}`}>
                  📖 Biblical Places
                </p>
                <p className="text-[10px] text-gray-400 leading-tight">Ancient place names overlay</p>
              </div>
            </button>

            <div className="border-t border-gray-100" />

            {/* Map style toggle */}
            <div className="flex">
              <button
                onClick={() => setMapStyle('modern')}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  mapStyle === 'modern'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                🗺 Modern
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => setMapStyle('terrain')}
                className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
                  mapStyle === 'terrain'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                🏔 Terrain
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreatePlaceModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setClickCoord(null);
        }}
        onSubmit={handleCreatePlace}
        coord={clickCoord}
      />
    </div>
  );
}

// ─── Helper: build popup HTML ──────────────────────────────────────────────
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
    <h3 style="font-weight:700;font-size:15px;margin:0 0 4px">${place.name}</h3>
    ${place.description ? `<p style="font-size:13px;color:#6b7280;margin:0 0 8px">${place.description}</p>` : ''}
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
  `;
}
