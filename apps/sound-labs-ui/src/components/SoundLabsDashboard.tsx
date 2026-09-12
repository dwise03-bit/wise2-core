import React from 'react'
import { BridgeState, ControllerMode, MODE_COLORS } from '../types'
import VirtualMaschine from './VirtualMaschine'
import StatusPanel from './StatusPanel'

interface Props {
  state: BridgeState
  onModeSwitch: (mode: ControllerMode) => Promise<void>
  bridgeConnected: boolean
}

export default function SoundLabsDashboard({ state, onModeSwitch, bridgeConnected }: Props) {
  const midiConnected = state.midi.connected
  const currentMode = state.mode.current_mode
  const modeColor = MODE_COLORS[currentMode]

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            <span className="title-prefix">WISE²</span>
            <span className="title-main">SOUND LABS</span>
          </h1>
          <div className="subtitle">CREATE | CAPTURE | COLLABORATE | MONETIZE</div>
        </div>

        <div className="header-right">
          <div className={`status-indicator ${bridgeConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{bridgeConnected ? 'Bridge Connected' : 'Bridge Offline'}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="content-left">
          {/* Virtual MASCHINE */}
          <VirtualMaschine
            mode={currentMode}
            midiConnected={midiConnected}
            recentActions={state.state.recent_actions}
          />
        </div>

        <div className="content-right">
          {/* Status Panels */}
          <StatusPanel
            state={state}
            currentMode={currentMode}
            modeColor={modeColor}
            onModeSwitch={onModeSwitch}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-info">
          <span>Bridge v0.1.0</span>
          <span>•</span>
          <span>{state.state.last_action || 'Ready'}</span>
        </div>
      </footer>
    </div>
  )
}

const styles = `
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-black) 0%, #0f0f0f 100%);
  overflow: hidden;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.1);
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(10px);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dashboard-title {
  display: flex;
  gap: 12px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
}

.title-prefix {
  color: var(--electric-blue);
  text-transform: uppercase;
}

.title-main {
  color: var(--neon-green);
  text-transform: uppercase;
}

.subtitle {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.header-right {
  display: flex;
  gap: 20px;
  align-items: center;
}

.status-indicator {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  background: rgba(100, 100, 100, 0.1);
  font-size: 13px;
  font-weight: 500;
}

.status-indicator.connected {
  border: 1px solid var(--neon-green);
  color: var(--neon-green);
}

.status-indicator.disconnected {
  border: 1px solid var(--accent-red);
  color: var(--accent-red);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.connected .status-dot {
  background: var(--neon-green);
  animation: pulse 2s infinite;
}

.status-indicator.disconnected .status-dot {
  background: var(--accent-red);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Content */
.dashboard-content {
  display: flex;
  gap: 20px;
  flex: 1;
  padding: 20px 30px;
  overflow: auto;
}

.content-left {
  flex: 1;
  min-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-right {
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* Footer */
.dashboard-footer {
  padding: 12px 30px;
  border-top: 1px solid rgba(0, 255, 65, 0.1);
  background: rgba(10, 10, 10, 0.8);
  font-size: 12px;
  color: var(--text-muted);
}

.footer-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Responsive */
@media (max-width: 1400px) {
  .dashboard-content {
    flex-direction: column;
  }

  .content-left {
    min-width: auto;
  }

  .content-right {
    width: 100%;
  }
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
