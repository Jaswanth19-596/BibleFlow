import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEntities } from './useEntities';
import { useTimelinePeriods } from './useTimelinePeriods';
import {
  getAllEntityRelationships,
  createEntityRelationship,
  updateEntityRelationship,
  deleteEntityRelationship,
  updateEntityAtlasPosition,
  assignEntityToPeriod,
  subscribeToEntityRelationships,
} from '@/lib/supabase';
import { EntityRelationship } from '@/lib/types';

export function usePeopleAtlas() {
  const queryClient = useQueryClient();
  const { entities, loading: entitiesLoading, createEntity, updateEntity, deleteEntity } = useEntities();
  const { periods, loading: periodsLoading, createPeriod, updatePeriod, deletePeriod } = useTimelinePeriods();

  // All people entities
  const people = entities.filter((e) => e.type === 'person');

  // All relationships
  const {
    data: relationships = [],
    isLoading: relsLoading,
  } = useQuery({
    queryKey: ['entity-relationships-all'],
    queryFn: getAllEntityRelationships,
  });

  const createRelMutation = useMutation({
    mutationFn: (rel: Omit<EntityRelationship, 'id' | 'created_at'>) => createEntityRelationship(rel),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entity-relationships-all'] }),
  });

  const updateRelMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<EntityRelationship, 'id' | 'created_at'>> }) => updateEntityRelationship(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entity-relationships-all'] }),
  });

  const deleteRelMutation = useMutation({
    mutationFn: (id: string) => deleteEntityRelationship(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entity-relationships-all'] }),
  });

  const savePositionMutation = useMutation({
    mutationFn: ({ id, x, y }: { id: string; x: number; y: number }) =>
      updateEntityAtlasPosition(id, x, y),
  });

  const assignPeriodMutation = useMutation({
    mutationFn: ({ entityId, periodId }: { entityId: string; periodId: string | null }) =>
      assignEntityToPeriod(entityId, periodId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entities'] }),
  });

  // Real-time subscription for relationships
  useEffect(() => {
    const channel = subscribeToEntityRelationships(() => {
      queryClient.invalidateQueries({ queryKey: ['entity-relationships-all'] });
    });
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return {
    people,
    relationships,
    periods,
    loading: entitiesLoading || periodsLoading || relsLoading,
    createEntity,
    updateEntity,
    deleteEntity,
    createRelationship: createRelMutation.mutateAsync,
    updateRelationship: (id: string, updates: Partial<Omit<EntityRelationship, 'id' | 'created_at'>>) => updateRelMutation.mutateAsync({ id, updates }),
    deleteRelationship: deleteRelMutation.mutateAsync,
    savePosition: (id: string, x: number, y: number) =>
      savePositionMutation.mutateAsync({ id, x, y }),
    assignPeriod: (entityId: string, periodId: string | null) =>
      assignPeriodMutation.mutateAsync({ entityId, periodId }),
    createPeriod,
    updatePeriod,
    deletePeriod,
  };
}
