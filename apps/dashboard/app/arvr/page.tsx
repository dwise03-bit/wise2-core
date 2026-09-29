'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, Battery, Cpu, Zap, Wifi } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ReactNode;
  trend?: number;
}

interface Device {
  id: string;
  type: 'rayban' | 'quest';
  name: string;
  battery: number;
  latency: number;
  fps?: number;
  connected: boolean;
}

export default function ARVRDashboard() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics from Router API
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://localhost:3100/metrics');
        const text = await response.text();

        // Parse Prometheus metrics
        const routerLatency = extractMetric(text, 'router_request_duration_ms', 0.95);
        const budget = extractMetric(text, 'budget_used_pct');
        const errors = extractMetric(text, 'router_errors_total');
        const raybanDevices = extractMetric(text, 'rayban_connected_devices');
        const questDevices = extractMetric(text, 'quest_connected_devices');

        setMetrics([
          {
            title: 'Router Latency P95',
            value: Math.round(routerLatency),
            unit: 'ms',
            status: routerLatency > 2500 ? 'critical' : routerLatency > 1000 ? 'warning' : 'healthy',
            icon: <Zap className="w-5 h-5" />,
            trend: -2,
          },
          {
            title: 'Daily Budget Used',
            value: Math.round(budget),
            unit: '%',
            status: budget > 100 ? 'critical' : budget > 75 ? 'warning' : 'healthy',
            icon: <Cpu className="w-5 h-5" />,
          },
          {
            title: 'Error Rate (5m)',
            value: (errors * 100).toFixed(2),
            unit: '%',
            status: errors > 0.001 ? 'critical' : errors > 0.0001 ? 'warning' : 'healthy',
            icon: <AlertCircle className="w-5 h-5" />,
          },
          {
            title: 'Ray-Ban Devices',
            value: Math.round(raybanDevices),
            unit: 'connected',
            status: raybanDevices > 0 ? 'healthy' : 'warning',
            icon: <Wifi className="w-5 h-5" />,
          },
          {
            title: 'Quest Devices',
            value: Math.round(questDevices),
            unit: 'connected',
            status: questDevices > 0 ? 'healthy' : 'warning',
            icon: <Activity className="w-5 h-5" />,
          },
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5s
    return () => clearInterval(interval);
  }, []);

  const extractMetric = (text: string, metricName: string, quantile?: number): number => {
    const pattern = quantile
      ? `${metricName}{quantile="${quantile}"}\\s(\\d+\\.?\\d*)`
      : `${metricName}\\s(\\d+\\.?\\d*)`;
    const match = text.match(new RegExp(pattern));
    return match ? parseFloat(match[1]) : 0;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold font-fira-code mb-2">WISE² AR/VR Ecosystem</h1>
        <p className="text-slate-400 font-fira-sans">Real-time monitoring and device management</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`
              rounded-lg p-6 backdrop-blur-sm border
              transition-all duration-300
              ${
                metric.status === 'healthy'
                  ? 'bg-slate-900/50 border-emerald-500/30 hover:border-emerald-500/60'
                  : metric.status === 'warning'
                  ? 'bg-slate-900/50 border-amber-500/30 hover:border-amber-500/60'
                  : 'bg-slate-900/50 border-red-500/30 hover:border-red-500/60'
              }
            `}
            style={{
              animation: `fadeIn 0.4s ease-out ${idx * 0.06}s both`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-300 font-fira-sans">{metric.title}</h3>
              <div
                className={`
                  p-2 rounded-lg
                  ${
                    metric.status === 'healthy'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : metric.status === 'warning'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-red-500/20 text-red-400'
                  }
                `}
              >
                {metric.icon}
              </div>
            </div>

            <div className="mb-2">
              <div className="text-2xl font-bold font-fira-code">
                {metric.value}
                {metric.unit && <span className="text-sm text-slate-400 ml-1">{metric.unit}</span>}
              </div>
            </div>

            {metric.trend && (
              <p className="text-xs text-emerald-400 font-fira-code">
                {metric.trend > 0 ? '↑' : '↓'} {Math.abs(metric.trend)}% this hour
              </p>
            )}

            {/* Status indicator */}
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  metric.status === 'healthy'
                    ? 'bg-emerald-500'
                    : metric.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: metric.status === 'healthy' ? '100%' : metric.status === 'warning' ? '66%' : '33%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Infrastructure */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-fira-code mb-6 text-amber-500">Infrastructure Status</h2>
          <div className="space-y-4">
            {[
              { name: 'Router API', port: 3100, status: 'healthy' },
              { name: 'Ollama Inference', port: 11434, status: 'healthy' },
              { name: 'Second Brain', port: 3012, status: 'healthy' },
              { name: 'Prometheus', port: 9090, status: 'healthy' },
            ].map((service) => (
              <div key={service.port} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div>
                  <p className="font-medium font-fira-sans">{service.name}</p>
                  <p className="text-sm text-slate-400 font-fira-code">:{service.port}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-emerald-400 font-fira-code">Running</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connected Devices */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm">
          <h2 className="text-lg font-bold font-fira-code mb-6 text-indigo-500">Connected Devices</h2>
          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 text-center">
                <p className="text-sm text-slate-400">No devices connected yet</p>
                <p className="text-xs text-slate-500 mt-1">Deploy Ray-Ban or Quest apps to see devices</p>
              </div>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium font-fira-sans">{device.name}</p>
                    <div className="flex items-center gap-2">
                      <Battery className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-fira-code">{device.battery}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>Latency: <span className="font-fira-code text-emerald-400">{device.latency}ms</span></p>
                    {device.fps && <p>FPS: <span className="font-fira-code text-indigo-400">{device.fps}</span></p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Documentation Links */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-8 backdrop-blur-sm">
        <h2 className="text-lg font-bold font-fira-code mb-6">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Setup Guide', href: '/docs/monitoring/SETUP.md', icon: '📖' },
            { label: 'Emergency Runbook', href: '/docs/monitoring/RUNBOOK.md', icon: '🚨' },
            { label: 'API Examples', href: '/docs/api-examples', icon: '💻' },
            { label: 'Prometheus', href: 'http://localhost:9090', icon: '📊' },
            { label: 'Grafana', href: 'http://localhost:3000', icon: '📈' },
            { label: 'Alertmanager', href: 'http://localhost:9093', icon: '🔔' },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <p className="text-sm font-medium font-fira-sans">{link.label}</p>
              <p className="text-xl mt-2">{link.icon}</p>
            </a>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --color-primary: #d97706;
          --color-secondary: #f59e0b;
          --color-accent: #6366f1;
          --color-background: #0f172a;
          --color-foreground: #ffffff;
          --color-muted: #1f1e27;
          --color-border: rgba(255, 255, 255, 0.08);
          --color-destructive: #dc2626;
          --color-ring: #d97706;
        }

        .font-fira-code {
          font-family: 'Fira Code', monospace;
        }

        .font-fira-sans {
          font-family: 'Fira Sans', sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
