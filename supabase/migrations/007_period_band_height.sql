-- Add per-period band height for resizable timeline bands
-- Run this in your Supabase SQL Editor

ALTER TABLE timeline_periods
  ADD COLUMN IF NOT EXISTS band_height INTEGER NOT NULL DEFAULT 300;
