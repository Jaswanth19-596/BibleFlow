import { useState, useMemo } from 'react';
import { Entity, EntityRelationship } from '@/lib/types';

interface CreateRelationshipModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<EntityRelationship, 'id' | 'created_at'>) => void;
  people: Entity[];
  existingRelationships: EntityRelationship[];
  preselectedFrom?: string | null;
  preselectedTo?: string | null;
}

const SUGGESTED_TYPES = [
  'father of', 'mother of', 'son of', 'daughter of',
  'married to', 'sibling of', 'brother of', 'sister of',
  'grandfather of', 'grandson of',
  'prophet to', 'king of', 'servant of',
  'succeeded by', 'preceded by',
  'mentor of', 'disciple of',
  'enemy of', 'ally of',
  'contemporary of', 'related to',
];

export default function CreateRelationshipModal({
  open,
  onClose,
  onSubmit,
  people,
  existingRelationships,
  preselectedFrom,
  preselectedTo,
}: CreateRelationshipModalProps) {
  const [fromId, setFromId] = useState(preselectedFrom || '');
  const [toId, setToId] = useState(preselectedTo || '');
  const [relType, setRelType] = useState('');
  const [description, setDescription] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Collect all unique relationship types used so far
  const usedTypes = useMemo(() => {
    const set = new Set(existingRelationships.map((r) => r.type));
    SUGGESTED_TYPES.forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [existingRelationships]);

  const filteredSuggestions = useMemo(() => {
    if (!relType.trim()) return usedTypes;
    return usedTypes.filter((t) => t.toLowerCase().includes(relType.toLowerCase()));
  }, [relType, usedTypes]);

  if (!open) return null;

  const fromPerson = people.find((p) => p.id === fromId);
  const toPerson = people.find((p) => p.id === toId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromId || !toId || !relType.trim() || fromId === toId) return;
    onSubmit({
      from_entity_id: fromId,
      to_entity_id: toId,
      type: relType.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim(),
    });
    setFromId('');
    setToId('');
    setRelType('');
    setDescription('');
    onClose();
  };

  const isValid = fromId && toId && fromId !== toId && relType.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Create Relationship
            </h2>

            {/* From */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                From
              </label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Select a person...</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Relationship type with autocomplete */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Relationship
              </label>
              <input
                type="text"
                value={relType}
                onChange={(e) => { setRelType(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. father of"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {filteredSuggestions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onMouseDown={() => { setRelType(t); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* To */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                To
              </label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Select a person...</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            {fromPerson && toPerson && relType && (
              <div className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{fromPerson.name}</span>
                {' '}
                <span className="text-gray-400">{relType}</span>
                {' '}
                <span className="font-semibold">{toPerson.name}</span>
              </div>
            )}

            {/* Description (optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Notes <span className="font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Any additional context..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
