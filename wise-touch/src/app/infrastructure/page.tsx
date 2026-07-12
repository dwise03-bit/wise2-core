'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Server, Cpu, HardDrive, Thermometer, RotateCcw, Radio, Plus, Network } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PremiumPageHeader, PremiumStatGrid, PremiumSectionContainer } from '@/components/layout/PremiumSections'
import { PremiumHUDPanel, PremiumChartCard, PremiumStatCard } from '@/components/common/PremiumCards'
import { PremiumButton } from '@/components/common/PremiumButton'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { subscribeToStats, SystemStats } from '@/services/wiseos'

const servers = [
  {
    id: 'prod-1',
    name: 'Production Server 1',
    ip: '192.168.1.10',
    os: 'Ubuntu 22.04 LTS',
    cpu: 78,
    memory: 16384,
    memoryUsed: 12288,
    disk: 500,
    diskUsed: 380,
    temperature: 62,
    uptime: '127d 4h',
    status: 'online' as const,
  },
  {
    id: 'prod-2',
    name: 'Production Server 2',
    ip: '192.168.1.11',
    os: 'Ubuntu 22.04 LTS',
    cpu: 45,
    memory: 16384,
    memoryUsed: 8192,
    disk: 500,
    diskUsed: 320,
    temperature: 58,
    uptime: '89d 12h',
    status: 'online' as const,
  },
  {
    id: 'rpi-1',
    name: 'Raspberry Pi - Edge 1',
    ip: '192.168.8.136',
    os: 'Raspberry Pi OS',
    cpu: 32,
    memory: 8192,
    memoryUsed: 4096,
    disk: 256,
    diskUsed: 180,
    temperature: 45,
    uptime: '45d 8h',
    status: 'online' as const,
  },
]

const systemMetrics = [
  { time: '00:00', cpu: 32, memory: 45, disk: 72 },
  { time: '04:00', cpu: 28, memory: 42, disk: 72 },
  { time: '08:00', cpu: 52, memory: 58, disk: 73 },
  { time: '12:00', cpu: 78, memory: 68, disk: 74 },
  { time: '16:00', cpu: 65, memory: 62, disk: 74 },
  { time: '20:00', cpu: 48, memory: 52, disk: 75 },
  { time: '24:00', cpu: 42, memory: 48, disk: 75 },
]

export default function InfrastructurePage() {
  const [selectedServer, setSelectedServer] = useState<string | null>('rpi-1')
  const [piStats, setPiStats] = useState<SystemStats>({ cpu: 0, mem: 0, temp: 0 })

  useEffect(() => {
    const unsubscribe = subscribeToStats((newStats) => {
      setPiStats(newStats)
    })
    return () => unsubscribe()
  }, [])

  const selected = servers.find(s => s.id === selectedServer)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return (
    <PageContainer>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <PremiumPageHeader
            title="Infrastructure Control"
            subtitle="Monitor servers and resources"
            description="Real-time visibility into your entire infrastructure ecosystem"
            icon={Network}
            badge="3 Servers"
          />
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants}>
          <PremiumStatGrid stats={[
            { label: 'Servers Online', value: servers.filter(s => s.status === 'online').length, icon: <Server size={20} />, trend: 'up' },
            { label: 'Avg CPU', value: `${Math.round(servers.reduce((a, s) => a + s.cpu, 0) / servers.length)}%`, icon: <Cpu size={20} />, trend: 'down' },
            { label: 'Storage Used', value: `${servers.reduce((a, s) => a + s.diskUsed, 0)}GB`, icon: <HardDrive size={20} />, trend: 'neutral' },
            { label: 'Network Status', value: 'Healthy', change: 0 },
          ]} />
        </motion.div>

        {/* Servers Section */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer title="Server Fleet" subtitle="All managed infrastructure" badge="3 Nodes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Servers List */}
              <div className="lg:col-span-2 space-y-3">
                {servers.map((server, idx) => (
                  <motion.button
                    key={server.id}
                    onClick={() => setSelectedServer(server.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`w-full p-5 rounded-xl border transition-all text-left ${
                      selectedServer === server.id
                        ? 'hud-panel-accent border-blue-electric/50'
                        : 'hud-panel border-steel/30 hover:border-blue-electric/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                          <Server size={18} className="text-blue-electric" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-chrome-light">{server.name}</h3>
                          <p className="text-xs text-chrome-dark/60 font-mono">{server.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-500 font-semibold">Online</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                      {[
                        { label: 'CPU', value: `${server.cpu}%`, color: '#0094FF' },
                        { label: 'Memory', value: `${Math.round((server.memoryUsed / server.memory) * 100)}%`, color: '#5BC0FF' },
                        { label: 'Disk', value: `${Math.round((server.diskUsed / server.disk) * 100)}%`, color: '#0056CC' },
                      ].map((metric) => (
                        <div key={metric.label}>
                          <p className="text-chrome-dark/60 mb-1">{metric.label}</p>
                          <div className="w-full bg-bg-tertiary/40 rounded-full h-2">
                            <motion.div
                              className="h-2 rounded-full"
                              style={{ backgroundColor: metric.color }}
                              initial={{ width: 0 }}
                              animate={{ width: metric.value }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                          </div>
                          <p className="text-chrome-light mt-1 font-semibold">{metric.value}</p>
                        </div>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Server Details */}
              {selected && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <PremiumHUDPanel title={selected.name} status="online">
                    <div className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <motion.div
                          className="flex justify-between pb-2 border-b border-steel/20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <span className="text-chrome-dark/60">IP Address</span>
                          <span className="text-chrome-light font-mono font-semibold">{selected.ip}</span>
                        </motion.div>
                        <motion.div
                          className="flex justify-between"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          <span className="text-chrome-dark/60">OS</span>
                          <span className="text-chrome-light font-semibold">{selected.os}</span>
                        </motion.div>
                        <motion.div
                          className="flex justify-between"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span className="text-chrome-dark/60">Uptime</span>
                          <span className="text-chrome-light font-mono font-semibold">{selected.uptime}</span>
                        </motion.div>
                      </div>

                      <div className="pt-3 border-t border-steel/20 space-y-3">
                        <PremiumStatCard label="Temperature" value={`${selected.temperature}°C`} icon={<Thermometer size={18} />} />
                        <PremiumStatCard label="Memory" value={`${Math.round(selected.memoryUsed / 1024)}/${Math.round(selected.memory / 1024)}GB`} />
                      </div>

                      <div className="pt-3 border-t border-steel/20 space-y-3">
                        <p className="text-label">Actions</p>
                        <div className="grid grid-cols-2 gap-2">
                          <PremiumButton size="sm" variant="primary" icon={Radio}>
                            SSH
                          </PremiumButton>
                          <PremiumButton size="sm" variant="secondary" icon={RotateCcw}>
                            Reboot
                          </PremiumButton>
                        </div>
                      </div>
                    </div>
                  </PremiumHUDPanel>
                </motion.div>
              )}
            </div>
          </PremiumSectionContainer>
        </motion.div>

        {/* System Metrics */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer title="System Metrics" subtitle="CPU, memory, and disk usage over 24 hours" badge="24h View">
            <PremiumChartCard title="System Metrics">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={systemMetrics}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0094FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0094FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5BC0FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5BC0FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.1)" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #0094FF',
                      borderRadius: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#0094FF" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} name="CPU" />
                  <Area type="monotone" dataKey="memory" stroke="#5BC0FF" fillOpacity={1} fill="url(#colorMemory)" strokeWidth={2} name="Memory" />
                </AreaChart>
              </ResponsiveContainer>
            </PremiumChartCard>
          </PremiumSectionContainer>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
