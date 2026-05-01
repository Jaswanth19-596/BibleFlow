import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';

import VerseNode from './VerseNode';
import ConnectionEdgeComponent from './ConnectionEdge';
import CrossTopicEdgeComponent from './CrossTopicEdge';
import { Verse, Connection as ConnType, ConnectionType, TopicLink, Entity, EntityMentionWithEntity } from '@/lib/types';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { ANCHOR_COLOR_PALETTE } from '@/lib/edgeTypes';
import type { AnchorHighlight } from './VerseNode';
import { parseAnchorKey } from '@/lib/utils';
import { formatVerseRef } from '@/lib/bibleBooks';

interface PendingAnchor {
  verseId: string;
  word: string; // This holds the anchor_key format e.g. "0:the"
  color: string;
}

interface VerseFlowCanvasProps {
  verses: Verse[];
  connections: ConnType[];
  topicLinks: TopicLink[];
  onCreateConnection: (
    from: string,
    to: string,
    type: ConnectionType,
    anchorWord?: string,
    anchorColor?: string
  ) => void;
  onUpdateConnection: (
    id: string,
    updates: { type?: ConnectionType; label?: string | null }
  ) => void;
  onDeleteConnection: (id: string) => void;
  onUpdateVersePosition: (id: string, x: number, y: number) => void;
  onVerseClick?: (verse: Verse) => void;
  onVerseDoubleClick?: (verse: Verse) => void;
  onCrossTopicLinkClick?: (link: TopicLink) => void;
  highlightedVerseId?: string | null;
  searchQuery?: string | null;
  // Entity tagging
  entityMentionsByVerse?: Map<string, EntityMentionWithEntity[]>;
  onEntityClick?: (entity: Entity) => void;
  onEntityRemove?: (mentionId: string) => void;
  onEntityAddClick?: (verseId: string) => void;
}

const nodeTypes: NodeTypes = {
  verse: VerseNode,
};

const edgeTypes: EdgeTypes = {
  connection: ConnectionEdgeComponent,
  crossTopic: CrossTopicEdgeComponent,
};

/** Build a map of verseId → established anchor highlights from currently loaded connections */
function buildHighlightsMap(connections: ConnType[]): Map<string, AnchorHighlight[]> {
  const map = new Map<string, AnchorHighlight[]>();
  connections.forEach((c) => {
    if (c.anchor_word && c.anchor_color) {
      const list = map.get(c.from_verse_id) || [];
      // Deduplicate by word key — keep first occurrence
      if (!list.find((h) => h.word === c.anchor_word)) {
        list.push({ word: c.anchor_word, color: c.anchor_color });
      }
      map.set(c.from_verse_id, list);
    }
  });
  return map;
}

