import { useState, useEffect, useCallback } from 'react';
import { Topic } from '@/lib/types';
import { getTopics, createTopic, updateTopic, deleteTopic, subscribeToTopics } from '@/lib/supabase';

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTopics();
      setTopics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();

    const channel = subscribeToTopics(() => {
      fetchTopics();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchTopics]);

  const create = useCallback(async (topic: { name: string; description: string; color: string }) => {
    const newTopic = await createTopic(topic);
    setTopics(prev => [newTopic, ...prev]);
    return newTopic;
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Omit<Topic, 'id' | 'created_at'>>) => {
    const updated = await updateTopic(id, updates);
    setTopics(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteTopic(id);
    setTopics(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    topics,
    loading,
    error,
    createTopic: create,
    updateTopic: update,
    deleteTopic: remove,
    refetch: fetchTopics,
  };
}
