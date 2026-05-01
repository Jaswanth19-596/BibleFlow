import { ConnectionType } from './types';

export const EDGE_COLORS: Record<ConnectionType, string> = {
  supports: '#22c55e',
  contrasts: '#ef4444',
  explains: '#a855f7',
  fulfills: '#f59e0b',
  references: '#6b7280',
};

export const EDGE_LABELS: Record<ConnectionType, string> = {
  supports: 'Supports',
  contrasts: 'Contrasts',
  explains: 'Explains',
  fulfills: 'Fulfills',
  references: 'References',
};

export const CROSS_TOPIC_COLOR = '#3b82f6';
export const EDGE_STYLE = { strokeWidth: 2 };

export const VERSE_TYPE_COLORS = {
  main: '#6366f1',
  supporting: '#22c55e',
  contrast: '#ef4444',
  context: '#6b7280',
} as const;

// Color palette for word anchors — distinct from edge type colors
export const ANCHOR_COLOR_PALETTE = [
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#e879f9', // fuchsia
];

// ─── Entity type constants ────────────────────────────────────────────────────
import { EntityType, EntityRelationType } from './types';

export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  person: '#6366f1',   // indigo
  place: '#22c55e',    // green
  nation: '#f59e0b',   // amber
  event: '#ef4444',    // red
  object: '#8b5cf6',   // violet
  concept: '#06b6d4',  // cyan
};

export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  person: '👤',
  place: '📍',
  nation: '🏛️',
  event: '⚡',
  object: '📜',
  concept: '💡',
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  person: 'Person',
  place: 'Place',
  nation: 'Nation',
  event: 'Event',
  object: 'Object',
  concept: 'Concept',
};

export const ENTITY_RELATION_LABELS: Record<EntityRelationType, string> = {
  'father-of': 'Father of',
  'mother-of': 'Mother of',
  'son-of': 'Son of',
  'daughter-of': 'Daughter of',
  'married-to': 'Married to',
  'sibling-of': 'Sibling of',
  'prophet-to': 'Prophet to',
  'succeeded-by': 'Succeeded by',
  'preceded-by': 'Preceded by',
  'enemy-of': 'Enemy of',
  'ally-of': 'Ally of',
  'contemporary-of': 'Contemporary of',
  'mentor-of': 'Mentor of',
  'disciple-of': 'Disciple of',
  'king-of': 'King of',
  'capital-of': 'Capital of',
  'part-of': 'Part of',
  'related-to': 'Related to',
};

