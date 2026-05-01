import { useState, useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Entity } from '@/lib/types';
import { ENTITY_TYPE_COLORS } from '@/lib/edgeTypes';

interface CreatePersonModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; color: string }) => void;
  editingPerson?: Entity | null;
}

export default function CreatePersonModal({ open, onClose, onSubmit, editingPerson }: CreatePersonModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (open) {
      setName(editingPerson?.name || '');
      setDescription(editingPerson?.description || '');
    }
  }, [open, editingPerson]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Default person color
    const color = editingPerson?.color || ENTITY_TYPE_COLORS['person'];

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
    });
    
    onClose();
  };

  const isEditing = !!editingPerson;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Person' : 'Create Person'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. David, Isaiah, Ruth"
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
            placeholder="A brief note about this person..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {isEditing ? 'Save Changes' : 'Create Person'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
