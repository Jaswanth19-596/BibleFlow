import '@xyflow/react/dist/style.css';
import './atlas.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, ReactFlowProvider, Controls, MiniMap, MarkerType, useNodesState, useReactFlow, useNodesInitialized, ConnectionMode, type Node, type Edge, type NodeChange } from '@xyflow/react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePeopleAtlas } from '@/hooks/usePeopleAtlas';
import { useDebounce } from '@/hooks/useDebounce';
import { getEntityMentionsWithBooks, type AtlasEntityMention } from '@/lib/supabase';
import type { Entity, EntityRelationship, TimelinePeriod } from '@/lib/types';
import { BUILTIN_DEFINITIONS, entityQualifier, errorMessage, formatEvidence, RELATIONSHIP_CATEGORIES, resolveDefinition, statement } from '@/lib/relationships';
import { buildAtlasSearch, searchAtlas, type AtlasSearchItem } from '@/lib/atlasSearch';
import { bundleRelationships, deriveFamilies, pairKey } from '@/lib/atlasGraph';
import PersonNode from './PersonNode';
import FamilyJunctionNode from './FamilyJunctionNode';
import RelationshipEdge from './RelationshipEdge';
import TimelineBands from './TimelineBands';
import CreatePeriodModal from './CreatePeriodModal';
import CreatePersonModal, { type AtlasEntityInput } from './CreatePersonModal';
import RelationshipEditor from './RelationshipEditor';
import SetParentsModal from './SetParentsModal';
import AtlasSearch from './AtlasSearch';

