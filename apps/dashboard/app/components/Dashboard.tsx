'use client';

import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { ActivityFeed } from './ActivityFeed';
import { SystemMonitor } from './SystemMonitor';
import { AIAssistant } from './AIAssistant';
import { CommandPalette } from './CommandPalette';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    revenue: { value: 5600000, trend: 12 },
    customers: { value: 8, trend: 15 },
    pipeline: { value: 1240000, trend: 8 },
    mrr: { value: 468333, trend: 10 },
    uptime: { value: 99.98, trend: 0 },
    aiUsage: { value: 847293, trend: 22 },
  });

  const [systemHealth, setSystemHealth] = useState({
    cpu: 18,
    ram: 42,
    disk: 67,
    temperature: 58,
    services: 6,
  });

  const [activities, setActivities] = useState<any[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showCommandPalette]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        revenue: {
          value: prev.revenue.value + Math.random() * 10000,
          trend: prev.revenue.trend + (Math.random() - 0.5),
        },
        aiUsage: {
          value: prev.aiUsage.value + Math.random() * 1000,
          trend: prev.aiUsage.trend + (Math.random() - 0.3),
        },
      }));

      setSystemHealth(prev => ({
        ...prev,
        cpu: Math.max(5, Math.min(100, prev.cpu + (Math.random() - 0.5) * 5)),
        ram: Math.max(20, Math.min(80, prev.ram + (Math.random() - 0.5) * 2)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#050505] to-[#1a1a2e]">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#1a1a2e] border-b border-[#2cd588] px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#2cd588] drop-shadow-lg">
                🎬 WISE² Command Center
              </h1>
              <p className="text-gray-400 text-sm mt-1">Enterprise AI Operating System</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-[#2cd588] rounded-lg text-xs font-mono">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-[#2cd588] rounded-lg text-xs font-mono">
                🤖 AI Active
              </div>
              <button
                onClick={() => setShowCommandPalette(true)}
                className="px-4 py-2 bg-[#2cd588]/10 border border-[#2cd588] rounded-lg text-xs font-mono hover:bg-[#2cd588]/20"
              >
                Cmd+K
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                title="Annual Revenue"
                value={`$${(metrics.revenue.value / 1000000).toFixed(1)}M`}
                trend={metrics.revenue.trend}
                icon="💰"
              />
              <MetricCard
                title="Active Customers"
                value={metrics.customers.value.toString()}
                trend={metrics.customers.trend}
                icon="👥"
              />
              <MetricCard
                title="Sales Pipeline"
                value={`$${(metrics.pipeline.value / 1000000).toFixed(1)}M`}
                trend={metrics.pipeline.trend}
                icon="📈"
              />
              <MetricCard
                title="Monthly Recurring Revenue"
                value={`$${(metrics.mrr.value / 1000).toFixed(0)}K`}
                trend={metrics.mrr.trend}
                icon="🔄"
              />
              <MetricCard
                title="System Uptime"
                value={`${metrics.uptime.value}%`}
                trend={0}
                icon="✅"
              />
              <MetricCard
                title="AI Tokens Used"
                value={`${(metrics.aiUsage.value / 1000).toFixed(0)}K`}
                trend={metrics.aiUsage.trend}
                icon="🧠"
              />
            </div>

            {/* System Health & Activity */}
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2">
                <ActivityFeed />
              </div>
              <div>
                <SystemMonitor health={systemHealth} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <AIAssistant />

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette onClose={() => setShowCommandPalette(false)} />
      )}
    </div>
  );
}
