import { BIBLE_BOOKS } from './bibleBooks';
import type { Entity, EntityRelationship, RelationshipCategory, RelationshipDefinition, RelationshipEvidence } from './types';

export const RELATIONSHIP_CATEGORIES: Record<RelationshipCategory, { label: string; color: string }> = {
  family: { label: 'Family', color: '#7c59a4' },
  religious: { label: 'Religious & service', color: '#167d8d' },
  political: { label: 'Political & social', color: '#b37426' },
  geography: { label: 'Places & movement', color: '#45784d' },
  other: { label: 'Other', color: '#64748b' },
};
const seeds: Array<[string, RelationshipCategory, boolean?, string?, ('source' | 'target')?]> = [
  ['father of', 'family', false, '', 'source'], ['mother of', 'family', false, '', 'source'],
  ['parent of', 'family', false, 'child of', 'source'], ['son of', 'family', false, '', 'target'],
  ['daughter of', 'family', false, '', 'target'], ['child of', 'family', false, 'parent of', 'target'],
  ['ancestor of', 'family', false, 'descendant of'], ['descendant of', 'family', false, 'ancestor of'],
  ['married to', 'family', true], ['concubine of', 'family'], ['sibling of', 'family', true],
  ['priest of', 'religious'], ['high priest of', 'religious'], ['prophet of', 'religious'],
  ['prophet to', 'religious'], ['served under', 'religious'], ['disciple of', 'religious', false, 'mentor of'],
  ['mentor of', 'religious', false, 'disciple of'], ['king of', 'political'], ['queen of', 'political'],
  ['member of', 'political'], ['ally of', 'political', true], ['enemy of', 'political', true],
  ['succeeded by', 'political', false, 'preceded by'], ['preceded by', 'political', false, 'succeeded by'],
  ['lived in', 'geography'], ['born in', 'geography'], ['traveled to', 'geography'],
  ['capital of', 'geography'], ['part of', 'geography'], ['related to', 'other', true],
];
export const normalizeLabel = (text: string) => text.trim().toLocaleLowerCase().replace(/[-\s]+/g, ' ');
export const BUILTIN_DEFINITIONS: RelationshipDefinition[] = seeds.map(([label, category, symmetric = false, inverse = '', direction]) => ({
  id: label.replace(/ /g, '-'), label, category, symmetric, inverse_label: inverse || null, parent_direction: direction ?? null,
}));
export function resolveDefinition(rel: Pick<EntityRelationship, 'type' | 'definition_id'>, definitions = BUILTIN_DEFINITIONS): RelationshipDefinition {
  return definitions.find(d => d.id === rel.definition_id) ?? definitions.find(d => normalizeLabel(d.label) === normalizeLabel(rel.type)) ?? {
    id: `custom:${normalizeLabel(rel.type)}`, label: rel.type, category: 'other', symmetric: false, inverse_label: null, parent_direction: null,
  };
}
export const entityQualifier = (entity: Entity) => String(entity.metadata?.qualifier || entity.description || entity.type);
export function entityAliases(entity: Entity): string[] {
  return Array.isArray(entity.metadata?.aliases) ? entity.metadata.aliases.filter((x): x is string => typeof x === 'string') : [];
}
export function statement(rel: EntityRelationship, entities: Map<string, Entity>, definitions = BUILTIN_DEFINITIONS) {
  const def = resolveDefinition(rel, definitions);
  return `${entities.get(rel.from_entity_id)?.name ?? 'Unknown'} — ${def.label} ${def.symmetric ? '↔' : '→'} ${entities.get(rel.to_entity_id)?.name ?? 'Unknown'}`;
}
export function formatEvidence(e: RelationshipEvidence) {
  return `${e.book} ${e.chapter}:${e.verse_start}${e.verse_end && e.verse_end !== e.verse_start ? `–${e.verse_end}` : ''}`;
}
export function parseEvidence(text: string): RelationshipEvidence[] {
  return text.split(/[;\n]+/).map(s => s.trim()).filter(Boolean).map(value => {
    const match = value.match(/^(.+?)\s+(\d+):(\d+)(?:[-–](\d+))?$/);
    if (!match) throw new Error(`Use a reference such as “2 Samuel 21:8” (${value}).`);
    const key = match[1].toLowerCase().replace(/\./g, '').replace(/\s/g, '');
    const book = BIBLE_BOOKS.find(b => [b.name, b.abbrev].some(n => n.toLowerCase().replace(/\s/g, '') === key));
    const chapter = Number(match[2]), start = Number(match[3]), end = match[4] ? Number(match[4]) : null;
    if (!book || chapter < 1 || chapter > book.chapters || start < 1 || start > book.versesPerChapter[chapter - 1] || (end !== null && (end < start || end > book.versesPerChapter[chapter - 1]))) {
      throw new Error(`Check the book, chapter, and verses in “${value}”.`);
    }
    return { book: book.name, chapter, verse_start: start, verse_end: end, note: '' };
  });
}
export function relationshipIdentity(rel: EntityRelationship, definitions = BUILTIN_DEFINITIONS): string {
  const def = resolveDefinition(rel, definitions);
  let source = rel.from_entity_id, target = rel.to_entity_id, type = normalizeLabel(def.label);
  if (def.symmetric) [source, target] = [source, target].sort();
  else if (def.parent_direction) {
    if (def.parent_direction === 'target') [source, target] = [target, source];
    type = 'parentage';
  } else if (def.inverse_label && normalizeLabel(def.inverse_label) < type) {
    [source, target] = [target, source]; type = normalizeLabel(def.inverse_label);
  }
  return JSON.stringify([source, target, type, rel.metadata?.period_id ?? '', rel.metadata?.parentage ?? 'unspecified', rel.metadata?.lineage_scope ?? 'unspecified', rel.metadata?.status ?? 'unspecified']);
}
export function errorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  const e = error as { message?: string; code?: string };
  if (['PGRST202', 'PGRST205', '42P01', '42703'].includes(e?.code ?? '')) return 'The relationship update needs database migration 010. Apply it in Supabase, then retry; your input is still here.';
  return e?.message || 'Could not complete the request. Check your connection and try again.';
}
