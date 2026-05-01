import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { EntityRelationship } from '@/lib/types';

interface EditRelationshipModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (updates: { type: string; description: string }) => void;
  onDelete?: () => void;
  relationship: EntityRelationship | null;
  sourceName?: string;
  targetName?: string;
}

const QUICK_TYPES = [
  'father of', 'mother of', 'son of', 'daughter of',
  'married to', 'sibling of', 'king of', 'prophet to',
];

export default function EditRelationshipModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  relationship,
  sourceName,
  targetName,
}: EditRelationshipModalProps) {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open && relationship) {
      setType(relationship.type.replace(/-/g, ' '));
      setDescription(relationship.description || '');
    }
  }, [open, relationship]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type.trim()) return;
    
    onSubmit({
      type: type.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim(),
    });
    
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this relationship?')) {
      onDelete();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Relationship" size="md">
      <div className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
        <span className="font-bold text-gray-900 dark:text-white">{sourceName}</span>
        {' → '}
        <span className="font-bold text-gray-900 dark:text-white">{targetName}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Relationship Type
          </label>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            {QUICK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  type === t 
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="or type a custom relationship..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context about this relationship..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            rows={2}
          />
        </div>

        <div className="flex justify-between items-center pt-2 mt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="danger" onClick={handleDelete} className="text-xs py-1.5 px-3">
            Delete Relationship
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!type.trim()}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
