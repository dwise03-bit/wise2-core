'use client';

import React, { useEffect, useState } from 'react';

type ServiceStatus = 'online' | 'warning' | 'offline';

interface Service {
  name: string;
  status: ServiceStatus;
  latency?: number;
  lastUpdate?: Date;
}

export function SystemStatusBar({ systemData }: any) {
  const [services, setServices] = useState<Service[]>([
    { name: 'Claude', status: 'online', latency: 45 },
    { name: 'Docker', status: 'online', latency: 12 },
    { name: 'Redis', status: 'online', latency: 8 },
    { name: 'PostgreSQL', status: 'online', latency: 22 },
    { name: 'GitHub', status: 'online', latency: 67 },
    { name: 'Discord', status: 'online', latency: 89 },
    { name: 'API', status: 'online', latency: 5 },
    { name: 'Node', status: 'online', latency: 3 },
  ]);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'warning':
        return 'bg-amber-500';
      case 'offline':
        return 'bg-red-500';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#050505] border-b border-emerald-500/20 backdrop-blur-sm">
      <div className="px-6 py-2 flex items-center gap-4 overflow-x-auto scrollbar-hide">
        <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">SYSTEM STATUS</span>
        <div className="flex gap-3 items-center">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center gap-2 px-3 py-1 rounded bg-[#101010] border border-[#161616] hover:border-emerald-500/30 transition group"
            >
              <div className={`w-2 h-2 rounded-full ${getStatusColor(service.status)} animate-pulse`} />
              <span className="text-xs text-gray-400 group-hover:text-white transition whitespace-nowrap">
                {service.name}
              </span>
              {service.latency && (
                <span className="text-xs text-gray-600 group-hover:text-gray-500">
                  {service.latency}ms
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
