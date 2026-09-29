import React, { useState } from 'react'
import { BridgeState, ControllerMode } from '../types'

interface Props {
  state: BridgeState
  currentMode: ControllerMode
  modeColor: string
  onModeSwitch: (mode: ControllerMode) => Promise<void>
}

export default function StatusPanel({
  state,
  currentMode,
  modeColor,
  onModeSwitch,
}: Props) {
  const [switching, setSwitching] = useState(false)

  const handleModeSwitch = async (mode: ControllerMode) => {
    if (mode === currentMode) return
    setSwitching(true)
    try {
      await onModeSwitch(mode)
    } finally {
      setSwitching(false)
    }
  }

  const modes: ControllerMode[] = ['normal', 'ai', 'live', 'wise2']
  const modeNames = {
    normal: 'Studio',
    ai: 'AI Tools',
    live: 'Performance',
    wise2: 'Business',
  }

  return (
    <div className="status-panel">
      {/* Mode Selector */}
      <div className="panel-card">
        <h4 className="panel-title">Controller Mode</h4>
        <div className="mode-grid">
          {modes.map((mode) => (
            <button
              key={mode}
              className={`mode-button ${mode === currentMode ? 'active' : ''}`}
              onClick={() => handleModeSwitch(mode)}
              disabled={switching}
              style={
                mode === currentMode
                  ? {
                      borderColor: modeColor,
                      boxShadow: `0 0 15px ${modeColor}`,
                    }
                  : {}
              }
            >
              <div className="mode-name">{modeNames[mode]}</div>
              <div className="mode-value">{mode.toUpperCase()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* MIDI Status */}
      <div className="panel-card">
        <h4 className="panel-title">MIDI Status</h4>
        <div className="status-list">
          <div className="status-item">
            <span>Input Port</span>
            <span className="status-value">
              {state.midi.input_port || 'Not Connected'}
            </span>
          </div>
          <div className="status-item">
            <span>Output Port</span>
            <span className="status-value">
              {state.midi.output_port || 'Not Connected'}
            </span>
          </div>
          <div className="status-item">
            <span>Connection</span>
            <span className={`status-badge ${state.midi.connected ? 'active' : ''}`}>
              {state.midi.connected ? '🟢 Connected' : '🔴 Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* REAPER Status */}
      <div className="panel-card">
        <h4 className="panel-title">REAPER Status</h4>
        <div className="status-list">
          <div className="status-item">
            <span>DAW</span>
            <span className={`status-badge ${state.reaper?.connected ? 'active' : ''}`}>
              {state.reaper?.connected ? '🟢 Ready' : '🔴 Offline'}
            </span>
          </div>
          {state.reaper && (
            <>
              <div className="status-item">
                <span>Project</span>
                <span className="status-value">{state.reaper.project_name || 'Untitled'}</span>
              </div>
              <div className="status-item">
                <span>BPM</span>
                <span className="status-value">{state.reaper.bpm || '120'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Status */}
      <div className="panel-card">
        <h4 className="panel-title">AI Status</h4>
        <div className="status-list">
          <div className="status-item">
            <span>Local AI</span>
            <span className="status-badge active">🟢 Ready</span>
          </div>
          <div className="status-item">
            <span>Active Jobs</span>
            <span className="status-value">{state.ai.active_jobs}</span>
          </div>
          <div className="status-item">
            <span>Models</span>
            <span className="status-value">{state.ai.available_models.length}</span>
          </div>
        </div>
      </div>

      {/* Recent Actions */}
      <div className="panel-card">
        <h4 className="panel-title">Recent Actions</h4>
        <div className="actions-list">
          {state.state.recent_actions.slice(-5).reverse().map((action, idx) => (
            <div key={idx} className="action-item">
              <span className="action-text">{action.action}</span>
            </div>
          ))}
          {state.state.recent_actions.length === 0 && (
            <p className="empty-state">No recent actions</p>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = `
@keyframes buttonPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.05); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.status-panel::-webkit-scrollbar {
  width: 6px;
}

.status-panel::-webkit-scrollbar-track {
  background: transparent;
}

.status-panel::-webkit-scrollbar-thumb {
  background: rgba(100, 100, 100, 0.3);
  border-radius: 3px;
}

.status-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 100, 0.5);
}

.panel-card {
  padding: 18px;
  background: linear-gradient(135deg, rgba(30, 30, 35, 0.6) 0%, rgba(20, 20, 22, 0.8) 100%);
  border: 1px solid rgba(100, 100, 100, 0.15);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  animation: slideInUp 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.panel-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--neon-green);
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 255, 65, 0.25);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.mode-button {
  padding: 14px 12px;
  background: linear-gradient(135deg, rgba(40, 40, 45, 0.8) 0%, rgba(25, 25, 28, 0.9) 100%);
  border: 2px solid rgba(100, 100, 100, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-weight: 500;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  overflow: hidden;
}

.mode-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 300ms ease;
}

.mode-button:hover:not(:disabled)::before {
  left: 100%;
}

.mode-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, rgba(50, 50, 55, 0.9) 0%, rgba(35, 35, 38, 1) 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.mode-button.active {
  color: white;
  border-color: var(--neon-green);
  background: linear-gradient(135deg, rgba(0, 255, 100, 0.1) 0%, rgba(0, 180, 80, 0.05) 100%);
  box-shadow:
    0 0 20px rgba(0, 255, 100, 0.3),
    inset 0 0 15px rgba(0, 255, 100, 0.1);
  animation: buttonPulse 2s infinite;
}

.mode-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.mode-name {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.mode-value {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 2;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(100, 100, 100, 0.1);
}

.status-item:last-child {
  border-bottom: none;
}

.status-item > span:first-child {
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.3px;
}

.status-value {
  color: var(--text-primary);
  font-weight: 600;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.status-badge {
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid rgba(100, 100, 100, 0.3);
  color: var(--text-secondary);
  letter-spacing: 0.3px;
  transition: all 200ms ease;
}

.status-badge.active {
  border-color: rgba(0, 255, 65, 0.5);
  color: var(--neon-green);
  background: rgba(0, 255, 65, 0.08);
  box-shadow: inset 0 0 8px rgba(0, 255, 65, 0.1);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 180px;
  overflow-y: auto;
}

.action-item {
  padding: 10px 12px;
  background: linear-gradient(90deg, rgba(70, 150, 255, 0.05) 0%, transparent 100%);
  border-left: 3px solid var(--electric-blue);
  border-radius: 4px;
  font-size: 11px;
  transition: all 150ms ease;
  animation: slideInUp 300ms ease;
}

.action-item:hover {
  background: linear-gradient(90deg, rgba(70, 150, 255, 0.08) 0%, transparent 100%);
  border-left-color: rgba(70, 150, 255, 0.8);
  transform: translateX(2px);
}

.action-text {
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 10px;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  padding: 24px 0;
  font-style: italic;
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
