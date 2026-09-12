import React, { useState, useEffect } from 'react'
import { ControllerMode, MODE_COLORS } from '../types'

interface Props {
  mode: ControllerMode
  midiConnected: boolean
  recentActions: any[]
}

const PAD_LAYOUT = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
]

const NORMAL_MODE_LABELS = [
  'PLAY', 'STOP', 'RECORD', 'PAUSE',
  'LOOP', 'METRO', 'ARM', 'MUTE',
  'SOLO', 'MARKER', 'UNDO', 'REDO',
  'SAVE', 'TRACK1', 'TRACK2', 'TRACK3',
]

const AI_MODE_LABELS = [
  'GEN BEAT', 'REMIX', 'SPLIT STEMS', 'VOCAL',
  'AUTO MIX', 'MASTER', 'LYRICS', 'SOUND DES',
  'CHG STYLE', 'BPM', 'VARIATION', 'EXTEND',
  'CAPTURE', 'ASK', 'EXPORT', 'SETTINGS',
]

const LIVE_MODE_LABELS = [
  'SAMPLE 1', 'SAMPLE 2', 'SAMPLE 3', 'SAMPLE 4',
  'SAMPLE 5', 'SAMPLE 6', 'SAMPLE 7', 'SAMPLE 8',
  'LOOP 1', 'LOOP 2', 'LOOP 3', 'LOOP 4',
  'FX 1', 'FX 2', 'FX 3', 'FX 4',
]

const WISE2_MODE_LABELS = [
  'NEW', 'CLIENT', 'SAVE', 'DISCORD',
  'TRANSCRIBE', 'GEN', 'SUMMARIZE', 'REPORT',
  'SCHEDULE', 'MEET', 'SEARCH', 'UPDATE',
  'STATUS', 'REMOTE', 'BACKUP', 'MACRO',
]

const LABEL_MAP = {
  normal: NORMAL_MODE_LABELS,
  ai: AI_MODE_LABELS,
  live: LIVE_MODE_LABELS,
  wise2: WISE2_MODE_LABELS,
}

export default function VirtualMaschine({ mode, midiConnected, recentActions }: Props) {
  const [activePads, setActivePads] = useState<Set<number>>(new Set())
  const modeColor = MODE_COLORS[mode]
  const labels = LABEL_MAP[mode]

  // Light up pads when actions are triggered
  useEffect(() => {
    if (recentActions.length === 0) return

    const lastAction = recentActions[recentActions.length - 1]
    if (lastAction?.context?.note !== undefined) {
      const padIndex = lastAction.context.note % 16
      setActivePads(new Set([padIndex]))

      // Fade out after 200ms
      const timer = setTimeout(() => {
        setActivePads(new Set())
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [recentActions])

  return (
    <div className="virtual-maschine">
      <div className="maschine-header">
        <h3 className="maschine-title">MASCHINE MIKRO MK3</h3>
        <div className={`maschine-status ${midiConnected ? 'connected' : 'disconnected'}`}>
          {midiConnected ? '🎹 Connected' : '❌ Not Connected'}
        </div>
      </div>

      <div className="maschine-body">
        <div className="pad-grid">
          {PAD_LAYOUT.map((row, rowIndex) => (
            <div key={rowIndex} className="pad-row">
              {row.map((padIndex) => (
                <div
                  key={padIndex}
                  className={`pad ${activePads.has(padIndex) ? 'active' : ''}`}
                  style={{
                    borderColor: modeColor,
                    boxShadow: activePads.has(padIndex)
                      ? `0 0 20px ${modeColor}, inset 0 0 10px ${modeColor}`
                      : `inset 0 0 5px rgba(0,0,0,0.5)`,
                  }}
                >
                  <div className="pad-label">{labels[padIndex]}</div>
                  <div className="pad-number">{padIndex + 1}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="maschine-footer">
        <div className="mode-indicator" style={{ borderTopColor: modeColor }}>
          Mode: <span style={{ color: modeColor }}>{mode.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}

const styles = `
.virtual-maschine {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-dark) 100%);
  border: 1px solid rgba(100, 100, 100, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.maschine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(100, 100, 100, 0.2);
}

.maschine-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--chrome);
}

.maschine-status {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid var(--gunmetal);
  color: var(--text-secondary);
}

.maschine-status.connected {
  border-color: var(--neon-green);
  color: var(--neon-green);
}

.maschine-status.disconnected {
  border-color: var(--accent-red);
  color: var(--accent-red);
}

.maschine-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.pad-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pad-row {
  display: flex;
  gap: 12px;
}

.pad {
  width: 70px;
  height: 70px;
  border: 2px solid;
  border-radius: 4px;
  background: var(--bg-input);
  cursor: pointer;
  transition: all 100ms ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  position: relative;
  overflow: hidden;
}

.pad:hover {
  transform: scale(1.05);
}

.pad.active {
  transform: scale(0.98);
}

.pad-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  text-transform: uppercase;
  text-align: center;
}

.pad-number {
  font-size: 9px;
  color: var(--text-muted);
}

.maschine-footer {
  padding-top: 12px;
  border-top: 2px solid;
  border-color: rgba(100, 100, 100, 0.2);
}

.mode-indicator {
  font-size: 13px;
  color: var(--text-secondary);
  padding-top: 12px;
  border-top: 2px solid;
  text-transform: uppercase;
  letter-spacing: 1px;
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
