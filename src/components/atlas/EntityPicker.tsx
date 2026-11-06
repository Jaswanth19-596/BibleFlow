import { useId, useState } from 'react';
import type { Entity } from '@/lib/types';
import { entityAliases, entityQualifier } from '@/lib/relationships';

export default function EntityPicker({ label, entities, value, onChange, exclude }: { label: string; entities: Entity[]; value: string; onChange: (id: string) => void; exclude?: string }) {
  const [query, setQuery] = useState('');
  const id = useId();
  const filtered = entities.filter(e => e.id !== exclude && (e.id === value || `${e.name} ${entityQualifier(e)} ${entityAliases(e).join(' ')} ${e.type} ${e.metadata?.kind ?? ''}`.toLowerCase().includes(query.toLowerCase())));
  return <div className="space-y-1.5">
    <label htmlFor={id} className="atlas-label">{label}</label>
    <input className="atlas-input" aria-label={`Search ${label.toLowerCase()}`} placeholder="Search name or description…" value={query} onChange={e => setQuery(e.target.value)} />
    <select id={id} className="atlas-input" value={value} onChange={e => onChange(e.target.value)}>
      <option value="">Choose {label.toLowerCase()}</option>
      {filtered.map(e => <option key={e.id} value={e.id}>{e.name} — {entityQualifier(e)}</option>)}
    </select>
    {query && <p className="atlas-help">{filtered.length} matching {filtered.length === 1 ? 'entity' : 'entities'}</p>}
  </div>;
}
