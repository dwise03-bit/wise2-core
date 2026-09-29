'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge } from '../../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

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
    if (!user?.id) { setLoading(false); return; }
    fetchDevices();
  }, [user?.id]);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      if (!token) { setLoading(false); return; }
      const res = await fetch(`${API_URL}/v1/devices`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setDevices(data.devices || []); }
    } catch { /* API not available */ }
    finally { setLoading(false); }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-36 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
      </div>
    );
  }

  const modules: Array<{ title: string; desc: string; status: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = [
    { title: 'Overview', desc: 'View all connected devices and their status', status: 'Available', variant: 'success' },
    { title: 'WISE OS (Raspberry Pi)', desc: 'Manage your Pi edge node - kiosk mode, services, updates', status: devices.length > 0 ? 'Connected' : 'Not Connected', variant: devices.length > 0 ? 'success' : 'danger' },
    { title: 'Services', desc: 'Monitor and control running services across devices', status: 'Available', variant: 'success' },
    { title: 'Telemetry', desc: 'CPU, memory, disk, and network metrics', status: 'Coming Soon', variant: 'neutral' },
    { title: 'Automations', desc: 'Device-triggered workflows and scheduled tasks', status: 'Coming Soon', variant: 'neutral' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">💾 Devices & WISE OS</h1>
        <p className="text-sm text-text-muted mt-1">Manage connected devices, edge nodes, and services</p>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(mod => (
          <Card key={mod.title} className={`p-5 space-y-3 ${mod.status === 'Coming Soon' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-text-primary">{mod.title}</h3>
              <Badge variant={mod.variant}>{mod.status}</Badge>
            </div>
            <p className="text-xs text-text-muted">{mod.desc}</p>
          </Card>
        ))}
      </div>

      {/* Connected Devices */}
      {devices.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-text-primary">Connected Devices</h2>
          <Card className="overflow-hidden divide-y divide-border-subtle">
            {devices.map(device => (
              <div key={device.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-text-primary">{device.name}</h3>
                  <p className="text-xs text-text-muted">{device.os || device.type}{device.ip ? ` - ${device.ip}` : ''}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'bg-success' : device.status === 'offline' ? 'bg-danger' : 'bg-text-muted'}`} />
                  <span className="text-xs text-text-muted capitalize">{device.status}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ) : (
        <Card className="p-16 text-center space-y-3">
          <div className="text-4xl opacity-20">💾</div>
          <h3 className="text-base font-semibold text-text-secondary">No Devices Connected</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">Connect a Raspberry Pi or other device to get started with WISE OS edge computing.</p>
        </Card>
      )}
    </div>
  );
}
