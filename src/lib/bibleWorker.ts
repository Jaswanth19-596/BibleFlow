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
        console.error('Worker failed to load KJV json', error);
        kjvFetchPromise = null;
        return null;
      });
  }
  
  return kjvFetchPromise;
}

self.addEventListener('message', async (event: MessageEvent) => {
  const { jobId, type, payload } = event.data;

  try {
    if (type === 'fetchKjvVerseRange') {
      const { book, chapter, verseStart, verseEnd } = payload;
      const data = await getKjvData();

      if (!data || !data.verses) {
        self.postMessage({ jobId, result: null });
        return;
      }

      const bookLower = book.toLowerCase();
      const endV = verseEnd && verseEnd >= verseStart ? verseEnd : verseStart;

      const foundVerses = data.verses.filter(v =>
        v.book_name.toLowerCase() === bookLower &&
        v.chapter === chapter &&
        v.verse >= verseStart &&
        v.verse <= endV
      );

      if (foundVerses.length > 0) {
        const text = foundVerses
          .map(v => `[${v.chapter}:${v.verse}] ${v.text.replace(/^[¶\s]+/, '').replace(/[‹›]/g, '')}`.trim())
          .join('\n');
        self.postMessage({ jobId, result: text });
      } else {
        self.postMessage({ jobId, result: null });
      }

    } else if (type === 'fetchKjvBook') {
      const { book } = payload as { book: string };
      const data = await getKjvData();
      if (!data || !data.verses) {
        self.postMessage({ jobId, result: null });
        return;
      }

      const bookLower = book.toLowerCase();
      const text = data.verses
        .filter(verse => verse.book_name.toLowerCase() === bookLower)
        .map(verse => `[${verse.chapter}:${verse.verse}] ${verse.text.replace(/^[¶\s]+/, '').replace(/[‹›]/g, '').trim()}`)
        .join('\n');
      self.postMessage({ jobId, result: text || null });
    } else if (type === 'fetchKjvCustomVerses') {
      // payload.selections: Array<{ chapter: number; verseStart: number; verseEnd: number }>
      const { book, selections } = payload as {
        book: string;
        selections: { chapter: number; verseStart: number; verseEnd: number }[];
      };
      const data = await getKjvData();
      if (!data || !data.verses) {
        self.postMessage({ jobId, result: null });
        return;
      }
      const bookLower = book.toLowerCase();
      const lines: string[] = [];
      for (const sel of selections) {
        const endV = sel.verseEnd >= sel.verseStart ? sel.verseEnd : sel.verseStart;
        const found = data.verses.filter(
          v =>
            v.book_name.toLowerCase() === bookLower &&
            v.chapter === sel.chapter &&
            v.verse >= sel.verseStart &&
            v.verse <= endV
        );
        for (const v of found) {
          lines.push(`[${v.chapter}:${v.verse}] ${v.text.replace(/^[¶\s]+/, '').replace(/[‹›]/g, '').trim()}`);
        }
      }
      if (lines.length > 0) {
        self.postMessage({ jobId, result: lines.join('\n') });
      } else {
        self.postMessage({ jobId, result: null });
      }
    }
  } catch (err) {
    self.postMessage({ jobId, error: err instanceof Error ? err.message : 'Unknown error in worker' });
  }
});
