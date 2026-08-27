import { useMemo, useState } from 'react';
import {
  TravelInsight,
  TravelPlace,
  TravelRouteOption,
  formatWalkingDays,
} from '@/lib/travelInsights';

interface PlacePickerProps {
  label: string;
  place: TravelPlace | null;
  places: TravelPlace[];
  onSelect: (place: TravelPlace) => void;
  onClear: () => void;
}

function PlacePicker({ label, place, places, onSelect, onClear }: PlacePickerProps) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!normalizedQuery) return [];
    return places
      .filter(candidate => candidate.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);
  }, [normalizedQuery, places]);

  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</label>
      {place ? (
        <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <button onClick={() => onSelect(place)} className="min-w-0 text-left">
            <span className="block truncate text-sm font-semibold text-slate-800 dark:text-white">{place.name}</span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400">{place.kind === 'saved' ? 'Saved study place' : place.detail ?? 'Biblical location'}</span>
          </button>
          <button onClick={onClear} className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white" aria-label={`Change ${label.toLowerCase()}`}>
            ✕
          </button>
        </div>
      ) : (
        <div className="relative mt-1">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search a biblical place…"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            aria-label={label}
          />
          {matches.length > 0 && (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {matches.map(candidate => (
                <button
                  key={candidate.id}
                  onClick={() => { onSelect(candidate); setQuery(''); }}
                  className="block w-full px-3 py-2 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="block text-sm font-semibold text-slate-800 dark:text-white">{candidate.name}</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400">{candidate.kind === 'saved' ? 'Saved study place' : candidate.detail ?? 'Biblical location'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TravelInsightPanelProps {
  places: TravelPlace[];
  start: TravelPlace | null;
  end: TravelPlace | null;
  insight: TravelInsight | null;
  selectedOptionId: TravelRouteOption['id'];
  onSelectStart: (place: TravelPlace) => void;
  onSelectEnd: (place: TravelPlace) => void;
  onClearStart: () => void;
  onClearEnd: () => void;
  onSelectOption: (id: TravelRouteOption['id']) => void;
  onClear: () => void;
  onSaveAsPath?: () => void;
}

export default function TravelInsightPanel({
  places, start, end, insight, selectedOptionId, onSelectStart, onSelectEnd, onClearStart, onClearEnd, onSelectOption, onClear, onSaveAsPath,
}: TravelInsightPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select two places to measure distance, walking days, and terrain.
        </p>
        {(start || end) && (
          <button
            onClick={onClear}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-3">
        <PlacePicker label="From" place={start} places={places} onSelect={onSelectStart} onClear={onClearStart} />
        <PlacePicker label="To" place={end} places={places} onSelect={onSelectEnd} onClear={onClearEnd} />
      </div>

      {insight && (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Straight-line distance</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">{Math.round(insight.directDistanceKm)} km</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Terrain: {insight.terrain.join(' · ')}</p>
          </div>

          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Route estimates</p>
            {insight.options.map(option => (
              <button
                key={option.id}
                onClick={() => onSelectOption(option.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition ${
                  selectedOptionId === option.id
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">{option.name}</span>
                  <span className={`shrink-0 text-xs font-bold ${selectedOptionId === option.id ? 'opacity-90' : 'text-slate-600 dark:text-slate-300'}`}>
                    {option.distanceKm} km
                  </span>
                </div>
                <span className={`mt-0.5 block text-[11px] font-medium ${selectedOptionId === option.id ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {formatWalkingDays(option.walkingDays)}
                </span>
                <span className={`mt-1 block text-[11px] leading-4 ${selectedOptionId === option.id ? 'opacity-70' : 'text-slate-400 dark:text-slate-500'}`}>
                  {option.description}
                </span>
              </button>
            ))}
          </div>

          {onSaveAsPath && (
            <button
              onClick={onSaveAsPath}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Save as Labeled Path
            </button>
          )}

          <p className="mt-2 text-[10px] leading-4 text-slate-400 dark:text-slate-500 text-center">
            Walking time and terrain are study estimates.
          </p>
        </div>
      )}
    </div>
  );
}
