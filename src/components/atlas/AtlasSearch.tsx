import { useId, useState } from 'react';
import type { AtlasSearchItem } from '@/lib/atlasSearch';
export default function AtlasSearch({ query, onQuery, results, pending, onSelect }: { query: string; onQuery: (value: string) => void; results: AtlasSearchItem[]; pending: boolean; onSelect: (item: AtlasSearchItem) => void }) {
  const [active, setActive] = useState(0); const [limit, setLimit] = useState(12); const [open, setOpen] = useState(true); const id = useId();
  const visible = results.slice(0, limit);
  return <div className="atlas-search">
    <div className="flex items-center gap-2"><input className="atlas-input" role="combobox" aria-label="Search the Atlas" aria-expanded={!!query.trim() && open} aria-controls={id} aria-autocomplete="list" aria-activedescendant={open && visible[active] ? `${id}-${active}` : undefined} value={query} placeholder="Search people, relationships, or references…" onFocus={() => setOpen(true)} onChange={e => { onQuery(e.target.value); setActive(0); setLimit(12); setOpen(true); }} onKeyDown={e => {
      if (e.key === 'Escape') { setOpen(false); e.stopPropagation(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive(a => Math.max(0, Math.min(a + 1, visible.length - 1))); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
      if (e.key === 'Enter' && visible[active]) { e.preventDefault(); onSelect(visible[active]); setOpen(false); }
    }} />{query && <button className="atlas-button" aria-label="Clear Atlas search" onClick={() => { onQuery(''); setOpen(false); }}>Clear</button>}</div>
    {query.trim() && open && <div className="atlas-search-results"><p className="atlas-help px-3 py-2" role="status">{pending ? 'Searching…' : results.length ? `${results.length} results across recorded entities and relationships` : 'No matching entities or relationships.'}</p><div role="listbox" id={id} aria-label="Atlas search results">{visible.map((item, index) => <button role="option" aria-selected={index === active} id={`${id}-${index}`} key={`${item.kind}:${item.id}`} className="atlas-search-result" onMouseEnter={() => setActive(index)} onClick={() => { onSelect(item); setOpen(false); }}><span className="atlas-result-kind">{item.kind}</span><strong>{item.title}</strong><span className="atlas-help">{item.detail}</span></button>)}</div>{results.length > limit && <button className="atlas-button m-2" onClick={() => setLimit(n => n + 30)}>Show more results</button>}</div>}
  </div>;
}
