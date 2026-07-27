'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

interface DeviceInfo {
  id: string;
  name: string;
  type: 'raspberry-pi' | 'server' | 'desktop' | 'mobile';
  status: 'online' | 'offline' | 'unknown';
  lastSeen?: string;
  os?: string;
  ip?: string;
  services?: { name: string; status: 'running' | 'stopped' | 'error' }[];
}

export default function DevicesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchDevices();
  }, [user?.id]);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/v1/devices', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch {
      // API not available
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    online: 'bg-green-400',
    offline: 'bg-red-400',
    unknown: 'bg-gray-400',
  };

  const typeIcons: Record<string, string> = {
    'raspberry-pi': '🥧',
    server: '🖥️',
    desktop: '💻',
    mobile: '📱',
  };

  const modules = [
    { icon: '📡', title: 'Overview', description: 'View all connected devices and their status', status: 'AVAILABLE' },
    { icon: '🥧', title: 'WISE OS (Raspberry Pi)', description: 'Manage your Pi edge node — kiosk mode, services, updates', status: devices.length > 0 ? 'CONNECTED' : 'NOT CONNECTED' },
    { icon: '🖥️', title: 'Services', description: 'Monitor and control running services across devices', status: 'AVAILABLE' },
    { icon: '📊', title: 'Telemetry', description: 'CPU, memory, disk, and network metrics', status: 'COMING SOON' },
    { icon: '⚡', title: 'Automations', description: 'Device-triggered workflows and scheduled tasks', status: 'COMING SOON' },
  ];

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4"></div>
          <div className="h-4 bg-wise-surface rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Devices & WISE OS</h1>
        <p className="text-text-secondary">
          Manage connected devices, edge nodes, and services
        </p>
      </div>

      {/* Device Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const isAvailable = mod.status === 'AVAILABLE' || mod.status === 'CONNECTED';
          const statusColor =
            mod.status === 'AVAILABLE' || mod.status === 'CONNECTED'
              ? 'bg-green-500/10 text-green-400'
              : mod.status === 'NOT CONNECTED'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-gray-500/10 text-gray-400';

          return (
            <div
              key={mod.title}
              className={`bg-wise-surface border border-wise-border rounded-lg p-6 transition-all ${
                isAvailable ? 'hover:border-wise-electric/50 cursor-pointer' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{mod.icon}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>
                  {mod.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{mod.title}</h3>
              <p className="text-sm text-text-muted">{mod.description}</p>
            </div>
          );
        })}
      </div>

      {/* Connected Devices */}
      {devices.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-text-primary">Connected Devices</h2>
          <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
            <div className="divide-y divide-wise-border">
              {devices.map((device) => (
                <div key={device.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{typeIcons[device.type] || '🖥️'}</span>
                    <div>
                      <h3 className="font-semibold text-text-primary">{device.name}</h3>
                      <p className="text-sm text-text-muted">
                        {device.os || device.type} {device.ip ? `— ${device.ip}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${statusColors[device.status]}`} />
                    <span className="text-xs text-text-muted capitalize">{device.status}</span>
                    {device.lastSeen && (
                      <span className="text-xs text-text-muted">
                        Last seen: {new Date(device.lastSeen).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-6xl block mb-4 opacity-30">📡</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Devices Connected</h3>
          <p className="text-text-muted mb-6">
            Connect a Raspberry Pi or other device to get started with WISE OS edge computing.
          </p>
        </div>
      )}
    </div>
  );
}