const nodeTypes = { person: PersonNode, family: FamilyJunctionNode };
const edgeTypes = { relationship: RelationshipEdge };
// Keep this stable so render updates do not overwrite an explicit search fit.
const INITIAL_FIT_OPTIONS = { padding: .3, maxZoom: 1 };
const EMPTY_IDS: string[] = [];
const EMPTY_MENTIONS: AtlasEntityMention[] = [];
function findPeriod(y: number, periods: TimelinePeriod[]) {
  let bottom = 0;
  return periods.find(p => { bottom += p.band_height ?? 300; return y < bottom; }) ?? periods[periods.length - 1];
}
export default function PeopleAtlas() { return <ReactFlowProvider><Atlas /></ReactFlowProvider>; }
function Atlas() {
  const atlas = usePeopleAtlas();
  const { entities, people, relationships, periods } = atlas;
  const definitions = atlas.definitions ?? BUILTIN_DEFINITIONS;
  const [params] = useSearchParams();
  const [query, setQuery] = useState(''); const debouncedQuery = useDebounce(query, 180);
  const [view, setView] = useState<'family' | 'relationships'>('family');
  const [category, setCategory] = useState('*'); const [type, setType] = useState('*');
  const [entityType, setEntityType] = useState('*'); const [period, setPeriod] = useState('*');
  const [status, setStatus] = useState('*'); const [includeUndated, setIncludeUndated] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showRelated, setShowRelated] = useState(false); const [focus, setFocus] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);
  const [reveal, setReveal] = useState<{ ids: string[]; relationships: string[] } | null>(null);
  const [expandedPair, setExpandedPair] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ initial?: EntityRelationship; source?: string; target?: string } | null>(null);
  const [entityEditor, setEntityEditor] = useState<{ entity?: Entity } | null>(null);
  const [parentsChild, setParentsChild] = useState<Entity | null>(null);
  const [periodEditor, setPeriodEditor] = useState<{ period?: TimelinePeriod } | null>(null);
  const [error, setError] = useState('');
  const [pendingFocus, setPendingFocus] = useState<string[] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const flow = useReactFlow(); const initialized = useNodesInitialized();
  const byId = useMemo(() => new Map(entities.map(e => [e.id, e])), [entities]);
  const selectedEntity = selectedEntityId ? byId.get(selectedEntityId) : undefined;
  const { data: mentions = EMPTY_MENTIONS } = useQuery({ queryKey: ['atlas-mentions'], queryFn: getEntityMentionsWithBooks });
  const mentionCounts = useMemo(() => { const counts = new Map<string, number>(); mentions.forEach(m => counts.set(m.entity_id, (counts.get(m.entity_id) ?? 0) + 1)); return counts; }, [mentions]);
  const index = useMemo(() => buildAtlasSearch(entities, relationships, definitions), [entities, relationships, definitions]);
  const results = useMemo(() => searchAtlas(index, debouncedQuery), [index, debouncedQuery]);
  const searchIds = useMemo(() => new Set(results.flatMap(r => r.entityIds)), [results]);
  const neighborhood = useMemo(() => {
    const ids = new Set(selectedEntityId ? [selectedEntityId] : []);
    for (const r of relationships) if ([r.from_entity_id, r.to_entity_id].includes(selectedEntityId ?? '')) { ids.add(r.from_entity_id); ids.add(r.to_entity_id); }
    return ids;
  }, [relationships, selectedEntityId]);
  const filtered = useMemo(() => relationships.filter(r => {
    const d = resolveDefinition(r, definitions), meta = r.metadata;
    return (view !== 'family' || d.category === 'family') && (category === '*' || d.category === category) && (type === '*' || d.id === type)
      && (status === '*' || (meta?.status ?? 'unspecified') === status)
      && (period === '*' || meta?.period_id === period || (!meta?.period_id && includeUndated))
      && (entityType === '*' || byId.get(r.from_entity_id)?.type === entityType || byId.get(r.to_entity_id)?.type === entityType)
      && (!focus || !selectedEntityId || (neighborhood.has(r.from_entity_id) && neighborhood.has(r.to_entity_id)));
  }), [relationships, definitions, view, category, type, status, period, includeUndated, entityType, byId, focus, selectedEntityId, neighborhood]);
  const visibleEntities = useMemo(() => {
    const endpointIds = new Set(filtered.flatMap(r => [r.from_entity_id, r.to_entity_id]));
    const scoped = category !== '*' || type !== '*' || status !== '*' || period !== '*' || entityType !== '*';
    return entities.filter(e => reveal?.ids.includes(e.id) || (
      (!focus || !selectedEntityId || neighborhood.has(e.id)) && (!scoped || endpointIds.has(e.id))
      && (e.type === 'person' || showRelated || (neighborhood.has(e.id) && endpointIds.has(e.id)))
    ));
  }, [entities, filtered, category, type, status, period, entityType, reveal, focus, selectedEntityId, neighborhood, showRelated]);
  const visibleIds = useMemo(() => new Set(visibleEntities.map(e => e.id)), [visibleEntities]);
  const visibleRelationships = useMemo(() => {
    const ids = new Set(filtered.map(r => r.id));
    return relationships.filter(r => (ids.has(r.id) || reveal?.relationships.includes(r.id)) && visibleIds.has(r.from_entity_id) && visibleIds.has(r.to_entity_id));
  }, [relationships, filtered, reveal, visibleIds]);
  const inspectEntity = useCallback((entity: Entity) => { setSelectedEntityId(entity.id); setSelectedRelationships([]); }, []);
  const initialNodes: Node[] = useMemo(() => visibleEntities.map(entity => ({
    id: entity.id, type: 'person', position: { x: entity.atlas_x ?? 100, y: entity.atlas_y ?? 100 },
    data: { entity, mentionCount: mentionCounts.get(entity.id) ?? 0, isHighlighted: entity.id === selectedEntityId || (!!debouncedQuery && searchIds.has(entity.id)), onClick: inspectEntity },
  })), [visibleEntities, mentionCounts, selectedEntityId, debouncedQuery, searchIds, inspectEntity]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  useEffect(() => { setNodes(previous => {
    const current = new Map(previous.map(n => [n.id, n]));
    return initialNodes.map(n => { const old = current.get(n.id); return old ? { ...old, ...n, position: old.dragging ? old.position : n.position } : n; });
  }); }, [initialNodes, setNodes]);
  const openRelationships = useCallback((ids: string[]) => { setSelectedRelationships(ids); setSelectedEntityId(null); }, []);
  const families = useMemo(() => view === 'family' ? deriveFamilies(visibleEntities, visibleRelationships, definitions) : [], [view, visibleEntities, visibleRelationships, definitions]);
  const graph = useMemo(() => {
    const positioned = new Map(nodes.map(n => [n.id, n]));
    const familyNodes: Node[] = [], edges: Edge[] = [];
    const grouped = new Set<string>();
    const handles = (source: string, target: string) => {
      const a = positioned.get(source), b = positioned.get(target);
      if (!a || !b) return {};
      const dx = b.position.x - a.position.x, dy = b.position.y - a.position.y;
      if (Math.abs(dx) > Math.abs(dy)) return { sourceHandle: dx >= 0 ? 'source-right' : 'source-left', targetHandle: dx >= 0 ? 'target-left' : 'target-right' };
      return { sourceHandle: dy >= 0 ? 'source-bottom' : 'source-top', targetHandle: dy >= 0 ? 'target-top' : 'target-bottom' };
    };
    for (const family of families) {
      const parents = family.parents.map(id => positioned.get(id));
      if (parents.some(n => !n)) continue;
      const parentNodes = parents as Node[];
      const x = parentNodes.reduce((sum, n) => sum + n.position.x + (n.measured?.width ?? 220) / 2, 0) / 2 - 14;
      const y = Math.max(...parentNodes.map(n => n.position.y + (n.measured?.height ?? 90))) + 38;
      const context = JSON.parse(family.context) as string[];
      const label = `Shared parents · ${context[0]}${context[1] ? ` · ${periods.find(p => p.id === context[1])?.name ?? 'period'}` : ''}`;
      familyNodes.push({ id: family.id, type: 'family', position: { x, y }, width: 28, height: 28, measured: { width: 28, height: 28 }, draggable: false, selectable: true, connectable: false, data: { label, onClick: () => openRelationships(family.relationshipIds) } });
      for (const parent of family.parents) edges.push({ id: `${family.id}:parent:${parent}`, source: parent, target: family.id, sourceHandle: 'source-bottom', targetHandle: 'target-top', type: 'relationship', data: { family: true, color: RELATIONSHIP_CATEGORIES.family.color, highlighted: family.relationshipIds.some(id => selectedRelationships.includes(id)), onEdit: () => openRelationships(family.relationshipIds) } });
      for (const child of family.children) edges.push({ id: `${family.id}:child:${child}`, source: family.id, target: child, sourceHandle: 'source-bottom', targetHandle: 'target-top', type: 'relationship', data: { family: true, color: RELATIONSHIP_CATEGORIES.family.color, highlighted: family.relationshipIds.some(id => selectedRelationships.includes(id)), onEdit: () => openRelationships(family.relationshipIds.filter(id => { const r = visibleRelationships.find(r => r.id === id); return r && [r.from_entity_id, r.to_entity_id].includes(child); })) } });
      family.relationshipIds.forEach(id => grouped.add(id));
    }
    for (const bundle of bundleRelationships(visibleRelationships.filter(r => !grouped.has(r.id)))) {
      if (bundle.items.length > 1 && expandedPair !== bundle.id) {
        const r = bundle.items[0]; edges.push({ id: `bundle:${encodeURIComponent(bundle.id)}`, source: r.from_entity_id, target: r.to_entity_id, ...handles(r.from_entity_id, r.to_entity_id), type: 'relationship', data: { label: `${bundle.items.length} relationships`, onEdit: () => { setExpandedPair(bundle.id); openRelationships(bundle.items.map(r => r.id)); } } }); continue;
      }
      bundle.items.forEach((r, i) => {
        const def = resolveDefinition(r, definitions), color = RELATIONSHIP_CATEGORIES[def.category].color;
        edges.push({ id: r.id, source: r.from_entity_id, target: r.to_entity_id, ...handles(r.from_entity_id, r.to_entity_id), type: 'relationship', selected: selectedRelationships.includes(r.id), markerEnd: def.symmetric ? undefined : { type: MarkerType.ArrowClosed, color },
          data: { label: def.label, color, status: r.metadata?.status, offset: (i - (bundle.items.length - 1) / 2) * 55, highlighted: selectedRelationships.includes(r.id), onEdit: () => openRelationships([r.id]) } });
      });
    }
    return { nodes: [...nodes, ...familyNodes], edges };
  }, [nodes, families, periods, openRelationships, visibleRelationships, definitions, expandedPair, selectedRelationships]);
  const selectResult = useCallback((item: AtlasSearchItem) => {
    if (item.kind === 'Relationship type') { setType(item.type ?? '*'); setView('relationships'); setCategory('*'); return; }
    setReveal({ ids: item.entityIds, relationships: item.relationshipId ? [item.relationshipId] : EMPTY_IDS });
    setPendingFocus(item.entityIds);
    if (item.relationshipId) { const rel = relationships.find(r => r.id === item.relationshipId); if (rel) setExpandedPair(pairKey(rel.from_entity_id, rel.to_entity_id)); openRelationships([item.relationshipId]); }
    else { setSelectedEntityId(item.entityIds[0]); setSelectedRelationships([]); }
  }, [relationships, openRelationships]);
  const handledHighlight = useRef<string | null>(null);
  const highlight = params.get('highlight');
  useEffect(() => { if (!highlight) handledHighlight.current = null; if (highlight && handledHighlight.current !== highlight && byId.has(highlight)) { handledHighlight.current = highlight; setReveal({ ids: [highlight], relationships: [] }); setSelectedEntityId(highlight); setPendingFocus([highlight]); } }, [highlight, byId]);
  useEffect(() => {
    if (!pendingFocus || !initialized || !pendingFocus.every(id => nodes.some(n => n.id === id))) return;
    const frame = requestAnimationFrame(() => { flow.fitView({ nodes: pendingFocus.map(id => ({ id })), padding: .65, maxZoom: 1.1, duration: 300 }); setPendingFocus(null); });
    return () => cancelAnimationFrame(frame);
  }, [pendingFocus, initialized, nodes, flow]);
  const saveEntity = async (data: AtlasEntityInput) => {
    if (entityEditor?.entity) await atlas.updateEntity(entityEditor.entity.id, data);
    else {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) throw new Error('The atlas canvas is not ready. Please try again.');
      const center = flow.screenToFlowPosition({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }, { snapToGrid: false });
      // Positions use the card's top-left corner; allow for its typical size.
      const created = await atlas.createEntity({ ...data, timeline_period_id: null, atlas_x: center.x - 110, atlas_y: center.y - 45 });
      // Keep the new entity visible even when the current filters exclude it.
      if (hasFilters || (focus && selectedEntityId) || (created.type !== 'person' && !showRelated)) {
        setReveal(previous => ({ ids: [...(previous?.ids ?? []), created.id], relationships: previous?.relationships ?? [] }));
      }
    }
  };
  const persistDrag = async (_event: unknown, node: Node) => {
    if (!byId.has(node.id)) return;
    try { await atlas.savePosition(node.id, node.position.x, node.position.y); const p = findPeriod(node.position.y, periods); const entity = byId.get(node.id); if (p && entity?.type === 'person' && entity.timeline_period_id !== p.id) await atlas.assignPeriod(node.id, p.id); } catch (e) { setError(errorMessage(e)); }
  };
  const selectedItems = selectedEntity ? relationships.filter(r => r.from_entity_id === selectedEntity.id || r.to_entity_id === selectedEntity.id) : relationships.filter(r => selectedRelationships.includes(r.id));
  const usedDefinitions = definitions.filter(d => relationships.some(r => resolveDefinition(r, definitions).id === d.id));
  const customUsed = relationships.map(r => resolveDefinition(r, definitions)).filter(d => !definitions.some(known => known.id === d.id)).filter((d, i, all) => all.findIndex(x => x.id === d.id) === i);
  const hasFilters = category !== '*' || type !== '*' || entityType !== '*' || period !== '*' || status !== '*';
  const resetFilters = () => { setCategory('*'); setType('*'); setEntityType('*'); setPeriod('*'); setStatus('*'); setIncludeUndated(true); };
  return <div className="atlas-workspace">
    <header className="atlas-toolbar">
      <div className="atlas-title-row"><div><h1>People & relationships</h1><p className="atlas-help">{people.length} people · {relationships.length} recorded relationships · {visibleRelationships.length} visible</p></div><div className="flex flex-wrap gap-2"><button className="atlas-button" onClick={() => setEntityEditor({})}>Add entity</button><button className="atlas-button atlas-primary" onClick={() => setEditor({ source: selectedEntityId ?? undefined })}>Add relationship</button><details className="atlas-period-menu"><summary className="atlas-button">Periods</summary><div className="atlas-period-list">{periods.map(p => <button key={p.id} className="atlas-button" onClick={() => setPeriodEditor({ period: p })}>{p.name}</button>)}<button className="atlas-button" onClick={() => setPeriodEditor({})}>Add period</button></div></details></div></div>
      <div className="atlas-tools-row"><div className="atlas-view-switch" aria-label="Atlas view">{(['family','relationships'] as const).map(v => <button key={v} aria-pressed={view === v} onClick={() => setView(v)}>{v === 'family' ? 'Family view' : 'All relationships'}</button>)}</div><button className="atlas-button atlas-filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(open => !open)}>Filters{hasFilters ? ' · active' : ''}</button><AtlasSearch query={query} onQuery={setQuery} results={query === debouncedQuery ? results : []} pending={query !== debouncedQuery} onSelect={selectResult} /></div>
      <div className={`atlas-filters ${filtersOpen ? 'is-open' : ''}`}>
        <label>Category<select aria-label="Filter by category" value={category} onChange={e => setCategory(e.target.value)}><option value="*">All categories</option>{Object.entries(RELATIONSHIP_CATEGORIES).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}</select></label>
        <label>Relationship<select aria-label="Filter by relationship" value={type} onChange={e => setType(e.target.value)}><option value="*">All types</option>{[...usedDefinitions, ...customUsed].map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
        <details className="atlas-more-filters"><summary>More filters{hasFilters ? ' · active' : ''}</summary><div className="atlas-extra-filters"><label>Entity type<select value={entityType} onChange={e => { setEntityType(e.target.value); setShowRelated(true); }}><option value="*">All entity types</option>{['person','place','nation','event','object','concept'].map(t => <option key={t}>{t}</option>)}</select></label><label>Period<select value={period} onChange={e => setPeriod(e.target.value)}><option value="*">All periods</option>{periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option value="*">All statuses</option>{['unspecified','explicit','inferred','disputed'].map(s => <option key={s}>{s}</option>)}</select></label><label className="flex gap-2"><input type="checkbox" checked={includeUndated} onChange={e => setIncludeUndated(e.target.checked)} />Include undated</label></div></details>
        <label className="atlas-check"><input type="checkbox" checked={showRelated} onChange={e => setShowRelated(e.target.checked)} />Related entities</label>
        {hasFilters && <button className="atlas-link" onClick={resetFilters}>Clear filters</button>}
        <button className="atlas-link ml-auto" onClick={() => flow.fitView({ padding: .3, maxZoom: 1, duration: 300 })}>Fit visible</button>
      </div>
    </header>
    {!atlas.loading && !atlas.schemaReady && !atlas.error && <p className="atlas-notice">Existing relationships are available. To save the new relationship details and shared parents, apply database migration 010.</p>}
    {(atlas.error || error) && <div className="atlas-error flex justify-between" role="alert"><span>{error || errorMessage(atlas.error)}</span><button onClick={() => { setError(''); atlas.retry(); }} className="atlas-link">Retry</button></div>}
    {reveal && <div className="atlas-reveal"><span>Selected result is revealed. Your filters are preserved.</span><button className="atlas-link" onClick={() => setReveal(null)}>Restore view</button></div>}
    <div className="atlas-stage">
      <div className="atlas-canvas" ref={canvasRef}>
        {atlas.loading ? <p className="atlas-empty" role="status">Loading relationships…</p> : <ReactFlow nodes={graph.nodes} edges={graph.edges} onNodesChange={(changes: NodeChange[]) => { const relevant = changes.filter(c => !('id' in c) || !c.id.startsWith('family:')); if (relevant.length) onNodesChange(relevant); }} onNodeDragStop={persistDrag} onConnect={connection => { if (connection.source && connection.target && connection.source !== connection.target && byId.has(connection.source) && byId.has(connection.target)) setEditor({ source: connection.source, target: connection.target }); }} onEdgeClick={(_event, edge) => (edge.data?.onEdit as (() => void) | undefined)?.()} nodeTypes={nodeTypes} edgeTypes={edgeTypes} connectionMode={ConnectionMode.Loose} deleteKeyCode={null} fitView fitViewOptions={INITIAL_FIT_OPTIONS} minZoom={.1} maxZoom={2} panOnScroll proOptions={{ hideAttribution: true }}>
          <TimelineBands periods={periods} bandWidth={8000} onResizePeriod={(id, height) => { atlas.updatePeriod(id, { band_height: height }).catch(e => setError(errorMessage(e))); }} /><Controls position="bottom-left" />{!selectedEntity && selectedRelationships.length === 0 && <MiniMap position="bottom-right" nodeColor={node => String((node.data.entity as Entity | undefined)?.color ?? '#7c59a4')} />}
        </ReactFlow>}
        {!atlas.loading && !visibleEntities.length && <div className="atlas-empty"><h2>{entities.length ? 'No entities in this view' : 'Start your relationship atlas'}</h2><p>{entities.length ? 'Change the filters, use search, or switch to All relationships.' : 'Add a person or another entity, then connect them.'}</p><button className="atlas-button" onClick={() => entities.length ? (resetFilters(), setView('relationships'), setShowRelated(true)) : setEntityEditor({})}>{entities.length ? 'Show all entities' : 'Add entity'}</button></div>}
        <div className="atlas-legend">{Object.values(RELATIONSHIP_CATEGORIES).filter(c => view !== 'family' || c.label === 'Family').map(c => <span key={c.label}><i style={{ backgroundColor: c.color }} />{c.label}</span>)}<span>Dashed: inferred or disputed</span></div>
      </div>
      {(selectedEntity || selectedRelationships.length > 0) && <aside className="atlas-details" aria-label="Relationship details">
        <div className="flex items-start justify-between gap-2"><div><h2>{selectedEntity?.name ?? 'Relationship details'}</h2>{selectedEntity && <p className="atlas-help">{entityQualifier(selectedEntity)}</p>}</div><button className="atlas-button" aria-label="Close relationship details" onClick={() => { setSelectedEntityId(null); setSelectedRelationships([]); setFocus(false); }}>×</button></div>
        {selectedEntity && <><div className="flex flex-wrap gap-2 mt-3"><button className="atlas-button" onClick={() => setEditor({ source: selectedEntity.id })}>Add relationship</button>{selectedEntity.type === 'person' && <button className="atlas-button" onClick={() => setParentsChild(selectedEntity)}>Set parents</button>}<button className="atlas-button" onClick={() => setEntityEditor({ entity: selectedEntity })}>Edit entity</button></div><label className="atlas-check my-3"><input type="checkbox" checked={focus} onChange={e => setFocus(e.target.checked)} />Focus on immediate connections</label>{selectedEntity.description && <p className="text-sm my-3">{selectedEntity.description}</p>}</>}
        {expandedPair && <button className="atlas-link mt-3" onClick={() => setExpandedPair(null)}>Collapse connection labels</button>}<p className="atlas-help mt-4">{selectedItems.length} recorded {selectedItems.length === 1 ? 'relationship' : 'relationships'}</p>
        <div className="atlas-assertions">{selectedItems.map(r => <article key={r.id}><button className="atlas-statement-button" onClick={() => selectResult({ id: r.id, kind: 'Relationship', title: '', detail: '', text: '', names: [], entityIds: [r.from_entity_id, r.to_entity_id], relationshipId: r.id })}>{statement(r, byId, definitions)}</button><p className="atlas-help">{r.metadata?.status ?? 'unspecified'} · {r.metadata?.period_id ? periods.find(p => p.id === r.metadata?.period_id)?.name ?? 'Period removed' : 'Undated'}{r.metadata?.lineage_scope ? ` · ${r.metadata.lineage_scope}` : ''}{r.metadata?.parentage ? ` · ${r.metadata.parentage}` : ''}{!visibleRelationships.some(v => v.id === r.id) ? ' · hidden in current view' : ''}</p>{r.description && <p className="text-sm my-2">{r.description}</p>}{(r.evidence ?? []).map((e, i) => <p className="atlas-evidence" key={e.id ?? i}>{formatEvidence(e)}{e.note ? ` — ${e.note}` : ''}</p>)}<button className="atlas-link mt-2" onClick={() => setEditor({ initial: r })}>Edit relationship & evidence</button></article>)}</div>
        {selectedEntity && <button className="atlas-link mt-5 text-red-700" onClick={async () => { if (!window.confirm(`Delete ${selectedEntity.name} and all their tags and relationships?`)) return; try { await atlas.deleteEntity(selectedEntity.id); setSelectedEntityId(null); } catch (e) { setError(errorMessage(e)); } }}>Delete entity</button>}
      </aside>}
    </div>
    {editor && <RelationshipEditor key={editor.initial?.id ?? `${editor.source}:${editor.target}`} entities={entities} relationships={relationships} definitions={definitions} periods={periods} {...editor} onClose={() => setEditor(null)} onSave={async draft => { const id = await atlas.saveRelationship(draft); const ids = [draft.from_entity_id, draft.to_entity_id]; setReveal({ ids, relationships: [id] }); setPendingFocus(ids); setSelectedEntityId(null); setSelectedRelationships([id]); setExpandedPair(pairKey(draft.from_entity_id, draft.to_entity_id)); }} onDelete={atlas.deleteRelationship} />}
    {parentsChild && <SetParentsModal child={parentsChild} entities={entities} periods={periods} onClose={() => setParentsChild(null)} onSave={atlas.setParents} />}
    <CreatePersonModal open={!!entityEditor} editingPerson={entityEditor?.entity} entities={entities} onClose={() => setEntityEditor(null)} onSubmit={saveEntity} />
    <CreatePeriodModal key={periodEditor?.period?.id ?? (periodEditor ? 'new-open' : 'closed')} open={!!periodEditor} editingPeriod={periodEditor?.period} onClose={() => setPeriodEditor(null)} nextSortOrder={periods.length} allPeriods={periods} onSubmit={async data => { if (periodEditor?.period) await atlas.updatePeriod(periodEditor.period.id, data); else await atlas.createPeriod({ ...data, band_height: 300 }); }} onDelete={atlas.deletePeriod} onReorder={atlas.reorderPeriods} />
  </div>;
}
