import { useState } from 'react';
import Modal from '@/components/common/Modal';
import type { Entity, EntityType } from '@/lib/types';
import { entityAliases, errorMessage } from '@/lib/relationships';
import { ENTITY_TYPE_COLORS } from '@/lib/edgeTypes';

export type AtlasEntityInput = Pick<Entity, 'name' | 'description' | 'color' | 'type' | 'metadata'>;
interface Props { open: boolean; onClose: () => void; onSubmit: (data: AtlasEntityInput) => Promise<unknown>; editingPerson?: Entity | null; entities?: Entity[] }
export default function CreatePersonModal(props: Props) {
  return props.open ? <EntityForm key={props.editingPerson?.id ?? 'new'} {...props} /> : null;
}
function EntityForm({ onClose, onSubmit, editingPerson, entities = [] }: Props) {
  const [name, setName] = useState(editingPerson?.name ?? ''); const [description, setDescription] = useState(editingPerson?.description ?? '');
  const [type, setType] = useState<EntityType>(editingPerson?.type ?? 'person');
  const [kind, setKind] = useState(String(editingPerson?.metadata?.kind ?? ''));
  const [qualifier, setQualifier] = useState(String(editingPerson?.metadata?.qualifier ?? ''));
  const [aliases, setAliases] = useState(editingPerson ? entityAliases(editingPerson).join(', ') : '');
  const [distinct, setDistinct] = useState(false); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const matches = entities.filter(e => e.id !== editingPerson?.id && e.type === type && e.name.toLowerCase() === name.trim().toLowerCase());
  return <Modal open onClose={busy ? () => {} : onClose} title={editingPerson ? 'Edit entity' : 'Add person or entity'}>
    <form className="space-y-4" onSubmit={async e => { e.preventDefault(); setError(''); if (matches.length && (!distinct || !qualifier.trim())) { setError('Add a distinguishing description and confirm this is a different entity.'); return; } setBusy(true); try { await onSubmit({ name: name.trim(), description: description.trim(), type, color: editingPerson?.type === type ? editingPerson.color : ENTITY_TYPE_COLORS[type], metadata: { ...editingPerson?.metadata, kind: kind || undefined, qualifier: qualifier.trim(), aliases: aliases.split(',').map(a => a.trim()).filter(Boolean) } }); onClose(); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } }}>
      <fieldset disabled={busy} className="space-y-3">
      <label className="atlas-label">Name<input className="atlas-input mt-1" value={name} onChange={e => { setName(e.target.value); setDistinct(false); }} required /></label>
      <label className="atlas-label">Entity type<select className="atlas-input" value={kind || type} onChange={e => { const value = e.target.value; if (['group','institution','divine entity'].includes(value)) { setType('concept'); setKind(value); } else { setType(value as EntityType); setKind(''); } }}>{['person','place','nation','event','object','concept','group','institution','divine entity'].map(t => <option key={t}>{t}</option>)}</select></label>
      <label className="atlas-label">Distinguishing description<input className="atlas-input mt-1" placeholder="e.g. son of Saul, or the prophet" value={qualifier} onChange={e => setQualifier(e.target.value)} /></label>
      <label className="atlas-label">Aliases<input className="atlas-input mt-1" placeholder="Separate alternate names with commas" value={aliases} onChange={e => setAliases(e.target.value)} /></label>
      <label className="atlas-label">Notes<textarea className="atlas-input mt-1" value={description} onChange={e => setDescription(e.target.value)} rows={3} /></label>
      {matches.length > 0 && <div className="atlas-inset space-y-2"><p className="atlas-help">Already recorded: {matches.map(m => `${m.name} (${m.metadata.qualifier || m.description || m.type})`).join('; ')}. Cancel to use an existing entity.</p><label className="flex gap-2 text-sm"><input type="checkbox" checked={distinct} onChange={e => setDistinct(e.target.checked)} />This is a different entity with the same name.</label></div>}
      </fieldset>
      {error && <p role="alert" className="atlas-error">{error}</p>}
      <div className="flex justify-end gap-2"><button type="button" className="atlas-button" disabled={busy} onClick={onClose}>Cancel</button><button className="atlas-button atlas-primary" disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Save entity'}</button></div>
    </form>
  </Modal>;
}
