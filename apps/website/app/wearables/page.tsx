'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function WearablesPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [captures, setCaptures] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, capturesRes, alertsRes] = await Promise.all([
        fetch('/api/rayban/dashboard'),
        fetch('/api/rayban/captures?limit=20'),
        fetch('/api/rayban/alerts?limit=10'),
      ]);

      const [statsData, capturesData, alertsData] = await Promise.all([
        statsRes.json(),
        capturesRes.json(),
        alertsRes.json(),
      ]);

      setStats(statsData);
      setCaptures(capturesData);
      setAlerts(alertsData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-4xl mb-4">👓</div>
          <div className="text-xl font-bold text-white">Ray-Ban Wearables Dashboard</div>
          <div className="text-sm text-gray-400 mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">👓</div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Ray-Ban Wearables
              </h1>
              <p className="text-gray-400">Field Tech Command Center</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('overview')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                tab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setTab('captures')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                tab === 'captures'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              📸 Captures
            </button>
            <button
              onClick={() => setTab('alerts')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                tab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              🔔 Alerts
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        {tab === 'overview' && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KPICard
                title="Total Captures"
                value={stats.stats.totalCaptures}
                icon="📸"
                color="from-blue-600 to-cyan-600"
              />
              <KPICard
                title="Pending Approval"
                value={stats.stats.pendingApprovals}
                icon="⏳"
                color="from-yellow-600 to-orange-600"
              />
              <KPICard
                title="Active Sessions"
                value={stats.stats.activeSessions}
                icon="🔴"
                color="from-green-600 to-emerald-600"
              />
              <KPICard
                title="Connected Devices"
                value={stats.stats.connectedDevices}
                icon="📡"
                color="from-purple-600 to-pink-600"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/50 backdrop-blur-md rounded-xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  📈 Capture Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="captures"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-700/50 backdrop-blur-md rounded-xl p-6 border border-slate-600">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  ⏱️ Response Times
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateResponseData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    />
                    <Bar dataKey="avgTime" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Captures Tab */}
        {tab === 'captures' && (
          <div className="bg-slate-700/50 backdrop-blur-md rounded-xl p-6 border border-slate-600">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              📸 Recent Captures ({captures.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {captures.map((capture) => (
                <div
                  key={capture.id}
                  className="bg-slate-600/50 rounded-lg p-4 border border-slate-500 hover:border-blue-500 transition-all cursor-pointer group"
                >
                  {capture.frameUrl && (
                    <img
                      src={capture.frameUrl}
                      alt="Frame"
                      className="w-full h-32 object-cover rounded mb-3 group-hover:brightness-110 transition-all"
                    />
                  )}
                  <div className="text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-blue-400">Job {capture.jobId.slice(0, 8)}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          capture.status === 'APPROVED'
                            ? 'bg-green-900 text-green-300'
                            : capture.status === 'PENDING'
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {capture.status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs">
                      {new Date(capture.createdAt).toLocaleString()}
                    </div>
                    {capture.notes && (
                      <div className="mt-2 text-gray-300 text-xs">{capture.notes}</div>
                    )}
                    {capture.status === 'PENDING' && (
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-semibold transition-all">
                          ✅ Approve
                        </button>
                        <button className="flex-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-semibold transition-all">
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {tab === 'alerts' && (
          <div className="bg-slate-700/50 backdrop-blur-md rounded-xl p-6 border border-slate-600">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔔 Recent Alerts ({alerts.length})
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-900/20 border-l-red-600'
                      : alert.severity === 'ERROR'
                      ? 'bg-orange-900/20 border-l-orange-600'
                      : alert.severity === 'WARNING'
                      ? 'bg-yellow-900/20 border-l-yellow-600'
                      : 'bg-blue-900/20 border-l-blue-600'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">{alert.title}</div>
                      <div className="text-sm text-gray-300">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-700 text-red-100'
                          : alert.severity === 'ERROR'
                          ? 'bg-orange-700 text-orange-100'
                          : alert.severity === 'WARNING'
                          ? 'bg-yellow-700 text-yellow-100'
                          : 'bg-blue-700 text-blue-100'
                      }`}
                    >
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

function KPICard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  return (
    <div
      className={`bg-gradient-to-br ${color} rounded-xl p-6 border border-white/10 shadow-lg`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-white/70">{title}</div>
      <div className="text-4xl font-black mt-2">{value}</div>
    </div>
  );
}

function generateTrendData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    name: day,
    captures: Math.floor(Math.random() * 30) + 20,
    approved: Math.floor(Math.random() * 25) + 15,
  }));
}

function generateResponseData() {
  return [
    { name: 'Avg', avgTime: 45 },
    { name: 'Peak', avgTime: 120 },
    { name: 'Min', avgTime: 5 },
  ];
}
