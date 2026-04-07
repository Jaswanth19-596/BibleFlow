import { useState, useMemo, useCallback, useEffect } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useTopics } from '@/hooks/useTopics';
import { useTopicLinks } from '@/hooks/useTopicLinks';
import { CROSS_TOPIC_COLOR } from '@/lib/edgeTypes';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

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

function TopicNetworkEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: any;
  targetPosition: any;
  data?: { description?: string };
}) {
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <path
        id={id}
        d={`M${sourceX},${sourceY} Q${midX},${midY} ${targetX},${targetY}`}
        fill="none"
        stroke={CROSS_TOPIC_COLOR}
        strokeWidth={2}
        strokeDasharray="5,5"
      />
      {data?.description && (
        <text
          x={midX}
          y={midY - 10}
          textAnchor="middle"
          className="text-xs fill-blue-600 dark:fill-blue-400"
          style={{ fontSize: 10 }}
        >
          {data.description}
        </text>
      )}
    </>
  );
}

const nodeTypes = {
  topic: TopicNodeComponent as any,
};

const edgeTypes = {
  network: TopicNetworkEdgeComponent as any,
};

export default function TopicsNetwork() {
  const navigate = useNavigate();
  const { topics, loading: topicsLoading } = useTopics();
  const { links, loading: linksLoading, createTopicLink } = useTopicLinks();

  const [pendingConnection, setPendingConnection] = useState<{ from: string; to: string } | null>(null);
  const [linkDescription, setLinkDescription] = useState('');

  const computedNodes: Node[] = useMemo(() => {
    if (topics.length === 0) return [];

    // Calculate layout - arrange in a grid pattern that's more visible
    const centerX = 400;
    const centerY = 250;
    const spacingX = 200;
    const spacingY = 120;

    return topics.map((topic, index) => {
      // Arrange in rows of 4
      const row = Math.floor(index / 4);
      const col = index % 4;
      return {
        id: topic.id,
        type: 'topic',
        position: {
          x: centerX + (col - 1.5) * spacingX,
          y: centerY + (row - 1) * spacingY,
        },
        data: {
          topic: { id: topic.id, name: topic.name, color: topic.color },
          onNodeClick: (id: string) => navigate(`/topic/${id}`),
        },
      };
    });
  }, [topics, navigate]);

  const computedEdges: Edge[] = useMemo(() => {
    return links.map((link) => ({
      id: link.id,
      source: link.from_topic_id,
      target: link.to_topic_id,
      type: 'network',
      data: { description: link.description },
    }));
  }, [links]);

  const [nodes, setNodes, onNodesChange] = useNodesState(computedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(computedEdges);

  // Update nodes when topics load
  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes, setNodes]);

  useEffect(() => {
    setEdges(computedEdges);
  }, [computedEdges, setEdges]);

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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'network',
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
            <p className="text-xs text-amber-500">
              Create topics in the Dashboard first
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Click a topic to view. Drag from handles to link topics.
            </p>
          )}
        </div>
      </ReactFlow>

      {/* Create Link Modal */}
      <Modal
        open={pendingConnection !== null}
        onClose={handleCancelLink}
        title="Create Topic Link"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Linking topics:
          </p>
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
            <Button onClick={handleCreateLink}>
              Create Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
