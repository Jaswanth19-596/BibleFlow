import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Entity, TimelinePeriod } from '@/lib/types';

interface PersonNodeData {
  [key: string]: unknown;
  entity: Entity;
  mentionCount: number;
  period?: TimelinePeriod;
  isHighlighted?: boolean;
  onClick?: (entity: Entity) => void;
  onAssignPeriod?: (entityId: string) => void;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entityId: string) => void;
}

interface PersonNodeProps {
  data: PersonNodeData;
  selected?: boolean;
}

function PersonNodeComponent({ data, selected }: PersonNodeProps) {
  const { entity, mentionCount, isHighlighted } = data;

  return (
    <div
      className={`person-node group relative ${selected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      style={{ borderColor: entity.color }}
      onClick={() => data.onClick?.(entity)}
    >
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="source" position={Position.Left} id="source-left" />

      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: entity.color }}
        >
          {entity.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate leading-tight">
            {entity.name}
          </h3>
          {mentionCount > 0 && (
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {mentionCount} verse{mentionCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {entity.description && (
        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
          {entity.description}
        </p>
      )}

      {/* Hover Actions */}
      <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); data.onEdit?.(entity); }}
          className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          title="Edit person"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); data.onDelete?.(entity.id); }}
          className="p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="Delete person"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  );
}

PersonNodeComponent.displayName = 'PersonNode';
export default memo(PersonNodeComponent);
export type { PersonNodeData };
