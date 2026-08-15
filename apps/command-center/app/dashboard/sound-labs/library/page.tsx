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
  assetType: string;
  url: string;
  sourceModule: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AudioLibraryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'AUDIO' | 'VIDEO'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('authToken') || '';

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token || !user?.id) { setLoading(false); return; }

      const params = new URLSearchParams({ userId: user.id, limit: '100' });
      if (filter !== 'all') params.set('assetType', filter);

      const res = await fetch(`${API_URL}/v1/gallery?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch { /* Gallery may not be running */ }
    finally { setLoading(false); }
  }, [user?.id, filter]);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchAssets();
  }, [user?.id, fetchAssets]);

  const audioAssets = assets.filter(a => a.assetType === 'AUDIO' || a.mimeType.startsWith('audio/'));
  const videoAssets = assets.filter(a => a.assetType === 'VIDEO' || a.mimeType.startsWith('video/'));
  const displayAssets = filter === 'all' ? assets : filter === 'AUDIO' ? audioAssets : videoAssets;

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

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="wise-breadcrumb mb-2">
            <Link href="/dashboard/sound-labs">Sound Labs</Link>
            <span className="opacity-30">/</span>
            <span className="text-text-secondary">Audio Library</span>
          </div>
          <h1 className="wise-page-title">Audio Library</h1>
          <p className="wise-page-subtitle">All your audio and video assets from Gallery</p>
        </div>
        <Link href="/dashboard/gallery" className="wise-btn-secondary">Full Gallery &rarr;</Link>
      </div>

      {/* Stats Strip */}
      <div className="wise-card p-1">
        <div className="grid grid-cols-3">
          {[
            { label: 'Total Assets', value: assets.length },
            { label: 'Audio Files', value: audioAssets.length },
            { label: 'Video Files', value: videoAssets.length },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'AUDIO', 'VIDEO'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-wise-electric/15 text-wise-electric border border-wise-electric/30'
                : 'bg-wise-black/40 border border-border-subtle text-text-muted hover:text-text-secondary'
            }`}>
            {f === 'all' ? 'All' : f === 'AUDIO' ? 'Audio' : 'Video'}
          </button>
        ))}
      </div>

      {/* Asset List */}
      {displayAssets.length > 0 ? (
        <div className="wise-card overflow-hidden divide-y divide-border-subtle">
          {displayAssets.map(asset => (
            <div key={asset.id} className="px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{asset.originalName}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span>{formatBytes(asset.size)}</span>
                    <span>{asset.mimeType}</span>
                    {asset.sourceModule && <span className="wise-badge-info">{asset.sourceModule}</span>}
                    <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setPlayingId(playingId === asset.id ? null : asset.id)}
                    className="wise-btn-secondary text-xs py-1 px-2.5">
                    {playingId === asset.id ? 'Close' : 'Play'}
                  </button>
                  <a href={`${API_BASE}${asset.url}`} download={asset.originalName}
                    className="wise-btn-secondary text-xs py-1 px-2.5">
                    Download
                  </a>
                </div>
              </div>
              {playingId === asset.id && (
                <div className="mt-3">
                  {asset.mimeType.startsWith('audio/') ? (
                    <audio src={`${API_BASE}${asset.url}`} controls autoPlay className="w-full" />
                  ) : (
                    <video src={`${API_BASE}${asset.url}`} controls autoPlay className="w-full rounded bg-black" style={{ maxHeight: '300px' }} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="wise-empty wise-card">
          <div className="wise-empty-icon">&#128218;</div>
          <h3 className="wise-empty-title">No Assets Found</h3>
          <p className="wise-empty-desc">Upload audio or video via the Gallery, or create recordings in Live Studio.</p>
        </div>
      )}
    </div>
  );
}
