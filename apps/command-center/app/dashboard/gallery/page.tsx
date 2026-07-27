'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

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

const typeIcons: Record<GalleryAsset['type'], string> = {
  image: '🖼️',
  audio: '🎵',
  video: '🎬',
  document: '📄',
};

export default function GalleryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [assets, setAssets] = useState<GalleryAsset[]>([]);
  const [stats, setStats] = useState<GalleryStats>({
    total: 0, images: 0, audio: 0, video: 0, storageUsed: 0,
  });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchAssets();
  }, [user?.id]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/v1/gallery/assets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const assetList: GalleryAsset[] = (data.assets || []).map((a: any) => ({
          ...a,
          type: a.type || classifyType(a.name || ''),
        }));
        setAssets(assetList);

        setStats({
          total: assetList.length,
          images: assetList.filter((a) => a.type === 'image').length,
          audio: assetList.filter((a) => a.type === 'audio').length,
          video: assetList.filter((a) => a.type === 'video').length,
          storageUsed: assetList.reduce((sum, a) => sum + (a.size || 0), 0),
        });
      } else {
        setAssets([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load gallery';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = !search || asset.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === 'All' ||
      (category === 'Images' && asset.type === 'image') ||
      (category === 'Audio' && asset.type === 'audio') ||
      (category === 'Video' && asset.type === 'video') ||
      (category === 'Documents' && asset.type === 'document');
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-wise-surface rounded w-32 mb-4"></div>
          <div className="h-4 bg-wise-surface rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Gallery</h1>
        <p className="text-text-secondary">
          Unified asset browser for all your media files
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold">Error loading Gallery</p>
            <p className="text-red-300/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Assets', value: stats.total, icon: '📦' },
          { label: 'Images', value: stats.images, icon: '🖼️' },
          { label: 'Audio', value: stats.audio, icon: '🎵' },
          { label: 'Video', value: stats.video, icon: '🎬' },
          { label: 'Storage', value: formatBytes(stats.storageUsed), icon: '💾' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-wise-surface border border-wise-border rounded-lg p-4 hover:border-wise-electric/50 transition-all"
          >
            <span className="text-2xl block mb-2">{stat.icon}</span>
            <div className="text-2xl font-bold text-wise-electric">{stat.value}</div>
            <div className="text-xs text-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-wise-surface border border-wise-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric transition-colors"
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                category === cat
                  ? 'bg-wise-electric text-wise-black'
                  : 'bg-wise-surface border border-wise-border text-text-secondary hover:border-wise-electric/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-wise-surface border border-wise-border rounded-lg p-4 hover:border-wise-electric/50 transition-all group cursor-pointer"
            >
              <div className="aspect-square bg-wise-black/50 rounded-lg flex items-center justify-center mb-3">
                <span className="text-4xl opacity-50 group-hover:opacity-80 transition-opacity">
                  {typeIcons[asset.type]}
                </span>
              </div>
              <h3 className="font-semibold text-text-primary text-sm truncate group-hover:text-wise-electric transition-colors">
                {asset.name}
              </h3>
              <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                <span>{formatBytes(asset.size)}</span>
                <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-12 text-center">
          <span className="text-6xl block mb-4 opacity-30">🖼️</span>
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Assets Found</h3>
          <p className="text-text-muted mb-6">
            {search || category !== 'All'
              ? 'No assets match your current filters.'
              : 'Upload media files to get started with your asset library.'}
          </p>
        </div>
      )}
    </div>
  );
}
