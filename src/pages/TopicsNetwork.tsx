import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Handle,
  Position,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTopics } from '@/hooks/useTopics';
import { useTopicLinks } from '@/hooks/useTopicLinks';
import { CROSS_TOPIC_COLOR } from '@/lib/edgeTypes';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';

interface TopicNodeData {
  topic: {
    id: string;
    name: string;
    color: string;
  };
  onNodeClick?: (id: string) => void;
}

function TopicNodeComponent({ data }: { data: TopicNodeData }) {
  return (
    <div
      className="topic-node"
      style={{ borderColor: data.topic.color }}
      onClick={() => data.onNodeClick?.(data.topic.id)}
    >
      <Handle type="target" position={Position.Top} style={{ background: data.topic.color }} />
      <Handle type="source" position={Position.Bottom} style={{ background: data.topic.color }} />
      {data.topic.name}
    </div>
  );
}

const nodeTypes = {
  topic: TopicNodeComponent as any,
};

const STORAGE_KEY = 'topicsNetworkPositions';

export default function TopicsNetwork() {
  const navigate = useNavigate();
  const { topics, loading: topicsLoading } = useTopics();
  const { links, loading: linksLoading, createTopicLink, updateTopicLink, deleteTopicLink } = useTopicLinks();

  // Load saved positions from localStorage
  const loadSavedPositions = useCallback((): Map<string, { x: number; y: number }> => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Map(Object.entries(parsed));
      }
    } catch {
      // ignore parse errors
    }
    return new Map();
  }, []);

  // Save positions to localStorage
  const savePositions = useCallback((nodes: Node[]) => {
    try {
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach((node) => {
        positions[node.id] = node.position;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Calculate initial node positions
  const calculateInitialNodes = useCallback((): Node[] => {
    if (topics.length === 0) return [];

    const savedPositions = loadSavedPositions();
    const centerX = 400;
    const centerY = 250;
    const spacingX = 200;
    const spacingY = 120;

    return topics.map((topic, index) => {
      const row = Math.floor(index / 4);
      const col = index % 4;
      const defaultPosition = {
        x: centerX + (col - 1.5) * spacingX,
        y: centerY + (row - 1) * spacingY,
      };

      const savedPosition = savedPositions.get(topic.id);

      return {
        id: topic.id,
        type: 'topic',
        position: savedPosition || defaultPosition,
        data: {
          topic: { id: topic.id, name: topic.name, color: topic.color },
          onNodeClick: (id: string) => navigate(`/topic/${id}`),
        },
      };
    });
  }, [topics, navigate, loadSavedPositions]);

  // Initialize with empty arrays, then populate once data loads
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Track if we've done initial setup
  const hasInitializedNodes = useRef(false);
  const hasInitializedEdges = useRef(false);

  // Initialize nodes when topics first load (only once)
  useEffect(() => {
    if (!hasInitializedNodes.current && topics.length > 0 && !topicsLoading) {
      setNodes(calculateInitialNodes());
      hasInitializedNodes.current = true;
    }
  }, [topics, topicsLoading, calculateInitialNodes, setNodes]);

  // Initialize edges when links first load (only once)
  useEffect(() => {
    if (!hasInitializedEdges.current && !linksLoading) {
      const initialEdges = links.map((link) => ({
        id: link.id,
        source: link.from_topic_id,
        target: link.to_topic_id,
        type: 'default' as const,
        label: link.description || '',
        style: { stroke: CROSS_TOPIC_COLOR, strokeWidth: 3, strokeDasharray: '5,5' },
        labelStyle: { fill: CROSS_TOPIC_COLOR, fontSize: 12, fontWeight: 500 },
        labelBgStyle: { fill: 'white', stroke: CROSS_TOPIC_COLOR, strokeWidth: 2, rx: 12 },
        labelBgPadding: [8, 4],
      }));
      setEdges(initialEdges);
      hasInitializedEdges.current = true;
    }
  }, [links, linksLoading, setEdges]);

  // Update edges data when links change, but preserve the edge objects to prevent blinking
  useEffect(() => {
    if (!hasInitializedEdges.current) return;

    setEdges((prevEdges) => {
      const currentLinkIds = new Set(links.map(l => l.id));
      const prevEdgeIds = new Set(prevEdges.map(e => e.id));

      // Remove edges that no longer exist
      const keptEdges = prevEdges.filter(e => currentLinkIds.has(e.id));

      // Add new edges
      const newEdges = links
        .filter(link => !prevEdgeIds.has(link.id))
        .map(link => ({
          id: link.id,
          source: link.from_topic_id,
          target: link.to_topic_id,
          type: 'default' as const,
          label: link.description || '',
          style: { stroke: CROSS_TOPIC_COLOR, strokeWidth: 3, strokeDasharray: '5,5' },
          labelStyle: { fill: CROSS_TOPIC_COLOR, fontSize: 12, fontWeight: 500 },
          labelBgStyle: { fill: 'white', stroke: CROSS_TOPIC_COLOR, strokeWidth: 2, rx: 12 },
          labelBgPadding: [8, 4],
        }));

      // Update labels for existing edges without recreating them
      const updatedEdges = keptEdges.map(edge => {
        const link = links.find(l => l.id === edge.id);
        if (link && edge.label !== link.description) {
          return { ...edge, label: link.description || '' };
        }
        return edge;
      });

      return [...updatedEdges, ...newEdges];
    });
  }, [links, setEdges]);

  // Save positions when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      savePositions(nodes);
    }
  }, [nodes, savePositions]);

  // Modal states
  const [pendingConnection, setPendingConnection] = useState<{ from: string; to: string } | null>(null);
  const [linkDescription, setLinkDescription] = useState('');
  const [editingLink, setEditingLink] = useState<{ id: string; description: string } | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && params.source !== params.target) {
        setPendingConnection({ from: params.source, to: params.target });
        setLinkDescription('');
      }
    },
    []
  );

  const handleCreateLink = async () => {
    if (pendingConnection) {
      await createTopicLink({
        from_topic_id: pendingConnection.from,
        to_topic_id: pendingConnection.to,
        description: linkDescription.trim(),
      });
      setPendingConnection(null);
      setLinkDescription('');
    }
  };

  const handleCancelLink = () => {
    setPendingConnection(null);
    setLinkDescription('');
  };

  // Edge click handler - works with default edges
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const link = links.find((l) => l.id === edge.id);
      if (link) {
        setEditingLink({ id: edge.id, description: link.description || '' });
        setEditDescription(link.description || '');
      }
    },
    [links]
  );

  const handleSaveLink = async () => {
    if (editingLink) {
      await updateTopicLink(editingLink.id, { description: editDescription.trim() });
      setEditingLink(null);
      setEditDescription('');
    }
  };

  const handleDeleteLink = async () => {
    if (editingLink) {
      await deleteTopicLink(editingLink.id);
      setEditingLink(null);
      setEditDescription('');
      setShowDeleteConfirm(false);
    }
  };

  const handleCloseEditModal = () => {
    setEditingLink(null);
    setEditDescription('');
    setShowDeleteConfirm(false);
  };

  if (topicsLoading || linksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Loading network...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md z-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Topic Network</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {topics.length} topics, {links.length} connections
          </p>
          {topics.length === 0 ? (
            <p className="text-xs text-amber-500">Create topics in the Dashboard first</p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Click a topic to view. Drag from handles to link topics. Click a link to edit.
            </p>
          )}
        </div>
      </ReactFlow>

      {/* Create Link Modal */}
      <Modal open={pendingConnection !== null} onClose={handleCancelLink} title="Create Topic Link" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Linking topics:</p>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: topics.find((t) => t.id === pendingConnection?.from)?.color || '#6b7280',
                color: 'white',
              }}
            >
              {topics.find((t) => t.id === pendingConnection?.from)?.name}
            </span>
            <span className="text-gray-400">→</span>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: topics.find((t) => t.id === pendingConnection?.to)?.color || '#6b7280',
                color: 'white',
              }}
            >
              {topics.find((t) => t.id === pendingConnection?.to)?.name}
            </span>
          </div>
          <Input
            label="Relationship description"
            value={linkDescription}
            onChange={(e) => setLinkDescription(e.target.value)}
            placeholder="e.g., Faith leads to Salvation"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleCancelLink}>
              Cancel
            </Button>
            <Button onClick={handleCreateLink}>Create Link</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Link Modal */}
      <Modal open={editingLink !== null} onClose={handleCloseEditModal} title="Edit Link" size="sm">
        {!showDeleteConfirm ? (
          <div className="space-y-4">
            <Input
              label="Relationship description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="e.g., Faith leads to Salvation"
            />
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleCloseEditModal}>
                  Cancel
                </Button>
                <Button onClick={handleSaveLink}>Save</Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this link? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteLink}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
