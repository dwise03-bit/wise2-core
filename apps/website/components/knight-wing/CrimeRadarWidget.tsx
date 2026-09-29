'use client';

import { Incident } from '@/hooks/useWiseDefenseApi';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface CrimeRadarWidgetProps {
  incidents: Incident[];
  loading?: boolean;
}

const threatIcons = {
  LOW: Info,
  ELEVATED: AlertCircle,
  HIGH: AlertTriangle,
  CRITICAL: AlertTriangle,
};

const threatColors = {
  LOW: 'border-blue-600 bg-blue-600/10',
  ELEVATED: 'border-yellow-600 bg-yellow-600/10',
  HIGH: 'border-orange-600 bg-orange-600/10',
  CRITICAL: 'border-red-600 bg-red-600/10',
};

const threatTextColors = {
  LOW: 'text-blue-400',
  ELEVATED: 'text-yellow-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

export function CrimeRadarWidget({ incidents, loading }: CrimeRadarWidgetProps) {
  const topIncidents = incidents.slice(0, 5);

  return (
    <div className="border border-red-600/30 rounded-lg p-6 bg-black/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black tracking-wider text-red-600 uppercase">
          CRIME RADAR
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400 font-mono">LIVE</span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Loading incidents...</p>
        </div>
      )}

      {!loading && topIncidents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No active incidents in watch zones</p>
        </div>
      )}

      <div className="space-y-3">
        {topIncidents.map((incident) => {
          const ThreatIcon = threatIcons[incident.threatLevel];
          const borderClass = threatColors[incident.threatLevel];
          const textClass = threatTextColors[incident.threatLevel];

          return (
            <div
              key={incident.id}
              className={`border rounded-lg p-4 transition-all hover:bg-white/5 ${borderClass}`}
            >
              <div className="flex items-start gap-3">
                <ThreatIcon className={`w-5 h-5 ${textClass} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm leading-tight">
                      {incident.headline}
                    </h4>
                    <span className={`text-xs font-black tracking-wider flex-shrink-0 ${textClass}`}>
                      {incident.threatLevel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {incident.approximateLocation || 'Unknown Location'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {incident.category} • {incident.incidentType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-gray-700 rounded-full h-2 flex-1">
                      <div
                        className="bg-red-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${incident.confidence}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {incident.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-red-600/20">
        <p className="text-xs text-gray-500 text-center">
          {incidents.length} total incidents • Auto-update every 10 seconds
        </p>
      </div>
    </div>
  );
}
