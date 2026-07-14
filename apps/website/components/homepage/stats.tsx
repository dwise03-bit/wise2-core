'use client';

import React from 'react';

export function StatsSection() {
  const stats = [
    { label: '99.99%', value: 'UPTIME' },
    { label: '10M+', value: 'AI TASKS COMPLETED' },
    { label: '500+', value: 'AUTOMATIONS' },
    { label: '24/7', value: 'AI WORKFORCE' },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black via-cyan-950/20 to-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {stat.label}
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-gray-400">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
