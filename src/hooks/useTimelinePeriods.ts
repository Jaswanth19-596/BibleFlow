import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimelinePeriod } from '@/lib/types';
import {
  getTimelinePeriods,
  createTimelinePeriod,
  updateTimelinePeriod,
  deleteTimelinePeriod,
  subscribeToTimelinePeriods,
} from '@/lib/supabase';

export function useTimelinePeriods() {
  const queryClient = useQueryClient();

  const { data: periods = [], isLoading: loading, error } = useQuery({
    queryKey: ['timeline-periods'],
    queryFn: getTimelinePeriods,
  });

  const createMutation = useMutation({
    mutationFn: (period: Omit<TimelinePeriod, 'id' | 'created_at'>) => createTimelinePeriod(period),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline-periods'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<TimelinePeriod, 'id' | 'created_at'>> }) =>
      updateTimelinePeriod(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline-periods'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTimelinePeriod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeline-periods'] }),
  });

  useEffect(() => {
    const channel = subscribeToTimelinePeriods(() => {
      queryClient.invalidateQueries({ queryKey: ['timeline-periods'] });
    });
    return () => { channel.unsubscribe(); };
  }, [queryClient]);

  return {
    periods,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createPeriod: createMutation.mutateAsync,
    updatePeriod: (id: string, updates: Partial<Omit<TimelinePeriod, 'id' | 'created_at'>>) =>
      updateMutation.mutateAsync({ id, updates }),
    deletePeriod: deleteMutation.mutateAsync,
  };
}
