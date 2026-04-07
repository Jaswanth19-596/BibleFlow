import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Verse } from '@/lib/types';
import { formatVerseRef } from '@/lib/bibleBooks';
import { VERSE_TYPE_COLORS } from '@/lib/edgeTypes';

interface VerseNodeProps {
  id: string;
  data: {
    verse: Verse;
    selected?: boolean;
    onClick?: (verse: Verse) => void;
    onDoubleClick?: (verse: Verse) => void;
  };
  selected?: boolean;
}

function VerseNodeComponent({ data, selected }: VerseNodeProps) {
  const verse = data.verse;
  const borderColor = VERSE_TYPE_COLORS[verse.type] || VERSE_TYPE_COLORS.context;

  const verseRef = formatVerseRef(verse.book, verse.chapter, verse.verse_start, verse.verse_end);

  return (
    <div
      className={`verse-node ${selected ? 'selected' : ''}`}
      style={{ borderColor }}
      onClick={() => data.onClick?.(verse)}
      onDoubleClick={() => data.onDoubleClick?.(verse)}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} />

      {/* Header: Verse reference + Type badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {verseRef}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full text-white font-medium flex-shrink-0"
          style={{ backgroundColor: borderColor }}
        >
          {verse.type}
        </span>
      </div>

      {/* Verse text */}
      {verse.text && (
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-1">
          "{verse.text}"
        </p>
      )}

      {/* User note */}
      {verse.note && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Note: {verse.note}
          </p>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

VerseNodeComponent.displayName = 'VerseNode';

export default memo(VerseNodeComponent);
