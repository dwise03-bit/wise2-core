'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PageContainer, SectionContainer } from '@/components/layout/PageContainer'
import { PageHeader, StatGrid, AlertBanner } from '@/components/layout/PageSections'
import { StatCard, MetricCard, ChartCard, HUDPanel } from '@/components/common/Cards'
import { TrendingUp, Users, Zap, AlertTriangle, Globe, Shield, Activity, Server, Sparkles } from 'lucide-react'
import { subscribeToStats, SystemStats } from '@/services/wiseos'

// Mock data
const revenueData = [
  { name: 'Jan', value: 12000 },
  { name: 'Feb', value: 19000 },
  { name: 'Mar', value: 15000 },
  { name: 'Apr', value: 22000 },
  { name: 'May', value: 25000 },
  { name: 'Jun', value: 28000 },
]

const customerData = [
  { name: 'Premium', value: 124 },
  { name: 'Standard', value: 287 },
  { name: 'Free', value: 543 },
]

const colors = ['#0094FF', '#5BC0FF', '#0056CC']

const deploymentData = [
  { name: '00:00', prod: 45, staging: 32, dev: 28 },
  { name: '04:00', prod: 52, staging: 38, dev: 35 },
  { name: '08:00', prod: 48, staging: 42, dev: 38 },
  { name: '12:00', prod: 61, staging: 48, dev: 45 },
  { name: '16:00', prod: 55, staging: 45, dev: 40 },
  { name: '20:00', prod: 67, staging: 52, dev: 48 },
  { name: '24:00', prod: 72, staging: 58, dev: 52 },
]

const getSystemMetrics = (stats: SystemStats) => [
  { label: 'CPU Usage', value: `${Math.round(stats.cpu)}%`, change: 12, icon: <Activity size={20} /> },
  { label: 'Memory', value: `${stats.mem.toFixed(1)}GB`, change: -5, icon: <Server size={20} /> },
  { label: 'Temperature', value: `${Math.round(stats.temp)}°C`, change: 2, icon: <Zap size={20} /> },
  { label: 'Deployments', value: '14', change: 2, icon: <Globe size={20} /> },
]

export default function Dashboard() {
  const [time, setTime] = useState<string>('')
  const [stats, setStats] = useState<SystemStats>({ cpu: 0, mem: 0, temp: 0 })
  const [statsHistory, setStatsHistory] = useState<SystemStats[]>([])

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToStats((newStats) => {
      setStats(newStats)
      setStatsHistory((prev) => [...prev.slice(-59), newStats])
    })
    return () => unsubscribe()
  }, [])

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
    <PageContainer>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome + Time */}
        <motion.div variants={itemVariants} className="space-y-2">
          <motion.h1
            className="text-display text-chrome-light"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome back, Daniel 👋
          </motion.h1>
          <motion.p
            className="text-subheading text-chrome-dark"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Today's business status — {time}
          </motion.p>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div variants={itemVariants}>
          <StatGrid stats={getSystemMetrics(stats)} />
        </motion.div>

      {/* Primary Charts Grid */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Business Metrics" subtitle="Revenue and customer analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <ChartCard title="Revenue (30 Days)">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0094FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0094FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #0094FF',
                    borderRadius: '8px',
                    color: '#E5E7EB',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0094FF"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Customer Distribution */}
          <ChartCard title="Customer Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={customerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {customerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #0094FF',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          </div>
        </SectionContainer>
      </motion.div>

      {/* System Status Section */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Infrastructure Status" subtitle="System health and performance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deployment Load */}
          <div className="lg:col-span-2">
            <ChartCard title="Deployment Load (24h)">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deploymentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.1)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #0094FF',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="prod" stackId="a" fill="#0094FF" />
                  <Bar dataKey="staging" stackId="a" fill="#5BC0FF" />
                  <Bar dataKey="dev" stackId="a" fill="#0056CC" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <HUDPanel title="System Status" status="online" className="h-full">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-chrome-dark">Services</span>
                  <span className="text-sm text-green-500">14/14 Online</span>
                </div>
                <div className="w-full bg-bg-tertiary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-chrome-dark">Network</span>
                  <span className="text-sm text-blue-electric">1.2Gbps</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-chrome-dark">Uptime</span>
                  <span className="text-sm text-chrome-light">99.99%</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-chrome-dark">Latency</span>
                  <span className="text-sm text-chrome-light">23ms</span>
                </div>
              </div>
            </HUDPanel>
          </motion.div>
          </div>
        </SectionContainer>
      </motion.div>

      {/* Alerts & Suggestions Section */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Operations" subtitle="Alerts and AI recommendations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Alerts */}
          <HUDPanel title="Active Alerts" status="warning">
            <div className="space-y-3">
              {[
                { title: 'High CPU Usage', severity: 'warning', time: '5 min ago' },
                { title: 'Disk Space Low', severity: 'critical', time: '12 min ago' },
                { title: 'Database Connection Slow', severity: 'warning', time: '1 hr ago' },
              ].map((alert, idx) => (
                <motion.div
                  key={idx}
                  className="p-3 bg-bg-tertiary rounded border-l-2"
                  style={{
                    borderLeftColor: alert.severity === 'critical' ? '#EF4444' : '#F59E0B',
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={14}
                      className={alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-chrome-light">{alert.title}</p>
                      <p className="text-xs text-chrome-dark">{alert.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </HUDPanel>

          {/* AI Suggestions */}
          <HUDPanel title="AI Suggestions" status="online">
            <div className="space-y-3">
              {[
                'Scale up API servers during peak hours (2-4PM)',
                'Archive logs from production > 30 days old',
                'Update dependencies in 3 services',
              ].map((suggestion, idx) => (
                <motion.div
                  key={idx}
                  className="p-3 bg-blue-electric/5 border border-blue-electric/20 rounded"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <p className="text-sm text-chrome-light">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </HUDPanel>
          </div>
        </SectionContainer>
      </motion.div>
      </motion.div>
    </PageContainer>
  )
}
