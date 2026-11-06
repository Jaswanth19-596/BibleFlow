import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEntities } from './useEntities';
import { useTimelinePeriods } from './useTimelinePeriods';
import {
  getAllEntityRelationships,
  getRelationshipDefinitions,
  saveAtlasRelationship,
  setAtlasParents,
  createEntityRelationship,
  updateEntityRelationship,
  deleteEntityRelationship,
  updateEntityAtlasPosition,
  assignEntityToPeriod,
  subscribeToEntityRelationships,
} from '@/lib/supabase';
import { Entity, EntityRelationship } from '@/lib/types';

const EMPTY_RELATIONSHIPS: EntityRelationship[] = [];

export function usePeopleAtlas() {
  const queryClient = useQueryClient();
  const { entities, loading: entitiesLoading, error: entitiesError, createEntity, updateEntity, deleteEntity, refetch: refetchEntities } = useEntities();
  const { periods, loading: periodsLoading, createPeriod, updatePeriod, deletePeriod, reorderPeriods, error: periodsError } = useTimelinePeriods();

  // All people entities
  const people = useMemo(() => entities.filter((e) => e.type === 'person'), [entities]);

  // All relationships
  const {
    data: relationships = EMPTY_RELATIONSHIPS,
    isLoading: relsLoading,
    error: relationshipsError,
    refetch: refetchRelationships,
  } = useQuery({
    queryKey: ['entity-relationships-all'],
    queryFn: getAllEntityRelationships,
  });

  const definitionsQuery = useQuery({ queryKey: ['relationship-definitions'], queryFn: getRelationshipDefinitions });
  const invalidateRelationships = () => {
    queryClient.invalidateQueries({ queryKey: ['entity-relationships-all'] });
    queryClient.invalidateQueries({ queryKey: ['entity-relationships'] });
    queryClient.invalidateQueries({ queryKey: ['relationship-definitions'] });
  };
  const saveAtlasMutation = useMutation({ mutationFn: saveAtlasRelationship, onSuccess: invalidateRelationships });
  const parentsMutation = useMutation({ mutationFn: ({ child, parents, parentage, period }: { child: string; parents: string[]; parentage: string; period: string | null }) => setAtlasParents(child, parents, parentage, period), onSuccess: invalidateRelationships });

  const createRelMutation = useMutation({
    mutationFn: (rel: Omit<EntityRelationship, 'id' | 'created_at'>) => createEntityRelationship(rel),
    onSuccess: invalidateRelationships,
  });

  const updateRelMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<EntityRelationship, 'id' | 'created_at'>> }) => updateEntityRelationship(id, updates),
    onSuccess: invalidateRelationships,
  });

  const deleteRelMutation = useMutation({
    mutationFn: (id: string) => deleteEntityRelationship(id),
    onSuccess: invalidateRelationships,
  });

  const savePositionMutation = useMutation({
    mutationFn: ({ id, x, y }: { id: string; x: number; y: number }) =>
      updateEntityAtlasPosition(id, x, y),
    onMutate: async ({ id, x, y }) => {
      await queryClient.cancelQueries({ queryKey: ['entities'] });
      const previous = queryClient.getQueryData<Entity[]>(['entities']);
      queryClient.setQueryData<Entity[]>(['entities'], rows => rows?.map(e => e.id === id ? { ...e, atlas_x: x, atlas_y: y } : e));
      return { previous, id, x, y };
    },
    onError: (_error, _variables, context) => {
      const old = context?.previous?.find(e => e.id === context.id);
      if (old) queryClient.setQueryData<Entity[]>(['entities'], rows => rows?.map(e => e.id === old.id && e.atlas_x === context?.x && e.atlas_y === context?.y ? { ...e, atlas_x: old.atlas_x, atlas_y: old.atlas_y } : e));
    },
  });

  const assignPeriodMutation = useMutation({
    mutationFn: ({ entityId, periodId }: { entityId: string; periodId: string | null }) =>
      assignEntityToPeriod(entityId, periodId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entities'] }),
  });

  const includeAtlasDetails = definitionsQuery.data?.ready === true;
  // Real-time subscription for relationships
  useEffect(() => {
    const channel = subscribeToEntityRelationships(() => {
      queryClient.invalidateQueries({ queryKey: ['entity-relationships-all'] });
      queryClient.invalidateQueries({ queryKey: ['entity-relationships'] });
      queryClient.invalidateQueries({ queryKey: ['relationship-definitions'] });
    }, includeAtlasDetails);
    return () => { channel.unsubscribe(); };
  }, [queryClient, includeAtlasDetails]);

  return {
    people,
    entities,
    definitions: definitionsQuery.data?.definitions,
    schemaReady: definitionsQuery.data?.ready ?? false,
    error: entitiesError || periodsError || relationshipsError || definitionsQuery.error,
    retry: () => { refetchEntities(); refetchRelationships(); definitionsQuery.refetch(); queryClient.invalidateQueries({ queryKey: ['timeline-periods'] }); },
    saveRelationship: saveAtlasMutation.mutateAsync,
    setParents: parentsMutation.mutateAsync,
    relationships,
    periods,
    loading: entitiesLoading || periodsLoading || relsLoading || definitionsQuery.isLoading,
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
    reorderPeriods,
  };
}
