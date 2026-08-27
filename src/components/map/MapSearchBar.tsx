import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Entity } from '@/lib/types';
import { BiblicalPlaceCluster } from '@/data/biblicalPlaces';
import { HistoricalMapSelection } from '@/data/biblicalTerritories';
import { hasMappedHistoricalEvidence, searchHistoricalTerritories } from '@/lib/territorySearch';

interface SearchResult {
  id: string; name: string; description: string; lat: number; lng: number;
  source: 'local' | 'biblical'; aliases?: string[];
}

interface TerritoryResult {
  id: string;
  name: string;
  description: string;
  source: 'territory';
  territory: HistoricalMapSelection;
  isMapped: boolean;
}

type MapSearchResult = SearchResult | TerritoryResult;

export interface SearchContext {
  name: string; description: string; source: 'local' | 'biblical'; aliases?: string[];
}

interface MapSearchBarProps {
  places: Entity[];
  biblicalPlaces: BiblicalPlaceCluster[];
  selectedBook: string | null;
  onFlyTo: (lat: number, lng: number, zoom?: number, context?: SearchContext) => void;
  onSelectTerritory: (territory: HistoricalMapSelection) => void;
}

const biblicalDescription = (place: BiblicalPlaceCluster) => {
  const references = place.references.slice(0, 3).join(' · ');
  const aliases = place.aliases.slice(0, 2).join(', ');
  return [references, aliases ? `Also known as ${aliases}` : ''].filter(Boolean).join(' — ');
};

const score = (place: BiblicalPlaceCluster, query: string) => {
  const name = place.name.toLowerCase();
  const aliases = place.aliases.map(alias => alias.toLowerCase());
  if (name === query) return 0;
  if (aliases.includes(query)) return 1;
  if (name.startsWith(query)) return 2;
  if (aliases.some(alias => alias.startsWith(query))) return 3;
  if (name.includes(query)) return 4;
  if (aliases.some(alias => alias.includes(query))) return 5;
  return 6;
};

const matchesBiblicalPlace = (place: BiblicalPlaceCluster, query: string) => {
  const names = [place.name, ...place.aliases].join(' ').toLowerCase();
  // References are searchable (for example, "John 5:2"); descriptive notes
  // are intentionally not, so a search for Jerusalem stays about Jerusalem.
  const looksLikeReference = /\d|\b(gen|ex|lev|num|deut|josh|judg|sam|kgs|chr|ezra|neh|est|job|ps|prov|isa|jer|ezek|dan|hos|joel|amos|obad|jonah|mic|nah|hab|zeph|hag|zech|mal|matt|mark|luke|john|acts|rom|cor|gal|eph|phil|col|thess|tim|tit|philem|heb|jas|pet|rev)\b/.test(query);
  return names.includes(query) || (looksLikeReference && place.references.join(' ').toLowerCase().includes(query));
};

