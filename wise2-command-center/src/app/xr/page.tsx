'use client';

import { useMemo, useState } from 'react';
import { useSystemStatus } from '@/hooks/useSystemStatus';
import './xr.css';

type Station = { id: string; label: string; subtitle: string; glyph: string; state: 'LIVE' | 'DEMO' | 'UNAVAILABLE'; metric: string; detail: string };
const stations: Station[] = [
  { id: 'hvac', label: 'HVAC', subtitle: 'FIELD OPERATIONS', glyph: '⌁', state: 'DEMO', metric: '04 JOBS', detail: 'Work orders and technician context ready for API connection.' },
  { id: 'crm', label: 'CRM', subtitle: 'SALES PIPELINE', glyph: '◇', state: 'DEMO', metric: '12 LEADS', detail: 'Pipeline workspace prepared for authorized lead actions.' },
  { id: 'cloud', label: 'CLOUD', subtitle: 'INFRASTRUCTURE', glyph: '◌', state: 'LIVE', metric: 'STATUS LINKED', detail: 'Live status service connected. Detailed telemetry is unavailable.' },
  { id: 'agents', label: 'AI AGENTS', subtitle: 'OPERATIONS WALL', glyph: '✦', state: 'DEMO', metric: '06 ACTIVE', detail: 'Agent visualization awaits the existing orchestration feed.' },
  { id: 'clients', label: 'CLIENT COMMAND', subtitle: 'BUSINESS SPACES', glyph: '▦', state: 'DEMO', metric: '05 SPACES', detail: 'Configured client workspaces can be opened from the launcher.' },
  { id: 'comms', label: 'COMMS', subtitle: 'UNIFIED INBOX', glyph: '⌁', state: 'UNAVAILABLE', metric: 'NO TELEMETRY', detail: 'No live communications feed is exposed to this workspace.' },
];

export default function XRCommandCenterPage() {
  const { status } = useSystemStatus(30000);
  const [activeStation, setActiveStation] = useState('cloud');
  const [mode, setMode] = useState<'FOCUS' | 'COMMAND'>('COMMAND');
  const [listening, setListening] = useState(false);
  const [command, setCommand] = useState('Ask WISE² what is happening across the business…');
  const active = useMemo(() => stations.find((station) => station.id === activeStation) ?? stations[2], [activeStation]);
  const health = status.vpsOps.wise2net === 'Online' || status.access.tailscale === 'Connected' ? 'ONLINE' : 'CHECK CONNECTION';

  return <main className="xr-shell">
    <header className="xr-header"><div className="xr-brand"><span className="xr-mark">W²</span><div><strong>WISE² UNITED</strong><small>XR COMMAND CENTER</small></div></div><div className="xr-header-meta"><span className="xr-pulse" /> {health}<span className="xr-divider" /> OPERATOR: {status.access.user || 'DARRIN'}</div><a className="xr-exit" href="/dashboard">EXIT XR ↗</a></header>
    <section className={`xr-room ${mode === 'FOCUS' ? 'xr-focus' : ''}`}>
      <div className="xr-grid" /><div className="xr-room-label"><span>◉</span> MIXED REALITY WORKSPACE <small>PASSTHROUGH READY · QUEST 3 / 3S</small></div><div className="xr-orbit orbit-left" /><div className="xr-orbit orbit-right" />
      <div className="xr-core"><div className="xr-core-ring" /><div className="xr-core-letter">W²</div><span>AI CORE</span><small>READY · VOICE ONLINE</small></div>
      <div className="xr-stations">{stations.map((station) => <button key={station.id} className={`xr-station ${activeStation === station.id ? 'selected' : ''}`} onClick={() => setActiveStation(station.id)}><span className="xr-station-glyph">{station.glyph}</span><span className="xr-station-copy"><b>{station.label}</b><small>{station.subtitle}</small></span><span className={`xr-state state-${station.state.toLowerCase()}`}>{station.state}</span><strong>{station.metric}</strong></button>)}</div>
      <aside className="xr-inspector"><div className="xr-inspector-top"><span>ACTIVE STATION</span><button onClick={() => setActiveStation('cloud')}>RESET</button></div><h2>{active.label}</h2><p>{active.detail}</p><div className="xr-inspector-line"><span>DATA STATE</span><b className={`state-${active.state.toLowerCase()}`}>{active.state}</b></div><div className="xr-inspector-line"><span>PERMISSIONS</span><b>BACKEND AUTHORITY</b></div></aside>
      <div className="xr-command"><div className={`xr-listen ${listening ? 'listening' : ''}`}><span>◉</span></div><div className="xr-command-input"><small>WISE² AI VOICE</small><input value={command} onChange={(event) => setCommand(event.target.value)} onFocus={() => setListening(true)} onBlur={() => setListening(false)} /><div className="xr-suggestions"><button onClick={() => setCommand("Show today's HVAC calls")}>SHOW HVAC CALLS</button><button onClick={() => setCommand('Open CRM')}>OPEN CRM</button><button onClick={() => setCommand("What's happening with the servers?")}>SERVER STATUS</button></div></div><button className="xr-send" onClick={() => setListening(!listening)}>{listening ? 'STOP' : 'SPEAK'} ↗</button></div>
    </section>
    <footer className="xr-footer"><div><span className="xr-footer-dot" /> SYSTEMS SYNCHRONIZED <small>LAST CHECK: JUST NOW</small></div><div className="xr-mode"><button className={mode === 'FOCUS' ? 'active' : ''} onClick={() => setMode('FOCUS')}>FOCUS MODE</button><button className={mode === 'COMMAND' ? 'active' : ''} onClick={() => setMode('COMMAND')}>COMMAND MODE</button></div><div>HAND TRACKING · CONTROLLERS · GAZE</div></footer>
  </main>;
}
