import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TopicLink } from '@/lib/types';
import {
  getTopicLinks,
  createTopicLink,
  updateTopicLink,
  deleteTopicLink,
  subscribeToTopicLinks,
} from '@/lib/supabase';

export function useTopicLinks() {
  const queryClient = useQueryClient();

  const {
    data: links = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['topicLinks'],
    queryFn: getTopicLinks,
  });

  const createMutation = useMutation({
    mutationFn: (link: { from_topic_id: string; to_topic_id: string; description: string }) => createTopicLink(link),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicLinks'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<TopicLink, 'id' | 'created_at'>> }) => updateTopicLink(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicLinks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTopicLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicLinks'] });
    },
  });

  useEffect(() => {
    const channel = subscribeToTopicLinks(() => {
      queryClient.invalidateQueries({ queryKey: ['topicLinks'] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  return {
    links,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createTopicLink: createMutation.mutateAsync,
    updateTopicLink: (id: string, updates: Partial<Omit<TopicLink, 'id' | 'created_at'>>) => updateMutation.mutateAsync({ id, updates }),
    deleteTopicLink: deleteMutation.mutateAsync,
    refetch,
  };
}
