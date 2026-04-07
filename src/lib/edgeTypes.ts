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
