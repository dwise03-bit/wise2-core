'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Zap, Radio, TrendingUp, AlertTriangle, Activity, Gauge, Wifi, Battery, Signal } from 'lucide-react';

const WISE2_COLORS = {
  dark: '#050607',
  navy: '#0a0f1a',
  neon_green: '#00FF7F',
  neon_cyan: '#00D9FF',
  gold: '#C4A369',
  white: '#D1D5DB',
  text_muted: '#6B7280',
  accent_purple: '#8B5CF6',
  red: '#FF4444',
  orange: '#FF8C00',
};

// Circular progress component
const CircularProgress = ({ value, color, size = 120, thickness = 8 }: any) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={`${color}20`} strokeWidth={thickness} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        strokeLinecap="round"
        filter={`drop-shadow(0 0 8px ${color}60)`}
      />
    </svg>
  );
};

// Sparkline chart
const Sparkline = ({ data, color }: any) => {
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="h-12" preserveAspectRatio="none">
      <polyline points={points} fill={`${color}15`} stroke={color} strokeWidth="2" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: WISE2_COLORS.dark }}><motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-center"><div className="text-6xl font-black mb-4" style={{ color: WISE2_COLORS.neon_cyan }}>RAY-BAN</div><div className="text-sm tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>COMMAND CENTER...</div></motion.div></div>;
  }

  return (
    <div style={{ backgroundColor: WISE2_COLORS.dark, color: WISE2_COLORS.white }} className="min-h-screen font-mono relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `linear-gradient(0deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px), linear-gradient(90deg, ${WISE2_COLORS.neon_cyan}30 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        <svg className="absolute inset-0 w-full h-full opacity-8" style={{ mixBlendMode: 'screen' }}>
          <defs>
            <pattern id="circuit" x="100" y="100" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill={WISE2_COLORS.neon_green} opacity="0.3" />
              <circle cx="90" cy="90" r="2" fill={WISE2_COLORS.neon_cyan} opacity="0.3" />
              <line x1="10" y1="10" x2="90" y2="90" stroke={WISE2_COLORS.neon_green} strokeWidth="0.5" opacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
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
            {/* Top metrics row */}
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'TOTAL CAPTURES', value: 347, unit: '', icon: Eye, color: WISE2_COLORS.neon_green, trend: [20, 35, 28, 42, 38, 45, 52], badge: '+12%' },
                { label: 'PENDING', value: 23, unit: 'ITEMS', icon: AlertTriangle, color: WISE2_COLORS.gold, trend: [15, 18, 20, 19, 22, 24, 23], badge: '4 URGENT' },
                { label: 'ACTIVE', value: 8, unit: 'SESSIONS', icon: Activity, color: WISE2_COLORS.neon_cyan, trend: [5, 6, 7, 8, 9, 8, 8], badge: 'LIVE' },
                { label: 'CONNECTED', value: 5, unit: 'DEVICES', icon: Radio, color: WISE2_COLORS.neon_green, trend: [4, 5, 5, 5, 5, 5, 5], badge: 'ONLINE' },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onMouseEnter={() => setHoveredCard(`metric-${idx}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="rounded-2xl p-6 border cursor-pointer relative overflow-hidden group transition-all"
                    style={{
                      borderColor: hoveredCard === `metric-${idx}` ? `${metric.color}60` : `${metric.color}20`,
                      backgroundColor: `${WISE2_COLORS.navy}70`,
                      boxShadow: hoveredCard === `metric-${idx}` ? `0 30px 60px ${metric.color}25, 0 0 40px ${metric.color}15` : `0 8px 24px rgba(0,0,0,0.3)`,
                    }}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                            <Icon size={20} style={{ color: metric.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs tracking-widest font-bold" style={{ color: WISE2_COLORS.text_muted }}>{metric.label}</div>
                            <div className="text-xs mt-0.5" style={{ color: metric.color }}>{metric.badge}</div>
                          </div>
                        </div>
                      </div>

                      {/* Value */}
                      <motion.div className="text-4xl font-black" style={{ color: metric.color }} animate={hoveredCard === `metric-${idx}` ? { scale: 1.1 } : { scale: 1 }}>
                        {metric.value}
                        <span className="text-xs ml-2" style={{ color: WISE2_COLORS.text_muted }}>{metric.unit}</span>
                      </motion.div>

                      {/* Sparkline */}
                      <Sparkline data={metric.trend} color={metric.color} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* System Status Grid */}
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'COVERAGE', value: 97, color: WISE2_COLORS.neon_green },
                { label: 'SYSTEM HEALTH', value: 100, color: WISE2_COLORS.neon_cyan },
                { label: 'APPROVAL RATE', value: 94, color: WISE2_COLORS.gold },
              ].map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="rounded-2xl p-8 border"
                  style={{
                    borderColor: `${metric.color}30`,
                    backgroundColor: `${WISE2_COLORS.navy}70`,
                    boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${metric.color}10`,
                  }}
                >
                  <div className="flex flex-col items-center gap-6">
                    {/* Circular progress */}
                    <div className="relative">
                      <CircularProgress value={metric.value} color={metric.color} size={140} thickness={6} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-black" style={{ color: metric.color }}>{metric.value}%</div>
                        <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>OPERATIONAL</div>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <div className="text-xs tracking-widest font-bold uppercase" style={{ color: WISE2_COLORS.text_muted }}>{metric.label}</div>
                      <motion.div
                        className="text-xs mt-2"
                        style={{ color: metric.color }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        ● LIVE
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Device Status Grid */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: WISE2_COLORS.neon_cyan }}>DEVICE STATUS</h3>
                <p className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>Ray-Ban wearables fleet health</p>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {[
                  { name: 'Unit-001', battery: 87, signal: 95, status: 'ACTIVE' },
                  { name: 'Unit-002', battery: 62, signal: 88, status: 'ACTIVE' },
                  { name: 'Unit-003', battery: 45, signal: 72, status: 'ACTIVE' },
                  { name: 'Unit-004', battery: 91, signal: 100, status: 'ACTIVE' },
                  { name: 'Unit-005', battery: 28, signal: 55, status: 'LOW' },
                ].map((device, idx) => {
                  const statusColor = device.status === 'ACTIVE' ? WISE2_COLORS.neon_green : WISE2_COLORS.orange;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + idx * 0.05 }}
                      className="rounded-xl p-4 border"
                      style={{
                        borderColor: `${statusColor}30`,
                        backgroundColor: `${WISE2_COLORS.navy}60`,
                      }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold" style={{ color: WISE2_COLORS.neon_cyan }}>{device.name}</div>
                          <motion.div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: statusColor }}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>

                        {/* Battery */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: WISE2_COLORS.text_muted }}>BATTERY</span>
                            <span style={{ color: WISE2_COLORS.neon_green }}>{device.battery}%</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ backgroundColor: `${WISE2_COLORS.neon_green}20` }}>
                            <motion.div className="h-full rounded-full" style={{ width: `${device.battery}%`, background: WISE2_COLORS.neon_green, boxShadow: `0 0 8px ${WISE2_COLORS.neon_green}` }} />
                          </div>
                        </div>

                        {/* Signal */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: WISE2_COLORS.text_muted }}>SIGNAL</span>
                            <span style={{ color: WISE2_COLORS.neon_cyan }}>{device.signal}%</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ backgroundColor: `${WISE2_COLORS.neon_cyan}20` }}>
                            <motion.div className="h-full rounded-full" style={{ width: `${device.signal}%`, background: WISE2_COLORS.neon_cyan }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === 'captures' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black mb-8 uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>CAPTURES ({captures.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {captures.map((c, idx) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ y: -12, scale: 1.05 }} className="border rounded-xl p-5 cursor-pointer relative overflow-hidden group backdrop-blur-sm" style={{ borderColor: c.status === 'APPROVED' ? `${WISE2_COLORS.neon_green}40` : `${WISE2_COLORS.gold}40`, backgroundColor: `${WISE2_COLORS.navy}60`, boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)` }}>
                  <img src={c.frameUrl} alt="Frame" className="w-full h-32 object-cover mb-4 rounded-lg border" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }} />
                  <div className="space-y-3">
                    <div><div className="font-bold text-sm" style={{ color: WISE2_COLORS.neon_cyan }}>{c.jobId}</div><div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></div>
                    <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>{c.notes}</div>
                    <div className="flex items-center gap-2 pt-2 border-t" style={{ borderColor: `${WISE2_COLORS.text_muted}20` }}><motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} /><div className="text-xs font-bold flex-1" style={{ color: c.status === 'APPROVED' ? WISE2_COLORS.neon_green : WISE2_COLORS.gold }}>{c.status}</div></div>
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
              {alerts.map((a, idx) => {
                const color = a.severity === 'WARNING' ? WISE2_COLORS.gold : WISE2_COLORS.neon_green;
                const Icon = a.severity === 'WARNING' ? AlertTriangle : CheckCircle;
                return (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ x: 8 }} className="border-l-4 rounded-r-lg pl-5 pr-4 py-4 cursor-pointer relative overflow-hidden" style={{ borderColor: color, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                    <div className="flex items-start gap-4">
                      <div className="pt-1"><motion.div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><Icon size={18} style={{ color }} /></motion.div></div>
                      <div className="flex-1"><div className="font-bold text-sm" style={{ color: WISE2_COLORS.neon_cyan }}>{a.title}</div><div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>{a.message}</div></div>
                      <motion.div className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ backgroundColor: `${color}25`, color }}>{a.severity}</motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
