import { BiblicalPlaceCluster } from '@/data/biblicalPlaces';

export interface ProjectedPoint {
  x: number;
  y: number;
}

export interface HistoricalPlaceMapCluster {
  id: string;
  lat: number;
  lng: number;
  places: BiblicalPlaceCluster[];
}

/**
 * Groups visible places in screen space. At close zoom levels, only truly
 * co-located records remain grouped so stacked points are still discoverable.
 */
export function clusterHistoricalPlaces(
  places: BiblicalPlaceCluster[],
  zoom: number,
  project: (lat: number, lng: number) => ProjectedPoint,
): HistoricalPlaceMapCluster[] {
  const cells = new Map<string, BiblicalPlaceCluster[]>();
  const gridSize = zoom >= 13 ? 0 : zoom <= 6 ? 72 : zoom <= 9 ? 60 : 48;

  places.forEach(place => {
    const key = gridSize === 0
      ? `exact:${place.lat.toFixed(5)},${place.lng.toFixed(5)}`
      : (() => {
          const point = project(place.lat, place.lng);
          return `${Math.floor(point.x / gridSize)}:${Math.floor(point.y / gridSize)}`;
        })();
    cells.set(key, [...(cells.get(key) ?? []), place]);
  });

  return [...cells.entries()].map(([id, cellPlaces]) => {
    const sorted = [...cellPlaces].sort((a, b) => a.importance - b.importance || a.name.localeCompare(b.name));
    return {
      id,
      lat: sorted.reduce((sum, place) => sum + place.lat, 0) / sorted.length,
      lng: sorted.reduce((sum, place) => sum + place.lng, 0) / sorted.length,
      places: sorted,
    };
  });
}