export default function MapSearchBar({ places = [], biblicalPlaces = [], selectedBook, onFlyTo, onSelectTerritory }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const saved: SearchResult[] = places
      .filter(place => place.name.toLowerCase().includes(normalized) || place.description?.toLowerCase().includes(normalized))
      .map(place => ({ id: `saved-${place.id}`, name: place.name, description: place.description || 'Saved study location', lat: place.lat!, lng: place.lng!, source: 'local' as const }));
    const biblical: SearchResult[] = biblicalPlaces
      .filter(place => matchesBiblicalPlace(place, normalized))
      .sort((a, b) => score(a, normalized) - score(b, normalized) || a.name.localeCompare(b.name))
      .slice(0, 12)
      .map(place => {
        const names = selectedBook ? place.namesByBook[selectedBook] : undefined;
        const references = selectedBook ? place.referencesByBook[selectedBook] ?? [] : place.references;
        return {
          id: place.id,
          name: names?.[0] ?? place.name,
          description: references.length ? [references.slice(0, 3).join(' · '), names && names.length > 1 ? `Also known as ${names.slice(1, 3).join(', ')}` : ''].filter(Boolean).join(' — ') : biblicalDescription(place),
          lat: place.lat,
          lng: place.lng,
          source: 'biblical' as const,
          aliases: selectedBook ? names?.slice(1) : place.aliases,
        };
      })
      .filter(place => !saved.some(savedPlace => savedPlace.name.toLowerCase() === place.name.toLowerCase()));
    const territories: TerritoryResult[] = searchHistoricalTerritories(query).map(result => ({
      id: `territory-${result.territory.id}`,
      name: result.territory.name,
      description: result.kind === 'territory'
        ? `${result.territory.historicalRegion} · ${result.territory.confidence === 'source-isobands' ? 'source-backed confidence area' : 'source-backed historical outline'}`
        : result.kind === 'sites'
          ? `${result.territory.historicalRegion} · ${result.territory.sites.length} attested sites`
          : 'Historical location remains unresolved',
      source: 'territory' as const,
      territory: result.territory,
      isMapped: hasMappedHistoricalEvidence(result.territory),
    }));
    return [...saved, ...biblical, ...territories];
  }, [biblicalPlaces, places, query, selectedBook]);

  useEffect(() => setActiveIndex(-1), [query]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!panelRef.current?.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selectResult = useCallback((result: MapSearchResult) => {
    if (result.source === 'territory') {
      onSelectTerritory(result.territory);
      setQuery(result.name);
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    onFlyTo(result.lat, result.lng, result.source === 'local' ? 14 : 11, { name: result.name, description: result.description, source: result.source, aliases: result.aliases });
    setQuery(result.name);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onFlyTo, onSelectTerritory]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') return setIsOpen(false);
    if (!isOpen || results.length === 0) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => (index + 1) % results.length); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => (index <= 0 ? results.length - 1 : index - 1)); }
    if (event.key === 'Enter' && activeIndex >= 0) { event.preventDefault(); selectResult(results[activeIndex]); }
  };

  return (
    <div ref={panelRef} className="relative z-[500] w-full">
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white/95 shadow-xl shadow-stone-900/10 backdrop-blur-xl dark:border-stone-700 dark:bg-gray-900/95">
        <div className="flex items-center gap-3 px-4 py-3">
          <svg className="h-5 w-5 shrink-0 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
          <input ref={inputRef} type="search" value={query} onChange={event => { setQuery(event.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} onKeyDown={onKeyDown} placeholder="Find a place, people, or kingdom…" className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400 dark:text-white" autoComplete="off" aria-label="Search biblical places, peoples, and kingdoms" />
          {query && <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" aria-label="Clear search"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 6 12 12M18 6 6 18" /></svg></button>}
        </div>
        <div className="border-t border-stone-100 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-400 dark:border-stone-800">{selectedBook ? `${selectedBook} + your saved places` : 'Biblical catalog + your saved places'}</div>
      </div>

      {isOpen && query.trim() && <div className="mt-2 max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto rounded-2xl border border-stone-200 bg-white/95 p-1.5 shadow-2xl shadow-stone-900/15 backdrop-blur-xl dark:border-stone-700 dark:bg-gray-900/95">
        {results.length === 0 ? <div className="px-4 py-5 text-center"><p className="text-sm font-medium text-stone-700 dark:text-stone-200">No biblical result matches that search.</p><p className="mt-1 text-xs text-stone-500">This search intentionally does not fall back to modern street addresses.</p></div> : results.map((result, index) => {
          const biblical = result.source === 'biblical';
          const territory = result.source === 'territory';
          const territoryStart = territory && results[index - 1]?.source !== 'territory';
          const activeClass = territory ? 'bg-[#dfecef] dark:bg-[#2e6f7e]/25' : biblical ? 'bg-amber-100/80 dark:bg-amber-950/50' : 'bg-indigo-100/70 dark:bg-indigo-950/50';
          const iconClass = territory ? 'bg-[#dfecef] text-[#2e6f7e] dark:bg-[#2e6f7e]/25 dark:text-[#9cc9d3]' : biblical ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
          return <div key={result.id}>{territoryStart && <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500 dark:text-slate-400">Historical peoples &amp; kingdoms</p>}<button onMouseDown={event => { event.preventDefault(); selectResult(result); }} onMouseEnter={() => setActiveIndex(index)} className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${activeIndex === index ? activeClass : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>
          <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${iconClass}`}>{territory ? (result.isMapped ? '◌' : 'i') : biblical ? '✦' : '●'}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-stone-900 dark:text-white">{result.name}</span><span className="mt-0.5 block truncate text-xs text-stone-500 dark:text-stone-400">{result.description}</span>{biblical && result.aliases && result.aliases.length > 2 && <span className="mt-1 block text-[10px] font-medium text-amber-700 dark:text-amber-400">+{result.aliases.length - 2} alternate biblical names</span>}{territory && !result.isMapped && <span className="mt-1 block text-[10px] font-medium text-slate-500 dark:text-slate-400">Evidence note — no border will be drawn</span>}{territory && result.isMapped && 'sites' in result.territory && <span className="mt-1 block text-[10px] font-medium text-[#2e6f7e] dark:text-[#9cc9d3]">Site lens — no border is implied</span>}</span>
          </button></div>;
        })}
      </div>}
    </div>
  );
}
