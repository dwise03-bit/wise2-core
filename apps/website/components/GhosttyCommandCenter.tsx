'use client'

import React, { useState, useEffect } from 'react'

export default function GhosttyCommandCenter() {
  const [status, setStatus] = useState('connecting')
  const [metrics, setMetrics] = useState({
    uptime: '0h 0m',
    tasks: 0,
    activeConnections: 0,
    cpuUsage: 0,
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/ghostty/health')
        if (res.ok) {
          setStatus('online')
          const data = await res.json()
          setMetrics(data.metrics || metrics)
        }
      } catch (err) {
        setStatus('offline')
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-8 border border-cyan-500/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🎛️ Ghostty Command Center
          </h2>
          <p className="text-slate-400 text-sm">Terminal control interface for WISE² operations</p>
        </div>
        <div className={`px-3 py-1 rounded text-sm font-semibold ${
          status === 'online'
            ? 'bg-green-500/20 text-green-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {status.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded p-4 border border-cyan-500/10">
          <p className="text-slate-400 text-xs mb-2">UPTIME</p>
          <p className="text-cyan-400 text-xl font-mono">{metrics.uptime}</p>
        </div>
        <div className="bg-slate-800/50 rounded p-4 border border-green-500/10">
          <p className="text-slate-400 text-xs mb-2">TASKS</p>
          <p className="text-green-400 text-xl font-mono">{metrics.tasks}</p>
        </div>
        <div className="bg-slate-800/50 rounded p-4 border border-gold/10">
          <p className="text-slate-400 text-xs mb-2">CONNECTIONS</p>
          <p className="text-yellow-400 text-xl font-mono">{metrics.activeConnections}</p>
        </div>
        <div className="bg-slate-800/50 rounded p-4 border border-red-500/10">
          <p className="text-slate-400 text-xs mb-2">CPU</p>
          <p className="text-red-400 text-xl font-mono">{metrics.cpuUsage}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded font-semibold transition">
            📊 Dashboard
          </button>
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-semibold transition">
            💬 Discord
          </button>
          <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded font-semibold transition">
            💰 Revenue
          </button>
        </div>
        <p className="text-slate-500 text-xs text-center">
          CLI: <code className="bg-slate-900 px-2 py-1 rounded">wise [command]</code>
        </p>
      </div>
    </div>
  )
}
