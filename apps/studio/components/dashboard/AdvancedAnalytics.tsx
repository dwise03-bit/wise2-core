'use client';

import React from 'react';

export function AdvancedAnalytics() {
  const monthlyData = [
    { month: 'Jan', revenue: 18000, expenses: 12000, growth: 8 },
    { month: 'Feb', revenue: 22000, expenses: 13000, growth: 12 },
    { month: 'Mar', revenue: 24500, expenses: 14000, growth: 18 },
    { month: 'Apr', revenue: 28000, expenses: 15000, growth: 22 },
    { month: 'May', revenue: 31500, expenses: 16000, growth: 28 },
    { month: 'Jun', revenue: 35800, expenses: 17000, growth: 35 },
  ];

  const getMaxValue = () => Math.max(...monthlyData.map((d) => d.revenue));
  const maxValue = getMaxValue();

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <h3 className="text-sm font-bold text-white mb-6">ADVANCED ANALYTICS</h3>

      <div className="space-y-6">
        {/* Revenue vs Expenses Chart */}
        <div>
          <h4 className="text-xs text-gray-500 mb-4">REVENUE TRENDS</h4>
          <div className="space-y-2">
            {monthlyData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">{item.month}</span>
                  <span className="text-emerald-400">${(item.revenue / 1000).toFixed(1)}K</span>
                </div>
                <div className="flex gap-1 h-6 bg-[#050505] rounded overflow-hidden">
                  <div
                    className="bg-emerald-500"
                    style={{ width: `${(item.revenue / maxValue) * 100}%` }}
                  />
                  <div
                    className="bg-amber-500"
                    style={{ width: `${(item.expenses / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Metrics */}
        <div className="border-t border-[#161616] pt-4">
          <h4 className="text-xs text-gray-500 mb-3">GROWTH RATE (%)</h4>
          <div className="grid grid-cols-6 gap-2">
            {monthlyData.map((item, i) => (
              <div
                key={i}
                className="bg-[#050505] rounded p-2 text-center hover:bg-emerald-500/10 transition"
              >
                <p className="text-xs text-gray-500 mb-1">{item.month}</p>
                <p className="text-lg font-bold text-emerald-400">{item.growth}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="border-t border-[#161616] pt-4 grid grid-cols-2 gap-3">
          <div className="bg-[#050505] rounded p-3">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-lg font-bold text-white">$160K</p>
          </div>
          <div className="bg-[#050505] rounded p-3">
            <p className="text-xs text-gray-500">Avg Growth</p>
            <p className="text-lg font-bold text-emerald-400">20.5%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
