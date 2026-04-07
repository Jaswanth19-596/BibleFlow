-- Bible Flow Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verses table
CREATE TABLE IF NOT EXISTS verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER,
  text TEXT DEFAULT '', -- KJV verse text
  note TEXT DEFAULT '',
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'supporting', 'contrast', 'context')),
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections table (edges between verses within a topic)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  to_verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'references' CHECK (type IN ('supports', 'contrasts', 'explains', 'fulfills', 'references')),
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent self-referencing connections
  CHECK (from_verse_id != to_verse_id)
);

-- TopicLinks table (edges between topics)
CREATE TABLE IF NOT EXISTS topic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  to_topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Prevent self-referencing topic links
  CHECK (from_topic_id != to_topic_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verses_topic_id ON verses(topic_id);
CREATE INDEX IF NOT EXISTS idx_connections_from_verse ON connections(from_verse_id);
CREATE INDEX IF NOT EXISTS idx_connections_to_verse ON connections(to_verse_id);
CREATE INDEX IF NOT EXISTS idx_topic_links_from ON topic_links(from_topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_links_to ON topic_links(to_topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_updated ON topics(updated_at DESC);

-- Full-text search index for verses
CREATE INDEX IF NOT EXISTS idx_verses_note_search ON verses USING gin(to_tsvector('english', coalesce(note, '') || ' ' || book));

-- Disable Row Level Security for single-user personal app
-- This allows anonymous access with the anon key
ALTER TABLE topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE verses DISABLE ROW LEVEL SECURITY;
ALTER TABLE connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE topic_links DISABLE ROW LEVEL SECURITY;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE topics;
ALTER PUBLICATION supabase_realtime ADD TABLE verses;
ALTER PUBLICATION supabase_realtime ADD TABLE connections;
ALTER PUBLICATION supabase_realtime ADD TABLE topic_links;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verses_updated_at ON verses;
CREATE TRIGGER update_verses_updated_at
  BEFORE UPDATE ON verses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
