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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLinesRef = useRef<L.Layer[]>([]);

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      setClickCoord({ lat: e.latlng.lat, lng: e.latlng.lng });
      setShowCreateModal(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
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

        <div className="absolute top-4 left-4 z-[400] pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-gray-200 pointer-events-auto">
            <h1 className="font-bold text-gray-900 text-lg">Biblical Map</h1>
            <p className="text-xs text-gray-500">
              {selectedPerson
                ? `Showing ${selectedPerson.name}'s route (${selectedPersonRoute.length} stops)`
                : 'Click anywhere on the map to add a location'}
            </p>
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
