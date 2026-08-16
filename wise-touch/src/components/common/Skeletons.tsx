'use client'

import React from 'react'
import { motion } from 'framer-motion'

/** Skeleton loader for stat cards */
export function StatCardSkeleton() {
  return (
    <div className="hud-panel-glass p-4 rounded-lg" role="status" aria-label="Loading">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-bg-tertiary rounded w-24 mb-3 animate-pulse" />
          <div className="h-8 bg-bg-tertiary rounded w-32 animate-pulse" />
        </div>
        <div className="h-5 w-5 bg-bg-tertiary rounded animate-pulse" />
      </div>
      <div className="h-3 bg-bg-tertiary rounded w-20 mt-3 animate-pulse" />
    </div>
  )
}

/** Skeleton loader for chart cards */
export function ChartCardSkeleton() {
  return (
    <div className="hud-panel-glass p-6 rounded-lg" role="status" aria-label="Loading chart">
      <div className="h-6 bg-bg-tertiary rounded w-40 mb-4 animate-pulse" />
      <div className="space-y-2">
        <div className="h-40 bg-bg-tertiary rounded animate-pulse" />
      </div>
    </div>
  )
}

/** Skeleton loader for metric cards */
export function MetricCardSkeleton() {
  return (
    <div className="hud-panel-glass p-6 rounded-lg" role="status" aria-label="Loading metric">
      <div className="h-4 bg-bg-tertiary rounded w-28 mb-3 animate-pulse" />
      <div className="h-10 bg-bg-tertiary rounded w-40 animate-pulse" />
      <div className="h-3 bg-bg-tertiary rounded w-32 mt-2 animate-pulse" />
    </div>
  )
}

/** Skeleton loader for grid layouts */
export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Animated loading pulse */
export function LoadingPulse({ children }: { children?: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {children}
    </motion.div>
  )
}
