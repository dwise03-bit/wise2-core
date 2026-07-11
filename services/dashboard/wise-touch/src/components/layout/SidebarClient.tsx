'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from './Sidebar'

export function SidebarClient() {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <Sidebar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
}
