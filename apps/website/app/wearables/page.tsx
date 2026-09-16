'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, CheckCircle, Zap, Radio, TrendingUp, AlertTriangle, Activity, Gauge, Wifi, Battery, Signal, Play, Camera, Pause, RotateCcw, ThumbsUp, ThumbsDown, Clock, Download, Filter, AlertCircle } from 'lucide-react';

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

// Advanced trend chart with gradient
const AdvancedChart = ({ data, color, title }: any) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="w-full space-y-3">
      <div className="text-xs font-bold tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>
        {title}
      </div>
      <svg viewBox="0 0 400 100" className="w-full h-16" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {data.map((v, i) => {
          const y = 100 - ((v - min) / range) * 80 - 10;
          return (
            <circle key={i} cx={(i / (data.length - 1)) * 400} cy={y} r="2" fill={color} opacity="0.8" />
          );
        })}
        <polyline
          points={data.map((v, i) => `${(i / (data.length - 1)) * 400},${100 - ((v - min) / range) * 80}`).join(' ')}
          fill={`url(#grad-${title})`}
          stroke={color}
          strokeWidth="2"
          opacity="0.7"
        />
      </svg>
      <div className="flex justify-between text-xs" style={{ color: WISE2_COLORS.text_muted }}>
        <span>{Math.round(min)}</span>
        <span>{Math.round(max)}</span>
      </div>
    </div>
  );
};

// Heatmap cell for device health visualization
const HeatmapCell = ({ value, maxValue, label }: any) => {
  const intensity = value / maxValue;
  const hue = intensity * 120;
  const bgColor = `hsl(${hue}, 100%, 30%)`;

  return (
    <div
      className="p-2 rounded text-xs font-bold text-center cursor-pointer hover:scale-110 transition-transform"
      style={{
        backgroundColor: bgColor,
        color: intensity > 0.5 ? '#000' : '#fff',
        boxShadow: `0 0 8px ${bgColor}60`,
      }}
    >
      {label}
    </div>
  );
};

