-- People Atlas: Timeline Periods + Entity extensions
-- Run this in your Supabase SQL Editor

-- 1. Timeline periods table
CREATE TABLE IF NOT EXISTS timeline_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add atlas columns to entities
ALTER TABLE entities ADD COLUMN IF NOT EXISTS timeline_period_id UUID REFERENCES timeline_periods(id) ON DELETE SET NULL;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS atlas_x FLOAT DEFAULT 0;
ALTER TABLE entities ADD COLUMN IF NOT EXISTS atlas_y FLOAT DEFAULT 0;

-- 3. RLS
ALTER TABLE timeline_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to timeline_periods" ON timeline_periods
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE timeline_periods;
