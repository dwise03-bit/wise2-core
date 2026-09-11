'use client';

import { Incident } from '../utils/api-client';

interface IncidentFeedProps {
  incidents: Incident[];
  maxHeight?: string;
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case 'POLICE':
      return '🛡️';
    case 'FIRE':
      return '🔥';
    case 'EMS':
      return '🚑';
    case 'TRAFFIC':
      return '🚗';
    case 'WEATHER':
      return '⛈️';
    case 'PUBLIC_SAFETY':
      return '⚠️';
    default:
      return '📍';
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return 'border-red-500 bg-red-900/10';
    case 'WARNING':
      return 'border-yellow-500 bg-yellow-900/10';
    case 'WATCH':
      return 'border-blue-500 bg-blue-900/10';
    default:
      return 'border-gray-500 bg-gray-900/10';
  }
}

function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return '⚡ CRITICAL';
    case 'WARNING':
      return '⚠️  WARNING';
    case 'WATCH':
      return '👁️  WATCH';
    default:
      return '📊 INFO';
  }
}

export function IncidentFeed({ incidents, maxHeight = 'max-h-96' }: IncidentFeedProps) {
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col ${maxHeight}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="text-xs font-mono uppercase text-green-400 tracking-wider">Recent Incidents</div>
        <div className="text-xs text-gray-500">{incidents.length} active</div>
      </div>

      {/* Incidents List */}
      <div className="overflow-y-auto flex-1">
        {incidents.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No active incidents</div>
        ) : (
          <div className="space-y-2 p-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className={`border rounded p-3 space-y-1 transition-colors hover:bg-gray-800/50 ${getSeverityColor(
                  incident.severity,
                )}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(incident.category)}</span>
                    <span className="text-xs font-mono font-semibold text-gray-200">{incident.title}</span>
                  </div>
                  <span className={`text-xs font-mono whitespace-nowrap ${getSeverityColor(incident.severity)}`}>
                    {getSeverityLabel(incident.severity)}
                  </span>
                </div>

                {/* Distance and location */}
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>📍 {incident.distance.toFixed(1)} mi</span>
                  <span className="text-gray-500">from {incident.latitude.toFixed(2)}, {incident.longitude.toFixed(2)}</span>
                </div>

                {/* Timestamp and source */}
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>{new Date(incident.timestamp).toLocaleTimeString()}</span>
                  <span className="text-gray-600">{incident.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