// Mini chart for analytics
const MiniChart = ({ data, color, height = 60 }: any) => {
  const max = Math.max(...data);
  const barWidth = 100 / data.length;

  return (
    <svg viewBox="0 0 100 100" className={`w-full`} style={{ height: `${height}px` }}>
      {data.map((value, i) => {
        const barHeight = (value / max) * 80;
        const x = i * barWidth + barWidth * 0.2;
        return (
          <rect
            key={i}
            x={x}
            y={100 - barHeight}
            width={barWidth * 0.6}
            height={barHeight}
            fill={color}
            opacity="0.7"
          />
        );
      })}
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
  const [analytics, setAnalytics] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    const eventInterval = setInterval(() => {
      setLiveEvents(prev => [
        generateRandomEvent(),
        ...prev.slice(0, 9)
      ]);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearInterval(eventInterval);
    };
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
      setAnalytics(generateMockAnalytics());
      setLoading(false);
    } catch (error) {
      setStats(generateMockStats());
      setCaptures(generateMockCaptures());
      setAlerts(generateMockAlerts());
      setAnalytics(generateMockAnalytics());
      setLoading(false);
    }
  }

  function generateMockStats() {
    return {
      stats: {
        totalCaptures: Math.floor(Math.random() * 100) + 300,
        pendingApprovals: Math.floor(Math.random() * 30) + 10,
        activeSessions: Math.floor(Math.random() * 10) + 5,
        connectedDevices: 5,
        systemHealth: Math.floor(Math.random() * 10) + 90,
        avgProcessTime: Math.floor(Math.random() * 50) + 15,
      },
    };
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

  function generateMockAnalytics() {
    return {
      hourly: [12, 18, 22, 15, 28, 32, 25, 18, 30, 24],
      daily: [45, 52, 48, 61, 55, 67, 59, 71, 64, 58],
      deviceHealth: [95, 88, 75, 92, 65],
      processingTime: [15, 18, 22, 19, 25, 20, 23, 21, 24, 19],
      byType: { image: 245, video: 82, audio: 20 },
      approvalRate: { approved: 234, pending: 23, rejected: 5 }
    };
  }

  function generateRandomEvent() {
    const events = [
      { type: 'CAPTURE', message: 'New frame captured by Unit-001', color: WISE2_COLORS.neon_cyan },
      { type: 'APPROVAL', message: 'Capture approved for JOB-HVAC-002', color: WISE2_COLORS.neon_green },
      { type: 'DEVICE', message: 'Unit-003 reconnected', color: WISE2_COLORS.neon_green },
      { type: 'WARNING', message: 'High error rate detected', color: WISE2_COLORS.orange },
      { type: 'COMMAND', message: 'Photo command sent to Unit-002', color: WISE2_COLORS.neon_cyan },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    return { ...event, id: Math.random(), time: new Date().toLocaleTimeString() };
  }

  const executeCommand = async (command: string, deviceId: string) => {
    setExecutingCommand(command);
    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCommandResult({ command, deviceId, status: 'success', timestamp: new Date() });
    setExecutingCommand(null);
    setTimeout(() => setCommandResult(null), 3000);
  };

  const approveCapture = async (captureId: string) => {
    // Simulate approval
    setCaptures(captures.map(c => c.id === captureId ? { ...c, status: 'APPROVED' } : c));
    setCommandResult({ command: 'approve', status: 'success', message: 'Capture approved' });
    setTimeout(() => setCommandResult(null), 2000);
  };

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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs sm:text-sm tracking-widest font-black" style={{ color: WISE2_COLORS.neon_cyan }}>◆ RAY-BAN PREMIUM</div>
              <div className="text-xs sm:text-sm mt-1 tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>INTELLIGENT COMMAND CENTER</div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg" style={{ backgroundColor: `${WISE2_COLORS.neon_green}20`, color: WISE2_COLORS.neon_green, border: `1px solid ${WISE2_COLORS.neon_green}50` }}><Download size={18} /></motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg" style={{ backgroundColor: `${WISE2_COLORS.neon_cyan}20`, color: WISE2_COLORS.neon_cyan, border: `1px solid ${WISE2_COLORS.neon_cyan}50` }}><Filter size={18} /></motion.button>
            </div>
          </div>
          <div className="flex gap-1 bg-black/60 border rounded overflow-x-auto pb-2" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30` }}>
            {['overview', 'captures', 'devices', 'analytics', 'intelligence'].map((t) => (<motion.button key={t} whileHover={{ scale: 1.05 }} onClick={() => setTab(t)} className={`px-2 sm:px-4 py-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${tab === t ? 'border-b-2' : 'opacity-40'}`} style={{ borderColor: tab === t ? WISE2_COLORS.neon_green : 'transparent', color: tab === t ? WISE2_COLORS.neon_green : WISE2_COLORS.text_muted }}>{t}</motion.button>))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 relative z-10">
        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Top metrics with enhanced stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'CAPTURES', value: stats.stats.totalCaptures, unit: '', icon: Eye, color: WISE2_COLORS.neon_green, trend: [20, 35, 28, 42, 38, 45, 52], change: '+12%' },
                { label: 'PENDING', value: stats.stats.pendingApprovals, unit: 'ITEMS', icon: AlertTriangle, color: WISE2_COLORS.gold, trend: [15, 18, 20, 19, 22, 24, 23], change: '-4%' },
                { label: 'ACTIVE', value: stats.stats.activeSessions, unit: 'LIVE', icon: Activity, color: WISE2_COLORS.neon_cyan, trend: [5, 6, 7, 8, 9, 8, 8], change: '+1' },
                { label: 'HEALTH', value: stats.stats.systemHealth, unit: '%', icon: Zap, color: WISE2_COLORS.neon_green, trend: [85, 88, 91, 89, 92, 94, 96], change: '+3%' },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} onMouseEnter={() => setHoveredCard(`metric-${idx}`)} onMouseLeave={() => setHoveredCard(null)} className="rounded-lg sm:rounded-2xl p-3 sm:p-6 border cursor-pointer relative overflow-hidden group transition-all" style={{ borderColor: hoveredCard === `metric-${idx}` ? `${metric.color}60` : `${metric.color}20`, backgroundColor: `${WISE2_COLORS.navy}70`, boxShadow: hoveredCard === `metric-${idx}` ? `0 30px 60px ${metric.color}25, 0 0 40px ${metric.color}15` : `0 8px 24px rgba(0,0,0,0.3)` }}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                            <Icon size={20} style={{ color: metric.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs tracking-widest font-bold" style={{ color: WISE2_COLORS.text_muted }}>{metric.label}</div>
                            <div className="text-xs mt-0.5" style={{ color: metric.color }}>{metric.change}</div>
                          </div>
                        </div>
                      </div>
                      <motion.div className="text-4xl font-black" style={{ color: metric.color }} animate={hoveredCard === `metric-${idx}` ? { scale: 1.1 } : { scale: 1 }}>
                        {metric.value}
                        <span className="text-xs ml-2" style={{ color: WISE2_COLORS.text_muted }}>{metric.unit}</span>
                      </motion.div>
                      <Sparkline data={metric.trend} color={metric.color} />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* System Status & Device Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { label: 'COVERAGE', value: 97, color: WISE2_COLORS.neon_green },
                { label: 'SYSTEM HEALTH', value: 100, color: WISE2_COLORS.neon_cyan },
                { label: 'APPROVAL RATE', value: 94, color: WISE2_COLORS.gold },
              ].map((metric, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.1 }} className="rounded-lg sm:rounded-2xl p-4 sm:p-8 border" style={{ borderColor: `${metric.color}30`, backgroundColor: `${WISE2_COLORS.navy}70`, boxShadow: `0 8px 24px rgba(0,0,0,0.3), 0 0 20px ${metric.color}10` }}>
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <CircularProgress value={metric.value} color={metric.color} size={140} thickness={6} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-black" style={{ color: metric.color }}>{metric.value}%</div>
                        <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>OPERATIONAL</div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs tracking-widest font-bold uppercase" style={{ color: WISE2_COLORS.text_muted }}>{metric.label}</div>
                      <motion.div className="text-xs mt-2" style={{ color: metric.color }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}>
                        ● LIVE
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Device Fleet Status */}
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: WISE2_COLORS.neon_cyan }}>DEVICE FLEET STATUS</h3>
                <p className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>Real-time Ray-Ban wearables health monitoring</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {[
                  { name: 'Unit-001', battery: 87, signal: 95, status: 'ACTIVE', temp: 42 },
                  { name: 'Unit-002', battery: 62, signal: 88, status: 'ACTIVE', temp: 45 },
                  { name: 'Unit-003', battery: 45, signal: 72, status: 'ACTIVE', temp: 48 },
                  { name: 'Unit-004', battery: 91, signal: 100, status: 'ACTIVE', temp: 40 },
                  { name: 'Unit-005', battery: 28, signal: 55, status: 'LOW', temp: 52 },
                ].map((device, idx) => {
                  const statusColor = device.status === 'ACTIVE' ? WISE2_COLORS.neon_green : WISE2_COLORS.orange;
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + idx * 0.05 }} className="rounded-lg sm:rounded-xl p-3 sm:p-4 border text-xs" style={{ borderColor: `${statusColor}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold" style={{ color: WISE2_COLORS.neon_cyan }}>{device.name}</div>
                          <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: WISE2_COLORS.text_muted }}>BATT</span>
                            <span style={{ color: WISE2_COLORS.neon_green }}>{device.battery}%</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ backgroundColor: `${WISE2_COLORS.neon_green}20` }}>
                            <motion.div className="h-full rounded-full" style={{ width: `${device.battery}%`, background: WISE2_COLORS.neon_green, boxShadow: `0 0 8px ${WISE2_COLORS.neon_green}` }} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: WISE2_COLORS.text_muted }}>SIGNAL</span>
                            <span style={{ color: WISE2_COLORS.neon_cyan }}>{device.signal}%</span>
                          </div>
                          <div className="h-1 rounded-full" style={{ backgroundColor: `${WISE2_COLORS.neon_cyan}20` }}>
                            <motion.div className="h-full rounded-full" style={{ width: `${device.signal}%`, background: WISE2_COLORS.neon_cyan }} />
                          </div>
                        </div>
                        <div className="text-xs text-center" style={{ color: WISE2_COLORS.gold }}>
                          {device.temp}°C
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CAPTURES - Approval Workflow */}
        {tab === 'captures' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>CAPTURE APPROVAL WORKFLOW</h2>
              <p className="text-xs mt-2" style={{ color: WISE2_COLORS.text_muted }}>Intelligent queue management with priority sorting</p>
            </div>

            {/* Approval Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg p-4 border" style={{ borderColor: `${WISE2_COLORS.gold}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <div className="text-xs tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>PENDING</div>
                <div className="text-3xl font-black mt-2" style={{ color: WISE2_COLORS.gold }}>23</div>
                <div className="text-xs mt-1" style={{ color: `${WISE2_COLORS.gold}80` }}>Avg: 8min</div>
              </div>
              <div className="rounded-lg p-4 border" style={{ borderColor: `${WISE2_COLORS.neon_green}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <div className="text-xs tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>APPROVED</div>
                <div className="text-3xl font-black mt-2" style={{ color: WISE2_COLORS.neon_green }}>234</div>
                <div className="text-xs mt-1" style={{ color: `${WISE2_COLORS.neon_green}80` }}>98% rate</div>
              </div>
              <div className="rounded-lg p-4 border" style={{ borderColor: `${WISE2_COLORS.red}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <div className="text-xs tracking-widest" style={{ color: WISE2_COLORS.text_muted }}>REJECTED</div>
                <div className="text-3xl font-black mt-2" style={{ color: WISE2_COLORS.red }}>5</div>
                <div className="text-xs mt-1" style={{ color: `${WISE2_COLORS.red}80` }}>2% rate</div>
              </div>
            </div>

            {/* Pending Captures */}
            <div className="space-y-4">
              {captures.filter(c => c.status === 'PENDING').map((c, idx) => (
                <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="rounded-lg p-4 sm:p-6 border" style={{ borderColor: `${WISE2_COLORS.gold}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                    <img src={c.frameUrl} alt="Capture" className="rounded-lg w-full h-32 sm:h-24 object-cover" />
                    <div>
                      <div className="font-bold text-sm" style={{ color: WISE2_COLORS.neon_cyan }}>{c.jobId}</div>
                      <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>{new Date(c.createdAt).toLocaleString()}</div>
                      <div className="text-xs mt-2">{c.notes}</div>
                    </div>
                    <div className="text-xs" style={{ color: WISE2_COLORS.text_muted }}>
                      <div className="font-bold mb-1">Contractor:</div>
                      <div>{c.contractorId}</div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button whileHover={{ scale: 1.05 }} onClick={() => approveCapture(c.id)} className="flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase" style={{ backgroundColor: `${WISE2_COLORS.neon_green}30`, color: WISE2_COLORS.neon_green, border: `1px solid ${WISE2_COLORS.neon_green}50` }}>
                        <CheckCircle size={16} className="inline mr-1" /> Approve
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} className="flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase" style={{ backgroundColor: `${WISE2_COLORS.red}30`, color: WISE2_COLORS.red, border: `1px solid ${WISE2_COLORS.red}50` }}>
                        <ThumbsDown size={16} className="inline mr-1" /> Reject
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* DEVICES - Device Command Center */}
        {tab === 'devices' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>DEVICE COMMAND CENTER</h2>
              <p className="text-xs mt-2" style={{ color: WISE2_COLORS.text_muted }}>Real-time remote device control and monitoring</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { name: 'Unit-001', contractor: 'John Smith', status: 'ACTIVE', commands: ['PHOTO', 'REC_START', 'REC_STOP', 'RESET'] },
                { name: 'Unit-002', contractor: 'Jane Doe', status: 'ACTIVE', commands: ['PHOTO', 'REC_START', 'REC_STOP', 'RESET'] },
                { name: 'Unit-003', contractor: 'Mike Johnson', status: 'ACTIVE', commands: ['PHOTO', 'REC_START', 'REC_STOP', 'RESET'] },
                { name: 'Unit-004', contractor: 'Sarah Williams', status: 'ACTIVE', commands: ['PHOTO', 'REC_START', 'REC_STOP', 'RESET'] },
              ].map((device, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="rounded-lg p-6 border" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg" style={{ color: WISE2_COLORS.neon_cyan }}>{device.name}</div>
                      <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>{device.contractor}</div>
                    </div>
                    <motion.div className="w-3 h-3 rounded-full" style={{ backgroundColor: WISE2_COLORS.neon_green }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {device.commands.map((cmd) => (
                      <motion.button
                        key={cmd}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-2 rounded-lg text-xs font-bold uppercase"
                        style={{
                          backgroundColor: `${WISE2_COLORS.neon_cyan}20`,
                          color: WISE2_COLORS.neon_cyan,
                          border: `1px solid ${WISE2_COLORS.neon_cyan}50`,
                        }}
                      >
                        {cmd}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ANALYTICS */}
        {tab === 'analytics' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>ADVANCED ANALYTICS</h2>
              <p className="text-xs mt-2" style={{ color: WISE2_COLORS.text_muted }}>Real-time performance metrics and trend analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-lg p-6 border" style={{ borderColor: `${WISE2_COLORS.neon_green}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <AdvancedChart data={analytics.hourly} color={WISE2_COLORS.neon_green} title="HOURLY TREND" />
              </div>
              <div className="rounded-lg p-6 border" style={{ borderColor: `${WISE2_COLORS.neon_cyan}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <AdvancedChart data={analytics.processingTime} color={WISE2_COLORS.neon_cyan} title="PROCESS TIME (ms)" />
              </div>
            </div>

            <div className="rounded-lg p-6 border" style={{ borderColor: `${WISE2_COLORS.gold}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
              <div className="mb-4 font-bold text-lg" style={{ color: WISE2_COLORS.neon_cyan }}>DEVICE HEALTH HEATMAP</div>
              <div className="grid grid-cols-5 gap-2">
                {['Unit-001', 'Unit-002', 'Unit-003', 'Unit-004', 'Unit-005'].map((unit, i) => (
                  <HeatmapCell key={unit} value={analytics.deviceHealth[i]} maxValue={100} label={unit.split('-')[1]} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* INTELLIGENCE - Real-time alerts and insights */}
        {tab === 'intelligence' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black uppercase" style={{ color: WISE2_COLORS.neon_cyan }}>INTELLIGENT INSIGHTS</h2>
              <p className="text-xs mt-2" style={{ color: WISE2_COLORS.text_muted }}>AI-powered anomaly detection and recommendations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alerts */}
              <div className="lg:col-span-2 rounded-lg p-6 border" style={{ borderColor: `${WISE2_COLORS.red}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <div className="mb-4 font-bold text-lg flex items-center gap-2" style={{ color: WISE2_COLORS.neon_cyan }}>
                  <AlertCircle size={20} /> ACTIVE ALERTS
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.map((alert, idx) => (
                    <motion.div key={alert.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 rounded-lg border-l-4" style={{ borderColor: alert.severity === 'CRITICAL' ? WISE2_COLORS.red : alert.severity === 'WARNING' ? WISE2_COLORS.orange : WISE2_COLORS.neon_cyan, backgroundColor: `${alert.severity === 'CRITICAL' ? WISE2_COLORS.red : alert.severity === 'WARNING' ? WISE2_COLORS.orange : WISE2_COLORS.neon_cyan}10` }}>
                      <div className="text-xs font-bold" style={{ color: alert.severity === 'CRITICAL' ? WISE2_COLORS.red : alert.severity === 'WARNING' ? WISE2_COLORS.orange : WISE2_COLORS.neon_cyan }}>
                        {alert.title}
                      </div>
                      <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>{alert.message}</div>
                      <div className="text-xs mt-1" style={{ color: WISE2_COLORS.text_muted }}>
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Live Activity Feed */}
              <div className="rounded-lg p-6 border" style={{ borderColor: `${WISE2_COLORS.neon_green}30`, backgroundColor: `${WISE2_COLORS.navy}60` }}>
                <div className="mb-4 font-bold text-lg flex items-center gap-2" style={{ color: WISE2_COLORS.neon_cyan }}>
                  <Activity size={20} /> LIVE ACTIVITY
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {liveEvents.slice(0, 10).map((event, idx) => (
                    <motion.div key={event.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs p-2 rounded" style={{ backgroundColor: `${event.color}15`, borderLeft: `2px solid ${event.color}` }}>
                      <div style={{ color: event.color }} className="font-bold">{event.type}</div>
                      <div style={{ color: WISE2_COLORS.text_muted }} className="text-xs">{event.message}</div>
                      <div style={{ color: WISE2_COLORS.text_muted }} className="text-xs">{event.time}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
