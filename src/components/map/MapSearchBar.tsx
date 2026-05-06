import { useState, useRef, useEffect, useCallback } from 'react';
import { Entity } from '@/lib/types';
import { BIBLICAL_PLACES, BIBLICAL_PLACES_INDEX } from '@/data/biblicalPlaces';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  source: 'local' | 'biblical' | 'nominatim';
}

export interface SearchContext {
  name: string;
  description: string;
  source: 'local' | 'biblical' | 'nominatim';
}

interface MapSearchBarProps {
  places: Entity[];
  onFlyTo: (lat: number, lng: number, zoom?: number, context?: SearchContext) => void;
}

export default function MapSearchBar({ places, onFlyTo }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search logic: local places first, then Nominatim
  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      const lower = q.toLowerCase();

      // 1. Search local (user-saved) places
      const localResults: SearchResult[] = places
        .filter(
          p =>
            p.name.toLowerCase().includes(lower) ||
            (p.description && p.description.toLowerCase().includes(lower))
        )
        .map(p => ({
          id: `local-${p.id}`,
          name: p.name,
          description: p.description || 'Saved place',
          lat: p.lat!,
          lng: p.lng!,
          source: 'local' as const,
        }));

      // 2. Search built-in biblical places dictionary (instant, no network)
      const biblicalResults: SearchResult[] = BIBLICAL_PLACES_INDEX
        .filter(entry => entry.lower.includes(lower))
        .slice(0, 10) // Limit to top 10 matches
        .map(entry => {
          const p = BIBLICAL_PLACES[entry.idx];
          return {
            id: `bible-${entry.idx}`,
            name: p.name,
            description: p.note || p.verses,
            lat: p.lat,
            lng: p.lng,
            source: 'biblical' as const,
          };
        })
        // Remove biblical results that duplicate local places (by name similarity)
        .filter(br => !localResults.some(
          lr => lr.name.toLowerCase() === br.name.toLowerCase()
        ));

      // Show local + biblical immediately
      const immediateResults = [...localResults, ...biblicalResults];
      setResults(immediateResults);
      setIsOpen(true);
      setActiveIndex(-1);

      // 3. Fetch from Nominatim as fallback for modern/non-biblical places
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          {
            headers: { 'Accept-Language': 'en' },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const nominatimResults: SearchResult[] = data.map(
            (item: { place_id: number; display_name: string; type: string; lat: string; lon: string }) => ({
              id: `nom-${item.place_id}`,
              name: item.display_name.split(',')[0],
              description: item.display_name.split(',').slice(1, 3).join(',').trim() || item.type,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              source: 'nominatim' as const,
            })
          );

          // Merge: local + biblical first, then nominatim (deduped by coordinate proximity)
          const merged = [...immediateResults];
          for (const nr of nominatimResults) {
            const isDuplicate = merged.some(
              lr => Math.abs(lr.lat - nr.lat) < 0.05 && Math.abs(lr.lng - nr.lng) < 0.05
            );
            if (!isDuplicate) merged.push(nr);
          }

          setResults(merged);
          setIsOpen(true);
        }
      } catch {
        // Nominatim failed — still show local + biblical results
      } finally {
        setIsLoading(false);
      }
    },
    [places]
  );

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  const handleSelect = (result: SearchResult) => {
    onFlyTo(result.lat, result.lng, result.source === 'local' ? 14 : 11, {
      name: result.name,
      description: result.description,
      source: result.source,
    });
    setQuery(result.name);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Scroll active result into view
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-search-item]');
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  return (
    <div className="absolute top-4 right-4 z-[500] w-80">
      {/* Search Input */}
      <div
        className={`relative transition-all duration-200 ${
          isFocused
            ? 'ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/10'
            : 'shadow-md'
        } rounded-xl`}
      >
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg
              className={`w-4 h-4 transition-colors ${isFocused ? 'text-indigo-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            id="map-search-input"
            type="text"
            placeholder="Search places…"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (results.length > 0) setIsOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl pl-10 pr-10 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border border-gray-200/80 dark:border-gray-600/80 rounded-xl focus:outline-none"
            autoComplete="off"
          />

          {/* Clear / Loading indicator */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-600/80 rounded-xl shadow-xl shadow-black/10 max-h-72 overflow-y-auto"
        >
          {/* Local results header */}
          {results.some(r => r.source === 'local') && (
            <div className="px-3 pt-2.5 pb-1">
              <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                📌 Your Places
              </p>
            </div>
          )}

          {results
            .filter(r => r.source === 'local')
            .map((result) => {
              const globalIndex = results.indexOf(result);
              return (
                <button
                  key={result.id}
                  data-search-item
                  onMouseDown={e => {
                    e.preventDefault();
                    handleSelect(result);
                  }}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
                    activeIndex === globalIndex
                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {/* Pin icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.description}</p>
                  </div>
                </button>
              );
            })}

          {/* Biblical places header */}
          {results.some(r => r.source === 'biblical') && (
            <div className="px-3 pt-2.5 pb-1 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                ✝️ Biblical Places
              </p>
            </div>
          )}

          {results
            .filter(r => r.source === 'biblical')
            .map((result) => {
              const globalIndex = results.indexOf(result);
              return (
                <button
                  key={result.id}
                  data-search-item
                  onMouseDown={e => {
                    e.preventDefault();
                    handleSelect(result);
                  }}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
                    activeIndex === globalIndex
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <svg className="w-3 h-3 text-amber-700 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.description}</p>
                  </div>
                </button>
              );
            })}

          {/* Nominatim results header */}
          {results.some(r => r.source === 'nominatim') && (
            <div className="px-3 pt-2.5 pb-1 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                🌍 Other Places
              </p>
            </div>
          )}

          {results
            .filter(r => r.source === 'nominatim')
            .map((result) => {
              const globalIndex = results.indexOf(result);
              return (
                <button
                  key={result.id}
                  data-search-item
                  onMouseDown={e => {
                    e.preventDefault();
                    handleSelect(result);
                  }}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors ${
                    activeIndex === globalIndex
                      ? 'bg-gray-50 dark:bg-gray-700/50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.description}</p>
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {/* No results */}
      {isOpen && results.length === 0 && query.trim() && !isLoading && (
        <div className="mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-600/80 rounded-xl shadow-xl shadow-black/10 px-4 py-5 text-center">
          <svg className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">No places found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
