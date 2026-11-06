import type { Entity, EntityRelationship, RelationshipDefinition } from './types';
import { resolveDefinition } from './relationships';

export interface FamilyGroup { id: string; parents: string[]; children: string[]; relationshipIds: string[]; context: string }
/** Only explicitly confirmed direct parentage is eligible. Legacy text alone never implies this. */
export function deriveFamilies(entities: Entity[], relationships: EntityRelationship[], definitions: RelationshipDefinition[]): FamilyGroup[] {
  const people = new Set(entities.filter(e => e.type === 'person').map(e => e.id));
  const children = new Map<string, { child: string; context: string; parents: Map<string, string[]> }>();
  for (const rel of relationships) {
    const def = resolveDefinition(rel, definitions), meta = rel.metadata;
    if (!def.parent_direction || meta?.lineage_scope !== 'direct' || meta.status !== 'explicit') continue;
    const parent = def.parent_direction === 'source' ? rel.from_entity_id : rel.to_entity_id;
    const child = def.parent_direction === 'source' ? rel.to_entity_id : rel.from_entity_id;
    if (!people.has(parent) || !people.has(child) || parent === child) continue;
    const context = JSON.stringify([meta.parentage ?? 'unspecified', meta.period_id ?? '']);
    const key = JSON.stringify([child, context]);
    const entry = children.get(key) ?? { child, context, parents: new Map<string, string[]>() };
    entry.parents.set(parent, [...(entry.parents.get(parent) ?? []), rel.id]);
    children.set(key, entry);
  }
  const groups = new Map<string, FamilyGroup>();
  for (const entry of children.values()) {
    if (entry.parents.size !== 2) continue;
    const parents = [...entry.parents.keys()].sort();
    const id = `family:${encodeURIComponent(JSON.stringify([parents, entry.context]))}`;
    const group = groups.get(id) ?? { id, parents, children: [], relationshipIds: [], context: entry.context };
    group.children.push(entry.child);
    group.relationshipIds.push(...[...entry.parents.values()].flat());
    groups.set(id, group);
  }
  return [...groups.values()];
}
export const pairKey = (source: string, target: string) => JSON.stringify([source, target].sort());
export function bundleRelationships(relationships: EntityRelationship[]) {
  const pairs = new Map<string, EntityRelationship[]>();
  for (const r of relationships) { const key = pairKey(r.from_entity_id, r.to_entity_id); pairs.set(key, [...(pairs.get(key) ?? []), r]); }
  return [...pairs.entries()].map(([id, items]) => ({ id, items }));
}
