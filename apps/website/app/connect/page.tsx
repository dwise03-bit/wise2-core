'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Check, CircleStop, Mic, Pause, Play, RotateCcw, Save, ShieldCheck, Square, Video, WifiOff } from 'lucide-react';
import './connect.css';

type CaptureType = 'audio' | 'video';
type Capture = { id: string; type: CaptureType; createdAt: string; duration: number; status: 'LOCAL' | 'SYNC'; blob?: Blob };

const DB_NAME = 'wise2-connect-captures';
const STORE = 'captures';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCaptures(): Promise<Capture[]> {
  if (!('indexedDB' in window)) return [];
  const db = await openDb();
  return new Promise((resolve) => { const r = db.transaction(STORE).objectStore(STORE).getAll(); r.onsuccess = () => resolve((r.result as Capture[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt))); });
}

async function saveCapture(capture: Capture) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => { const r = db.transaction(STORE, 'readwrite').objectStore(STORE).put(capture); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error); });
}

const formatDuration = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export default function ConnectPage() {
  const [mode, setMode] = useState<CaptureType>('audio');
  const [state, setState] = useState<'idle' | 'recording' | 'paused' | 'preview'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [message, setMessage] = useState('Ready when you are. Nothing is captured without your permission.');
  const [auditMessage, setAuditMessage] = useState('');
  const [discordMessage, setDiscordMessage] = useState('');
  const recorder = useRef<MediaRecorder | undefined>(undefined);
  const stream = useRef<MediaStream | undefined>(undefined);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const tick = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => { readCaptures().then(setCaptures).catch(() => setMessage('Local storage is unavailable in this browser.')); return () => { stream.current?.getTracks().forEach(t => t.stop()); if (tick.current) clearInterval(tick.current); }; }, []);

  const start = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error('This browser does not support local recording.');
      stream.current = await navigator.mediaDevices.getUserMedia(mode === 'video' ? { video: true, audio: true } : { audio: true });
      chunks.current = [];
      recorder.current = new MediaRecorder(stream.current);
      recorder.current.ondataavailable = e => e.data.size && chunks.current.push(e.data);
      recorder.current.onstop = () => { const blob = new Blob(chunks.current, { type: recorder.current?.mimeType || (mode === 'video' ? 'video/webm' : 'audio/webm') }); setPreviewUrl(URL.createObjectURL(blob)); setState('preview'); if (tick.current) clearInterval(tick.current); stream.current?.getTracks().forEach(t => t.stop()); };
      recorder.current.start(); startedAt.current = Date.now(); setElapsed(0); setState('recording'); setMessage(`Recording ${mode} locally. Everyone should know recording is active.`); tick.current = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 250);
    } catch (error) { setMessage(error instanceof DOMException && error.name === 'NotAllowedError' ? 'Permission was denied. Allow microphone/camera access to record.' : error instanceof Error ? error.message : 'Recording could not start.'); setState('idle'); }
  };
  const pause = () => { if (!recorder.current) return; if (state === 'recording') { recorder.current.pause(); setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)); setState('paused'); setMessage('Recording paused.'); } else { recorder.current.resume(); startedAt.current = Date.now() - elapsed * 1000; setState('recording'); setMessage('Recording resumed.'); } };
  const stop = () => { recorder.current?.stop(); };
  const discard = () => { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(undefined); chunks.current = []; setElapsed(0); setState('idle'); setMessage('Capture discarded.'); };
  const save = async () => { const blob = new Blob(chunks.current); const capture: Capture = { id: crypto.randomUUID(), type: mode, createdAt: new Date().toISOString(), duration: elapsed, status: 'LOCAL', blob }; await saveCapture(capture); setCaptures(await readCaptures()); setMessage('Saved locally. Audit Record is ready for this capture.'); setState('idle'); };
  const createAudit = (capture: Capture) => setAuditMessage(`Audit Record created · ${new Date(capture.createdAt).toLocaleString()} · ${capture.type} · ${formatDuration(capture.duration)} · ${capture.status}`);
  const notifyDiscord = async (capture: Capture) => { setDiscordMessage('Sending capture metadata to Discord…'); try { const response = await fetch('/api/connect/captures/discord', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: capture.type, duration: capture.duration, createdAt: capture.createdAt, status: capture.status }) }); const result = await response.json(); setDiscordMessage(result.sent ? 'Discord notified.' : result.configured === false ? 'Discord webhook is not configured on this deployment.' : 'Discord notification failed.'); } catch { setDiscordMessage('Discord notification failed.'); } };

  return <main className="connect-shell">
    <header className="connect-header"><div><div className="eyebrow">WISE² / CONNECT</div><h1>Collaboration, with a clear record.</h1><p>Private by default. Local-first. Every recording is visible and consent-aware.</p></div><div className="state-pill"><WifiOff size={15} /> LOCAL <span>•</span> LIVE READY</div></header>
    <section className="connect-grid">
      <div className="record-card"><div className="card-top"><div><span className="eyebrow">QUICK CAPTURE</span><h2>Make a record</h2></div><ShieldCheck className="blue-icon" /></div><p className="consent">Recording starts only after browser permission. Keep participants informed before you begin.</p>
        <div className="mode-tabs"><button className={mode === 'audio' ? 'active' : ''} onClick={() => setMode('audio')} disabled={state !== 'idle'}><Mic size={18} /> Audio</button><button className={mode === 'video' ? 'active' : ''} onClick={() => setMode('video')} disabled={state !== 'idle'}><Video size={18} /> Video + audio</button></div>
        <div className={`record-orb ${state === 'recording' ? 'is-recording' : ''}`}><div className="orb-center">{state === 'preview' ? <Check size={34} /> : mode === 'video' ? <Camera size={34} /> : <Mic size={34} />}<strong>{formatDuration(elapsed)}</strong><small>{state === 'recording' ? 'RECORDING' : state === 'paused' ? 'PAUSED' : state === 'preview' ? 'PREVIEW' : 'READY'}</small></div></div>
        <div className="controls">{state === 'idle' && <button className="primary" onClick={start}><CircleStop size={18} /> Start {mode}</button>}{(state === 'recording' || state === 'paused') && <><button className="primary" onClick={pause}>{state === 'paused' ? <Play size={18} /> : <Pause size={18} />} {state === 'paused' ? 'Resume' : 'Pause'}</button><button className="danger" onClick={stop}><Square size={17} /> Stop</button></>}{state === 'preview' && <><button className="primary" onClick={save}><Save size={18} /> Save locally</button><button className="ghost" onClick={discard}><RotateCcw size={17} /> Discard</button></>}</div>
        <div className="status-line"><span className={state === 'recording' ? 'dot live' : 'dot'} /> {message}</div>
        {previewUrl && <div className="preview">{mode === 'video' ? <video controls src={previewUrl} /> : <audio controls src={previewUrl} />}<span>Preview only until you choose Save locally.</span></div>}
      </div>
      <aside className="recent-card"><div className="card-top"><div><span className="eyebrow">RECENT CAPTURES</span><h2>Local library</h2></div><span className="sync-badge">LOCAL</span></div><p className="muted">Available offline on this device. Sync is opt-in.</p>{captures.length === 0 ? <div className="empty">No saved captures yet.<br />Your next record will appear here.</div> : <div className="capture-list">{captures.map(c => <div className="capture-row" key={c.id}><span className={`type-icon ${c.type}`}>{c.type === 'video' ? <Video size={16} /> : <Mic size={16} />}</span><div><strong>{c.type === 'video' ? 'Video + audio' : 'Audio note'}</strong><small>{new Date(c.createdAt).toLocaleString()} · {formatDuration(c.duration)}</small></div><button className="audit-button" onClick={() => createAudit(c)}>Audit</button><button className="discord-button" onClick={() => notifyDiscord(c)}>Discord</button><span className="local-label">{c.status}</span></div>)}</div>}<div className="audit-note"><Check size={16} /><span>Saved captures can create an <b>Audit Record</b> with timestamp, type, duration, and local status.</span></div>{auditMessage && <div className="audit-success"><Check size={15} /> {auditMessage}</div>}{discordMessage && <div className="discord-success">{discordMessage}</div>}</aside>
    </section>
  </main>;
}
