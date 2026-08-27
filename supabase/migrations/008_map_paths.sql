-- Map paths table for user-marked biblical routes and study paths
CREATE TABLE IF NOT EXISTS map_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#4f46e5',
  style TEXT DEFAULT 'solid' CHECK (style IN ('solid', 'dashed', 'dotted')),
  points JSONB NOT NULL DEFAULT '[]',
  total_distance_km NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_map_paths_created ON map_paths(created_at DESC);

-- Disable RLS (matches existing single-user pattern)
ALTER TABLE map_paths DISABLE ROW LEVEL SECURITY;

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE map_paths;

-- Auto-update timestamps for map_paths
DROP TRIGGER IF EXISTS update_map_paths_updated_at ON map_paths;
CREATE TRIGGER update_map_paths_updated_at
  BEFORE UPDATE ON map_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
