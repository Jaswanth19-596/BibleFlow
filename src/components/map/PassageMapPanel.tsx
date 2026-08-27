import { useMemo, useState } from 'react';
import { BIBLE_BOOKS, getVersesInChapter } from '@/lib/bibleBooks';
import {
  PassagePlaceMatch,
  PassageSelection,
  PassageStudy,
  formatPassageLabel,
  formatPassageVerseLabel,
} from '@/lib/passagePlaces';

interface PassageMapPanelProps {
  study: PassageStudy | null;
  loading: boolean;
  error: string | null;
  onMapPassage: (selection: PassageSelection) => void;
  onClear: () => void;
  onFocusPlace: (match: PassagePlaceMatch) => void;
}

export default function PassageMapPanel({
  study, loading, error, onMapPassage, onClear, onFocusPlace,
}: PassageMapPanelProps) {
  const [book, setBook] = useState('Genesis');
  const [chapter, setChapter] = useState('1');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedBook = useMemo(() => BIBLE_BOOKS.find(item => item.name === book), [book]);
  const chapterNumber = Number(chapter);
  const maximumVerse = getVersesInChapter(book, chapterNumber) ?? 0;

  const resetForBook = (nextBook: string) => {
    setBook(nextBook);
    setChapter('1');
    setVerseStart('');
    setVerseEnd('');
    setFormError(null);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const selectedChapter = Number(chapter);
    const chapterMax = getVersesInChapter(book, selectedChapter);
    if (!selectedBook || !Number.isInteger(selectedChapter) || !chapterMax) {
      setFormError(`Choose a chapter from 1 to ${selectedBook?.chapters ?? 1}.`);
      return;
    }

    const start = verseStart ? Number(verseStart) : 1;
    const end = verseEnd ? Number(verseEnd) : chapterMax;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > chapterMax || end < start) {
      setFormError(`Use verses from 1 to ${chapterMax}, with the end after the start.`);
      return;
    }

    setFormError(null);
    onMapPassage({ book, chapter: selectedChapter, verseStart: start, verseEnd: end });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Find all biblical places mentioned in a book, chapter, or verse range.
        </p>
        {study && (
          <button
            onClick={onClear}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      <form className="space-y-3" onSubmit={submit}>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Book</span>
          <select
            value={book}
            onChange={event => resetForBook(event.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            aria-label="Passage book"
          >
            {BIBLE_BOOKS.map(item => (
              <option key={item.name} value={item.name}>{item.name}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Chapter</span>
            <input
              value={chapter}
              onChange={event => { setChapter(event.target.value); setFormError(null); }}
              inputMode="numeric"
              min="1"
              max={selectedBook?.chapters}
              className="block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              aria-label="Passage chapter"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">From</span>
            <input
              value={verseStart}
              onChange={event => { setVerseStart(event.target.value); setFormError(null); }}
              inputMode="numeric"
              placeholder="1"
              min="1"
              max={maximumVerse || undefined}
              className="block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              aria-label="Passage starting verse"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">To</span>
            <input
              value={verseEnd}
              onChange={event => { setVerseEnd(event.target.value); setFormError(null); }}
              inputMode="numeric"
              placeholder={maximumVerse ? String(maximumVerse) : '—'}
              min="1"
              max={maximumVerse || undefined}
              className="block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              aria-label="Passage ending verse"
            />
          </label>
        </div>

        {(formError || error) && (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">{formError || error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading ? 'Finding places…' : 'Map places in this book'}
        </button>
      </form>

      {study && (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPassageLabel(study.selection)}</p>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {study.matches.length} {study.matches.length === 1 ? 'place' : 'places'}
            </span>
          </div>
          {study.matches.length ? (
            <div className="mt-2 max-h-52 space-y-1 overflow-y-auto pr-1">
              {study.matches.map(match => {
                const name = match.place.namesByBook[study.selection.book]?.[0] ?? match.place.name;
                return (
                  <button
                    key={match.place.id}
                    onClick={() => onFocusPlace(match)}
                    className="w-full rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-2 text-left transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  >
                    <span className="block text-sm font-semibold text-slate-800 dark:text-white">{name}</span>
                    <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {formatPassageVerseLabel(study.selection, match.verses)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs leading-5 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
              No mapped place is named in this selection. Try the whole chapter, or search a biblical location directly.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
