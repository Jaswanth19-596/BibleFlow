import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { Verse, VerseType } from '@/lib/types';
import { BIBLE_BOOKS, validateVerseRange, getVersesInChapter } from '@/lib/bibleBooks';
import { VERSE_TYPE_COLORS } from '@/lib/edgeTypes';
import { fetchKjvVerseRange } from '@/lib/bibleApi';

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

export default function VerseSidebar({ verse, onSave, onDelete, onClose }: VerseSidebarProps) {
  const [book, setBook] = useState(verse?.book || 'John');
  const [chapter, setChapter] = useState(verse?.chapter?.toString() || '3');
  const [verseStart, setVerseStart] = useState(verse?.verse_start?.toString() || '16');
  const [verseEnd, setVerseEnd] = useState(verse?.verse_end?.toString() || '');
  const [verseText, setVerseText] = useState(verse?.text || '');
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [note, setNote] = useState(verse?.note || '');
  const [type, setType] = useState<VerseType>(verse?.type || 'main');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedBook = BIBLE_BOOKS.find((b) => b.name === book);
  const maxChapter = selectedBook?.chapters || 0;
  const maxVerse = chapter ? getVersesInChapter(book, parseInt(chapter) || 1) || 0 : 0;

  // Fetch KJV text when verse reference changes
  useEffect(() => {
    const chapterNum = parseInt(chapter);
    const verseStartNum = parseInt(verseStart);
    const verseEndNum = verseEnd ? parseInt(verseEnd) : null;

    if (!book || !chapter || isNaN(chapterNum) || isNaN(verseStartNum)) {
      return;
    }

    const verseValidation = validateVerseRange(book, chapterNum, verseStartNum, verseEndNum);
    if (!verseValidation.valid) {
      return;
    }

    setIsLoadingText(true);
    fetchKjvVerseRange(book, chapterNum, verseStartNum, verseEndNum)
      .then((text) => {
        if (text) {
          setVerseText(text);
        } else {
          setVerseText('');
        }
      })
      .catch(() => setVerseText(''))
      .finally(() => setIsLoadingText(false));
  }, [book, chapter, verseStart, verseEnd]);

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
    if (field === 'start') {
      setVerseStart(value);
    } else {
      setVerseEnd(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    const chapterNum = parseInt(chapter);
    const verseStartNum = parseInt(verseStart);
    const verseEndNum = verseEnd ? parseInt(verseEnd) : null;

    const verseValidation = validateVerseRange(book, chapterNum, verseStartNum, verseEndNum);
    if (!verseValidation.valid) {
      errors.verse_start = verseValidation.error || 'Invalid verse reference';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
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
      <Select
        label="Book"
        value={book}
        options={bookOptions}
        onChange={(e) => setBook(e.target.value)}
      />

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

      {/* KJV Verse Text Display */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          King James Version
        </label>
        <div className="min-h-[80px] px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
          {isLoadingText ? (
            <div className="animate-pulse space-y-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ) : verseText ? (
            <p className="text-gray-800 dark:text-gray-200 text-sm italic leading-relaxed">
              "{verseText}"
            </p>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Enter a verse reference above to load the KJV text
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
