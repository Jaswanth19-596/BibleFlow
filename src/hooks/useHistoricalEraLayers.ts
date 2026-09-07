import { useEffect } from 'react';
import L from 'leaflet';
import type { BiblicalPlaceCluster } from '@/data/biblicalPlaces';
import type { EraLayers, HistoricalAreaSnapshot, HistoricalRoute } from '@/lib/historicalEraTypes';
import { PLACE_BY_ID } from '@/lib/historicalEraResolver';
const text = (value: string) => { const node = document.createElement('span'); node.textContent = value; return node; };
export function useHistoricalEraLayers(map: L.Map | null, areas: HistoricalAreaSnapshot[], routes: HistoricalRoute[], places: BiblicalPlaceCluster[], layers: EraLayers, showPlaces: boolean) {
  useEffect(() => {
    if (!map || !map.getPane('overlayPane')) return;
    const group = L.layerGroup().addTo(map);
    if (layers.areas) areas.forEach(area => {
      if (area.geometry) L.geoJSON(area.geometry, { pane: 'historical-territory', interactive: false, style: { color: area.color, weight: 1, dashArray: '4 6', fillOpacity: 0.06 } }).addTo(group);
      area.siteIds.forEach(id => {
        const p = PLACE_BY_ID.get(id);
        if (p) L.circleMarker([p.lat, p.lng], { pane: 'historical-territory', radius: 14, color: area.color, weight: 1.5, dashArray: '2 4', fill: false, interactive: false }).addTo(group);
      });
    });
    routes.forEach(route => route.segments.forEach(segment => {
      if (segment.kind !== 'unmapped' && segment.geometry) L.geoJSON(segment.geometry, { interactive: false, style: { color: '#7c5282', weight: 3, dashArray: '6 8', opacity: 0.75 } }).addTo(group);
    }));
    return () => { group.remove(); };
  }, [map, areas, routes, layers.areas]);
  useEffect(() => {
    if (!map || !map.getPane('overlayPane') || !layers.names || !showPlaces) return;
    const group = L.layerGroup().addTo(map);
    const render = () => {
      group.clearLayers();
      const accepted: L.Point[] = [];
      for (const p of [...places].sort((a, b) => a.importance - b.importance)) {
        if (!map.getBounds().contains([p.lat, p.lng])) continue;
        const point = map.latLngToContainerPoint([p.lat, p.lng]);
        if (accepted.some(other => Math.abs(other.x - point.x) < 125 && Math.abs(other.y - point.y) < 28)) continue;
        if (accepted.length >= (map.getZoom() < 7 ? 12 : 40)) break;
        accepted.push(point);
        L.tooltip({ permanent: true, direction: 'right', offset: [8, 0], className: 'historical-site-label', interactive: false }).setLatLng([p.lat, p.lng]).setContent(text(p.name)).addTo(group);
      }
    };
    render(); let frame: number | null = null;
    const scheduleRender = () => {
      if (frame === null) frame = requestAnimationFrame(() => { frame = null; render(); });
    };
    map.on('moveend zoomend', scheduleRender);
    return () => { map.off('moveend zoomend', scheduleRender);
      if (frame !== null) cancelAnimationFrame(frame); group.remove(); };
  }, [map, places, layers.names, showPlaces]);
}
