'use client';

import React from 'react';

export function BusinessIntelligence({ metrics }: any) {
  const biMetrics = [
    { label: 'MRR', value: '$125K', change: '+8.2%' },
    { label: 'ARR', value: '$1.5M', change: '+12.4%' },
    { label: 'CAC', value: '$5.2K', change: '-3.1%' },
    { label: 'LTV', value: '$28.5K', change: '+5.7%' },
  ];

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <h3 className="text-sm font-bold text-white mb-4">BUSINESS INTELLIGENCE</h3>
      <div className="space-y-3">
        {biMetrics.map((metric, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-[#050505] rounded">
            <span className="text-xs text-gray-500">{metric.label}</span>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{metric.value}</p>
              <p className={`text-xs ${metric.change.startsWith('-') ? 'text-amber-400' : 'text-emerald-400'}`}>
                {metric.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
