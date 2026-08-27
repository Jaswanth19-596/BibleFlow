let worker: Worker | null = null;
let currentJobId = 0;
const pendingJobs = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

function initWorker() {
  if (!worker) {
    // Note: In Vite, Web Workers are instantiated using this specific syntax
    worker = new Worker(new URL('./bibleWorker.ts', import.meta.url), { type: 'module' });
    
    worker.onmessage = (e: MessageEvent) => {
      const { jobId, result, error } = e.data;
      const job = pendingJobs.get(jobId);
      if (job) {
        if (error) {
          job.reject(new Error(error));
        } else {
          job.resolve(result);
        }
        pendingJobs.delete(jobId);
      }
    };
  }
  return worker;
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
  const w = initWorker();
  const jobId = currentJobId++;

  return new Promise((resolve, reject) => {
    pendingJobs.set(jobId, { resolve, reject });
    w.postMessage({
      jobId,
      type: 'fetchKjvVerseRange',
      payload: { book, chapter, verseStart, verseEnd }
    });
  });
}

/** Fetch an entire locally-cached KJV book as `[chapter:verse] text` lines. */
export async function fetchKjvBook(book: string): Promise<string | null> {
  const w = initWorker();
  const jobId = currentJobId++;

  return new Promise((resolve, reject) => {
    pendingJobs.set(jobId, { resolve, reject });
    w.postMessage({ jobId, type: 'fetchKjvBook', payload: { book } });
  });
}

export interface VerseSelection {
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

/**
 * Fetch KJV text for a custom list of verse selections (single verses and/or ranges,
 * possibly spanning multiple chapters). Returns a multi-line string where each line
 * is prefixed with [ch:v].
 */
export async function fetchKjvCustomVerses(
  book: string,
  selections: VerseSelection[]
): Promise<string | null> {
  const w = initWorker();
  const jobId = currentJobId++;

  return new Promise((resolve, reject) => {
    pendingJobs.set(jobId, { resolve, reject });
    w.postMessage({
      jobId,
      type: 'fetchKjvCustomVerses',
      payload: { book, selections }
    });
  });
}
