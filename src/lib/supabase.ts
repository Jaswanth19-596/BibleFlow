import { createClient } from '@supabase/supabase-js';
import { Topic, Verse, Connection, TopicLink, VerseWithTopic } from './types';

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
// Remove existing channel first to prevent "already subscribed" errors
export function subscribeToTopic(topicId: string, callback: () => void) {
  const channelName = `topic-${topicId}`;
  supabase.removeChannel(supabase.channel(channelName));
  const channel = supabase.channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'verses', filter: `topic_id=eq.${topicId}` }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, callback)
    .subscribe();
  return channel;
}

export function subscribeToTopics(callback: () => void) {
  supabase.removeChannel(supabase.channel('topics'));
  const channel = supabase.channel('topics')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, callback)
    .subscribe();
  return channel;
}

export function subscribeToTopicLinks(callback: () => void) {
  supabase.removeChannel(supabase.channel('topic_links'));
  const channel = supabase.channel('topic_links')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topic_links' }, callback)
    .subscribe();
  return channel;
}
