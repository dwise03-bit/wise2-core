import React, { useState, useEffect, useCallback } from 'react'
import SoundLabsDashboard from './components/SoundLabsDashboard'
import { BridgeState, ControllerMode } from './types'

const BRIDGE_API_URL = import.meta.env.VITE_BRIDGE_URL || 'http://100.64.72.14:8788'
const BRIDGE_WS_URL = BRIDGE_API_URL.replace(/^http/, 'ws') + '/ws/state'

export default function App() {
  const [state, setState] = useState<BridgeState | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

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

  const triggerPad = useCallback(async (padIndex: number) => {
    try {
      const response = await fetch(`${BRIDGE_API_URL}/soundboard/trigger-pad/${padIndex}`, { method: 'POST' })
      if (!response.ok) throw new Error(`Pad ${padIndex + 1} trigger failed`)
    } catch (padError) {
      console.error('Pad trigger error:', padError)
      setError('Pad trigger unavailable')
    }
  }, [])

  const askAssistant = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    const message = prompt.trim()
    if (!message) return
    const next = [...messages, { role: 'user' as const, content: message }]
    setMessages(next)
    setPrompt('')
    try {
      const response = await fetch(`${BRIDGE_API_URL}/ai/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: next.slice(-8) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Assistant unavailable')
      setMessages((current) => [...current, { role: 'assistant', content: data.reply }])
    } catch (assistantError) {
      setMessages((current) => [...current, { role: 'assistant', content: 'WISE² GPT is offline. Check the local AI service and try again.' }])
      console.error(assistantError)
    }
  }, [messages, prompt])

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
          onPadTrigger={triggerPad}
        />
      )}
      <button className="assistant-fab" onClick={() => setAssistantOpen((open) => !open)} aria-label="Open WISE2 GPT">✦</button>
      {assistantOpen && (
        <section className="assistant-panel" aria-label="WISE2 GPT assistant">
          <div className="assistant-heading"><strong>WISE² GPT</strong><span>Sound Labs copilot</span></div>
          <div className="assistant-messages">
            {messages.length === 0 && <p className="assistant-empty">Ask for a beat idea, mix direction, arrangement, or Maschine workflow.</p>}
            {messages.map((item, index) => <p key={index} className={`assistant-message ${item.role}`}>{item.content}</p>)}
          </div>
          <form onSubmit={askAssistant} className="assistant-form"><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask WISE² GPT..." /><button type="submit">Send</button></form>
        </section>
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

.assistant-fab { position: fixed; right: 18px; bottom: 18px; z-index: 20; width: 52px; height: 52px; border: 2px solid var(--cyan); border-radius: 50%; background: #071522; color: var(--cyan); font-size: 25px; box-shadow: 0 0 24px rgba(0,229,255,.45); }
.assistant-panel { position: fixed; right: 18px; bottom: 82px; z-index: 19; width: min(360px, calc(100vw - 36px)); padding: 14px; border: 1px solid var(--cyan); border-radius: 12px; background: rgba(5,14,24,.97); box-shadow: 0 0 30px rgba(0,120,255,.3); }
.assistant-heading { display: flex; justify-content: space-between; color: var(--cyan); text-transform: uppercase; letter-spacing: .08em; font-size: 11px; }
.assistant-heading span { color: var(--text-secondary); font-size: 9px; }
.assistant-messages { max-height: 230px; overflow: auto; padding: 12px 0; }
.assistant-empty { color: var(--text-secondary); font-size: 12px; line-height: 1.5; }
.assistant-message { margin: 7px 0; padding: 8px 10px; border-radius: 8px; font-size: 12px; line-height: 1.45; white-space: pre-wrap; }
.assistant-message.user { margin-left: 24px; background: rgba(0,120,255,.25); }
.assistant-message.assistant { margin-right: 24px; background: rgba(0,255,65,.12); color: #d9ffe3; }
.assistant-form { display: flex; gap: 7px; }
.assistant-form input { min-width: 0; flex: 1; padding: 10px; border: 1px solid var(--gunmetal); background: var(--bg-input); color: white; }
.assistant-form button { padding: 0 12px; border: 1px solid var(--neon-green); background: rgba(0,255,65,.12); color: var(--neon-green); }

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
