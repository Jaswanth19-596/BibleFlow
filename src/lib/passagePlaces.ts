import { BIBLICAL_PLACE_CLUSTERS, BiblicalPlaceCluster } from '@/data/biblicalPlaces';

export interface PassageSelection {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
}

export interface PassagePlaceMatch {
  place: BiblicalPlaceCluster;
  /** Verses in the selected passage that identify this location. */
  verses: number[];
  /** Names that were found in the KJV passage text. */
  matchedNames: string[];
  /** Catalog references that fall within the requested range. */
  catalogReferences: string[];
}

export interface PassageStudy {
  selection: PassageSelection;
  matches: PassagePlaceMatch[];
}

export interface BookPlaceMatch {
  place: BiblicalPlaceCluster;
  /** Every literal place-name occurrence found in the selected book. */
  references: string[];
  /** Biblical names or spelling variants found in the selected book. */
  matchedNames: string[];
}

interface PassageTextVerse {
  chapter: number;
  verse: number;
  text: string;
}

const NAME_MATCH_EXCLUSIONS = new Set([
  // These are valid geographic terms in the catalog but too ambiguous to infer
  // from untagged prose alone. They still match through a catalog reference.
  'sin', 'sea', 'wilderness', 'plain', 'valley', 'mount', 'river', 'land',
]);
const SHORT_UNAMBIGUOUS_PLACE_NAMES = new Set(['ai', 'ur']);
// The catalog uses common modern/transliterated forms while the KJV sometimes
// uses an older English spelling. Keep these explicit so a book lens remains
// faithful to the text a reader is looking at (for example Judges 1:18).
const SCRIPTURE_NAME_VARIANTS: Record<string, string[]> = {
  acco: ['accho'],
  ashkelon: ['askelon'],
  'beth-anath': ['bethanath'],
  'beth-shean': ['bethshean'],
  sidon: ['zidon'],
};

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const unique = <T,>(values: T[]) => Array.from(new Set(values));

export function formatPassageLabel({ book, chapter, verseStart, verseEnd }: PassageSelection) {
  if (verseStart === verseEnd) return `${book} ${chapter}:${verseStart}`;
  return `${book} ${chapter}:${verseStart}–${verseEnd}`;
}

export function formatPassageVerseLabel(selection: PassageSelection, verses: number[]) {
  const sorted = [...verses].sort((a, b) => a - b);
  if (!sorted.length) return formatPassageLabel(selection);
  const portions = sorted.map(verse => `${selection.chapter}:${verse}`);
  return `${selection.book} ${portions.join(', ')}`;
}

function parsePassageText(text: string | null): PassageTextVerse[] {
  if (!text) return [];
  return text.split('\n').flatMap(line => {
    const match = line.match(/^\[(\d+):(\d+)\]\s*(.*)$/);
    return match ? [{ chapter: Number(match[1]), verse: Number(match[2]), text: match[3] }] : [];
  });
}

function referenceVersesInSelection(reference: string, selection: PassageSelection): number[] {
  const match = reference.match(/\s(\d+):(\d+)(?:-(\d+))?$/);
  if (!match || Number(match[1]) !== selection.chapter) return [];

  const start = Number(match[2]);
  const end = Number(match[3] ?? match[2]);
  const result: number[] = [];
  for (let verse = Math.max(start, selection.verseStart); verse <= Math.min(end, selection.verseEnd); verse += 1) {
    result.push(verse);
  }
  return result;
}

function namesFoundInVerse(place: BiblicalPlaceCluster, text: string) {
  const normalizedText = ` ${normalize(text)} `;
  const names = unique([place.name, ...place.aliases].flatMap(name => [
    name,
    ...(SCRIPTURE_NAME_VARIANTS[normalize(name)] ?? []),
  ]))
    .map(name => ({ name, normalized: normalize(name) }))
    .filter(({ normalized }) => (normalized.length >= 3 || SHORT_UNAMBIGUOUS_PLACE_NAMES.has(normalized)) && !NAME_MATCH_EXCLUSIONS.has(normalized))
    .sort((a, b) => b.normalized.length - a.normalized.length);

  return names
    .filter(({ normalized }) => normalizedText.includes(` ${normalized} `))
    .map(({ name }) => name);
}

/**
 * Find places mentioned anywhere in an already-loaded KJV book. This extends
 * a book lens beyond OpenBible's representative-coordinate verse, which is
 * not intended to be an exhaustive concordance of every place occurrence.
 */
export function findPlacesInBook(
  book: string,
  bookText: string | null,
  places: BiblicalPlaceCluster[] = BIBLICAL_PLACE_CLUSTERS,
): BookPlaceMatch[] {
  const matches = new Map<string, { place: BiblicalPlaceCluster; references: string[]; matchedNames: string[] }>();

  for (const verse of parsePassageText(bookText)) {
    for (const place of places) {
      const names = namesFoundInVerse(place, verse.text);
      if (!names.length) continue;

      const match = matches.get(place.id) ?? { place, references: [], matchedNames: [] };
      const reference = `${book} ${verse.chapter}:${verse.verse}`;
      if (!match.references.includes(reference)) match.references.push(reference);
      for (const name of names) if (!match.matchedNames.includes(name)) match.matchedNames.push(name);
      matches.set(place.id, match);
    }
  }

  return Array.from(matches.values()).sort((a, b) =>
    a.references[0].localeCompare(b.references[0])
    || a.place.importance - b.place.importance
    || a.place.name.localeCompare(b.place.name)
  );
}

/**
 * Match an already-loaded KJV passage against the Bible-first place catalog.
 * Literal KJV name matches catch what a reader sees; catalog verse references
 * supplement names translated differently in the KJV (for example, a region
 * expressed as “the south”). If the local text is unavailable, the catalog
 * still provides a resilient fallback.
 */
export function findPlacesInPassage(
  selection: PassageSelection,
  passageText: string | null,
  places: BiblicalPlaceCluster[] = BIBLICAL_PLACE_CLUSTERS,
): PassagePlaceMatch[] {
  const passageVerses = parsePassageText(passageText);

  const matches = places.flatMap(place => {
    const catalogReferences = (place.referencesByBook[selection.book] ?? [])
      .filter(reference => referenceVersesInSelection(reference, selection).length > 0);
    const catalogVerses = catalogReferences.flatMap(reference => referenceVersesInSelection(reference, selection));

    const textMatches = passageVerses.flatMap(({ verse, text }) => {
      const matchedNames = namesFoundInVerse(place, text);
      return matchedNames.length ? [{ verse, matchedNames }] : [];
    });

    const verses = unique([
      ...catalogVerses,
      ...textMatches.map(match => match.verse),
    ]).sort((a, b) => a - b);

    if (!verses.length) return [];
    return [{
      place,
      verses,
      matchedNames: unique(textMatches.flatMap(match => match.matchedNames)),
      catalogReferences,
    }];
  });

  return matches.sort((a, b) =>
    a.verses[0] - b.verses[0]
    || a.place.importance - b.place.importance
    || a.place.name.localeCompare(b.place.name)
  );
}
