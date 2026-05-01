import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';
import Select from '@/components/common/Select';
import VerseFlowCanvas from '@/components/graph/VerseFlowCanvas';
import VerseSidebar from '@/components/graph/VerseSidebar';
import ConnectionPopover from '@/components/graph/ConnectionPopover';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TagEntityModal from '@/components/entities/TagEntityModal';
import EntityDetailSidebar from '@/components/entities/EntityDetailSidebar';
import { useTopics } from '@/hooks/useTopics';
import { useVerses } from '@/hooks/useVerses';
import { useConnections } from '@/hooks/useConnections';
import { useTopicLinks } from '@/hooks/useTopicLinks';
import { useDebounce } from '@/hooks/useDebounce';
import { Verse, VerseType, ConnectionType, Entity, EntityMentionWithEntity, EntityMentionContext } from '@/lib/types';
import { getMentionsByVerse, createEntityMention, deleteEntityMention, subscribeToEntityMentions } from '@/lib/supabase';

export default function TopicGraphView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { topics, updateTopic } = useTopics();
  const topic = topics.find((t) => t.id === id);

  const { verses, createVerse, updateVerse, deleteVerse, updateVersePosition } = useVerses(id);
  const { connections, createConnection, updateConnection, deleteConnection } = useConnections(id);
  const { links: topicLinks } = useTopicLinks();

  const [showVerseSidebar, setShowVerseSidebar] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [editingTopicName, setEditingTopicName] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<{
    id: string;
    type: ConnectionType;
    label: string | null;
    anchor_word: string | null;
    anchor_color: string | null;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [verseToDelete, setVerseToDelete] = useState<string | null>(null);

  // In-topic search
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Get topic links for this topic
  const thisTopicLinks = topicLinks.filter((l) => l.from_topic_id === id || l.to_topic_id === id);

  // ─── Entity tagging state ────────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const [tagEntityVerseId, setTagEntityVerseId] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Load entity mentions for all verses in this topic
  const verseIds = verses.map((v) => v.id);
  const { data: allMentionsFlat = [] } = useQuery({
    queryKey: ['entity-mentions-topic', id, verseIds.join(',')],
    queryFn: async () => {
      if (verseIds.length === 0) return [];
      const results = await Promise.all(verseIds.map((vid) => getMentionsByVerse(vid)));
      return results.flat();
    },
    enabled: verseIds.length > 0,
  });

  // Real-time subscription for entity mentions
  useEffect(() => {
    const channel = subscribeToEntityMentions(() => {
      queryClient.invalidateQueries({ queryKey: ['entity-mentions-topic', id] });
    });
    return () => { channel.unsubscribe(); };
  }, [id, queryClient]);

  // Build a Map<verseId, EntityMentionWithEntity[]> for the canvas
  const entityMentionsByVerse = useMemo(() => {
    const map = new Map<string, EntityMentionWithEntity[]>();
    allMentionsFlat.forEach((m) => {
      const list = map.get(m.verse_id) || [];
      list.push(m);
      map.set(m.verse_id, list);
    });
    return map;
  }, [allMentionsFlat]);

  const handleEntityTag = useCallback(async (entityId: string, context: EntityMentionContext) => {
    if (!tagEntityVerseId) return;
    await createEntityMention({
      entity_id: entityId,
      verse_id: tagEntityVerseId,
      context,
      word_anchor: null,
    });
    queryClient.invalidateQueries({ queryKey: ['entity-mentions-topic', id] });
  }, [tagEntityVerseId, id, queryClient]);

  const handleEntityRemove = useCallback(async (mentionId: string) => {
    await deleteEntityMention(mentionId);
    queryClient.invalidateQueries({ queryKey: ['entity-mentions-topic', id] });
  }, [id, queryClient]);

  const handleEntityClick = useCallback((entity: Entity) => {
    setSelectedEntity(entity);
  }, []);

  const handleEntityAddClick = useCallback((verseId: string) => {
    setTagEntityVerseId(verseId);
  }, []);

  useEffect(() => {
    if (topic) {
      setTopicName(topic.name);
    }
  }, [topic]);

  const handleSaveVerse = useCallback(
    async (data: {
      book: string;
      chapter: number;
      verse_start: number;
      verse_end: number | null;
      text: string;
      note: string;
      type: VerseType;
    }) => {
      if (selectedVerse) {
        await updateVerse(selectedVerse.id, data);
      } else {
        // Calculate position for new verse
        const x = 100 + Math.random() * 200;
        const y = 100 + Math.random() * 200;
        await createVerse({ ...data, position_x: x, position_y: y });
      }
      setShowVerseSidebar(false);
      setSelectedVerse(null);
    },
    [selectedVerse, updateVerse, createVerse]
  );

  const handleDeleteVerse = useCallback(async () => {
    if (verseToDelete) {
      await deleteVerse(verseToDelete);
      setShowDeleteConfirm(false);
      setVerseToDelete(null);
      setShowVerseSidebar(false);
      setSelectedVerse(null);
    }
  }, [verseToDelete, deleteVerse]);

  const handleCreateConnection = useCallback(
    async (fromId: string, toId: string, type: ConnectionType, anchorWord?: string, anchorColor?: string) => {
      await createConnection({
        from_verse_id: fromId,
        to_verse_id: toId,
        type,
        label: null,
        anchor_word: anchorWord || null,
        anchor_color: anchorColor || null,
      });
    },
    [createConnection]
  );

  const handleUpdateConnection = useCallback(
    async (id: string, updates: { type?: ConnectionType; label?: string | null }) => {
      const conn = connections.find((c) => c.id === id);
      if (conn) {
        setEditingConnection({
          id,
          type: updates.type || conn.type,
          label: updates.label !== undefined ? updates.label : conn.label,
          anchor_word: conn.anchor_word,
          anchor_color: conn.anchor_color,
        });
      }
    },
    [connections]
  );

  const handleSaveConnection = useCallback(
    async (data: {
      type: ConnectionType;
      label: string | null;
      anchor_word: string | null;
      anchor_color: string | null;
    }) => {
      if (editingConnection) {
        await updateConnection(editingConnection.id, data);
        setEditingConnection(null);
      }
    },
    [editingConnection, updateConnection]
  );

  const handleTopicNameSave = useCallback(async () => {
    if (topic && topicName.trim() && topicName !== topic.name) {
      await updateTopic(topic.id, { name: topicName.trim() });
    }
    setEditingTopicName(false);
  }, [topic, topicName, updateTopic]);

  const handleExportPNG = useCallback(async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#f9fafb',
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `${topic?.name || 'topic'}-graph.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    }
  }, [topic]);

  const handleVerseClick = useCallback((verse: Verse) => {
    setSelectedVerse(verse);
    setShowVerseSidebar(true);
  }, []);

  const handleVerseDoubleClick = useCallback((verse: Verse) => {
    // Could open verse in a modal or external reference
    console.log('Double clicked verse:', verse);
  }, []);

  const handleCrossTopicLinkClick = useCallback(
    (link: { from_topic_id: string; to_topic_id: string }) => {
      const targetId = link.from_topic_id === id ? link.to_topic_id : link.from_topic_id;
      navigate(`/topic/${targetId}`);
    },
    [id, navigate]
  );

  const handleAddVerse = () => {
    setSelectedVerse(null);
    setShowVerseSidebar(true);
  };

  const handleCloseVerseModal = () => {
    setShowVerseSidebar(false);
    setSelectedVerse(null);
  };

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading topic...</p>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button variant="ghost" onClick={() => navigate('/topics/network')}>
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Network
            </Button>

            {editingTopicName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-64"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTopicNameSave();
                    if (e.key === 'Escape') {
                      setTopicName(topic.name);
                      setEditingTopicName(false);
                    }
                  }}
                />
                <Button size="sm" onClick={handleTopicNameSave}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setTopicName(topic.name); setEditingTopicName(false); }}>
                  Cancel
                </Button>
              </div>
            ) : (
              <h1
                className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap"
                onClick={() => setEditingTopicName(true)}
              >
                {topic.name}
              </h1>
            )}

            {/* In-Topic Search Bar */}
            <div className="relative flex items-center flex-1 max-w-xs ml-2">
              <svg
                className="absolute left-2.5 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                id="topic-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search verses in this topic…"
                className="w-full pl-8 pr-7 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-shadow"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" onClick={handleAddVerse}>
              <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Verse
            </Button>
            <Button variant="secondary" onClick={() => setShowLinkModal(true)}>
              <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Link Topic
            </Button>
            <Button variant="ghost" onClick={handleExportPNG}>
              <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="absolute inset-0 pt-16">
        <VerseFlowCanvas
          verses={verses}
          connections={connections}
          topicLinks={thisTopicLinks}
          onCreateConnection={handleCreateConnection}
          onUpdateConnection={handleUpdateConnection}
          onDeleteConnection={deleteConnection}
          onUpdateVersePosition={updateVersePosition}
          onVerseClick={handleVerseClick}
          onVerseDoubleClick={handleVerseDoubleClick}
          onCrossTopicLinkClick={handleCrossTopicLinkClick}
          searchQuery={debouncedSearch}
          entityMentionsByVerse={entityMentionsByVerse}
          onEntityClick={handleEntityClick}
          onEntityRemove={handleEntityRemove}
          onEntityAddClick={handleEntityAddClick}
        />
      </div>

      {/* Connection Edit Popover */}
      {editingConnection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <ConnectionPopover
            open={true}
            onClose={() => setEditingConnection(null)}
            onSave={handleSaveConnection}
            onDelete={() => { if (editingConnection) { deleteConnection(editingConnection.id); setEditingConnection(null); } }}
            initialType={editingConnection.type}
            initialLabel={editingConnection.label}
            initialAnchorWord={editingConnection.anchor_word}
            initialAnchorColor={editingConnection.anchor_color}
          />
        </div>
      )}

      {/* Link Topic Modal */}
      <LinkTopicModal
        open={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        currentTopicId={id!}
        topics={topics}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteVerse}
        title="Delete Verse"
        message="Are you sure you want to delete this verse? All connections to this verse will also be deleted."
        confirmText="Delete"
      />

      {/* Verse Add/Edit Modal */}
      <Modal
        open={showVerseSidebar}
        onClose={handleCloseVerseModal}
        title={selectedVerse ? 'Edit Verse' : 'Add Verse'}
        size="lg"
      >
        <VerseSidebar
          verse={selectedVerse}
          onSave={handleSaveVerse}
          onDelete={selectedVerse ? () => { setVerseToDelete(selectedVerse.id); setShowDeleteConfirm(true); } : undefined}
          onClose={handleCloseVerseModal}
        />
      </Modal>

      {/* Entity Tag Modal */}
      <TagEntityModal
        open={!!tagEntityVerseId}
        onClose={() => setTagEntityVerseId(null)}
        onTag={handleEntityTag}
        existingEntityIds={
          tagEntityVerseId
            ? (entityMentionsByVerse.get(tagEntityVerseId) || []).map((m) => m.entity_id)
            : []
        }
      />

      {/* Entity Detail Sidebar */}
      {selectedEntity && (
        <EntityDetailSidebar
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </>
  );
}

// Link Topic Modal
interface LinkTopicModalProps {
  open: boolean;
  onClose: () => void;
  currentTopicId: string;
  topics: { id: string; name: string }[];
}

function LinkTopicModal({ open, onClose, currentTopicId, topics }: LinkTopicModalProps) {
  const [targetTopicId, setTargetTopicId] = useState('');
  const [description, setDescription] = useState('');
  const { createTopicLink } = useTopicLinks();

  const otherTopics = topics.filter((t) => t.id !== currentTopicId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTopicId) return;

    await createTopicLink({
      from_topic_id: currentTopicId,
      to_topic_id: targetTopicId,
      description: description.trim(),
    });

    setTargetTopicId('');
    setDescription('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Link to Topic" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Topic"
          value={targetTopicId}
          options={otherTopics.map((t) => ({ value: t.id, label: t.name }))}
          onChange={(e) => setTargetTopicId(e.target.value)}
          placeholder="Choose a topic..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Relationship Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Faith leads to Salvation"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!targetTopicId}>
            Create Link
          </Button>
        </div>
      </form>
    </Modal>
  );
}
