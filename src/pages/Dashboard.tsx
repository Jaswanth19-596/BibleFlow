import { useState, useEffect, useMemo } from 'react';
import { useTopics } from '@/hooks/useTopics';
import { getVerseCountByTopic, getConnectionCountByTopic } from '@/lib/supabase';
import TopicSearchBar from '@/components/topics/TopicSearchBar';
import TopicGrid from '@/components/topics/TopicGrid';
import NewTopicModal from '@/components/topics/NewTopicModal';
import EditTopicModal from '@/components/topics/EditTopicModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/common/Button';
import { Topic } from '@/lib/types';

export default function Dashboard() {
  const { topics, loading, createTopic, updateTopic, deleteTopic } = useTopics();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [verseCounts, setVerseCounts] = useState<Record<string, number>>({});
  const [connectionCounts, setConnectionCounts] = useState<Record<string, number>>({});
  const [countsLoading, setCountsLoading] = useState(false);

  useEffect(() => {
    const fetchCounts = async () => {
      setCountsLoading(true);
      
      try {
        const results = await Promise.all(
          topics.map(async (topic) => {
            const [vCount, cCount] = await Promise.all([
              getVerseCountByTopic(topic.id),
              getConnectionCountByTopic(topic.id),
            ]);
            return { id: topic.id, vCount, cCount };
          })
        );

        const verse: Record<string, number> = {};
        const conn: Record<string, number> = {};
        
        results.forEach(({ id, vCount, cCount }) => {
          verse[id] = vCount;
          conn[id] = cCount;
        });

        setVerseCounts(verse);
        setConnectionCounts(conn);
      } catch (err) {
        console.error('Failed to fetch topic counts', err);
      } finally {
        setCountsLoading(false);
      }
    };

    if (topics.length > 0) {
      fetchCounts();
    }
  }, [topics]);

  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const query = searchQuery.toLowerCase();
    return topics.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
    );
  }, [topics, searchQuery]);

  const handleCreateTopic = async (data: { name: string; description: string; color: string }) => {
    await createTopic(data);
  };

  const handleEditTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowEditModal(true);
  };

  const handleUpdateTopic = async (data: { name: string; description: string; color: string }) => {
    if (selectedTopic) {
      await updateTopic(selectedTopic.id, data);
    }
  };

  const handleDeleteTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTopic) {
      await deleteTopic(selectedTopic.id);
      setShowDeleteConfirm(false);
      setSelectedTopic(null);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTopic(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setSelectedTopic(null);
  };

  const isLoading = loading || countsLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Topics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your Bible verses by theological concept
          </p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Topic
        </Button>
      </div>

      {topics.length > 0 && (
        <div className="mb-6 max-w-md">
          <TopicSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      )}

      <TopicGrid
        topics={filteredTopics}
        loading={isLoading}
        verseCounts={verseCounts}
        connectionCounts={connectionCounts}
        onEditTopic={handleEditTopic}
        onDeleteTopic={handleDeleteTopic}
      />

      <NewTopicModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSubmit={handleCreateTopic}
      />

      <EditTopicModal
        open={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateTopic}
        topic={selectedTopic}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Delete Topic"
        message={selectedTopic ? `Are you sure you want to delete "${selectedTopic.name}"? This will also delete all verses and connections within this topic.` : ''}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
