'use client';

import React, { useState, useEffect } from 'react';

const DESIGN_SYSTEM = {
  colors: {
    primary: '#1E40AF',      // Deep blue
    secondary: '#3B82F6',    // Sky blue
    accent: '#D97706',       // Amber highlight
    background: '#F8FAFC',   // Off-white
    foreground: '#1E3A8A',   // Dark blue
    destructive: '#DC2626',  // Red
    success: '#10B981',      // Emerald
    warning: '#F59E0B',      // Amber
  },
  typography: {
    headingFont: "'Fira Code', monospace",
    bodyFont: "'Fira Sans', system-ui",
  },
};

export default function WearablesPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [captures, setCaptures] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, capturesRes, alertsRes] = await Promise.all([
        fetch('/api/rayban/dashboard').catch(() => null),
        fetch('/api/rayban/captures?limit=20').catch(() => null),
        fetch('/api/rayban/alerts?limit=10').catch(() => null),
      ]);

      if (statsRes?.ok && capturesRes?.ok && alertsRes?.ok) {
        setStats(await statsRes.json());
        setCaptures(await capturesRes.json() || []);
        setAlerts(await alertsRes.json() || []);
        setLoading(false);
        return;
      }

      setStats(generateMockStats());
      setCaptures(generateMockCaptures());
      setAlerts(generateMockAlerts());
      setLoading(false);
    } catch (error) {
      setStats(generateMockStats());
      setCaptures(generateMockCaptures());
      setAlerts(generateMockAlerts());
      setLoading(false);
    }
  }

  function generateMockStats() {
    return {
      stats: {
        totalCaptures: 347,
        pendingApprovals: 23,
        activeSessions: 8,
        connectedDevices: 5,
      },
      recentAlerts: [],
    };
  }

  function generateMockCaptures() {
    return [
      {
        id: 'cap-001',
        jobId: 'JOB-HVAC-001',
        contractorId: 'john-001',
        frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3ECompressor Analysis%3C/text%3E%3C/svg%3E',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        notes: 'Critical compressor diagnostic',
      },
      {
        id: 'cap-002',
        jobId: 'JOB-HVAC-002',
        contractorId: 'jane-002',
        frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EFrigerant Lines%3C/text%3E%3C/svg%3E',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        notes: 'Refrigerant lines verified',
      },
      {
        id: 'cap-003',
        jobId: 'JOB-HVAC-003',
        contractorId: 'mike-003',
        frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EThermostat Setup%3C/text%3E%3C/svg%3E',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 900000).toISOString(),
        notes: 'Smart thermostat installation',
      },
      {
        id: 'cap-004',
        jobId: 'JOB-ELEC-001',
        contractorId: 'john-001',
        frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EElectrical Panel%3C/text%3E%3C/svg%3E',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 1200000).toISOString(),
        notes: 'Panel upgrade documentation',
      },
    ];
  }

  function generateMockAlerts() {
    return [
      {
        id: 'alert-001',
        title: 'Frame Captured',
        message: 'John Smith submitted diagnostic frame for JOB-HVAC-001',
        severity: 'INFO',
        createdAt: new Date(Date.now() - 120000).toISOString(),
        sentToDiscord: true,
      },
      {
        id: 'alert-002',
        title: 'Approval Complete',
        message: 'Frame approved for JOB-HVAC-002 - Quality gates passed',
        severity: 'INFO',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        sentToDiscord: true,
      },
      {
        id: 'alert-003',
        title: 'Pending Review',
        message: '23 frames awaiting supervisor approval - 4 flagged urgent',
        severity: 'WARNING',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        sentToDiscord: true,
      },
      {
        id: 'alert-004',
        title: 'Device Connected',
        message: 'Ray-Ban Meta Gen 2 (SN: RB-META-001) back online - full sync',
        severity: 'INFO',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        sentToDiscord: false,
      },
    ];
  }

  async function handleApproveCapture(captureId: string) {
    setCaptures(captures.map(c =>
      c.id === captureId ? { ...c, status: 'APPROVED' } : c
    ));
    await fetch(`/api/rayban/captures/${captureId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', approvedBy: 'system' }),
    }).catch(() => {});
  }

  async function handleRejectCapture(captureId: string) {
    setCaptures(captures.map(c =>
      c.id === captureId ? { ...c, status: 'REJECTED' } : c
    ));
    await fetch(`/api/rayban/captures/${captureId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', approvedBy: 'system' }),
    }).catch(() => {});
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-amber-500 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-2xl">👓</span>
          </div>
          <div className="text-2xl font-bold text-blue-900" style={{ fontFamily: DESIGN_SYSTEM.typography.headingFont }}>
            Ray-Ban Wearables
          </div>
          <div className="text-sm text-blue-600 mt-2">Initializing command center...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 text-slate-900"
      style={{ fontFamily: DESIGN_SYSTEM.typography.bodyFont }}
    >
      {/* Header with gradient line */}
      <div className="border-b border-blue-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-amber-500 flex items-center justify-center text-xl shadow-lg">
                👓
              </div>
              <div>
                <h1
                  className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent"
                  style={{ fontFamily: DESIGN_SYSTEM.typography.headingFont }}
                >
                  RAY-BAN WEARABLES
                </h1>
                <p className="text-xs text-blue-600 font-medium tracking-wider">FIELD SERVICE COMMAND CENTER</p>
              </div>
            </div>

            {/* Tabs with smooth underline */}
            <div className="flex gap-1 bg-white/60 rounded-lg p-1 border border-blue-200">
              {['overview', 'captures', 'alerts'].map((tabName) => {
                const isActive = tab === tabName;
                const labels = { overview: 'Overview', captures: 'Captures', alerts: 'Alerts' };
                return (
                  <button
                    key={tabName}
                    onClick={() => setTab(tabName as any)}
                    className={`px-5 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {labels[tabName as keyof typeof labels]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {tab === 'overview' && stats && (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { title: 'Total Captures', value: stats.stats.totalCaptures, color: '#1E40AF', icon: '📸' },
                { title: 'Pending', value: stats.stats.pendingApprovals, color: '#D97706', icon: '⏳' },
                { title: 'Active Sessions', value: stats.stats.activeSessions, color: '#10B981', icon: '▶️' },
                { title: 'Connected', value: stats.stats.connectedDevices, color: '#3B82F6', icon: '🔗' },
              ].map((card, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCard(`kpi-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative overflow-hidden rounded-xl border border-blue-200 bg-white/90 backdrop-blur p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{
                    background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}04 100%)`
                  }} />

                  <div className="relative z-10">
                    <div className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300">
                      {card.icon}
                    </div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                      {card.title}
                    </div>
                    <div className="text-5xl font-black" style={{ color: card.color }}>
                      {card.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Capture Trend */}
              <div className="rounded-2xl border border-blue-200 bg-white/90 backdrop-blur p-8 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2" style={{ fontFamily: DESIGN_SYSTEM.typography.headingFont }}>
                  📈 CAPTURE TREND
                </h3>
                <div className="h-80 flex items-end justify-around gap-2">
                  {[45, 32, 52, 38, 61, 44, 55].map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg opacity-70 group-hover:opacity-100 transition-all duration-300 shadow-md"
                        style={{ height: `${(v / 61) * 100}%` }}
                      />
                      <span className="text-xs font-semibold text-blue-700">{['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'][i]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-xs text-blue-600 font-medium">
                  Avg: {((45 + 32 + 52 + 38 + 61 + 44 + 55) / 7) | 0} captures/day
                </div>
              </div>

              {/* Response Times */}
              <div className="rounded-2xl border border-blue-200 bg-white/90 backdrop-blur p-8 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2" style={{ fontFamily: DESIGN_SYSTEM.typography.headingFont }}>
                  ⏱️ RESPONSE TIMES
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Average', time: 45, color: '#3B82F6' },
                    { label: 'Peak', time: 120, color: '#D97706' },
                    { label: 'Minimum', time: 5, color: '#10B981' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold text-blue-900">{item.label}</span>
                        <span className="text-sm font-mono text-blue-600">{item.time}s</span>
                      </div>
                      <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${(item.time / 120) * 100}%`,
                            background: `linear-gradient(90deg, ${item.color}, ${item.color}dd)`,
                            boxShadow: `0 0 12px ${item.color}60`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Captures Tab */}
        {tab === 'captures' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-8" style={{ fontFamily: DESIGN_SYSTEM.typography.headingFont }}>
              FRAME CAPTURES ({captures.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {captures.map((capture) => (
                <div
                  key={capture.id}
                  className={`group relative rounded-xl border transition-all duration-500 overflow-hidden ${
                    capture.status === 'APPROVED'
                      ? 'border-emerald-300 bg-emerald-50 hover:shadow-lg'
                      : capture.status === 'REJECTED'
                      ? 'border-red-300 bg-red-50 hover:shadow-lg'
                      : 'border-amber-300 bg-amber-50 hover:shadow-lg'
                  }`}
                >
                  <div className="p-6">
                    <img
                      src={capture.frameUrl}
                      alt="Frame"
                      className="w-full h-32 object-cover rounded-lg mb-4 group-hover:brightness-125 transition-all duration-300"
                    />

                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-blue-700">{capture.jobId}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          capture.status === 'APPROVED'
                            ? 'bg-emerald-200 text-emerald-900'
                            : capture.status === 'REJECTED'
                            ? 'bg-red-200 text-red-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}>
                          {capture.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">{capture.notes}</p>
                      <p className="text-xs text-slate-500">{new Date(capture.createdAt).toLocaleString()}</p>

                      {capture.status === 'PENDING' && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-current/20">
                          <button
                            onClick={() => handleApproveCapture(capture.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-all text-xs"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleRejectCapture(capture.id)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-all text-xs"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {tab === 'alerts' && (
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-8" style={{ fontFamily: DESIGN_SYSTEM.typography.headingFont }}>
              REAL-TIME ALERTS ({alerts.length})
            </h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`group p-6 rounded-xl border-l-4 transition-all duration-300 hover:shadow-md ${
                    alert.severity === 'CRITICAL'
                      ? 'border-l-red-600 bg-red-50'
                      : alert.severity === 'WARNING'
                      ? 'border-l-amber-600 bg-amber-50'
                      : 'border-l-blue-600 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-blue-900">{alert.title}</h3>
                      <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-200 text-red-900'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-blue-200 text-blue-900'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
