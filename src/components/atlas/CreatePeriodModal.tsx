import { useState } from 'react';
import { TimelinePeriod } from '@/lib/types';

interface CreatePeriodModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string; sort_order: number }) => void;
  nextSortOrder: number;
  editingPeriod?: TimelinePeriod | null;
  onDelete?: (id: string) => void;
  allPeriods: TimelinePeriod[];
  onReorder?: (orderedIds: { id: string; sort_order: number }[]) => void;
}

const COLOR_PRESETS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#ef4444', '#f97316', '#eab308', '#f59e0b',
  '#22c55e', '#10b981', '#14b8a6', '#0ea5e9',
  '#3b82f6', '#6b7280', '#78716c', '#dc2626',
];

export default function CreatePeriodModal({
  open,
  onClose,
  onSubmit,
  nextSortOrder,
  editingPeriod,
  onDelete,
  allPeriods,
  onReorder,
}: CreatePeriodModalProps) {
  const [name, setName] = useState(editingPeriod?.name || '');
  const [color, setColor] = useState(editingPeriod?.color || '#6366f1');
  // -1 means "at the end", otherwise it's the index to insert AFTER
  const [insertAfterIndex, setInsertAfterIndex] = useState<number>(-1);

  if (!open) return null;

  const isEditing = !!editingPeriod;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let sort_order: number;
    if (isEditing) {
      sort_order = editingPeriod!.sort_order;
    } else if (insertAfterIndex === -2) {
      // Insert at the beginning
      sort_order = 0;
      // Shift all existing periods up by 1
      if (onReorder && allPeriods.length > 0) {
        onReorder(allPeriods.map((p, i) => ({ id: p.id, sort_order: i + 1 })));
      }
    } else if (insertAfterIndex === -1 || insertAfterIndex >= allPeriods.length - 1) {
      // Append at the end
      sort_order = nextSortOrder;
    } else {
      // Insert after the period at insertAfterIndex
      // Shift all periods after insertAfterIndex up by 1
      sort_order = insertAfterIndex + 1;
      if (onReorder && allPeriods.length > 0) {
        const toShift = allPeriods
          .filter((_, i) => i > insertAfterIndex)
          .map((p, offset) => ({ id: p.id, sort_order: insertAfterIndex + 2 + offset }));
        if (toShift.length > 0 && onReorder) onReorder(toShift);
      }
    }

    onSubmit({
      name: name.trim(),
      color,
      sort_order,
    });
    setName('');
    setColor('#6366f1');
    setInsertAfterIndex(-1);
    onClose();
  };

  // Move the editing period one step up (lower sort_order)
  const handleMoveUp = () => {
    if (!editingPeriod || !onReorder) return;
    const sorted = [...allPeriods].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((p) => p.id === editingPeriod.id);
    if (idx <= 0) return;
    // Swap sort_orders with the period above
    const swapped = sorted.map((p, i) => {
      if (i === idx - 1) return { id: p.id, sort_order: sorted[idx].sort_order };
      if (i === idx) return { id: p.id, sort_order: sorted[idx - 1].sort_order };
      return { id: p.id, sort_order: p.sort_order };
    });
    onReorder(swapped);
    onClose();
  };

  // Move the editing period one step down (higher sort_order)
  const handleMoveDown = () => {
    if (!editingPeriod || !onReorder) return;
    const sorted = [...allPeriods].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((p) => p.id === editingPeriod.id);
    if (idx < 0 || idx >= sorted.length - 1) return;
    const swapped = sorted.map((p, i) => {
      if (i === idx) return { id: p.id, sort_order: sorted[idx + 1].sort_order };
      if (i === idx + 1) return { id: p.id, sort_order: sorted[idx].sort_order };
      return { id: p.id, sort_order: p.sort_order };
    });
    onReorder(swapped);
    onClose();
  };

  const sortedPeriods = [...allPeriods].sort((a, b) => a.sort_order - b.sort_order);
  const editingIdx = isEditing ? sortedPeriods.findIndex((p) => p.id === editingPeriod!.id) : -1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {isEditing ? 'Edit Period' : 'New Timeline Period'}
            </h2>

            {/* Name */}
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Period Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Patriarchs"
              autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />

            {/* Color */}
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 mt-4">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Preview */}
            <div
              className="mt-4 px-3 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: color + '12', color, border: `1.5px solid ${color}30` }}
            >
              {name || 'Preview'}
            </div>

            {/* Insert Position (only when creating) */}
            {!isEditing && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Insert Position
                </label>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-1">
                  {/* At the beginning */}
                  <button
                    type="button"
                    onClick={() => setInsertAfterIndex(-2)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      insertAfterIndex === -2
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    ↑ At the beginning
                  </button>

                  {/* After each existing period */}
                  {sortedPeriods.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setInsertAfterIndex(i)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                        insertAfterIndex === i
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      After: {p.name}
                    </button>
                  ))}

                  {/* At the end (default) */}
                  <button
                    type="button"
                    onClick={() => setInsertAfterIndex(-1)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      insertAfterIndex === -1
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    ↓ At the end {sortedPeriods.length > 0 ? '(default)' : ''}
                  </button>
                </div>
              </div>
            )}

            {/* Move Up / Down (only when editing and there are multiple periods) */}
            {isEditing && sortedPeriods.length > 1 && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                  Reorder
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleMoveUp}
                    disabled={editingIdx <= 0}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                    Move Up
                  </button>
                  <button
                    type="button"
                    onClick={handleMoveDown}
                    disabled={editingIdx >= sortedPeriods.length - 1}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Move Down
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => { onDelete(editingPeriod!.id); onClose(); }}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Delete Period
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
