import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPath } from '@/lib/types';
import {
  getMapPaths as getMapPathsApi,
  createMapPath as createMapPathApi,
  updateMapPath as updateMapPathApi,
  deleteMapPath as deleteMapPathApi,
  subscribeToMapPaths,
} from '@/lib/supabase';

const LOCAL_STORAGE_KEY = 'bibleflow_saved_paths';

function getLocalPaths(): MapPath[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPaths(paths: MapPath[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(paths));
  } catch {
    // Ignore localStorage quota errors
  }
}

export function useMapPaths() {
  const queryClient = useQueryClient();

  const {
    data: paths = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['map-paths'],
    queryFn: async (): Promise<MapPath[]> => {
      try {
        const remote = await getMapPathsApi();
        // Sync local storage with latest remote data
        if (remote && remote.length > 0) {
          saveLocalPaths(remote);
          return remote;
        }
        // If remote is empty, check if we have local paths
        const local = getLocalPaths();
        return local.length > 0 ? local : remote;
      } catch (err) {
        console.warn('Failed to fetch remote map paths, using local storage fallback:', err);
        return getLocalPaths();
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newPath: Omit<MapPath, 'id' | 'created_at' | 'updated_at'>): Promise<MapPath> => {
      const now = new Date().toISOString();
      const localId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `path-${Date.now()}`;
      const pathWithMeta: MapPath = {
        ...newPath,
        id: localId,
        created_at: now,
        updated_at: now,
      };

      try {
        const created = await createMapPathApi(newPath);
        // Update local storage
        const current = getLocalPaths();
        saveLocalPaths([created, ...current.filter(p => p.id !== created.id)]);
        return created;
      } catch (err) {
        console.warn('Remote create failed, saving to local storage fallback:', err);
        const current = getLocalPaths();
        saveLocalPaths([pathWithMeta, ...current]);
        return pathWithMeta;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['map-paths'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Omit<MapPath, 'id' | 'created_at'>> }): Promise<MapPath> => {
      try {
        const updated = await updateMapPathApi(id, updates);
        const current = getLocalPaths();
        saveLocalPaths(current.map(p => (p.id === id ? updated : p)));
        return updated;
      } catch (err) {
        console.warn('Remote update failed, updating local storage fallback:', err);
        const current = getLocalPaths();
        const existing = current.find(p => p.id === id);
        const updated: MapPath = existing
          ? { ...existing, ...updates, updated_at: new Date().toISOString() }
          : {
              id,
              name: updates.name ?? 'Untitled Path',
              description: updates.description ?? '',
              color: updates.color ?? '#4f46e5',
              style: updates.style ?? 'solid',
              points: updates.points ?? [],
              total_distance_km: updates.total_distance_km ?? 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
        saveLocalPaths(current.map(p => (p.id === id ? updated : p)));
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['map-paths'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Always remove from local storage
      const current = getLocalPaths();
      saveLocalPaths(current.filter(p => p.id !== id));

      try {
        await deleteMapPathApi(id);
      } catch (err) {
        console.warn('Remote delete failed, local removal complete:', err);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['map-paths'] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    try {
      const channel = subscribeToMapPaths(() => {
        queryClient.invalidateQueries({ queryKey: ['map-paths'] });
      });
      return () => {
        channel.unsubscribe();
      };
    } catch {
      // Ignore realtime subscription errors if table not in publication yet
    }
  }, [queryClient]);

  return {
    paths,
    loading,
    error: error instanceof Error ? error.message : (error as string | null),
    createPath: createMutation.mutateAsync,
    updatePath: (id: string, updates: Partial<Omit<MapPath, 'id' | 'created_at'>>) =>
      updateMutation.mutateAsync({ id, updates }),
    deletePath: deleteMutation.mutateAsync,
    refetch,
  };
}
