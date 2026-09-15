'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Zap, Radio, TrendingUp, AlertTriangle, Activity, Gauge } from 'lucide-react';

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
  const [cardRotations, setCardRotations] = useState<{ [key: string]: { rotX: number; rotY: number } }>({});

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
      { id: 'cap-001', jobId: 'JOB-HVAC-001', contractorId: 'john-001', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3ECompressor%3C/text%3E%3C/svg%3E', status: 'PENDING', createdAt: new Date(Date.now() - 300000).toISOString(), notes: 'Critical diagnostic' },
      { id: 'cap-002', jobId: 'JOB-HVAC-002', contractorId: 'jane-002', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EFrigerant%3C/text%3E%3C/svg%3E', status: 'APPROVED', createdAt: new Date(Date.now() - 600000).toISOString(), notes: 'Verified' },
      { id: 'cap-003', jobId: 'JOB-HVAC-003', contractorId: 'mike-003', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EThermostat%3C/text%3E%3C/svg%3E', status: 'PENDING', createdAt: new Date(Date.now() - 900000).toISOString(), notes: 'Installation' },
      { id: 'cap-004', jobId: 'JOB-ELEC-001', contractorId: 'john-001', frameUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23E5E7EB" width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%236B7280" font-size="14"%3EElectrical%3C/text%3E%3C/svg%3E', status: 'APPROVED', createdAt: new Date(Date.now() - 1200000).toISOString(), notes: 'Panel upgrade' },
    ];
  }

  function generateMockAlerts() {
    return [
      { id: 'alert-001', title: 'Frame Captured', message: 'John Smith submitted frame for JOB-HVAC-001', severity: 'INFO', createdAt: new Date(Date.now() - 120000).toISOString() },
      { id: 'alert-002', title: 'Approval Complete', message: 'Frame approved for JOB-HVAC-002', severity: 'INFO', createdAt: new Date(Date.now() - 300000).toISOString() },
      { id: 'alert-003', title: 'Pending Review', message: '23 frames awaiting - 4 urgent', severity: 'WARNING', createdAt: new Date(Date.now() - 600000).toISOString() },
      { id: 'alert-004', title: 'Device Online', message: 'Ray-Ban Meta Gen 2 back online', severity: 'INFO', createdAt: new Date(Date.now() - 1800000).toISOString() },
    ];
  }

  const Card3D = ({ children, cardId, index = 0, span }: any) => {
    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotX = (y - 0.5) * 8;
      const rotY = (x - 0.5) * -8;

      setCardRotations(prev => ({ ...prev, [cardId]: { rotX, rotY } }));
    };

    const handleMouseLeave = () => {
      setCardRotations(prev => ({ ...prev, [cardId]: { rotX: 0, rotY: 0 } }));
    };

    const rotation = cardRotations[cardId] || { rotX: 0, rotY: 0 };

    return (
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setHoveredCard(cardId)}
        className={`${span} rounded-2xl p-8 border relative overflow-hidden cursor-pointer group`}
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          rotateX: rotation.rotX,
          rotateY: rotation.rotY,
          y: hoveredCard === cardId ? -8 : 0,
        }}
        style={{
          borderColor: `${WISE2_COLORS.neon_cyan}30`,
          backgroundColor: `${WISE2_COLORS.navy}90`,
          perspective: '800px',
          transformStyle: 'preserve-3d',
          willChange: 'transform, box-shadow',
          maxHeight: '100%',
          boxShadow: hoveredCard === cardId
            ? `0 40px 80px rgba(0, 217, 255, 0.3), 0 0 40px rgba(0, 255, 127, 0.2), inset 0 1px 0 rgba(0, 255, 127, 0.15)`
            : `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 217, 255, 0.08)`,
        }}
        transition={{
          default: { duration: 0.2 },
          opacity: { delay: index * 0.08, duration: 0.6, ease: 'easeOut' }
        }}
      >

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: WISE2_COLORS.dark }}><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-center"><div className="text-6xl font-black mb-4" style={{ color: WISE2_COLORS.neon_cyan }}>RAY-BAN</div><div className="text-sm tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>3D COMMAND...</div></motion.div></div>;
  }

  return (
    <div style={{ backgroundColor: WISE2_COLORS.dark, color: WISE2_COLORS.white }} className="min-h-screen font-mono relative overflow-hidden"
      // @ts-ignore
      style={{ perspective: '1000px' }}>
      {/* Professional Background Graphics */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `linear-gradient(0deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px), linear-gradient(90deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

        {/* Circuit pattern SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-8" style={{ mixBlendMode: 'screen' }}>
          <defs>
            <pattern id="circuit" x="100" y="100" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill={WISE2_COLORS.neon_green} opacity="0.3" />
              <circle cx="90" cy="90" r="2" fill={WISE2_COLORS.neon_cyan} opacity="0.3" />
              <line x1="10" y1="10" x2="90" y2="90" stroke={WISE2_COLORS.neon_green} strokeWidth="0.5" opacity="0.15" />
              <circle cx="50" cy="50" r="1.5" fill={WISE2_COLORS.gold} opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        {/* Animated accent lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-10" style={{ pointerEvents: 'none' }}>
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke={WISE2_COLORS.neon_cyan} strokeWidth="1" strokeDasharray="10,10" opacity="0.1" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke={WISE2_COLORS.neon_green} strokeWidth="1" strokeDasharray="10,10" opacity="0.1" />
        </svg>

        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-transparent" style={{
          background: `radial-gradient(ellipse at 50% 0%, ${WISE2_COLORS.neon_cyan}10, transparent 50%)`
        }} />
      </div>

      {/* Header */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="relative z-50 border-b sticky top-0" style={{ borderColor: `${WISE2_COLORS.neon_cyan}20`, backgroundColor: `${WISE2_COLORS.navy}98`, backdropFilter: 'blur(30px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div><div className="text-sm tracking-widest font-black" style={{ color: WISE2_COLORS.neon_cyan }}>◆ RAY-BAN WEARABLES</div><div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>3D COMMAND CENTER</div></div>
          <div className="flex gap-1 bg-black/60 border rounded" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
            {['overview', 'captures', 'alerts'].map((t) => (<motion.button key={t} whileHover={{ scale: 1.05 }} onClick={() => setTab(t)} className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${tab === t ? 'border-b-2' : 'opacity-40'}`} style={{ borderColor: tab === t ? WISE2_COLORS.neon_green : 'transparent', color: tab === t ? WISE2_COLORS.neon_green : WISE2_COLORS.text_muted }}>{t}</motion.button>))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-6 grid-rows-8 gap-4 auto-rows-[150px]" style={{ perspective: '1200px' }}>
              {/* Hero Card - 3D */}
              <Card3D cardId="hero" index={0} span="col-span-3 row-span-3">
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <motion.div animate={{ scale: hoveredCard === 'hero' ? 1.15 : 1 }} className="text-7xl font-black mb-2" style={{ color: WISE2_COLORS.neon_green }}>347</motion.div>
                    <div className="text-sm tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>TOTAL CAPTURES</div>
                  </div>
                  <motion.div className="h-1" animate={hoveredCard === 'hero' ? { width: '100%' } : { width: '40%' }} style={{ backgroundColor: WISE2_COLORS.neon_green }} transition={{ duration: 0.5 }} />
                </div>
              </Card3D>

              {/* Metric Cards */}
              {[
                { label: 'PENDING', value: stats.stats.pendingApprovals, icon: AlertTriangle, color: WISE2_COLORS.gold, span: 'col-span-3 row-span-2', maxValue: 50 },
                { label: 'ACTIVE', value: stats.stats.activeSessions, icon: Activity, color: WISE2_COLORS.neon_green, span: 'col-span-2 row-span-2', maxValue: 20 },
                { label: 'CONNECTED', value: stats.stats.connectedDevices, icon: Radio, color: WISE2_COLORS.neon_cyan, span: 'col-span-2 row-span-2', maxValue: 10 },
              ].map((m, i) => {
                const Icon = m.icon;
                const percentage = (m.value / m.maxValue) * 100;
                return (
                  <Card3D key={i} cardId={`metric-${i}`} index={i + 1} span={m.span}>
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ rotate: hoveredCard === `metric-${i}` ? 360 : 0 }} transition={{ duration: 0.8 }}>
                            <Icon size={16} style={{ color: m.color }} />
                          </motion.div>
                          <span className="text-xs tracking-widest font-bold" style={{ color: WISE2_COLORS.text_muted }}>{m.label}</span>
                        </div>
                        {/* Status indicator */}
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                      <div>
                        <motion.div className="text-4xl font-black mb-2" style={{ color: m.color }} animate={hoveredCard === `metric-${i}` ? { scale: 1.2 } : { scale: 1 }}>{m.value}</motion.div>
                        {/* Progress bar */}
                        <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${m.color}80, ${m.color}20)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card3D>
                );
              })}

              {/* Live Readout */}
              <Card3D cardId="live" index={4} span="col-span-3 row-span-3">
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between"><div className="text-xs font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_green }}>■ 3D LIVE</div><motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full" style={{ backgroundColor: WISE2_COLORS.neon_green }} /></div>
                  <div className="space-y-3">
                    {[{ label: 'COVERAGE', value: '97%', color: WISE2_COLORS.neon_green }, { label: 'HEALTH', value: '100%', color: WISE2_COLORS.neon_cyan }, { label: 'APPROVAL', value: '94%', color: WISE2_COLORS.gold }].map((m) => (<div key={m.label}><div className="text-xs tracking-widest mb-1" style={{ color: WISE2_COLORS.text_muted }}>{m.label}</div><motion.div className="text-2xl font-black" style={{ color: m.color }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}>{m.value}</motion.div></div>))}
                  </div>
                </div>
              </Card3D>

              {/* Chart */}
              <Card3D cardId="chart" index={5} span="col-span-3 row-span-6">
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} style={{ color: WISE2_COLORS.neon_cyan }} /><span className="text-xs font-bold uppercase tracking-widest" style={{ color: WISE2_COLORS.neon_cyan }}>3D TREND</span></div>
                    {/* SVG Gradient Background */}
                    <svg className="absolute inset-0 w-full h-full opacity-10" style={{ pointerEvents: 'none' }} viewBox="0 0 100 100">
                      <defs>
                        <linearGradient id="chartGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor={WISE2_COLORS.neon_green} />
                          <stop offset="100%" stopColor={WISE2_COLORS.neon_cyan} />
                        </linearGradient>
                      </defs>
                      <path d="M 0 80 L 14 60 L 28 65 L 42 50 L 56 45 L 70 55 L 84 40 L 100 35" fill="none" stroke="url(#chartGrad)" strokeWidth="2" />
                    </svg>
                  </div>

                  <div className="flex-1 flex items-end justify-around gap-1 mb-4 relative">
                    {[45, 32, 52, 38, 61, 44, 55].map((v, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 group"
                        initial={{ height: 0, rotateX: -90 }}
                        animate={{ height: `${(v / 61) * 100}%`, rotateX: hoveredCard === 'chart' ? 0 : -90 }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.8 }}
                        whileHover={{ scale: 1.15, rotateX: 0 }}
                        style={{
                          background: `linear-gradient(180deg, ${WISE2_COLORS.neon_green}, ${WISE2_COLORS.neon_cyan})`,
                          boxShadow: `0 20px 40px ${WISE2_COLORS.neon_green}, inset 0 1px 0 rgba(0,255,127,0.3)`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transformStyle: 'preserve-3d',
                          position: 'relative'
                        }}
                      >
                        {/* Value label on hover */}
                        <motion.div
                          className="text-xs font-bold opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                          style={{ color: WISE2_COLORS.neon_green }}
                        >
                          {v}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart stats */}
                  <div className="space-y-2">
                    <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>DAILY AVG: <span style={{ color: WISE2_COLORS.neon_green, fontWeight: 'bold' }}>46.9</span> captures</div>
                    <div className="h-1 bg-black/50 rounded" style={{ overflow: 'hidden' }}>
                      <motion.div
                        className="h-full rounded"
                        style={{ background: `linear-gradient(90deg, ${WISE2_COLORS.neon_green}, ${WISE2_COLORS.neon_cyan})` }}
                        initial={{ width: 0 }}
                        animate={{ width: '75%' }}
                        transition={{ delay: 1, duration: 1 }}
                      />
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>
          </div>
        )}

        {tab === 'captures' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black mb-8 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>CAPTURES ({captures.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {captures.map((c) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -12, scale: 1.08 }} className="border rounded-lg p-4 cursor-pointer relative overflow-hidden group" style={{ borderColor: c.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}60` : `${WISE2_COLORS.gold}60`, backgroundColor: `${WISE2_COLORS.navy}70`, boxShadow: `0 20px 50px rgba(0, 0, 0, 0.4)` }}>
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
                <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ x: 8, scale: 1.02 }} className="border-l-4 pl-4 py-3 rounded cursor-pointer relative overflow-hidden group" style={{ borderColor: a.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green, backgroundColor: `${WISE2_COLORS.navy}70`, boxShadow: `0 10px 30px rgba(0, 0, 0, 0.3)` }}>
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
