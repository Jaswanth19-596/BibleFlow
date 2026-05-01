import { Entity, EntityMentionWithVerse } from '@/lib/types';
import { useEntityMentions } from '@/hooks/useEntityMentions';
import { useEntities } from '@/hooks/useEntities';
import { formatVerseRef } from '@/lib/bibleBooks';
import { ENTITY_TYPE_COLORS, ENTITY_TYPE_ICONS, ENTITY_TYPE_LABELS } from '@/lib/edgeTypes';
import { getEntityRelationships } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

interface EntityDetailSidebarProps {
  entity: Entity;
  onClose: () => void;
}

export default function EntityDetailSidebar({ entity, onClose }: EntityDetailSidebarProps) {
  const navigate = useNavigate();
  const { mentions, loading: mentionsLoading } = useEntityMentions(entity.id);
  const { entities } = useEntities();
  const color = ENTITY_TYPE_COLORS[entity.type] || '#8b5cf6';
  const icon = ENTITY_TYPE_ICONS[entity.type] || '🏷️';

  const { data: relationships = [] } = useQuery({
    queryKey: ['entity-relationships', entity.id],
    queryFn: () => getEntityRelationships(entity.id),
    enabled: !!entity.id,
  });

  // Group mentions by topic
  const mentionsByTopic = mentions.reduce<Record<string, { topicName: string; topicColor: string; items: EntityMentionWithVerse[] }>>((acc, m) => {
    const topicName = m.topic_name || 'Unknown Topic';
    const topicColor = m.topic_color || '#6b7280';
    if (!acc[topicName]) {
      acc[topicName] = { topicName, topicColor, items: [] };
    }
    acc[topicName].items.push(m);
    return acc;
  }, {});

  const handleNavigateToVerse = (verseTopicId: string) => {
    navigate(`/topic/${verseTopicId}`);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{entity.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {ENTITY_TYPE_LABELS[entity.type]}
        </span>
        {entity.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{entity.description}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Relationships */}
        {relationships.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Relationships
            </h3>
            <div className="space-y-1.5">
              {relationships.map((rel) => {
                const isFrom = rel.from_entity_id === entity.id;
                const otherEntityId = isFrom ? rel.to_entity_id : rel.from_entity_id;
                const otherEntity = entities.find((e) => e.id === otherEntityId);
                if (!otherEntity) return null;
                return (
                  <div
                    key={rel.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm"
                  >
                    <span className="text-gray-500 dark:text-gray-400 capitalize">{rel.type.replace(/-/g, ' ')}</span>
                    <span className="text-xs">{ENTITY_TYPE_ICONS[otherEntity.type]}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{otherEntity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Verse mentions grouped by topic */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Verse Mentions ({mentions.length})
          </h3>

          {mentionsLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : mentions.length === 0 ? (
            <p className="text-sm text-gray-400">Not mentioned in any verses yet</p>
          ) : (
            <div className="space-y-3">
              {Object.values(mentionsByTopic).map(({ topicName, topicColor, items }) => (
                <div key={topicName}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: topicColor }}
                    />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {topicName}
                    </span>
                  </div>
                  <div className="space-y-1 ml-4">
                    {items.map((m) => {
                      if (!m.verse) return null;
                      const ref = formatVerseRef(m.verse.book, m.verse.chapter, m.verse.verse_start, m.verse.verse_end);
                      return (
                        <button
                          key={m.id}
                          onClick={() => handleNavigateToVerse(m.verse!.topic_id)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{ref}</span>
                            <span className="text-xs text-gray-400 capitalize">{m.context.replace('_', ' ')}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {m.verse.text}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
