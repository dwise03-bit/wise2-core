'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Command, Bell, Cloud, Clock, User, Menu,
  Signal, WifiOff, Zap, Droplet
} from 'lucide-react'

interface TopbarProps {
  onSidebarToggle: () => void
  sidebarOpen: boolean
}

export function Topbar({ onSidebarToggle, sidebarOpen }: TopbarProps) {
  const [time, setTime] = useState<string>('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<'online' | 'degraded' | 'offline'>('online')
  const [batteryLevel, setBatteryLevel] = useState<number>(85)

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.header
      className="h-16 bg-bg-secondary border-b border-steel/30 flex items-center px-6 gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left: Search & AI Command */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Search */}
        <motion.div
          className="relative hidden md:block flex-1 max-w-xs"
          initial={false}
          animate={{ width: isSearchOpen ? '100%' : 'auto' }}
        >
          <input
            type="text"
            placeholder="Search everything..."
            className="w-full px-3 py-2 text-sm bg-bg-tertiary border border-steel/50 rounded text-chrome-light placeholder-chrome-dark focus:border-blue-electric focus:shadow-glow-blue"
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setIsSearchOpen(false)}
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-chrome-dark pointer-events-none" />
        </motion.div>

        {/* AI Command */}
        <motion.button
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-bg-tertiary border border-steel/50 rounded text-sm text-chrome hover:border-blue-electric/50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Command size={16} />
          <span className="hidden lg:inline">Ask AI</span>
          <span className="text-xs text-chrome-dark ml-auto">⌘K</span>
        </motion.button>
      </div>

      {/* Right: Status Indicators & User */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Network Status */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded text-xs"
          whileHover={{ scale: 1.05 }}
        >
          {networkStatus === 'online' ? (
            <>
              <Signal size={14} className="text-green-500" />
              <span className="text-chrome-dark hidden sm:inline">Online</span>
            </>
          ) : networkStatus === 'degraded' ? (
            <>
              <Signal size={14} className="text-yellow-500" />
              <span className="text-chrome-dark hidden sm:inline">Degraded</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-red-500" />
              <span className="text-chrome-dark hidden sm:inline">Offline</span>
            </>
          )}
        </motion.div>

        {/* Weather */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded text-xs text-chrome"
          whileHover={{ scale: 1.05 }}
        >
          <Cloud size={14} />
          <span className="hidden sm:inline">72°F</span>
        </motion.div>

        {/* Battery */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded text-xs text-chrome"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative w-6 h-3 border border-chrome rounded-sm">
            <div
              className="absolute inset-1 bg-green-500 transition-all"
              style={{ width: `${(batteryLevel / 100) * 16}px` }}
            ></div>
          </div>
          <span className="hidden sm:inline">{batteryLevel}%</span>
        </motion.div>

        {/* Clock */}
        <motion.div
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-mono text-chrome min-w-20"
          whileHover={{ scale: 1.05 }}
        >
          <Clock size={14} />
          <span className="hidden sm:inline">{time}</span>
        </motion.div>

        {/* Notifications */}
        <motion.button
          className="relative p-2 hover:bg-bg-tertiary rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell size={18} className="text-chrome" />
          <motion.span
            className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          ></motion.span>
        </motion.button>

        {/* User Menu */}
        <motion.button
          className="flex items-center gap-2 px-3 py-2 hover:bg-bg-tertiary rounded transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-electric to-blue-dark flex items-center justify-center">
            <User size={16} className="text-bg-primary" />
          </div>
          <span className="text-sm text-chrome hidden md:inline">Daniel</span>
        </motion.button>
      </div>
    </motion.header>
  )
}
