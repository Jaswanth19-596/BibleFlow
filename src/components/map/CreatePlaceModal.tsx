import { useState, useEffect } from 'react';

interface CreatePlaceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  coord: { lat: number; lng: number } | null;
}

export default function CreatePlaceModal({ open, onClose, onSubmit, coord }: CreatePlaceModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
    }
  }, [open]);

  if (!open || !coord) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(name.trim(), description.trim());
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Add Place</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Coordinates: {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
        </p>

        <label className="block mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Jerusalem"
            autoFocus
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={2}
            className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Add Place'}
          </button>
        </div>
      </form>
    </div>
  );
}
