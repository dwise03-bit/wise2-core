import React, { useState } from 'react'

interface Props { reaperOnline: boolean; onTransport: (action: 'play' | 'stop' | 'pause' | 'record') => Promise<void> }

export default function StudioControlDeck({ reaperOnline, onTransport }: Props) {
  const [busy, setBusy] = useState(false)
  const send = async (action: 'play' | 'stop' | 'pause' | 'record') => { setBusy(true); try { await onTransport(action) } finally { setBusy(false) } }
  return <section className="studio-deck-panels" aria-label="Studio control deck">
    <div className="control-card reaper-card">
      <div className="control-heading"><span>REAPER STUDIO</span><b className={reaperOnline ? 'online' : 'offline'}>{reaperOnline ? 'ONLINE' : 'OFFLINE'}</b></div>
      <div className="transport-row">{([['play', '▶', 'PLAY'], ['stop', '■', 'STOP'], ['pause', 'Ⅱ', 'PAUSE'], ['record', '●', 'RECORD']] as const).map(([action, glyph, label]) => <button key={action} disabled={busy || !reaperOnline} onClick={() => send(action)} aria-label={label}><strong>{glyph}</strong><span>{label}</span></button>)}</div>
      <div className="timeline"><span>00:00:00</span><i /><span>120 BPM · 4/4</span></div>
    </div>
    <div className="control-card live-card">
      <div className="control-heading"><span>LIVE STREAM</span><b className="offline">OFFLINE</b></div>
      <p>Stream controls are ready for the WISE² Live Studio.</p>
      <button className="live-launch" onClick={() => window.open('/live-studio/dashboard', '_blank')}>OPEN LIVE STUDIO</button>
      <div className="collab-line">DISCORD COLLABORATION AVAILABLE IN LIVE STUDIO</div>
    </div>
  </section>
}
