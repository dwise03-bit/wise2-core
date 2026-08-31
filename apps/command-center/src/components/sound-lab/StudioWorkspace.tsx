'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSoundLabEngine } from '../../lib/sound-lab/engine';
import {
  attachGalleryAsset,
  addComment,
  addReviewComment,
  canGenerate,
  createReviewLink,
  createVersion,
  generateMusic,
  getProject,
  getReviewProject,
  listComments,
  listGalleryAudio,
  listReviewComments,
  listVersions,
  restoreVersion,
  reviewRecordingUrl,
  saveMixerState,
  setApproval,
  setReviewApproval,
  uploadRecording,
} from '../../lib/sound-lab/api';
import { proposeProduction, masteringProposal, MASTERING_PRESETS, ProducerProposal } from '../../lib/sound-lab/ai-producer';
import { AudioClip, EffectType, TrackType, createTrack, normalizeMixerState } from '../../lib/sound-lab/types';
import { drawWaveform } from '../../lib/sound-lab/waveform';
import { estimateWavBytes, formatBytes } from '../../lib/sound-lab/wav';
import '../../styles/sound-lab.css';

const TRACK_TYPES: TrackType[] = [
  'vocal', 'instrumental', 'beat', 'drums', 'bass', 'guitar', 'keys', 'midi', 'sfx', 'reference',
];

const FX_TYPES: EffectType[] = [
  'eq', 'compressor', 'limiter', 'gate', 'reverb', 'delay', 'filter', 'distortion', 'width', 'gain',
];

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.floor((s % 1) * 10);
  return `${m}:${String(sec).padStart(2, '0')}.${ms}`;
}

function barsBeats(time: number, bpm: number, beatsPerBar: number) {
  const beat = (time * bpm) / 60;
  const bar = Math.floor(beat / beatsPerBar) + 1;
  const b = Math.floor(beat % beatsPerBar) + 1;
  return `${bar}.${b}`;
}

