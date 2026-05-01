-- Entity system for contextual Bible study
-- Supports tagging people, places, nations, events, and objects on verses.

-- Generic entity registry
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'person'
    CHECK (type IN ('person', 'place', 'nation', 'event', 'object', 'concept')),
  description TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, type)
);

-- Entity mentions in verses (bridge table)
CREATE TABLE IF NOT EXISTS entity_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  context TEXT DEFAULT 'mentioned'
    CHECK (context IN ('speaker', 'subject', 'mentioned', 'addressed', 'location', 'event_ref')),
  word_anchor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_id, verse_id)
);

-- Entity relationships
CREATE TABLE IF NOT EXISTS entity_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  to_entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'related-to'
    CHECK (type IN (
      'father-of', 'mother-of', 'son-of', 'daughter-of',
      'married-to', 'sibling-of',
      'prophet-to', 'succeeded-by', 'preceded-by',
      'enemy-of', 'ally-of', 'contemporary-of',
      'mentor-of', 'disciple-of',
      'king-of', 'capital-of', 'part-of',
      'related-to'
    )),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (from_entity_id != to_entity_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
CREATE INDEX IF NOT EXISTS idx_entity_mentions_entity ON entity_mentions(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_mentions_verse ON entity_mentions(verse_id);
CREATE INDEX IF NOT EXISTS idx_entity_rels_from ON entity_relationships(from_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_rels_to ON entity_relationships(to_entity_id);

-- Full-text search on entity names
CREATE INDEX IF NOT EXISTS idx_entities_name_search ON entities USING gin(to_tsvector('english', name));

-- Disable RLS (matches existing pattern for single-user app)
ALTER TABLE entities DISABLE ROW LEVEL SECURITY;
ALTER TABLE entity_mentions DISABLE ROW LEVEL SECURITY;
ALTER TABLE entity_relationships DISABLE ROW LEVEL SECURITY;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE entities;
ALTER PUBLICATION supabase_realtime ADD TABLE entity_mentions;
ALTER PUBLICATION supabase_realtime ADD TABLE entity_relationships;

-- Auto-update timestamps for entities
DROP TRIGGER IF EXISTS update_entities_updated_at ON entities;
CREATE TRIGGER update_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
