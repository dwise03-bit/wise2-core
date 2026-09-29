'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { Card, Badge, Button, Input } from '../../../src/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface GalleryAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  createdAt: string;
  url?: string;
}

interface GalleryStats {
  total: number;
  images: number;
  audio: number;
  video: number;
  storageUsed: number;
}

const CATEGORIES = ['All', 'Images', 'Audio', 'Video', 'Documents'] as const;

function classifyType(filename: string): GalleryAsset['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext)) return 'audio';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  return 'document';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function GalleryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [stats, setStats] = useState<GalleryStats>({ total: 0, images: 0, audio: 0, video: 0, storageUsed: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetchAssets();
  }, [user?.id]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      if (!token) { setLoading(false); return; }

      const res = await fetch(`${API_URL}/v1/gallery/assets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const assetList: GalleryAsset[] = (data.assets || []).map((a: any) => ({
          ...a, type: a.type || classifyType(a.name || ''),
        }));
        setAssets(assetList);
        setStats({
          total: assetList.length,
          images: assetList.filter(a => a.type === 'image').length,
          audio: assetList.filter(a => a.type === 'audio').length,
          video: assetList.filter(a => a.type === 'video').length,
          storageUsed: assetList.reduce((sum, a) => sum + (a.size || 0), 0),
        });
      } else {
        setAssets([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = !search || asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All'
      || (category === 'Images' && asset.type === 'image')
      || (category === 'Audio' && asset.type === 'audio')
      || (category === 'Video' && asset.type === 'video')
      || (category === 'Documents' && asset.type === 'document');
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse bg-border-medium rounded" />
        <div className="h-3 w-56 animate-pulse bg-border-medium rounded" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 w-full animate-pulse bg-border-medium rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-wise-neon">Gallery</h1>
        <p className="text-sm text-text-muted mt-1">Unified asset browser for all your media files</p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {/* Stats Strip */}
      <Card className="p-1">
        <div className="grid grid-cols-2 md:grid-cols-5">
          {[
            { label: 'Total Assets', value: stats.total },
            { label: 'Images', value: stats.images },
            { label: 'Audio', value: stats.audio },
            { label: 'Video', value: stats.video },
            { label: 'Storage', value: formatBytes(stats.storageUsed) },
          ].map(s => (
            <div key={s.label} className="px-4 py-3">
              <div className="text-2xl font-bold text-text-primary tabular-nums">{s.value}</div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <Input type="text" placeholder="Search assets..." value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              onClick={() => setCategory(cat)}
              variant={category === cat ? 'primary' : 'ghost'}
              size="sm"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredAssets.map(asset => (
            <Card key={asset.id} className="p-4 group cursor-pointer">
              <div className="aspect-square bg-wise-black/40 rounded-lg flex items-center justify-center mb-3">
                <span className="text-3xl opacity-40 group-hover:opacity-70 transition-opacity">
                  {asset.type === 'image' ? '\u{1F5BC}' : asset.type === 'audio' ? '\u{1F3B5}' : asset.type === 'video' ? '\u{1F3AC}' : '\u{1F4C4}'}
                </span>
              </div>
              <h3 className="text-xs font-medium text-text-primary truncate group-hover:text-wise-electric transition-colors">{asset.name}</h3>
              <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted">
                <span>{formatBytes(asset.size)}</span>
                <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 flex flex-col items-center justify-center text-center">
          <div className="text-5xl mb-4">{'\u{1F5BC}'}</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Assets Found</h3>
          <p className="text-sm text-text-muted max-w-sm">
            {search || category !== 'All'
              ? 'No assets match your current filters.'
              : 'Upload media files to get started with your asset library.'}
          </p>
        </Card>
      )}
    </div>
  );
}
