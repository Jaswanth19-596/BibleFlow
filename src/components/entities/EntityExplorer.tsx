import { useState } from 'react';
import { useEntities } from '@/hooks/useEntities';
import { Entity, EntityType } from '@/lib/types';
import { ENTITY_TYPE_COLORS, ENTITY_TYPE_ICONS, ENTITY_TYPE_LABELS } from '@/lib/edgeTypes';
import { useDebounce } from '@/hooks/useDebounce';
import EntityDetailSidebar from './EntityDetailSidebar';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const ALL_TYPES: EntityType[] = ['person', 'place', 'nation', 'event', 'object', 'concept'];

export default function EntityExplorer() {
  const { entities, loading, deleteEntity } = useEntities();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Entity | null>(null);

  const filtered = entities.filter((e) => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Group by type
  const grouped = filtered.reduce<Record<EntityType, Entity[]>>((acc, e) => {
    if (!acc[e.type]) acc[e.type] = [];
    acc[e.type].push(e);
    return acc;
  }, {} as Record<EntityType, Entity[]>);

  const typeCounts = ALL_TYPES.map((t) => ({
    type: t,
    count: entities.filter((e) => e.type === t).length,
  }));

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteEntity(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedEntity?.id === deleteTarget.id) setSelectedEntity(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading entities...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Entity Explorer</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {entities.length} entities across your Bible study
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              id="entity-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Type filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterType === 'all'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              All ({entities.length})
            </button>
            {typeCounts.map(({ type, count }) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  filterType === type
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
                style={filterType === type ? { backgroundColor: ENTITY_TYPE_COLORS[type] } : undefined}
              >
                <span className="text-[11px]">{ENTITY_TYPE_ICONS[type]}</span>
                {ENTITY_TYPE_LABELS[type]} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entity Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No entities found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Tag entities from within your topic graphs to build your library
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {(filterType === 'all' ? ALL_TYPES : [filterType]).map((type) => {
              const items = grouped[type];
              if (!items || items.length === 0) return null;
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{ENTITY_TYPE_ICONS[type]}</span>
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      {ENTITY_TYPE_LABELS[type]}s
                    </h2>
                    <span className="text-xs text-gray-400">({items.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {items.map((entity) => (
                      <EntityCard
                        key={entity.id}
                        entity={entity}
                        onClick={() => setSelectedEntity(entity)}
                        onDelete={() => setDeleteTarget(entity)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Entity Detail Sidebar */}
      {selectedEntity && (
        <EntityDetailSidebar
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Entity"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All mentions of this entity will also be removed.`}
        confirmText="Delete"
      />
    </div>
  );
}

// ─── Entity Card ──────────────────────────────────────────────────────────────

interface EntityCardProps {
  entity: Entity;
  onClick: () => void;
  onDelete: () => void;
}

function EntityCard({ entity, onClick, onDelete }: EntityCardProps) {
  const color = ENTITY_TYPE_COLORS[entity.type] || '#8b5cf6';
  const icon = ENTITY_TYPE_ICONS[entity.type] || '🏷️';

  return (
    <div
      onClick={onClick}
      className="group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all"
        title="Delete entity"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>

      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg text-lg flex-shrink-0"
          style={{ backgroundColor: color + '18' }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{entity.name}</h3>
          {entity.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{entity.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
