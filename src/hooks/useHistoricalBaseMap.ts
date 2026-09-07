import { useEffect } from 'react';
import L from 'leaflet';
/** Physical asset is its own precached map-only chunk, loaded once and never per era. */
export function useHistoricalBaseMap(map: L.Map | null, mode: 'physical' | 'modern') {
  useEffect(() => {
    if (!map || !map.getPane('overlayPane')) return;
    let cancelled = false;
    let layer: L.Layer | undefined;
    map.getContainer().style.background = '#d7e6e8';
    if (!map.getPane('physical-base')) {
      const pane = map.createPane('physical-base'); pane.style.zIndex = '210'; pane.style.pointerEvents = 'none';
    }
    const attribution = 'Physical geography: <a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a> (public domain)';
    if (mode === 'modern') {
      layer = L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 19 }).addTo(map);
    } else {
      void import('@/data/generated/historicalBaseMap.json').then(({ default: geography }) => {
        if (cancelled) return;
        layer = L.geoJSON(geography as GeoJSON.FeatureCollection, { pane: 'physical-base', interactive: false, style: feature => ({ fillColor: feature?.properties.water ? '#d7e6e8' : '#f3f0e6', fillOpacity: 1, color: '#9bada7', weight: 1 }) }).addTo(map);
        map.attributionControl.addAttribution(attribution);
      }).catch(() => { if (!cancelled) map.attributionControl.addAttribution('Physical geography unavailable; choose Modern map or reload once online.'); });
    }
    return () => { cancelled = true; layer?.remove(); map.attributionControl.removeAttribution(attribution); map.attributionControl.removeAttribution('Physical geography unavailable; choose Modern map or reload once online.'); };
  }, [map, mode]);
}
