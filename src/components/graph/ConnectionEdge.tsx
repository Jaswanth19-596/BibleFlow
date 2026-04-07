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
    onEdit?: (id: string) => void;
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
  const color = EDGE_COLORS[edgeType];
  const typeLabel = EDGE_LABELS[edgeType];

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 4 : 3,
          filter: selected ? 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.6))' : undefined,
          cursor: 'pointer',
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto cursor-pointer group"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onClick={() => data?.onEdit?.(id)}
          title="Click to edit or delete connection"
        >
          <div
            className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-md border-2 transition-all duration-200 group-hover:shadow-lg group-hover:scale-105 flex items-center gap-1"
            style={{
              borderColor: color,
              color,
            }}
          >
            <span>{data?.label || typeLabel}</span>
            <svg
              className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConnectionEdgeComponent);
export { ConnectionEdgeComponent };
