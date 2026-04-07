import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Topic } from '@/lib/types';

interface EditTopicModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string }) => void;
  topic: Topic | null;
}

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f59e0b', // amber
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6b7280', // gray
];

export default function EditTopicModal({ open, onClose, onSubmit, topic }: EditTopicModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [customColor, setCustomColor] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setDescription(topic.description || '');
      setColor(topic.color);
      setCustomColor('');
      setError('');
    }
  }, [topic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Topic name is required');
      return;
    }
    const finalColor = customColor || color;
    onSubmit({ name: name.trim(), description: description.trim(), color: finalColor });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!topic) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Edit Topic" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Topic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Faith, Redemption, Love"
          error={error}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this topic about?"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setCustomColor('');
                }}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  color === c && !customColor ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor || color}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <Input
              value={customColor || color}
              onChange={(e) => setCustomColor(e.target.value)}
              placeholder="#6366f1"
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
