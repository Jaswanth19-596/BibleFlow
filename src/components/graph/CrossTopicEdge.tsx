import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
} from '@xyflow/react';
import { CROSS_TOPIC_COLOR } from '@/lib/edgeTypes';

interface CrossTopicEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  data?: {
    description?: string;
    onClick?: (id: string) => void;
  };
  selected?: boolean;
}

function CrossTopicEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: CrossTopicEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: CROSS_TOPIC_COLOR,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: '5,5',
          filter: selected ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))' : undefined,
        }}
      />
      {data?.description && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            onClick={() => data?.onClick?.(id)}
          >
            <div className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs font-medium shadow-sm border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400">
              {data.description}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(CrossTopicEdgeComponent);
export { CrossTopicEdgeComponent };
