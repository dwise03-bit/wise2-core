'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CircleDot, Play, Pause, RotateCcw, Trash2, Eye, Settings } from 'lucide-react'
import { HUDPanel, StatCard, ChartCard } from '@/components/common/Cards'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const deployments = [
  {
    id: '1',
    name: 'API Server',
    service: 'Production',
    status: 'running' as const,
    cpu: 45,
    memory: 2048,
    uptime: '45d 12h',
    replicas: 3,
    image: 'api:v2.1.0',
  },
  {
    id: '2',
    name: 'Web Frontend',
    service: 'Production',
    status: 'running' as const,
    cpu: 23,
    memory: 512,
    uptime: '32d 8h',
    replicas: 2,
    image: 'web:v1.5.2',
  },
  {
    id: '3',
    name: 'Database Sync',
    service: 'Staging',
    status: 'running' as const,
    cpu: 78,
    memory: 4096,
    uptime: '8d 2h',
    replicas: 1,
    image: 'db-sync:v1.0.1',
  },
  {
    id: '4',
    name: 'Cache Layer',
    service: 'Production',
    status: 'stopped' as const,
    cpu: 0,
    memory: 0,
    uptime: '0',
    replicas: 0,
    image: 'redis:v6.2',
  },
]

const cpuData = [
  { time: '00:00', api: 32, web: 18, db: 65 },
  { time: '04:00', api: 38, web: 22, db: 72 },
  { time: '08:00', api: 52, web: 28, db: 78 },
  { time: '12:00', api: 65, web: 42, db: 85 },
  { time: '16:00', api: 55, web: 38, db: 76 },
  { time: '20:00', api: 48, web: 32, db: 71 },
  { time: '24:00', api: 42, web: 26, db: 68 },
]

export default function DeploymentsPage() {
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(deployments[0].id)

  const selected = deployments.find(d => d.id === selectedDeployment)

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-display text-chrome-light">Deployment Center</h1>
        <p className="text-subheading text-chrome-dark mt-2">
          Manage Docker containers, Kubernetes deployments, and service orchestration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deployments List */}
        <div className="lg:col-span-2 space-y-3">
          {deployments.map((deployment, idx) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => setSelectedDeployment(deployment.id)}
                className={`w-full p-4 rounded border transition-all text-left ${
                  selectedDeployment === deployment.id
                    ? 'hud-panel-accent border-blue-electric/50'
                    : 'hud-panel border-steel/30 hover:border-blue-electric/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CircleDot
                        size={12}
                        className={deployment.status === 'running' ? 'text-green-500' : 'text-chrome-dark'}
                        fill={deployment.status === 'running' ? 'currentColor' : 'none'}
                      />
                      <h3 className="font-semibold text-chrome-light">{deployment.name}</h3>
                      <span className="text-xs text-chrome-dark bg-bg-tertiary px-2 py-1 rounded">
                        {deployment.service}
                      </span>
                    </div>
                    <p className="text-xs text-chrome-dark mb-2">{deployment.image}</p>
                    <div className="flex gap-4 text-xs">
                      <span>CPU: {deployment.cpu}%</span>
                      <span>Memory: {deployment.memory}MB</span>
                      <span>Replicas: {deployment.replicas}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-chrome-dark">Uptime</p>
                    <p className="text-sm font-mono text-chrome-light">{deployment.uptime}</p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Details Panel */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HUDPanel title={selected.name} status={selected.status === 'running' ? 'online' : 'offline'}>
              <div className="space-y-3">
                <StatCard label="CPU" value={`${selected.cpu}%`} />
                <StatCard label="Memory" value={`${selected.memory}MB`} />
                <StatCard label="Uptime" value={selected.uptime} />
                <StatCard label="Replicas" value={selected.replicas} />

                <div className="pt-3 border-t border-steel/30 space-y-2">
                  <p className="text-xs text-label">Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 flex items-center justify-center gap-1 bg-blue-electric hover:bg-blue-electric-light text-bg-primary rounded text-xs font-medium transition-colors">
                      <Play size={12} />
                      Start
                    </button>
                    <button className="p-2 flex items-center justify-center gap-1 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-steel/50 rounded text-xs font-medium transition-colors">
                      <Pause size={12} />
                      Stop
                    </button>
                    <button className="p-2 flex items-center justify-center gap-1 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-steel/50 rounded text-xs font-medium transition-colors">
                      <RotateCcw size={12} />
                      Restart
                    </button>
                    <button className="p-2 flex items-center justify-center gap-1 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-steel/50 rounded text-xs font-medium transition-colors">
                      <Eye size={12} />
                      Logs
                    </button>
                  </div>
                </div>
              </div>
            </HUDPanel>
          </motion.div>
        )}
      </div>

      {/* CPU Usage Chart */}
      <ChartCard title="CPU Usage (24h)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cpuData}>
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
            <Line type="monotone" dataKey="api" stroke="#0094FF" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="web" stroke="#5BC0FF" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="db" stroke="#0056CC" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </motion.div>
  )
}
