export interface TravelPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: 'biblical' | 'saved';
  detail?: string;
}

export interface TravelRouteOption {
  id: 'direct' | 'overland' | 'corridor';
  name: string;
  description: string;
  distanceKm: number;
  walkingDays: { minimum: number; maximum: number };
  terrain: string[];
  path: [number, number][];
}

export interface TravelInsight {
  start: TravelPlace;
  end: TravelPlace;
  directDistanceKm: number;
  terrain: string[];
  options: TravelRouteOption[];
}

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const rounded = (value: number) => Math.round(value);

export function distanceInKm(from: Pick<TravelPlace, 'lat' | 'lng'>, to: Pick<TravelPlace, 'lat' | 'lng'>) {
  const latitudeDelta = toRadians(to.lat - from.lat);
  const longitudeDelta = toRadians(to.lng - from.lng);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function terrainAt({ lat, lng }: Pick<TravelPlace, 'lat' | 'lng'>) {
  if (lat < 30.5 && lng >= 32 && lng <= 37) return 'Sinai and desert terrain';
  if (lng >= 35.65 && lat >= 30.4 && lat <= 33.6) return 'Transjordan plateau';
  if (lng >= 35.32 && lng < 35.65 && lat >= 31 && lat <= 33.4) return 'Jordan Rift and escarpments';
  if (lng >= 35.08 && lng < 35.45 && lat >= 30.6 && lat <= 33.5) return 'Central hill country';
  if (lng < 35.08 && lat >= 30.4 && lat <= 34) return 'Coastal plain';
  if (lng >= 18 && lng <= 42 && lat >= 30 && lat <= 45) return 'Mediterranean and Anatolian terrain';
  return 'Regional terrain';
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function walkingDays(distanceKm: number) {
  // Ancient travel was highly variable. These bounds assume a sustained
  // 16–22 km walking day and intentionally avoid a false sense of precision.
  return {
    minimum: Math.max(1, Math.ceil(distanceKm / 22)),
    maximum: Math.max(1, Math.ceil(distanceKm / 16)),
  };
}

function pathDistance(path: [number, number][]) {
  return path.slice(1).reduce((total, point, index) => total + distanceInKm(
    { lat: path[index][0], lng: path[index][1] },
    { lat: point[0], lng: point[1] },
  ), 0);
}

function corridorFor(start: TravelPlace, end: TravelPlace) {
  const midpoint: [number, number] = [(start.lat + end.lat) / 2, (start.lng + end.lng) / 2];
  const inLevant = [start, end].every(place => place.lat >= 29 && place.lat <= 34.5 && place.lng >= 34 && place.lng <= 37);

  if (!inLevant) {
    return {
      name: 'Regional overland corridor',
      description: 'A broad overland study route between the two locations; it is not a reconstructed ancient itinerary.',
      path: [[start.lat, start.lng], midpoint, [end.lat, end.lng]] as [number, number][],
    };
  }

  if (start.lng >= 35.55 && end.lng >= 35.55) {
    return {
      name: 'King’s Highway context',
      description: 'An east-of-the-Jordan study option inspired by the Transjordan corridor, not a claim of a single historic path.',
      path: [[start.lat, start.lng], [midpoint[0], Math.max(35.72, midpoint[1])], [end.lat, end.lng]] as [number, number][],
    };
  }

  if (start.lng <= 35.16 && end.lng <= 35.16) {
    return {
      name: 'Via Maris context',
      description: 'A coastal-corridor study option inspired by the Via Maris network, not a reconstructed ancient path.',
      path: [[start.lat, start.lng], [midpoint[0], Math.min(34.96, midpoint[1])], [end.lat, end.lng]] as [number, number][],
    };
  }

  return {
    name: 'Ridge-route context',
    description: 'A central-hill-country study option following the broad north–south ridge context, not a reconstructed ancient path.',
    path: [[start.lat, start.lng], [midpoint[0], 35.24], [end.lat, end.lng]] as [number, number][],
  };
}

export function buildTravelInsight(start: TravelPlace, end: TravelPlace): TravelInsight {
  const directDistanceKm = distanceInKm(start, end);
  const terrain = unique([terrainAt(start), terrainAt(end)]);
  const corridor = corridorFor(start, end);
  const overlandPath: [number, number][] = [[start.lat, start.lng], [end.lat, end.lng]];
  const corridorDistance = pathDistance(corridor.path);
  const overlandDistance = directDistanceKm * (terrain.length > 1 ? 1.3 : 1.2);

  const options: TravelRouteOption[] = [
    {
      id: 'direct',
      name: 'Direct map distance',
      description: 'The straight-line geographic measure between the two locations.',
      distanceKm: directDistanceKm,
      walkingDays: walkingDays(directDistanceKm * 1.15),
      terrain,
      path: overlandPath,
    },
    {
      id: 'overland',
      name: 'Overland planning estimate',
      description: 'Adds distance for terrain, passes, and detours. Use this as a study estimate, not a modern road route.',
      distanceKm: overlandDistance,
      walkingDays: walkingDays(overlandDistance),
      terrain,
      path: overlandPath,
    },
    {
      id: 'corridor',
      name: corridor.name,
      description: corridor.description,
      distanceKm: corridorDistance,
      walkingDays: walkingDays(corridorDistance),
      terrain,
      path: corridor.path,
    },
  ];

  return {
    start,
    end,
    directDistanceKm,
    terrain,
    options: options.map(option => ({ ...option, distanceKm: rounded(option.distanceKm) })),
  };
}

export function formatWalkingDays(days: TravelRouteOption['walkingDays']) {
  return days.minimum === days.maximum ? `about ${days.minimum} walking day${days.minimum === 1 ? '' : 's'}` : `about ${days.minimum}–${days.maximum} walking days`;
}
