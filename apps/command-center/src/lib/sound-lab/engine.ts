'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AudioClip,
  EffectInstance,
  MixerState,
  SoundTrack,
  TrackType,
  createTrack,
  normalizeMixerState,
} from './types';
import { computePeaks } from './waveform';
import { encodeWav } from './wav';
import { resolveMediaUrl } from './api';

export interface EngineMeters {
  master: number;
  tracks: Record<string, number>;
  clipping: boolean;
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeImpulse(ctx: AudioContext, seconds = 1.6, decay = 2.4) {
  const length = ctx.sampleRate * seconds;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function makeDistortionCurve(amount: number) {
  const n = 44100;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  const k = amount * 400;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

export function useSoundLabEngine() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map());
  const objectUrls = useRef<string[]>([]);
  const recStreamRef = useRef<MediaStream | null>(null);
  const recRecorderRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<Blob[]>([]);
  const recMonitorRef = useRef<GainNode | null>(null);
  const playStartRef = useRef(0);
  const playOffsetRef = useRef(0);
  const rafRef = useRef<number>(0);

  const [state, setState] = useState<MixerState>(normalizeMixerState(null));
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [meters, setMeters] = useState<EngineMeters>({ master: 0, tracks: {}, clipping: false });
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [inputId, setInputId] = useState<string>('');
  const [monitor, setMonitor] = useState(false);
  const [inputGain, setInputGain] = useState(1);
  const [snap, setSnap] = useState(true);
  const [zoom, setZoom] = useState(48);
  const [metronome, setMetronome] = useState(false);
  const [countIn, setCountIn] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [undoStack, setUndoStack] = useState<MixerState[]>([]);
  const [redoStack, setRedoStack] = useState<MixerState[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext({ latencyHint: 'interactive', sampleRate: 48000 });
      const master = ctx.createGain();
      master.gain.value = state.masterVolume;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -1;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.08;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      master.connect(limiter);
      limiter.connect(analyser);
      analyser.connect(ctx.destination);
      ctxRef.current = ctx;
      masterGainRef.current = master;
      limiterRef.current = limiter;
      masterAnalyserRef.current = analyser;
      setLatencyMs(Math.round((ctx.baseLatency + ctx.outputLatency) * 1000) || 0);
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    return ctxRef.current;
  }, [state.masterVolume]);

  const pushUndo = useCallback((next: MixerState) => {
    setUndoStack((stack) => [...stack.slice(-24), state]);
    setRedoStack([]);
    setState(next);
    setDirty(true);
  }, [state]);

