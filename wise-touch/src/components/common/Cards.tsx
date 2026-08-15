'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  change?: number
  status?: 'good' | 'warning' | 'critical'
  icon?: React.ReactNode
}

export function StatCard({ label, value, change, status, icon }: StatCardProps) {
  return (
    <motion.div
      className="hud-panel-glass p-4 rounded-lg relative"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-label text-chrome-dark">{label}</p>
          <motion.p
            className="text-metric mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-live="polite"
          >
            {value}
          </motion.p>
        </div>
        {icon && <div className="text-blue-electric opacity-50" aria-hidden="true">{icon}</div>}
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs ${
          change > 0 ? 'text-green-500' : 'text-red-500'
        }`} aria-label={`${change > 0 ? 'increase' : 'decrease'} of ${Math.abs(change)}%`}>
          {change > 0 ? <TrendingUp size={12} aria-hidden="true" /> : <TrendingDown size={12} aria-hidden="true" />}
          <span>{Math.abs(change)}% {change > 0 ? 'increase' : 'decrease'}</span>
        </div>
      )}

      {status === 'critical' && (
        <div className="absolute top-3 right-3" role="status" aria-label="Critical status">
          <AlertCircle size={16} className="text-red-500 animate-pulse" aria-hidden="true" />
        </div>
      )}
    </motion.div>
  )
}

export interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  children?: React.ReactNode
}

export function MetricCard({ title, value, subtitle, children }: MetricCardProps) {
  return (
    <motion.div
      className="hud-panel-glass p-6 rounded-lg"
      whileHover={{
        borderColor: 'rgba(0, 148, 255, 0.6)',
      }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-label">{title}</p>
      <motion.p
        className="text-display mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {value}
      </motion.p>
      {subtitle && <p className="text-xs text-chrome-dark mt-2">{subtitle}</p>}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  )
}

export interface ChartCardProps {
  title: string
  children: React.ReactNode
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <motion.div
      className="hud-panel-glass p-6 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-heading text-chrome-light mb-4">{title}</h3>
      <div>
        {children}
      </div>
    </motion.div>
  )
}

export interface HUDPanelProps {
  title?: string
  status?: 'online' | 'offline' | 'warning'
  children: React.ReactNode
  className?: string
}

export function HUDPanel({ title, status, children, className = '' }: HUDPanelProps) {
  return (
    <motion.div
      className={`hud-panel-accent p-6 rounded-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-heading text-chrome-light">{title}</h3>
          {status === 'online' && (
            <div className="flex items-center gap-2 text-xs text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Online
            </div>
          )}
          {status === 'warning' && (
            <div className="flex items-center gap-2 text-xs text-yellow-500">
              <AlertCircle size={14} />
              Warning
            </div>
          )}
          {status === 'offline' && (
            <div className="flex items-center gap-2 text-xs text-chrome-dark">
              <div className="w-2 h-2 bg-chrome-dark rounded-full"></div>
              Offline
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}
