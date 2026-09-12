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
  const [prevMode, setPrevMode] = useState(mode)
  const [modeTransition, setModeTransition] = useState(false)
  const [hoveredPad, setHoveredPad] = useState<number | null>(null)
  const modeColor = MODE_COLORS[mode]
  const labels = LABEL_MAP[mode]

  // Trigger mode transition effect
  useEffect(() => {
    if (prevMode !== mode) {
      setModeTransition(true)
      const timer = setTimeout(() => setModeTransition(false), 300)
      setPrevMode(mode)
      return () => clearTimeout(timer)
    }
  }, [mode, prevMode])

  // Light up pads when actions are triggered
  useEffect(() => {
    if (recentActions.length === 0) return

    const lastAction = recentActions[recentActions.length - 1]
    if (lastAction?.context?.note !== undefined) {
      const padIndex = lastAction.context.note % 16
      setActivePads(new Set([padIndex]))

      // Fade out after 250ms
      const timer = setTimeout(() => {
        setActivePads(new Set())
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [recentActions])

  const handlePadClick = (padIndex: number) => {
    setActivePads(new Set([padIndex]))
    setTimeout(() => setActivePads(new Set()), 250)
  }

  return (
    <div className={`virtual-maschine ${modeTransition ? 'mode-transition' : ''}`}>
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
                  className={`pad ${activePads.has(padIndex) ? 'active' : ''} ${hoveredPad === padIndex ? 'hovered' : ''}`}
                  style={{
                    borderColor: modeColor,
                    boxShadow: activePads.has(padIndex)
                      ? `0 0 30px ${modeColor}, 0 0 60px ${modeColor}cc, inset 0 0 20px ${modeColor}66`
                      : `inset 0 0 8px rgba(0,0,0,0.6), 0 0 1px ${modeColor}33`,
                  }}
                  onClick={() => handlePadClick(padIndex)}
                  onMouseEnter={() => setHoveredPad(padIndex)}
                  onMouseLeave={() => setHoveredPad(null)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="pad-label">{labels[padIndex]}</div>
                  <div className="pad-number">{padIndex + 1}</div>
                  <div className="pad-ripple"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="maschine-footer">
        <div className="mode-indicator" style={{ borderTopColor: modeColor }}>
          Mode: <span style={{ color: modeColor, transition: 'color 300ms ease' }}>{mode.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}

const styles = `
@keyframes padPulse {
  0% { box-shadow: 0 0 30px var(--mode-color), 0 0 60px var(--mode-color)cc, inset 0 0 20px var(--mode-color)66; }
  50% { box-shadow: 0 0 40px var(--mode-color), 0 0 80px var(--mode-color)dd, inset 0 0 25px var(--mode-color)88; }
  100% { box-shadow: 0 0 30px var(--mode-color), 0 0 60px var(--mode-color)cc, inset 0 0 20px var(--mode-color)66; }
}

@keyframes ripple {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

@keyframes gridReveal {
  0% { opacity: 0.7; filter: hue-rotate(-15deg); }
  100% { opacity: 1; filter: hue-rotate(0deg); }
}

@keyframes modeColorShift {
  0% { color: var(--text-secondary); }
  50% { color: var(--mode-color); opacity: 0.8; }
  100% { color: var(--mode-color); opacity: 1; }
}

.virtual-maschine {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, var(--bg-panel) 0%, var(--bg-dark) 100%);
  border: 1px solid rgba(100, 100, 100, 0.2);
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.virtual-maschine.mode-transition {
  animation: gridReveal 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.maschine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(100, 100, 100, 0.15);
}

.maschine-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--chrome);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.maschine-status {
  font-size: 11px;
  padding: 8px 14px;
  border-radius: 6px;
  background: rgba(100, 100, 100, 0.08);
  border: 1px solid var(--gunmetal);
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 200ms ease;
}

.maschine-status.connected {
  border-color: rgba(0, 255, 136, 0.4);
  color: var(--neon-green);
  background: rgba(0, 255, 136, 0.05);
  box-shadow: inset 0 0 8px rgba(0, 255, 136, 0.1);
}

.maschine-status.disconnected {
  border-color: rgba(255, 100, 100, 0.4);
  color: var(--accent-red);
  background: rgba(255, 100, 100, 0.05);
  box-shadow: inset 0 0 8px rgba(255, 100, 100, 0.1);
}

.maschine-body {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 0;
}

.pad-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pad-row {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.pad {
  width: 76px;
  height: 76px;
  border: 2px solid;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 22, 0.9) 100%);
  cursor: pointer;
  transition: transform 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              box-shadow 150ms ease,
              border-color 150ms ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  will-change: transform, box-shadow;
}

.pad:hover:not(.active) {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.3),
    inset 0 0 8px rgba(100, 100, 100, 0.2),
    0 0 20px rgba(100, 255, 200, 0.1);
}

.pad.hovered:not(.active)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.pad.active {
  transform: scale(0.96);
  animation: padPulse 200ms ease-out;
}

.pad-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.pad.active .pad-ripple {
  animation: ripple 400ms ease-out;
}

.pad-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: var(--text-primary);
  text-transform: uppercase;
  text-align: center;
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.pad-number {
  font-size: 8px;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 0.7;
  position: relative;
  z-index: 2;
}

.maschine-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(100, 100, 100, 0.15);
}

.mode-indicator {
  font-size: 12px;
  color: var(--text-secondary);
  padding-top: 12px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 500;
}

.mode-indicator span {
  animation: modeColorShift 300ms ease;
}

@media (max-width: 768px) {
  .virtual-maschine {
    padding: 16px;
    gap: 12px;
  }

  .pad {
    width: 64px;
    height: 64px;
  }

  .pad-label {
    font-size: 9px;
  }

  .pad-grid {
    gap: 10px;
  }

  .pad-row {
    gap: 10px;
  }
}

@media (max-width: 640px) {
  .virtual-maschine {
    gap: 12px;
    padding: 14px;
    border-radius: 10px;
  }

  .maschine-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 12px;
  }

  .maschine-title {
    font-size: 13px;
    letter-spacing: 1.2px;
  }

  .maschine-status {
    width: 100%;
    text-align: center;
  }

  .pad-grid {
    gap: 6px;
  }

  .pad-row {
    gap: 6px;
  }

  .pad {
    min-width: 0;
    min-height: 64px;
    padding: 7px 3px;
    border-radius: 7px;
    touch-action: manipulation;
  }

  .pad-label {
    font-size: 8px;
    letter-spacing: 0;
    line-height: 1.1;
    overflow-wrap: anywhere;
  }

  .pad-number {
    font-size: 9px;
  }
}
`

const styleEl = document.createElement('style')
styleEl.textContent = styles
document.head.appendChild(styleEl)
