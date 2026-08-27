'use client';

import { SDRSignal } from '@/hooks/useWiseDefenseApi';
import { Radio, TrendingUp } from 'lucide-react';

interface SDRMonitoringPanelProps {
  signals: SDRSignal[];
  loading?: boolean;
}

// Common frequency assignments
const frequencyAssignments: Record<number, string> = {
  162550: 'NOAA Weather',
  462550: 'Police Dispatch',
  467550: 'Fire/EMS',
  464000: 'Railway',
  121500: 'Aviation',
  88000: 'FM Radio',
};

function formatFrequency(freq: number): string {
  if (freq >= 1000000) {
    return `${(freq / 1000000).toFixed(3)} GHz`;
  } else if (freq >= 1000) {
    return `${(freq / 1000).toFixed(3)} MHz`;
  }
  return `${freq} Hz`;
}

function getPowerLevel(power: number): string {
  if (power > -50) return 'STRONG';
  if (power > -80) return 'GOOD';
  if (power > -100) return 'WEAK';
  return 'VERY WEAK';
}

function getPowerColor(power: number): string {
  if (power > -50) return 'text-green-400';
  if (power > -80) return 'text-blue-400';
  if (power > -100) return 'text-yellow-400';
  return 'text-red-400';
}

export function SDRMonitoringPanel({ signals, loading }: SDRMonitoringPanelProps) {
  const topSignals = signals.slice(0, 10);

  // Group signals by frequency
  const signalsByFreq = new Map<number, SDRSignal>();
  for (const signal of signals) {
    const existing = signalsByFreq.get(signal.frequency);
    if (!existing || signal.power > existing.power) {
      signalsByFreq.set(signal.frequency, signal);
    }
  }

  const uniqueSignals = Array.from(signalsByFreq.values())
    .sort((a, b) => b.power - a.power)
    .slice(0, 10);

  return (
    <div className="border border-red-600/30 rounded-lg p-6 bg-black/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-black tracking-wider text-red-600 uppercase">
            SDR Monitoring
          </h3>
        </div>
        <div className="text-xs text-gray-400 font-mono">
          Range: 88M-1200M Hz
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Loading spectrum data...</p>
        </div>
      )}

      {!loading && uniqueSignals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No signals detected</p>
        </div>
      )}

      <div className="space-y-2">
        {uniqueSignals.map((signal, idx) => {
          const assignment = frequencyAssignments[signal.frequency] || 'Unknown';
          const powerLevel = getPowerLevel(signal.power);
          const powerColor = getPowerColor(signal.power);

          return (
            <div
              key={signal.id}
              className="border border-red-600/20 rounded p-3 hover:bg-red-600/5 transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="font-mono text-sm font-bold text-gray-200">
                    {formatFrequency(signal.frequency)}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {assignment}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-black tracking-wider ${powerColor}`}>
                    {powerLevel}
                  </div>
                  <div className="font-mono text-xs text-gray-500 mt-0.5">
                    {signal.power} dBm
                  </div>
                </div>
              </div>

              {/* Power bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      signal.power > -50 ? 'bg-green-600' :
                      signal.power > -80 ? 'bg-blue-600' :
                      signal.power > -100 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (signal.power + 120) * 0.833))}%`,
                    }}
                  />
                </div>
                {signal.modulation && (
                  <span className="text-xs text-gray-500 font-mono flex-shrink-0">
                    {signal.modulation}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-600 mt-2 font-mono">
                Detected: {new Date(signal.detectedAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-red-600/20 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-black text-red-600">
            {uniqueSignals.length}
          </p>
          <p className="text-xs text-gray-500 font-mono mt-1">ACTIVE FREQ</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-red-600">
            {signals.length}
          </p>
          <p className="text-xs text-gray-500 font-mono mt-1">TOTAL SIGNALS</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-red-600">
            {uniqueSignals.length > 0 ? formatFrequency(uniqueSignals[0].frequency) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 font-mono mt-1">PRIMARY</p>
        </div>
      </div>
    </div>
  );
}
