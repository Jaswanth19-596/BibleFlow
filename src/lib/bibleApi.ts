// Free KJV Bible API - no API key required
// Uses bible-api.com which provides King James Version text

export interface BibleApiVerse {
  book_id: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleApiResponse {
  reference: string;
  verses: BibleApiVerse[];
  translation: string;
}

export async function fetchKjvVerse(book: string, chapter: number, verse: number): Promise<string | null> {
  try {
    // bible-api.com format: book+chapter+verse like "john+3:16"
    const bookSlug = book.toLowerCase().replace(/\s+/g, '+');
    const query = `${bookSlug}+${chapter}:${verse}`;

    const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`);

    if (!response.ok) {
      console.error('Bible API error:', response.status);
      return null;
    }

    const data: BibleApiResponse = await response.json();

    if (data.verses && data.verses.length > 0) {
      // Join all verse texts (in case of ranges)
      return data.verses.map(v => v.text).join(' ');
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch verse:', error);
    return null;
  }
}

export async function fetchKjvVerseRange(book: string, chapter: number, verseStart: number, verseEnd: number | null): Promise<string | null> {
  if (!verseEnd || verseEnd === verseStart) {
    return fetchKjvVerse(book, chapter, verseStart);
  }

  try {
    const bookSlug = book.toLowerCase().replace(/\s+/g, '+');
    // bible-api supports ranges like "john+3:16-17"
    const query = `${bookSlug}+${chapter}:${verseStart}-${verseEnd}`;

    const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=kjv`);

    if (!response.ok) {
      console.error('Bible API error:', response.status);
      return null;
    }

    const data: BibleApiResponse = await response.json();

    if (data.verses && data.verses.length > 0) {
      return data.verses.map(v => v.text).join(' ');
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch verse range:', error);
    return null;
  }
}
