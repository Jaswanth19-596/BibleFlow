// Local KJV Database access
// Reads from /kjv.json and caches in memory

export interface LocalKjvVerse {
  book_name: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

export interface LocalKjvData {
  metadata: any;
  verses: LocalKjvVerse[];
}

let kjvCache: LocalKjvData | null = null;
let kjvFetchPromise: Promise<LocalKjvData | null> | null = null;

async function getKjvData(): Promise<LocalKjvData | null> {
  if (kjvCache) return kjvCache;
  
  // Prevent duplicate concurrent requests during initial load
  if (!kjvFetchPromise) {
    kjvFetchPromise = fetch('/kjv.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load kjv.json');
        return res.json();
      })
      .then(data => {
        kjvCache = data;
        return data;
      })
      .catch(error => {
        console.error('Failed to load local KJV json', error);
        kjvFetchPromise = null;
        return null;
      });
  }
  
  return kjvFetchPromise;
}

export async function fetchKjvVerse(book: string, chapter: number, verse: number): Promise<string | null> {
  return fetchKjvVerseRange(book, chapter, verse, verse);
}

export async function fetchKjvVerseRange(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number | null
): Promise<string | null> {
  const data = await getKjvData();
  if (!data || !data.verses) return null;

  const bookLower = book.toLowerCase();
  const endV = verseEnd && verseEnd >= verseStart ? verseEnd : verseStart;

  const foundVerses = data.verses.filter(v =>
    v.book_name.toLowerCase() === bookLower &&
    v.chapter === chapter &&
    v.verse >= verseStart &&
    v.verse <= endV
  );

  if (foundVerses.length > 0) {
    // Strip leading paragraph markers (¶) often found in KJV datasets
    return foundVerses.map(v => v.text.replace(/^[¶\s]+/, '')).join(' ');
  }

  return null;
}
