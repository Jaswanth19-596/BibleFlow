-- Add latitude and longitude columns to entities table
ALTER TABLE entities
ADD COLUMN IF NOT EXISTS lat NUMERIC,
ADD COLUMN IF NOT EXISTS lng NUMERIC;

-- Create an index to quickly find places with coordinates
CREATE INDEX IF NOT EXISTS idx_entities_coordinates ON entities(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
