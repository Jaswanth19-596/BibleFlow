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
  { name: 'Genesis', abbrev: 'Gen', testament: 'OT', group: 'Pentateuch', chapters: 50, versesPerChapter: [31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,32,32,20,28,22,25,22,19,19,23,29,38,18,34,24,20,67,34,35,46,37,20,24,22,29,35,43,55,32,20,31,29,43] },
  { name: 'Exodus', abbrev: 'Exod', testament: 'OT', group: 'Pentateuch', chapters: 40, versesPerChapter: [22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,27,36,18,32,31,28] },
  { name: 'Leviticus', abbrev: 'Lev', testament: 'OT', group: 'Pentateuch', chapters: 27, versesPerChapter: [17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,28] },
  { name: 'Numbers', abbrev: 'Num', testament: 'OT', group: 'Pentateuch', chapters: 36, versesPerChapter: [54,34,51,49,31,27,26,25,44,36,31,33,44,45,46,46,39,36,33,29,37,31,43,38,38,35,46,28,51,46,75,66,44,45,46,50] },
  { name: 'Deuteronomy', abbrev: 'Deut', testament: 'OT', group: 'Pentateuch', chapters: 34, versesPerChapter: [46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12] },
  // Old Testament - Historical
  { name: 'Joshua', abbrev: 'Josh', testament: 'OT', group: 'Historical', chapters: 24, versesPerChapter: [18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33] },
  { name: 'Judges', abbrev: 'Judg', testament: 'OT', group: 'Historical', chapters: 21, versesPerChapter: [36,23,31,24,31,40,25,35,57,18,40,15,25,20,67,27,17,18,20,31,40] },
  { name: 'Ruth', abbrev: 'Ruth', testament: 'OT', group: 'Historical', chapters: 4, versesPerChapter: [22,23,18,22] },
  { name: '1 Samuel', abbrev: '1 Sam', testament: 'OT', group: 'Historical', chapters: 31, versesPerChapter: [28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13] },
  { name: '2 Samuel', abbrev: '2 Sam', testament: 'OT', group: 'Historical', chapters: 24, versesPerChapter: [27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25] },
  { name: '1 Kings', abbrev: '1 Kgs', testament: 'OT', group: 'Historical', chapters: 22, versesPerChapter: [53,46,28,34,18,38,51,66,28,29,43,33,46,74,36,45,28,20,41,37,71,56] },
  { name: '2 Kings', abbrev: '2 Kgs', testament: 'OT', group: 'Historical', chapters: 25, versesPerChapter: [18,37,29,31,28,36,47,30,43,49,28,20,20,37,30,50,29,36,43,46,40,36,46,43,48] },
  { name: '1 Chronicles', abbrev: '1 Chr', testament: 'OT', group: 'Historical', chapters: 29, versesPerChapter: [54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,26,68,23,28,31,39,17] },
  { name: '2 Chronicles', abbrev: '2 Chr', testament: 'OT', group: 'Historical', chapters: 36, versesPerChapter: [17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23] },
  { name: 'Ezra', abbrev: 'Ezra', testament: 'OT', group: 'Historical', chapters: 10, versesPerChapter: [11,70,13,24,17,22,28,36,15,44] },
  { name: 'Nehemiah', abbrev: 'Neh', testament: 'OT', group: 'Historical', chapters: 13, versesPerChapter: [11,20,32,23,19,19,73,18,38,39,36,47,31] },
  { name: 'Esther', abbrev: 'Est', testament: 'OT', group: 'Historical', chapters: 10, versesPerChapter: [22,23,15,17,14,14,10,17,32,3] },
  // Old Testament - Wisdom
  { name: 'Job', abbrev: 'Job', testament: 'OT', group: 'Wisdom', chapters: 42, versesPerChapter: [22,13,26,21,27,30,21,22,35,36,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,32,26,17] },
  { name: 'Psalms', abbrev: 'Ps', testament: 'OT', group: 'Wisdom', chapters: 150, versesPerChapter: [6,12,8,8,12,10,17,9,20,18,7,8,6,5,11,14,9,11,13,26,10,22,12,14,9,10,8,10,7,17,7,19,5,29,34,6,16,27,38,20,29,29,28,27,23,27,34,19,40,24,20,16,21,22,18,28,52,33,47,29,22,33,21,30,22,41,31,25,27,54,14,24,20,35,28,33,22,27,28,35,28,37,35,28,26,25,25,23,30,29,33,40,28,26,11,32,30,29,27,14,25,14,11,24,14,20,47,20,13,14,26,21,17,18,16,22,17,24,24,22,14,25,15,27,32,28,33,20,13,21,22,18,16,19,14,32,31,14,10,20,27,11,27,20,25,32,14,25,16,30] },
  { name: 'Proverbs', abbrev: 'Prov', testament: 'OT', group: 'Wisdom', chapters: 31, versesPerChapter: [33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31] },
  { name: 'Ecclesiastes', abbrev: 'Eccl', testament: 'OT', group: 'Wisdom', chapters: 12, versesPerChapter: [18,26,22,16,20,12,30,17,18,20,10,14] },
  { name: 'Song of Solomon', abbrev: 'Song', testament: 'OT', group: 'Wisdom', chapters: 8, versesPerChapter: [17,17,11,16,16,13,13,14] },
  // Old Testament - Major Prophets
  { name: 'Isaiah', abbrev: 'Isa', testament: 'OT', group: 'Major Prophets', chapters: 66, versesPerChapter: [31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,25,24,17,10,37,21,36,16,27,18,17,22,19,21,30,25,21,18,19,15,21,34,25,19,18,24,29,28,23,31,49,27,31,17,28,18,25,20,17,31,31,34,28,31,28,25,28,25,13] },
  { name: 'Jeremiah', abbrev: 'Jer', testament: 'OT', group: 'Major Prophets', chapters: 52, versesPerChapter: [19,37,25,26,32,23,31,21,28,18,14,17,11,29,23,22,19,19,15,22,16,15,22,17,21,39,24,24,36,22,17,32,24,40,35,22,29,22,35,34,28,41,46,14,28,51,16,78,36,14,49,33] },
  { name: 'Lamentations', abbrev: 'Lam', testament: 'OT', group: 'Major Prophets', chapters: 5, versesPerChapter: [22,22,66,22,22] },
  { name: 'Ezekiel', abbrev: 'Ezek', testament: 'OT', group: 'Major Prophets', chapters: 48, versesPerChapter: [28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,9,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35] },
  { name: 'Daniel', abbrev: 'Dan', testament: 'OT', group: 'Major Prophets', chapters: 12, versesPerChapter: [21,49,30,37,31,28,28,27,27,21,45,13] },
  // Old Testament - Minor Prophets
  { name: 'Hosea', abbrev: 'Hos', testament: 'OT', group: 'Minor Prophets', chapters: 14, versesPerChapter: [11,23,5,19,15,11,16,14,17,15,12,14,16,9] },
  { name: 'Joel', abbrev: 'Joel', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [20,32,21] },
  { name: 'Amos', abbrev: 'Amos', testament: 'OT', group: 'Minor Prophets', chapters: 9, versesPerChapter: [15,16,15,13,27,14,17,14,15] },
  { name: 'Obadiah', abbrev: 'Obad', testament: 'OT', group: 'Minor Prophets', chapters: 1, versesPerChapter: [21] },
  { name: 'Jonah', abbrev: 'Jonah', testament: 'OT', group: 'Minor Prophets', chapters: 4, versesPerChapter: [17,10,10,11] },
  { name: 'Micah', abbrev: 'Mic', testament: 'OT', group: 'Minor Prophets', chapters: 7, versesPerChapter: [16,13,12,13,15,16,20] },
  { name: 'Nahum', abbrev: 'Nah', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [15,13,19] },
  { name: 'Habakkuk', abbrev: 'Hab', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [17,20,19] },
  { name: 'Zephaniah', abbrev: 'Zeph', testament: 'OT', group: 'Minor Prophets', chapters: 3, versesPerChapter: [18,15,20] },
  { name: 'Haggai', abbrev: 'Hag', testament: 'OT', group: 'Minor Prophets', chapters: 2, versesPerChapter: [15,23] },
  { name: 'Zechariah', abbrev: 'Zech', testament: 'OT', group: 'Minor Prophets', chapters: 14, versesPerChapter: [21,13,10,14,11,15,14,23,17,12,17,14,9,21] },
  { name: 'Malachi', abbrev: 'Mal', testament: 'OT', group: 'Minor Prophets', chapters: 4, versesPerChapter: [14,17,18,6] },
  // New Testament - Gospels
  { name: 'Matthew', abbrev: 'Matt', testament: 'NT', group: 'Gospels', chapters: 28, versesPerChapter: [25,23,17,25,48,34,29,34,38,42,45,27,34,25,40,20,37,32,28,38,50,44,24,28,24,26,22,35] },
  { name: 'Mark', abbrev: 'Mark', testament: 'NT', group: 'Gospels', chapters: 16, versesPerChapter: [45,28,35,41,43,56,37,38,50,52,28,45,38,61,37,63] },
  { name: 'Luke', abbrev: 'Luke', testament: 'NT', group: 'Gospels', chapters: 24, versesPerChapter: [80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53] },
  { name: 'John', abbrev: 'John', testament: 'NT', group: 'Gospels', chapters: 21, versesPerChapter: [51,25,36,54,47,71,53,59,19,51,25,36,54,47,71,53,59,38,40,42,31] },
  // New Testament - Acts
  { name: 'Acts', abbrev: 'Acts', testament: 'NT', group: 'Acts', chapters: 28, versesPerChapter: [26,47,26,37,42,15,60,40,43,45,29,52,41,35,45,50,41,27,32,56,29,55,26,61,47,19,38,34,24,45] },
  // New Testament - Pauline Epistles
  { name: 'Romans', abbrev: 'Rom', testament: 'NT', group: 'Pauline Epistles', chapters: 16, versesPerChapter: [32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,24] },
  { name: '1 Corinthians', abbrev: '1 Cor', testament: 'NT', group: 'Pauline Epistles', chapters: 16, versesPerChapter: [31,16,23,21,13,20,40,34,29,22,35,28,14,29,31,43] },
  { name: '2 Corinthians', abbrev: '2 Cor', testament: 'NT', group: 'Pauline Epistles', chapters: 13, versesPerChapter: [24,17,18,18,21,18,16,24,15,18,33,21,24] },
  { name: 'Galatians', abbrev: 'Gal', testament: 'NT', group: 'Pauline Epistles', chapters: 6, versesPerChapter: [24,21,29,31,26,18] },
  { name: 'Ephesians', abbrev: 'Eph', testament: 'NT', group: 'Pauline Epistles', chapters: 6, versesPerChapter: [23,22,21,32,33,24] },
  { name: 'Philippians', abbrev: 'Phil', testament: 'NT', group: 'Pauline Epistles', chapters: 4, versesPerChapter: [30,30,21,27] },
  { name: 'Colossians', abbrev: 'Col', testament: 'NT', group: 'Pauline Epistles', chapters: 4, versesPerChapter: [29,23,25,18] },
  { name: '1 Thessalonians', abbrev: '1 Thess', testament: 'NT', group: 'Pauline Epistles', chapters: 5, versesPerChapter: [10,20,13,18,28] },
  { name: '2 Thessalonians', abbrev: '2 Thess', testament: 'NT', group: 'Pauline Epistles', chapters: 3, versesPerChapter: [12,17,18] },
  { name: '1 Timothy', abbrev: '1 Tim', testament: 'NT', group: 'Pauline Epistles', chapters: 6, versesPerChapter: [20,15,16,16,25,21] },
  { name: '2 Timothy', abbrev: '2 Tim', testament: 'NT', group: 'Pauline Epistles', chapters: 4, versesPerChapter: [18,26,17,22] },
  { name: 'Titus', abbrev: 'Titus', testament: 'NT', group: 'Pauline Epistles', chapters: 3, versesPerChapter: [16,15,15] },
  { name: 'Philemon', abbrev: 'Phlm', testament: 'NT', group: 'Pauline Epistles', chapters: 1, versesPerChapter: [25] },
  // New Testament - General Epistles
  { name: 'Hebrews', abbrev: 'Heb', testament: 'NT', group: 'General Epistles', chapters: 13, versesPerChapter: [14,18,19,16,14,20,28,13,28,39,40,29,25] },
  { name: 'James', abbrev: 'Jas', testament: 'NT', group: 'General Epistles', chapters: 5, versesPerChapter: [27,26,18,17,20] },
  { name: '1 Peter', abbrev: '1 Pet', testament: 'NT', group: 'General Epistles', chapters: 5, versesPerChapter: [25,25,22,19,14] },
  { name: '2 Peter', abbrev: '2 Pet', testament: 'NT', group: 'General Epistles', chapters: 3, versesPerChapter: [21,22,18] },
  { name: '1 John', abbrev: '1 John', testament: 'NT', group: 'General Epistles', chapters: 5, versesPerChapter: [10,29,24,21,21] },
  { name: '2 John', abbrev: '2 John', testament: 'NT', group: 'General Epistles', chapters: 1, versesPerChapter: [13] },
  { name: '3 John', abbrev: '3 John', testament: 'NT', group: 'General Epistles', chapters: 1, versesPerChapter: [14] },
  { name: 'Jude', abbrev: 'Jude', testament: 'NT', group: 'General Epistles', chapters: 1, versesPerChapter: [25] },
  // New Testament - Apocalyptic
  { name: 'Revelation', abbrev: 'Rev', testament: 'NT', group: 'Apocalypse', chapters: 22, versesPerChapter: [20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,21] },
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
