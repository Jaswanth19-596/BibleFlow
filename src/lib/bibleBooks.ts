export interface BibleBook {
  name: string;
  abbrev: string;
  testament: 'OT' | 'NT';
  group: string;
  chapters: number;
  versesPerChapter: number[];
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament - Pentateuch
  { name: 'Genesis', abbrev: 'Gen', testament: 'OT', group: 'Pentateuch', chapters: 50, versesPerChapter: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,32,32,10,31,22,25,22,19,19,23,29,38,18,34,24,20,67,34,35,46,37,20,24,22,29,35,43,55,32,20,31,29,10] },
  { name: 'Exodus', abbrev: 'Exod', testament: 'OT', group: 'Pentateuch', chapters: 40, versesPerChapter: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,29,51,33,26] },
  { name: 'Leviticus', abbrev: 'Lev', testament: 'OT', group: 'Pentateuch', chapters: 27, versesPerChapter: [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,46,38,28,23] },
  { name: 'Numbers', abbrev: 'Num', testament: 'OT', group: 'Pentateuch', chapters: 36, versesPerChapter: [54,34,51,49,31,25,28,36,34,30,35,41,30,45,26,23,36,38,25,32,29,35,41,30,25,19,32,28] },
  { name: 'Deuteronomy', abbrev: 'Deut', testament: 'OT', group: 'Pentateuch', chapters: 34, versesPerChapter: [46,37,29,49,33,21,40,42,35,29,43,37,20,22,47,39,56,25,33,27,24,34,40,44,26,20,30,52,29,12] },
  // Old Testament - Historical
  { name: 'Joshua', abbrev: 'Josh', testament: 'OT', group: 'Historical', chapters: 24, versesPerChapter: [18,24,17,24,16,27,26,35,27,43,23,24,33,15,63,10,18,28,51,11,16,31,40,49] },
  { name: 'Judges', abbrev: 'Judg', testament: 'OT', group: 'Historical', chapters: 21, versesPerChapter: [36,23,31,24,31,40,25,35,59,18,40,15,25,20,67,27,17,17,14,31,39] },
  { name: 'Ruth', abbrev: 'Ruth', testament: 'OT', group: 'Historical', chapters: 4, versesPerChapter: [22,23,18,22] },
  { name: '1 Samuel', abbrev: '1 Sam', testament: 'OT', group: 'Historical', chapters: 31, versesPerChapter: [28,36,21,27,28,35,27,36,30,17,22,12,32,23,25,27,31,30,29,24,33,32,26,31,40,25,35,37,27,42,30] },
  { name: '2 Samuel', abbrev: '2 Sam', testament: 'OT', group: 'Historical', chapters: 24, versesPerChapter: [27,32,39,12,29,37,17,30,32,35,30,31,36,23,24,33,27,32,44,31,38,36,20,47] },
  { name: '1 Kings', abbrev: '1 Kgs', testament: 'OT', group: 'Historical', chapters: 22, versesPerChapter: [53,46,28,20,32,38,51,66,28,29,43,51,46,74,36,45,28,20,41,37,71,56] },
  { name: '2 Kings', abbrev: '2 Kgs', testament: 'OT', group: 'Historical', chapters: 25, versesPerChapter: [53,46,28,20,32,38,51,66,28,29,43,51,46,74,36,45,28,20,41,37,71,56] },
  { name: '1 Chronicles', abbrev: '1 Chr', testament: 'OT', group: 'Historical', chapters: 29, versesPerChapter: [54,55,24,43,41,66,40,40,44,14,47,40,14,17,29,43,39,46,38,31,36,46,33,18,40,37,16,24,34,44] },
  { name: '2 Chronicles', abbrev: '2 Chr', testament: 'OT', group: 'Historical', chapters: 36, versesPerChapter: [17,18,17,22,14,42,22,18,31,19,25,28,35,22,19,21,18,20,15,13,30,21,23,21,27,18,16,24,29,32] },
  { name: 'Ezra', abbrev: 'Ezra', testament: 'OT', group: 'Historical', chapters: 10, versesPerChapter: [11,37,14,24,53,17,37,38,36,15,47] },
  { name: 'Nehemiah', abbrev: 'Neh', testament: 'OT', group: 'Historical', chapters: 13, versesPerChapter: [11,20,32,23,25,52,42,54,34,16,30,32,29] },
  { name: 'Esther', abbrev: 'Est', testament: 'OT', group: 'Historical', chapters: 10, versesPerChapter: [22,23,15,17,14,14,10,17,32,13] },
  // Old Testament - Wisdom
  { name: 'Job', abbrev: 'Job', testament: 'OT', group: 'Wisdom', chapters: 42, versesPerChapter: [22,13,26,21,27,30,21,22,35,36,22,20,25,28,22,35,22,16,21,29,34,30,29,33,31,29,34,28,25,31,40,24,34,16,23,24,33,30,32,34,30,51,29,34] },
  { name: 'Psalms', abbrev: 'Ps', testament: 'OT', group: 'Wisdom', chapters: 150, versesPerChapter: [6,12,8,8,12,10,17,9,20,18,7,8,6,5,11,14,9,11,13,26,10,22,12,14,9,10,8,10,7,17,7,19,5,29,34,6,16,27,24,20,29,29,28] },
  { name: 'Proverbs', abbrev: 'Prov', testament: 'OT', group: 'Wisdom', chapters: 31, versesPerChapter: [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31] },
  { name: 'Ecclesiastes', abbrev: 'Eccl', testament: 'OT', group: 'Wisdom', chapters: 12, versesPerChapter: [18,26,22,16,20,12,30,17,18,20,10,14] },
  { name: 'Song of Solomon', abbrev: 'Song', testament: 'OT', group: 'Wisdom', chapters: 8, versesPerChapter: [17,17,11,16,16,12,14,15] },
  // Old Testament - Major Prophets
  { name: 'Isaiah', abbrev: 'Isa', testament: 'OT', group: 'Major Prophets', chapters: 66, versesPerChapter: [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,25,24,17,10,37,21,36,16,27,18,17,20,8,21,30,38,18,15,19,16,8,18,16,6,12,25,22,28,33,31] },
  { name: 'Jeremiah', abbrev: 'Jer', testament: 'OT', group: 'Major Prophets', chapters: 52, versesPerChapter: [19,37,25,26,22,19,32,21,28,18,16,18,25,14,29,10,30,48,25,28,25,23,23,20,25,22,19,16,27,17,14,14,20,35,24,22,25,24,19,26,16,27,31,15,25,24,23] },
  { name: 'Lamentations', abbrev: 'Lam', testament: 'OT', group: 'Major Prophets', chapters: 5, versesPerChapter: [22,22,66,22,22] },
  { name: 'Ezekiel', abbrev: 'Ezek', testament: 'OT', group: 'Major Prophets', chapters: 48, versesPerChapter: [28,10,27,17,17,14,27,18,11,14,25,23,23,19,13,30,26,25,25,35,15,11,49,28,50,40,46,42,59,36,34,35,35,28,26,25,25,16,15,25,34,34,22,21,31] },
  { name: 'Daniel', abbrev: 'Dan', testament: 'OT', group: 'Major Prophets', chapters: 12, versesPerChapter: [21,49,30,37,31,28,28,27,27,21,45,13] },
  // Old Testament - Minor Prophets
  { name: 'Hosea', abbrev: 'Hos', testament: 'OT', group: 'Minor Prophets', chapters: 14, versesPerChapter: [11,23,5,19,15,11,16,14,17,15,12,14,16,11] },
  { name: 'Joel', abbrev: 'Joel', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [20,27,5] },
  { name: 'Amos', abbrev: 'Amos', testament: 'OT', group: 'Minor Prophets', chapters: 9, versesPerChapter: [15,16,10,8,9,15,14,17,14] },
  { name: 'Obadiah', abbrev: 'Obad', testament: 'OT', group: 'Minor Prophets', chapters: 1, versesPerChapter: [21] },
  { name: 'Jonah', abbrev: 'Jonah', testament: 'OT', group: 'Minor Prophets', chapters: 4, versesPerChapter: [17,10,10,11] },
  { name: 'Micah', abbrev: 'Mic', testament: 'OT', group: 'Minor Prophets', chapters: 7, versesPerChapter: [16,13,12,13,15,16,20] },
  { name: 'Nahum', abbrev: 'Nah', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [15,13,19] },
  { name: 'Habakkuk', abbrev: 'Hab', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [17,20,19] },
  { name: 'Zephaniah', abbrev: 'Zeph', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [18,15,20] },
  { name: 'Haggai', abbrev: 'Hag', testament: 'OT', group: 'Minor Prophets', chapters: 2, versesPerChapter: [15,23] },
  { name: 'Zechariah', abbrev: 'Zech', testament: 'OT', group: 'Minor Prophets', chapters: 14, versesPerChapter: [21,13,10,14,11,15,14,23,17,12,17,14,9,21] },
  { name: 'Malachi', abbrev: 'Mal', testament: 'OT', group: 'Minor Prophets', chapters: 4, versesPerChapter: [14,17,24,21] },
  // New Testament - Gospels
  { name: 'Matthew', abbrev: 'Matt', testament: 'NT', group: 'Gospels', chapters: 28, versesPerChapter: [25,23,17,25,48,12,10,129,18,17,20,19,34,30,29,35,30,27,35,30,34,46,46,39,28,27,31,27] },
  { name: 'Mark', abbrev: 'Mark', testament: 'NT', group: 'Gospels', chapters: 16, versesPerChapter: [45,28,35,41,43,56,37,38,50,50,58,35,35,32,31,37,28] },
  { name: 'Luke', abbrev: 'Luke', testament: 'NT', group: 'Gospels', chapters: 24, versesPerChapter: [80,52,38,44,49,50,56,62,42,54,54,59,35,35,32,31,37,43,48,47,38,71,56,53] },
  { name: 'John', abbrev: 'John', testament: 'NT', group: 'Gospels', chapters: 21, versesPerChapter: [51,25,36,54,47,71,53,59,33,38,40,42,31,27,33,26,40,63,54,51,38] },
  // New Testament - Acts
  { name: 'Acts', abbrev: 'Acts', testament: 'NT', group: 'Acts', chapters: 28, versesPerChapter: [26,47,26,37,42,31,30,25,52,28,41,40,28,27,41,30,35,27,27,32,44,31,25] },
  // New Testament - Pauline Epistles
  { name: 'Romans', abbrev: 'Rom', testament: 'NT', group: 'Pauline Epistles', chapters: 16, versesPerChapter: [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,24] },
  { name: '1 Corinthians', abbrev: '1 Cor', testament: 'NT', group: 'Pauline Epistles', chapters: 16, versesPerChapter: [31,16,23,21,13,35,40,27,27,33,34,31,20,25,39,28] },
  { name: '2 Corinthians', abbrev: '2 Cor', testament: 'NT', group: 'Pauline Epistles', chapters: 13, versesPerChapter: [24,17,18,18,21,18,16,24,15,18,33,21,14] },
  { name: 'Galatians', abbrev: 'Gal', testament: 'NT', group: 'Pauline Epistles', chapters: 6, versesPerChapter: [24,21,25,21,33,24,21] },
  { name: 'Ephesians', abbrev: 'Eph', testament: 'NT', group: 'Pauline Epistles', chapters: 6, versesPerChapter: [23,22,21,32,33,24] },
  { name: 'Philippians', abbrev: 'Phil', testament: 'NT', group: 'Pauline Epistles', chapters: 4, versesPerChapter: [30,30,30,21] },
  { name: 'Colossians', abbrev: 'Col', testament: 'NT', group: 'Pauline Epistles', chapters: 4, versesPerChapter: [29,23,25,18] },
  { name: '1 Thessalonians', abbrev: '1 Thess', testament: 'NT', group: 'Pauline Epistles', chapters: 5, versesPerChapter: [10,20,13,18,28] },
  { name: '2 Thessalonians', abbrev: '2 Thess', testament: 'NT', group: 'Pauline Epistles', chapters: 3, versesPerChapter: [12,17,18] },
  { name: '1 Timothy', abbrev: '1 Tim', testament: 'NT', group: 'Pauline Epistles', chapters: 6, versesPerChapter: [20,15,16,16,25,21] },
  { name: '2 Timothy', abbrev: '2 Tim', testament: 'NT', group: 'Pauline Epistles', chapters: 4, versesPerChapter: [18,26,17,22] },
  { name: 'Titus', abbrev: 'Titus', testament: 'NT', group: 'Pauline Epistles', chapters: 3, versesPerChapter: [16,15,15] },
  { name: 'Philemon', abbrev: 'Phlm', testament: 'NT', group: 'Pauline Epistles', chapters: 1, versesPerChapter: [25] },
  // New Testament - General Epistles
  { name: 'Hebrews', abbrev: 'Heb', testament: 'NT', group: 'General Epistles', chapters: 13, versesPerChapter: [14,18,19,11,13,14,18,19,15,21,23,29,24] },
  { name: 'James', abbrev: 'Jas', testament: 'NT', group: 'General Epistles', chapters: 5, versesPerChapter: [27,26,18,17,24] },
  { name: '1 Peter', abbrev: '1 Pet', testament: 'NT', group: 'General Epistles', chapters: 5, versesPerChapter: [25,25,22,19,14] },
  { name: '2 Peter', abbrev: '2 Pet', testament: 'NT', group: 'General Epistles', chapters: 3, versesPerChapter: [21,22,18] },
  { name: '1 John', abbrev: '1 John', testament: 'NT', group: 'General Epistles', chapters: 5, versesPerChapter: [28,24,21,21,25] },
  { name: '2 John', abbrev: '2 John', testament: 'NT', group: 'General Epistles', chapters: 1, versesPerChapter: [13] },
  { name: '3 John', abbrev: '3 John', testament: 'NT', group: 'General Epistles', chapters: 1, versesPerChapter: [14] },
  { name: 'Jude', abbrev: 'Jude', testament: 'NT', group: 'General Epistles', chapters: 1, versesPerChapter: [25] },
  // New Testament - Apocalyptic
  { name: 'Revelation', abbrev: 'Rev', testament: 'NT', group: 'Apocalypse', chapters: 22, versesPerChapter: [20,29,22,11,14,17,17,13,21,11,19,18,13,12,21,21,11,19,18,17,18,20] },
];

