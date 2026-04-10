import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Verse } from '@/lib/types';
import { formatVerseRef } from '@/lib/bibleBooks';
import { VERSE_TYPE_COLORS } from '@/lib/edgeTypes';

export interface AnchorHighlight {
  word: string;  // lowercase, stripped of leading/trailing punctuation
  color: string;
}

interface VerseNodeData {
  verse: Verse;
  onClick?: (verse: Verse) => void;
  onDoubleClick?: (verse: Verse) => void;
  connectionHighlights?: AnchorHighlight[];  // established anchors from DB
  pendingAnchorWord?: string | null;         // word selected but not yet connected
  pendingAnchorColor?: string | null;
  onWordClick?: (verseId: string, word: string) => void;
}

interface VerseNodeProps {
  id: string;
  data: VerseNodeData;
  selected?: boolean;
}

/** Strip leading/trailing punctuation and lowercase for consistent matching */
function cleanWord(token: string): string {
  return token.replace(/^[^a-zA-Z0-9']+|[^a-zA-Z0-9']+$/g, '').toLowerCase();
}

function VerseNodeComponent({ data, selected }: VerseNodeProps) {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const verse = data.verse;
  const borderColor = VERSE_TYPE_COLORS[verse.type] || VERSE_TYPE_COLORS.context;
  const verseRef = formatVerseRef(verse.book, verse.chapter, verse.verse_start, verse.verse_end);

  const highlights = data.connectionHighlights || [];
  const pendingWord = data.pendingAnchorWord ?? null;
  const pendingColor = data.pendingAnchorColor ?? null;

  const handleWordClick = useCallback(
    (e: React.MouseEvent, word: string) => {
      e.stopPropagation(); // don't open verse sidebar
      if (word) data.onWordClick?.(verse.id, word);
    },
    [data, verse.id]
  );

  const renderVerseText = (text: string) => {
    // Split preserving whitespace tokens
    const tokens = text.split(/(\s+)/);

    return tokens.map((token, i) => {
      // Preserve raw whitespace as-is
      if (/^\s+$/.test(token) || token === '') {
        return <span key={i}>{token}</span>;
      }

      const clean = cleanWord(token);
      if (!clean) return <span key={i}>{token}</span>;

      const isPending = pendingWord === clean;
      const highlight = highlights.find(h => h.word === clean);

      // Pending anchor (user clicked this word, not yet linked)
      if (isPending) {
        return (
          <span
            key={i}
            className="cursor-pointer rounded-sm transition-all duration-150 animate-pulse"
            style={{
              backgroundColor: (pendingColor || '#8b5cf6') + '30',
              borderBottom: `2px solid ${pendingColor || '#8b5cf6'}`,
              color: pendingColor || '#8b5cf6',
              fontWeight: 600,
              padding: '0 2px',
            }}
            onClick={(e) => handleWordClick(e, clean)}
            title="Pending anchor — drag a handle to link a verse, or click to deselect"
          >
            {token}
          </span>
        );
      }

      // Established anchor (from DB connection)
      if (highlight) {
        return (
          <span
            key={i}
            className="cursor-pointer rounded-sm transition-all duration-150"
            style={{
              backgroundColor: highlight.color + '22',
              borderBottom: `2px solid ${highlight.color}`,
              color: highlight.color,
              fontWeight: 600,
              padding: '0 2px',
            }}
            onClick={(e) => handleWordClick(e, clean)}
            title={`Word anchored to connection — click to re-anchor`}
          >
            {token}
          </span>
        );
      }

      // Regular word — hoverable to hint clickability
      const isHovered = hoveredWord === clean;
      return (
        <span
          key={i}
          className={`cursor-pointer rounded-sm transition-all duration-100 px-px ${
            isHovered
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
              : ''
          }`}
          onClick={(e) => handleWordClick(e, clean)}
          onMouseEnter={() => setHoveredWord(clean)}
          onMouseLeave={() => setHoveredWord(null)}
          title="Click to anchor this word when creating a connection"
        >
          {token}
        </span>
      );
    });
  };

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

      {/* Verse text with individually clickable words */}
      {verse.text && (
        <p
          className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mb-1"
          style={{ userSelect: 'none' }}
        >
          &ldquo;{renderVerseText(verse.text)}&rdquo;
        </p>
      )}

      {/* Pending anchor badge */}
      {pendingWord && (
        <div
          className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: (pendingColor || '#8b5cf6') + '18',
            border: `1px dashed ${pendingColor || '#8b5cf6'}`,
            color: pendingColor || '#8b5cf6',
          }}
        >
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>&ldquo;{pendingWord}&rdquo; — drag handle to link</span>
        </div>
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
export type { VerseNodeData };
