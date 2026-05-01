import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Entity } from '@/lib/types';
import {
  getEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  searchEntities as searchEntitiesApi,
  subscribeToEntities,
} from '@/lib/supabase';

export function useEntities() {
  const queryClient = useQueryClient();

  const {
    data: entities = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['entities'],
    queryFn: getEntities,
  });

  const createMutation = useMutation({
    mutationFn: (entity: Omit<Entity, 'id' | 'created_at' | 'updated_at'>) => createEntity(entity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Entity, 'id' | 'created_at'>> }) =>
      updateEntity(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEntity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      queryClient.invalidateQueries({ queryKey: ['entity-mentions'] });
    },
  });

  const searchMutation = useMutation({
    mutationFn: (query: string) => searchEntitiesApi(query),
  });

  // Real-time subscription
  useEffect(() => {
    const channel = subscribeToEntities(() => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
    });
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return {
    entities,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createEntity: createMutation.mutateAsync,
    updateEntity: (id: string, updates: Partial<Omit<Entity, 'id' | 'created_at'>>) =>
      updateMutation.mutateAsync({ id, updates }),
    deleteEntity: deleteMutation.mutateAsync,
    searchEntities: searchMutation.mutateAsync,
    refetch,
  };
}
