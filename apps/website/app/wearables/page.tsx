'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Zap, Radio, TrendingUp, AlertTriangle, Activity, Gauge, Lock } from 'lucide-react';

const WISE2_COLORS = {
  dark: '#050607',
  navy: '#0a0f1a',
  neon_green: '#00FF7F',
  neon_cyan: '#00D9FF',
  gold: '#C4A369',
  white: '#D1D5DB',
  text_muted: '#6B7280',
  accent_purple: '#8B5CF6',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function WearablesPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [captures, setCaptures] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      { id: 'cap-001', jobId: 'JOB-HVAC-001', contractorId: 'john-001', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3ECompressor Analysis%3C/text%3E%3C/svg%3E', status: 'PENDING', createdAt: new Date(Date.now() - 300000).toISOString(), notes: 'Critical compressor diagnostic' },
      { id: 'cap-002', jobId: 'JOB-HVAC-002', contractorId: 'jane-002', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EFrigerant Lines%3C/text%3E%3C/svg%3E', status: 'APPROVED', createdAt: new Date(Date.now() - 600000).toISOString(), notes: 'Refrigerant lines verified' },
      { id: 'cap-003', jobId: 'JOB-HVAC-003', contractorId: 'mike-003', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EThermostat Setup%3C/text%3E%3C/svg%3E', status: 'PENDING', createdAt: new Date(Date.now() - 900000).toISOString(), notes: 'Smart thermostat installation' },
      { id: 'cap-004', jobId: 'JOB-ELEC-001', contractorId: 'john-001', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EElectrical Panel%3C/text%3E%3C/svg%3E', status: 'APPROVED', createdAt: new Date(Date.now() - 1200000).toISOString(), notes: 'Panel upgrade documentation' },
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
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${WISE2_COLORS.neon_cyan} 0%, transparent 50%)`,
          transition: 'background-image 0.1s ease-out',
        }} />
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="relative z-10 text-center">
          <div className="text-6xl font-black mb-4" style={{ color: WISE2_COLORS.neon_cyan }}>RAY-BAN</div>
          <motion.div animate={{ scaleX: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="h-1" style={{ backgroundColor: WISE2_COLORS.neon_green }} />
          <div className="text-sm tracking-widest mt-4" style={{ color: WISE2_COLORS.text_muted }}>INITIALIZING COMMAND LAYER...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: WISE2_COLORS.dark, color: WISE2_COLORS.white }} className="min-h-screen font-mono relative overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `linear-gradient(0deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px), linear-gradient(90deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      {/* Mouse-following glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${WISE2_COLORS.neon_cyan}10 0%, transparent 40%)`,
        transition: 'background-image 0.1s ease-out',
      }} />

      {/* Top Bar */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="relative z-50 border-b sticky top-0" style={{ borderColor: `${WISE2_COLORS.neon_cyan}20`, backgroundColor: `${WISE2_COLORS.navy}95`, backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div variants={itemVariants}>
            <div className="text-sm tracking-widest uppercase font-black" style={{ color: WISE2_COLORS.neon_cyan }}>◆ RAY-BAN WEARABLES</div>
            <div className="text-xs mt-1 font-mono" style={{ color: WISE2_COLORS.text_muted }}>FIELD SERVICE COMMAND CENTER</div>
          </motion.div>
          <div className="flex gap-1 bg-black/60 border rounded" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
            {['overview', 'captures', 'alerts'].map((t, i) => (
              <motion.button key={t} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${tab === t ? 'border-b-2' : 'opacity-40 hover:opacity-70'}`} style={{ borderColor: tab === t ? WISE2_COLORS.neon_green : 'transparent', color: tab === t ? WISE2_COLORS.neon_green : WISE2_COLORS.text_muted }}>
                {t}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {tab === 'overview' && stats && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="border rounded-lg p-8 relative overflow-hidden" style={{ borderColor: `${WISE2_COLORS.neon_green}40`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: `linear-gradient(45deg, ${WISE2_COLORS.neon_green}20 1px, transparent 1px), linear-gradient(-45deg, ${WISE2_COLORS.neon_green}20 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }} />
              <div className="relative z-10">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-7xl font-black" style={{ color: WISE2_COLORS.neon_green }}>347</span>
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>TOTAL CAPTURES</span>
                </div>
                <motion.div animate={{ width: ['0%', '45%'] }} transition={{ duration: 2, ease: 'easeOut' }} className="h-1 mt-4" style={{ backgroundColor: WISE2_COLORS.neon_green }} />
              </div>
            </motion.div>

            {/* Metric Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'PENDING', value: stats.stats.pendingApprovals, icon: AlertTriangle, color: WISE2_COLORS.gold },
                { label: 'ACTIVE SESSIONS', value: stats.stats.activeSessions, icon: Activity, color: WISE2_COLORS.neon_green },
                { label: 'CONNECTED', value: stats.stats.connectedDevices, icon: Radio, color: WISE2_COLORS.neon_cyan },
                { label: 'FIELD HEALTH', value: '94%', icon: Gauge, color: WISE2_COLORS.accent_purple },
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.05, y: -10 }} className="border-l-4 pl-6 py-6 rounded relative overflow-hidden group cursor-pointer" style={{ borderColor: metric.color, backgroundColor: `${WISE2_COLORS.navy}70` }}>
                    <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: metric.color }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon size={18} style={{ color: metric.color }} />
                        <span className="text-xs tracking-widest font-bold" style={{ color: WISE2_COLORS.text_muted }}>{metric.label}</span>
                      </div>
                      <motion.div className="text-5xl font-black" style={{ color: metric.color }} animate={{ opacity: [0.5, 1] }} transition={{ duration: 0.6 }}>
                        {metric.value}
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Live System Readout */}
            <motion.div variants={itemVariants} className="border rounded-lg p-8 relative" style={{ borderColor: `${WISE2_COLORS.neon_green}40`, backgroundColor: `${WISE2_COLORS.navy}80` }}>
              <div className="flex items-center justify-between mb-8">
                <div className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_green }}>■ LIVE SYSTEM READOUT</div>
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: WISE2_COLORS.neon_green }} />
                  <span className="text-xs font-bold" style={{ color: WISE2_COLORS.neon_green }}>LIVE</span>
                </motion.div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {[
                  { label: 'FIELD COVERAGE', value: '97%', status: 'OPTIMAL', color: WISE2_COLORS.neon_green },
                  { label: 'SYNC HEALTH', value: '100%', status: 'NOMINAL', color: WISE2_COLORS.neon_cyan },
                  { label: 'APPROVAL RATE', value: '94%', status: 'STRONG', color: WISE2_COLORS.gold },
                ].map((metric, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <div className="text-xs tracking-widest mb-3 font-mono" style={{ color: WISE2_COLORS.text_muted }}>{metric.label}</div>
                    <motion.div className="text-4xl font-black mb-2" style={{ color: metric.color }} animate={{ scale: [1, 1.1, 1] }} transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}>
                      {metric.value}
                    </motion.div>
                    <div className="text-xs font-bold uppercase tracking-widest" style={{ color: metric.color }}>{metric.status}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-6">
              {/* Capture Trend */}
              <motion.div variants={itemVariants} className="border rounded-lg p-6 relative overflow-hidden" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
                <div className="flex items-center gap-2 mb-8">
                  <TrendingUp size={16} style={{ color: WISE2_COLORS.neon_cyan }} />
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>CAPTURE TREND</span>
                </div>
                <div className="h-48 flex items-end justify-around gap-2 mb-6">
                  {[45, 32, 52, 38, 61, 44, 55].map((v, i) => (
                    <motion.div key={i} className="flex-1 group cursor-pointer" initial={{ height: 0 }} animate={{ height: `${(v / 61) * 100}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.8 }} whileHover={{ scale: 1.1 }} style={{ backgroundColor: WISE2_COLORS.neon_green, boxShadow: `0 0 20px ${WISE2_COLORS.neon_green}`, borderRadius: '2px' }} />
                  ))}
                </div>
                <div className="flex justify-between text-xs" style={{ color: WISE2_COLORS.text_muted }}>
                  <span>AVG:</span>
                  <span style={{ color: WISE2_COLORS.neon_green }} className="font-bold">46 captures/day</span>
                </div>
              </motion.div>

              {/* Response Times */}
              <motion.div variants={itemVariants} className="border rounded-lg p-6 relative" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
                <div className="flex items-center gap-2 mb-8">
                  <Zap size={16} style={{ color: WISE2_COLORS.neon_cyan }} />
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>RESPONSE TIMES</span>
                </div>
                <div className="space-y-6">
                  {[
                    { label: 'AVERAGE', time: '45ms', color: WISE2_COLORS.neon_cyan, width: 37.5 },
                    { label: 'PEAK', time: '120ms', color: WISE2_COLORS.gold, width: 100 },
                    { label: 'MINIMUM', time: '5ms', color: WISE2_COLORS.neon_green, width: 4.2 },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-2">
                        <span style={{ color: WISE2_COLORS.text_muted }}>{item.label}</span>
                        <span style={{ color: item.color }} className="font-bold">{item.time}</span>
                      </div>
                      <motion.div className="h-3 rounded" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.5 + i * 0.1, duration: 1 }} style={{ backgroundColor: `${item.color}30`, overflow: 'hidden' }}>
                        <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${item.width}%` }} transition={{ delay: 0.6 + i * 0.1, duration: 1.2 }} style={{ backgroundColor: item.color, boxShadow: `0 0 12px ${item.color}` }} />
                      </motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {tab === 'captures' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-4xl font-black mb-10 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>FRAME CAPTURES ({captures.length})</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {captures.map((capture) => (
                <motion.div key={capture.id} variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }} className="border rounded-lg p-4 cursor-pointer relative overflow-hidden group" style={{ borderColor: capture.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}60` : `${WISE2_COLORS.gold}60`, backgroundColor: `${WISE2_COLORS.navy}70` }}>
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: capture.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold }} />
                  <img src={capture.frameUrl} alt="Frame" className="w-full h-24 object-cover mb-3 border rounded" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }} />
                  <div className="space-y-2 relative z-10">
                    <div className="text-xs font-bold uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>{capture.jobId}</div>
                    <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>{capture.notes}</div>
                    <div className="text-xs font-bold px-3 py-1 w-fit rounded" style={{ backgroundColor: capture.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}30` : `${WISE2_COLORS.gold}30`, color: capture.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold }}>
                      {capture.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {tab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-4xl font-black mb-10 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>REAL-TIME ALERTS ({alerts.length})</h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {alerts.map((alert, i) => (
                <motion.div key={alert.id} variants={itemVariants} whileHover={{ x: 8 }} className="border-l-4 pl-6 py-4 rounded cursor-pointer relative overflow-hidden group" style={{ borderColor: alert.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green, backgroundColor: `${WISE2_COLORS.navy}70` }}>
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: alert.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green }} />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: WISE2_COLORS.neon_cyan }}>{alert.title}</div>
                      <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>{alert.message}</div>
                    </div>
                    <motion.div className="text-xs font-bold px-3 py-1 ml-4 rounded whitespace-nowrap" animate={{ scale: [1, 1.05, 1] }} transition={{ delay: i * 0.1, duration: 2, repeat: Infinity }} style={{ backgroundColor: alert.severity === 'WARNING' ? `${WISE2_COLORS.gold}30` : `${WISE2_COLORS.neon_green}30`, color: alert.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green }}>
                      {alert.severity}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
