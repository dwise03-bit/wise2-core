'use client';

import React, { useState } from 'react';

interface Integration {
  name: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
}

export function APIIntegrations() {
  const [integrations] = useState<Integration[]>([
    { name: 'Stripe', icon: '💳', status: 'connected', lastSync: new Date() },
    { name: 'GitHub', icon: '🐙', status: 'connected', lastSync: new Date() },
    { name: 'Discord', icon: '💬', status: 'connected', lastSync: new Date() },
  ]);

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'text-emerald-400 bg-emerald-500/10';
      case 'disconnected': return 'text-gray-400 bg-gray-500/10';
      case 'error': return 'text-red-400 bg-red-500/10';
    }
  };

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <h3 className="text-sm font-bold text-white mb-4">API INTEGRATIONS</h3>
      <div className="space-y-3">
        {integrations.map((int, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#050505] rounded">
            <div className="flex items-center gap-3">
              <span className="text-lg">{int.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white">{int.name}</p>
                <p className="text-xs text-gray-600">
                  {int.lastSync ? `Last synced ${Math.floor((Date.now() - int.lastSync.getTime()) / 60000)}m ago` : 'Never'}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(int.status)}`}>
              {int.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
