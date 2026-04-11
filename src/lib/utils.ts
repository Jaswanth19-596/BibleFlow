export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Builds a composite key for a word anchor capturing its occurrence index to handle duplicate words in a verse.
 * Example: buildAnchorKey('the', 2) -> '2:the'
 */
export function buildAnchorKey(cleanWord: string, occurrenceIndex: number): string {
  return `${occurrenceIndex}:${cleanWord}`;
}

/**
 * Parses an anchor key back into its occurrence index and word.
 * Falls back to matching all (-1) if it's an old legacy anchor without an index.
 */
export function parseAnchorKey(anchorKey: string | null): { index: number; word: string } | null {
  if (!anchorKey) return null;
  const match = anchorKey.match(/^(\d+):(.*)$/);
  if (match) {
    return { index: parseInt(match[1], 10), word: match[2] };
  }
  return { index: -1, word: anchorKey }; // Legacy fallback
}
