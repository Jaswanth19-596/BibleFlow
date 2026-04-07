import { useState, useEffect, useCallback } from 'react';
import { TopicLink } from '@/lib/types';
import {
  getTopicLinks,
  createTopicLink,
  updateTopicLink,
  deleteTopicLink,
  subscribeToTopicLinks,
} from '@/lib/supabase';

export function useTopicLinks() {
  const [links, setLinks] = useState<TopicLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTopicLinks();
      setLinks(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topic links');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();

    const channel = subscribeToTopicLinks(() => {
      fetchLinks();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchLinks]);

  const create = useCallback(async (link: { from_topic_id: string; to_topic_id: string; description: string }) => {
    const newLink = await createTopicLink(link);
    setLinks(prev => [...prev, newLink]);
    return newLink;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Omit<TopicLink, 'id' | 'created_at'>>) => {
    const updated = await updateTopicLink(id, updates);
    setLinks(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteTopicLink(id);
    setLinks(prev => prev.filter(l => l.id !== id));
  }, []);

  return {
    links,
    loading,
    error,
    createTopicLink: create,
    updateTopicLink: update,
    deleteTopicLink: remove,
    refetch: fetchLinks,
  };
}