export function getBookByName(name: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.name.toLowerCase() === name.toLowerCase());
}

export function getBookAbbrev(name: string): string {
  const book = getBookByName(name);
  return book?.abbrev ?? name;
}

export function getVersesInChapter(bookName: string, chapter: number): number | undefined {
  const book = getBookByName(bookName);
  if (!book || chapter < 1 || chapter > book.chapters) return undefined;
  return book.versesPerChapter[chapter - 1];
}

export function validateVerseRef(book: string, chapter: number, verse: number): { valid: boolean; error?: string } {
  const bookData = getBookByName(book);
  if (!bookData) {
    return { valid: false, error: `Unknown book: ${book}` };
  }
  if (chapter < 1 || chapter > bookData.chapters) {
    return { valid: false, error: `${book} only has ${bookData.chapters} chapters` };
  }
  const maxVerse = bookData.versesPerChapter[chapter - 1];
  if (verse < 1 || verse > maxVerse) {
    return { valid: false, error: `${book} ${chapter} only has ${maxVerse} verses` };
  }
  return { valid: true };
}

export function validateVerseRange(book: string, chapter: number, verseStart: number, verseEnd: number | null): { valid: boolean; error?: string } {
  const startValidation = validateVerseRef(book, chapter, verseStart);
  if (!startValidation.valid) return startValidation;

  if (verseEnd !== null && verseEnd !== undefined) {
    if (verseEnd < verseStart) {
      return { valid: false, error: 'Verse end must be >= verse start' };
    }
    const endValidation = validateVerseRef(book, chapter, verseEnd);
    if (!endValidation.valid) return endValidation;
  }

  return { valid: true };
}

export function formatVerseRef(book: string, chapter: number, verseStart: number, verseEnd?: number | null): string {
  const abbrev = getBookAbbrev(book);
  if (verseEnd && verseEnd !== verseStart) {
    return `${abbrev} ${chapter}:${verseStart}-${verseEnd}`;
  }
  return `${abbrev} ${chapter}:${verseStart}`;
}
