-- Batch dashboard counts without transferring verse IDs. SECURITY INVOKER keeps
-- the caller's table permissions and any future RLS policies in effect.
CREATE OR REPLACE FUNCTION public.get_topic_counts(topic_ids uuid[])
RETURNS TABLE(topic_id uuid, verse_count bigint, connection_count bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public
AS $$
  WITH selected_verses AS (
    SELECT id, topic_id FROM public.verses WHERE topic_id = ANY(topic_ids)
  ), verse_counts AS (
    SELECT topic_id, count(*) AS total FROM selected_verses GROUP BY topic_id
  ), connection_counts AS (
    SELECT v.topic_id, count(*) AS total
    FROM selected_verses v JOIN public.connections c ON c.from_verse_id = v.id
    GROUP BY v.topic_id
  )
  SELECT t.id, coalesce(v.total, 0), coalesce(c.total, 0)
  FROM public.topics t
  LEFT JOIN verse_counts v ON v.topic_id = t.id
  LEFT JOIN connection_counts c ON c.topic_id = t.id
  WHERE t.id = ANY(topic_ids);
$$;

-- The existing tsvector index cannot accelerate the substring ILIKE search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_verses_book_trgm ON public.verses USING gin (book gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_verses_note_trgm ON public.verses USING gin (note gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_verses_text_trgm ON public.verses USING gin (text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_verses_topic_created ON public.verses (topic_id, created_at);
