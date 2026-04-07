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
          strokeWidth: selected ? 3 : 2,
          filter: selected ? 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))' : undefined,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto cursor-pointer"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onClick={() => data?.onEdit?.(id)}
        >
          <div
            className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs font-medium shadow-sm border border-gray-200 dark:border-gray-700"
            style={{ color }}
          >
            {data?.label || typeLabel}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(ConnectionEdgeComponent);
export { ConnectionEdgeComponent };
