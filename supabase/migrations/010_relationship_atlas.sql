-- Additive Atlas semantics and evidence. Existing type strings and route ordering survive.
BEGIN;
CREATE TABLE IF NOT EXISTS relationship_definitions (
  id text PRIMARY KEY, label text NOT NULL CHECK (length(trim(label)) > 0),
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('family','religious','political','geography','other')),
  "symmetric" boolean NOT NULL DEFAULT false, inverse_label text,
  parent_direction text CHECK (parent_direction IN ('source','target'))
);
INSERT INTO relationship_definitions(id,label,category,"symmetric",inverse_label,parent_direction) VALUES
('father-of','father of','family',false,null,'source'),
('mother-of','mother of','family',false,null,'source'),
('parent-of','parent of','family',false,'child of','source'),
('son-of','son of','family',false,null,'target'),
('daughter-of','daughter of','family',false,null,'target'),
('child-of','child of','family',false,'parent of','target'),
('ancestor-of','ancestor of','family',false,'descendant of',null),
('descendant-of','descendant of','family',false,'ancestor of',null),
('married-to','married to','family',true,null,null),
('concubine-of','concubine of','family',false,null,null),
('sibling-of','sibling of','family',true,null,null),
('priest-of','priest of','religious',false,null,null),
('high-priest-of','high priest of','religious',false,null,null),
('prophet-of','prophet of','religious',false,null,null),
('prophet-to','prophet to','religious',false,null,null),
('served-under','served under','religious',false,null,null),
('disciple-of','disciple of','religious',false,'mentor of',null),
('mentor-of','mentor of','religious',false,'disciple of',null),
('king-of','king of','political',false,null,null),
('queen-of','queen of','political',false,null,null),
('member-of','member of','political',false,null,null),
('ally-of','ally of','political',true,null,null),
('enemy-of','enemy of','political',true,null,null),
('succeeded-by','succeeded by','political',false,'preceded by',null),
('preceded-by','preceded by','political',false,'succeeded by',null),
('lived-in','lived in','geography',false,null,null),
('born-in','born in','geography',false,null,null),
('traveled-to','traveled to','geography',false,null,null),
('capital-of','capital of','geography',false,null,null),
('part-of','part of','geography',false,null,null),
('related-to','related to','other',true,null,null)
ON CONFLICT (id) DO NOTHING;
ALTER TABLE entity_relationships ADD COLUMN IF NOT EXISTS definition_id text REFERENCES relationship_definitions(id);
ALTER TABLE entity_relationships ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}';
-- Only classify exact known labels. Do not assert direct/biological parentage.
UPDATE entity_relationships r SET definition_id = d.id FROM relationship_definitions d
WHERE r.definition_id IS NULL AND lower(regexp_replace(trim(r.type),'[-[:space:]]+',' ','g')) = d.label;
CREATE TABLE IF NOT EXISTS relationship_evidence (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id uuid NOT NULL REFERENCES entity_relationships(id) ON DELETE CASCADE,
  book text NOT NULL CHECK (length(trim(book)) > 0), chapter integer NOT NULL CHECK (chapter > 0),
  verse_start integer NOT NULL CHECK (verse_start > 0), verse_end integer CHECK (verse_end >= verse_start),
  note text NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_relationship_definition ON entity_relationships(definition_id);
CREATE INDEX IF NOT EXISTS idx_relationship_evidence ON relationship_evidence(relationship_id);
-- UUID remains identity. Same-name people must not be silently merged.
ALTER TABLE entities DROP CONSTRAINT IF EXISTS entities_name_type_key;
-- Match the existing single-user entity access model. All RPCs are SECURITY INVOKER.
ALTER TABLE relationship_definitions DISABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_evidence DISABLE ROW LEVEL SECURITY;
GRANT SELECT,INSERT,UPDATE,DELETE ON relationship_definitions,relationship_evidence TO anon,authenticated;

CREATE OR REPLACE FUNCTION atlas_check_parentage(p_parent uuid,p_child uuid,p_exclude uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF p_parent = p_child THEN RAISE EXCEPTION 'A person cannot be their own parent.'; END IF;
  IF EXISTS (
    WITH RECURSIVE links AS (
      SELECT CASE WHEN d.parent_direction='source' THEN r.from_entity_id ELSE r.to_entity_id END AS parent,
             CASE WHEN d.parent_direction='source' THEN r.to_entity_id ELSE r.from_entity_id END AS child
      FROM entity_relationships r JOIN relationship_definitions d ON d.id=r.definition_id
      WHERE d.parent_direction IS NOT NULL AND r.metadata->>'lineage_scope'='direct'
        AND r.metadata->>'status'='explicit' AND (p_exclude IS NULL OR r.id<>p_exclude)
    ), descendants(id) AS (
      SELECT child FROM links WHERE parent=p_child
      UNION SELECT l.child FROM links l JOIN descendants d ON l.parent=d.id
    ) SELECT 1 FROM descendants WHERE id=p_parent
  ) THEN RAISE EXCEPTION 'This direct-parent relationship would create an ancestry cycle.'; END IF;
END; $$;

CREATE OR REPLACE FUNCTION atlas_save_relationship(p_draft jsonb)
RETURNS uuid LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  rel_id uuid := nullif(p_draft->>'id','')::uuid;
  source_id uuid := (p_draft->>'from_entity_id')::uuid;
  target_id uuid := (p_draft->>'to_entity_id')::uuid;
  label_text text := trim(p_draft->>'type');
  normalized text := lower(regexp_replace(label_text,'[-[:space:]]+',' ','g'));
  definition relationship_definitions;
  meta jsonb := coalesce(p_draft->'metadata','{}');
  e jsonb;
BEGIN
  IF jsonb_typeof(meta)<>'object' OR jsonb_typeof(coalesce(p_draft->'evidence','[]'))<>'array' THEN RAISE EXCEPTION 'Relationship context and evidence have an invalid format.'; END IF;
  -- Serialize Atlas writes for duplicate/cycle checks across clients.
  PERFORM pg_advisory_xact_lock(810010);
  IF source_id IS NULL OR target_id IS NULL OR source_id=target_id OR coalesce(label_text,'')='' THEN
    RAISE EXCEPTION 'Choose two different entities and a relationship label.';
  END IF;
  SELECT * INTO definition FROM relationship_definitions WHERE lower(regexp_replace(trim(label),'[-[:space:]]+',' ','g'))=normalized ORDER BY id LIMIT 1;
  IF NOT FOUND THEN
    INSERT INTO relationship_definitions(id,label,category,"symmetric")
      VALUES ('custom:'||normalized,label_text,coalesce(p_draft->>'category','other'),coalesce((p_draft->>'symmetric')::boolean,false))
      ON CONFLICT(id) DO NOTHING;
    SELECT * INTO definition FROM relationship_definitions WHERE id='custom:'||normalized;
  END IF;
  IF coalesce(meta->>'status','unspecified') NOT IN ('unspecified','explicit','inferred','disputed')
    OR coalesce(meta->>'lineage_scope','unspecified') NOT IN ('unspecified','direct','ancestor')
    OR coalesce(meta->>'parentage','unspecified') NOT IN ('unspecified','biological','adoptive','legal') THEN
    RAISE EXCEPTION 'Choose valid assertion and parentage context.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM entity_relationships r LEFT JOIN relationship_definitions d ON d.id=r.definition_id
    WHERE (rel_id IS NULL OR r.id<>rel_id)
      AND coalesce(r.metadata->>'period_id','')=coalesce(meta->>'period_id','')
      AND coalesce(r.metadata->>'status','unspecified')=coalesce(meta->>'status','unspecified')
      AND coalesce(r.metadata->>'lineage_scope','unspecified')=coalesce(meta->>'lineage_scope','unspecified')
      AND coalesce(r.metadata->>'parentage','unspecified')=coalesce(meta->>'parentage','unspecified')
      AND (
        (r.from_entity_id=source_id AND r.to_entity_id=target_id AND lower(regexp_replace(trim(r.type),'[-[:space:]]+',' ','g'))=normalized)
        OR (definition."symmetric" AND r.from_entity_id=target_id AND r.to_entity_id=source_id AND d.id=definition.id)
        OR (d.inverse_label IS NOT NULL AND lower(d.inverse_label)=normalized AND r.from_entity_id=target_id AND r.to_entity_id=source_id)
        OR (d.parent_direction IS NOT NULL AND definition.parent_direction IS NOT NULL
          AND (CASE WHEN d.parent_direction='source' THEN r.from_entity_id ELSE r.to_entity_id END)=(CASE WHEN definition.parent_direction='source' THEN source_id ELSE target_id END)
          AND (CASE WHEN d.parent_direction='source' THEN r.to_entity_id ELSE r.from_entity_id END)=(CASE WHEN definition.parent_direction='source' THEN target_id ELSE source_id END))
      )
  ) THEN RAISE EXCEPTION 'This assertion already exists with the same context. Edit it to add evidence.'; END IF;
  IF meta->>'lineage_scope'='direct' AND meta->>'status'='explicit' AND definition.parent_direction IS NOT NULL THEN
    IF (SELECT count(*) FROM entities WHERE id IN (source_id,target_id) AND type='person')<>2 THEN RAISE EXCEPTION 'Direct parents and children must be people.'; END IF;
    PERFORM atlas_check_parentage(CASE WHEN definition.parent_direction='source' THEN source_id ELSE target_id END,
      CASE WHEN definition.parent_direction='source' THEN target_id ELSE source_id END, rel_id);
  END IF;
  IF rel_id IS NULL THEN
    INSERT INTO entity_relationships(from_entity_id,to_entity_id,type,description,definition_id,metadata)
      VALUES(source_id,target_id,label_text,coalesce(p_draft->>'description',''),definition.id,meta) RETURNING id INTO rel_id;
  ELSE
    UPDATE entity_relationships SET from_entity_id=source_id,to_entity_id=target_id,type=label_text,
      description=coalesce(p_draft->>'description',''),definition_id=definition.id,metadata=meta WHERE id=rel_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'This relationship no longer exists. Reload and try again.'; END IF;
  END IF;
  DELETE FROM relationship_evidence WHERE relationship_id=rel_id;
  FOR e IN SELECT value FROM jsonb_array_elements(coalesce(p_draft->'evidence','[]')) LOOP
    INSERT INTO relationship_evidence(relationship_id,book,chapter,verse_start,verse_end,note)
      VALUES(rel_id,e->>'book',(e->>'chapter')::integer,(e->>'verse_start')::integer,(e->>'verse_end')::integer,coalesce(e->>'note',''));
  END LOOP;
  RETURN rel_id;
END; $$;

CREATE OR REPLACE FUNCTION atlas_set_parents(p_child uuid,p_parents uuid[],p_parentage text DEFAULT 'unspecified',p_period uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SET search_path = public AS $$
DECLARE parent_id uuid; existing_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(810010);
  IF p_parents IS NULL OR cardinality(p_parents)<1 OR cardinality(p_parents)>2 OR cardinality(p_parents)<>(SELECT count(DISTINCT x) FROM unnest(p_parents) x)
    OR p_child=ANY(p_parents) THEN RAISE EXCEPTION 'Choose one or two different parents.'; END IF;
  IF p_parentage IS NULL OR p_parentage NOT IN ('unspecified','biological','adoptive','legal') THEN RAISE EXCEPTION 'Choose a valid parentage context.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM entities WHERE id=p_child AND type='person') THEN RAISE EXCEPTION 'Choose a person as the child.'; END IF;
  FOREACH parent_id IN ARRAY p_parents LOOP
    IF NOT EXISTS(SELECT 1 FROM entities WHERE id=parent_id AND type='person') THEN RAISE EXCEPTION 'Choose people as parents.'; END IF;
    PERFORM atlas_check_parentage(parent_id,p_child);
    SELECT r.id INTO existing_id FROM entity_relationships r
      JOIN relationship_definitions d ON d.id=r.definition_id
      WHERE ((d.parent_direction='source' AND r.from_entity_id=parent_id AND r.to_entity_id=p_child)
         OR (d.parent_direction='target' AND r.to_entity_id=parent_id AND r.from_entity_id=p_child))
      AND coalesce(r.metadata->>'parentage','unspecified')=p_parentage
      AND coalesce(r.metadata->>'period_id','')=coalesce(p_period::text,'')
      AND coalesce(r.metadata->>'lineage_scope','unspecified')<>'ancestor'
      AND coalesce(r.metadata->>'status','unspecified') NOT IN ('disputed','inferred')
      ORDER BY r.created_at LIMIT 1;
    IF existing_id IS NULL THEN
      INSERT INTO entity_relationships(from_entity_id,to_entity_id,type,definition_id,metadata)
        VALUES(parent_id,p_child,'parent of','parent-of',jsonb_build_object('status','explicit','lineage_scope','direct','parentage',p_parentage,'period_id',p_period));
    ELSE
      UPDATE entity_relationships SET metadata=metadata||jsonb_build_object('status','explicit','lineage_scope','direct','parentage',p_parentage,'period_id',p_period) WHERE id=existing_id;
    END IF;
  END LOOP;
END; $$;
DO $$ BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='relationship_definitions') THEN ALTER PUBLICATION supabase_realtime ADD TABLE relationship_definitions; END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='relationship_evidence') THEN ALTER PUBLICATION supabase_realtime ADD TABLE relationship_evidence; END IF;
END; $$;
COMMIT;
