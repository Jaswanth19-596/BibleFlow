import { useState } from 'react';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';
import { ConnectionType } from '@/lib/types';

interface ConnectionPopoverProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { type: ConnectionType; label: string | null }) => void;
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
  initialType = 'references',
  initialLabel = null,
}: ConnectionPopoverProps) {
  const [type, setType] = useState<ConnectionType>(initialType);
  const [label, setLabel] = useState(initialLabel || '');

  if (!open) return null;

  const handleSave = () => {
    onSave({ type, label: label.trim() || null });
    onClose();
  };

  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64">
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

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
