'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Image, Music, Video, File, Upload, Loader, AlertCircle, Folder, Search } from 'lucide-react';
import { getBrowserAuthToken } from '@/lib/auth-session';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'file';
  size: number;
  createdAt: string;
  url?: string;
}

interface AssetStats {
  total: number;
  images: number;
  audio: number;
  video: number;
  storage: number;
}

export default function GalleryDashboard() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats>({
    total: 0,
    images: 0,
    audio: 0,
    video: 0,
    storage: 0,
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getBrowserAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadAssets(token);
  }, [router]);

  const loadAssets = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/v1/gallery/assets', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
        setStats({
          total: data.assets?.length || 0,
          images: data.assets?.filter((a: Asset) => a.type === 'image').length || 0,
          audio: data.assets?.filter((a: Asset) => a.type === 'audio').length || 0,
          video: data.assets?.filter((a: Asset) => a.type === 'video').length || 0,
          storage: Math.round(
            (data.assets?.reduce((sum: number, a: Asset) => sum + a.size, 0) || 0) / 1024 / 1024
          ),
        });
      } else {
        setAssets([]);
        setStats({ total: 0, images: 0, audio: 0, video: 0, storage: 0 });
      }
    } catch (err) {
      console.log('Gallery API not available');
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = activeCategory === 'all' || asset.type === activeCategory;
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-wise-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-wise-primary mx-auto mb-4 animate-spin" />
          <p className="text-wise-text-secondary">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-wise-primary/10 border border-wise-primary-border rounded-lg">
                  <Folder className="w-6 h-6 text-wise-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-wise-primary">Gallery</h1>
                  <p className="text-wise-text-secondary mt-1">Unified asset management for all your media</p>
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Asset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          {[
            { label: 'Total Assets', value: stats.total, icon: '📊', color: 'text-blue-400' },
            { label: 'Images', value: stats.images, icon: '🖼️', color: 'text-purple-400' },
            { label: 'Audio', value: stats.audio, icon: '🎵', color: 'text-green-400' },
            { label: 'Video', value: stats.video, icon: '🎬', color: 'text-red-400' },
            { label: 'Storage', value: `${stats.storage} MB`, icon: '💾', color: 'text-yellow-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 hover:border-wise-primary-hover/50 transition-all"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-sm text-wise-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-wise-text-muted" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-wise-bg-card border border-wise-primary-border rounded-lg text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-primary-hover"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'image', 'audio', 'video'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeCategory === cat
                      ? 'bg-wise-primary text-white'
                      : 'bg-wise-bg-card border border-wise-primary-border text-wise-text-secondary hover:border-wise-primary-hover'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-wise-bg-card border border-wise-primary-border rounded-lg overflow-hidden hover:border-wise-primary-hover/50 transition-all group cursor-pointer"
              >
                <div className="aspect-square bg-wise-bg-secondary/50 flex items-center justify-center">
                  <div className="text-4xl">{getAssetIcon(asset.type)}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-wise-text-primary mb-1 truncate group-hover:text-wise-primary-light transition-colors">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-wise-text-muted mb-3">
                    {Math.round(asset.size / 1024)} KB •{' '}
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-wise-primary/10 text-wise-primary rounded capitalize">
                      {asset.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-12 text-center">
            <Folder className="w-16 h-16 text-wise-primary/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-wise-text-primary mb-2">No Assets Found</h3>
            <p className="text-wise-text-muted mb-6">
              {searchTerm || activeCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start by uploading your first asset to the gallery'}
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors">
              <Upload className="w-4 h-4" />
              Upload Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
