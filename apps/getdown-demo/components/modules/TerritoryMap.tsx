'use client';

import { useState } from 'react';

export interface MapMarker {
  id: string;
  label: string;
  sub: string;
  lat: number; // 0-100 normalized territory coordinates
  lng: number;
  kind: 'lead' | 'estimate' | 'scheduled' | 'in_progress' | 'completed' | 'recurring' | 'commercial';
  value?: string;
}

export const MARKER_META: Record<MapMarker['kind'], { color: string; label: string }> = {
  lead: { color: '#22B8FF', label: 'Lead' },
  estimate: { color: '#FFB020', label: 'Estimate' },
  scheduled: { color: '#5EE0A8', label: 'Scheduled' },
  in_progress: { color: '#FF8A3D', label: 'In Progress' },
  completed: { color: '#7CFF3D', label: 'Completed' },
  recurring: { color: '#A66BFF', label: 'Recurring Property' },
  commercial: { color: '#C9D4E0', label: 'Commercial Contract' },
};

/**
 * Regional service map for the Get Down territory.
 *
 * Rendered as a schematic SVG rather than a tiled map service: it keeps the
 * demo fully offline, avoids third-party keys, and keeps the brand palette intact.
 */
export function TerritoryMap({
  markers,
  onSelect,
  height = 420,
}: {
  markers: MapMarker[];
  onSelect?: (m: MapMarker) => void;
  height?: number;
}) {
  const [hover, setHover] = useState<MapMarker | null>(null);
  const [filter, setFilter] = useState<MapMarker['kind'] | 'all'>('all');
  const shown = filter === 'all' ? markers : markers.filter((m) => m.kind === filter);

  const districts = [
    { name: 'NORTHGATE', x: 16, y: 22 },
    { name: 'RIVERMILL', x: 32, y: 34 },
    { name: 'CEDAR BLUFF', x: 20, y: 52 },
    { name: 'OAKHAVEN', x: 44, y: 58 },
    { name: 'STONECREST', x: 64, y: 66 },
    { name: 'WESTFIELD', x: 74, y: 40 },
    { name: 'HARBOR POINT', x: 80, y: 14 },
    { name: 'KINGSLEY', x: 34, y: 76 },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-gd-line bg-gd-abyss">
      {/* Legend / filters */}
      <div className="flex flex-wrap gap-1.5 border-b border-gd-line bg-gd-hull/60 px-3 py-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
            filter === 'all' ? 'bg-white/10 text-white' : 'text-gd-steel hover:text-white'
          }`}
        >
          All ({markers.length})
        </button>
        {(Object.keys(MARKER_META) as MapMarker['kind'][]).map((k) => {
          const count = markers.filter((m) => m.kind === k).length;
          if (!count) return null;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filter === k ? 'bg-white/10 text-white' : 'text-gd-steel hover:text-white'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: MARKER_META[k].color }}
              />
              {MARKER_META[k].label} ({count})
            </button>
          );
        })}
      </div>

      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0 L0 0 0 5" fill="none" stroke="#16324D" strokeWidth="0.12" />
            </pattern>
            <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0a2740" />
              <stop offset="100%" stopColor="#04121f" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#040b16" />
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Shoreline at Harbor Point */}
          <path d="M100,0 L100,32 C90,28 84,18 78,8 L74,0 Z" fill="url(#water)" opacity="0.85" />

          {/* Arterials */}
          {[
            'M2,30 C24,26 42,40 62,34 C78,29 90,36 99,30',
            'M8,64 C28,58 44,72 66,64 C82,58 92,66 99,60',
            'M22,2 C26,26 18,48 26,70 C30,84 26,94 24,99',
            'M62,2 C58,24 70,44 64,66 C60,82 66,92 68,99',
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#16324D" strokeWidth="0.55" opacity="0.9" />
          ))}
          {[
            'M2,30 C24,26 42,40 62,34 C78,29 90,36 99,30',
            'M22,2 C26,26 18,48 26,70 C30,84 26,94 24,99',
          ].map((d, i) => (
            <path key={`h${i}`} d={d} fill="none" stroke="#22B8FF" strokeWidth="0.18" opacity="0.35" />
          ))}
        </svg>

        {/* District labels */}
        {districts.map((d) => (
          <span
            key={d.name}
            className="pointer-events-none absolute font-display text-[9px] font-bold uppercase tracking-[0.18em] text-gd-steel/45"
            style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%,-50%)' }}
          >
            {d.name}
          </span>
        ))}

        {/* Markers */}
        {shown.map((mk) => {
          const meta = MARKER_META[mk.kind];
          const live = mk.kind === 'in_progress';
          return (
            <button
              key={mk.id}
              onClick={() => onSelect?.(mk)}
              onMouseEnter={() => setHover(mk)}
              onMouseLeave={() => setHover(null)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${mk.lng}%`, top: `${mk.lat}%` }}
              aria-label={mk.label}
            >
              <span
                className={`block h-3 w-3 rounded-full border-2 transition-transform group-hover:scale-150 ${
                  live ? 'animate-pulseRing' : ''
                }`}
                style={{ background: `${meta.color}dd`, borderColor: '#02060c' }}
              />
            </button>
          );
        })}

        {/* Hover card */}
        {hover && (
          <div
            className="pointer-events-none absolute z-20 w-52 -translate-x-1/2 rounded-lg border border-gd-line bg-gd-hull/95 p-2.5 shadow-xl backdrop-blur"
            style={{
              left: `${Math.min(88, Math.max(12, hover.lng))}%`,
              top: `calc(${hover.lat}% + 14px)`,
            }}
          >
            <p className="text-xs font-bold text-white">{hover.label}</p>
            <p className="mt-0.5 text-[11px] text-gd-steel">{hover.sub}</p>
            {hover.value && (
              <p className="mt-1 font-mono text-[11px] text-gd-neon">{hover.value}</p>
            )}
            <p
              className="mt-1 text-[9px] font-bold uppercase tracking-wider"
              style={{ color: MARKER_META[hover.kind].color }}
            >
              {MARKER_META[hover.kind].label}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-2 right-3 font-display text-[9px] font-bold uppercase tracking-[0.2em] text-gd-steel/40">
          Get Down Service Territory — schematic
        </div>
      </div>
    </div>
  );
}