/** Compute the closest pair of handles between two nodes based on their positions. */
function getOptimalHandles(source: Verse | undefined, target: Verse | undefined) {
  if (!source || !target) return { sourceHandle: 'source-bottom', targetHandle: 'target-top' };
  
  // Approximate center of a standard verse node
  const sx = source.position_x + 130;
  const sy = source.position_y + 80;
  const tx = target.position_x + 130;
  const ty = target.position_y + 80;

  const dx = tx - sx;
  const dy = ty - sy;

  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    return dx > 0
      ? { sourceHandle: 'source-right', targetHandle: 'target-left' }
      : { sourceHandle: 'source-left', targetHandle: 'target-right' };
  } else {
    // Vertical connection
    return dy > 0
      ? { sourceHandle: 'source-bottom', targetHandle: 'target-top' }
      : { sourceHandle: 'source-top', targetHandle: 'target-bottom' };
  }
}

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
  searchQuery,
  entityMentionsByVerse,
  onEntityClick,
  onEntityRemove,
  onEntityAddClick,
}: VerseFlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // ─── Word-anchor state ──────────────────────────────────────────────────────
  const [pendingAnchor, setPendingAnchor] = useState<PendingAnchor | null>(null);

  /** Handle word click in a verse node */
  const handleWordClick = useCallback(
    (verseId: string, wordKey: string) => {
      setPendingAnchor((prev) => {
        // Toggle off if clicking the same verse + wordKey
        if (prev?.verseId === verseId && prev?.word === wordKey) return null;

        // Re-use existing anchor color if this word is already anchored
        const existing = connections.find(
          (c) => c.from_verse_id === verseId && c.anchor_word === wordKey && c.anchor_color
        );
        if (existing?.anchor_color) {
          return { verseId, word: wordKey, color: existing.anchor_color };
        }

        // Pick next palette color based on how many anchors this verse already has
        const anchoredCount = connections.filter(
          (c) => c.from_verse_id === verseId && c.anchor_word
        ).length;
        const color = ANCHOR_COLOR_PALETTE[anchoredCount % ANCHOR_COLOR_PALETTE.length];
        return { verseId, word: wordKey, color };
      });
    },
    [connections]
  );

  // ─── Node data builder ──────────────────────────────────────────────────────
  const buildNodes = useCallback(
    (verseList: Verse[], highlightsMap: Map<string, AnchorHighlight[]>): Node[] => {
      const q = searchQuery?.trim().toLowerCase() || '';
      const activeSearch = q.length >= 2;

      // Pre-compute which verse IDs match the query
      const matchIds = activeSearch
        ? new Set(
            verseList
              .filter((v) => {
                // Abbreviated ref as shown in the node header, e.g. "Isa 14:1"
                const abbrevRef = formatVerseRef(v.book, v.chapter, v.verse_start, v.verse_end);
                // Full name ref, e.g. "Isaiah 14:1"
                const fullRef = v.verse_end && v.verse_end !== v.verse_start
                  ? `${v.book} ${v.chapter}:${v.verse_start}-${v.verse_end}`
                  : `${v.book} ${v.chapter}:${v.verse_start}`;
                // Standalone chapter:verse, e.g. "14:1"
                const chapterVerse = `${v.chapter}:${v.verse_start}`;

                const haystack = [
                  v.text,
                  v.note,
                  v.book,
                  abbrevRef,
                  fullRef,
                  chapterVerse,
                ]
                  .join(' ')
                  .toLowerCase();
                return haystack.includes(q);
              })
              .map((v) => v.id)
          )
        : null;

      return verseList.map((verse) => ({
        id: verse.id,
        type: 'verse',
        position: { x: verse.position_x, y: verse.position_y },
        data: {
          verse,
          onClick: onVerseClick,
          onDoubleClick: onVerseDoubleClick,
          connectionHighlights: highlightsMap.get(verse.id) || [],
          pendingAnchorWord:
            pendingAnchor?.verseId === verse.id ? pendingAnchor.word : null,
          pendingAnchorColor:
            pendingAnchor?.verseId === verse.id ? pendingAnchor.color : null,
          onWordClick: handleWordClick,
          searchQuery: activeSearch ? q : null,
          isSearchMatch: matchIds ? matchIds.has(verse.id) : false,
          isSearchDimmed: matchIds ? !matchIds.has(verse.id) : false,
          // Entity data
          entityMentions: entityMentionsByVerse?.get(verse.id) || [],
          onEntityClick,
          onEntityRemove,
          onEntityAddClick,
        },
        selected: verse.id === highlightedVerseId,
      }));
    },
    [onVerseClick, onVerseDoubleClick, pendingAnchor, handleWordClick, highlightedVerseId, searchQuery, entityMentionsByVerse, onEntityClick, onEntityRemove, onEntityAddClick]
  );

  // ─── Edge data builder ──────────────────────────────────────────────────────
  const buildEdges = useCallback((verseList: Verse[]): Edge[] => {
    const verseMap = new Map(verseList.map((v) => [v.id, v]));

    const connEdges: Edge[] = connections.map((c) => {
      const sourceVerse = verseMap.get(c.from_verse_id);
      const targetVerse = verseMap.get(c.to_verse_id);
      const { sourceHandle, targetHandle } = getOptimalHandles(sourceVerse, targetVerse);

      return {
        id: c.id,
        source: c.from_verse_id,
        target: c.to_verse_id,
        sourceHandle,
        targetHandle,
        type: 'connection',
        data: {
          type: c.type,
          label: c.label,
          anchor_word: c.anchor_word,
          anchor_color: c.anchor_color,
          onEdit: onUpdateConnection,
          onDelete: onDeleteConnection,
        },
      };
    });

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

  // ─── React Flow state ───────────────────────────────────────────────────────
  const initialHighlightsMap = useMemo(() => buildHighlightsMap(connections), [connections]);
  const initialNodes = useMemo(
    () => buildNodes(verses, initialHighlightsMap),
    [verses, initialHighlightsMap, buildNodes]
  );
  const initialEdges = useMemo(() => buildEdges(verses), [buildEdges, verses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when verses / connections / pendingAnchor change
  useEffect(() => {
    const highlightsMap = buildHighlightsMap(connections);
    setNodes(buildNodes(verses, highlightsMap));
  }, [verses, connections, buildNodes, setNodes]);

  // Sync edges when connections / topicLinks change
  useEffect(() => {
    setEdges(buildEdges(verses));
  }, [buildEdges, verses, setEdges]);

  // ─── Interaction handlers ───────────────────────────────────────────────────
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
        let sourceId = params.source;
        let targetId = params.target;
        let anchor = null;

        if (pendingAnchor?.verseId === params.source) {
          anchor = pendingAnchor;
        } else if (pendingAnchor?.verseId === params.target) {
          // If the user drags backwards to the anchored verse, we automatically 
          // flip the connection so the anchored verse becomes the source.
          anchor = pendingAnchor;
          sourceId = params.target;
          targetId = params.source;
        }

        onCreateConnection(
          sourceId,
          targetId,
          'references',
          anchor?.word, // this is the anchorKey now
          anchor?.color
        );
        
        // Clear pending anchor after the connection is made
        if (anchor) setPendingAnchor(null);
      }
    },
    [onCreateConnection, pendingAnchor]
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
        connectionMode={ConnectionMode.Loose}
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

      {/* Global pending-anchor hint bar */}
      {pendingAnchor && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none z-20"
          style={{
            backgroundColor: pendingAnchor.color + '18',
            border: `1.5px solid ${pendingAnchor.color}`,
            color: pendingAnchor.color,
            backdropFilter: 'blur(8px)',
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>
            Word &ldquo;<strong>{parseAnchorKey(pendingAnchor.word)?.word || pendingAnchor.word}</strong>&rdquo; anchored — drag a handle to link a verse
          </span>
        </div>
      )}
    </div>
  );
}
