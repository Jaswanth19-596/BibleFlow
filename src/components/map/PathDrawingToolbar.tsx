interface PathDrawingToolbarProps {
  pointCount: number;
  totalDistanceKm: number;
  onUndo: () => void;
  onFinish: () => void;
  onCancel: () => void;
}

export default function PathDrawingToolbar({
  pointCount,
  totalDistanceKm,
  onUndo,
  onFinish,
  onCancel,
}: PathDrawingToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[470] animate-in fade-in slide-in-from-top-3 duration-200">
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-200/80 bg-white/95 px-4 py-2.5 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-indigo-900/50 dark:bg-slate-900/95">
        {/* Drawing pulse indicator */}
        <div className="flex items-center gap-2 pr-2 border-r border-slate-200 dark:border-slate-800">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Drawing Path</span>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {pointCount} {pointCount === 1 ? 'stop' : 'stops'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {pointCount === 0
                ? 'Click on biblical places or anywhere on the map to begin'
                : pointCount === 1
                ? 'Click the next place or waypoint on your route'
                : `${Math.round(totalDistanceKm)} km total · Click more stops or finish`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={pointCount === 0}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Undo last point"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4" />
            </svg>
            Undo
          </button>

          <button
            onClick={onCancel}
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Cancel
          </button>

          <button
            onClick={onFinish}
            disabled={pointCount < 2}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Finish & Label Path
          </button>
        </div>
      </div>
    </div>
  );
}
