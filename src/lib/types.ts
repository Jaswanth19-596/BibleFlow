export type VerseType = 'main' | 'supporting' | 'contrast' | 'context';
export type ConnectionType = 'supports' | 'contrasts' | 'explains' | 'fulfills' | 'references';
export type EdgeType = ConnectionType;

export interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Verse {
  id: string;
  topic_id: string;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number | null;
  text: string; // KJV verse text
  note: string;
  type: VerseType;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  from_verse_id: string;
  to_verse_id: string;
  type: ConnectionType;
  label: string | null;
  anchor_word: string | null;  // Word in the source verse that anchors this connection
  anchor_color: string | null; // Highlight color for the anchored word and edge
  created_at: string;
}

export interface TopicLink {
  id: string;
  from_topic_id: string;
  to_topic_id: string;
  description: string;
  created_at: string;
}

export interface VerseWithTopic extends Verse {
  topic_name?: string;
  topic_color?: string;
}

// ─── Entity system ──────────────────────────────────────────────────────────

export type EntityType = 'person' | 'place' | 'nation' | 'event' | 'object' | 'concept';

export type EntityMentionContext = 'speaker' | 'subject' | 'mentioned' | 'addressed' | 'location' | 'event_ref';

// Custom string — users can type any relationship label
export type EntityRelationType = string;

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  metadata: Record<string, unknown>;
  color: string;
  timeline_period_id: string | null;
  atlas_x: number;
  atlas_y: number;
  lat?: number;
  lng?: number;
  created_at: string;
  updated_at: string;
}

export interface EntityMention {
  id: string;
  entity_id: string;
  verse_id: string;
  context: EntityMentionContext;
  word_anchor: string | null;
  created_at: string;
}

export interface EntityMentionWithEntity extends EntityMention {
  entity?: Entity;
}

export interface EntityMentionWithVerse extends EntityMention {
  verse?: Verse;
  topic_name?: string;
  topic_color?: string;
}

export interface EntityRelationship {
  id: string;
  from_entity_id: string;
  to_entity_id: string;
  type: EntityRelationType;
  description: string;
  sort_order?: number;
  created_at: string;
}

export interface TimelinePeriod {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  band_height: number;
  created_at: string;
}

// ─── Map Paths ─────────────────────────────────────────────────────────────

export type PathLineStyle = 'solid' | 'dashed' | 'dotted';

export interface MapPathPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  place_id?: string;
  kind?: 'biblical' | 'saved' | 'custom';
}

export interface MapPath {
  id: string;
  name: string;
  description: string;
  color: string;
  style: PathLineStyle;
  points: MapPathPoint[];
  total_distance_km?: number;
  created_at: string;
  updated_at: string;
}

