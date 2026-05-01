import { Entity } from '@/lib/types';
import { ENTITY_TYPE_COLORS, ENTITY_TYPE_ICONS } from '@/lib/edgeTypes';

interface EntityTagProps {
  entity: Entity;
  onClick?: (entity: Entity) => void;
  onRemove?: () => void;
  compact?: boolean;
}

export default function EntityTag({ entity, onClick, onRemove, compact }: EntityTagProps) {
  const color = ENTITY_TYPE_COLORS[entity.type] || '#8b5cf6';
  const icon = ENTITY_TYPE_ICONS[entity.type] || '🏷️';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-150 cursor-pointer group ${
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
      style={{
        backgroundColor: color + '18',
        color: color,
        border: `1px solid ${color}30`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(entity);
      }}
      title={`${entity.type}: ${entity.name}`}
    >
      <span className={compact ? 'text-[9px]' : 'text-[11px]'}>{icon}</span>
      <span className="truncate max-w-[80px]">{entity.name}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
          title="Remove tag"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
