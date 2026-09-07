import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ALL_ERAS, ERAS, validateEraSelection } from '@/lib/historicalEraResolver';
import type { EraLayers, EraSelection } from '@/lib/historicalEraTypes';

export const ERA_PREFERENCE_KEY = 'bibleflow.historical-era.v1';
export function readEraUrl(search: string) {
  const params = new URLSearchParams(search);
  const id = params.get('era');
  return { selection: validateEraSelection(id, params.get('snapshot')), explicit: params.has('era'), invalid: id !== null && id !== 'all' && !ERAS.some(e => e.id === id) };
}
export function eraUrl(search: string, selection: EraSelection) {
  const params = new URLSearchParams(search);
  params.delete('snapshot');
  if (selection.eraId) params.set('era', selection.eraId); else params.delete('era');
  if (selection.snapshotId && selection.snapshotId !== ERAS.find(e => e.id === selection.eraId)?.defaultSnapshotId) params.set('snapshot', selection.snapshotId);
  return `?${params.toString()}`;
}
export function useHistoricalEra() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initial] = useState(() => {
    const url = readEraUrl(location.search);
    if (url.explicit) return url.selection;
    try { const saved = JSON.parse(localStorage.getItem(ERA_PREFERENCE_KEY) ?? 'null'); return validateEraSelection(saved?.eraId, saved?.snapshotId); } catch { return ALL_ERAS; }
  });
  const [preview, setPreview] = useState<EraSelection | null>(null);
  const [layers, setLayers] = useState<EraLayers>({ areas: true, journeys: true, names: false });
  const [status, setStatus] = useState('');
  const firstLocation = useRef(location.key);
  const [initialized, setInitialized] = useState(false);
  const parsed = readEraUrl(location.search);
  const committed = !initialized && location.key === firstLocation.current && !parsed.explicit ? initial : parsed.selection;
  // Materialize a saved initial preference in this history entry. Subsequent history is URL-only.
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      if (!parsed.explicit && initial.eraId) navigate({ search: eraUrl(location.search, initial) }, { replace: true });
    }
  }, [initialized, initial, parsed.explicit, location.search, navigate]);
  useEffect(() => { setPreview(null); const current = readEraUrl(location.search); setStatus(current.selection.eraId ? `${ERAS.find(e => e.id === current.selection.eraId)?.label} selected. Camera unchanged.` : 'All eras selected.'); }, [location.key, location.search]);
  const commit = useCallback((next: EraSelection) => {
    const valid = validateEraSelection(next.eraId, next.snapshotId);
    setPreview(null);
    try { if (valid.eraId) localStorage.setItem(ERA_PREFERENCE_KEY, JSON.stringify(valid)); else localStorage.removeItem(ERA_PREFERENCE_KEY); } catch { /* URL remains usable with storage disabled. */ }
    const search = eraUrl(location.search, valid);
    if (search !== location.search) navigate({ search });
    setStatus(valid.eraId ? `${ERAS.find(e => e.id === valid.eraId)?.label} selected. Camera unchanged.` : 'All eras selected.');
  }, [location.search, navigate]);
  return { selection: preview ?? committed, committed, preview: setPreview, commit, layers, setLayers, status: parsed.invalid ? 'Unknown era in this link. Showing All eras.' : status, announce: setStatus };
}
