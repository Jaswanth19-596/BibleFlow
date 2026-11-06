import { useState } from 'react';
import Modal from '@/components/common/Modal';
import EntityPicker from './EntityPicker';
import type { Entity, TimelinePeriod } from '@/lib/types';
import { errorMessage } from '@/lib/relationships';

export default function SetParentsModal({ child, entities, periods, onClose, onSave }: { child: Entity; entities: Entity[]; periods: TimelinePeriod[]; onClose: () => void; onSave: (data: { child: string; parents: string[]; parentage: string; period: string | null }) => Promise<unknown> }) {
  const [first, setFirst] = useState(''); const [second, setSecond] = useState(''); const [parentage, setParentage] = useState('unspecified'); const [period, setPeriod] = useState('');
  const [confirmed, setConfirmed] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const people = entities.filter(e => e.type === 'person' && e.id !== child.id);
  return <Modal open onClose={busy ? () => {} : onClose} title={`Set parents · ${child.name}`}>
    <form className="space-y-4" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(''); try { await onSave({ child: child.id, parents: [first, second].filter(Boolean), parentage, period: period || null }); onClose(); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); } }}>
      <p className="atlas-help">Add or confirm one or two direct parents together. Other parent assertions and their evidence stay recorded. Marriage and concubinage are recorded separately.</p>
      <fieldset disabled={busy} className="space-y-3"><EntityPicker label="First parent" entities={people} value={first} onChange={setFirst} exclude={second} /><EntityPicker label="Second parent (optional)" entities={people} value={second} onChange={setSecond} exclude={first} />
      <label className="atlas-label">Parentage context<select className="atlas-input" value={parentage} onChange={e => setParentage(e.target.value)}>{['unspecified','biological','adoptive','legal'].map(p => <option key={p}>{p}</option>)}</select></label>
      <label className="atlas-label">Relationship period<select className="atlas-input" value={period} onChange={e => setPeriod(e.target.value)}><option value="">Undated</option>{periods.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I confirm these are direct parents, rather than distant ancestors.</label></fieldset>
      {error && <p className="atlas-error" role="alert">{error}</p>}
      <div className="flex justify-end gap-2"><button className="atlas-button" type="button" onClick={onClose} disabled={busy}>Cancel</button><button className="atlas-button atlas-primary" disabled={busy || !first || !confirmed}>{busy ? 'Saving…' : 'Save parents'}</button></div>
    </form>
  </Modal>;
}
