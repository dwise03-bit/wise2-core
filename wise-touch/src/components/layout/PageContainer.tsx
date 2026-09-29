'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface PageContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

/** Reusable page container with consistent spacing and animations */
export function PageContainer({
  children,
  title,
  subtitle,
  className = '',
}: PageContainerProps) {
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
      transition: { duration: 0.4 },
    },
  }

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      {(title || subtitle) && (
        <motion.div variants={itemVariants} className="space-y-2 mb-8">
          {title && (
            <h1 className="text-display text-chrome-light">{title}</h1>
          )}
          {subtitle && (
            <p className="text-subheading text-chrome-dark">{subtitle}</p>
          )}
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        variants={itemVariants}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/** Grid container for dashboard components */
interface GridContainerProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4
}

export function GridContainer({ children, cols = 4 }: GridContainerProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[cols]

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4`}>
      {children}
    </div>
  )
}

/** Section container for content grouping */
interface SectionContainerProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function SectionContainer({
  children,
  title,
  subtitle,
  className = '',
}: SectionContainerProps) {
  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {title && (
        <div className="space-y-1">
          <h2 className="text-heading text-chrome-light">{title}</h2>
          {subtitle && (
            <p className="text-sm text-chrome-dark">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}
