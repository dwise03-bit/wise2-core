'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

interface GalleryAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
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

export default function LiveStudioRecordingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recordings, setRecordings] = useState<GalleryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchRecordings = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token || !user?.id) { setLoading(false); return; }

      const res = await fetch(`${API_URL}/v1/gallery?sourceModule=live-studio&userId=${user.id}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecordings(data.assets || []);
      }
    } catch { /* Gallery may not be running */ }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchRecordings();
  }, [user?.id, fetchRecordings]);

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

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="wise-skeleton h-6 w-36" />
        <div className="wise-skeleton h-3 w-56" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[1, 2, 3].map(i => <div key={i} className="wise-skeleton h-16 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const cameraCount = recordings.filter(r => r.metadata?.captureType === 'camera').length;
  const screenCount = recordings.filter(r => r.metadata?.captureType === 'screen').length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="wise-breadcrumb mb-2">
            <Link href="/dashboard/live-studio">Live Studio</Link>
            <span className="opacity-30">/</span>
            <span className="text-text-secondary">Recordings</span>
          </div>
          <h1 className="wise-page-title">Recordings</h1>
          <p className="wise-page-subtitle">Camera and screen recordings from Live Studio</p>
        </div>
        <Link href="/dashboard/live-studio" className="wise-btn-primary">Record New</Link>
      </div>

      {/* Stats Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-3">
          {[
            { label: 'Total', value: recordings.length },
            { label: 'Camera', value: cameraCount },
            { label: 'Screen', value: screenCount },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length > 0 ? (
        <div className="wise-card overflow-hidden divide-y divide-border-subtle">
          {recordings.map(rec => (
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
                  <button onClick={() => setPlayingId(playingId === rec.id ? null : rec.id)}
                    className="wise-btn-secondary text-xs py-1 px-2.5">
                    {playingId === rec.id ? 'Close' : 'Play'}
                  </button>
                  <a href={`${API_BASE}${rec.url}`} download={rec.originalName}
                    className="wise-btn-secondary text-xs py-1 px-2.5">Download</a>
                  <button onClick={() => deleteRecording(rec.id)}
                    className="text-xs text-text-muted hover:text-danger transition-colors px-1">Delete</button>
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
          <p className="wise-empty-desc">Use the camera or screen recording on the Live Studio page.</p>
          <Link href="/dashboard/live-studio" className="wise-btn-primary">Go to Live Studio</Link>
        </div>
      )}
    </div>
  );
}
