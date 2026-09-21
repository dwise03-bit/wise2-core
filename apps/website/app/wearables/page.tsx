'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Radio, Activity, Zap, AlertTriangle, Download, Filter, AlertCircle, Wifi, Battery, Smartphone, Headphones, Cpu, Glasses, Mic, Camera, Database, Cloud, Smartphone as Phone, Radio as Antenna, TrendingUp, BarChart3, Clock, Gauge } from 'lucide-react';

const WISE2 = {
  dark: '#050607',
  navy: '#0a0f1a',
  cyan: '#00D9FF',
  green: '#00FF7F',
  gold: '#C4A369',
  red: '#FF4444',
  orange: '#FF8C00',
  text: '#D1D5DB',
  muted: '#6B7280',
};

// Reusable telemetry indicator
const TelemetryDot = ({ status = 'online', label }: any) => {
  const color = status === 'online' ? WISE2.green : status === 'loading' ? WISE2.orange : WISE2.red;
  return (
    <motion.div className="flex items-center gap-2">
      <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      <span className="text-xs" style={{ color }}>{label}</span>
    </motion.div>
  );
};

// Architecture flow visualization
const ArchitectureFlow = () => {
  const flow = [
    { icon: Glasses, label: 'RAY-BAN META', color: WISE2.cyan },
    { icon: Smartphone, label: 'PHONE BRIDGE', color: WISE2.green },
    { icon: Cpu, label: 'WISE² EDGE', color: WISE2.gold },
    { icon: Database, label: 'CONTEXT ENGINE', color: WISE2.cyan },
    { icon: Cloud, label: 'COMMAND CENTER', color: WISE2.green },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-widest mb-2" style={{ color: WISE2.cyan }}>
          WEARABLE INTELLIGENCE
        </h2>
        <p className="text-sm" style={{ color: WISE2.muted }}>SEE IT. HEAR IT. CAPTURE IT. COMMAND IT.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
        {flow.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-lg border"
                style={{ borderColor: `${item.color}50`, backgroundColor: `${WISE2.navy}70` }}
              >
                <Icon size={24} style={{ color: item.color }} />
              </motion.div>
              <div className="text-xs font-bold tracking-wider text-center" style={{ color: item.color }}>
                {item.label}
              </div>
              {idx < flow.length - 1 && (
                <div className="hidden sm:block w-8 h-0.5 absolute" style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Device status card
const DeviceCard = ({ device }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-4 border"
      style={{ borderColor: `${WISE2.green}30`, backgroundColor: `${WISE2.navy}60` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="font-bold text-sm" style={{ color: WISE2.cyan }}>{device.name}</div>
        <motion.div className="w-2 h-2 rounded-full" style={{ backgroundColor: WISE2.green }} animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      </div>
      <div className="space-y-2 text-xs">
        {device.status.map((s: any, i: number) => (
          <div key={i} className="flex justify-between" style={{ color: WISE2.muted }}>
            <span>{s.label}</span>
            <span style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// HVAC Field Mode section
const HVACFieldMode = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black uppercase tracking-wider mb-2" style={{ color: WISE2.cyan }}>HVAC FIELD MODE</h3>
        <p className="text-xs" style={{ color: WISE2.muted }}>Wearable-to-work-order intelligence</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'EQUIPMENT ID', value: 'RTU-03', status: 'SCANNED' },
          { label: 'MODEL', value: 'Carrier 50XC', status: 'FOUND' },
          { label: 'SERVICE HISTORY', value: '12 records', status: 'LOADED' },
          { label: 'WORK ORDER', value: 'WO-2024-891', status: 'ACTIVE' },
        ].map((item, i) => (
          <div key={i} className="rounded-lg p-4 border" style={{ borderColor: `${WISE2.green}30`, backgroundColor: `${WISE2.navy}60` }}>
            <div className="text-xs" style={{ color: WISE2.muted }}>{item.label}</div>
            <div className="font-bold text-sm mt-1" style={{ color: WISE2.green }}>{item.value}</div>
            <div className="text-xs mt-2" style={{ color: WISE2.gold }}>{item.status}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg p-4 border" style={{ borderColor: `${WISE2.cyan}30`, backgroundColor: `${WISE2.navy}70` }}>
        <div className="text-xs font-bold mb-3" style={{ color: WISE2.cyan }}>AI FIELD ACTIONS</div>
        <div className="grid grid-cols-2 gap-2">
          {['ANALYZE', 'CAPTURE', 'DIAGNOSE', 'NOTE'].map((action) => (
            <motion.button key={action} whileHover={{ scale: 1.05 }} className="px-3 py-2 rounded text-xs font-bold uppercase" style={{ backgroundColor: `${WISE2.cyan}20`, color: WISE2.cyan, border: `1px solid ${WISE2.cyan}50` }}>
              {action}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Capture pipeline
const CapturePipeline = () => {
  const stages = ['CAPTURE', 'CONSENT', 'REDACT', 'TAG', 'TRAIN', 'KNOWLEDGE'];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black uppercase tracking-wider mb-2" style={{ color: WISE2.cyan }}>CAPTURE → KNOWLEDGE</h3>
        <p className="text-xs" style={{ color: WISE2.muted }}>Field insights enter WISE² Second Brain</p>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-4">
        {stages.map((stage, i) => (
          <motion.div
            key={stage}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 rounded-lg px-4 py-3 border text-center min-w-24"
            style={{ borderColor: `${WISE2.green}50`, backgroundColor: `${WISE2.navy}70` }}
          >
            <div className="text-xs font-bold" style={{ color: WISE2.green }}>{stage}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-lg p-4 border grid grid-cols-2 sm:grid-cols-3 gap-4" style={{ borderColor: `${WISE2.gold}30`, backgroundColor: `${WISE2.navy}60` }}>
        {['VIDEO', 'AUDIO', 'NOTES', 'PHOTO', 'CONSENT', 'PRIVACY'].map((type) => (
          <div key={type} className="text-center">
            <div className="text-xs" style={{ color: WISE2.muted }}>{type}</div>
            <div className="text-xs font-bold mt-1" style={{ color: WISE2.gold }}>✓</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Device ecosystem
const DeviceEcosystem = () => {
  const devices = [
    { name: 'RAY-BAN META', role: 'Wearable', connection: 'Bluetooth', status: 'ONLINE' },
    { name: 'IPHONE / ANDROID', role: 'Bridge', connection: 'BLE/WiFi', status: 'ONLINE' },
    { name: 'POCKET NODE', role: 'Edge', connection: 'WiFi', status: 'ONLINE' },
    { name: 'META QUEST 3S', role: 'XR Interface', connection: 'WiFi', status: 'BETA' },
    { name: 'HVAC SENSORS', role: 'Field', connection: 'BLE', status: 'ONLINE' },
    { name: 'WISE² COMMAND', role: 'Control', connection: 'API', status: 'LIVE' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black uppercase tracking-wider mb-2" style={{ color: WISE2.cyan }}>DEVICE ECOSYSTEM</h3>
        <p className="text-xs" style={{ color: WISE2.muted }}>Connected intelligence layer</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {devices.map((d) => (
          <div key={d.name} className="rounded-lg p-3 border text-xs" style={{ borderColor: `${WISE2.cyan}30`, backgroundColor: `${WISE2.navy}60` }}>
            <div className="flex justify-between items-start">
              <div className="font-bold" style={{ color: WISE2.cyan }}>{d.name}</div>
              <div style={{ color: d.status === 'ONLINE' ? WISE2.green : WISE2.orange }}>{d.status}</div>
            </div>
            <div className="mt-2 space-y-1" style={{ color: WISE2.muted }}>
              <div>{d.role}</div>
              <div>{d.connection}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Status panel
const StatusPanel = () => {
  return (
    <div className="rounded-lg p-4 border" style={{ borderColor: `${WISE2.green}30`, backgroundColor: `${WISE2.navy}70` }}>
      <div className="text-xs font-bold mb-3 tracking-wider" style={{ color: WISE2.cyan }}>SYSTEM STATUS</div>
      <div className="space-y-2">
        <TelemetryDot status="online" label="WEARABLE CONNECTED" />
        <TelemetryDot status="online" label="AI ONLINE" />
        <TelemetryDot status="online" label="CAMERA READY" />
        <TelemetryDot status="online" label="VOICE READY" />
        <TelemetryDot status="online" label="FIELD SYNC" />
      </div>
    </div>
  );
};

// Live Activity Feed
const LiveActivityFeed = () => {
  const activities = [
    { time: '2m ago', event: 'CAMERA ACTIVATED', device: 'RAY-BAN META', status: 'success' },
    { time: '5m ago', event: 'SYNC COMPLETED', device: 'POCKET NODE', status: 'success' },
    { time: '8m ago', event: 'BATTERY LOW', device: 'HVAC SENSOR', status: 'warning' },
    { time: '12m ago', event: 'FIELD CAPTURE', device: 'RAY-BAN META', status: 'success' },
    { time: '15m ago', event: 'CONNECTION RESTORED', device: 'PHONE BRIDGE', status: 'success' },
  ];

  return (
    <div className="rounded-lg p-4 border space-y-3" style={{ borderColor: `${WISE2.cyan}30`, backgroundColor: `${WISE2.navy}60` }}>
      <div className="flex items-center gap-2">
        <Clock size={16} style={{ color: WISE2.cyan }} />
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: WISE2.cyan }}>LIVE ACTIVITY</h3>
      </div>
      <div className="space-y-2">
        {activities.map((activity, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 text-xs border-l-2 pl-3" style={{ borderColor: activity.status === 'success' ? WISE2.green : WISE2.orange, color: WISE2.muted }}>
            <div className="flex-1">
              <div style={{ color: activity.status === 'success' ? WISE2.green : WISE2.orange }}>{activity.event}</div>
              <div className="text-xs" style={{ color: WISE2.muted }}>{activity.device}</div>
            </div>
            <div className="text-xs">{activity.time}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Advanced Analytics
const AdvancedAnalytics = () => {
  const metrics = [
    { label: 'Capture Rate', value: '94%', trend: '↑', color: WISE2.green },
    { label: 'Avg Latency', value: '24ms', trend: '↓', color: WISE2.green },
    { label: 'Data Quality', value: '98.7%', trend: '↑', color: WISE2.green },
    { label: 'Active Devices', value: '1,247', trend: '↑', color: WISE2.cyan },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} style={{ color: WISE2.cyan }} />
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: WISE2.cyan }}>PERFORMANCE METRICS</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {metrics.map((metric, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg p-3 border" style={{ borderColor: `${metric.color}30`, backgroundColor: `${WISE2.navy}60` }}>
            <div className="text-xs mb-1" style={{ color: WISE2.muted }}>{metric.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-sm font-bold" style={{ color: metric.color }}>{metric.value}</div>
              <div className="text-xs" style={{ color: metric.color }}>{metric.trend}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Device Health Heatmap
const DeviceHealthHeatmap = () => {
  const devices = ['RAY-BAN', 'PHONE', 'EDGE', 'SENSORS', 'QUEST'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);
  const getHealthColor = (value: number) => {
    if (value >= 90) return WISE2.green;
    if (value >= 70) return WISE2.gold;
    return WISE2.red;
  };

  return (
    <div className="rounded-lg p-4 border" style={{ borderColor: `${WISE2.gold}30`, backgroundColor: `${WISE2.navy}60` }}>
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={16} style={{ color: WISE2.gold }} />
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: WISE2.gold }}>DEVICE HEALTH (24H)</h3>
      </div>
      <div className="overflow-x-auto">
        <div className="space-y-2 pb-2">
          {devices.map((device) => (
            <div key={device} className="flex items-center gap-2">
              <div className="w-16 text-xs font-bold" style={{ color: WISE2.text }}>{device}</div>
              <div className="flex gap-1">
                {hours.map((hour, idx) => {
                  const health = Math.floor(Math.random() * 100) + (idx % 2 === 0 ? 5 : -5);
                  return (
                    <motion.div
                      key={hour}
                      className="w-2 h-6 rounded-sm"
                      style={{ backgroundColor: getHealthColor(health) }}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, delay: idx * 0.05 }}
                      title={`${hour}: ${health}%`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <div className="rounded-lg p-6 border text-center" style={{ borderColor: `${WISE2.cyan}50`, backgroundColor: `${WISE2.navy}70` }}>
      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wider mb-4" style={{ color: WISE2.cyan }}>
        Connect Your Wearable
      </h2>
      <p className="text-sm mb-6" style={{ color: WISE2.muted }}>
        Bring field intelligence into WISE² HVAC, Command, and Enterprise platforms.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-3 rounded-lg font-bold uppercase text-sm" style={{ backgroundColor: WISE2.cyan, color: WISE2.dark }}>
          CONNECT DEVICE
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} className="px-6 py-3 rounded-lg font-bold uppercase text-sm" style={{ backgroundColor: `${WISE2.green}20`, color: WISE2.green, border: `1px solid ${WISE2.green}50` }}>
          OPEN COMMAND
        </motion.button>
      </div>
    </div>
  );
};

export default function WearablesPage() {
  const [activeSection, setActiveSection] = useState('intelligence');

  return (
    <div style={{ backgroundColor: WISE2.dark, color: WISE2.text }} className="min-h-screen font-mono relative overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `linear-gradient(0deg, ${WISE2.cyan}30 1px, transparent 1px), linear-gradient(90deg, ${WISE2.cyan}30 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      {/* Header */}
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="relative z-50 border-b sticky top-0" style={{ borderColor: `${WISE2.cyan}20`, backgroundColor: `${WISE2.navy}98`, backdropFilter: 'blur(30px)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs tracking-widest font-black" style={{ color: WISE2.cyan }}>◆ WISE² WEARABLES</div>
              <div className="text-xs mt-1 tracking-widest" style={{ color: WISE2.muted }}>COMMAND CENTER</div>
            </div>
            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg" style={{ backgroundColor: `${WISE2.green}20`, color: WISE2.green }}>
                <Download size={18} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="p-2 rounded-lg" style={{ backgroundColor: `${WISE2.cyan}20`, color: WISE2.cyan }}>
                <Filter size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-16">
        {/* Architecture */}
        <section>
          <ArchitectureFlow />
        </section>

        {/* HUD + Status */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider mb-4" style={{ color: WISE2.cyan }}>WEARABLE HUD</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Camera, label: 'CAMERA', value: 'READY' },
                  { icon: Mic, label: 'MICROPHONE', value: 'ACTIVE' },
                  { icon: Wifi, label: 'CONNECTIVITY', value: '95%' },
                  { icon: Battery, label: 'BATTERY', value: '87%' },
                  { icon: Activity, label: 'AI ROUTE', value: 'LOCAL' },
                  { icon: Radio, label: 'SYNC', value: 'LIVE' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="rounded-lg p-3 border" style={{ borderColor: `${WISE2.green}30`, backgroundColor: `${WISE2.navy}60` }}>
                      <Icon size={16} style={{ color: WISE2.green }} className="mb-1" />
                      <div className="text-xs" style={{ color: WISE2.muted }}>{item.label}</div>
                      <div className="text-xs font-bold mt-1" style={{ color: WISE2.green }}>{item.value}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <HVACFieldMode />
          </div>

          <div>
            <StatusPanel />
          </div>
        </section>

        {/* Tabs for content */}
        <section>
          <div className="flex gap-2 mb-6 border-b overflow-x-auto" style={{ borderColor: `${WISE2.cyan}20` }}>
            {['INTELLIGENCE', 'ARCHITECTURE', 'HVAC', 'CAPTURE', 'ECOSYSTEM'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveSection(tab.toLowerCase())}
                className="px-4 py-2 text-xs font-bold uppercase border-b-2 transition-all whitespace-nowrap"
                style={{
                  borderColor: activeSection === tab.toLowerCase() ? WISE2.cyan : 'transparent',
                  color: activeSection === tab.toLowerCase() ? WISE2.cyan : WISE2.muted,
                }}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {activeSection === 'intelligence' && (
            <div className="space-y-6">
              <AdvancedAnalytics />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <DeviceHealthHeatmap />
                </div>
                <LiveActivityFeed />
              </div>
            </div>
          )}
          {activeSection === 'architecture' && <ArchitectureFlow />}
          {activeSection === 'hvac' && <HVACFieldMode />}
          {activeSection === 'capture' && <CapturePipeline />}
          {activeSection === 'ecosystem' && <DeviceEcosystem />}
        </section>

        {/* CTA */}
        <section>
          <CTASection />
        </section>

        {/* Integration info */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-12">
          <div className="rounded-lg p-6 border" style={{ borderColor: `${WISE2.gold}30`, backgroundColor: `${WISE2.navy}60` }}>
            <h3 className="text-sm font-black uppercase mb-4" style={{ color: WISE2.gold }}>INTEGRATIONS</h3>
            <div className="space-y-2 text-xs" style={{ color: WISE2.muted }}>
              <div>✓ WISE² COMMAND CENTER</div>
              <div>✓ WISE² HVAC</div>
              <div>✓ WISE² CAPTURE</div>
              <div>✓ WISE² SECOND BRAIN</div>
              <div>• XR (COMING SOON)</div>
              <div>• DEFENSE (COMING SOON)</div>
            </div>
          </div>

          <div className="rounded-lg p-6 border" style={{ borderColor: `${WISE2.cyan}30`, backgroundColor: `${WISE2.navy}60` }}>
            <h3 className="text-sm font-black uppercase mb-4" style={{ color: WISE2.cyan }}>AI ROUTING</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs" style={{ color: WISE2.muted }}>MODE</div>
                <div className="text-sm font-bold" style={{ color: WISE2.green }}>AUTO (LOCAL-FIRST)</div>
              </div>
              <div>
                <div className="text-xs" style={{ color: WISE2.muted }}>LOCAL</div>
                <div className="text-xs" style={{ color: WISE2.text }}>Mac/GPU WISE² Models</div>
              </div>
              <div>
                <div className="text-xs" style={{ color: WISE2.muted }}>CLOUD</div>
                <div className="text-xs" style={{ color: WISE2.text }}>Hosted Intelligence</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
