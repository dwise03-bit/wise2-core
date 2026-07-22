'use client';

import { useEffect, useState } from 'react';

const mockActivities = [
  { id: 1, type: 'customer', title: 'New customer: Acme Corp', time: '2 min ago', icon: '👥' },
  { id: 2, type: 'invoice', title: 'Invoice #2024-001 paid', time: '15 min ago', icon: '💳' },
  { id: 3, type: 'ai', title: 'AI Agent completed analysis', time: '32 min ago', icon: '🧠' },
  { id: 4, type: 'deployment', title: 'Dashboard v1.2.0 deployed', time: '1 hour ago', icon: '🚀' },
  { id: 5, type: 'project', title: 'Project "Website Redesign" 75% complete', time: '2 hours ago', icon: '🎯' },
  { id: 6, type: 'support', title: '3 support tickets resolved', time: '3 hours ago', icon: '✅' },
];

export function ActivityFeed() {
  const [activities, setActivities] = useState(mockActivities);

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Math.random(),
        type: ['customer', 'invoice', 'ai', 'deployment'][Math.floor(Math.random() * 4)],
        title: [
          'New lead generated',
          'Payment received',
          'AI analysis complete',
          'Service deployed',
        ][Math.floor(Math.random() * 4)],
        time: 'now',
        icon: ['👥', '💳', '🧠', '🚀'][Math.floor(Math.random() * 4)],
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 5)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6">
      <h2 className="text-xl font-bold text-[#2cd588] mb-4 flex items-center gap-2">
        <span>📊</span> Live Activity
      </h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 p-3 bg-[#050505] rounded-lg border border-[#2cd588]/20 hover:border-[#2cd588]/50 transition-colors"
          >
            <span className="text-2xl">{activity.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm truncate">{activity.title}</p>
              <p className="text-gray-500 text-xs">{activity.time}</p>
            </div>
            <div className="w-2 h-2 bg-[#2cd588] rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
