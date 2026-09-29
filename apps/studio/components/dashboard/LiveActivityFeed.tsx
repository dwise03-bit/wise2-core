'use client';

import React from 'react';

export function LiveActivityFeed({ activities }: any) {
  const defaultActivities = [
    { type: 'deployment', title: 'Deployed Phase 2', timestamp: '2 min ago', icon: '🚀' },
    { type: 'customer', title: 'New customer signup', timestamp: '5 min ago', icon: '✨' },
    { type: 'alert', title: 'High memory usage', timestamp: '12 min ago', icon: '⚠️' },
    { type: 'success', title: 'Backup completed', timestamp: '1 hour ago', icon: '✓' },
  ];

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <h3 className="text-sm font-bold text-white mb-4">LIVE ACTIVITY</h3>
      <div className="space-y-3">
        {defaultActivities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3 pb-3 border-b border-[#161616] last:border-0">
            <span className="text-lg">{activity.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-white">{activity.title}</p>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
