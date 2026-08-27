export interface BiblicalArea {
  id: string;
  name: string;
  /** Deliberately approximate historical study area, not a political border. */
  boundary: [number, number][];
  books: string[];
  color: string;
  description: string;
}

const OLD_TESTAMENT = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
  'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
];

const GOSPELS_AND_ACTS = ['Matthew', 'Mark', 'Luke', 'John', 'Acts'];

/**
 * Broad historical study areas. Their edges are intentionally translucent and
 * approximate: they provide geographic context without claiming modern or
 * scholarly precise borders for ancient territories.
 */
export const BIBLICAL_AREAS: BiblicalArea[] = [
  {
    id: 'canaan', name: 'Canaan', color: '#b45309', books: OLD_TESTAMENT,
    boundary: [[33.3, 34.4], [33.35, 35.8], [32.7, 36.1], [31.5, 35.9], [29.8, 35.3], [30.0, 34.6], [31.2, 34.4]],
    description: 'Approximate land of Canaan in the Old Testament.',
  },
  {
    id: 'egypt-sinai', name: 'Egypt & Sinai', color: '#0f766e',
    books: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', '1 Kings', '2 Kings', 'Jeremiah', 'Ezekiel'],
    boundary: [[31.5, 29.0], [31.9, 33.4], [30.7, 35.4], [28.2, 35.0], [27.4, 33.4], [28.8, 30.1], [30.5, 29.8]],
    description: 'Egypt, the Sinai wilderness, and the Exodus route region.',
  },
  {
    id: 'mesopotamia', name: 'Mesopotamia & exile', color: '#7c3aed',
    books: ['Genesis', '2 Kings', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel', 'Nahum'],
    boundary: [[37.8, 38.0], [37.0, 45.7], [35.0, 48.6], [29.5, 47.6], [30.2, 43.0], [33.0, 40.0]],
    description: 'The great river lands associated with the patriarchs, empires, and exile.',
  },
  {
    id: 'judea', name: 'Judea', color: '#be123c', books: GOSPELS_AND_ACTS,
    boundary: [[32.1, 34.7], [32.15, 35.5], [31.1, 35.6], [30.9, 35.0], [31.3, 34.7]],
    description: 'Approximate Roman-era Judea, centered on Jerusalem.',
  },
  {
    id: 'samaria-galilee', name: 'Samaria & Galilee', color: '#0369a1', books: GOSPELS_AND_ACTS,
    boundary: [[33.35, 34.8], [33.4, 35.9], [32.15, 35.8], [31.95, 35.0], [32.45, 34.7]],
    description: 'The northern heartland of Jesus’ public ministry.',
  },
  {
    id: 'decapolis-perea', name: 'Decapolis & Perea', color: '#4d7c0f', books: GOSPELS_AND_ACTS,
    boundary: [[33.5, 35.5], [33.4, 36.8], [31.3, 36.5], [30.7, 35.7], [31.5, 35.5]],
    description: 'East-of-Jordan regions in the New Testament setting.',
  },
  {
    id: 'mediterranean-churches', name: 'Mediterranean churches', color: '#4338ca',
    books: ['Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', '1 Peter', 'Revelation'],
    boundary: [[42.5, 10.0], [42.0, 30.8], [37.0, 32.0], [33.0, 28.0], [34.0, 18.0], [38.5, 12.0]],
    description: 'The Mediterranean network of the early church and apostolic journeys.',
  },
];
