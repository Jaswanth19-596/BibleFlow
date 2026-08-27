import { useState, useEffect, useMemo } from 'react';
import { MapPath, MapPathPoint, PathLineStyle } from '@/lib/types';
import { TravelPlace, distanceInKm } from '@/lib/travelInsights';

interface CreatePathModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    color: string;
    style: PathLineStyle;
    points: MapPathPoint[];
    total_distance_km: number;
  }) => Promise<void>;
  initialPath?: MapPath | null;
  initialPoints?: MapPathPoint[];
  availablePlaces: TravelPlace[];
}

const COLOR_PRESETS = [
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Amber', value: '#d97706' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Sky', value: '#0284c7' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Ruby', value: '#dc2626' },
];

function calculateTotalDistance(points: MapPathPoint[]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += distanceInKm(
      { lat: points[i].lat, lng: points[i].lng },
      { lat: points[i + 1].lat, lng: points[i + 1].lng }
    );
  }
  return Math.round(total * 10) / 10;
}

export default function CreatePathModal({
  open,
  onClose,
  onSubmit,
  initialPath = null,
  initialPoints = [],
  availablePlaces,
}: CreatePathModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [style, setStyle] = useState<PathLineStyle>('solid');
  const [points, setPoints] = useState<MapPathPoint[]>([]);
  const [saving, setSaving] = useState(false);
  const [addSearchQuery, setAddSearchQuery] = useState('');
  const [showAddStop, setShowAddStop] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialPath) {
        setName(initialPath.name);
        setDescription(initialPath.description || '');
        setColor(initialPath.color || '#4f46e5');
        setStyle(initialPath.style || 'solid');
        setPoints(initialPath.points || []);
      } else if (initialPoints.length > 0) {
        setName(
          initialPoints.length >= 2
            ? `${initialPoints[0].name} to ${initialPoints[initialPoints.length - 1].name}`
            : ''
        );
        setDescription('');
        setColor('#4f46e5');
        setStyle('solid');
        setPoints(initialPoints);
      } else {
        setName('');
        setDescription('');
        setColor('#4f46e5');
        setStyle('solid');
        setPoints([]);
      }
      setShowAddStop(false);
      setAddSearchQuery('');
    }
  }, [open, initialPath, initialPoints]);

  const totalDistanceKm = useMemo(() => calculateTotalDistance(points), [points]);
  const totalDistanceMiles = useMemo(() => Math.round(totalDistanceKm * 0.621371 * 10) / 10, [totalDistanceKm]);

  const searchMatches = useMemo(() => {
    const q = addSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return availablePlaces
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [addSearchQuery, availablePlaces]);

  if (!open) return null;

  const handleAddStop = (place: TravelPlace) => {
    const newPoint: MapPathPoint = {
      id: `pt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      place_id: place.id,
      kind: place.kind,
    };
    setPoints(prev => [...prev, newPoint]);
    setAddSearchQuery('');
    setShowAddStop(false);
  };

  const handleRemovePoint = (index: number) => {
    setPoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleMovePoint = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= points.length) return;
    setPoints(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || points.length < 2) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        color,
        style,
        points,
        total_distance_km: totalDistanceKm,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialPath ? 'Edit Marked Path' : 'Label & Save Path'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save this path to study or revisit anytime on the map.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Label / Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Path Label / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Paul's Journey to Rome, Exodus Route, Emmaus Walk"
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Description / Scripture */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Description & Scripture References
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Acts 27-28 · The voyage from Caesarea to Rome via Crete, Malta, and Puteoli"
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Color & Style Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Path Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setColor(preset.value)}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      color === preset.value
                        ? 'border-slate-900 scale-110 shadow-md dark:border-white'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.label}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-full border border-slate-200 p-0 overflow-hidden dark:border-slate-700"
                  title="Custom color"
                />
              </div>
            </div>

            {/* Line Style */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Line Style
              </label>
              <div className="flex gap-2">
                {(['solid', 'dashed', 'dotted'] as PathLineStyle[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold capitalize transition ${
                      style === s
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Route Stops / Waypoints */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Stops & Waypoints ({points.length})
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {totalDistanceKm > 0 ? `${totalDistanceKm} km (${totalDistanceMiles} miles) total` : 'Add at least 2 stops'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStop(prev => !prev)}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                {showAddStop ? '✕ Cancel' : '+ Add Stop'}
              </button>
            </div>

            {/* Inline search to add a stop */}
            {showAddStop && (
              <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <input
                  type="text"
                  value={addSearchQuery}
                  onChange={e => setAddSearchQuery(e.target.value)}
                  placeholder="Search biblical or saved place to add..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  autoFocus
                />
                {searchMatches.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchMatches.map(match => (
                      <button
                        key={match.id}
                        type="button"
                        onClick={() => handleAddStop(match)}
                        className="flex w-full items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-left text-xs font-semibold text-slate-800 transition hover:bg-indigo-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-900/50"
                      >
                        <span>{match.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {match.kind === 'saved' ? 'Saved place' : match.detail || 'Biblical'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ordered stops list */}
            {points.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                No stops added yet. Draw points on the map or click &quot;+ Add Stop&quot;.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {points.map((pt, idx) => (
                  <div
                    key={pt.id || idx}
                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium dark:border-slate-800/80 dark:bg-slate-800/50"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={pt.name}
                      onChange={e => {
                        const newName = e.target.value;
                        setPoints(prev =>
                          prev.map((p, i) => (i === idx ? { ...p, name: newName } : p))
                        );
                      }}
                      className="flex-1 min-w-0 bg-transparent font-semibold text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMovePoint(idx, 'up')}
                        disabled={idx === 0}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePoint(idx, 'down')}
                        disabled={idx === points.length - 1}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 dark:hover:bg-slate-700"
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePoint(idx)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                        title="Remove stop"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || points.length < 2 || saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : initialPath ? 'Save Changes' : 'Save Labeled Path'}
          </button>
        </div>
      </div>
    </div>
  );
}
