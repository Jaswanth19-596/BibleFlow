import { HistoricalMapSelection, HistoricalPlaceLens, HistoricalTerritory } from '@/data/biblicalTerritories';

interface TerritoryEvidenceCardProps {
  selection: HistoricalMapSelection | null;
  onClear: () => void;
}

const isMappedTerritory = (selection: HistoricalMapSelection): selection is HistoricalTerritory =>
  'geometry' in selection;

const isSiteLens = (selection: HistoricalMapSelection): selection is HistoricalPlaceLens =>
  'sites' in selection;

export default function TerritoryEvidenceCard({ selection, onClear }: TerritoryEvidenceCardProps) {
  if (!selection) return null;

  const mapped = isMappedTerritory(selection);
  const siteLens = isSiteLens(selection);

  return (
    <section className="border-t border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-white/[0.03]" aria-live="polite" aria-label="Historical territory evidence">
      <div className="flex items-start gap-2.5">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${mapped ? 'bg-[#dfecef] text-[#2e6f7e] dark:bg-[#2e6f7e]/20 dark:text-[#9cc9d3]' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`} aria-hidden="true">
          {mapped ? '◌' : 'i'}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{selection.name}</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {mapped ? `${selection.historicalRegion} · ${selection.confidence === 'source-isobands' ? 'historical confidence area' : 'historical study outline'}` : siteLens ? `${selection.historicalRegion} · attested site lens` : 'Historical evidence note'}
              </p>
            </div>
            <button onClick={onClear} className="rounded-md px-1.5 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white" aria-label={`Clear ${selection.name}`}>Clear</button>
          </div>

          {mapped ? (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{selection.confidence === 'source-isobands' ? 'Nested contours show the source’s 10–90% confidence bands. They are historical study areas, not precise or modern borders.' : 'This is a source-provided rough historical study outline, not an exact empire frontier or a modern border.'}</p>
              {selection.note && <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{selection.note}</p>}
              <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">{selection.references.slice(0, 3).join(' · ')}</p>
              <a href={selection.source.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2e6f7e] underline-offset-2 hover:underline dark:text-[#9cc9d3]">Source: OpenBible CC BY 4.0 <span aria-hidden="true">↗</span></a>
            </>
          ) : siteLens ? (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{selection.explanation}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{selection.sites.map(site => <span key={site.id} className="rounded-md bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">{site.name}</span>)}</div>
              <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">{selection.references.slice(0, 3).join(' · ')}</p>
              <a href={selection.source.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#2e6f7e] underline-offset-2 hover:underline dark:text-[#9cc9d3]">Source: {selection.source.dataset} <span aria-hidden="true">↗</span></a>
            </>
          ) : (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{selection.explanation}</p>
              <p className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">{selection.references.slice(0, 3).join(' · ')}</p>
              {selection.researchUrl && <a href={selection.researchUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 underline-offset-2 hover:underline dark:text-slate-400">Research note <span aria-hidden="true">↗</span></a>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
