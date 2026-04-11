import { useState, useEffect, useCallback } from 'react';
import { Verse, VerseType } from '@/lib/types';
import {
  getVersesByTopic,
  createVerse,
  updateVerse,
  updateVersePosition,
  deleteVerse,
  subscribeToTopicVerses,
} from '@/lib/supabase';

export function useVerses(topicId: string | undefined) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerses = useCallback(async () => {
    if (!topicId) {
      setVerses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getVersesByTopic(topicId);
      setVerses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch verses');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchVerses();

    if (!topicId) return;

    const channel = subscribeToTopicVerses(topicId, () => {
      fetchVerses();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchVerses, topicId]);

  const create = useCallback(
    async (verse: {
      book: string;
      chapter: number;
      verse_start: number;
      verse_end: number | null;
      text: string;
      note: string;
      type: VerseType;
      position_x: number;
      position_y: number;
    }) => {
      if (!topicId) throw new Error('No topic selected');
      const newVerse = await createVerse({ ...verse, topic_id: topicId });
      setVerses(prev => [...prev, newVerse]);
      return newVerse;
    },
    [topicId]
  );

  const update = useCallback(async (id: string, updates: Partial<Omit<Verse, 'id' | 'topic_id' | 'created_at'>>) => {
    const updated = await updateVerse(id, updates);
    setVerses(prev => prev.map(v => v.id === id ? updated : v));
    return updated;
  }, []);

  const updatePosition = useCallback(async (id: string, x: number, y: number) => {
    await updateVersePosition(id, x, y);
    setVerses(prev => prev.map(v => v.id === id ? { ...v, position_x: x, position_y: y } : v));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteVerse(id);
    setVerses(prev => prev.filter(v => v.id !== id));
  }, []);

  return {
    verses,
    loading,
    error,
    createVerse: create,
    updateVerse: update,
    updateVersePosition: updatePosition,
    deleteVerse: remove,
    refetch: fetchVerses,
  };
}
