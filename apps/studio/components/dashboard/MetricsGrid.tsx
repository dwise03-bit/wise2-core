'use client';

import React from 'react';

export function MetricsGrid({ metrics }: any) {
  const metricCards = [
    { label: 'Revenue', value: '$24,583', change: '+12.5%', icon: '💰', trend: 'up' },
    { label: 'Customers', value: '1,240', change: '+8.3%', icon: '👥', trend: 'up' },
    { label: 'Pipeline', value: '$685K', change: '+24.1%', icon: '📈', trend: 'up' },
    { label: 'AI Tokens', value: '2.4M', change: '+18.9%', icon: '🤖', trend: 'up' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((card, i) => (
        <div
          key={i}
          className="bg-[#101010] border border-[#161616] rounded-lg p-4 hover:border-emerald-500/30 transition group cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{card.icon}</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
              {card.change}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-1">{card.label}</p>
          <p className="text-2xl font-black text-white">{card.value}</p>
          <div className="mt-3 h-6 bg-[#050505] rounded flex items-end gap-0.5 overflow-hidden">
            {[...Array(12)].map((_, j) => (
              <div
                key={j}
                className="flex-1 bg-emerald-500/30 hover:bg-emerald-500 transition"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