  const hydrate = useCallback((mixerState: unknown) => {
    setState(normalizeMixerState(mixerState));
    setDirty(false);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const setMixerState = useCallback((next: MixerState) => {
    setState(next);
    setDirty(true);
  }, []);

  const duration = Math.max(
    8,
    ...state.tracks.flatMap((t) => t.clips.map((c) => c.startTime + (c.displayEnd - c.displayStart))),
    state.loop.end,
  );

  const loadBuffer = useCallback(async (url: string) => {
    if (bufferCache.current.has(url)) return bufferCache.current.get(url)!;
    const ctx = await ensureContext();
    const res = await fetch(resolveMediaUrl(url));
    const arr = await res.arrayBuffer();
    const buf = await ctx.decodeAudioData(arr.slice(0));
    bufferCache.current.set(url, buf);
    return buf;
  }, [ensureContext]);

  const ensurePeaks = useCallback(async (clip: AudioClip) => {
    if (clip.peaks?.length) return clip;
    try {
      const buf = await loadBuffer(clip.url);
      const peaks = computePeaks(buf, 320);
      setState((s) => ({
        ...s,
        tracks: s.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) => (c.id === clip.id ? { ...c, peaks, duration: buf.duration } : c)),
        })),
      }));
    } catch {
      /* peaks optional */
    }
  }, [loadBuffer]);

  const stopSources = useCallback(() => {
    sourcesRef.current.forEach((s) => {
      try { s.stop(); } catch { /* already stopped */ }
    });
    sourcesRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const connectEffects = useCallback((ctx: AudioContext, input: AudioNode, effects: EffectInstance[]) => {
    let node: AudioNode = input;
    for (const fx of effects) {
      if (fx.bypassed) continue;
      if (fx.type === 'eq') {
        const low = ctx.createBiquadFilter();
        low.type = 'lowshelf';
        low.frequency.value = 180;
        low.gain.value = fx.params.lowGain ?? 0;
        const mid = ctx.createBiquadFilter();
        mid.type = 'peaking';
        mid.frequency.value = 1200;
        mid.gain.value = fx.params.midGain ?? 0;
        const high = ctx.createBiquadFilter();
        high.type = 'highshelf';
        high.frequency.value = 6500;
        high.gain.value = fx.params.highGain ?? 0;
        node.connect(low); low.connect(mid); mid.connect(high);
        node = high;
      } else if (fx.type === 'compressor' || fx.type === 'limiter') {
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = fx.params.threshold ?? (fx.type === 'limiter' ? -1 : -18);
        comp.ratio.value = fx.params.ratio ?? (fx.type === 'limiter' ? 20 : 4);
        comp.attack.value = fx.params.attack ?? 0.01;
        comp.release.value = fx.params.release ?? 0.2;
        node.connect(comp);
        node = comp;
      } else if (fx.type === 'reverb') {
        const conv = ctx.createConvolver();
        conv.buffer = makeImpulse(ctx, 0.6 + (fx.params.roomSize ?? 0.5) * 2);
        const wet = ctx.createGain();
        wet.gain.value = fx.params.mix ?? 0.25;
        const dry = ctx.createGain();
        dry.gain.value = 1 - (fx.params.mix ?? 0.25);
        const merge = ctx.createGain();
        node.connect(dry); dry.connect(merge);
        node.connect(conv); conv.connect(wet); wet.connect(merge);
        node = merge;
      } else if (fx.type === 'delay') {
        const delay = ctx.createDelay(2);
        delay.delayTime.value = fx.params.time ?? 0.25;
        const fb = ctx.createGain();
        fb.gain.value = fx.params.feedback ?? 0.25;
        const wet = ctx.createGain();
        wet.gain.value = fx.params.mix ?? 0.2;
        const merge = ctx.createGain();
        node.connect(delay); delay.connect(fb); fb.connect(delay);
        delay.connect(wet); node.connect(merge); wet.connect(merge);
        node = merge;
      } else if (fx.type === 'filter' || fx.type === 'gate') {
        const filt = ctx.createBiquadFilter();
        filt.type = 'highpass';
        filt.frequency.value = fx.params.frequency ?? 80;
        node.connect(filt);
        node = filt;
      } else if (fx.type === 'distortion') {
        const shaper = ctx.createWaveShaper();
        shaper.curve = makeDistortionCurve(fx.params.drive ?? 0.2);
        const wet = ctx.createGain();
        wet.gain.value = fx.params.mix ?? 0.2;
        const dry = ctx.createGain();
        dry.gain.value = 1 - (fx.params.mix ?? 0.2);
        const merge = ctx.createGain();
        node.connect(dry); dry.connect(merge);
        node.connect(shaper); shaper.connect(wet); wet.connect(merge);
        node = merge;
      } else if (fx.type === 'gain') {
        const g = ctx.createGain();
        g.gain.value = fx.params.gain ?? 1;
        node.connect(g);
        node = g;
      } else if (fx.type === 'width') {
        const pan = ctx.createStereoPanner();
        pan.pan.value = 0;
        node.connect(pan);
        node = pan;
      }
    }
    return node;
  }, []);

  const schedule = useCallback(async (fromTime: number) => {
    const ctx = await ensureContext();
    stopSources();
    if (masterGainRef.current) masterGainRef.current.gain.value = state.masterVolume;
    const anySolo = state.tracks.some((t) => t.solo);
    playStartRef.current = ctx.currentTime;
    playOffsetRef.current = fromTime;

    for (const track of state.tracks) {
      if (track.muted || (anySolo && !track.solo)) continue;
      const gain = ctx.createGain();
      gain.gain.value = track.volume;
      const pan = ctx.createStereoPanner();
      pan.pan.value = track.pan;
      const effected = connectEffects(ctx, gain, track.effects);
      effected.connect(pan);
      pan.connect(masterGainRef.current!);

      for (const clip of track.clips) {
        try {
          const buf = await loadBuffer(clip.url);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          const offset = Math.max(0, clip.displayStart);
          const playDur = Math.max(0.01, clip.displayEnd - clip.displayStart);
          const when = ctx.currentTime + Math.max(0, clip.startTime - fromTime);
          if (clip.startTime + playDur < fromTime) continue;
          const skip = Math.max(0, fromTime - clip.startTime);
          src.connect(gain);
          src.start(when, offset + skip, Math.max(0.01, playDur - skip));
          sourcesRef.current.push(src);
        } catch {
          /* skip unloadable clip */
        }
      }
    }

    const tick = () => {
      const ctxNow = ctxRef.current;
      if (!ctxNow) return;
      let t = playOffsetRef.current + (ctxNow.currentTime - playStartRef.current);
      if (state.loop.enabled && t >= state.loop.end) {
        t = state.loop.start;
        playOffsetRef.current = t;
        playStartRef.current = ctxNow.currentTime;
        schedule(t);
        return;
      }
      setPlayhead(t);
      const analyser = masterAnalyserRef.current;
      if (analyser) {
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i++) {
          const v = Math.abs((data[i] - 128) / 128);
          if (v > peak) peak = v;
        }
        setMeters({ master: peak, tracks: {}, clipping: peak > 0.98 });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [connectEffects, ensureContext, loadBuffer, state, stopSources]);

  const play = useCallback(async () => {
    await schedule(playhead);
    setPlaying(true);
  }, [playhead, schedule]);

  const pause = useCallback(() => {
    stopSources();
    setPlaying(false);
  }, [stopSources]);

  const stop = useCallback(() => {
    stopSources();
    setPlaying(false);
    setPlayhead(0);
  }, [stopSources]);

  const seek = useCallback((time: number) => {
    const t = Math.max(0, time);
    setPlayhead(t);
    if (playing) schedule(t);
  }, [playing, schedule]);

  const addTrack = useCallback((type: TrackType, name?: string) => {
    const track = createTrack(type, name);
    pushUndo({ ...state, tracks: [...state.tracks, track] });
    setSelectedTrackId(track.id);
    return track;
  }, [pushUndo, state]);

  const updateTrack = useCallback((id: string, patch: Partial<SoundTrack>) => {
    pushUndo({
      ...state,
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }, [pushUndo, state]);

  const addClipToTrack = useCallback((trackId: string, clip: Omit<AudioClip, 'id' | 'trackId'>) => {
    const full: AudioClip = { ...clip, id: uid('clip'), trackId };
    pushUndo({
      ...state,
      tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, clips: [...t.clips, full] } : t)),
    });
    setSelectedClipId(full.id);
    return full;
  }, [pushUndo, state]);

  const importUrl = useCallback(async (
    url: string,
    name: string,
    source: AudioClip['source'],
    trackType: TrackType = 'instrumental',
    extra?: Partial<AudioClip>,
  ) => {
    let track = state.tracks.find((t) => t.type === trackType) || state.tracks[0];
    let tracks = state.tracks;
    if (!track) {
      track = createTrack(trackType);
      tracks = [track];
    }
    const buf = await loadBuffer(url);
    const clip: AudioClip = {
      id: uid('clip'),
      trackId: track.id,
      name,
      url,
      startTime: playhead,
      duration: buf.duration,
      displayStart: 0,
      displayEnd: buf.duration,
      fadeIn: 0,
      fadeOut: 0.02,
      source,
      peaks: computePeaks(buf),
      ...extra,
    };
    pushUndo({
      ...state,
      tracks: tracks.map((t) => (t.id === track!.id ? { ...t, clips: [...t.clips, clip] } : t)),
    });
    return clip;
  }, [loadBuffer, playhead, pushUndo, state]);

  const updateClip = useCallback((clipId: string, patch: Partial<AudioClip>) => {
    pushUndo({
      ...state,
      tracks: state.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? { ...c, ...patch } : c)),
      })),
    });
  }, [pushUndo, state]);

  const splitClip = useCallback((clipId: string, at: number) => {
    const track = state.tracks.find((t) => t.clips.some((c) => c.id === clipId));
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!track || !clip) return;
    const local = at - clip.startTime;
    if (local <= 0.05 || local >= clip.displayEnd - clip.displayStart - 0.05) return;
    const a: AudioClip = { ...clip, displayEnd: clip.displayStart + local };
    const b: AudioClip = {
      ...clip,
      id: uid('clip'),
      startTime: at,
      displayStart: clip.displayStart + local,
    };
    pushUndo({
      ...state,
      tracks: state.tracks.map((t) =>
        t.id === track.id
          ? { ...t, clips: t.clips.flatMap((c) => (c.id === clipId ? [a, b] : [c])) }
          : t,
      ),
    });
  }, [pushUndo, state]);

  const duplicateClip = useCallback((clipId: string) => {
    const track = state.tracks.find((t) => t.clips.some((c) => c.id === clipId));
    const clip = track?.clips.find((c) => c.id === clipId);
    if (!track || !clip) return;
    const copy = { ...clip, id: uid('clip'), startTime: clip.startTime + (clip.displayEnd - clip.displayStart) };
    pushUndo({
      ...state,
      tracks: state.tracks.map((t) => (t.id === track.id ? { ...t, clips: [...t.clips, copy] } : t)),
    });
  }, [pushUndo, state]);

  const deleteSelected = useCallback(() => {
    if (!selectedClipId) return;
    pushUndo({
      ...state,
      tracks: state.tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== selectedClipId) })),
    });
    setSelectedClipId(null);
  }, [pushUndo, selectedClipId, state]);

  const undo = useCallback(() => {
    setUndoStack((stack) => {
      if (!stack.length) return stack;
      const prev = stack[stack.length - 1];
      setRedoStack((r) => [...r, state]);
      setState(prev);
      setDirty(true);
      return stack.slice(0, -1);
    });
  }, [state]);

  const redo = useCallback(() => {
    setRedoStack((stack) => {
      if (!stack.length) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((u) => [...u, state]);
      setState(next);
      setDirty(true);
      return stack.slice(0, -1);
    });
  }, [state]);

  const refreshDevices = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === 'audioinput'));
    } catch {
      setDevices([]);
    }
  }, []);

  const startRecording = useCallback(async (trackId?: string) => {
    const ctx = await ensureContext();
    const armed = state.tracks.find((t) => t.id === (trackId || selectedTrackId) && t.armed) ||
      state.tracks.find((t) => t.armed) ||
      state.tracks[0];
    if (!armed) addTrack('vocal', 'VOCAL');
    if (countIn) {
      for (let i = 4; i > 0; i--) {
        setCountdown(i);
        await new Promise((r) => setTimeout(r, (60 / state.bpm) * 1000));
      }
      setCountdown(0);
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: inputId ? { exact: inputId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    recStreamRef.current = stream;
    if (monitor) {
      const src = ctx.createMediaStreamSource(stream);
      const g = ctx.createGain();
      g.gain.value = inputGain;
      src.connect(g);
      recMonitorRef.current = g;
    }
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';
    const rec = new MediaRecorder(stream, { mimeType: mime });
    recChunksRef.current = [];
    rec.ondataavailable = (e) => { if (e.data.size) recChunksRef.current.push(e.data); };
    rec.start(100);
    recRecorderRef.current = rec;
    setRecording(true);
  }, [addTrack, countIn, ensureContext, inputGain, inputId, monitor, selectedTrackId, state.bpm, state.tracks]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const rec = recRecorderRef.current;
    if (!rec) return null;
    const blob: Blob = await new Promise((resolve) => {
      rec.onstop = () => resolve(new Blob(recChunksRef.current, { type: rec.mimeType }));
      rec.stop();
    });
    recStreamRef.current?.getTracks().forEach((t) => t.stop());
    recStreamRef.current = null;
    recRecorderRef.current = null;
    setRecording(false);
    return blob;
  }, []);

  const exportMix = useCallback(async () => {
    const sampleRate = ctxRef.current?.sampleRate || 48000;
    const offline = new OfflineAudioContext(2, Math.ceil(duration * sampleRate), sampleRate);
    const master = offline.createGain();
    master.gain.value = state.masterVolume;
    const limiter = offline.createDynamicsCompressor();
    limiter.threshold.value = -1;
    limiter.ratio.value = 20;
    master.connect(limiter);
    limiter.connect(offline.destination);
    const anySolo = state.tracks.some((t) => t.solo);
    for (const track of state.tracks) {
      if (track.muted || (anySolo && !track.solo)) continue;
      const gain = offline.createGain();
      gain.gain.value = track.volume;
      const pan = offline.createStereoPanner();
      pan.pan.value = track.pan;
      connectEffects(offline as unknown as AudioContext, gain, track.effects).connect(pan);
      pan.connect(master);
      for (const clip of track.clips) {
        const buf = await loadBuffer(clip.url);
        const src = offline.createBufferSource();
        src.buffer = buf;
        src.connect(gain);
        src.start(clip.startTime, clip.displayStart, Math.max(0.01, clip.displayEnd - clip.displayStart));
      }
    }
    const rendered = await offline.startRendering();
    return encodeWav(rendered);
  }, [connectEffects, duration, loadBuffer, state]);

  useEffect(() => {
    refreshDevices();
    return () => {
      stopSources();
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [refreshDevices, stopSources]);

  useEffect(() => {
    state.tracks.forEach((t) => t.clips.forEach((c) => { if (!c.peaks) ensurePeaks(c); }));
  }, [ensurePeaks, state.tracks]);

  return {
    state,
    setState: setMixerState,
    hydrate,
    playhead,
    setPlayhead: seek,
    playing,
    recording,
    countdown,
    meters,
    selectedClipId,
    setSelectedClipId,
    selectedTrackId,
    setSelectedTrackId,
    devices,
    inputId,
    setInputId,
    monitor,
    setMonitor,
    inputGain,
    setInputGain,
    snap,
    setSnap,
    zoom,
    setZoom,
    metronome,
    setMetronome,
    countIn,
    setCountIn,
    dirty,
    setDirty,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    latencyMs,
    duration,
    play,
    pause,
    stop,
    addTrack,
    updateTrack,
    addClipToTrack,
    importUrl,
    updateClip,
    splitClip,
    duplicateClip,
    deleteSelected,
    undo,
    redo,
    startRecording,
    stopRecording,
    exportMix,
    loadBuffer,
    ensureContext,
    rememberObjectUrl: (url: string) => objectUrls.current.push(url),
  };
}
