'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import {
  CaptureType,
  RecordingStatus,
  requestCapture,
  createRecorder,
  stopAllTracks,
  assembleBlob,
  uploadToGallery,
  GalleryUploadResult,
} from '../../../src/lib/recording';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

interface GalleryAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  assetType: string;
  url: string;
  metadata: {
    captureType?: string;
    duration?: number;
    startedAt?: string;
    stoppedAt?: string;
  } | null;
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
    return localStorage.getItem('auth_token');
  }, []);

  const loadRecordings = useCallback(async () => {
    const token = getToken();
    if (!token || !user?.id) return;

    try {
      setLoadingRecordings(true);
      const res = await fetch(
        `${API_URL}/v1/gallery?sourceModule=live-studio&userId=${user.id}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.assets || []);
      }
    } catch {
      // Gallery may not be running
    } finally {
      setLoadingRecordings(false);
    }
  }, [getToken, user?.id]);

  useEffect(() => {
    if (user?.id) loadRecordings();
  }, [user?.id, loadRecordings]);

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
      const recorder = createRecorder(stream, (chunk) => {
        chunksRef.current.push(chunk);
      });
      recorderRef.current = recorder;

      startTimeRef.current = new Date().toISOString();
      setDuration(0);
      recorder.start(1000);
      setStatus('RECORDING');

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      stream.getTracks().forEach((track) => {
        track.onended = () => {
          if (recorderRef.current?.state === 'recording') {
            stopRecording();
          }
        };
      });
    } catch (err) {
      stopAllTracks(streamRef.current);
      streamRef.current = null;
      const msg = err instanceof Error ? err.message : 'Capture failed';
      if (msg.includes('Permission denied') || msg.includes('NotAllowed')) {
        setError('Permission denied. Please allow camera/screen access.');
      } else if (msg.includes('AbortError') || msg.includes('cancelled')) {
        setError(null);
        setStatus('READY');
        return;
      } else {
        setError(msg);
      }
      setStatus('ERROR');
    }
  };

  const stopRecording = async () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setStatus('SAVING');

    const recorder = recorderRef.current;
    const stoppedAt = new Date().toISOString();

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    stopAllTracks(streamRef.current);
    streamRef.current = null;
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }

    const mimeType = recorder.mimeType || 'video/webm';
    const blob = assembleBlob(chunksRef.current, mimeType);
    chunksRef.current = [];

    if (blob.size === 0) {
      setError('Recording produced no data');
      setStatus('ERROR');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      setStatus('ERROR');
      return;
    }

    try {
      await uploadToGallery(blob, token, API_URL, {
        captureType: captureTypeRef.current,
        duration,
        startedAt: startTimeRef.current,
        stoppedAt,
      });
      setStatus('SAVED');
      await loadRecordings();
      setTimeout(() => setStatus('READY'), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
      setStatus('ERROR');
    }
  };

  const deleteRecording = async (id: string) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/v1/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        setRecordings((prev) => prev.filter((r) => r.id !== id));
        if (playingId === id) setPlayingId(null);
      }
    } catch {
      // silent
    }
  };

  const features = [
    { icon: '🎬', label: 'Scene Manager', status: 'UI ONLY' },
    { icon: '📡', label: 'Multistreaming', status: 'UI ONLY' },
    { icon: '💬', label: 'Chat Overlay', status: 'UI ONLY' },
    { icon: '📊', label: 'Stream Analytics', status: 'UI ONLY' },
    { icon: '🖥️', label: 'Screen Capture', status: 'WORKING' },
    { icon: '🎤', label: 'Audio Recording', status: 'WORKING' },
    { icon: '📻', label: 'Auto Captions', status: 'PLANNED' },
    { icon: '⚡', label: 'AI Scene Detection', status: 'PLANNED' },
  ];

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4"></div>
          <div className="h-4 bg-wise-surface rounded w-64"></div>
        </div>
      </div>
    );
  }

  const isRecording = status === 'RECORDING';
  const isBusy = status === 'REQUESTING_PERMISSION' || status === 'SAVING';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg border ${
              isRecording
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-wise-electric/10 border-wise-electric/30'
            }`}>
              <span className="text-2xl">{isRecording ? '🔴' : '📻'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Live Studio</h1>
              <p className="text-text-secondary">
                {status === 'RECORDING' && `🔴 RECORDING — ${formatDuration(duration)}`}
                {status === 'REQUESTING_PERMISSION' && '⏳ Requesting permission…'}
                {status === 'SAVING' && '💾 Saving to Gallery…'}
                {status === 'SAVED' && '✅ Saved to Gallery'}
                {status === 'ERROR' && '❌ Error'}
                {status === 'READY' && '⚪ READY — Record camera or screen'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-red-300/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Record Camera */}
        <button
          onClick={() => isRecording ? stopRecording() : startRecording('camera')}
          disabled={isBusy || (status === 'RECORDING' && captureTypeRef.current !== 'camera')}
          className={`p-6 rounded-lg border transition-all text-left ${
            isRecording && captureTypeRef.current === 'camera'
              ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
              : 'bg-wise-surface border-wise-border hover:border-wise-electric/50'
          } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📷</span>
            <span className="text-lg font-semibold text-text-primary">
              {isRecording && captureTypeRef.current === 'camera' ? 'Stop Recording' : 'Record Camera'}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            {isRecording && captureTypeRef.current === 'camera'
              ? `Recording… ${formatDuration(duration)}`
              : 'Capture webcam video with audio'}
          </p>
        </button>

        {/* Record Screen */}
        <button
          onClick={() => isRecording ? stopRecording() : startRecording('screen')}
          disabled={isBusy || (status === 'RECORDING' && captureTypeRef.current !== 'screen')}
          className={`p-6 rounded-lg border transition-all text-left ${
            isRecording && captureTypeRef.current === 'screen'
              ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
              : 'bg-wise-surface border-wise-border hover:border-wise-electric/50'
          } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🖥️</span>
            <span className="text-lg font-semibold text-text-primary">
              {isRecording && captureTypeRef.current === 'screen' ? 'Stop Recording' : 'Record Screen'}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            {isRecording && captureTypeRef.current === 'screen'
              ? `Recording… ${formatDuration(duration)}`
              : 'Capture screen or window with audio'}
          </p>
        </button>
      </div>

      {/* Live Preview */}
      {isRecording && (
        <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
          <video
            ref={videoPreviewRef}
            autoPlay
            muted
            playsInline
            className="w-full aspect-video bg-black"
          />
        </div>
      )}

      {/* Go Live — unavailable */}
      <div className="bg-wise-surface border border-wise-border rounded-lg p-6 opacity-60">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary">Go Live</h3>
            <p className="text-sm text-text-muted">
              Live streaming requires RTMP backend — not yet available
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-500/10 text-gray-400">
            SETUP REQUIRED
          </span>
        </div>
      </div>

      {/* Recordings from Gallery */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Recordings</h2>
        {loadingRecordings ? (
          <div className="bg-wise-surface border border-wise-border rounded-lg p-8 text-center">
            <p className="text-text-muted">Loading recordings…</p>
          </div>
        ) : recordings.length === 0 ? (
          <div className="bg-wise-surface border border-wise-border rounded-lg p-8 text-center">
            <span className="text-4xl block mb-3 opacity-30">🎬</span>
            <p className="text-text-secondary">No recordings yet</p>
            <p className="text-sm text-text-muted mt-1">
              Use the camera or screen buttons above to create your first recording
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="bg-wise-surface border border-wise-border rounded-lg p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-wise-electric/10 border border-wise-electric/30 rounded-lg flex-shrink-0">
                    <span className="text-lg">
                      {rec.metadata?.captureType === 'screen' ? '🖥️' : '📷'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">
                      {rec.originalName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span>{formatBytes(rec.size)}</span>
                      {rec.metadata?.duration != null && (
                        <span>{formatDuration(rec.metadata.duration)}</span>
                      )}
                      <span>
                        {new Date(rec.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPlayingId(playingId === rec.id ? null : rec.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-wise-electric/10 hover:bg-wise-electric/20 text-wise-electric border border-wise-electric/30 rounded transition-colors"
                    >
                      {playingId === rec.id ? '⏹ Close' : '▶ Play'}
                    </button>
                    <a
                      href={`${API_BASE}${rec.url}`}
                      download={rec.originalName}
                      className="px-3 py-1.5 text-xs font-semibold bg-wise-surface hover:bg-wise-electric/10 text-text-secondary border border-wise-border rounded transition-colors"
                    >
                      ↓
                    </a>
                    <button
                      onClick={() => deleteRecording(rec.id)}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {playingId === rec.id && (
                  <div className="mt-3">
                    <video
                      src={`${API_BASE}${rec.url}`}
                      controls
                      autoPlay
                      className="w-full rounded bg-black"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Feature Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const statusColor =
              feature.status === 'WORKING'
                ? 'bg-green-500/10 text-green-400'
                : feature.status === 'UI ONLY'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-gray-500/10 text-gray-400';

            return (
              <div
                key={feature.label}
                className="bg-wise-surface border border-wise-border rounded-lg p-4 hover:border-wise-electric/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xl">{feature.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>
                    {feature.status}
                  </span>
                </div>
                <p className="text-sm text-text-primary font-medium">{feature.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
