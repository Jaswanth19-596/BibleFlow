import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const {
    data: verses = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['verses', topicId],
    queryFn: () => getVersesByTopic(topicId!),
    enabled: !!topicId,
  });

  const createMutation = useMutation({
    mutationFn: (verse: {
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
      return createVerse({ ...verse, topic_id: topicId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verses', topicId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Verse, 'id' | 'topic_id' | 'created_at'>> }) => updateVerse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verses', topicId] });
    },
  });

  const updatePositionMutation = useMutation({
    mutationFn: ({ id, x, y }: { id: string; x: number; y: number }) => updateVersePosition(id, x, y),
    onMutate: async ({ id, x, y }) => {
      await queryClient.cancelQueries({ queryKey: ['verses', topicId] });
      const previousVerses = queryClient.getQueryData<Verse[]>(['verses', topicId]);
      if (previousVerses) {
        queryClient.setQueryData<Verse[]>(['verses', topicId], old =>
          old?.map(v => v.id === id ? { ...v, position_x: x, position_y: y } : v)
        );
      }
      return { previousVerses };
    },
    onError: (err, variables, context) => {
      if (context?.previousVerses) {
        queryClient.setQueryData(['verses', topicId], context.previousVerses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['verses', topicId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVerse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verses', topicId] });
    },
  });

  useEffect(() => {
    if (!topicId) return;

    const channel = subscribeToTopicVerses(topicId, () => {
      queryClient.invalidateQueries({ queryKey: ['verses', topicId] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [topicId, queryClient]);

  return {
    verses,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createVerse: createMutation.mutateAsync,
    updateVerse: (id: string, updates: Partial<Omit<Verse, 'id' | 'topic_id' | 'created_at'>>) => updateMutation.mutateAsync({ id, updates }),
    updateVersePosition: (id: string, x: number, y: number) => updatePositionMutation.mutateAsync({ id, x, y }),
    deleteVerse: deleteMutation.mutateAsync,
    refetch,
  };
}
