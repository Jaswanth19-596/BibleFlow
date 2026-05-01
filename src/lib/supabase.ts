import { createClient } from '@supabase/supabase-js';
import { Topic, Verse, Connection, TopicLink, VerseWithTopic, Entity, EntityMention, EntityMentionWithEntity, EntityMentionWithVerse, EntityRelationship, EntityType, TimelinePeriod } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Topics
export async function getTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTopic(id: string): Promise<Topic | null> {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function createTopic(topic: Omit<Topic, 'id' | 'created_at' | 'updated_at'>): Promise<Topic> {
  const { data, error } = await supabase
    .from('topics')
    .insert(topic)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTopic(id: string, updates: Partial<Omit<Topic, 'id' | 'created_at'>>): Promise<Topic> {
  const { data, error } = await supabase
    .from('topics')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}

// Verses
export async function getVersesByTopic(topicId: string): Promise<Verse[]> {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createVerse(verse: Omit<Verse, 'id' | 'created_at' | 'updated_at'>): Promise<Verse> {
  const { data, error } = await supabase
    .from('verses')
    .insert(verse)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVerse(id: string, updates: Partial<Omit<Verse, 'id' | 'topic_id' | 'created_at'>>): Promise<Verse> {
  const { data, error } = await supabase
    .from('verses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVersePosition(id: string, x: number, y: number): Promise<void> {
  const { error } = await supabase
    .from('verses')
    .update({ position_x: x, position_y: y, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteVerse(id: string): Promise<void> {
  const { error } = await supabase.from('verses').delete().eq('id', id);
  if (error) throw error;
}

// Connections
export async function getConnectionsByTopic(topicId: string): Promise<Connection[]> {
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('topic_id', topicId);

  if (!verses || verses.length === 0) return [];

  const verseIds = verses.map(v => v.id);
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .in('from_verse_id', verseIds)
    .in('to_verse_id', verseIds);
  if (error) throw error;
  return data || [];
}

export async function createConnection(conn: Omit<Connection, 'id' | 'created_at'>): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .insert(conn)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateConnection(id: string, updates: Partial<Omit<Connection, 'id' | 'created_at'>>): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteConnection(id: string): Promise<void> {
  const { error } = await supabase.from('connections').delete().eq('id', id);
  if (error) throw error;
}

// TopicLinks
export async function getTopicLinks(): Promise<TopicLink[]> {
  const { data, error } = await supabase
    .from('topic_links')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function getTopicLinksByTopic(topicId: string): Promise<TopicLink[]> {
  const { data, error } = await supabase
    .from('topic_links')
    .select('*')
    .or(`from_topic_id.eq.${topicId},to_topic_id.eq.${topicId}`);
  if (error) throw error;
  return data || [];
}

export async function createTopicLink(link: Omit<TopicLink, 'id' | 'created_at'>): Promise<TopicLink> {
  const { data, error } = await supabase
    .from('topic_links')
    .insert(link)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTopicLink(id: string, updates: Partial<Omit<TopicLink, 'id' | 'created_at'>>): Promise<TopicLink> {
  const { data, error } = await supabase
    .from('topic_links')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTopicLink(id: string): Promise<void> {
  const { error } = await supabase.from('topic_links').delete().eq('id', id);
  if (error) throw error;
}

// Search
export async function searchVerses(query: string): Promise<VerseWithTopic[]> {
  const { data, error } = await supabase
    .from('verses')
    .select(`
      *,
      topic:topics(id, name, color)
    `)
    .or(`book.ilike.%${query}%,note.ilike.%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map(d => ({
    ...d,
    topic_name: d.topic?.name,
    topic_color: d.topic?.color,
  }));
}

// Stats
export async function getVerseCountByTopic(topicId: string): Promise<number> {
  const { count, error } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('topic_id', topicId);
  if (error) throw error;
  return count || 0;
}

export async function getConnectionCountByTopic(topicId: string): Promise<number> {
  const { data: verses } = await supabase
    .from('verses')
    .select('id')
    .eq('topic_id', topicId);

  if (!verses || verses.length === 0) return 0;

  const verseIds = verses.map(v => v.id);
  const { count, error } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .in('from_verse_id', verseIds);
  if (error) throw error;
  return count || 0;
}

// Real-time subscriptions
export function subscribeToTopicVerses(topicId: string, callback: () => void) {
  const channel = supabase.channel(`verses-${topicId}-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'verses', filter: `topic_id=eq.${topicId}` }, callback)
    .subscribe();
  return channel;
}

export function subscribeToTopicConnections(callback: () => void) {
  const channel = supabase.channel(`connections-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, callback)
    .subscribe();
  return channel;
}

export function subscribeToTopics(callback: () => void) {
  const channel = supabase.channel(`topics-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, callback)
    .subscribe();
  return channel;
}

export function subscribeToTopicLinks(callback: () => void) {
  const channel = supabase.channel(`topic_links-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topic_links' }, callback)
    .subscribe();
  return channel;
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export async function getEntities(): Promise<Entity[]> {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getEntitiesByType(type: EntityType): Promise<Entity[]> {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('type', type)
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function searchEntities(query: string): Promise<Entity[]> {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(20);
  if (error) throw error;
  return data || [];
}

export async function createEntity(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Promise<Entity> {
  const { data, error } = await supabase
    .from('entities')
    .insert(entity)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntity(id: string, updates: Partial<Omit<Entity, 'id' | 'created_at'>>): Promise<Entity> {
  const { data, error } = await supabase
    .from('entities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntity(id: string): Promise<void> {
  const { error } = await supabase.from('entities').delete().eq('id', id);
  if (error) throw error;
}

// ─── Entity Mentions ──────────────────────────────────────────────────────────

export async function getMentionsByVerse(verseId: string): Promise<EntityMentionWithEntity[]> {
  const { data, error } = await supabase
    .from('entity_mentions')
    .select(`
      *,
      entity:entities(*)
    `)
    .eq('verse_id', verseId);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    entity: d.entity || undefined,
  }));
}

export async function getMentionsByEntity(entityId: string): Promise<EntityMentionWithVerse[]> {
  const { data, error } = await supabase
    .from('entity_mentions')
    .select(`
      *,
      verse:verses(*, topic:topics(id, name, color))
    `)
    .eq('entity_id', entityId);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    ...d,
    verse: d.verse || undefined,
    topic_name: d.verse?.topic?.name,
    topic_color: d.verse?.topic?.color,
  }));
}

export async function createEntityMention(mention: Omit<EntityMention, 'id' | 'created_at'>): Promise<EntityMention> {
  const { data, error } = await supabase
    .from('entity_mentions')
    .insert(mention)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntityMention(id: string): Promise<void> {
  const { error } = await supabase.from('entity_mentions').delete().eq('id', id);
  if (error) throw error;
}

// ─── Entity Relationships ─────────────────────────────────────────────────────

export async function getEntityRelationships(entityId: string): Promise<EntityRelationship[]> {
  const { data, error } = await supabase
    .from('entity_relationships')
    .select('*')
    .or(`from_entity_id.eq.${entityId},to_entity_id.eq.${entityId}`);
  if (error) throw error;
  return data || [];
}

export async function createEntityRelationship(rel: Omit<EntityRelationship, 'id' | 'created_at'>): Promise<EntityRelationship> {
  const { data, error } = await supabase
    .from('entity_relationships')
    .insert(rel)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntityRelationship(id: string, updates: Partial<Omit<EntityRelationship, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase
    .from('entity_relationships')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteEntityRelationship(id: string): Promise<void> {
  const { error } = await supabase.from('entity_relationships').delete().eq('id', id);
  if (error) throw error;
}

// ─── Atlas: Entity Mentions with Book context ────────────────────────────────

export interface AtlasEntityMention {
  mention_id: string;
  entity_id: string;
  entity_name: string;
  entity_type: EntityType;
  entity_color: string;
  entity_description: string;
  verse_book: string;
  verse_chapter: number;
  verse_id: string;
  context: string;
}

export async function getEntityMentionsWithBooks(): Promise<AtlasEntityMention[]> {
  const { data, error } = await supabase
    .from('entity_mentions')
    .select(`
      id,
      entity_id,
      verse_id,
      context,
      entity:entities(id, name, type, color, description),
      verse:verses(id, book, chapter)
    `);
  if (error) throw error;
  return (data || [])
    .filter((d: any) => d.entity && d.verse)
    .map((d: any) => ({
      mention_id: d.id,
      entity_id: d.entity.id,
      entity_name: d.entity.name,
      entity_type: d.entity.type,
      entity_color: d.entity.color,
      entity_description: d.entity.description || '',
      verse_book: d.verse.book,
      verse_chapter: d.verse.chapter,
      verse_id: d.verse.id,
      context: d.context,
    }));
}

// ─── Entity Subscriptions ─────────────────────────────────────────────────────

export function subscribeToEntities(callback: () => void) {
  const channel = supabase.channel(`entities-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entities' }, callback)
    .subscribe();
  return channel;
}

export function subscribeToEntityMentions(callback: () => void) {
  const channel = supabase.channel(`entity_mentions-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entity_mentions' }, callback)
    .subscribe();
  return channel;
}

// ─── Timeline Periods ─────────────────────────────────────────────────────────

export async function getTimelinePeriods(): Promise<TimelinePeriod[]> {
  const { data, error } = await supabase
    .from('timeline_periods')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTimelinePeriod(period: Omit<TimelinePeriod, 'id' | 'created_at'>): Promise<TimelinePeriod> {
  const { data, error } = await supabase
    .from('timeline_periods')
    .insert(period)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTimelinePeriod(id: string, updates: Partial<Omit<TimelinePeriod, 'id' | 'created_at'>>): Promise<TimelinePeriod> {
  const { data, error } = await supabase
    .from('timeline_periods')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTimelinePeriod(id: string): Promise<void> {
  const { error } = await supabase.from('timeline_periods').delete().eq('id', id);
  if (error) throw error;
}

export function subscribeToTimelinePeriods(callback: () => void) {
  const channel = supabase.channel(`timeline_periods-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_periods' }, callback)
    .subscribe();
  return channel;
}

// ─── Atlas helpers ────────────────────────────────────────────────────────────

export async function updateEntityAtlasPosition(id: string, x: number, y: number): Promise<void> {
  const { error } = await supabase
    .from('entities')
    .update({ atlas_x: x, atlas_y: y, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function assignEntityToPeriod(entityId: string, periodId: string | null): Promise<void> {
  const { error } = await supabase
    .from('entities')
    .update({ timeline_period_id: periodId, updated_at: new Date().toISOString() })
    .eq('id', entityId);
  if (error) throw error;
}

export async function getAllEntityRelationships(): Promise<EntityRelationship[]> {
  const { data, error } = await supabase
    .from('entity_relationships')
    .select('*');
  if (error) throw error;
  return data || [];
}

export function subscribeToEntityRelationships(callback: () => void) {
  const channel = supabase.channel(`entity_relationships-${Math.random().toString(36).substring(7)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entity_relationships' }, callback)
    .subscribe();
  return channel;
}
