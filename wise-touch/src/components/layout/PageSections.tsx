'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
}

/** Page header with title and description */
export function PageHeader({
  title,
  subtitle,
  description,
  icon: Icon,
}: PageHeaderProps) {
  return (
    <motion.div
      className="space-y-3 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8 text-blue-electric" />}
        <h1 className="text-display text-chrome-light">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-subheading text-chrome-dark">{subtitle}</p>
      )}
      {description && (
        <p className="text-sm text-chrome-dark leading-relaxed">{description}</p>
      )}
    </motion.div>
  )
}

interface StatGridProps {
  stats: Array<{
    label: string
    value: string | number
    change?: number
    icon?: React.ReactNode
  }>
}

/** Quick stats grid at top of page */
export function StatGrid({ stats }: StatGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          className="hud-panel-glass p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label text-chrome-dark">{stat.label}</p>
              <p className="text-metric mt-2">{stat.value}</p>
            </div>
            {stat.icon && (
              <div className="text-blue-electric opacity-50">{stat.icon}</div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

interface ContentSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

/** Standard content section with title */
export function ContentSection({
  title,
  subtitle,
  children,
  className = '',
}: ContentSectionProps) {
  return (
    <motion.section
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2">
        <h2 className="text-heading text-chrome-light">{title}</h2>
        {subtitle && (
          <p className="text-sm text-chrome-dark">{subtitle}</p>
        )}
      </div>
      {children}
    </motion.section>
  )
}

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

/** Alert banner for important messages */
export function AlertBanner({
  type,
  title,
  message,
  action,
}: AlertBannerProps) {
  const colors = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    success: 'bg-green-500/10 border-green-500/30 text-green-400',
  }

  return (
    <motion.div
      className={`hud-panel-glass p-4 rounded-lg border ${colors[type]}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-sm">{title}</p>
          {message && (
            <p className="text-xs mt-1 opacity-80">{message}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-medium px-3 py-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  )
}

interface TabsProps {
  tabs: Array<{
    id: string
    label: string
    badge?: number
  }>
  activeTab: string
  onChange: (tabId: string) => void
}

/** Tab navigation component */
export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-2 border-b border-bg-tertiary">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-blue-electric text-blue-electric'
              : 'border-transparent text-chrome-dark hover:text-chrome-light'
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-blue-electric/20 text-blue-electric">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
