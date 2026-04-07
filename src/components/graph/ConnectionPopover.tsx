import { useState } from 'react';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';
import { ConnectionType } from '@/lib/types';

interface ConnectionPopoverProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { type: ConnectionType; label: string | null }) => void;
  onDelete?: () => void;
  initialType?: ConnectionType;
  initialLabel?: string | null;
}

const CONNECTION_TYPES: { value: ConnectionType; label: string }[] = [
  { value: 'supports', label: 'Supports' },
  { value: 'contrasts', label: 'Contrasts' },
  { value: 'explains', label: 'Explains' },
  { value: 'fulfills', label: 'Fulfills' },
  { value: 'references', label: 'References' },
];

export default function ConnectionPopover({
  open,
  onClose,
  onSave,
  onDelete,
  initialType = 'references',
  initialLabel = null,
}: ConnectionPopoverProps) {
  const [type, setType] = useState<ConnectionType>(initialType);
  const [label, setLabel] = useState(initialLabel || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    onSave({ type, label: label.trim() || null });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72">
      {!showDeleteConfirm ? (
        <>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Edit Connection</h4>

          <Select
            label="Type"
            value={type}
            options={CONNECTION_TYPES}
            onChange={(e) => setType(e.target.value as ConnectionType)}
          />

          <div className="mt-3">
            <Input
              label="Label (optional)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Custom label..."
            />
          </div>

          <div className="flex justify-between gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Delete Connection?</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to delete this connection? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
