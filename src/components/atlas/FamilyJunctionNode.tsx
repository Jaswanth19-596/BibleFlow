import { Handle, Position } from '@xyflow/react';
export default function FamilyJunctionNode({ data }: { data: { onClick: () => void; label: string } }) {
  return <div className="atlas-junction"><Handle type="target" position={Position.Top} id="target-top" /><button className="nodrag" aria-label={`Inspect shared parents: ${data.label}`} title={data.label} onClick={data.onClick}>●</button><Handle type="source" position={Position.Bottom} id="source-bottom" /></div>;
}
