import { useState } from 'react';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';
import { ConnectionType } from '@/lib/types';
import { ANCHOR_COLOR_PALETTE } from '@/lib/edgeTypes';

interface ConnectionPopoverProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    type: ConnectionType;
    label: string | null;
    anchor_word: string | null;
    anchor_color: string | null;
  }) => void;
  onDelete?: () => void;
  initialType?: ConnectionType;
  initialLabel?: string | null;
  initialAnchorWord?: string | null;
  initialAnchorColor?: string | null;
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
  initialAnchorWord = null,
  initialAnchorColor = null,
}: ConnectionPopoverProps) {
  const [type, setType] = useState<ConnectionType>(initialType);
  const [label, setLabel] = useState(initialLabel || '');
  const [anchorWord, setAnchorWord] = useState<string | null>(initialAnchorWord || null);
  const [anchorColor, setAnchorColor] = useState<string | null>(
    initialAnchorColor || null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!open) return null;

  const handleSave = () => {
    onSave({
      type,
      label: label.trim() || null,
      anchor_word: anchorWord || null,
      anchor_color: anchorColor || null,
    });
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleConfirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  const handleRemoveAnchor = () => {
    setAnchorWord(null);
    setAnchorColor(null);
  };

  return (
    <div className="absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-72">
      {!showDeleteConfirm ? (
        <>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Edit Connection
          </h4>

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

          {/* ── Word Anchor Section ─────────────────────────────── */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Word Anchor
            </label>

            {anchorWord ? (
              <>
                {/* Anchor chip */}
                <div
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg mb-2"
                  style={{
                    backgroundColor: (anchorColor || '#8b5cf6') + '14',
                    border: `1px solid ${anchorColor || '#8b5cf6'}44`,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: anchorColor || '#8b5cf6' }}
                    />
                    <span
                      className="text-sm font-semibold italic truncate"
                      style={{ color: anchorColor || '#8b5cf6' }}
                    >
                      &ldquo;{anchorWord}&rdquo;
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveAnchor}
                    className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove anchor"
                  >
                    ✕ Remove
                  </button>
                </div>

                {/* Color picker swatches */}
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-1.5">
                    Change anchor color
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ANCHOR_COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setAnchorColor(c)}
                        className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${
                          anchorColor === c
                            ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                            : ''
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic py-1">
                No word anchor set.{' '}
                <span className="text-indigo-500 dark:text-indigo-400">
                  Click any word in the verse node
                </span>{' '}
                then drag a handle to create an anchored link.
              </p>
            )}
          </div>

          <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
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
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Delete Connection?
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Are you sure? This will also remove the word anchor from the verse.
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
