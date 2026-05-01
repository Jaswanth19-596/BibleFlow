import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  EdgeTypes,
  ConnectionMode,
} from '@xyflow/react';
import { useSearchParams } from 'react-router-dom';
import { usePeopleAtlas } from '@/hooks/usePeopleAtlas';
import { useQuery } from '@tanstack/react-query';
import { getEntityMentionsWithBooks } from '@/lib/supabase';
import PersonNode from './PersonNode';
import type { PersonNodeData } from './PersonNode';
import RelationshipEdge from './RelationshipEdge';
import TimelineBands from './TimelineBands';
import CreatePeriodModal from './CreatePeriodModal';
import CreatePersonModal from './CreatePersonModal';
import EditRelationshipModal from './EditRelationshipModal';
import { TimelinePeriod, Entity, EntityRelationship } from '@/lib/types';
import { useDebouncedCallback } from '@/hooks/useDebounce';

const nodeTypes: NodeTypes = { person: PersonNode };
const edgeTypes: EdgeTypes = { relationship: RelationshipEdge };

const BAND_HEIGHT = 300;
const BAND_WIDTH = 4000;

// Suggested relationship types for quick selection
const QUICK_TYPES = [
  'father of', 'mother of', 'son of', 'daughter of',
  'married to', 'sibling of', 'king of', 'prophet to',
];

