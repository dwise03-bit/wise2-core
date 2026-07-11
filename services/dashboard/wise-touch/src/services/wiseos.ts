import { io, Socket } from 'socket.io-client'

const WISEOS_URL = process.env.NEXT_PUBLIC_WISEOS_URL || 'http://192.168.8.136:3000'

let socket: Socket | null = null

export interface SystemStats {
  cpu: number
  mem: number
  temp: number
}

export function initializeWiseOSConnection() {
  if (socket) return socket

  socket = io(WISEOS_URL, {
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    transports: ['websocket', 'polling'],
    upgrade: false,
  })

  socket.on('connect', () => {
    console.log('✅ Connected to WiseOS')
  })

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WiseOS')
  })

  socket.on('error', (error) => {
    console.error('WiseOS error:', error)
  })

  return socket
}

export function getWiseOSSocket() {
  if (!socket) {
    initializeWiseOSConnection()
  }
  return socket
}

export async function fetchWiseOSHealth() {
  try {
    const response = await fetch(`${WISEOS_URL}/api/health`, {
      method: 'GET',
    })
    if (!response.ok) throw new Error('Health check failed')
    return await response.json()
  } catch (error) {
    console.error('WiseOS health check failed:', error)
    return null
  }
}

export function subscribeToStats(callback: (stats: SystemStats) => void) {
  const socket = getWiseOSSocket()

  if (!socket) {
    console.warn('WiseOS socket not initialized')
    return () => {}
  }

  socket.on('stats', (stats: SystemStats) => {
    callback(stats)
  })

  return () => {
    socket?.off('stats', callback)
  }
}
