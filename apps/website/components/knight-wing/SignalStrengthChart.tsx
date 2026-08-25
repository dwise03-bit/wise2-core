'use client';

import { SDRSignal } from '@/hooks/useWiseDefenseApi';
import { TrendingUp, Activity } from 'lucide-react';

interface SignalStrengthChartProps {
  signals: SDRSignal[];
  loading?: boolean;
}

export function SignalStrengthChart({ signals, loading }: SignalStrengthChartProps) {
  // Group signals by hour and calculate average power
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => {
    const date = new Date(now);
    date.setHours(now.getHours() - (23 - i), 0, 0, 0);
    return date;
  });

  const dataByHour = hours.map((hour) => {
    const hourSignals = signals.filter((signal) => {
      const signalTime = new Date(signal.detectedAt);
      return signalTime.getHours() === hour.getHours();
    });

    const avgPower = hourSignals.length > 0
      ? hourSignals.reduce((sum, s) => sum + s.power, 0) / hourSignals.length
      : -120;

    return {
      hour: hour.getHours(),
      count: hourSignals.length,
      avgPower,
    };
  });

  const maxPower = Math.max(...dataByHour.map((d) => d.avgPower), -50);
  const minPower = Math.min(...dataByHour.map((d) => d.avgPower), -120);
  const powerRange = maxPower - minPower || 1;

  // Calculate stats
  const totalSignals = signals.length;
  const avgSignalPower = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.power, 0) / signals.length
    : -120;
  const maxSignalPower = Math.max(...signals.map((s) => s.power), -120);
  const uniqueFrequencies = new Set(signals.map((s) => s.frequency)).size;

  return (
    <div className="border border-red-600/30 rounded-lg p-6 bg-black/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-black tracking-wider text-red-600 uppercase">
            Signal Strength
          </h3>
        </div>
        <span className="text-xs text-gray-400">24h Average</span>
      </div>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">Loading chart data...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Chart */}
          <div className="mb-8 bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-end justify-between gap-1 h-32">
              {dataByHour.map((data, idx) => {
                const normalizedHeight = ((data.avgPower - minPower) / powerRange) * 100 || 5;
                const isPeak = data.avgPower > -80;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 group"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPeak ? 'bg-red-600' : 'bg-gray-600'
                      } hover:bg-red-500`}
                      style={{ height: `${Math.max(2, normalizedHeight)}%` }}
                      title={`${data.hour}:00 - ${data.count} signals, ${data.avgPower.toFixed(1)} dBm`}
                    />
                    <span className="text-xs text-gray-600 group-hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
                      {data.hour}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-4 font-mono">
              <span>{minPower.toFixed(0)} dBm</span>
              <span>0 hours</span>
              <span>{maxPower.toFixed(0)} dBm</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-red-600/20 rounded-lg p-4 bg-red-600/5">
              <p className="text-2xl font-black text-red-600">
                {totalSignals}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wider">
                Total Signals
              </p>
            </div>

            <div className="border border-red-600/20 rounded-lg p-4 bg-red-600/5">
              <p className="text-2xl font-black text-red-600">
                {uniqueFrequencies}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wider">
                Frequencies
              </p>
            </div>

            <div className="border border-red-600/20 rounded-lg p-4 bg-red-600/5">
              <p className="font-mono text-lg font-black text-red-600">
                {avgSignalPower.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wider">
                Avg Power
              </p>
            </div>

            <div className="border border-red-600/20 rounded-lg p-4 bg-red-600/5">
              <p className="font-mono text-lg font-black text-red-600">
                {maxSignalPower.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-2 uppercase tracking-wider">
                Peak Power
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-red-600/20 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded" />
              <span className="text-gray-400">Strong Signal (&gt; -80 dBm)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-600 rounded" />
              <span className="text-gray-400">Weak Signal (&lt; -80 dBm)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
