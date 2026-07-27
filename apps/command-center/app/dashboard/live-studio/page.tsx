'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';
import {
  CaptureType,
  RecordingStatus,
  requestCapture,
  createRecorder,
  stopAllTracks,
  assembleBlob,
  uploadToGallery,
} from '../../../src/lib/recording';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

interface GalleryAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  assetType: string;
  url: string;
  metadata: { captureType?: string; duration?: number; startedAt?: string; stoppedAt?: string } | null;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LiveStudioPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<RecordingStatus>('READY');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [recordings, setRecordings] = useState<GalleryAsset[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<string>('');
  const captureTypeRef = useRef<CaptureType>('camera');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  }, []);

  const loadRecordings = useCallback(async () => {
    const token = getToken();
    if (!token || !user?.id) return;
    try {
      setLoadingRecordings(true);
      const res = await fetch(`${API_URL}/v1/gallery?sourceModule=live-studio&userId=${user.id}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.assets || []);
      }
    } catch { /* Gallery may not be running */ }
    finally { setLoadingRecordings(false); }
  }, [getToken, user?.id]);

  useEffect(() => { if (user?.id) loadRecordings(); }, [user?.id, loadRecordings]);
  useEffect(() => {
    return () => {
      stopAllTracks(streamRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async (captureType: CaptureType) => {
    setError(null);
    setStatus('REQUESTING_PERMISSION');
    captureTypeRef.current = captureType;
    try {
      const stream = await requestCapture(captureType);
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
      chunksRef.current = [];
      const recorder = createRecorder(stream, (chunk) => { chunksRef.current.push(chunk); });
      recorderRef.current = recorder;
      startTimeRef.current = new Date().toISOString();
      setDuration(0);
      recorder.start(1000);
      setStatus('RECORDING');
      timerRef.current = setInterval(() => { setDuration(d => d + 1); }, 1000);
      stream.getTracks().forEach(track => {
        track.onended = () => { if (recorderRef.current?.state === 'recording') stopRecording(); };
      });
    } catch (err) {
      stopAllTracks(streamRef.current);
      streamRef.current = null;
      const msg = err instanceof Error ? err.message : 'Capture failed';
      if (msg.includes('Permission denied') || msg.includes('NotAllowed')) {
        setError('Permission denied. Please allow camera/screen access.');
      } else if (msg.includes('AbortError') || msg.includes('cancelled')) {
        setError(null); setStatus('READY'); return;
      } else { setError(msg); }
      setStatus('ERROR');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setStatus('SAVING');
    const recorder = recorderRef.current;
    const stoppedAt = new Date().toISOString();
    await new Promise<void>(resolve => { recorder.onstop = () => resolve(); recorder.stop(); });
    stopAllTracks(streamRef.current);
    streamRef.current = null;
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    const mimeType = recorder.mimeType || 'video/webm';
    const blob = assembleBlob(chunksRef.current, mimeType);
    chunksRef.current = [];
    if (blob.size === 0) { setError('Recording produced no data'); setStatus('ERROR'); return; }
    const token = getToken();
    if (!token) { setError('Not authenticated'); setStatus('ERROR'); return; }
    try {
      await uploadToGallery(blob, token, API_URL, { captureType: captureTypeRef.current, duration, startedAt: startTimeRef.current, stoppedAt });
      setStatus('SAVED');
      await loadRecordings();
      setTimeout(() => setStatus('READY'), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Upload failed'); setStatus('ERROR'); }
  };

  const deleteRecording = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/v1/gallery/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) { setRecordings(prev => prev.filter(r => r.id !== id)); if (playingId === id) setPlayingId(null); }
    } catch { /* silent */ }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-64" />
      </div>
    );
  }

  const isRecording = status === 'RECORDING';
  const isBusy = status === 'REQUESTING_PERMISSION' || status === 'SAVING';

  const statusLine = (() => {
    switch (status) {
      case 'RECORDING': return `RECORDING - ${formatDuration(duration)}`;
      case 'REQUESTING_PERMISSION': return 'Requesting permission...';
      case 'SAVING': return 'Saving to Gallery...';
      case 'SAVED': return 'Saved to Gallery';
      case 'ERROR': return 'Error';
      default: return 'READY - Record camera or screen';
    }
  })();

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="wise-page-title">Live Studio</h1>
        <div className="flex items-center gap-2 mt-1">
          {isRecording && <span className="wise-pulse-live" />}
          <p className={`text-sm ${isRecording ? 'text-danger font-medium' : 'text-text-muted'}`}>{statusLine}</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-danger-muted border border-danger/20 rounded-lg text-danger text-sm">{error}</div>
      )}

      {/* Recording Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => isRecording ? stopRecording() : startRecording('camera')}
          disabled={isBusy || (isRecording && captureTypeRef.current !== 'camera')}
          className={`wise-card p-5 text-left transition-all ${
            isRecording && captureTypeRef.current === 'camera' ? '!border-danger/40 bg-danger/5' : ''
          } ${isBusy ? 'opacity-50 cursor-not-allowed' : 'hover:border-wise-electric/30 cursor-pointer'}`}
        >
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {isRecording && captureTypeRef.current === 'camera' ? 'Stop Recording' : 'Record Camera'}
          </h3>
          <p className="text-xs text-text-muted">
            {isRecording && captureTypeRef.current === 'camera'
              ? `Recording... ${formatDuration(duration)}` : 'Capture webcam video with audio'}
          </p>
        </button>

        <button
          onClick={() => isRecording ? stopRecording() : startRecording('screen')}
          disabled={isBusy || (isRecording && captureTypeRef.current !== 'screen')}
          className={`wise-card p-5 text-left transition-all ${
            isRecording && captureTypeRef.current === 'screen' ? '!border-danger/40 bg-danger/5' : ''
          } ${isBusy ? 'opacity-50 cursor-not-allowed' : 'hover:border-wise-electric/30 cursor-pointer'}`}
        >
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {isRecording && captureTypeRef.current === 'screen' ? 'Stop Recording' : 'Record Screen'}
          </h3>
          <p className="text-xs text-text-muted">
            {isRecording && captureTypeRef.current === 'screen'
              ? `Recording... ${formatDuration(duration)}` : 'Capture screen or window with audio'}
          </p>
        </button>
      </div>

      {/* Live Preview */}
      {isRecording && (
        <div className="wise-card overflow-hidden p-0">
          <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full aspect-video bg-black" />
        </div>
      )}

      {/* Go Live */}
      <div className="wise-card p-4 opacity-60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Go Live</h3>
            <p className="text-xs text-text-muted">Live streaming requires RTMP backend - not yet available</p>
          </div>
          <span className="wise-badge-warning">Setup Required</span>
        </div>
      </div>

      {/* Recordings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="wise-section-title">Recordings</h2>
          <Link href="/dashboard/live-studio/recordings" className="text-xs text-wise-electric hover:underline">View All &rarr;</Link>
        </div>
        {loadingRecordings ? (
          <div className="wise-card p-8 text-center">
            <p className="text-sm text-text-muted">Loading recordings...</p>
          </div>
        ) : recordings.length > 0 ? (
          <div className="wise-card overflow-hidden divide-y divide-border-subtle">
            {recordings.slice(0, 5).map(rec => (
              <div key={rec.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{rec.originalName}</p>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                      <span>{formatBytes(rec.size)}</span>
                      {rec.metadata?.duration != null && <span>{formatDuration(rec.metadata.duration)}</span>}
                      <span className="wise-badge-info">{rec.metadata?.captureType || 'recording'}</span>
                      <span>{new Date(rec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setPlayingId(playingId === rec.id ? null : rec.id)} className="wise-btn-secondary text-xs py-1 px-2.5">
                      {playingId === rec.id ? 'Close' : 'Play'}
                    </button>
                    <a href={`${API_BASE}${rec.url}`} download={rec.originalName} className="wise-btn-secondary text-xs py-1 px-2.5">DL</a>
                    <button onClick={() => deleteRecording(rec.id)} className="text-xs text-text-muted hover:text-danger transition-colors px-1">Del</button>
                  </div>
                </div>
                {playingId === rec.id && (
                  <div className="mt-3">
                    <video src={`${API_BASE}${rec.url}`} controls autoPlay className="w-full rounded bg-black" style={{ maxHeight: '400px' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="wise-empty wise-card">
            <div className="wise-empty-icon">&#127916;</div>
            <h3 className="wise-empty-title">No Recordings Yet</h3>
            <p className="wise-empty-desc">Use the camera or screen buttons above to create your first recording.</p>
          </div>
        )}
      </div>

      {/* Feature Status */}
      <div className="wise-card p-5">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Feature Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Scene Manager', status: 'UI ONLY' },
            { label: 'Multistreaming', status: 'UI ONLY' },
            { label: 'Chat Overlay', status: 'UI ONLY' },
            { label: 'Stream Analytics', status: 'UI ONLY' },
            { label: 'Screen Capture', status: 'WORKING' },
            { label: 'Audio Recording', status: 'WORKING' },
            { label: 'Auto Captions', status: 'COMING SOON' },
            { label: 'AI Scene Detection', status: 'COMING SOON' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-2 p-2.5 rounded-lg bg-wise-black/30">
              <span className={`wise-status-dot ${
                f.status === 'WORKING' ? 'bg-green-400' : f.status === 'UI ONLY' ? 'bg-amber-400' : 'bg-text-muted'
              }`} />
              <div>
                <p className="text-xs font-medium text-text-secondary">{f.label}</p>
                <p className={`text-[10px] ${
                  f.status === 'WORKING' ? 'text-green-400' : f.status === 'UI ONLY' ? 'text-amber-400' : 'text-text-muted'
                }`}>{f.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
