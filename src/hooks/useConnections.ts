import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Connection, ConnectionType } from '@/lib/types';
import {
  getConnectionsByTopic,
  createConnection,
  updateConnection,
  deleteConnection,
  subscribeToTopicConnections,
} from '@/lib/supabase';

export function useConnections(topicId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: connections = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['connections', topicId],
    queryFn: () => getConnectionsByTopic(topicId!),
    enabled: !!topicId,
  });

  const createMutation = useMutation({
    mutationFn: async (conn: {
      from_verse_id: string;
      to_verse_id: string;
      type: ConnectionType;
      label: string | null;
      anchor_word?: string | null;
      anchor_color?: string | null;
    }) => {
      return createConnection({
        ...conn,
        anchor_word: conn.anchor_word ?? null,
        anchor_color: conn.anchor_color ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections', topicId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Connection, 'id' | 'created_at'>> }) => updateConnection(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections', topicId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections', topicId] });
    },
  });

  useEffect(() => {
    if (!topicId) return;

    const channel = subscribeToTopicConnections(() => {
      queryClient.invalidateQueries({ queryKey: ['connections', topicId] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [topicId, queryClient]);

  return {
    connections,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createConnection: createMutation.mutateAsync,
    updateConnection: (id: string, updates: Partial<Omit<Connection, 'id' | 'created_at'>>) => updateMutation.mutateAsync({ id, updates }),
    deleteConnection: deleteMutation.mutateAsync,
    refetch,
  };
}
