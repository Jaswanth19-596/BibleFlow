import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { Verse, VerseType } from '@/lib/types';
import { BIBLE_BOOKS, validateVerseRange, getVersesInChapter } from '@/lib/bibleBooks';
import { VERSE_TYPE_COLORS } from '@/lib/edgeTypes';
import { fetchKjvVerseRange, fetchKjvCustomVerses, VerseSelection } from '@/lib/bibleApi';

interface VerseSidebarProps {
  verse?: Verse | null;
  onSave: (data: {
    book: string;
    chapter: number;
    verse_start: number;
    verse_end: number | null;
    text: string;
    note: string;
    type: VerseType;
  }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const VERSE_TYPES: { value: VerseType; label: string }[] = [
  { value: 'main', label: 'Main' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'contrast', label: 'Contrast' },
  { value: 'context', label: 'Context' },
];

/**
 * Try to extract a bible book name or abbreviation from the start of the input.
 * Returns the matching book full name and the remaining string.
 */
function extractBookPrefix(input: string): { bookName?: string; remaining: string } {
  const trimmed = input.trim();
  
  // Sort books by name/abbrev length descending to prevent partial matches (e.g., '1 John' matching '1')
  const sortedBooks = [...BIBLE_BOOKS].sort((a, b) => {
    const lenA = Math.max(a.name.length, a.abbrev.length);
    const lenB = Math.max(b.name.length, b.abbrev.length);
    return lenB - lenA;
  });

  for (const b of sortedBooks) {
    const namePattern = new RegExp(`^${b.name}\\b`, 'i');
    const abbrevPattern = new RegExp(`^${b.abbrev}\\b`, 'i');

    if (namePattern.test(trimmed)) {
      return { bookName: b.name, remaining: trimmed.replace(namePattern, '').trim() };
    }
    if (abbrevPattern.test(trimmed)) {
      return { bookName: b.name, remaining: trimmed.replace(abbrevPattern, '').trim() };
    }
  }

  return { remaining: trimmed };
}

/**
 * Parse a custom verse selection string like "1:1, 1:3, 2:2, 5:1-5, 10:21-25"
 * optionally prefixed with a book name, like "Genesis 1:1, 1:3, 2:2, 5:1-5, 10:21-25"
 * Returns an array of VerseSelection objects and optional parsedBook, or an error string.
 */
function parseCustomVerseInput(
  input: string
): { ok: true; selections: VerseSelection[]; parsedBook?: string } | { ok: false; error: string } {
  const { bookName, remaining } = extractBookPrefix(input);
  const raw = remaining.trim();
  if (!raw) return { ok: false, error: 'Please enter at least one verse reference.' };

  const parts = raw.split(/\s*,\s*/);
  const selections: VerseSelection[] = [];

  for (const part of parts) {
    const p = part.trim();
    if (!p) continue;

    // Clean up spaces within reference, e.g. " 5 : 1 - 5 " -> "5:1-5"
    const cleanPart = p.replace(/\s+/g, '');

    // Match patterns like: 1:1, 1:1-3
    const rangeMatch = cleanPart.match(/^(\d+):(\d+)(?:-(\d+))?$/);
    if (!rangeMatch) {
      return { ok: false, error: `Invalid reference "${p}". Use format ch:v or ch:v-v (e.g. 3:16, 5:1-5).` };
    }

    const chapter = parseInt(rangeMatch[1], 10);
    const verseStart = parseInt(rangeMatch[2], 10);
    const verseEnd = rangeMatch[3] ? parseInt(rangeMatch[3], 10) : verseStart;

    if (verseEnd < verseStart) {
      return { ok: false, error: `In "${p}", end verse must be ≥ start verse.` };
    }

    selections.push({ chapter, verseStart, verseEnd });
  }

  if (selections.length === 0) {
    return { ok: false, error: 'No valid references found.' };
  }

  return { ok: true, selections, parsedBook: bookName };
}



export default function VerseSidebar({ verse, onSave, onDelete, onClose }: VerseSidebarProps) {
  // Detect if this is a custom verse (chapter === 0)
  const isCustomVerse = verse?.chapter === 0;

  const [mode, setMode] = useState<'standard' | 'custom'>(isCustomVerse ? 'custom' : 'standard');

  // ── Standard mode state ──────────────────────────────────────────────────
  const [book, setBook] = useState(verse?.book || 'John');
  const [chapter, setChapter] = useState(isCustomVerse ? '3' : (verse?.chapter?.toString() || '3'));
  const [verseStart, setVerseStart] = useState(isCustomVerse ? '16' : (verse?.verse_start?.toString() || '16'));
  const [verseEnd, setVerseEnd] = useState(
    !isCustomVerse && verse?.verse_end ? verse.verse_end.toString() : ''
  );

  // ── Custom mode state ────────────────────────────────────────────────────
  // Try to reconstruct a custom ref string from existing verse data
  const [customInput, setCustomInput] = useState<string>(() => {
    if (!isCustomVerse || !verse?.text) return '';
    // Parse [ch:v] markers from text to reconstruct the ref list
    const lines = verse.text.split('\n');
    const refs = lines
      .map((line) => {
        const m = line.match(/^\[(\d+):(\d+)\]/);
        return m ? `${m[1]}:${m[2]}` : null;
      })
      .filter(Boolean);
    // Collapse consecutive single-chapter ranges back into range notation
    return refs.join(', ');
  });
  const [customError, setCustomError] = useState('');

  // ── Shared state ─────────────────────────────────────────────────────────
  const [verseText, setVerseText] = useState(verse?.text || '');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [note, setNote] = useState(verse?.note || '');
  const [type, setType] = useState<VerseType>(verse?.type || 'main');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBook = BIBLE_BOOKS.find((b) => b.name === book);
  const maxChapter = selectedBook?.chapters || 0;
  const maxVerse = chapter ? getVersesInChapter(book, parseInt(chapter) || 1) || 0 : 0;

  // ── Fetch text for STANDARD mode ─────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'standard') return;

    const chapterNum = parseInt(chapter);
    const verseStartNum = parseInt(verseStart);
    const verseEndNum = verseEnd ? parseInt(verseEnd) : null;

    if (!book || !chapter || isNaN(chapterNum) || isNaN(verseStartNum)) return;

    const verseValidation = validateVerseRange(book, chapterNum, verseStartNum, verseEndNum);
    if (!verseValidation.valid) return;

    setIsLoadingText(true);
    fetchKjvVerseRange(book, chapterNum, verseStartNum, verseEndNum)
      .then((text) => setVerseText(text ?? ''))
      .catch(() => setVerseText(''))
      .finally(() => setIsLoadingText(false));
  }, [mode, book, chapter, verseStart, verseEnd]);

