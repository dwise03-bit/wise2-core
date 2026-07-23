'use client';

import React from 'react';

export function APIMonitoring() {
  const endpoints = [
    { name: '/api/health', uptime: 99.99, latency: 5, requests: 2.4 },
    { name: '/api/metrics', uptime: 99.95, latency: 12, requests: 1.8 },
    { name: '/api/data', uptime: 99.89, latency: 18, requests: 5.2 },
    { name: '/api/deploy', uptime: 99.98, latency: 8, requests: 0.4 },
  ];

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <h3 className="text-sm font-bold text-white mb-4">API MONITORING</h3>
      <div className="space-y-3">
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-[#050505] rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-gray-400">{ep.name}</span>
              <span className="text-xs text-emerald-400">{ep.uptime}% uptime</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Latency</p>
                <p className="font-semibold text-white">{ep.latency}ms</p>
              </div>
              <div>
                <p className="text-gray-500">Req/sec</p>
                <p className="font-semibold text-white">{ep.requests}K</p>
              </div>
            </div>
            <div className="mt-2 h-1 bg-[#161616] rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                style={{ width: `${ep.uptime}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
