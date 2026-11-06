import { BIBLE_BOOKS } from './bibleBooks';
import type { Entity, EntityRelationship, RelationshipDefinition } from './types';
import { entityAliases, entityQualifier, formatEvidence, resolveDefinition, statement } from './relationships';

export interface AtlasSearchItem { id: string; kind: 'Entity' | 'Relationship type' | 'Relationship' | 'Reference'; title: string; detail: string; entityIds: string[]; relationshipId?: string; type?: string; text: string; names: string[] }
export function normalizeSearch(value: string): string {
  let text = value.toLowerCase().replace(/[.]/g, '').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const book of BIBLE_BOOKS) {
    const abbrev = book.abbrev.toLowerCase();
    if (text === abbrev || text.startsWith(`${abbrev} `)) { text = book.name.toLowerCase() + text.slice(abbrev.length); break; }
  }
  return text;
}
export function buildAtlasSearch(entities: Entity[], relationships: EntityRelationship[], definitions: RelationshipDefinition[]): AtlasSearchItem[] {
  const byId = new Map(entities.map(e => [e.id, e]));
  const result: AtlasSearchItem[] = entities.map(e => ({ id: e.id, kind: 'Entity', title: e.name, detail: entityQualifier(e), entityIds: [e.id], text: normalizeSearch([e.name, ...entityAliases(e), entityQualifier(e), e.type, e.metadata?.kind ?? '', e.description].join(' ')), names: [e.name, ...entityAliases(e)].map(normalizeSearch) }));
  const usedTypes = new Map<string, string>();
  for (const r of relationships) {
    const def = resolveDefinition(r, definitions), title = statement(r, byId, definitions);
    const endpointText = [byId.get(r.from_entity_id), byId.get(r.to_entity_id)].filter((e): e is Entity => !!e).map(e => `${entityQualifier(e)} ${entityAliases(e).join(' ')}`).join(' ');
    usedTypes.set(def.id, def.label);
    result.push({ id: r.id, kind: 'Relationship', title, detail: r.description || def.category, entityIds: [r.from_entity_id, r.to_entity_id], relationshipId: r.id, text: normalizeSearch([title, endpointText, def.category, r.description, ...(r.evidence ?? []).map(e => `${formatEvidence(e)} ${e.note}`)].join(' ')), names: [normalizeSearch(def.label)] });
    for (const [index, e] of (r.evidence ?? []).entries()) result.push({ id: `reference:${r.id}:${index}`, kind: 'Reference', title: formatEvidence(e), detail: title, entityIds: [r.from_entity_id, r.to_entity_id], relationshipId: r.id, text: normalizeSearch(`${formatEvidence(e)} ${e.note} ${title}`), names: [normalizeSearch(formatEvidence(e))] });
  }
  for (const [id, label] of usedTypes) result.push({ id: `type:${id}`, kind: 'Relationship type', title: label, detail: 'Filter the canvas by this relationship', type: id, entityIds: [], text: normalizeSearch(label), names: [normalizeSearch(label)] });
  return result;
}
export function searchAtlas(index: AtlasSearchItem[], query: string): AtlasSearchItem[] {
  const key = normalizeSearch(query), tokens = key.split(' ').filter(Boolean);
  if (!tokens.length) return [];
  const score = (item: AtlasSearchItem) => item.names.includes(key) ? (item.kind === 'Entity' ? 0 : 2) : item.names.some(n => n.startsWith(key)) ? 3 : item.kind === 'Relationship type' ? 4 : 5;
  return index.filter(item => tokens.every(token => item.text.includes(token))).sort((a, b) => score(a) - score(b) || a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
}
