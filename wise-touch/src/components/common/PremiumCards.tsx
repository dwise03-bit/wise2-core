'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface PremiumStatCardProps {
  label: string
  value: string | number
  change?: number
  status?: 'good' | 'warning' | 'critical'
  icon?: React.ReactNode
  gradient?: boolean
}

export function PremiumStatCard({
  label,
  value,
  change,
  status,
  icon,
  gradient = false,
}: PremiumStatCardProps) {
  const containerVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
  }

  const contentVariants = {
    rest: { y: 0 },
    hover: { y: -2 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      variants={containerVariants}
      whileHover="hover"
      className={`hud-panel p-6 cursor-default overflow-hidden group ${
        gradient ? 'bg-gradient-to-br from-blue-electric/5 to-transparent' : ''
      }`}
      role="region"
      aria-label={`${label}: ${value}`}
    >
      <motion.div variants={contentVariants} className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-label mb-2">{label}</p>
            <motion.p
              className="text-metric"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              aria-live="polite"
            >
              {value}
            </motion.p>
          </div>

          {icon && (
            <motion.div
              className="text-blue-electric/40 group-hover:text-blue-electric/60 transition-colors"
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 5 }}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {change !== undefined && (
          <motion.div
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              change > 0 ? 'text-green-400' : 'text-red-400'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            aria-label={`${change > 0 ? 'increase' : 'decrease'} of ${Math.abs(change)}%`}
          >
            {change > 0 ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{Math.abs(change)}% {change > 0 ? 'increase' : 'decrease'}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Animated background accent */}
      <motion.div
        className="absolute -top-40 -right-40 w-80 h-80 bg-blue-electric/10 rounded-full blur-3xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  )
}

export interface PremiumMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  status?: 'good' | 'warning' | 'error'
  children?: React.ReactNode
}

export function PremiumMetricCard({
  title,
  value,
  subtitle,
  status,
  children,
}: PremiumMetricCardProps) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  }

  return (
    <motion.div
      className="hud-panel p-5 group cursor-default"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-label">{title}</p>
          {status && <div className={`w-2 h-2 rounded-full status-${status}`} />}
        </div>

        <motion.p
          className="text-2xl md:text-3xl font-black text-blue-electric"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value}
        </motion.p>

        {subtitle && (
          <p className="text-xs text-chrome-dark/60">{subtitle}</p>
        )}

        {children && (
          <motion.div
            className="pt-3 mt-3 border-t border-steel/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export interface PremiumChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function PremiumChartCard({
  title,
  subtitle,
  children,
}: PremiumChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className="hud-panel p-6 md:p-8"
    >
      <motion.div className="space-y-4">
        <div>
          <motion.h3
            className="text-heading text-chrome-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h3>
          {subtitle && (
            <motion.p
              className="text-sm text-chrome-dark/60 mt-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export interface PremiumHUDPanelProps {
  title?: string
  subtitle?: string
  status?: 'online' | 'offline' | 'warning' | 'error'
  children: React.ReactNode
  className?: string
}

export function PremiumHUDPanel({
  title,
  subtitle,
  status,
  children,
  className = '',
}: PremiumHUDPanelProps) {
  const statusColors = {
    online: 'text-green-400',
    offline: 'text-chrome-dark/50',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`hud-panel-accent p-6 ${className}`}
    >
      {(title || status) && (
        <motion.div
          className="flex items-center justify-between mb-4 pb-4 border-b border-steel/20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            {title && <h3 className="text-heading text-chrome-light">{title}</h3>}
            {subtitle && (
              <p className="text-sm text-chrome-dark/60 mt-1">{subtitle}</p>
            )}
          </div>
          {status && (
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full status-${status}`}
                role="status"
                aria-label={status}
              />
              <span className={`text-xs font-semibold capitalize ${statusColors[status]}`}>
                {status}
              </span>
            </div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
