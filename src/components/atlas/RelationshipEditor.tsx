import { useId, useState } from 'react';
import Modal from '@/components/common/Modal';
import EntityPicker from './EntityPicker';
import type { Entity, EntityRelationship, RelationshipDefinition, RelationshipDraft, RelationshipMetadata, TimelinePeriod } from '@/lib/types';
import { errorMessage, formatEvidence, normalizeLabel, parseEvidence, RELATIONSHIP_CATEGORIES, relationshipIdentity, resolveDefinition } from '@/lib/relationships';

interface Props {
  entities: Entity[]; relationships: EntityRelationship[]; definitions: RelationshipDefinition[]; periods: TimelinePeriod[];
  initial?: EntityRelationship; source?: string; target?: string; onClose: () => void;
  onSave: (draft: RelationshipDraft) => Promise<unknown>; onDelete: (id: string) => Promise<unknown>;
}
export default function RelationshipEditor({ entities, relationships, definitions, periods, initial, source, target, onClose, onSave, onDelete }: Props) {
  const [from, setFrom] = useState(initial?.from_entity_id ?? source ?? '');
  const [to, setTo] = useState(initial?.to_entity_id ?? target ?? '');
  const [label, setLabel] = useState(initial ? resolveDefinition(initial, definitions).label : '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [category, setCategory] = useState<RelationshipDraft['category']>('other');
  const [symmetric, setSymmetric] = useState(false);
  const [metadata, setMetadata] = useState<RelationshipMetadata>(initial?.metadata ?? {});
  const [references, setReferences] = useState((initial?.evidence ?? []).map(formatEvidence).join('\n'));
  const [notes, setNotes] = useState<Record<string, string>>(Object.fromEntries((initial?.evidence ?? []).map(e => [formatEvidence(e), e.note])));
  const [confirmed, setConfirmed] = useState(initial?.metadata?.lineage_scope === 'direct' && initial.metadata.status === 'explicit');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const listId = useId();
  const definition = definitions.find(d => normalizeLabel(d.label) === normalizeLabel(label));
  const names = new Map(entities.map(e => [e.id, e.name]));
  const types = [...new Set([...definitions.map(d => d.label), ...relationships.map(r => resolveDefinition(r, definitions).label)])];
  let parsed: ReturnType<typeof parseEvidence> = []; try { parsed = parseEvidence(references); } catch { /* Show validation at save. */ }
  const patchMeta = (patch: RelationshipMetadata) => setMetadata(m => ({ ...m, ...patch }));
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (!from || !to || from === to || !label.trim()) { setError('Choose two different entities and a relationship.'); return; }
    if (definition?.parent_direction && metadata.lineage_scope === 'direct' && metadata.status === 'explicit' && !confirmed) { setError('Confirm direct parentage before saving.'); return; }
    try {
      const evidence = parseEvidence(references).map(e => ({ ...e, note: notes[formatEvidence(e)] ?? '' }));
      const draft: RelationshipDraft = { id: initial?.id, from_entity_id: from, to_entity_id: to, type: initial && normalizeLabel(initial.type) === normalizeLabel(label) ? initial.type : label.trim(), description, category: definition?.category ?? category, symmetric: definition?.symmetric ?? symmetric, metadata, evidence };
      const candidate = { ...draft, id: initial?.id ?? '', created_at: '', definition_id: definition?.id };
      if (relationships.some(r => r.id !== initial?.id && relationshipIdentity(r, definitions) === relationshipIdentity(candidate, definitions))) {
        setError('This assertion is already recorded with the same context. Open it to add evidence, or choose a distinct context.'); return;
      }
      setBusy(true); await onSave(draft); onClose();
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!initial || !window.confirm('Delete this relationship and its evidence? The connected entities will stay.')) return;
    setBusy(true); try { await onDelete(initial.id); onClose(); } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  return <Modal open onClose={busy ? () => {} : onClose} title={initial ? 'Edit relationship' : 'Add relationship'} size="lg">
    <form onSubmit={save} className="space-y-4">
      <fieldset disabled={busy} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2"><EntityPicker label="Source" entities={entities} value={from} onChange={setFrom} exclude={to} /><EntityPicker label="Target" entities={entities} value={to} onChange={setTo} exclude={from} /></div>
        <button type="button" className="atlas-link" onClick={() => { setFrom(to); setTo(from); setConfirmed(false); }}>Swap direction</button>
        <label className="atlas-label">Relationship
          <input className="atlas-input mt-1" list={listId} value={label} onChange={e => { setLabel(e.target.value); setConfirmed(false); }} placeholder="Search or type any relationship…" required maxLength={160} />
          <datalist id={listId}>{types.map(t => <option key={t} value={t} />)}</datalist>
        </label>
        {!definition && label.trim() && <div className="space-y-2"><p className="atlas-help">Create “{label.trim()}” as a reusable relationship type.</p><label className="atlas-label">Category<select className="atlas-input" value={category} onChange={e => setCategory(e.target.value as typeof category)}>{Object.entries(RELATIONSHIP_CATEGORIES).map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}</select></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={symmetric} onChange={e => setSymmetric(e.target.checked)} />This relationship means the same in both directions</label></div>}
        <p className="atlas-statement">{names.get(from) ?? 'Source'} <span>{label || 'relationship'} {(definition?.symmetric ?? symmetric) ? '↔' : '→'}</span> {names.get(to) ?? 'Target'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="atlas-label">Assertion status<select className="atlas-input" value={metadata.status ?? 'unspecified'} onChange={e => { patchMeta({ status: e.target.value as RelationshipMetadata['status'] }); setConfirmed(false); }}>{['unspecified','explicit','inferred','disputed'].map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          <label className="atlas-label">Relationship period<select className="atlas-input" value={metadata.period_id ?? ''} onChange={e => patchMeta({ period_id: e.target.value || null })}><option value="">Undated</option>{periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        </div>
        {definition?.parent_direction && <div className="atlas-inset space-y-3"><label className="atlas-label">Lineage meaning<select className="atlas-input" value={metadata.lineage_scope ?? 'unspecified'} onChange={e => { patchMeta({ lineage_scope: e.target.value as RelationshipMetadata['lineage_scope'] }); setConfirmed(false); }}><option value="unspecified">Unspecified / needs review</option><option value="direct">Direct parent and child</option><option value="ancestor">Ancestor / descendant</option></select></label><label className="atlas-label">Parentage context<select className="atlas-input" value={metadata.parentage ?? 'unspecified'} onChange={e => patchMeta({ parentage: e.target.value as RelationshipMetadata['parentage'] })}>{['unspecified','biological','adoptive','legal'].map(p => <option key={p} value={p}>{p}</option>)}</select></label>{metadata.lineage_scope === 'direct' && metadata.status === 'explicit' && <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I confirm this means direct parentage. It may form a shared family branch.</label>}</div>}
        <label className="atlas-label">Scripture references<textarea className="atlas-input mt-1" value={references} onChange={e => setReferences(e.target.value)} placeholder={'2 Samuel 21:8\nOne reference per line, or separate with semicolons'} rows={2} /></label>
        {parsed.map((e, i) => <label key={`${formatEvidence(e)}:${i}`} className="atlas-label">Evidence note · {formatEvidence(e)}<input className="atlas-input mt-1" value={notes[formatEvidence(e)] ?? ''} onChange={event => setNotes(n => ({ ...n, [formatEvidence(e)]: event.target.value }))} placeholder="Optional explanation" /></label>)}
        <label className="atlas-label">Notes<textarea className="atlas-input mt-1" value={description} onChange={e => setDescription(e.target.value)} rows={2} /></label>
      </fieldset>
      {error && <p role="alert" className="atlas-error">{error}</p>}
      <div className="flex items-center justify-between gap-2">{initial ? <button type="button" className="atlas-link text-red-700" disabled={busy} onClick={remove}>Delete relationship</button> : <span />}<div className="flex gap-2"><button type="button" className="atlas-button" disabled={busy} onClick={onClose}>Cancel</button><button className="atlas-button atlas-primary" disabled={busy}>{busy ? 'Saving…' : 'Save relationship'}</button></div></div>
    </form>
  </Modal>;
}
