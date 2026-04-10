import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { ConnectionType } from '@/lib/types';
import { EDGE_COLORS, EDGE_LABELS } from '@/lib/edgeTypes';

interface ConnectionEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  data?: {
    type?: ConnectionType;
    label?: string | null;
    anchor_word?: string | null;
    anchor_color?: string | null;
    onEdit?: (id: string, updates: {}) => void;
    onDelete?: (id: string) => void;
  };
  selected?: boolean;
}

function ConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: ConnectionEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeType = data?.type || 'references';
  const typeColor = EDGE_COLORS[edgeType];
  // Anchor color overrides the type color for the edge line
  const edgeColor = data?.anchor_color || typeColor;
  const typeLabel = EDGE_LABELS[edgeType];

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? 4 : 3,
          filter: selected
            ? `drop-shadow(0 0 6px ${edgeColor}99)`
            : undefined,
          cursor: 'pointer',
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto cursor-pointer group"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onClick={() => data?.onEdit?.(id, {})}
          title="Click to edit or delete connection"
        >
          <div
            className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-md border-2 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105 flex items-center gap-1.5"
            style={{
              borderColor: edgeColor,
              color: edgeColor,
            }}
          >
            {/* Connection type / custom label */}
            <span>{data?.label || typeLabel}</span>

            {/* Word anchor badge */}
            {data?.anchor_word && (
              <span
                className="text-[10px] px-1.5 py-px rounded-full font-semibold italic"
                style={{
                  backgroundColor: edgeColor + '22',
                  color: edgeColor,
                  border: `1px solid ${edgeColor}55`,
                }}
              >
                &ldquo;{data.anchor_word}&rdquo;
              </span>
            )}

            {/* Edit pencil icon */}
            <svg
              className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConnectionEdgeComponent);
export { ConnectionEdgeComponent };
