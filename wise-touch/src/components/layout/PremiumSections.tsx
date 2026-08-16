'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface PremiumPageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
  badge?: string
}

export function PremiumPageHeader({
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
}: PremiumPageHeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
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
    <motion.div
      className="space-y-4 mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {badge && (
        <motion.div
          className="inline-block"
          variants={itemVariants}
        >
          <div className="px-3 py-1 rounded-full bg-blue-electric/10 border border-blue-electric/30">
            <span className="text-xs font-semibold text-blue-electric uppercase tracking-wide">
              {badge}
            </span>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex items-start gap-4">
        {Icon && (
          <motion.div
            className="text-blue-electric/80 mt-1"
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <Icon size={32} />
          </motion.div>
        )}
        <div className="flex-1">
          <h1 className="text-display text-chrome-light">{title}</h1>
        </div>
      </motion.div>

      {subtitle && (
        <motion.p
          className="text-subheading text-chrome-dark/80"
          variants={itemVariants}
        >
          {subtitle}
        </motion.p>
      )}

      {description && (
        <motion.p
          className="text-base text-chrome-dark/60 leading-relaxed max-w-2xl"
          variants={itemVariants}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  )
}

interface PremiumStatGridProps {
  stats: Array<{
    label: string
    value: string | number
    change?: number
    icon?: React.ReactNode
    trend?: 'up' | 'down' | 'neutral'
  }>
}

export function PremiumStatGrid({ stats }: PremiumStatGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          className="hud-panel-glass p-5 rounded-xl group cursor-default"
          variants={itemVariants}
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-label text-chrome-dark/60">{stat.label}</p>
                <motion.p
                  className="text-metric mt-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                >
                  {stat.value}
                </motion.p>
              </div>
              {stat.icon && (
                <motion.div
                  className="text-blue-electric/40 group-hover:text-blue-electric/60 transition-colors"
                  animate={{ y: 0 }}
                  whileHover={{ y: -4 }}
                >
                  {stat.icon}
                </motion.div>
              )}
            </div>

            {stat.change !== undefined && (
              <motion.div
                className={`flex items-center gap-1 text-xs font-semibold ${
                  stat.change > 0 ? 'text-green-400' : 'text-red-400'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <span>{Math.abs(stat.change)}%</span>
                <span>{stat.change > 0 ? '↑' : '↓'}</span>
              </motion.div>
            )}
          </div>

          {/* Animated gradient background */}
          <motion.div
            className="absolute -inset-0 bg-gradient-to-br from-blue-electric/0 to-blue-electric/0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-5 transition-opacity"
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 0.1 }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

interface PremiumSectionContainerProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
  badge?: string
}

export function PremiumSectionContainer({
  title,
  subtitle,
  children,
  className = '',
  badge,
}: PremiumSectionContainerProps) {
  return (
    <motion.section
      className={`space-y-6 py-8 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {(title || subtitle || badge) && (
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {badge && (
            <div className="inline-block">
              <div className="px-3 py-1 rounded-full bg-blue-electric/10 border border-blue-electric/30">
                <span className="text-xs font-semibold text-blue-electric uppercase tracking-wide">
                  {badge}
                </span>
              </div>
            </div>
          )}
          {title && (
            <h2 className="text-heading text-chrome-light">{title}</h2>
          )}
          {subtitle && (
            <p className="text-base text-chrome-dark/60">{subtitle}</p>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {children}
      </motion.div>
    </motion.section>
  )
}

interface PremiumAlertProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
}

export function PremiumAlert({
  type,
  title,
  message,
  icon: Icon,
  action,
}: PremiumAlertProps) {
  const typeStyles = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      icon: 'text-blue-400',
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/30 text-green-400',
      icon: 'text-green-400',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      icon: 'text-amber-400',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: 'text-red-400',
    },
  }

  const styles = typeStyles[type]

  return (
    <motion.div
      className={`hud-panel p-5 rounded-lg border ${styles.bg}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <motion.div
            className={styles.icon}
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 10 }}
          >
            <Icon size={20} className="mt-1" />
          </motion.div>
        )}

        <div className="flex-1">
          <p className="font-semibold text-sm">{title}</p>
          {message && (
            <p className="text-xs mt-1 opacity-80">{message}</p>
          )}
        </div>

        {action && (
          <motion.button
            onClick={action.onClick}
            className="text-xs font-medium px-3 py-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {action.label}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}