  // ── Fetch text for CUSTOM mode ───────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'custom') return;
    if (!customInput.trim()) {
      setVerseText('');
      return;
    }

    const parsed = parseCustomVerseInput(customInput);
    if (!parsed.ok) {
      setCustomError(parsed.error);
      return;
    }
    setCustomError('');

    if (parsed.parsedBook && parsed.parsedBook !== book) {
      setBook(parsed.parsedBook);
      return;
    }

    setIsLoadingText(true);
    fetchKjvCustomVerses(book, parsed.selections)
      .then((text) => setVerseText(text ?? ''))
      .catch(() => setVerseText(''))
      .finally(() => setIsLoadingText(false));
  }, [mode, book, customInput]);

  const validateAndSetChapter = (value: string) => {
    setChapter(value);
    const num = parseInt(value);
    if (num > maxChapter) {
      setErrors((prev) => ({ ...prev, chapter: `Max chapter is ${maxChapter}` }));
    } else {
      setErrors((prev) => {
        const { chapter: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateAndSetVerse = (field: 'start' | 'end', value: string) => {
    const num = parseInt(value);
    if (value && num > maxVerse) {
      setErrors((prev) => ({ ...prev, [`verse_${field}`]: `Max verse is ${maxVerse}` }));
    } else {
      setErrors((prev) => {
        const key = `verse_${field}`;
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
    if (field === 'start') setVerseStart(value);
    else setVerseEnd(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'custom') {
      const parsed = parseCustomVerseInput(customInput);
      if (!parsed.ok) {
        setCustomError(parsed.error);
        return;
      }
      setCustomError('');

      // Use chapter=0, verse_start=0, verse_end=null as sentinels for custom selection
      onSave({
        book: parsed.parsedBook || book,
        chapter: 0,
        verse_start: 0,
        verse_end: null,
        text: verseText,
        note: note.trim(),
        type,
      });
      return;
    }

    // Standard mode
    const errs: Record<string, string> = {};
    const chapterNum = parseInt(chapter);
    const verseStartNum = parseInt(verseStart);
    const verseEndNum = verseEnd ? parseInt(verseEnd) : null;

    const verseValidation = validateVerseRange(book, chapterNum, verseStartNum, verseEndNum);
    if (!verseValidation.valid) {
      errs.verse_start = verseValidation.error || 'Invalid verse reference';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      book,
      chapter: chapterNum,
      verse_start: verseStartNum,
      verse_end: verseEndNum,
      text: verseText,
      note: note.trim(),
      type,
    });
  };

  const bookOptions = BIBLE_BOOKS.map((b) => ({
    value: b.name,
    label: `${b.name} (${b.group})`,
  }));

  const typeOptions = VERSE_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('standard')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-150 ${
            mode === 'standard'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Standard Range
        </button>
        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all duration-150 ${
            mode === 'custom'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          Custom Selection
        </button>
      </div>

      {/* Book selector (shared) */}
      <Select
        label="Book"
        value={book}
        options={bookOptions}
        onChange={(e) => setBook(e.target.value)}
      />

      {mode === 'standard' ? (
        <div className="flex gap-2">
          <Input
            label="Chapter"
            type="number"
            min={1}
            max={maxChapter}
            value={chapter}
            onChange={(e) => validateAndSetChapter(e.target.value)}
            error={errors.chapter}
          />
          <Input
            label="Verse Start"
            type="number"
            min={1}
            max={maxVerse}
            value={verseStart}
            onChange={(e) => validateAndSetVerse('start', e.target.value)}
            error={errors.verse_start}
          />
          <Input
            label="Verse End (optional)"
            type="number"
            min={verseStart ? parseInt(verseStart) : 1}
            max={maxVerse}
            value={verseEnd}
            onChange={(e) => validateAndSetVerse('end', e.target.value)}
            error={errors.verse_end}
            placeholder="Same"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Verse References
          </label>
          <input
            type="text"
            value={customInput}
            onChange={(e) => { setCustomInput(e.target.value); setCustomError(''); }}
            placeholder="e.g. 1:1, 1:3, 2:2, 5:1-5, 10:21-25"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
          />
          {customError && (
            <p className="mt-1 text-xs text-red-500">{customError}</p>
          )}
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Comma-separated. Single verse: <code>3:16</code> · Range: <code>5:1-5</code> · Mix freely.
          </p>
        </div>
      )}

      {/* KJV Verse Text Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          King James Version
        </label>
        <div className="min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 max-h-48 overflow-y-auto">
          {isLoadingText ? (
            <div className="animate-pulse space-y-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : verseText ? (
            <div className="space-y-0.5">
              {verseText.split('\n').map((line, i) => {
                const m = line.match(/^\[(\d+):(\d+)\]\s*(.*)/);
                if (m) {
                  return (
                    <p key={i} className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                      <sup className="text-indigo-500 dark:text-indigo-400 font-semibold mr-0.5 text-[10px]">
                        {m[1]}:{m[2]}
                      </sup>
                      <span className="italic">{m[3]}</span>
                    </p>
                  );
                }
                return (
                  <p key={i} className="text-gray-800 dark:text-gray-200 text-sm italic leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {mode === 'standard'
                ? 'Enter a verse reference above to load the KJV text'
                : 'Enter verse references above (e.g. 1:1, 1:3, 2:2-5)'}
            </p>
          )}
        </div>
      </div>

      <Select
        label="Type"
        value={type}
        options={typeOptions}
        onChange={(e) => setType(e.target.value as VerseType)}
      />

      <div className="flex gap-1 items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">Color preview:</span>
        <span
          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: VERSE_TYPE_COLORS[type] }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Personal Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Your personal study notes..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
        />
      </div>

      <div className="flex justify-between pt-2">
        {verse && onDelete && (
          <Button type="button" variant="danger" onClick={onDelete}>
            Delete
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {verse ? 'Save Changes' : 'Add Verse'}
          </Button>
        </div>
      </div>
    </form>
  );
}
