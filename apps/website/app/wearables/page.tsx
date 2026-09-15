'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Zap, Radio, TrendingUp, AlertTriangle, Activity, Gauge, Lock, BarChart3 } from 'lucide-react';

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

export default function WearablesPage() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [captures, setCaptures] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
    return { stats: { totalCaptures: 347, pendingApprovals: 23, activeSessions: 8, connectedDevices: 5 }, recentAlerts: [] };
  }

  function generateMockCaptures() {
    return [
      { id: 'cap-001', jobId: 'JOB-HVAC-001', contractorId: 'john-001', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3ECompressor%3C/text%3E%3C/svg%3E', status: 'PENDING', createdAt: new Date(Date.now() - 300000).toISOString(), notes: 'Critical compressor diagnostic' },
      { id: 'cap-002', jobId: 'JOB-HVAC-002', contractorId: 'jane-002', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EFrigerant%3C/text%3E%3C/svg%3E', status: 'APPROVED', createdAt: new Date(Date.now() - 600000).toISOString(), notes: 'Verified' },
      { id: 'cap-003', jobId: 'JOB-HVAC-003', contractorId: 'mike-003', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EThermostat%3C/text%3E%3C/svg%3E', status: 'PENDING', createdAt: new Date(Date.now() - 900000).toISOString(), notes: 'Installation' },
      { id: 'cap-004', jobId: 'JOB-ELEC-001', contractorId: 'john-001', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EElectrical%3C/text%3E%3C/svg%3E', status: 'APPROVED', createdAt: new Date(Date.now() - 1200000).toISOString(), notes: 'Panel upgrade' },
    ];
  }

  function generateMockAlerts() {
    return [
      { id: 'alert-001', title: 'Frame Captured', message: 'John Smith submitted frame for JOB-HVAC-001', severity: 'INFO', createdAt: new Date(Date.now() - 120000).toISOString() },
      { id: 'alert-002', title: 'Approval Complete', message: 'Frame approved for JOB-HVAC-002 - Quality gates passed', severity: 'INFO', createdAt: new Date(Date.now() - 300000).toISOString() },
      { id: 'alert-003', title: 'Pending Review', message: '23 frames awaiting approval - 4 urgent', severity: 'WARNING', createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: 'alert-004', title: 'Device Online', message: 'Ray-Ban Meta Gen 2 (RB-META-001) back online', severity: 'INFO', createdAt: new Date(Date.now() - 1800000).toISOString() },
    ];
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: WISE2_COLORS.dark }}><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-center"><div className="text-6xl font-black mb-4" style={{ color: WISE2_COLORS.neon_cyan }}>RAY-BAN</div><div className="text-sm tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>INITIALIZING...</div></motion.div></div>;
  }

  return (
    <div style={{ backgroundColor: WISE2_COLORS.dark, color: WISE2_COLORS.white }} className="min-h-screen font-mono relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(0deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px), linear-gradient(90deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${WISE2_COLORS.neon_cyan}08 0%, transparent 40%)`, transition: 'background-image 0.15s ease-out' }} />

      {/* Header */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="relative z-50 border-b sticky top-0" style={{ borderColor: `${WISE2_COLORS.neon_cyan}20`, backgroundColor: `${WISE2_COLORS.navy}98`, backdropFilter: 'blur(30px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div><div className="text-sm tracking-widest font-black" style={{ color: WISE2_COLORS.neon_cyan }}>◆ RAY-BAN WEARABLES</div><div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>FIELD SERVICE COMMAND</div></div>
          <div className="flex gap-1 bg-black/60 border rounded" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
            {['overview', 'captures', 'alerts'].map((t) => (<motion.button key={t} whileHover={{ scale: 1.05 }} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${tab === t ? 'border-b-2' : 'opacity-40'}`} style={{ borderColor: tab === t ? WISE2_COLORS.neon_green : 'transparent', color: tab === t ? WISE2_COLORS.neon_green : WISE2_COLORS.text_muted }}>{t}</motion.button>))}
          </div>
        </div>
      </motion.div>

      {/* Main Content - Bento Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Bento Grid Container */}
            <div className="grid grid-cols-6 grid-rows-8 gap-4 auto-rows-[150px]">
              {/* Hero Card - Large (spans 3x3) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-3 row-span-3 rounded-2xl p-8 border relative overflow-hidden group cursor-pointer" style={{ borderColor: `${WISE2_COLORS.neon_green}40`, backgroundColor: `${WISE2_COLORS.navy}80` }} onMouseEnter={() => setHoveredCard('hero')} onMouseLeave={() => setHoveredCard(null)}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all" style={{ backgroundColor: WISE2_COLORS.neon_green }} />
                <motion.div className="absolute -inset-20 opacity-0 group-hover:opacity-30" style={{ backgroundImage: `radial-gradient(circle, ${WISE2_COLORS.neon_green}40 0%, transparent 70%)` }} animate={hoveredCard === 'hero' ? { rotate: 360 } : {}} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div><div className="text-7xl font-black mb-2" style={{ color: WISE2_COLORS.neon_green }}>347</div><div className="text-sm tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>TOTAL CAPTURES</div></div>
                  <motion.div className="h-1" animate={hoveredCard === 'hero' ? { width: '100%' } : { width: '40%' }} style={{ backgroundColor: WISE2_COLORS.neon_green }} transition={{ duration: 0.5 }} />
                </div>
              </motion.div>

              {/* Metric Cards - 3x2 each */}
              {[
                { label: 'PENDING', value: stats.stats.pendingApprovals, icon: AlertTriangle, color: WISE2_COLORS.gold, span: 'col-span-3 row-span-2' },
                { label: 'ACTIVE SESSIONS', value: stats.stats.activeSessions, icon: Activity, color: WISE2_COLORS.neon_green, span: 'col-span-2 row-span-2' },
                { label: 'CONNECTED', value: stats.stats.connectedDevices, icon: Radio, color: WISE2_COLORS.neon_cyan, span: 'col-span-2 row-span-2' },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * (i + 1) }} className={`${m.span} rounded-xl p-6 border relative overflow-hidden group cursor-pointer`} style={{ borderColor: `${m.color}40`, backgroundColor: `${WISE2_COLORS.navy}70` }} onMouseEnter={() => setHoveredCard(`metric-${i}`)} onMouseLeave={() => setHoveredCard(null)}>
                    <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-all" style={{ backgroundColor: m.color }} />
                    <motion.div animate={hoveredCard === `metric-${i}` ? { scale: 1.2, rotate: 180 } : {}} className="absolute -inset-10" style={{ backgroundImage: `radial-gradient(circle, ${m.color}30 0%, transparent 60%)` }} />
                    <div className="relative z-10 flex flex-col justify-between h-full">
                      <div className="flex items-center gap-2"><Icon size={16} style={{ color: m.color }} /><span className="text-xs tracking-widest font-bold" style={{ color: WISE2_COLORS.text_muted }}>{m.label}</span></div>
                      <motion.div className="text-4xl font-black" style={{ color: m.color }} animate={hoveredCard === `metric-${i}` ? { scale: 1.1 } : {}}>{m.value}{typeof m.value === 'number' && m.label === 'CONNECTED' ? '' : ''}</motion.div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Live Readout - Bottom Left (3x3) */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="col-span-3 row-span-3 rounded-2xl p-6 border relative overflow-hidden" style={{ borderColor: `${WISE2_COLORS.neon_green}40`, backgroundColor: `${WISE2_COLORS.navy}80` }}>
                <div className="absolute inset-0 opacity-0" style={{ backgroundImage: `repeating-linear-gradient(45deg, ${WISE2_COLORS.neon_green}05 0px, ${WISE2_COLORS.neon_green}05 10px, transparent 10px, transparent 20px)` }} />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between mb-4"><div className="text-xs font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_green }}>■ LIVE</div><motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full" style={{ backgroundColor: WISE2_COLORS.neon_green }} /></div>
                  {[
                    { label: 'COVERAGE', value: '97%', color: WISE2_COLORS.neon_green },
                    { label: 'HEALTH', value: '100%', color: WISE2_COLORS.neon_cyan },
                    { label: 'APPROVAL', value: '94%', color: WISE2_COLORS.gold },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="text-xs tracking-widest mb-1" style={{ color: WISE2_COLORS.text_muted }}>{m.label}</div>
                      <motion.div className="text-2xl font-black" style={{ color: m.color }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}>{m.value}</motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Charts - Right Side (3x6) */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="col-span-3 row-span-6 rounded-2xl p-6 border flex flex-col" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30`, backgroundColor: `${WISE2_COLORS.navy}70` }}>
                <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} style={{ color: WISE2_COLORS.neon_cyan }} /><span className="text-xs font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>TREND</span></div>
                <div className="flex-1 flex items-end justify-around gap-1 mb-4">
                  {[45, 32, 52, 38, 61, 44, 55].map((v, i) => (
                    <motion.div key={i} className="flex-1" initial={{ height: 0 }} animate={{ height: `${(v / 61) * 100}%` }} transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }} whileHover={{ scale: 1.15 }} style={{ backgroundColor: WISE2_COLORS.neon_green, boxShadow: `0 0 20px ${WISE2_COLORS.neon_green}`, borderRadius: '2px', cursor: 'pointer' }} />
                  ))}
                </div>
                <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>46 /day</div>
              </motion.div>
            </div>
          </div>
        )}

        {tab === 'captures' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black mb-8 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>CAPTURES ({captures.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {captures.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -8, scale: 1.05 }} className="border rounded-lg p-4 cursor-pointer relative overflow-hidden group" style={{ borderColor: c.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}60` : `${WISE2_COLORS.gold}60`, backgroundColor: `${WISE2_COLORS.navy}70` }}>
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10" style={{ backgroundColor: c.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold }} />
                  <img src={c.frameUrl} alt="Frame" className="w-full h-24 object-cover mb-3 border rounded" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }} />
                  <div className="space-y-2 relative z-10 text-xs">
                    <div style={{ color: WISE2_COLORS.neon_cyan }} className="font-bold">{c.jobId}</div>
                    <div style={{ color: WISE2_COLORS.text_muted }}>{c.notes}</div>
                    <div className="px-3 py-1 w-fit rounded text-xs font-bold" style={{ backgroundColor: c.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}30` : `${WISE2_COLORS.gold}30`, color: c.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold }}>{c.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === 'alerts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black mb-8 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>ALERTS ({alerts.length})</h2>
            <div className="space-y-3">
              {alerts.map((a) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 8 }} className="border-l-4 pl-4 py-3 rounded cursor-pointer relative overflow-hidden group" style={{ borderColor: a.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green, backgroundColor: `${WISE2_COLORS.navy}70` }}>
                  <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-10" style={{ backgroundColor: a.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green }} />
                  <div className="flex items-start justify-between relative z-10">
                    <div><div className="font-bold text-sm" style={{ color: WISE2_COLORS.neon_cyan }}>{a.title}</div><div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>{a.message}</div></div>
                    <motion.div className="text-xs font-bold px-3 py-1 rounded whitespace-nowrap ml-4" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ backgroundColor: a.severity === 'WARNING' ? `${WISE2_COLORS.gold}30` : `${WISE2_COLORS.neon_green}30`, color: a.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green }}>{a.severity}</motion.div>
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
