import { HISTORICAL_CONTENT } from '@/data/historicalEraContent';
import { useEffect, useRef, useState } from 'react';
import { ERAS, validateEraSelection } from '@/lib/historicalEraResolver';
import type { EraSelection } from '@/lib/historicalEraTypes';
export interface HistoricalEraControlProps {
  selection: EraSelection; onPreview: (selection: EraSelection | null) => void;
  onCommit: (selection: EraSelection) => void; onFit: () => void;
}
export default function HistoricalEraControl({ selection, onPreview, onCommit, onFit }: HistoricalEraControlProps) {
  const index = ERAS.findIndex(e => e.id === selection.eraId);
  const era = ERAS[index];
  const [thumb, setThumb] = useState<number | null>(null);
  const dragging = useRef(false);
  const pending = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const cancelFrame = () => { if (frame.current !== null) cancelAnimationFrame(frame.current); frame.current = null; };
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const choose = (i: number) => onCommit(validateEraSelection(ERAS[i]?.id));
  return <div className="historical-era-control" data-map-obstruction="timeline" onPointerDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
    <div className="flex items-center gap-2">
      <button aria-label="Previous era" disabled={index <= 0} onClick={() => choose(index - 1)}>‹</button>
      <label className="min-w-0 flex-1"><span className="sr-only">Historical era</span><select aria-label="Historical era" value={selection.eraId ?? 'all'} onChange={e => onCommit(validateEraSelection(e.target.value))}>
        <option value="all">All eras</option>{ERAS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
      </select></label>
      <button aria-label="Next era" disabled={index === ERAS.length - 1} onClick={() => choose(index + 1)}>›</button>
    </div>
    {era && <p className="truncate text-xs text-slate-500" title={HISTORICAL_CONTENT.snapshots.find(s => s.id === selection.snapshotId)?.label}>Map: {HISTORICAL_CONTENT.snapshots.find(s => s.id === selection.snapshotId)?.label}</p>}
    <input type="range" min={0} max={ERAS.length - 1} step={1} value={thumb ?? Math.max(0, index)} aria-label="Historical era timeline" aria-valuetext={era ? `${era.label}, ${era.dateLabel}` : 'All eras; use an arrow key to select a historical period'}
      onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
      onChange={e => { const next = Number(e.target.value); if (!dragging.current) { choose(next); return; } pending.current = next; setThumb(next); cancelFrame(); frame.current = requestAnimationFrame(() => { onPreview(validateEraSelection(ERAS[next].id)); frame.current = null; }); }}
      onPointerUp={() => { cancelFrame(); dragging.current = false; if (pending.current !== null) choose(pending.current); pending.current = null; setThumb(null); }}
      onPointerCancel={() => { cancelFrame(); dragging.current = false; pending.current = null; setThumb(null); onPreview(null); }}
      onKeyDown={e => { if (e.key === 'Escape') { cancelFrame(); dragging.current = false; pending.current = null; setThumb(null); onPreview(null); } }} />
    <div className="flex items-center justify-between gap-2 text-xs"><span>{era?.dateLabel ?? 'Explore the complete catalog'}</span><div className="flex shrink-0 gap-1"><button disabled={!era} onClick={onFit}>Fit era</button><button onClick={() => onCommit(validateEraSelection(null))}>All eras</button></div></div>
  </div>;
}
