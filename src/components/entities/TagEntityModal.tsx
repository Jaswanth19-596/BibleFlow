import { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { Entity, EntityType, EntityMentionContext } from '@/lib/types';
import { useEntities } from '@/hooks/useEntities';
import { ENTITY_TYPE_ICONS, ENTITY_TYPE_LABELS, ENTITY_TYPE_COLORS } from '@/lib/edgeTypes';

interface TagEntityModalProps {
  open: boolean;
  onClose: () => void;
  onTag: (entityId: string, context: EntityMentionContext) => Promise<void>;
  existingEntityIds?: string[];
}

const ENTITY_TYPES: EntityType[] = ['person', 'place', 'nation', 'event', 'object', 'concept'];
const CONTEXT_OPTIONS: { value: EntityMentionContext; label: string }[] = [
  { value: 'mentioned', label: 'Mentioned' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'subject', label: 'Subject' },
  { value: 'addressed', label: 'Addressed' },
  { value: 'location', label: 'Location' },
  { value: 'event_ref', label: 'Event Reference' },
];

export default function TagEntityModal({ open, onClose, onTag, existingEntityIds = [] }: TagEntityModalProps) {
  const { entities, createEntity } = useEntities();
  const [search, setSearch] = useState('');
  const [context, setContext] = useState<EntityMentionContext>('mentioned');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EntityType>('person');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    if (open) {
      setSearch('');
      setContext('mentioned');
      setShowCreateForm(false);
      setNewName('');
      setNewType('person');
      setNewDescription('');
    }
  }, [open]);

  const filteredEntities = entities
    .filter((e) => !existingEntityIds.includes(e.id))
    .filter((e) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.type.includes(q);
    });

  const handleTag = useCallback(async (entity: Entity) => {
    await onTag(entity.id, context);
    onClose();
  }, [onTag, context, onClose]);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const color = ENTITY_TYPE_COLORS[newType];
    const entity = await createEntity({
      name: newName.trim(),
      type: newType,
      description: newDescription.trim(),
      metadata: {},
      color,
      timeline_period_id: null,
      atlas_x: 0,
      atlas_y: 0,
    });
    await onTag(entity.id, context);
    onClose();
  }, [newName, newType, newDescription, context, createEntity, onTag, onClose]);

  return (
    <Modal open={open} onClose={onClose} title="Tag Entity" size="md">
      <div className="space-y-4">
        {/* Context selector */}
        <Select
          label="Role in this verse"
          value={context}
          options={CONTEXT_OPTIONS}
          onChange={(e) => setContext(e.target.value as EntityMentionContext)}
        />

        {/* Search existing entities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Existing Entities
          </label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search (e.g., Isaiah, Jerusalem)..."
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
          {filteredEntities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">
              {search ? 'No matching entities found' : 'No entities yet — create one below'}
            </p>
          ) : (
            filteredEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => handleTag(entity)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <span className="text-base">{ENTITY_TYPE_ICONS[entity.type]}</span>
                <span className="font-medium text-gray-900 dark:text-white flex-1">{entity.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: ENTITY_TYPE_COLORS[entity.type] }}
                >
                  {ENTITY_TYPE_LABELS[entity.type]}
                </span>
                <svg
                  className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            ))
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
          </div>
        </div>

        {/* Create new */}
        {showCreateForm ? (
          <form onSubmit={handleCreate} className="space-y-3 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Create New Entity</h4>
            <Input
              label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., King Hezekiah"
              autoFocus
            />
            <Select
              label="Type"
              value={newType}
              options={ENTITY_TYPES.map((t) => ({
                value: t,
                label: `${ENTITY_TYPE_ICONS[t]} ${ENTITY_TYPE_LABELS[t]}`,
              }))}
              onChange={(e) => setNewType(e.target.value as EntityType)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g., 13th king of Judah, son of Ahaz..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!newName.trim()}>
                Create & Tag
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setShowCreateForm(true);
              setNewName(search);
            }}
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New Entity
          </Button>
        )}
      </div>
    </Modal>
  );
}
