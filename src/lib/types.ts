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
