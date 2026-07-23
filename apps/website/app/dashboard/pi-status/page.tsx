'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, Footer } from '@/components/wise';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  networkBytesIn: number;
  networkBytesOut: number;
  uptime: number;
}

interface Service {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  port?: number;
  restarts: number;
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'info' | 'warn';
  service: string;
  message: string;
}

interface Backup {
  timestamp: string;
  size: number;
  status: 'success' | 'failed';
  path: string;
}

interface Update {
  name: string;
  currentVersion: string;
  availableVersion: string;
  type: 'docker' | 'system';
  critical: boolean;
}

interface Alert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  service?: string;
  resolved: boolean;
}

interface Deployment {
  id: string;
  timestamp: string;
  version: string;
  status: 'success' | 'failed' | 'in-progress';
  duration: number;
  changedFiles: number;
}

interface PiStatus {
  model: string;
  osVersion: string;
  architecture: string;
  hostname: string;
  timestamp: string;
  metrics: SystemMetrics;
  services: Service[];
  logs: LogEntry[];
  lastBackup: Backup | null;
  nextBackupScheduled: string;
  updates: Update[];
  alerts: Alert[];
  deployments: Deployment[];
}

const statusColors = {
  running: 'text-emerald-400',
  stopped: 'text-red-400',
  error: 'text-yellow-400',
  success: 'text-emerald-400',
  failed: 'text-red-400',
  'in-progress': 'text-blue-400',
  critical: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

const statusBgColors = {
  running: 'bg-emerald-500/20',
  stopped: 'bg-red-500/20',
  error: 'bg-yellow-500/20',
  success: 'bg-emerald-500/20',
  failed: 'bg-red-500/20',
  'in-progress': 'bg-blue-500/20',
  critical: 'bg-red-500/20',
  warning: 'bg-yellow-500/20',
  info: 'bg-blue-500/20',
};

function Gauge({ value, label, unit = '%' }: { value: number; label: string; unit?: string }) {
  const getColor = (val: number) => {
    if (val < 50) return 'emerald';
    if (val < 75) return 'yellow';
    return 'red';
  };

  const color = getColor(value);
  const colorClass = {
    emerald: 'from-emerald-500 to-emerald-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  }[color];

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="4"
              strokeDasharray={`${(value / 100) * 282.7} 282.7`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.3s ease' }}
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color === 'emerald' ? '#10b981' : color === 'yellow' ? '#eab308' : '#ef4444'} />
                <stop offset="100%" stopColor={color === 'emerald' ? '#059669' : color === 'yellow' ? '#ca8a04' : '#dc2626'} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs text-gray-400">{unit}</div>
            </div>
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-300">{label}</div>
      </div>
    </div>
  );
}

function ProgressBar({ value, label, unit = '%' }: { value: number; label: string; unit?: string }) {
  const getColor = (val: number) => {
    if (val < 50) return 'emerald';
    if (val < 75) return 'yellow';
    return 'red';
  };

  const color = getColor(value);
  const colorBg = {
    emerald: 'bg-emerald-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }[color];

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-semibold text-gray-300">{label}</div>
        <div className="text-sm font-bold">{value}{unit}</div>
      </div>
      <div className="w-full bg-[#050505] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorBg} transition-all duration-300`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function PiStatusPage() {
  const [data, setData] = useState<PiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'logs' | 'alerts' | 'deployments'>('logs');
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'info' | 'warn'>('all');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/admin/pi-status');
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Pi status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = data?.logs.filter(log => logFilter === 'all' || log.level === logFilter) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-gray-400">Loading Pi status...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navigation />
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-red-400">{error || 'Failed to load Pi status'}</div>
        </div>
        <Footer />
      </div>
    );
  }

  const overallHealthColor = data.alerts.some(a => a.severity === 'critical' && !a.resolved)
    ? 'text-red-400'
    : data.alerts.some(a => a.severity === 'warning' && !a.resolved)
    ? 'text-yellow-400'
    : 'text-emerald-400';

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navigation />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Raspberry Pi Status</h1>
                <p className="text-gray-400">{data.hostname} • {data.model} • {data.architecture}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${overallHealthColor}`}>
                  {data.alerts.some(a => a.severity === 'critical' && !a.resolved)
                    ? 'Critical'
                    : data.alerts.some(a => a.severity === 'warning' && !a.resolved)
                    ? 'Warning'
                    : 'Healthy'}
                </div>
                <div className="text-sm text-gray-400">Last updated: {formatTime(data.timestamp)}</div>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">System Metrics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Gauge value={data.metrics.cpu} label="CPU Usage" />
              <Gauge value={data.metrics.memory} label="Memory Usage" />
              <ProgressBar value={data.metrics.disk} label="Disk Space Used" />
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400 mb-2">
                    {formatUptime(data.metrics.uptime)}
                  </div>
                  <div className="text-sm font-semibold text-gray-300">System Uptime</div>
                </div>
              </div>
            </div>

            {/* Network I/O */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                <div className="text-sm font-semibold text-gray-400 mb-2">Network Input</div>
                <div className="text-2xl font-bold">{formatBytes(data.metrics.networkBytesIn)}</div>
                <div className="text-xs text-gray-500">per second</div>
              </div>
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                <div className="text-sm font-semibold text-gray-400 mb-2">Network Output</div>
                <div className="text-2xl font-bold">{formatBytes(data.metrics.networkBytesOut)}</div>
                <div className="text-xs text-gray-500">per second</div>
              </div>
            </div>
          </section>

          {/* Services Status */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Service Status</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {data.services.map((service) => (
                <div key={service.name} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      {service.port && <p className="text-xs text-gray-500">Port {service.port}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBgColors[service.status]} ${statusColors[service.status]}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="text-white">{formatUptime(service.uptime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restarts:</span>
                      <span className="text-white">{service.restarts}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Logs & Alerts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Logs & Events</h2>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
              {/* Tabs */}
              <div className="flex gap-4 border-b border-[#1a1a1a] mb-6">
                <button
                  onClick={() => setSelectedTab('logs')}
                  className={`pb-4 px-2 border-b-2 transition ${
                    selectedTab === 'logs'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Recent Logs ({filteredLogs.length})
                </button>
                <button
                  onClick={() => setSelectedTab('alerts')}
                  className={`pb-4 px-2 border-b-2 transition ${
                    selectedTab === 'alerts'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Alerts ({data.alerts.length})
                </button>
                <button
                  onClick={() => setSelectedTab('deployments')}
                  className={`pb-4 px-2 border-b-2 transition ${
                    selectedTab === 'deployments'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  Deployments ({data.deployments.length})
                </button>
              </div>

              {/* Logs Tab */}
              {selectedTab === 'logs' && (
                <div>
                  <div className="mb-4 flex gap-2">
                    {(['all', 'error', 'info', 'warn'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setLogFilter(filter)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition ${
                          logFilter === filter
                            ? 'bg-emerald-500 text-black'
                            : 'bg-[#161616] text-gray-400 hover:bg-[#1a1a1a]'
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredLogs.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No logs found</div>
                    ) : (
                      filteredLogs.map((log, idx) => (
                        <div key={idx} className="bg-[#050505] border border-[#1a1a1a] rounded p-3 text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-3 items-start">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBgColors[log.level]} ${statusColors[log.level]}`}>
                                {log.level.toUpperCase()}
                              </span>
                              <span className="text-gray-400">{log.service}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
                          </div>
                          <div className="text-gray-300">{log.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Alerts Tab */}
              {selectedTab === 'alerts' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.alerts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No alerts</div>
                  ) : (
                    data.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`border rounded-lg p-4 ${
                          alert.resolved ? 'bg-[#050505] border-[#1a1a1a]' : `${statusBgColors[alert.severity]}`
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBgColors[alert.severity]} ${statusColors[alert.severity]}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <h4 className="font-semibold">{alert.title}</h4>
                          </div>
                          {alert.resolved && (
                            <span className="text-xs text-gray-400">Resolved</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          {alert.service && <span>{alert.service}</span>}
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Deployments Tab */}
              {selectedTab === 'deployments' && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.deployments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No deployments yet</div>
                  ) : (
                    data.deployments.map((deployment) => (
                      <div key={deployment.id} className="bg-[#050505] border border-[#1a1a1a] rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusBgColors[deployment.status]} ${statusColors[deployment.status]}`}>
                                {deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                              </span>
                              <span className="font-semibold">v{deployment.version}</span>
                            </div>
                            <p className="text-sm text-gray-400">{deployment.changedFiles} files changed</p>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <div>{formatTime(deployment.timestamp)}</div>
                            <div className="text-xs">{Math.round(deployment.duration)}s</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Backups & Updates */}
          <section className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Backups */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Backups</h2>
              <div className="space-y-4">
                {data.lastBackup && (
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Last Backup</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time:</span>
                        <span>{formatTime(data.lastBackup.timestamp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span>{formatBytes(data.lastBackup.size)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={statusColors[data.lastBackup.status]}>
                          {data.lastBackup.status.charAt(0).toUpperCase() + data.lastBackup.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Next Backup</h3>
                  <div className="text-sm text-gray-400 mb-4">
                    {formatTime(data.nextBackupScheduled)}
                  </div>
                  <button className="w-full px-4 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition">
                    Backup Now
                  </button>
                </div>
              </div>
            </div>

            {/* Updates */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Updates Available</h2>
              <div className="space-y-4">
                {data.updates.length === 0 ? (
                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
                    <div className="text-center py-8">
                      <div className="text-emerald-400 text-lg font-semibold mb-2">System Up to Date</div>
                      <p className="text-sm text-gray-400">All packages and Docker images are current</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {data.updates.map((update) => (
                      <div
                        key={update.name}
                        className={`bg-[#0a0a0a] border rounded-xl p-4 ${
                          update.critical ? 'border-red-500/50' : 'border-[#1a1a1a]'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{update.name}</h4>
                              {update.critical && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                                  Critical
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{update.type}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          {update.currentVersion} → {update.availableVersion}
                        </div>
                      </div>
                    ))}
                    <button className="w-full px-4 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition">
                      Update All
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* System Info */}
          <section>
            <h2 className="text-2xl font-bold mb-6">System Information</h2>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-gray-400 mb-1">Model</div>
                  <div className="text-lg font-semibold">{data.model}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Architecture</div>
                  <div className="text-lg font-semibold">{data.architecture}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Hostname</div>
                  <div className="text-lg font-semibold">{data.hostname}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">OS Version</div>
                  <div className="text-lg font-semibold">{data.osVersion}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