export default function StudioWorkspace({
  projectId,
  shareToken,
  clientMode = false,
}: {
  projectId?: string;
  shareToken?: string;
  clientMode?: boolean;
}) {
  const isShareReview = Boolean(shareToken);
  const resolvedProjectId = projectId || '';
  const { user } = useAuth();
  const engine = useSoundLabEngine();
  const fileRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('Untitled');
  const [status, setStatus] = useState('Loading…');
  const [saving, setSaving] = useState(false);
  const [gallery, setGallery] = useState<any[]>([]);
  const [liveAssets, setLiveAssets] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [proposal, setProposal] = useState<ProducerProposal | null>(null);
  const [prompt, setPrompt] = useState('');
  const [genPrompt, setGenPrompt] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [midiNotes, setMidiNotes] = useState<string[]>([]);
  const [midiSupported, setMidiSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [reviewLink, setReviewLink] = useState<string | null>(null);

  const rewriteMixForShare = useCallback((mix: ReturnType<typeof normalizeMixerState>, recordings: Array<{ id: string; s3Url: string }>) => {
    if (!shareToken) return mix;
    const byRecording = new Map(recordings.map((r) => [r.id, r]));
    return {
      ...mix,
      tracks: mix.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => {
          if (clip.recordingId && byRecording.has(clip.recordingId)) {
            return { ...clip, url: reviewRecordingUrl(shareToken, clip.recordingId) };
          }
          if (clip.url?.startsWith('/api/v1/sound-labs/audio/')) {
            const rec = recordings.find((r) => r.s3Url === clip.url);
            if (rec) return { ...clip, url: reviewRecordingUrl(shareToken, rec.id), recordingId: rec.id };
          }
          return clip;
        }),
      })),
    };
  }, [shareToken]);

  const px = engine.zoom;
  const selectedTrack = engine.state.tracks.find((t) => t.id === engine.selectedTrackId) || engine.state.tracks[0];

  const load = useCallback(async () => {
    try {
      setStatus('Opening project…');
      if (isShareReview && shareToken) {
        const project = await getReviewProject(shareToken);
        setName(project.name);
        const recordings = project.recordings || [];
        let mix = normalizeMixerState(project.mixerState);
        if (!mix.tracks.length && recordings.length) {
          const track = createTrack('instrumental', 'IMPORTS');
          mix.tracks = [track];
          for (const rec of recordings) {
            track.clips.push({
              id: `rec-${rec.id}`,
              trackId: track.id,
              name: rec.name,
              url: reviewRecordingUrl(shareToken, rec.id),
              recordingId: rec.id,
              startTime: 0,
              duration: rec.duration || 0,
              displayStart: 0,
              displayEnd: rec.duration || 8,
              fadeIn: 0,
              fadeOut: 0.02,
              source: 'imported',
            });
          }
        } else {
          mix = rewriteMixForShare(mix, recordings);
        }
        engine.hydrate(mix);
        setComments(await listReviewComments(shareToken));
        setStatus('Ready');
        return;
      }

      if (!resolvedProjectId) {
        throw new Error('Project id missing');
      }

      const project = await getProject(resolvedProjectId);
      setName(project.name);
      const mix = normalizeMixerState(project.mixerState);
      if (!mix.tracks.length && (project.recordings || []).length) {
        const track = createTrack('instrumental', 'IMPORTS');
        mix.tracks = [track];
        for (const rec of project.recordings || []) {
          track.clips.push({
            id: `rec-${rec.id}`,
            trackId: track.id,
            name: rec.name,
            url: rec.s3Url,
            recordingId: rec.id,
            startTime: 0,
            duration: rec.duration || 0,
            displayStart: 0,
            displayEnd: rec.duration || 8,
            fadeIn: 0,
            fadeOut: 0.02,
            source: 'imported',
          });
        }
      }
      engine.hydrate(mix);
      const [g, live, v, c] = await Promise.all([
        user?.id ? listGalleryAudio(user.id) : { assets: [] },
        user?.id ? listGalleryAudio(user.id, 'live-studio') : { assets: [] },
        listVersions(resolvedProjectId).catch(() => []),
        listComments(resolvedProjectId).catch(() => []),
      ]);
      setGallery(g.assets || []);
      setLiveAssets(live.assets || []);
      setVersions(v);
      setComments(c);
      setStatus('Ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open project');
      setStatus('Error');
    }
  }, [isShareReview, shareToken, resolvedProjectId, user?.id, engine, rewriteMixForShare]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!engine.dirty || clientMode || isShareReview || !resolvedProjectId) return;
    const t = setTimeout(async () => {
      try {
        setSaving(true);
        await saveMixerState(resolvedProjectId, engine.state);
        engine.setDirty(false);
        setStatus('Saved');
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [engine.dirty, engine.state, resolvedProjectId, clientMode, isShareReview]);

  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); engine.playing ? engine.pause() : engine.play(); }
      if (e.key === 'r' || e.key === 'R') engine.startRecording();
      if (e.key === 's' || e.key === 'S') engine.splitClip(engine.selectedClipId || '', engine.playhead);
      if (e.key === 'Delete' || e.key === 'Backspace') engine.deleteSelected();
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); engine.undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!resolvedProjectId || isShareReview) return;
        await saveMixerState(resolvedProjectId, engine.state);
        engine.setDirty(false);
        setStatus('Saved');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine, resolvedProjectId, isShareReview]);

  useEffect(() => {
    setMidiSupported(typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator);
    if (!('requestMIDIAccess' in navigator)) return;
    navigator.requestMIDIAccess().then((access) => {
      access.inputs.forEach((input) => {
        input.onmidimessage = (ev) => {
          const [statusByte, note] = ev.data;
          if ((statusByte & 0xf0) === 0x90) setMidiNotes((n) => [...n.slice(-12), `N${note}`]);
        };
      });
    }).catch(() => setMidiSupported(false));
  }, []);

  const onImportFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    engine.rememberObjectUrl(url);
    await engine.importUrl(url, file.name, 'imported');
    try {
      if (!isShareReview && resolvedProjectId) {
        await uploadRecording(resolvedProjectId, file, file.name);
      }
      setStatus(`Imported ${file.name}`);
    } catch (err) {
      setStatus(`Local clip added. Upload: ${err instanceof Error ? err.message : 'failed'}`);
    }
  };

  const onRecord = async () => {
    if (engine.recording) {
        const blob = await engine.stopRecording();
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        engine.rememberObjectUrl(url);
        await engine.importUrl(url, `Take ${new Date().toLocaleTimeString()}`, 'recorded', 'vocal');
        try {
          if (!isShareReview && resolvedProjectId) {
            await uploadRecording(resolvedProjectId, blob, `Take ${Date.now()}`);
          }
        setStatus('Take stored');
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Take stored locally only');
      }
      return;
    }
    await engine.startRecording();
  };

  const applyProposal = (p: ProducerProposal) => {
    if (p.blocked) return;
    const trackId =
      engine.selectedTrackId ||
      engine.state.tracks.find((t) => t.type === p.trackHint)?.id ||
      engine.state.tracks[0]?.id;
    if (!trackId) {
      engine.addTrack(p.trackHint === 'any' ? 'vocal' : (p.trackHint as TrackType));
    }
    const id = engine.selectedTrackId || engine.state.tracks[0]?.id;
    if (!id) return;
    engine.updateTrack(id, { effects: [...(engine.state.tracks.find((t) => t.id === id)?.effects || []), ...p.effects] });
    setProposal({ ...p, summary: `${p.summary} Applied. Undo with ⌘Z.` });
  };

  const onExport = async () => {
    setStatus('Rendering WAV…');
    const blob = await engine.exportMix();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g, '-')}-master.wav`;
    a.click();
    setStatus('Export complete (WAV 48kHz 16-bit)');
    setExportOpen(false);
  };

  const dragClip = (clip: AudioClip, e: React.MouseEvent, mode: 'move' | 'trim-start' | 'trim-end') => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const orig = { ...clip };
    const onMove = (ev: MouseEvent) => {
      const dt = (ev.clientX - startX) / px;
      const snapVal = engine.snap ? 60 / engine.state.bpm / 4 : 0.001;
      const snapped = (v: number) => (engine.snap ? Math.round(v / snapVal) * snapVal : v);
      if (mode === 'move') engine.updateClip(clip.id, { startTime: Math.max(0, snapped(orig.startTime + dt)) });
      if (mode === 'trim-start') engine.updateClip(clip.id, { displayStart: Math.max(0, orig.displayStart + dt) });
      if (mode === 'trim-end') engine.updateClip(clip.id, { displayEnd: Math.max(orig.displayStart + 0.05, orig.displayEnd + dt) });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const playMidiKey = async (freq: number) => {
    const ctx = await engine.ensureContext();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = freq;
    g.gain.value = 0.15;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  };

  const cpuLabel = useMemo(() => {
    const clips = engine.state.tracks.reduce((n, t) => n + t.clips.length, 0);
    return clips > 24 ? 'HIGH' : clips > 8 ? 'OK' : 'LOW';
  }, [engine.state.tracks]);

  if (error) {
    return (
      <div className="sl-root p-6">
        <div className="sl-card">
          <h3>Cannot open studio</h3>
          <p className="text-sm text-text-secondary mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sl-studio">
      <div className="sl-topbar">
        <strong style={{ color: '#39FF14', letterSpacing: '0.16em' }}>WISE² SOUND LAB</strong>
        <span style={{ color: '#8D98A5' }}>/</span>
        <span className="font-semibold">{name}</span>
        <span style={{ color: engine.dirty ? '#F2B632' : '#39FF14' }}>
          {saving ? 'SAVING' : engine.dirty ? 'UNSAVED' : 'SAVED'}
        </span>
        {!clientMode && !isShareReview && (
          <>
            <button className="sl-btn" onClick={engine.undo} disabled={!engine.canUndo}>UNDO</button>
            <button className="sl-btn" onClick={engine.redo} disabled={!engine.canRedo}>REDO</button>
            <button className="sl-btn" onClick={async () => {
              const label = window.prompt('Version name', 'Mix V2') || 'Snapshot';
              await saveMixerState(resolvedProjectId, engine.state);
              await createVersion(resolvedProjectId, label);
              setVersions(await listVersions(resolvedProjectId));
              setStatus(`Version: ${label}`);
            }}>VERSION</button>
            <button className="sl-btn" onClick={async () => {
              try {
                const data = await createReviewLink(resolvedProjectId);
                const path = data.path || `/sound-lab/share/${data.token}`;
                const url = `${window.location.origin}${path}`;
                setReviewLink(url);
                await navigator.clipboard.writeText(url);
                setStatus('Client review link copied');
              } catch (err) {
                setStatus(err instanceof Error ? err.message : 'Share link failed');
              }
            }}>SHARE</button>
          </>
        )}
        <span className="ml-auto" style={{ color: '#8D98A5' }}>CPU {cpuLabel}</span>
        {engine.latencyMs != null && <span>LAT {engine.latencyMs}ms</span>}
        {!isShareReview && <span>{user?.email}</span>}
        <button className="sl-btn sl-btn-primary" onClick={() => setExportOpen(true)}>EXPORT</button>
      </div>
      {reviewLink && !clientMode && !isShareReview && (
        <div className="px-3 py-1 text-[10px] text-wise-electric">Review link: {reviewLink}</div>
      )}

      {(clientMode || isShareReview) && (
        <div className="sl-transport">
          <button className="sl-btn sl-btn-primary" onClick={() => engine.playing ? engine.pause() : engine.play()}>
            {engine.playing ? 'PAUSE' : 'PLAY'}
          </button>
          <button className="sl-btn" onClick={engine.stop}>STOP</button>
          <span className="font-mono">{fmtTime(engine.playhead)}</span>
        </div>
      )}

      {!clientMode && !isShareReview && (
        <div className="sl-transport">
          <button className="sl-btn" onClick={() => engine.setPlayhead(0)}>⏮</button>
          <button className="sl-btn" onClick={() => engine.setPlayhead(Math.max(0, engine.playhead - 2))}>◀</button>
          <button className="sl-btn sl-btn-primary" onClick={() => engine.playing ? engine.pause() : engine.play()}>
            {engine.playing ? 'PAUSE' : 'PLAY'}
          </button>
          <button className="sl-btn" onClick={engine.stop}>STOP</button>
          <button className="sl-btn" onClick={onRecord} style={{ color: engine.recording ? '#ff3b5c' : undefined }}>
            {engine.countdown ? engine.countdown : engine.recording ? 'REC ●' : 'RECORD'}
          </button>
          <button className="sl-btn" onClick={() => engine.setState({ ...engine.state, loop: { ...engine.state.loop, enabled: !engine.state.loop.enabled } })}>
            LOOP {engine.state.loop.enabled ? 'ON' : 'OFF'}
          </button>
          <label>BPM <input className="wise-input w-16 inline-block" type="number" value={engine.state.bpm}
            onChange={(e) => engine.setState({ ...engine.state, bpm: Number(e.target.value) || 120 })} /></label>
          <span>{engine.state.timeSignature[0]}/{engine.state.timeSignature[1]}</span>
          <span className="font-mono">{fmtTime(engine.playhead)}</span>
          <span className="font-mono">{barsBeats(engine.playhead, engine.state.bpm, engine.state.timeSignature[0])}</span>
          <button className="sl-btn" onClick={() => engine.setSnap(!engine.snap)}>SNAP {engine.snap ? 'ON' : 'OFF'}</button>
          <button className="sl-btn" onClick={() => engine.setMetronome(!engine.metronome)}>CLICK {engine.metronome ? 'ON' : 'OFF'}</button>
          <button className="sl-btn" onClick={() => engine.setCountIn(!engine.countIn)}>COUNT {engine.countIn ? 'ON' : 'OFF'}</button>
          <label>ZOOM <input type="range" min={20} max={120} value={engine.zoom} onChange={(e) => engine.setZoom(Number(e.target.value))} /></label>
          {engine.meters.clipping && <span style={{ color: '#ff3b5c' }}>CLIP</span>}
        </div>
      )}

      <div className="sl-body">
        {!clientMode && !isShareReview && (
          <aside className="sl-side">
            <h3 className="sl-kicker">Project</h3>
            <button className="sl-btn sl-btn-primary w-full mb-2" onClick={() => fileRef.current?.click()}>IMPORT AUDIO</button>
            <input ref={fileRef} type="file" accept="audio/*" hidden onChange={(e) => e.target.files?.[0] && onImportFile(e.target.files[0])} />
            <div className="space-y-1 mb-3">
              {engine.state.tracks.flatMap((t) => t.clips).map((c) => (
                <button key={c.id} className="sl-btn w-full text-left" onClick={() => engine.setSelectedClipId(c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
            <h3 className="sl-kicker mt-4">Gallery</h3>
            {gallery.filter((a) => a.mimeType?.startsWith('audio') || a.assetType === 'AUDIO').slice(0, 12).map((a) => (
              <button key={a.id} className="sl-btn w-full text-left mb-1" onClick={async () => {
                const url = a.url || `/api/v1/gallery/file/${a.filename}`;
                await engine.importUrl(url, a.originalName || a.filename, 'imported');
                await attachGalleryAsset(resolvedProjectId, a.id, a.originalName).catch(() => null);
              }}>{a.originalName || a.filename}</button>
            ))}
            <h3 className="sl-kicker mt-4">Live Studio</h3>
            {liveAssets.length === 0 && <p className="text-xs text-text-muted">No Live Studio recordings yet.</p>}
            {liveAssets.map((a) => (
              <button key={a.id} className="sl-btn w-full text-left mb-1" onClick={async () => {
                const url = a.url || `/api/v1/gallery/file/${a.filename}`;
                await engine.importUrl(url, a.originalName, 'live-studio');
                await attachGalleryAsset(resolvedProjectId, a.id, a.originalName).catch(() => null);
              }}>{a.originalName}</button>
            ))}
          </aside>
        )}

        <div
          ref={timelineRef}
          className="overflow-auto relative"
          onClick={(e) => {
            const rect = timelineRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left - 168 + (timelineRef.current?.scrollLeft || 0);
            if (x > 0) engine.setPlayhead(x / px);
          }}
        >
          <div className="sl-lane" style={{ minHeight: 28 }}>
            <div className="sl-lane-head text-[10px] text-text-muted">TRACKS</div>
            <div className="relative h-7" style={{ width: engine.duration * px }}>
              {Array.from({ length: Math.ceil(engine.duration) + 1 }).map((_, i) => (
                <span key={i} className="absolute top-0 text-[9px] text-text-muted" style={{ left: i * px }}>{i}s</span>
              ))}
              <div className="absolute top-0 bottom-0 w-px bg-[#39FF14]" style={{ left: engine.playhead * px }} />
            </div>
          </div>
          {engine.state.tracks.length === 0 && (
            <div className="p-8 text-sm text-text-muted">Import audio, record, or add a track to begin.</div>
          )}
          {engine.state.tracks.map((track) => (
            <div key={track.id} className="sl-lane" style={{ outline: engine.selectedTrackId === track.id ? '1px solid #39FF14' : undefined }}>
              <div className="sl-lane-head">
                <div className="flex items-center justify-between">
                  <input className="bg-transparent text-xs font-semibold w-24" value={track.name}
                    disabled={clientMode}
                    onChange={(e) => engine.updateTrack(track.id, { name: e.target.value })} />
                  <span className="w-2 h-2 rounded-full" style={{ background: track.color }} />
                </div>
                {!clientMode && (
                  <div className="flex gap-1 mt-1">
                    <button className="sl-btn" onClick={() => engine.updateTrack(track.id, { muted: !track.muted })}>{track.muted ? 'M' : 'm'}</button>
                    <button className="sl-btn" onClick={() => engine.updateTrack(track.id, { solo: !track.solo })}>{track.solo ? 'S' : 's'}</button>
                    <button className="sl-btn" onClick={() => engine.updateTrack(track.id, { armed: !track.armed })} style={{ color: track.armed ? '#ff3b5c' : undefined }}>R</button>
                  </div>
                )}
              </div>
              <div className="relative" style={{ width: engine.duration * px, background: '#070b10' }}
                onClick={() => engine.setSelectedTrackId(track.id)}>
                {track.clips.map((clip) => (
                  <ClipView
                    key={clip.id}
                    clip={clip}
                    color={track.color}
                    px={px}
                    selected={engine.selectedClipId === clip.id}
                    playhead={engine.playhead}
                    onSelect={() => engine.setSelectedClipId(clip.id)}
                    onDrag={(e, mode) => dragClip(clip, e, mode)}
                  />
                ))}
                <div className="absolute top-0 bottom-0 w-px bg-[#39FF14] pointer-events-none" style={{ left: engine.playhead * px }} />
              </div>
            </div>
          ))}
        </div>

        <aside className="sl-ai">
          <h3 className="sl-kicker">AI Producer</h3>
          {!clientMode && !isShareReview && (
            <>
              <textarea className="wise-input w-full h-20 text-xs" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder='“Clean this vocal.” “Master this for streaming.”' />
              <button className="sl-btn sl-btn-primary w-full mt-2" onClick={() => setProposal(proposeProduction(prompt))}>ASK AI PRODUCER</button>
              {proposal && (
                <div className="sl-card mt-3">
                  <div className="text-xs text-wise-green-neon">{proposal.summary}</div>
                  {proposal.blocked && <p className="text-xs text-warning mt-2">{proposal.blocked}</p>}
                  {proposal.effects.map((fx) => (
                    <div key={fx.id} className="text-[10px] text-text-muted mt-1">{fx.name} · {fx.type}</div>
                  ))}
                  {!proposal.blocked && (
                    <button className="sl-btn sl-btn-primary w-full mt-2" onClick={() => applyProposal(proposal)}>APPLY</button>
                  )}
                </div>
              )}
              <div className="mt-3">
                <h3 className="sl-kicker">Master</h3>
                <div className="flex flex-wrap gap-1">
                  {MASTERING_PRESETS.map((p) => (
                    <button key={p} className="sl-btn" onClick={() => setProposal(masteringProposal(p))}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="sl-kicker">Generate (MusicGen)</h3>
                <input className="wise-input w-full text-xs" value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder="dark cinematic pulse, 90bpm" />
                <button className="sl-btn w-full mt-2" onClick={async () => {
                  try {
                    const eligibility = await canGenerate();
                    if (!eligibility.allowed) { setStatus(eligibility.reason || 'Generation locked'); return; }
                    setStatus('Generating…');
                    const data = await generateMusic(resolvedProjectId, { prompt: genPrompt, tempo: engine.state.bpm });
                    const url = data.project?.generatedAudioUrl;
                    if (url) await engine.importUrl(url, genPrompt.slice(0, 40), 'generated', 'beat');
                    setStatus('Generation complete');
                  } catch (err) {
                    setStatus(err instanceof Error ? err.message : 'Generation blocked');
                  }
                }}>CREATE BEAT</button>
              </div>
            </>
          )}
          <div className="mt-4">
            <h3 className="sl-kicker">Comments</h3>
            {(clientMode || isShareReview) && (
              <input
                className="wise-input text-xs w-full mb-2"
                placeholder="Your name (optional)"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            )}
            {comments.map((c) => (
              <p key={c.id} className="text-xs text-text-secondary mb-1">{c.content}{c.timestamp != null ? ` @ ${fmtTime(c.timestamp)}` : ''}</p>
            ))}
            <div className="flex gap-1 mt-2">
              <input className="wise-input text-xs" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Timestamp comment" />
              <button className="sl-btn" onClick={async () => {
                if (!commentText.trim()) return;
                if (isShareReview && shareToken) {
                  await addReviewComment(shareToken, commentText, clientName || undefined, engine.playhead);
                  setComments(await listReviewComments(shareToken));
                } else if (resolvedProjectId) {
                  await addComment(resolvedProjectId, commentText, engine.playhead, engine.selectedTrackId || undefined);
                  setComments(await listComments(resolvedProjectId));
                }
                setCommentText('');
              }}>POST</button>
            </div>
          </div>
          {!isShareReview && (
          <div className="mt-4">
            <h3 className="sl-kicker">Versions</h3>
            {versions.map((v) => (
              <button key={v.id} className="sl-btn w-full text-left mb-1" onClick={async () => {
                if (clientMode) return;
                const data = await restoreVersion(resolvedProjectId, v.id);
                engine.hydrate(data.project?.mixerState);
                setStatus(`Restored ${v.label}`);
              }}>{v.label}</button>
            ))}
          </div>
          )}
          <div className="mt-4">
            <h3 className="sl-kicker">Approval</h3>
            <p className="text-xs mb-2">{engine.state.approval?.status || 'draft'}</p>
            <div className="flex gap-1">
              <button className="sl-btn sl-btn-primary" onClick={async () => {
                if (isShareReview && shareToken) {
                  const data = await setReviewApproval(shareToken, 'approved', undefined, clientName || undefined);
                  engine.hydrate(data.project?.mixerState);
                } else if (resolvedProjectId) {
                  const data = await setApproval(resolvedProjectId, 'approved');
                  engine.hydrate(data.project?.mixerState);
                }
                setStatus('Approved');
              }}>APPROVE</button>
              <button className="sl-btn" onClick={async () => {
                if (isShareReview && shareToken) {
                  const data = await setReviewApproval(shareToken, 'revision', commentText, clientName || undefined);
                  engine.hydrate(data.project?.mixerState);
                } else if (resolvedProjectId) {
                  await setApproval(resolvedProjectId, 'revision', commentText);
                }
                setStatus('Revision requested');
              }}>REVISION</button>
            </div>
          </div>
        </aside>
      </div>

      {!clientMode && !isShareReview && (
        <div className="sl-mixer">
          <button className="sl-btn" onClick={() => engine.addTrack('vocal')}>+ TRACK</button>
          <select className="wise-input w-28" onChange={(e) => engine.addTrack(e.target.value as TrackType)} value="">
            <option value="">type</option>
            {TRACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {engine.state.tracks.map((track) => (
            <div key={track.id} className="sl-card min-w-[88px] p-2">
              <div className="text-[10px] truncate">{track.name}</div>
              <div className="flex gap-1 h-24 mt-1">
                <input type="range" min={0} max={1} step={0.01} value={track.volume}
                  onChange={(e) => engine.updateTrack(track.id, { volume: Number(e.target.value) })}
                  className="h-24" style={{ writingMode: 'vertical-lr', direction: 'rtl' } as React.CSSProperties} />
                <div className="sl-meter"><span style={{ height: `${Math.min(100, engine.meters.master * 100)}%` }} /></div>
              </div>
              <input type="range" min={-1} max={1} step={0.01} value={track.pan}
                onChange={(e) => engine.updateTrack(track.id, { pan: Number(e.target.value) })} />
              <div className="flex gap-1 mt-1">
                <button className="sl-btn" onClick={() => engine.updateTrack(track.id, { muted: !track.muted })}>M</button>
                <button className="sl-btn" onClick={() => engine.updateTrack(track.id, { solo: !track.solo })}>S</button>
                <button className="sl-btn" onClick={() => engine.updateTrack(track.id, { armed: !track.armed })}>R</button>
              </div>
            </div>
          ))}
          <div className="sl-card min-w-[100px]">
            <div className="text-[10px]">MASTER</div>
            <input type="range" min={0} max={1} step={0.01} value={engine.state.masterVolume}
              onChange={(e) => engine.setState({ ...engine.state, masterVolume: Number(e.target.value) })} />
            <div className="sl-meter h-20 mt-1"><span style={{ height: `${Math.min(100, engine.meters.master * 100)}%` }} /></div>
            {engine.meters.clipping && <div className="text-[10px] text-danger">CLIP</div>}
            <div className="text-[10px] mt-1">Limiter -1 dBTP</div>
          </div>
          {selectedTrack && (
            <div className="sl-card min-w-[220px]">
              <div className="text-[10px] mb-2">INSERTS · {selectedTrack.name}</div>
              {selectedTrack.effects.map((fx, i) => (
                <div key={fx.id} className="flex items-center gap-1 mb-1">
                  <span className="text-[10px] flex-1">{fx.name}</span>
                  <button className="sl-btn" onClick={() => {
                    const effects = selectedTrack.effects.map((f) => f.id === fx.id ? { ...f, bypassed: !f.bypassed } : f);
                    engine.updateTrack(selectedTrack.id, { effects });
                  }}>{fx.bypassed ? 'BYP' : 'ON'}</button>
                  <button className="sl-btn" onClick={() => engine.updateTrack(selectedTrack.id, { effects: selectedTrack.effects.filter((f) => f.id !== fx.id) })}>X</button>
                  {i > 0 && <button className="sl-btn" onClick={() => {
                    const effects = [...selectedTrack.effects];
                    [effects[i - 1], effects[i]] = [effects[i], effects[i - 1]];
                    engine.updateTrack(selectedTrack.id, { effects });
                  }}>↑</button>}
                </div>
              ))}
              <select className="wise-input text-xs" onChange={(e) => {
                const type = e.target.value as EffectType;
                if (!type) return;
                engine.updateTrack(selectedTrack.id, {
                  effects: [...selectedTrack.effects, { id: `fx-${Date.now()}`, type, name: type.toUpperCase(), bypassed: false, params: {} }],
                });
              }} value="">
                <option value="">add insert</option>
                {FX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div className="sl-card min-w-[220px]">
            <div className="text-[10px] mb-1">MIDI {midiSupported ? 'READY' : 'KEYBOARD FALLBACK'}</div>
            <div className="sl-piano">
              {[261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392].map((f, i) => (
                <button key={f} className={`sl-key ${[1, 3, 6].includes(i) ? 'black' : ''}`} onMouseDown={() => playMidiKey(f)}>{i}</button>
              ))}
            </div>
            <div className="text-[10px] text-text-muted mt-1">{midiNotes.join(' ') || 'No MIDI events'}</div>
            <div className="text-[10px] mt-2">
              MIC
              <select className="wise-input text-xs" value={engine.inputId} onChange={(e) => engine.setInputId(e.target.value)}>
                <option value="">Default</option>
                {engine.devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Mic'}</option>)}
              </select>
            </div>
            <label className="text-[10px]"><input type="checkbox" checked={engine.monitor} onChange={(e) => engine.setMonitor(e.target.checked)} /> monitor</label>
            <label className="text-[10px]">gain <input type="range" min={0} max={2} step={0.05} value={engine.inputGain} onChange={(e) => engine.setInputGain(Number(e.target.value))} /></label>
          </div>
        </div>
      )}

      <div className="sl-mobile-only p-4 sl-card m-3">
        <p className="text-xs text-text-muted mb-2">Mobile production surface — playback, record, comments, export. Full mix/edit is desktop/tablet.</p>
        <div className="sl-actions">
          <button className="sl-btn sl-btn-primary" onClick={() => engine.playing ? engine.pause() : engine.play()}>{engine.playing ? 'PAUSE' : 'PLAY'}</button>
          <button className="sl-btn" onClick={onRecord}>{engine.recording ? 'STOP REC' : 'RECORD'}</button>
          <button className="sl-btn" onClick={() => setExportOpen(true)}>EXPORT</button>
        </div>
      </div>

      {exportOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="sl-card w-[420px]">
            <h3>Export</h3>
            <p className="text-xs text-text-secondary mt-2">WAV 48 kHz 16-bit stereo. MP3 is not advertised because no encoder is bundled.</p>
            <p className="text-xs mt-2">Est. size {formatBytes(estimateWavBytes(engine.duration))}</p>
            <p className="text-xs">Normalization: limiter at -1 dBTP · metadata: project name only</p>
            <div className="flex gap-2 mt-4">
              <button className="sl-btn sl-btn-primary" onClick={onExport}>DOWNLOAD WAV</button>
              <button className="sl-btn" onClick={() => setExportOpen(false)}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
      <p className="px-3 py-1 text-[10px] text-text-muted">{status}</p>
    </div>
  );
}

function ClipView({
  clip, color, px, selected, playhead, onSelect, onDrag,
}: {
  clip: AudioClip;
  color: string;
  px: number;
  selected: boolean;
  playhead: number;
  onSelect: () => void;
  onDrag: (e: React.MouseEvent, mode: 'move' | 'trim-start' | 'trim-end') => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = Math.max(8, (clip.displayEnd - clip.displayStart) * px);
  useEffect(() => {
    if (canvasRef.current && clip.peaks) {
      drawWaveform(canvasRef.current, clip.peaks, color, Math.max(0, (playhead - clip.startTime) / Math.max(0.01, clip.displayEnd - clip.displayStart)));
    }
  }, [clip.peaks, color, playhead, clip.startTime, clip.displayEnd, clip.displayStart]);
  return (
    <div
      className="sl-clip"
      style={{
        left: clip.startTime * px,
        width,
        background: `${color}22`,
        outline: selected ? '1px solid #fff' : undefined,
      }}
      onMouseDown={(e) => { onSelect(); onDrag(e, 'move'); }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize" onMouseDown={(e) => onDrag(e, 'trim-start')} />
      <canvas ref={canvasRef} width={Math.floor(width)} height={52} className="w-full h-full" />
      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize" onMouseDown={(e) => onDrag(e, 'trim-end')} />
      <span className="absolute left-1 top-0 text-[9px]">{clip.name}</span>
    </div>
  );
}
