import { Entity, EntityMentionWithEntity } from '@/lib/types';
import EntityTag from './EntityTag';

interface EntityChipBarProps {
  mentions: EntityMentionWithEntity[];
  onEntityClick?: (entity: Entity) => void;
  onRemoveMention?: (mentionId: string) => void;
  onAddClick?: () => void;
}

export default function EntityChipBar({ mentions, onEntityClick, onRemoveMention, onAddClick }: EntityChipBarProps) {
  const validMentions = mentions.filter((m) => m.entity);

  if (validMentions.length === 0 && !onAddClick) return null;

  return (
    <div className="entity-chip-bar mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-700/50">
      <div className="flex items-center flex-wrap gap-1">
        {validMentions.map((mention) => (
          <EntityTag
            key={mention.id}
            entity={mention.entity!}
            compact
            onClick={() => onEntityClick?.(mention.entity!)}
            onRemove={onRemoveMention ? () => onRemoveMention(mention.id) : undefined}
          />
        ))}
        {onAddClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick();
            }}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all duration-150"
            title="Tag an entity"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
