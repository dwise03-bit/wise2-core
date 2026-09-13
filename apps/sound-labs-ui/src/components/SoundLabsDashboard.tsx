import React from 'react'
import { BridgeState, ControllerMode, MODE_COLORS } from '../types'
import VirtualMaschine from './VirtualMaschine'
import StatusPanel from './StatusPanel'
import StudioControlDeck from './StudioControlDeck'

interface Props {
  state: BridgeState
  onModeSwitch: (mode: ControllerMode) => Promise<void>
  bridgeConnected: boolean
  onPadTrigger: (padIndex: number) => Promise<void>
  onTransport: (action: 'play' | 'stop' | 'pause' | 'record') => Promise<void>
}

export default function SoundLabsDashboard({ state, onModeSwitch, bridgeConnected, onPadTrigger, onTransport }: Props) {
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

      <div className="deck-toolbar" aria-label="Sound Labs command deck status">
        <div className="deck-kicker"><span className="deck-pulse" /> COMMAND DECK</div>
        <div className="deck-metrics">
          <span><b>MASCHINE</b> {midiConnected ? 'CONNECTED' : 'OFFLINE'}</span>
          <span><b>MIDI IN/OUT</b> {midiConnected ? 'READY' : 'WAITING'}</span>
          <span><b>REAPER</b> {state.reaper?.connected ? 'ONLINE' : 'OFFLINE'}</span>
          <span><b>AI ROUTE</b> LOCAL-FIRST</span>
        </div>
        <span className="deck-save">SESSION READY</span>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="content-left">
          {/* Virtual MASCHINE */}
          <VirtualMaschine
            mode={currentMode}
            midiConnected={midiConnected}
            recentActions={state.state.recent_actions}
            onPadTrigger={onPadTrigger}
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

      <StudioControlDeck reaperOnline={Boolean(state.reaper?.connected)} onTransport={onTransport} />

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-info">
          <span>Bridge v0.1.0</span>
          <span>•</span>
          <span>{state.state.state.last_action || 'Ready'}</span>
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

.deck-toolbar { display: flex; align-items: center; gap: 20px; padding: 10px 30px; border-bottom: 1px solid rgba(0, 229, 255, .14); background: rgba(4, 13, 22, .92); color: var(--text-secondary); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
.deck-kicker { display: flex; align-items: center; gap: 8px; color: var(--cyan); font-weight: 800; white-space: nowrap; }
.deck-pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--neon-green); box-shadow: 0 0 12px var(--neon-green); }
.deck-metrics { display: flex; flex: 1; justify-content: center; gap: 24px; flex-wrap: wrap; }
.deck-metrics b { margin-right: 5px; color: var(--text-muted); font-size: 9px; }
.deck-save { color: var(--neon-green); white-space: nowrap; }
.studio-deck-panels { display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; padding: 0 30px 18px; }
.control-card { border: 1px solid rgba(0, 155, 255, .32); background: linear-gradient(145deg, rgba(8, 25, 40, .98), rgba(7, 12, 20, .98)); padding: 14px; }
.control-heading { display: flex; justify-content: space-between; align-items: center; color: var(--cyan); font-size: 11px; letter-spacing: .12em; }
.control-heading span { display: flex; align-items: center; gap: 7px; }
.control-heading b { font-size: 9px; color: var(--neon-green); }.control-heading b.offline { color: var(--accent-red); }
.transport-row { display: flex; gap: 8px; margin-top: 14px; }.transport-row button, .live-launch { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; border: 1px solid rgba(0, 229, 255, .38); background: rgba(0, 110, 190, .12); color: white; padding: 8px 13px; font-size: 10px; letter-spacing: .1em; }.transport-row button:disabled { opacity: .35; }.timeline { display: flex; align-items: center; gap: 10px; margin-top: 13px; color: var(--text-secondary); font-size: 10px; }.timeline i { flex: 1; height: 2px; background: linear-gradient(90deg, var(--neon-green), var(--electric-blue)); }.live-card p { margin: 12px 0; color: var(--text-secondary); font-size: 12px; }.live-launch { color: var(--neon-green); border-color: var(--neon-green); }.collab-line { display: flex; align-items: center; gap: 6px; margin-top: 12px; color: var(--text-muted); font-size: 10px; }

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
  .studio-deck-panels { grid-template-columns: 1fr; padding: 0 12px 12px; }
  .transport-row { flex-wrap: wrap; }.transport-row button { flex: 1 1 40%; }
}

@media (max-width: 640px) {
  .dashboard {
    min-height: 100dvh;
    overflow: auto;
  }

  .dashboard-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
    padding: 16px;
  }

  .deck-toolbar { align-items: flex-start; flex-direction: column; gap: 8px; padding: 10px 16px; }
  .deck-metrics { justify-content: flex-start; gap: 8px 14px; line-height: 1.3; }

  .dashboard-title {
    flex-wrap: wrap;
    gap: 6px 9px;
    font-size: 21px;
    letter-spacing: -.5px;
  }

  .subtitle {
    font-size: 9px;
    letter-spacing: 1.2px;
  }

  .header-right,
  .status-indicator {
    width: 100%;
  }

  .status-indicator {
    justify-content: center;
    padding: 10px 12px;
  }

  .dashboard-content {
    display: block;
    padding: 12px;
    overflow: visible;
  }

  .content-left,
  .content-right {
    width: 100%;
    min-width: 0;
  }

  .content-right {
    margin-top: 12px;
    overflow: visible;
  }

  .dashboard-content {
    background:
      radial-gradient(circle at 50% 8%, rgba(0, 111, 255, .16), transparent 36%),
      linear-gradient(180deg, #050b12 0%, #07111a 100%);
  }

  .virtual-maschine {
    box-shadow: 0 0 26px rgba(0, 143, 255, .16), inset 0 1px 0 rgba(255,255,255,.08);
  }

  .content-right .panel-card {
    border-color: rgba(0, 163, 255, .35);
    background: linear-gradient(145deg, rgba(7, 27, 43, .98), rgba(5, 12, 20, .98));
  }

  .dashboard-footer {
    padding: 10px 16px;
  }

  .footer-info {
    flex-wrap: wrap;
    font-size: 10px;
  }
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
