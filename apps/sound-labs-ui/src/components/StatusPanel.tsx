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
.status-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.panel-card {
  padding: 16px;
  background: linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-dark) 100%);
  border: 1px solid rgba(100, 100, 100, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--neon-green);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 255, 65, 0.2);
}

.mode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode-button {
  padding: 12px;
  background: var(--bg-input);
  border: 2px solid var(--gunmetal);
  border-radius: 4px;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  color: var(--text-secondary);
}

.mode-button:hover:not(:disabled) {
  border-color: var(--silver);
  transform: translateY(-2px);
}

.mode-button.active {
  color: white;
}

.mode-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.mode-value {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.status-item > span:first-child {
  color: var(--text-secondary);
}

.status-value {
  color: var(--text-primary);
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid var(--gunmetal);
  color: var(--text-secondary);
}

.status-badge.active {
  border-color: var(--neon-green);
  color: var(--neon-green);
  background: rgba(0, 255, 65, 0.05);
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.action-item {
  padding: 8px;
  background: rgba(100, 100, 100, 0.1);
  border-left: 2px solid var(--electric-blue);
  border-radius: 2px;
  font-size: 11px;
}

.action-text {
  color: var(--text-secondary);
  font-family: 'Monaco', 'Courier New', monospace;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  padding: 20px 0;
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
