import { useEffect, useState } from 'react';
import {
  BIBLICAL_PLACE_SOURCE,
  BiblicalPlaceCluster,
  HISTORICAL_PLACE_KIND_LABELS,
  HistoricalPlaceIdentification,
} from '@/data/biblicalPlaces';

interface HistoricalPlaceDetailsProps {
  place: BiblicalPlaceCluster;
  selectedBook: string | null;
  onClose: () => void;
  onViewIdentification: (identification: HistoricalPlaceIdentification) => void;
}

const CONFIDENCE_LABELS = {
  high: 'High confidence',
  medium: 'Moderate confidence',
  low: 'Tentative identification',
  unknown: 'Confidence not scored',
} as const;

const PRECISION_LABELS = {
  site: 'Site point',
  representative: 'Representative point',
  regional: 'Regional center point',
} as const;

const confidenceClass = {
  high: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/35 dark:text-emerald-200',
  medium: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/35 dark:text-amber-200',
  low: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/35 dark:text-rose-200',
  unknown: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
} as const;

function IdentificationRow({
  identification,
  primary,
  onView,
}: {
  identification: HistoricalPlaceIdentification;
  primary: boolean;
  onView: () => void;
}) {
  return (
    <div className="border-t border-stone-200 py-3 first:border-t-0 dark:border-stone-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="font-semibold text-stone-900 dark:text-white">{identification.name}</p>
            {primary && <span className="bg-[#2e6f7e] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Primary</span>}
          </div>
          <p className="mt-1 text-[11px] leading-4 text-stone-500 dark:text-stone-400">
            {identification.type} · {PRECISION_LABELS[identification.precision]} · score {identification.score}/1000
          </p>
          {identification.description && identification.description !== identification.name && (
            <p className="mt-1 text-xs leading-4 text-stone-600 dark:text-stone-300">{identification.description}</p>
          )}
        </div>
        <button onClick={onView} className="shrink-0 border border-stone-300 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-600 transition hover:border-amber-700 hover:text-amber-800 dark:border-stone-600 dark:text-stone-300" aria-label={`View ${identification.name} on map`}>
          View
        </button>
      </div>
    </div>
  );
}

export default function HistoricalPlaceDetails({ place, selectedBook, onClose, onViewIdentification }: HistoricalPlaceDetailsProps) {
  const [showAllReferences, setShowAllReferences] = useState(false);
  const references = selectedBook ? place.referencesByBook[selectedBook] ?? [] : place.references;
  const visibleReferences = showAllReferences ? references : references.slice(0, 36);
  const primaryIdentification = place.identifications.find(item => item.id === place.primaryIdentificationId) ?? place.identifications[0];
  const alternativeIdentifications = place.identifications.filter(item => item !== primaryIdentification);

  useEffect(() => setShowAllReferences(false), [place.id, selectedBook]);

  return (
    <aside className="absolute bottom-16 left-3 right-3 z-[1220] max-h-[58dvh] overflow-hidden border border-stone-300 bg-[#fffcf5]/97 shadow-2xl shadow-stone-950/20 backdrop-blur-xl dark:border-stone-700 dark:bg-[#151714]/97 sm:bottom-3 sm:left-auto sm:right-3 sm:top-3 sm:max-h-none sm:w-[380px]" aria-label={`${place.name} historical place record`}>
      <div className="flex h-full max-h-[inherit] flex-col">
        <header className="shrink-0 border-b border-stone-300 px-5 pb-4 pt-4 dark:border-stone-700">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-400">Historical place record</p>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Close place details">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <h2 className="mt-1 font-serif text-3xl font-semibold leading-tight text-stone-950 dark:text-stone-50">{place.name}</h2>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 dark:text-stone-400">
            <span>{HISTORICAL_PLACE_KIND_LABELS[place.kind]}</span>
            <span>{PRECISION_LABELS[place.locationPrecision]}</span>
            <span>{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className={`border px-3 py-2.5 text-xs ${confidenceClass[place.confidence]}`}>
            <div className="flex items-center justify-between gap-3 font-bold">
              <span>{CONFIDENCE_LABELS[place.confidence]}</span>
              {place.confidenceScore > 0 && <span>{place.confidenceScore}/1000</span>}
            </div>
            <p className="mt-1 leading-4 opacity-80">The score reflects OpenBible’s time-weighted survey of published identifications; it is evidence, not certainty.</p>
          </div>

          {place.note && (
            <section className="border-b border-stone-200 py-4 dark:border-stone-700">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Catalog note</h3>
              <p className="mt-1.5 text-sm leading-5 text-stone-700 dark:text-stone-200">{place.note}</p>
            </section>
          )}

          {place.aliases.length > 0 && (
            <section className="border-b border-stone-200 py-4 dark:border-stone-700">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Names across translations</h3>
              <p className="mt-1.5 text-sm leading-5 text-stone-700 dark:text-stone-200">{place.aliases.join(' · ')}</p>
            </section>
          )}

          <section className="border-b border-stone-200 py-4 dark:border-stone-700">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Scripture references</h3>
              <span className="text-[10px] text-stone-400">{selectedBook ?? 'All books'} · {references.length}</span>
            </div>
            {references.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {visibleReferences.map(reference => <span key={reference} className="border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{reference}</span>)}
              </div>
            ) : <p className="mt-2 text-xs text-stone-500">No cataloged reference in this book lens.</p>}
            {references.length > 36 && (
              <button onClick={() => setShowAllReferences(value => !value)} className="mt-3 border-b border-amber-700 pb-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                {showAllReferences ? 'Show first 36 references' : `Show all ${references.length} references`}
              </button>
            )}
          </section>

          <section className="py-4">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Geographic identifications</h3>
              <span className="text-[10px] text-stone-400">{place.identifications.length} candidate{place.identifications.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-2">
              {primaryIdentification && <IdentificationRow identification={primaryIdentification} primary onView={() => onViewIdentification(primaryIdentification)} />}
              {alternativeIdentifications.slice(0, 8).map(identification => <IdentificationRow key={`${identification.id}-${identification.lat}-${identification.lng}`} identification={identification} primary={false} onView={() => onViewIdentification(identification)} />)}
              {alternativeIdentifications.length > 8 && <p className="border-t border-stone-200 pt-2 text-xs text-stone-500 dark:border-stone-700">+{alternativeIdentifications.length - 8} additional cataloged resolutions</p>}
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-stone-300 px-5 py-3 text-[10px] leading-4 text-stone-500 dark:border-stone-700 dark:text-stone-400">
          <a className="font-bold text-[#2e6f7e] underline decoration-[#2e6f7e]/30 underline-offset-2 dark:text-[#9cc9d3]" href={BIBLICAL_PLACE_SOURCE.sourceUrl} target="_blank" rel="noreferrer">{BIBLICAL_PLACE_SOURCE.source}</a>
          {' · '}{BIBLICAL_PLACE_SOURCE.license} · revision {BIBLICAL_PLACE_SOURCE.revision.slice(0, 8)}
        </footer>
      </div>
    </aside>
  );
}
