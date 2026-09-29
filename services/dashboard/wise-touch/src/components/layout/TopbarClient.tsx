'use client'

import React, { useState, useEffect } from 'react'
import { Topbar } from './Topbar'

export function TopbarClient() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Topbar
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      sidebarOpen={sidebarOpen}
    />
  )
}
