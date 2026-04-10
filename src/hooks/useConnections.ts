import { useState, useEffect, useCallback } from 'react';
import { Connection, ConnectionType } from '@/lib/types';
import {
  getConnectionsByTopic,
  createConnection,
  updateConnection,
  deleteConnection,
  subscribeToTopic,
} from '@/lib/supabase';

export function useConnections(topicId: string | undefined) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    if (!topicId) {
      setConnections([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getConnectionsByTopic(topicId);
      setConnections(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchConnections();

    if (!topicId) return;

    const channel = subscribeToTopic(topicId, () => {
      fetchConnections();
    });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchConnections, topicId]);

  const create = useCallback(
    async (conn: {
      from_verse_id: string;
      to_verse_id: string;
      type: ConnectionType;
      label: string | null;
      anchor_word?: string | null;
      anchor_color?: string | null;
    }) => {
      const newConn = await createConnection(conn as any);
      setConnections(prev => [...prev, newConn]);
      return newConn;
    },
    []
  );

  const update = useCallback(async (id: string, updates: Partial<Omit<Connection, 'id' | 'created_at'>>) => {
    const updated = await updateConnection(id, updates);
    setConnections(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteConnection(id);
    setConnections(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    connections,
    loading,
    error,
    createConnection: create,
    updateConnection: update,
    deleteConnection: remove,
    refetch: fetchConnections,
  };
}
