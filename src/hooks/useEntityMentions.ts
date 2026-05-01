import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EntityMentionContext } from '@/lib/types';
import {
  getMentionsByVerse,
  getMentionsByEntity,
  createEntityMention,
  deleteEntityMention,
  subscribeToEntityMentions,
} from '@/lib/supabase';

/** Fetch entity mentions for a specific verse (used in VerseNode) */
export function useVerseMentions(verseId: string | undefined) {
  const queryClient = useQueryClient();

  const {
    data: mentions = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['entity-mentions', 'verse', verseId],
    queryFn: () => getMentionsByVerse(verseId!),
    enabled: !!verseId,
  });

  const createMutation = useMutation({
    mutationFn: (mention: { entity_id: string; context: EntityMentionContext; word_anchor?: string | null }) => {
      if (!verseId) throw new Error('No verse selected');
      return createEntityMention({
        entity_id: mention.entity_id,
        verse_id: verseId,
        context: mention.context,
        word_anchor: mention.word_anchor || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-mentions', 'verse', verseId] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions', 'entity'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEntityMention(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity-mentions', 'verse', verseId] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions', 'entity'] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = subscribeToEntityMentions(() => {
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'] });
    });
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return {
    mentions,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createMention: createMutation.mutateAsync,
    deleteMention: deleteMutation.mutateAsync,
  };
}

/** Fetch all verse mentions for a specific entity (used in EntityDetailSidebar / Explorer) */
export function useEntityMentions(entityId: string | undefined) {

  const {
    data: mentions = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['entity-mentions', 'entity', entityId],
    queryFn: () => getMentionsByEntity(entityId!),
    enabled: !!entityId,
  });

  return {
    mentions,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
  };
}
