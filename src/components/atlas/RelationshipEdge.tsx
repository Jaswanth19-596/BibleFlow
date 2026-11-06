import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, useViewport, type EdgeProps } from '@xyflow/react';
export interface RelationshipEdgeData extends Record<string, unknown> { label?: string; color?: string; status?: string; family?: boolean; offset?: number; highlighted?: boolean; onEdit?: () => void }
export default function RelationshipEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected, markerEnd, style }: EdgeProps) {
  const d = (data ?? {}) as RelationshipEdgeData; const { zoom } = useViewport();
  let [path, x, y] = (d.family ? getSmoothStepPath : getBezierPath)({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });
  if (d.offset) { const dx = targetX - sourceX, dy = targetY - sourceY, length = Math.hypot(dx, dy) || 1; const ox = -dy / length * d.offset, oy = dx / length * d.offset; path = `M ${sourceX},${sourceY} C ${sourceX + dx / 3 + ox},${sourceY + dy / 3 + oy} ${sourceX + dx * 2 / 3 + ox},${sourceY + dy * 2 / 3 + oy} ${targetX},${targetY}`; x = (sourceX + targetX) / 2 + ox * .75; y = (sourceY + targetY) / 2 + oy * .75; }
  return <>
    <BaseEdge id={id} path={path} markerEnd={markerEnd} interactionWidth={22} style={{ ...style, stroke: d.color ?? '#64748b', strokeWidth: selected || d.highlighted ? 2.5 : 1.6, strokeDasharray: ['disputed','inferred'].includes(d.status ?? '') ? '5 4' : undefined }} />
    {d.label && <EdgeLabelRenderer><button className={`nodrag nopan atlas-edge-label ${zoom < .5 && !selected && !d.highlighted ? 'atlas-edge-quiet' : ''}`} style={{ transform: `translate(-50%, -50%) translate(${x}px,${y}px)`, borderColor: d.color }} onClick={() => d.onEdit?.()} title={d.label}>{d.label}{d.status && d.status !== 'explicit' && d.status !== 'unspecified' ? ` · ${d.status}` : ''}</button></EdgeLabelRenderer>}
  </>;
}
