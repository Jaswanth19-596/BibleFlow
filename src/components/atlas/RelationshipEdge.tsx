import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react';

interface RelationshipEdgeData {
  type: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as RelationshipEdgeData | undefined;
  const label = edgeData?.type?.replace(/-/g, ' ') || '';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: selected ? '#6366f1' : '#94a3b8',
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: selected ? undefined : '6 3',
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="relationship-edge-label group cursor-pointer"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            onClick={() => edgeData?.onEdit?.(id)}
          >
            <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 whitespace-nowrap transition-colors group-hover:border-indigo-300 group-hover:text-indigo-600 dark:group-hover:border-indigo-600 dark:group-hover:text-indigo-400">
              {label}
              <svg className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
