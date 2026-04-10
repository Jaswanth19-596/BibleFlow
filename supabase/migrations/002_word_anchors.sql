-- Word Anchor Feature: Add anchor_word and anchor_color to connections
-- Run this in your Supabase SQL Editor

ALTER TABLE connections ADD COLUMN IF NOT EXISTS anchor_word TEXT;
ALTER TABLE connections ADD COLUMN IF NOT EXISTS anchor_color TEXT;
