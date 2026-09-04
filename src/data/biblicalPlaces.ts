/**
 * Normalized historical-place catalog generated from OpenBible.info's
 * Bible Geocoding Data (CC BY 4.0). Run `npm run data:openbible` to refresh
 * the compact application snapshot from the pinned source revision.
 */
import generatedCatalog from './generated/openBiblePlaces.json';

export type HistoricalPlaceKind =
  | 'settlement'
  | 'region'
  | 'landform'
  | 'water'
  | 'structure'
  | 'route'
  | 'campsite'
  | 'unknown';

export type HistoricalPlaceConfidence = 'high' | 'medium' | 'low' | 'unknown';
export type HistoricalPlacePrecision = 'site' | 'representative' | 'regional';
export type HistoricalPlaceCoverage = 'all' | 'major-regional' | 'major';

export interface HistoricalPlaceIdentification {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  /** OpenBible's time-weighted confidence score, expressed from 0–1000. */
  score: number;
  confidence: HistoricalPlaceConfidence;
  precision: HistoricalPlacePrecision;
}

export interface BiblicalPlaceCluster {
  /** Stable OpenBible modern-location id (or a stable coordinate fallback). */
  id: string;
  openBibleIds: string[];
  primaryIdentificationId: string;
  name: string;
  lat: number;
  lng: number;
  importance: 1 | 2 | 3;
  kind: HistoricalPlaceKind;
  rawTypes: string[];
  references: string[];
  note?: string;
  aliases: string[];
  searchText: string;
  confidence: HistoricalPlaceConfidence;
  confidenceScore: number;
  locationPrecision: HistoricalPlacePrecision;
  identifications: HistoricalPlaceIdentification[];
  /** Book names represented by at least one source record at this location. */
  books: string[];
  /** Source references grouped by book, so filtering never relies on place-name guessing. */
  referencesByBook: Record<string, string[]>;
  /** Canonical names used when the map applies a book lens. */
  namesByBook: Record<string, string[]>;
  /** Number of cataloged verse occurrences for each book. */
  mentionCountByBook: Record<string, number>;
}

interface GeneratedPlace {
  id: string;
  openBibleIds: string[];
  primaryIdentificationId: string;
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
  importance: 1 | 2 | 3;
  kind: HistoricalPlaceKind;
  types: string[];
  references: string[];
  note?: string;
  confidence: HistoricalPlaceConfidence;
  confidenceScore: number;
  locationPrecision: HistoricalPlacePrecision;
  identifications: HistoricalPlaceIdentification[];
}

interface GeneratedCatalog {
  metadata: {
    source: string;
    sourceUrl: string;
    license: string;
    revision: string;
    sourceRecordCount: number;
    mappedPlaceCount: number;
  };
  places: GeneratedPlace[];
}

const catalog = generatedCatalog as GeneratedCatalog;

export const BIBLICAL_PLACE_SOURCE = {
  ...catalog.metadata,
  methodologyUrl: 'https://github.com/openbibleinfo/Bible-Geocoding-Data#ancient-places-ancientjsonl',
} as const;

export const HISTORICAL_PLACE_KIND_LABELS: Record<HistoricalPlaceKind, string> = {
  settlement: 'Settlement',
  region: 'Region or territory',
  landform: 'Landform',
  water: 'Water feature',
  structure: 'Structure',
  route: 'Road or route',
  campsite: 'Campsite',
  unknown: 'Other place',
};

export const HISTORICAL_PLACE_KINDS = Object.keys(HISTORICAL_PLACE_KIND_LABELS) as HistoricalPlaceKind[];

const BOOK_BY_REFERENCE_PREFIX: Record<string, string> = {
  '1 Chr': '1 Chronicles', '1 Cor': '1 Corinthians', '1 Kgs': '1 Kings',
  '1 Pet': '1 Peter', '1 Sam': '1 Samuel', '1 Thes': '1 Thessalonians',
  '1 Tim': '1 Timothy', '2 Chr': '2 Chronicles', '2 Cor': '2 Corinthians',
  '2 Kgs': '2 Kings', '2 Pet': '2 Peter', '2 Sam': '2 Samuel',
  '2 Thes': '2 Thessalonians', '2 Tim': '2 Timothy',
  Acts: 'Acts', Amos: 'Amos', Col: 'Colossians', Dan: 'Daniel',
  Deut: 'Deuteronomy', Eccl: 'Ecclesiastes', Eph: 'Ephesians', Est: 'Esther',
  Ex: 'Exodus', Ezek: 'Ezekiel', Ezra: 'Ezra', Gal: 'Galatians', Gen: 'Genesis',
  Hab: 'Habakkuk', Hag: 'Haggai', Heb: 'Hebrews', Hos: 'Hosea', Isa: 'Isaiah',
  Jer: 'Jeremiah', Job: 'Job', Joel: 'Joel', John: 'John', Jonah: 'Jonah',
  Josh: 'Joshua', Jude: 'Jude', Judg: 'Judges', Lam: 'Lamentations', Lev: 'Leviticus',
  Luke: 'Luke', Mal: 'Malachi', Mark: 'Mark', Matt: 'Matthew', Mic: 'Micah',
  Nahum: 'Nahum', Neh: 'Nehemiah', Num: 'Numbers', Obad: 'Obadiah', Phil: 'Philippians',
  Prov: 'Proverbs', Ps: 'Psalms', Rev: 'Revelation', Rom: 'Romans', Ruth: 'Ruth',
  Sng: 'Song of Solomon', Titus: 'Titus', Zech: 'Zechariah', Zeph: 'Zephaniah',
};

const getBookForReference = (reference: string) =>
  Object.entries(BOOK_BY_REFERENCE_PREFIX)
    .sort(([a], [b]) => b.length - a.length)
    .find(([prefix]) => reference.startsWith(`${prefix} `))?.[1];

const groupReferencesByBook = (references: string[]) => {
  const grouped: Record<string, string[]> = {};
  references.forEach(reference => {
    const book = getBookForReference(reference);
    if (!book) return;
    grouped[book] = [...(grouped[book] ?? []), reference];
  });
  return grouped;
};

export const BIBLICAL_PLACE_CLUSTERS: BiblicalPlaceCluster[] = catalog.places.map(place => {
  const referencesByBook = groupReferencesByBook(place.references);
  const books = Object.keys(referencesByBook);
  const namesByBook = Object.fromEntries(books.map(book => [book, [place.name]]));
  const mentionCountByBook = Object.fromEntries(
    Object.entries(referencesByBook).map(([book, references]) => [book, references.length]),
  );

  return {
    id: place.id,
    openBibleIds: place.openBibleIds,
    primaryIdentificationId: place.primaryIdentificationId,
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    importance: place.importance,
    kind: place.kind,
    rawTypes: place.types,
    references: place.references,
    note: place.note,
    aliases: place.aliases,
    searchText: [place.name, ...place.aliases, ...place.references, ...place.types].join(' ').toLowerCase(),
    confidence: place.confidence,
    confidenceScore: place.confidenceScore,
    locationPrecision: place.locationPrecision,
    identifications: place.identifications,
    books,
    referencesByBook,
    namesByBook,
    mentionCountByBook,
  };
});

export const BIBLICAL_PLACE_COUNT = BIBLICAL_PLACE_CLUSTERS.length;
export const BIBLICAL_PLACE_SOURCE_COUNT = catalog.metadata.sourceRecordCount;
