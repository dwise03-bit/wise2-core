'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Server, Cpu, HardDrive, Thermometer, Power, RotateCcw, Radio, Plus, Activity } from 'lucide-react'
import { PageContainer, SectionContainer } from '@/components/layout/PageContainer'
import { PageHeader, StatGrid } from '@/components/layout/PageSections'
import { HUDPanel, StatCard, ChartCard } from '@/components/common/Cards'
import { Button } from '@/components/common/FormElements'
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
      // Update the Raspberry Pi server object with real data
      const rpiServer = servers.find(s => s.id === 'rpi-1')
      if (rpiServer) {
        rpiServer.cpu = newStats.cpu
        rpiServer.memoryUsed = newStats.mem * 1024 // Convert GB to MB
        rpiServer.temperature = newStats.temp
      }
    })
    return () => unsubscribe()
  }, [])

  const selected = servers.find(s => s.id === selectedServer)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <PageContainer title="Infrastructure Control" subtitle="Monitor servers, devices, and system resources">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Key Metrics */}
        <motion.div variants={itemVariants}>
          <StatGrid stats={[
            { label: 'Servers Online', value: servers.filter(s => s.status === 'online').length, icon: <Server size={20} /> },
            { label: 'Avg CPU', value: `${Math.round(servers.reduce((a, s) => a + s.cpu, 0) / servers.length)}%`, icon: <Cpu size={20} /> },
            { label: 'Storage Used', value: `${servers.reduce((a, s) => a + s.diskUsed, 0)}GB`, icon: <HardDrive size={20} /> },
            { label: 'Network Status', value: 'Healthy', change: 0 },
          ]} />
        </motion.div>

        {/* Servers Section */}
        <motion.div variants={itemVariants}>
          <SectionContainer title="Server Fleet" subtitle="All managed infrastructure">
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
              className={`w-full p-4 rounded border transition-all text-left ${
                selectedServer === server.id
                  ? 'hud-panel-accent border-blue-electric/50'
                  : 'hud-panel border-steel/30 hover:border-blue-electric/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Server size={18} className="text-blue-electric" />
                  <div>
                    <h3 className="font-semibold text-chrome-light">{server.name}</h3>
                    <p className="text-xs text-chrome-dark">{server.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs mt-3">
                <div>
                  <p className="text-chrome-dark">CPU</p>
                  <div className="w-full bg-bg-tertiary rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-electric h-1.5 rounded-full transition-all"
                      style={{ width: `${server.cpu}%` }}
                    ></div>
                  </div>
                  <p className="text-chrome-light mt-1">{server.cpu}%</p>
                </div>
                <div>
                  <p className="text-chrome-dark">Memory</p>
                  <div className="w-full bg-bg-tertiary rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-electric-light h-1.5 rounded-full transition-all"
                      style={{ width: `${(server.memoryUsed / server.memory) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-chrome-light mt-1">{server.memoryUsed / 1024}GB</p>
                </div>
                <div>
                  <p className="text-chrome-dark">Disk</p>
                  <div className="w-full bg-bg-tertiary rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-electric-dark h-1.5 rounded-full transition-all"
                      style={{ width: `${(server.diskUsed / server.disk) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-chrome-light mt-1">{server.diskUsed}GB</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Server Details */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HUDPanel title={selected.name} status="online">
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-chrome-dark">IP</span>
                    <span className="text-chrome-light font-mono">{selected.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-chrome-dark">OS</span>
                    <span className="text-chrome-light">{selected.os}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-chrome-dark">Uptime</span>
                    <span className="text-chrome-light font-mono">{selected.uptime}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-steel/30 space-y-3">
                  <StatCard label="Temperature" value={`${selected.temperature}°C`} icon={<Thermometer size={20} />} />
                  <StatCard label="Memory" value={`${selected.memoryUsed / 1024}/${selected.memory / 1024}GB`} />
                </div>

                <div className="pt-3 border-t border-steel/30 space-y-2">
                  <p className="text-xs text-label">Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 flex items-center justify-center gap-1 bg-blue-electric hover:bg-blue-electric-light text-bg-primary rounded text-xs font-medium transition-colors">
                      <Radio size={12} />
                      SSH
                    </button>
                    <button className="p-2 flex items-center justify-center gap-1 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-steel/50 rounded text-xs font-medium transition-colors">
                      <RotateCcw size={12} />
                      Reboot
                    </button>
                  </div>
                </div>
              </div>
            </HUDPanel>
          </motion.div>
        )}
            </div>
          </SectionContainer>
        </motion.div>

        {/* System Metrics */}
        <motion.div variants={itemVariants}>
          <SectionContainer title="System Metrics" subtitle="CPU, memory, and disk usage over 24 hours">
            <ChartCard title="System Metrics (24h)">
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
                borderRadius: '8px',
              }}
            />
              <Area type="monotone" dataKey="cpu" stroke="#0094FF" fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="memory" stroke="#5BC0FF" fillOpacity={1} fill="url(#colorMemory)" />
            </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </SectionContainer>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
