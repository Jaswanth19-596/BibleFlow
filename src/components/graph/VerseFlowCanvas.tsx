import { useCallback, useMemo, useRef, useEffect } from 'react';
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
} from '@xyflow/react';

import VerseNode from './VerseNode';
import ConnectionEdgeComponent from './ConnectionEdge';
import CrossTopicEdgeComponent from './CrossTopicEdge';
import { Verse, Connection as ConnType, ConnectionType, TopicLink } from '@/lib/types';
import { useDebouncedCallback } from '@/hooks/useDebounce';

interface VerseFlowCanvasProps {
  verses: Verse[];
  connections: ConnType[];
  topicLinks: TopicLink[];
  onCreateConnection: (from: string, to: string, type: ConnectionType) => void;
  onUpdateConnection: (id: string, updates: { type?: ConnectionType; label?: string | null }) => void;
  onDeleteConnection: (id: string) => void;
  onUpdateVersePosition: (id: string, x: number, y: number) => void;
  onVerseClick?: (verse: Verse) => void;
  onVerseDoubleClick?: (verse: Verse) => void;
  onCrossTopicLinkClick?: (link: TopicLink) => void;
  highlightedVerseId?: string | null;
}

const nodeTypes = {
  verse: VerseNode as any,
};

const edgeTypes = {
  connection: ConnectionEdgeComponent as any,
  crossTopic: CrossTopicEdgeComponent as any,
};

export default function VerseFlowCanvas({
  verses,
  connections,
  topicLinks,
  onCreateConnection,
  onUpdateConnection,
  onDeleteConnection,
  onUpdateVersePosition,
  onVerseClick,
  onVerseDoubleClick,
  onCrossTopicLinkClick,
  highlightedVerseId,
}: VerseFlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const initialNodes: Node[] = useMemo(
    () =>
      verses.map((verse) => ({
        id: verse.id,
        type: 'verse',
        position: { x: verse.position_x, y: verse.position_y },
        data: { verse, onClick: onVerseClick, onDoubleClick: onVerseDoubleClick },
        selected: verse.id === highlightedVerseId,
      })),
    [verses, highlightedVerseId, onVerseClick, onVerseDoubleClick]
  );

  const initialEdges: Edge[] = useMemo(() => {
    const connEdges: Edge[] = connections.map((c) => ({
      id: c.id,
      source: c.from_verse_id,
      target: c.to_verse_id,
      type: 'connection',
      data: {
        type: c.type,
        label: c.label,
        onEdit: onUpdateConnection,
        onDelete: onDeleteConnection,
      },
    }));

    const linkEdges: Edge[] = topicLinks.map((link) => ({
      id: `cross-${link.id}`,
      source: link.from_topic_id,
      target: link.to_topic_id,
      type: 'crossTopic',
      data: {
        description: link.description,
        onClick: onCrossTopicLinkClick,
      },
    }));

    return [...connEdges, ...linkEdges];
  }, [connections, topicLinks, onUpdateConnection, onDeleteConnection, onCrossTopicLinkClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when verses change
  useEffect(() => {
    setNodes(
      verses.map((verse) => ({
        id: verse.id,
        type: 'verse',
        position: { x: verse.position_x, y: verse.position_y },
        data: { verse, onClick: onVerseClick, onDoubleClick: onVerseDoubleClick },
        selected: verse.id === highlightedVerseId,
      }))
    );
  }, [verses, highlightedVerseId, onVerseClick, onVerseDoubleClick, setNodes]);

  // Update edges when connections/topicLinks change
  useEffect(() => {
    const connEdges: Edge[] = connections.map((c) => ({
      id: c.id,
      source: c.from_verse_id,
      target: c.to_verse_id,
      type: 'connection',
      data: {
        type: c.type,
        label: c.label,
        onEdit: onUpdateConnection,
        onDelete: onDeleteConnection,
      },
    }));

    const linkEdges: Edge[] = topicLinks.map((link) => ({
      id: `cross-${link.id}`,
      source: link.from_topic_id,
      target: link.to_topic_id,
      type: 'crossTopic',
      data: {
        description: link.description,
        onClick: onCrossTopicLinkClick,
      },
    }));

    setEdges([...connEdges, ...linkEdges]);
  }, [connections, topicLinks, onUpdateConnection, onDeleteConnection, onCrossTopicLinkClick, setEdges]);

  // Debounced position save
  const debouncedSavePosition = useDebouncedCallback(
    (nodeId: string, x: number, y: number) => {
      onUpdateVersePosition(nodeId, x, y);
    },
    500
  );

  const onNodeDragStop = useCallback(
    (_event: any, node: any) => {
      if (node.position) {
        debouncedSavePosition(node.id, node.position.x, node.position.y);
      }
    },
    [debouncedSavePosition]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onCreateConnection(params.source, params.target, 'references');
      }
    },
    [onCreateConnection]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (edge.type === 'connection') {
        onUpdateConnection(edge.id, {});
      }
    },
    [onUpdateConnection]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={() => {}}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'connection',
          animated: false,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>
    </div>
  );
}
