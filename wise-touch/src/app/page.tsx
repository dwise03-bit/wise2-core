'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { PageContainer, SectionContainer } from '@/components/layout/PageContainer'
import { PremiumPageHeader, PremiumStatGrid, PremiumSectionContainer, PremiumAlert } from '@/components/layout/PremiumSections'
import { PremiumStatCard, PremiumChartCard, PremiumHUDPanel } from '@/components/common/PremiumCards'
import { TrendingUp, Users, Zap, AlertTriangle, Globe, Shield, Activity, Server, Sparkles, Bell } from 'lucide-react'
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
  { label: 'CPU Usage', value: `${Math.round(stats.cpu)}%`, icon: <Activity size={20} />, trend: 'up' as const },
  { label: 'Memory', value: `${stats.mem.toFixed(1)}GB`, icon: <Server size={20} />, trend: 'down' as const },
  { label: 'Temperature', value: `${Math.round(stats.temp)}°C`, icon: <Zap size={20} />, trend: 'neutral' as const },
  { label: 'Deployments', value: '14', icon: <Globe size={20} />, change: 2 },
]

export default function Dashboard() {
  const [time, setTime] = useState<string>('')
  const [stats, setStats] = useState<SystemStats>({ cpu: 0, mem: 0, temp: 0 })
  const [showAlert, setShowAlert] = useState(true)

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
    })
    return () => unsubscribe()
  }, [])

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
            title="Dashboard"
            subtitle="Welcome back, Daniel"
            description={`System status as of ${time}`}
            icon={Sparkles}
            badge="Real-time"
          />
        </motion.div>

        {/* Alerts */}
        {showAlert && (
          <motion.div variants={itemVariants}>
            <PremiumAlert
              type="info"
              title="System Optimization"
              message="Your infrastructure is running optimally. All services are online and performing within SLA."
              icon={Shield}
              action={{
                label: 'Dismiss',
                onClick: () => setShowAlert(false),
              }}
            />
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        <motion.div variants={itemVariants}>
          <PremiumStatGrid stats={getSystemMetrics(stats)} />
        </motion.div>

        {/* Business Metrics Section */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer
            title="Business Metrics"
            subtitle="Revenue and customer insights"
            badge="Last 30 days"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumChartCard title="Revenue Trend" subtitle="Monthly recurring">
                <ResponsiveContainer width="100%" height={280}>
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
                        borderRadius: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#0094FF"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </PremiumChartCard>

              <PremiumChartCard title="Customer Distribution" subtitle="By subscription tier">
                <ResponsiveContainer width="100%" height={280}>
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
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </PremiumChartCard>
            </div>
          </PremiumSectionContainer>
        </motion.div>

        {/* Infrastructure Status */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer
            title="Infrastructure"
            subtitle="System performance and health"
            badge="24-hour view"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PremiumChartCard title="Deployment Load" subtitle="Across all environments">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={deploymentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.1)" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1A1A1A',
                          border: '1px solid #0094FF',
                          borderRadius: '12px',
                        }}
                      />
                      <Bar dataKey="prod" stackId="a" fill="#0094FF" />
                      <Bar dataKey="staging" stackId="a" fill="#5BC0FF" />
                      <Bar dataKey="dev" stackId="a" fill="#0056CC" />
                    </BarChart>
                  </ResponsiveContainer>
                </PremiumChartCard>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <PremiumHUDPanel title="System Status" status="online">
                  <div className="space-y-4">
                    <motion.div
                      className="flex justify-between items-center pb-3 border-b border-steel/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="text-sm text-chrome-dark/60">Services</span>
                      <span className="text-sm font-semibold text-green-400">14/14 Online</span>
                    </motion.div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-chrome-dark/60">Network</span>
                        <span className="text-chrome-light font-semibold">1.2Gbps</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-chrome-dark/60">Uptime</span>
                        <span className="text-green-400 font-semibold">99.99%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-chrome-dark/60">Latency</span>
                        <span className="text-chrome-light font-semibold">23ms</span>
                      </div>
                    </div>
                  </div>
                </PremiumHUDPanel>
              </motion.div>
            </div>
          </PremiumSectionContainer>
        </motion.div>

        {/* Operations Section */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer
            title="Operations"
            subtitle="Alerts and recommendations"
            badge="Active items"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PremiumHUDPanel title="Active Alerts" status="warning">
                <div className="space-y-3">
                  {[
                    { title: 'High CPU Usage', severity: 'warning', time: '5 min ago' },
                    { title: 'Disk Space Low', severity: 'critical', time: '12 min ago' },
                    { title: 'Database Connection Slow', severity: 'warning', time: '1 hr ago' },
                  ].map((alert, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 bg-bg-tertiary/30 rounded-lg border-l-2"
                      style={{
                        borderLeftColor: alert.severity === 'critical' ? '#EF4444' : '#F59E0B',
                      }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.5 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(26, 26, 26, 0.5)' }}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          size={14}
                          className={`mt-0.5 ${alert.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-chrome-light">{alert.title}</p>
                          <p className="text-xs text-chrome-dark/60 mt-0.5">{alert.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </PremiumHUDPanel>

              <PremiumHUDPanel title="AI Suggestions" status="online">
                <div className="space-y-3">
                  {[
                    'Scale up API servers during peak hours (2-4PM)',
                    'Archive logs from production > 30 days old',
                    'Update dependencies in 3 services',
                  ].map((suggestion, idx) => (
                    <motion.div
                      key={idx}
                      className="p-3 bg-blue-electric/5 border border-blue-electric/20 rounded-lg"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.5 }}
                      whileHover={{ x: -4, backgroundColor: 'rgb(0, 148, 255 / 0.08)' }}
                    >
                      <p className="text-sm text-chrome-light">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </PremiumHUDPanel>
            </div>
          </PremiumSectionContainer>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
