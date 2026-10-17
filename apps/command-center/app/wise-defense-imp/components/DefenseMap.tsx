'use client';

import { Incident, MeshNode } from '../utils/api-client';

interface DefenseMapProps {
  incidents: Incident[];
  meshNodes?: MeshNode[];
  userLocation?: { lat: number; lng: number };
}

export function DefenseMap({ incidents, meshNodes = [], userLocation }: DefenseMapProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'POLICE':
        return '#3b82f6';
      case 'FIRE':
        return '#ef4444';
      case 'EMS':
        return '#06b6d4';
      case 'TRAFFIC':
        return '#f97316';
      case 'WEATHER':
        return '#8b5cf6';
      case 'PUBLIC_SAFETY':
        return '#eab308';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="text-xs font-mono uppercase text-green-400 tracking-wider">Defense Intelligence Map</div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
        {/* SVG Map Background */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Tactical overlay lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30">
          <circle cx="50%" cy="50%" r="25%" fill="none" stroke="#22c55e" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="50%" fill="none" stroke="#22c55e" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="75%" fill="none" stroke="#22c55e" strokeWidth="0.5" />
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#22c55e" strokeWidth="0.5" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#22c55e" strokeWidth="0.5" />
        </svg>

        {/* User Location */}
        {userLocation && (
          <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
            <div className="relative">
              <div className="w-6 h-6 bg-green-400 rounded-full opacity-75 animate-pulse" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-green-400 rounded-full" />
              <div className="absolute inset-0 w-6 h-6 border-2 border-green-400 rounded-full animate-ping opacity-25" />
            </div>
          </div>
        )}

        {/* Incident Markers */}
        {incidents.map((incident, idx) => {
          const angle = (idx / incidents.length) * Math.PI * 2;
          const radius = 40 + Math.random() * 20;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          const color = getCategoryColor(incident.category);

          return (
            <div
              key={incident.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Marker outer ring */}
              <div
                className="w-4 h-4 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 12px ${color}`,
                }}
              />
              {/* Marker inner dot */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
              />

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-600">
                {incident.title}
                <div className="text-gray-400">{incident.distance.toFixed(1)} mi away</div>
              </div>
            </div>
          );
        })}

        {/* Mesh Nodes */}
        {meshNodes.map((node, idx) => {
          const angle = (idx / meshNodes.length) * Math.PI * 2;
          const radius = 20 + Math.random() * 10;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {/* Mesh node marker */}
              <div className="w-3 h-3 rounded-full border-2 border-cyan-400 opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-gray-600">
                {node.name}
                <div className="text-gray-400">Battery: {node.battery}%</div>
              </div>
            </div>
          );
        })}

        {/* Center compass */}
        <div className="absolute top-4 right-4 opacity-50">
          <div className="text-xs font-mono text-green-400 text-right">
            <div>↑ N</div>
            <div className="text-gray-600 text-xs">1 mi</div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 border border-gray-700 rounded p-2 text-xs space-y-1 font-mono">
          <div className="text-green-400 font-semibold mb-2">LEGEND</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            <span className="text-gray-400">Police</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span className="text-gray-400">Fire</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full" />
            <span className="text-gray-400">EMS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 border-2 border-cyan-400 rounded-full" />
            <span className="text-gray-400">Mesh Node</span>
          </div>
        </div>
      </div>
    </div>
  );
}
