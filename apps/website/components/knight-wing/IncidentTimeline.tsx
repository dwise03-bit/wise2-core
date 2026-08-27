'use client';

import { Incident } from '@/hooks/useWiseDefenseApi';
import { Clock, AlertTriangle } from 'lucide-react';

interface IncidentTimelineProps {
  incidents: Incident[];
  loading?: boolean;
}

const threatColorMap = {
  LOW: 'bg-blue-600/20 border-blue-600/50 text-blue-300',
  ELEVATED: 'bg-yellow-600/20 border-yellow-600/50 text-yellow-300',
  HIGH: 'bg-orange-600/20 border-orange-600/50 text-orange-300',
  CRITICAL: 'bg-red-600/20 border-red-600/50 text-red-300',
};

export function IncidentTimeline({ incidents, loading }: IncidentTimelineProps) {
  const recentIncidents = incidents.slice(0, 20);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="border border-red-600/30 rounded-lg p-6 bg-black/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-black tracking-wider text-red-600 uppercase">
            Incident Timeline
          </h3>
        </div>
        <span className="text-xs text-gray-400">Recent Activity</span>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Loading timeline...</p>
        </div>
      )}

      {!loading && recentIncidents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto opacity-20 mb-4" />
          <p className="text-sm">No incidents logged</p>
        </div>
      )}

      {!loading && recentIncidents.length > 0 && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {recentIncidents.map((incident, idx) => {
            const threatColor = threatColorMap[incident.threatLevel];

            return (
              <div
                key={incident.id}
                className="relative flex gap-4"
              >
                {/* Timeline line */}
                {idx < recentIncidents.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gradient-to-b from-red-600/50 to-transparent" />
                )}

                {/* Dot */}
                <div className="relative flex flex-col items-center pt-1 flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${threatColor} border border-current`} />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {incident.headline}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {incident.approximateLocation || 'Unknown Location'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`text-xs font-black tracking-wider px-2 py-1 rounded border ${
                          incident.threatLevel === 'CRITICAL'
                            ? 'bg-red-600/20 border-red-600/50 text-red-300'
                            : incident.threatLevel === 'HIGH'
                            ? 'bg-orange-600/20 border-orange-600/50 text-orange-300'
                            : incident.threatLevel === 'ELEVATED'
                            ? 'bg-yellow-600/20 border-yellow-600/50 text-yellow-300'
                            : 'bg-blue-600/20 border-blue-600/50 text-blue-300'
                        }`}
                      >
                        {incident.threatLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{incident.category}</span>
                    <span>•</span>
                    <span>{incident.incidentType}</span>
                    <span>•</span>
                    <span className="font-mono">{incident.verificationStatus}</span>
                  </div>

                  {/* Confidence bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-red-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${incident.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                      {incident.confidence}%
                    </span>
                  </div>

                  {/* Time */}
                  <p className="text-xs text-gray-600 mt-2 font-mono">
                    {formatTime(incident.receivedTimestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-red-600/20">
        <p className="text-xs text-gray-500 text-center">
          {incidents.length} total incidents • Updates every 10 seconds
        </p>
      </div>
    </div>
  );
}
