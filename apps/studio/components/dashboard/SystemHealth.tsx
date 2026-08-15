'use client';

import React from 'react';

export function SystemHealth({ systemData }: any) {
  const healthMetrics = [
    { label: 'CPU', value: 32, unit: '%', status: 'healthy' },
    { label: 'RAM', value: 62, unit: '%', status: 'healthy' },
    { label: 'Temperature', value: 51, unit: '°C', status: 'healthy' },
    { label: 'Storage', value: 67, unit: '%', status: 'warning' },
  ];

  const getBarColor = (status: string, value: number) => {
    if (status === 'offline') return 'bg-red-500';
    if (status === 'warning' || value > 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <h3 className="text-sm font-bold text-white mb-4">SYSTEM HEALTH</h3>
      <div className="space-y-4">
        {healthMetrics.map((metric, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{metric.label}</span>
              <span className="text-sm font-semibold text-white">
                {metric.value}{metric.unit}
              </span>
            </div>
            <div className="w-full h-2 bg-[#050505] rounded-full overflow-hidden">
              <div
                className={`h-full ${getBarColor(metric.status, metric.value)} transition-all`}
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#161616] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Docker Containers</span>
          <span className="text-emerald-400 font-semibold">12/12 Running</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">API Uptime</span>
          <span className="text-emerald-400 font-semibold">99.99%</span>
        </div>
      </div>
    </div>
  );
}
