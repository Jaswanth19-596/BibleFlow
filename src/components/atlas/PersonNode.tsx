import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Entity, TimelinePeriod } from '@/lib/types';

export interface PersonNodeData {
  [key: string]: unknown;
  entity: Entity; mentionCount: number; period?: TimelinePeriod; isHighlighted?: boolean; dimmed?: boolean;
  onClick?: (entity: Entity) => void; onAssignPeriod?: (id: string) => void; onEdit?: (entity: Entity) => void; onDelete?: (id: string) => void;
}
function PersonNode({ data, selected }: { data: PersonNodeData; selected?: boolean }) {
  const entity = data.entity;
  return <div className={`person-node atlas-entity-node ${selected ? 'selected' : ''} ${data.isHighlighted ? 'highlighted' : ''}`} style={{ borderColor: entity.color, opacity: data.dimmed ? 0.25 : 1 }}>
    {([Position.Top, Position.Left, Position.Bottom, Position.Right] as const).map(position => <span key={position}><Handle type="target" position={position} id={`target-${position}`} /><Handle type="source" position={position} id={`source-${position}`} /></span>)}
    <button type="button" className="atlas-node-content" onClick={() => data.onClick?.(entity)} aria-label={`Inspect ${entity.name}`}>
      <span className="atlas-avatar" style={{ backgroundColor: entity.color }}>{entity.name.charAt(0)}</span>
      <span className="min-w-0 text-left"><strong className="block truncate">{entity.name}</strong><span className="atlas-help block">{String(entity.metadata.kind || entity.type)}{data.mentionCount ? ` · ${data.mentionCount} verses` : ''}</span></span>
    </button>
    {!!entity.metadata.qualifier && <p className="atlas-node-note">{String(entity.metadata.qualifier)}</p>}
    {!entity.metadata.qualifier && entity.description && <p className="atlas-node-note">{entity.description}</p>}
  </div>;
}
export default memo(PersonNode);
