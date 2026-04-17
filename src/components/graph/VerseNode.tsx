import { memo, useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Verse } from '@/lib/types';
import { formatVerseRef } from '@/lib/bibleBooks';
import { VERSE_TYPE_COLORS } from '@/lib/edgeTypes';
import { parseAnchorKey, buildAnchorKey } from '@/lib/utils';

export interface AnchorHighlight {
  word: string;  // lowercase, stripped of leading/trailing punctuation
  color: string;
}

interface VerseNodeData {
  verse: Verse;
  onClick?: (verse: Verse) => void;
  onDoubleClick?: (verse: Verse) => void;
  connectionHighlights?: AnchorHighlight[];  // established anchors from DB (raw anchorKey strings stored in 'word')
  pendingAnchorWord?: string | null;         // word anchor key selected but not yet connected
  pendingAnchorColor?: string | null;
  onWordClick?: (verseId: string, word: string) => void;
  searchQuery?: string | null;               // text to highlight within this node
  isSearchMatch?: boolean;                   // true if this node matches the search
  isSearchDimmed?: boolean;                  // true if search is active but this node doesn't match
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
  const searchQuery = data.searchQuery?.trim().toLowerCase() || '';
  const isSearchMatch = data.isSearchMatch ?? false;
  const isSearchDimmed = data.isSearchDimmed ?? false;

  const highlights = data.connectionHighlights || [];
  const pendingAnchorKey = data.pendingAnchorWord ?? null;
  const pendingColor = data.pendingAnchorColor ?? null;

  const handleWordClick = useCallback(
    (e: React.MouseEvent, anchorKey: string) => {
      e.stopPropagation(); // don't open verse sidebar
      if (anchorKey) data.onWordClick?.(verse.id, anchorKey);
    },
    [data, verse.id]
  );

  /** Returns segments of `text` split around all case-insensitive occurrences of `query` */
  const splitByQuery = (text: string, query: string): { segment: string; match: boolean }[] => {
    if (!query) return [{ segment: text, match: false }];
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part) => ({ segment: part, match: part.toLowerCase() === query.toLowerCase() }));
  };

  const renderVerseText = (text: string) => {
    // If there is a search query, we do a simpler segment-based render with highlights
    if (searchQuery) {
      const segments = splitByQuery(text, searchQuery);
      return segments.map((seg, i) =>
        seg.match ? (
          <mark
            key={i}
            className="search-highlight"
            style={{
              backgroundColor: '#fbbf24',
              color: '#1c1917',
              borderRadius: '2px',
              padding: '0 1px',
              fontWeight: 700,
            }}
          >
            {seg.segment}
          </mark>
        ) : (
          <span key={i}>{seg.segment}</span>
        )
      );
    }

    // Split preserving whitespace tokens
    const tokens = text.split(/(\s+)/);
    const wordCounts = new Map<string, number>();

    return tokens.map((token, i) => {
      // Preserve raw whitespace as-is
      if (/^\s+$/.test(token) || token === '') {
        return <span key={i}>{token}</span>;
      }

      const clean = cleanWord(token);
      if (!clean) return <span key={i}>{token}</span>;

      const occurrence = wordCounts.get(clean) || 0;
      wordCounts.set(clean, occurrence + 1);

      const anchorKey = buildAnchorKey(clean, occurrence);
      const isPending = pendingAnchorKey === anchorKey || pendingAnchorKey === clean; // match pure format for legacy pending
      
      const highlight = highlights.find(h => {
        const parsed = parseAnchorKey(h.word);
        if (!parsed) return false;
        // if legacy anchor (-1), match all instances of the word. Otherwise exact match index and word.
        if (parsed.index === -1) {
          return parsed.word === clean;
        }
        return parsed.index === occurrence && parsed.word === clean;
      });

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
            onClick={(e) => handleWordClick(e, anchorKey)}
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
            onClick={(e) => handleWordClick(e, anchorKey)}
            title={`Word anchored to connection — click to re-anchor`}
          >
            {token}
          </span>
        );
      }

      // Regular word — hoverable to hint clickability
      const isHovered = hoveredWord === anchorKey;
      return (
        <span
          key={i}
          className={`cursor-pointer rounded-sm transition-all duration-100 px-px ${
            isHovered
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
              : ''
          }`}
          onClick={(e) => handleWordClick(e, anchorKey)}
          onMouseEnter={() => setHoveredWord(anchorKey)}
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
      className={`verse-node ${
        selected ? 'selected' : ''
      } ${
        isSearchMatch ? 'search-match' : isSearchDimmed ? 'search-dimmed' : ''
      }`}
      style={{ borderColor }}
      onClick={() => data.onClick?.(verse)}
      onDoubleClick={() => data.onDoubleClick?.(verse)}
    >
      {/* All 4 sides have both source and target handles for flexible connections */}
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="source" position={Position.Left} id="source-left" />

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
      {pendingAnchorKey && (
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
          <span>&ldquo;{parseAnchorKey(pendingAnchorKey)?.word || pendingAnchorKey}&rdquo; — drag handle to link</span>
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

      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="source" position={Position.Right} id="source-right" />
    </div>
  );
}

VerseNodeComponent.displayName = 'VerseNode';

export default memo(VerseNodeComponent);
export type { VerseNodeData };
