import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Topic } from '@/lib/types';
import { getTopics, createTopic, updateTopic, deleteTopic, subscribeToTopics } from '@/lib/supabase';

export function useTopics() {
  const queryClient = useQueryClient();

  const {
    data: topics = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['topics'],
    queryFn: getTopics,
  });

  const createMutation = useMutation({
    mutationFn: (topic: { name: string; description: string; color: string }) => createTopic(topic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Topic, 'id' | 'created_at'>> }) => updateTopic(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTopic(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });

  useEffect(() => {
    const channel = subscribeToTopics(() => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return {
    topics,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createTopic: createMutation.mutateAsync,
    updateTopic: (id: string, updates: Partial<Omit<Topic, 'id' | 'created_at'>>) => updateMutation.mutateAsync({ id, updates }),
    deleteTopic: deleteMutation.mutateAsync,
    refetch,
  };
}
