import {
  GROUPS_WITHOUT_SOURCE_BACKED_TERRITORY,
  SITE_BACKED_HISTORICAL_LENSES,
  SOURCE_BACKED_TERRITORIES,
  HistoricalMapSelection,
  HistoricalTerritory,
  HistoricalPlaceLens,
  UnresolvedPeopleGroup,
} from '@/data/biblicalTerritories';

export type TerritorySearchResult =
  | { kind: 'territory'; territory: HistoricalTerritory }
  | { kind: 'sites'; territory: HistoricalPlaceLens }
  | { kind: 'unresolved'; territory: UnresolvedPeopleGroup };

export const hasMappedHistoricalEvidence = (selection: HistoricalMapSelection) =>
  'geometry' in selection || 'sites' in selection;

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const rankMatch = (value: string, query: string) => {
  const candidate = normalize(value);
  if (candidate === query) return 0;
  if (candidate.startsWith(query)) return 1;
  if (candidate.includes(query)) return 2;
  return 3;
};

/**
 * Searches the curated territory catalog only. We deliberately keep this
 * separate from place search: an ethnonym must never fall through to a modern
 * address or an unrelated similarly named location.
 */
export function searchHistoricalTerritories(query: string, limit = 8): TerritorySearchResult[] {
  const normalized = normalize(query.trim());
  if (!normalized) return [];

  const ranked = [
    ...SOURCE_BACKED_TERRITORIES.map(territory => ({
      result: { kind: 'territory' as const, territory },
      score: Math.min(...[territory.name, territory.historicalRegion, ...territory.aliases].map(value => rankMatch(value, normalized))),
    })),
    ...SITE_BACKED_HISTORICAL_LENSES.map(territory => ({
      result: { kind: 'sites' as const, territory },
      score: Math.min(...[territory.name, territory.historicalRegion, ...territory.aliases].map(value => rankMatch(value, normalized))),
    })),
    ...GROUPS_WITHOUT_SOURCE_BACKED_TERRITORY.map(territory => ({
      result: { kind: 'unresolved' as const, territory },
      score: Math.min(...[territory.name, ...territory.aliases].map(value => rankMatch(value, normalized))),
    })),
  ];

  return ranked
    .filter(item => item.score < 3)
    .sort((a, b) => a.score - b.score || a.result.territory.name.localeCompare(b.result.territory.name))
    .slice(0, limit)
    .map(item => item.result);
}
