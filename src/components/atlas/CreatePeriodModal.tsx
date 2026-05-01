import { useState } from 'react';

interface CreatePeriodModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; color: string; sort_order: number }) => void;
  nextSortOrder: number;
  editingPeriod?: { id: string; name: string; color: string; sort_order: number } | null;
  onDelete?: (id: string) => void;
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
}: CreatePeriodModalProps) {
  const [name, setName] = useState(editingPeriod?.name || '');
  const [color, setColor] = useState(editingPeriod?.color || '#6366f1');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      color,
      sort_order: editingPeriod?.sort_order ?? nextSortOrder,
    });
    setName('');
    setColor('#6366f1');
    onClose();
  };

  const isEditing = !!editingPeriod;

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
