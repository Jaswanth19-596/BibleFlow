import { useRef, useCallback } from 'react';
import { useViewport } from '@xyflow/react';
import { TimelinePeriod } from '@/lib/types';

const MIN_BAND_HEIGHT = 120;

interface TimelineBandsProps {
  periods: TimelinePeriod[];
  bandWidth: number;
  onResizePeriod: (periodId: string, newHeight: number) => void;
}

/**
 * Renders colored horizontal background bands for each timeline period.
 * Each band uses its own `band_height`. A drag handle at the bottom border
 * lets the user resize each band interactively.
 */
export default function TimelineBands({ periods, bandWidth, onResizePeriod }: TimelineBandsProps) {
  const { x, y, zoom } = useViewport();

  // Track active resize state outside of React state to avoid re-renders during drag
  const resizeState = useRef<{
    periodId: string;
    startClientY: number;
    startHeight: number;
  } | null>(null);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent, periodId: string, currentHeight: number) => {
      e.stopPropagation();
      e.preventDefault();
      resizeState.current = {
        periodId,
        startClientY: e.clientY,
        startHeight: currentHeight,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeState.current) return;
      const delta = (e.clientY - resizeState.current.startClientY) / zoom;
      const newHeight = Math.max(MIN_BAND_HEIGHT, Math.round(resizeState.current.startHeight + delta));
      // Live-update the SVG rect directly for smooth feedback (no React re-render per px)
      const rectEl = document.getElementById(`band-rect-${resizeState.current.periodId}`);
      if (rectEl) rectEl.setAttribute('height', String(newHeight));
      const handleEl = document.getElementById(`band-handle-${resizeState.current.periodId}`);
      if (handleEl) {
        // Recalculate all subsequent band positions live would be complex — just move the handle
        handleEl.setAttribute('y', String(parseFloat(handleEl.getAttribute('data-base-y') || '0') + (newHeight - resizeState.current.startHeight)));
      }
    },
    [zoom]
  );

  const handleResizePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!resizeState.current) return;
      const delta = (e.clientY - resizeState.current.startClientY) / zoom;
      const newHeight = Math.max(MIN_BAND_HEIGHT, Math.round(resizeState.current.startHeight + delta));
      onResizePeriod(resizeState.current.periodId, newHeight);
      resizeState.current = null;
    },
    [zoom, onResizePeriod]
  );

  if (periods.length === 0) return null;

  // Pre-compute cumulative Y offsets
  const yOffsets: number[] = [];
  let cumY = 0;
  for (const period of periods) {
    yOffsets.push(cumY);
    cumY += (period.band_height ?? 300);
  }

  // Visible left edge in canvas coordinates (for sticky label)
  const visibleLeftX = -x / zoom;

  return (
    <svg
      className="react-flow__background"
      style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        {periods.map((period, index) => {
          const yPos = yOffsets[index];
          const bh = period.band_height ?? 300;
          const handleY = yPos + bh - 6;

          return (
            <g key={period.id}>
              {/* Background band */}
              <rect
                id={`band-rect-${period.id}`}
                x={-bandWidth / 2}
                y={yPos}
                width={bandWidth}
                height={bh}
                fill={period.color}
                opacity={0.06}
              />

              {/* Separator line at top of band */}
              {index > 0 && (
                <line
                  x1={-bandWidth / 2}
                  y1={yPos}
                  x2={bandWidth / 2}
                  y2={yPos}
                  stroke={period.color}
                  strokeWidth={1}
                  opacity={0.25}
                  strokeDasharray="8 4"
                />
              )}

              {/* Period label — sticky to the left viewport edge */}
              <foreignObject
                x={visibleLeftX + 12}
                y={yPos + 10}
                width={200}
                height={40}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: period.color }}
                  />
                  <span
                    className="text-xs font-semibold truncate"
                    style={{ color: period.color }}
                  >
                    {period.name}
                  </span>
                </div>
              </foreignObject>

              {/* Resize handle — interactive strip at bottom of band */}
              <foreignObject
                id={`band-handle-${period.id}`}
                data-base-y={handleY}
                x={-bandWidth / 2}
                y={handleY}
                width={bandWidth}
                height={12}
                style={{ pointerEvents: 'all', cursor: 'row-resize', overflow: 'visible' }}
              >
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div
                  onPointerDown={(e) => handleResizePointerDown(e, period.id, bh)}
                  onPointerMove={handleResizePointerMove}
                  onPointerUp={handleResizePointerUp}
                  style={{
                    width: '100%',
                    height: '12px',
                    cursor: 'row-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Visual pip dots centered in handle */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      opacity: 0.35,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: period.color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export { TimelineBands };
