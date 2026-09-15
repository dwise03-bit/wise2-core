'use client';

import React, { useEffect, useState } from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';

interface CommandCenterHeaderProps {
  onMenuToggle: () => void;
}

interface MetricItem {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

const metrics: MetricItem[] = [
  { label: 'Active Sessions', value: '2,847', change: '+12% today', positive: true },
  { label: 'System Load', value: '42%', change: '-8% last hour', positive: true },
  { label: 'API Health', value: '99.8%', change: '+0.2% this week', positive: true },
  { label: 'Data Synced', value: '847.3 GB', change: '+24 GB/hr', positive: true },
];

export function CommandCenterHeader({ onMenuToggle }: CommandCenterHeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-medium border-b border-cyan-500/10 sticky top-0 z-20">
      <div className="px-8 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white">WISE² Command Center</h2>
              <p className="text-sm text-gray-400">Real-time operations dashboard</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            {/* Time display */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg glass-light">
              <span className="text-sm text-gray-400">System Time:</span>
              <span className="font-mono text-sm text-cyan-400 font-semibold">{time || '--:--:--'}</span>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg glass-light hover-scale">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Quick search..."
                className="bg-transparent text-sm outline-none w-40 placeholder-gray-500"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <Bell size={20} className="text-gray-400 group-hover:text-white transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {/* User menu */}
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors hidden sm:inline">
                Daniel
              </span>
            </button>
          </div>
        </div>

        {/* Metrics row with animated counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="glass-light p-4 rounded-lg hover-scale group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {metric.label}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    metric.positive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {metric.value}
              </div>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
                  style={{ width: `${Math.random() * 30 + 60}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
