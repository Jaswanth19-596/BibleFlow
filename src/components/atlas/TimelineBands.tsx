import { useViewport } from '@xyflow/react';
import { TimelinePeriod } from '@/lib/types';

interface TimelineBandsProps {
  periods: TimelinePeriod[];
  bandHeight: number;
  bandWidth: number;
}

/**
 * Renders colored horizontal background bands for each timeline period.
 * This is rendered as an SVG overlay inside the React Flow viewport.
 */
export default function TimelineBands({ periods, bandHeight, bandWidth }: TimelineBandsProps) {
  const { x, y, zoom } = useViewport();

  if (periods.length === 0) return null;

  return (
    <svg className="react-flow__background" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}>
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        {periods.map((period, index) => {
          const yPos = index * bandHeight;
          // Calculate the left edge of the visible viewport in canvas coordinates
          const visibleLeftX = -x / zoom;

          return (
            <g key={period.id}>
              {/* Background band */}
              <rect
                x={-bandWidth / 2}
                y={yPos}
                width={bandWidth}
                height={bandHeight}
                fill={period.color}
                opacity={0.06}
              />
              {/* Separator line */}
              {index > 0 && (
                <line
                  x1={-bandWidth / 2}
                  y1={yPos}
                  x2={bandWidth / 2}
                  y2={yPos}
                  stroke={period.color}
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="8 4"
                />
              )}
              {/* Period label on the left (Sticky to the viewport's left edge) */}
              <foreignObject
                x={visibleLeftX + 12}
                y={yPos + 8}
                width={180}
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
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export { TimelineBands };
