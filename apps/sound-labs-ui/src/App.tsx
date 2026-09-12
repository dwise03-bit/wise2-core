import React, { useState, useEffect, useCallback } from 'react'
import SoundLabsDashboard from './components/SoundLabsDashboard'
import { BridgeState, ControllerMode } from './types'

const BRIDGE_API_URL = import.meta.env.VITE_BRIDGE_URL || 'http://100.64.72.14:8788'
const BRIDGE_WS_URL = BRIDGE_API_URL.replace(/^http/, 'ws') + '/ws/state'

export default function App() {
  const [state, setState] = useState<BridgeState | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Connect to bridge WebSocket
  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
    let pollTimer: ReturnType<typeof setInterval> | null = null

    const fetchState = async () => {
      try {
        const response = await fetch(`${BRIDGE_API_URL}/state`, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Bridge returned ${response.status}`)
        setState(await response.json())
        setConnected(true)
        setError(null)
      } catch (e) {
        console.error('Bridge state poll failed:', e)
        setConnected(false)
        setError('Bridge connection error')
      }
    }

    fetchState()
    pollTimer = setInterval(fetchState, 3000)

    const connect = () => {
      try {
        ws = new WebSocket(BRIDGE_WS_URL)

        ws.onopen = () => {
          console.log('✅ Connected to Sound Labs bridge')
          setConnected(true)
          setError(null)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'state_update' && data.data) {
              setState(data.data)
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message:', e)
          }
        }

        ws.onerror = (event) => {
          console.error('WebSocket error:', event)
          // HTTP polling remains the mobile-safe connection path.
        }

        ws.onclose = () => {
          console.log('WebSocket closed, reconnecting...')
          setConnected(false)
          // Reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000)
        }
      } catch (e) {
        console.error('Failed to connect:', e)
        setError('Failed to connect to bridge')
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (ws) {
        ws.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      if (pollTimer) {
        clearInterval(pollTimer)
      }
    }
  }, [])

  const switchMode = useCallback(async (mode: ControllerMode) => {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/mode/${mode}`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to switch mode')
      }
    } catch (e) {
      console.error('Mode switch error:', e)
      setError('Failed to switch mode')
    }
  }, [])

  return (
    <div className="app">
      {!connected && (
        <div className="connection-banner">
          ⚠️ {error || 'Connecting to Sound Labs bridge...'}
        </div>
      )}
      {state && (
        <SoundLabsDashboard
          state={state}
          onModeSwitch={switchMode}
          bridgeConnected={connected}
        />
      )}
      {!state && connected && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Sound Labs...</p>
        </div>
      )}
    </div>
  )
}

const styles = `
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.connection-banner {
  background: var(--accent-red);
  color: white;
  padding: 12px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 1px solid rgba(0,0,0,0.2);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 20px;
  background: var(--bg-black);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 2px solid var(--gunmetal);
  border-top-color: var(--neon-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
`

// Inject styles
const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
