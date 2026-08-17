'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserAuthToken } from '@/lib/auth-session';
import {
  Radio,
  Zap,
  Camera,
  Mic,
  Share2,
  Maximize2,
  Volume2,
  Settings,
  AlertCircle,
  Loader,
  Eye,
  MessageCircle,
  BarChart3,
} from 'lucide-react';

interface StreamStatus {
  isLive: boolean;
  viewers: number;
  bitrate: number;
  fps: number;
  uptime: number;
}

interface StreamSettings {
  rtmpUrl: string;
  streamKey: string;
  resolution: string;
  bitrate: number;
  fps: number;
}

export default function LiveStudioDashboard() {
  const router = useRouter();
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    isLive: false,
    viewers: 0,
    bitrate: 0,
    fps: 0,
    uptime: 0,
  });
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    rtmpUrl: '',
    streamKey: '',
    resolution: '1920x1080',
    bitrate: 6000,
    fps: 60,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getBrowserAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadStreamStatus(token);
  }, [router]);

  const loadStreamStatus = async (token: string) => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to fetch stream status from API
      const res = await fetch('/api/v1/live-studio/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStreamStatus(data.status || streamStatus);
        setStreamSettings(data.settings || streamSettings);
      } else {
        // API not available, show configuration required state
        setError(null);
      }
    } catch (err) {
      console.log('Stream status API not available - showing setup state');
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleStream = async () => {
    if (!streamSettings.rtmpUrl || !streamSettings.streamKey) {
      setError('Please configure RTMP settings first');
      return;
    }

    try {
      const action = streamStatus.isLive ? 'stop' : 'start';
      const res = await fetch(`/api/v1/live-studio/stream/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getBrowserAuthToken() ?? ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rtmpUrl: streamSettings.rtmpUrl,
          streamKey: streamSettings.streamKey,
        }),
      });

      if (res.ok) {
        setStreamStatus({
          ...streamStatus,
          isLive: !streamStatus.isLive,
        });
      }
    } catch (err) {
      console.error('Failed to toggle stream:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wise-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-wise-primary mx-auto mb-4 animate-spin" />
          <p className="text-wise-text-secondary">Loading Live Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise-bg-primary text-wise-text-primary">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg border ${
                  streamStatus.isLive
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-wise-primary/10 border-wise-primary-border'
                }`}>
                  <Radio className={`w-6 h-6 ${streamStatus.isLive ? 'text-red-400' : 'text-wise-primary'}`} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-wise-primary">Live Studio</h1>
                  <p className="text-wise-text-secondary mt-1">
                    {streamStatus.isLive ? '🔴 LIVE' : '⚪ OFFLINE'} - Professional streaming control center
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={toggleStream}
              disabled={!streamSettings.rtmpUrl}
              className={`px-6 py-3 font-semibold rounded-lg transition-colors inline-flex items-center gap-2 ${
                streamStatus.isLive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : streamSettings.rtmpUrl
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-600 cursor-not-allowed text-gray-300'
              }`}
            >
              <Zap className="w-4 h-4" />
              {streamStatus.isLive ? 'Stop Stream' : 'Go Live'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Configuration Required</p>
              <p className="text-red-300/70 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stream Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Stream Preview</h2>
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg overflow-hidden">
            <div className="aspect-video bg-black/50 flex items-center justify-center">
              {streamStatus.isLive ? (
                <div className="text-center">
                  <Radio className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-wise-text-secondary">Stream Active</p>
                  <p className="text-sm text-wise-text-muted mt-2">{streamStatus.viewers} viewers</p>
                </div>
              ) : (
                <div className="text-center">
                  <Eye className="w-16 h-16 text-wise-primary/30 mx-auto mb-4" />
                  <p className="text-wise-text-secondary">Preview Unavailable</p>
                  <p className="text-sm text-wise-text-muted mt-2">Start streaming to see live preview</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stream Stats */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-wise-text-primary">Stream Stats</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-wise-text-muted mb-1">Viewers</p>
                <p className="text-2xl font-bold text-wise-primary">{streamStatus.viewers}</p>
              </div>
              <div>
                <p className="text-sm text-wise-text-muted mb-1">Bitrate</p>
                <p className="text-lg font-semibold">{streamStatus.bitrate} kbps</p>
              </div>
              <div>
                <p className="text-sm text-wise-text-muted mb-1">FPS</p>
                <p className="text-lg font-semibold">{streamStatus.fps} fps</p>
              </div>
              <div>
                <p className="text-sm text-wise-text-muted mb-1">Uptime</p>
                <p className="text-lg font-semibold">
                  {Math.floor(streamStatus.uptime / 60)}:{String(streamStatus.uptime % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>

          {/* Audio Mixer */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Volume2 className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-wise-text-primary">Audio Mixer</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-wise-text-muted">Microphone</label>
                  <span className="text-sm text-wise-primary">-12dB</span>
                </div>
                <div className="w-full bg-wise-bg-secondary rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-wise-text-muted">System Audio</label>
                  <span className="text-sm text-wise-primary">-6dB</span>
                </div>
                <div className="w-full bg-wise-bg-secondary rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-wise-text-muted">Master</label>
                  <span className="text-sm text-wise-primary">-3dB</span>
                </div>
                <div className="w-full bg-wise-bg-secondary rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-wise-text-primary">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera Settings
              </button>
              <button className="w-full px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Microphone Test
              </button>
              <button className="w-full px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat Settings
              </button>
              <button className="w-full px-4 py-2 bg-wise-primary/10 hover:bg-wise-primary/20 border border-wise-primary-border rounded-lg text-wise-primary text-sm font-semibold transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </button>
            </div>
          </div>
        </div>

        {/* Streaming Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Maximize2, label: 'Scene Manager', status: 'READY' },
              { icon: Share2, label: 'Multistreaming', status: 'READY' },
              { icon: MessageCircle, label: 'Chat Overlay', status: 'READY' },
              { icon: BarChart3, label: 'Stream Analytics', status: 'READY' },
              { icon: Camera, label: 'Screen Share', status: 'SETUP REQUIRED' },
              { icon: Mic, label: 'Noise Gate', status: 'BETA' },
              { icon: Radio, label: 'Auto Captions', status: 'COMING SOON' },
              { icon: Zap, label: 'AI Scene Detection', status: 'PLANNED' },
            ].map((feature) => {
              const Icon = feature.icon;
              const statusColor =
                feature.status === 'READY'
                  ? 'bg-green-500/10 text-green-400'
                  : feature.status === 'BETA'
                    ? 'bg-yellow-500/10 text-yellow-400'
                    : 'bg-gray-500/10 text-gray-400';

              return (
                <div
                  key={feature.label}
                  className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-4 hover:border-wise-primary-hover/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Icon className="w-5 h-5 text-wise-primary" />
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColor}`}>{feature.status}</span>
                  </div>
                  <p className="text-sm text-wise-text-primary font-medium">{feature.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup Guide */}
        {!streamSettings.rtmpUrl && (
          <div className="bg-wise-bg-card border border-wise-primary-border rounded-lg p-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-wise-text-primary mb-2">Setup Required</h3>
                <p className="text-wise-text-muted mb-4">
                  To start streaming, you need to configure your RTMP settings. Contact your administrator or configure in Advanced Settings.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
