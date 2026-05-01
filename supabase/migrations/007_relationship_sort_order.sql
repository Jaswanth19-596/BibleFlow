-- Add sort_order to entity_relationships for tracking travel route sequences
ALTER TABLE entity_relationships
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
