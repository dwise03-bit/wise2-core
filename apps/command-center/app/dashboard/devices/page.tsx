'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';

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
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
      </div>
    );
  }

  const modules = [
    { title: 'Overview', desc: 'View all connected devices and their status', status: 'Available', badgeClass: 'wise-badge-success' },
    { title: 'WISE OS (Raspberry Pi)', desc: 'Manage your Pi edge node - kiosk mode, services, updates', status: devices.length > 0 ? 'Connected' : 'Not Connected', badgeClass: devices.length > 0 ? 'wise-badge-success' : 'wise-badge-danger' },
    { title: 'Services', desc: 'Monitor and control running services across devices', status: 'Available', badgeClass: 'wise-badge-success' },
    { title: 'Telemetry', desc: 'CPU, memory, disk, and network metrics', status: 'Coming Soon', badgeClass: 'wise-badge-neutral' },
    { title: 'Automations', desc: 'Device-triggered workflows and scheduled tasks', status: 'Coming Soon', badgeClass: 'wise-badge-neutral' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="wise-page-title">Devices & WISE OS</h1>
        <p className="wise-page-subtitle">Manage connected devices, edge nodes, and services</p>
      </div>

      {/* Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map(mod => (
          <div key={mod.title} className={`wise-card p-5 ${mod.status === 'Coming Soon' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-text-primary">{mod.title}</h3>
              <span className={mod.badgeClass}>{mod.status}</span>
            </div>
            <p className="text-xs text-text-muted">{mod.desc}</p>
          </div>
        ))}
      </div>

      {/* Connected Devices */}
      {devices.length > 0 ? (
        <div>
          <h2 className="wise-section-title mb-3">Connected Devices</h2>
          <div className="wise-card overflow-hidden divide-y divide-border-subtle">
            {devices.map(device => (
              <div key={device.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div>
                  <h3 className="text-sm font-medium text-text-primary">{device.name}</h3>
                  <p className="text-xs text-text-muted">{device.os || device.type}{device.ip ? ` - ${device.ip}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`wise-status-dot ${device.status === 'online' ? 'bg-green-400' : device.status === 'offline' ? 'bg-danger' : 'bg-text-muted'}`} />
                  <span className="text-xs text-text-muted capitalize">{device.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#128225;</div>
          <h3 className="wise-empty-title">No Devices Connected</h3>
          <p className="wise-empty-desc">Connect a Raspberry Pi or other device to get started with WISE OS edge computing.</p>
        </div>
      )}
    </div>
  );
}
