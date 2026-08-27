'use client';

import { WatchZone } from '@/hooks/useWiseDefenseApi';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface WatchZonesMapProps {
  zones: WatchZone[];
  loading?: boolean;
}

// Greensboro, NC coordinates
const GREENSBORO_LAT = 36.0726;
const GREENSBORO_LNG = -79.7920;

export function WatchZonesMap({ zones, loading }: WatchZonesMapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Simple map projection for visualization
  const project = (lat: number, lng: number) => {
    const scale = 4; // pixels per degree at this zoom level
    const x = (lng - GREENSBORO_LNG) * scale * 80;
    const y = (GREENSBORO_LAT - lat) * scale * 80;
    return { x, y };
  };

  const mapWidth = 400;
  const mapHeight = 300;
  const centerX = mapWidth / 2;
  const centerY = mapHeight / 2;

  return (
    <div className="border border-red-600/30 rounded-lg p-6 bg-black/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-black tracking-wider text-red-600 uppercase">
            Watch Zones
          </h3>
        </div>
        <span className="text-xs text-gray-400">Greensboro, NC</span>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Loading zones...</p>
        </div>
      )}

      {!loading && zones.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No watch zones configured</p>
        </div>
      )}

      {!loading && zones.length > 0 && (
        <>
          {/* Map SVG */}
          <div className="relative mb-6 bg-gradient-to-b from-gray-900 to-black rounded-lg border border-gray-800 overflow-hidden">
            <svg
              width={mapWidth}
              height={mapHeight}
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-auto"
            >
              {/* Grid background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

              {/* Center point (Greensboro) */}
              <circle cx={centerX} cy={centerY} r="4" fill="#ef4444" />
              <text
                x={centerX}
                y={centerY - 8}
                textAnchor="middle"
                fill="#ef4444"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
              >
                GREENSBORO
              </text>

              {/* Watch zones */}
              {zones.map((zone) => {
                const { x, y } = project(zone.latitude, zone.longitude);
                const radiusPixels = (zone.radiusMiles / 10) * 8; // Approximate pixel radius
                const isHovered = hoveredZone === zone.id;

                return (
                  <g key={zone.id}>
                    {/* Zone circle */}
                    <circle
                      cx={centerX + x}
                      cy={centerY + y}
                      r={radiusPixels}
                      fill="rgba(239, 68, 68, 0.1)"
                      stroke={isHovered ? '#ef4444' : '#dc2626'}
                      strokeWidth={isHovered ? 2 : 1}
                      strokeDasharray="4,2"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredZone(zone.id)}
                      onMouseLeave={() => setHoveredZone(null)}
                    />

                    {/* Zone center point */}
                    <circle
                      cx={centerX + x}
                      cy={centerY + y}
                      r={isHovered ? 3 : 2}
                      fill={isHovered ? '#fbbf24' : '#fca5a5'}
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredZone(zone.id)}
                      onMouseLeave={() => setHoveredZone(null)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Zones list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={`border rounded-lg p-3 transition-all cursor-pointer ${
                  hoveredZone === zone.id
                    ? 'border-red-600/60 bg-red-600/10'
                    : 'border-red-600/20 hover:border-red-600/40 hover:bg-red-600/5'
                }`}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">
                      {zone.name}
                    </h4>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      {zone.latitude.toFixed(4)}° N, {Math.abs(zone.longitude).toFixed(4)}° W
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Radius: {zone.radiusMiles} mi • Min Threat: {zone.minimumThreat}
                    </div>
                    {zone.categories.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1 flex flex-wrap gap-1">
                        {zone.categories.map((cat) => (
                          <span key={cat} className="bg-gray-700/50 px-2 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {zone.enabled ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
