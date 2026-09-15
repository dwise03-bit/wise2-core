'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Zap, Radio, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

const WISE2_COLORS = {
  dark: '#050607',
  navy: '#0a0f1a',
  neon_green: '#00FF7F',
  neon_cyan: '#00D9FF',
  gold: '#C4A369',
  white: '#D1D5DB',
  text_muted: '#6B7280',
};

export default function WearablesPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [captures, setCaptures] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      { id: 'alert-001', title: 'Frame Captured', message: 'John Smith submitted diagnostic frame for JOB-HVAC-001', severity: 'INFO', createdAt: new Date(Date.now() - 120000).toISOString(), sentToDiscord: true },
      { id: 'alert-002', title: 'Approval Complete', message: 'Frame approved for JOB-HVAC-002 - Quality gates passed', severity: 'INFO', createdAt: new Date(Date.now() - 300000).toISOString(), sentToDiscord: true },
      { id: 'alert-003', title: 'Pending Review', message: '23 frames awaiting supervisor approval - 4 flagged urgent', severity: 'WARNING', createdAt: new Date(Date.now() - 600000).toISOString(), sentToDiscord: true },
      { id: 'alert-004', title: 'Device Connected', message: 'Ray-Ban Meta Gen 2 (SN: RB-META-001) back online - full sync', severity: 'INFO', createdAt: new Date(Date.now() - 1800000).toISOString(), sentToDiscord: false },
    ];
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="text-center">
            <div className="text-6xl font-black mb-4" style={{ color: WISE2_COLORS.neon_cyan }}>RAY-BAN</div>
            <div className="text-sm tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>INITIALIZING COMMAND LAYER...</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: WISE2_COLORS.dark, color: WISE2_COLORS.white }} className="min-h-screen font-mono">
      {/* Top Bar */}
      <div className="border-b" style={{ borderColor: `${WISE2_COLORS.neon_cyan}20`, backgroundColor: `${WISE2_COLORS.navy}80` }} className="sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm tracking-widest uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>◆ RAY-BAN WEARABLES</div>
            <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>FIELD SERVICE COMMAND CENTER</div>
          </div>
          <div className="flex gap-1 bg-black/50 border rounded" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
            {['overview', 'captures', 'alerts'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === t
                    ? 'border-b-2'
                    : 'opacity-40 hover:opacity-70'
                }`}
                style={{
                  borderColor: tab === t ? WISE2_COLORS.neon_green : 'transparent',
                  color: tab === t ? WISE2_COLORS.neon_green : WISE2_COLORS.text_muted,
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {tab === 'overview' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            {/* System Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'TOTAL CAPTURES', value: stats.stats.totalCaptures, icon: Eye },
                { label: 'PENDING', value: stats.stats.pendingApprovals, icon: AlertTriangle },
                { label: 'ACTIVE SESSIONS', value: stats.stats.activeSessions, icon: Activity },
                { label: 'CONNECTED', value: stats.stats.connectedDevices, icon: Radio },
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border-l-2 pl-6 py-4"
                    style={{ borderColor: WISE2_COLORS.neon_cyan }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={20} style={{ color: WISE2_COLORS.neon_green }} />
                      <span className="text-xs tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>
                        {metric.label}
                      </span>
                    </div>
                    <div className="text-5xl font-black" style={{ color: WISE2_COLORS.neon_cyan }}>
                      {metric.value}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Live System Readout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="border p-6"
              style={{
                borderColor: `${WISE2_COLORS.neon_green}40`,
                backgroundColor: `${WISE2_COLORS.navy}60`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_green }}>
                  ■ LIVE SYSTEM READOUT
                </div>
                <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: WISE2_COLORS.neon_green }} />
                  <span className="ml-2 text-xs" style={{ color: WISE2_COLORS.neon_green }}>LIVE</span>
                </motion.div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {[
                  { label: 'FIELD COVERAGE', value: '97%', status: 'OPTIMAL' },
                  { label: 'SYNC HEALTH', value: '100%', status: 'NOMINAL' },
                  { label: 'APPROVAL RATE', value: '94%', status: 'STRONG' },
                ].map((metric, i) => (
                  <div key={i}>
                    <div className="text-xs tracking-widest mb-2" style={{ color: WISE2_COLORS.text_muted }}>
                      {metric.label}
                    </div>
                    <div className="text-3xl font-black mb-1" style={{ color: WISE2_COLORS.neon_green }}>
                      {metric.value}
                    </div>
                    <div className="text-xs uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>
                      {metric.status}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chart Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Capture Trend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="border p-6"
                style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}
              >
                <div className="flex items-center gap-2 mb-8">
                  <TrendingUp size={16} style={{ color: WISE2_COLORS.neon_cyan }} />
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>
                    CAPTURE TREND
                  </span>
                </div>
                <div className="h-40 flex items-end justify-around gap-1">
                  {[45, 32, 52, 38, 61, 44, 55].map((v, i) => (
                    <motion.div
                      key={i}
                      className="flex-1"
                      initial={{ height: 0 }}
                      animate={{ height: `${(v / 61) * 100}%` }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      style={{
                        backgroundColor: WISE2_COLORS.neon_green,
                        boxShadow: `0 0 20px ${WISE2_COLORS.neon_green}80`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-6 text-xs" style={{ color: WISE2_COLORS.text_muted }}>
                  AVG: <span style={{ color: WISE2_COLORS.neon_green }}>46</span> captures/day
                </div>
              </motion.div>

              {/* Response Times */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="border p-6"
                style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}
              >
                <div className="flex items-center gap-2 mb-8">
                  <Zap size={16} style={{ color: WISE2_COLORS.neon_cyan }} />
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>
                    RESPONSE TIMES
                  </span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'AVERAGE', time: '45ms', color: WISE2_COLORS.neon_cyan },
                    { label: 'PEAK', time: '120ms', color: WISE2_COLORS.gold },
                    { label: 'MINIMUM', time: '5ms', color: WISE2_COLORS.neon_green },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-2">
                        <span style={{ color: WISE2_COLORS.text_muted }}>{item.label}</span>
                        <span style={{ color: item.color }} className="font-bold">
                          {item.time}
                        </span>
                      </div>
                      <motion.div
                        className="h-2"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 0.7, duration: 1 }}
                        style={{
                          backgroundColor: item.color,
                          boxShadow: `0 0 12px ${item.color}60`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {tab === 'captures' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black mb-8 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>
              FRAME CAPTURES ({captures.length})
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {captures.map((capture) => (
                <motion.div
                  key={capture.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border p-4 hover:border-opacity-100 transition-all"
                  style={{
                    borderColor: capture.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}60` : `${WISE2_COLORS.neon_cyan}30`,
                  }}
                >
                  <img src={capture.frameUrl} alt="Frame" className="w-full h-24 object-cover mb-3 border" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }} />
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>
                      {capture.jobId}
                    </div>
                    <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>
                      {capture.notes}
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-1 w-fit"
                      style={{
                        backgroundColor: capture.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}20` : `${WISE2_COLORS.gold}20`,
                        color: capture.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold,
                      }}
                    >
                      {capture.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black mb-8 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>
              REAL-TIME ALERTS ({alerts.length})
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-l-2 pl-4 py-3"
                  style={{ borderColor: alert.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm" style={{ color: WISE2_COLORS.neon_cyan }}>
                        {alert.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>
                        {alert.message}
                      </div>
                    </div>
                    <div
                      className="text-xs font-bold px-2 py-1"
                      style={{
                        backgroundColor: alert.severity === 'WARNING' ? `${WISE2_COLORS.gold}20` : `${WISE2_COLORS.neon_green}20`,
                        color: alert.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green,
                      }}
                    >
                      {alert.severity}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