export default function PeopleAtlas() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const {
    people,
    relationships,
    periods,
    loading,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    savePosition,
    assignPeriod,
    createPeriod,
    updatePeriod,
    deletePeriod,
    createEntity,
    updateEntity,
    deleteEntity,
  } = usePeopleAtlas();

  // Mention counts
  const { data: mentions = [] } = useQuery({
    queryKey: ['atlas-mentions'],
    queryFn: getEntityMentionsWithBooks,
  });

  const mentionCounts = useMemo(() => {
    const map = new Map<string, number>();
    mentions.forEach((m) => {
      map.set(m.entity_id, (map.get(m.entity_id) || 0) + 1);
    });
    return map;
  }, [mentions]);

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TimelinePeriod | null>(null);

  const [showPersonModal, setShowPersonModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Entity | null>(null);

  const [showEditRelModal, setShowEditRelModal] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<EntityRelationship | null>(null);

  // Pending connection — when user draws a line, we ask for the type inline
  const [pendingConnection, setPendingConnection] = useState<{
    source: string;
    target: string;
  } | null>(null);
  const [pendingRelType, setPendingRelType] = useState('');
  const relInputRef = useRef<HTMLInputElement>(null);

  // Build nodes
  const initialNodes = useMemo(() => {
    return people.map((person) => ({
      id: person.id,
      type: 'person',
      position: { x: person.atlas_x || 100, y: person.atlas_y || 100 },
      data: {
        entity: person,
        mentionCount: mentionCounts.get(person.id) || 0,
        period: periods.find((p) => p.id === person.timeline_period_id),
        isHighlighted: person.id === highlightId,
        onEdit: (entity: Entity) => {
          setEditingPerson(entity);
          setShowPersonModal(true);
        },
        onDelete: async (id: string) => {
          if (window.confirm('Are you sure you want to delete this person and all their tags/relationships?')) {
            await deleteEntity(id);
          }
        },
      } as PersonNodeData,
    }));
  }, [people, periods, mentionCounts, highlightId]);

  // Build edges
  const initialEdges: Edge[] = useMemo(() => {
    return relationships
      .filter((r) => {
        return people.some((p) => p.id === r.from_entity_id) &&
               people.some((p) => p.id === r.to_entity_id);
      })
      .map((r) => {
        const sourceNode = people.find(p => p.id === r.from_entity_id);
        const targetNode = people.find(p => p.id === r.to_entity_id);
        
        const sourceY = sourceNode?.atlas_y || 0;
        const targetY = targetNode?.atlas_y || 0;
        const sourceX = sourceNode?.atlas_x || 0;
        const targetX = targetNode?.atlas_x || 0;

        const dx = Math.abs(targetX - sourceX);
        const dy = Math.abs(targetY - sourceY);

        let sourceHandle = 'source-bottom';
        let targetHandle = 'target-top';

        if (dx > dy) {
          if (sourceX < targetX) {
            sourceHandle = 'source-right';
            targetHandle = 'target-left';
          } else {
            sourceHandle = 'source-left';
            targetHandle = 'target-right';
          }
        } else {
          if (sourceY < targetY) {
            sourceHandle = 'source-bottom';
            targetHandle = 'target-top';
          } else {
            sourceHandle = 'source-top';
            targetHandle = 'target-bottom';
          }
        }

        return {
          id: r.id,
          source: r.from_entity_id,
          target: r.to_entity_id,
          sourceHandle,
          targetHandle,
          type: 'relationship',
          data: { 
            type: r.type,
            onEdit: () => {
              setEditingRelationship(r);
              setShowEditRelModal(true);
            }
          },
        };
      });
  }, [relationships, people]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodesKey = useMemo(
    () => people.map((p) => `${p.id}:${p.atlas_x}:${p.atlas_y}:${p.timeline_period_id}`).join(','),
    [people]
  );
  const edgesKey = useMemo(
    () => relationships.map((r) => r.id).join(','),
    [relationships]
  );
  useEffect(() => { setNodes(initialNodes); }, [nodesKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setEdges(initialEdges); }, [edgesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the inline input when a pending connection is set
  useEffect(() => {
    if (pendingConnection && relInputRef.current) {
      relInputRef.current.focus();
    }
  }, [pendingConnection]);

  // Debounced position save
  const debouncedSavePosition = useDebouncedCallback(
    (id: string, x: number, y: number) => { savePosition(id, x, y); },
    300
  );

  const onNodeDragStop = useCallback(
    (_: any, node: Node) => {
      debouncedSavePosition(node.id, node.position.x, node.position.y);
      if (periods.length > 0) {
        const bandIndex = Math.floor(node.position.y / BAND_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(bandIndex, periods.length - 1));
        const targetPeriod = periods[clampedIndex];
        const person = people.find((p) => p.id === node.id);
        if (person && person.timeline_period_id !== targetPeriod.id) {
          assignPeriod(node.id, targetPeriod.id);
        }
      }
    },
    [debouncedSavePosition, periods, people, assignPeriod]
  );

  // When user draws a connection between two person nodes
  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && connection.source !== connection.target) {
      // Check if relationship already exists between these two
      const exists = relationships.some(
        (r) =>
          (r.from_entity_id === connection.source && r.to_entity_id === connection.target) ||
          (r.from_entity_id === connection.target && r.to_entity_id === connection.source)
      );
      if (!exists) {
        setPendingConnection({
          source: connection.source,
          target: connection.target,
        });
        setPendingRelType('');
      }
    }
  }, [relationships]);

  // Confirm the pending relationship
  const confirmRelationship = useCallback(async (typeStr: string) => {
    if (!pendingConnection || !typeStr.trim()) return;
    await createRelationship({
      from_entity_id: pendingConnection.source,
      to_entity_id: pendingConnection.target,
      type: typeStr.trim().toLowerCase().replace(/\s+/g, '-'),
      description: '',
    });
    setPendingConnection(null);
    setPendingRelType('');
  }, [pendingConnection, createRelationship]);

  const cancelPendingConnection = useCallback(() => {
    setPendingConnection(null);
    setPendingRelType('');
  }, []);

  const handleCreatePerson = async (data: { name: string; description: string; color: string }) => {
    if (editingPerson) {
      await updateEntity(editingPerson.id, data);
    } else {
      await createEntity({
        ...data,
        type: 'person',
        metadata: {},
        timeline_period_id: null,
        atlas_x: 100 + Math.random() * 50,
        atlas_y: 100 + Math.random() * 50,
      });
    }
  };

  const handleUpdateRelationship = async (updates: { type: string; description: string }) => {
    if (editingRelationship) {
      await updateRelationship(editingRelationship.id, updates);
    }
  };

  const handleDeleteRelationship = async () => {
    if (editingRelationship) {
      await deleteRelationship(editingRelationship.id);
    }
  };

  // Delete edge on select + backspace (handled via edge click for now)
  const onEdgeClick = useCallback((_: any, _edge: Edge) => {
    // Could show a delete confirmation — for now, just select it
  }, []);

  const handleCreatePeriod = async (data: { name: string; color: string; sort_order: number }) => {
    await createPeriod(data);
  };

  const handleEditPeriod = (period: TimelinePeriod) => {
    setEditingPeriod(period);
    setShowPeriodModal(true);
  };

  const handleUpdatePeriod = async (data: { name: string; color: string; sort_order: number }) => {
    if (editingPeriod) {
      await updatePeriod(editingPeriod.id, data);
      setEditingPeriod(null);
    } else {
      await createPeriod(data);
    }
  };

  const handleDeletePeriod = async (id: string) => {
    await deletePeriod(id);
    setEditingPeriod(null);
  };

  // Get names for pending connection display
  const sourceName = pendingConnection
    ? people.find((p) => p.id === pendingConnection.source)?.name || ''
    : '';
  const targetName = pendingConnection
    ? people.find((p) => p.id === pendingConnection.target)?.name || ''
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading People Atlas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 z-10">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            People Atlas
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {people.length} people · {relationships.length} relationships · {periods.length} periods
            {people.length > 0 && (
              <span className="ml-2 text-gray-400 dark:text-gray-500">
                — drag between people to connect them
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEditingPerson(null); setShowPersonModal(true); }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            + Person
          </button>
          <button
            onClick={() => { setEditingPeriod(null); setShowPeriodModal(true); }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            + Period
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {people.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                No people tagged yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Go to a topic, add verses, and tag people on them. They will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            panOnScroll={true}
            selectionOnDrag={false}
            panOnDrag={true}
            fitView
            fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <TimelineBands periods={periods} bandHeight={BAND_HEIGHT} bandWidth={BAND_WIDTH} />
            <Controls position="bottom-right" />
            <MiniMap
              nodeColor={(node: Node) => {
                const data = node.data as unknown as PersonNodeData;
                return data?.entity?.color || '#6366f1';
              }}
              maskColor="rgba(0,0,0,0.1)"
              position="bottom-left"
            />
          </ReactFlow>
        )}

        {/* Period list sidebar */}
        {periods.length > 0 && (
          <div className="absolute right-4 top-4 z-10 space-y-1 max-w-[160px]">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => handleEditPeriod(period)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all text-left"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: period.color }}
                />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">
                  {period.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Inline relationship type prompt — appears when you draw a connection */}
        {pendingConnection && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 w-full max-w-sm animate-atlas-expand">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="font-semibold text-gray-900 dark:text-white">{sourceName}</span>
                {' → '}
                <span className="font-semibold text-gray-900 dark:text-white">{targetName}</span>
              </p>

              {/* Quick type buttons */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => confirmRelationship(t)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Custom type input */}
              <form
                onSubmit={(e) => { e.preventDefault(); confirmRelationship(pendingRelType); }}
                className="flex items-center gap-2"
              >
                <input
                  ref={relInputRef}
                  type="text"
                  value={pendingRelType}
                  onChange={(e) => setPendingRelType(e.target.value)}
                  placeholder="or type a custom relationship..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!pendingRelType.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </form>

              <button
                onClick={cancelPendingConnection}
                className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreatePeriodModal
        open={showPeriodModal}
        onClose={() => { setShowPeriodModal(false); setEditingPeriod(null); }}
        onSubmit={editingPeriod ? handleUpdatePeriod : handleCreatePeriod}
        nextSortOrder={periods.length}
        editingPeriod={editingPeriod}
        onDelete={handleDeletePeriod}
      />
      
      <CreatePersonModal
        open={showPersonModal}
        onClose={() => { setShowPersonModal(false); setEditingPerson(null); }}
        onSubmit={handleCreatePerson}
        editingPerson={editingPerson}
      />

      <EditRelationshipModal
        open={showEditRelModal}
        onClose={() => { setShowEditRelModal(false); setEditingRelationship(null); }}
        onSubmit={handleUpdateRelationship}
        onDelete={handleDeleteRelationship}
        relationship={editingRelationship}
        sourceName={editingRelationship ? people.find((p) => p.id === editingRelationship.from_entity_id)?.name : ''}
        targetName={editingRelationship ? people.find((p) => p.id === editingRelationship.to_entity_id)?.name : ''}
      />
    </div>
  );
}
