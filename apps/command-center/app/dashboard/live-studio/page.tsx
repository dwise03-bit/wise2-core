'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/contexts/AuthContext';

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

export default function LiveStudioPage() {
  const { user, isLoading: authLoading } = useAuth();
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
    if (!user?.id) {
      setLoading(false);
      return;
    }
    loadStreamStatus();
  }, [user?.id]);

  const loadStreamStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/v1/live-studio/status', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStreamStatus(data.status || streamStatus);
        setStreamSettings(data.settings || streamSettings);
      }
    } catch {
      // API not available — show setup state
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
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/v1/live-studio/stream/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rtmpUrl: streamSettings.rtmpUrl,
          streamKey: streamSettings.streamKey,
        }),
      });

      if (res.ok) {
        setStreamStatus({ ...streamStatus, isLive: !streamStatus.isLive });
      }
    } catch (err) {
      console.error('Failed to toggle stream:', err);
    }
  };

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

  const features = [
    { icon: '🎬', label: 'Scene Manager', status: 'UI ONLY' },
    { icon: '📡', label: 'Multistreaming', status: 'UI ONLY' },
    { icon: '💬', label: 'Chat Overlay', status: 'UI ONLY' },
    { icon: '📊', label: 'Stream Analytics', status: 'UI ONLY' },
    { icon: '🖥️', label: 'Screen Capture', status: 'PARTIAL' },
    { icon: '🎤', label: 'Audio Recording', status: 'PARTIAL' },
    { icon: '📻', label: 'Auto Captions', status: 'PLANNED' },
    { icon: '⚡', label: 'AI Scene Detection', status: 'PLANNED' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-3 rounded-lg border ${
              streamStatus.isLive
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-wise-electric/10 border-wise-electric/30'
            }`}>
              <span className="text-2xl">{streamStatus.isLive ? '🔴' : '📻'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Live Studio</h1>
              <p className="text-text-secondary">
                {streamStatus.isLive ? '🔴 LIVE' : '⚪ OFFLINE'} — Professional streaming control center
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
          <span>{streamStatus.isLive ? '⏹' : '⚡'}</span>
          {streamStatus.isLive ? 'Stop Stream' : 'Go Live'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="font-semibold">Configuration Required</p>
            <p className="text-red-300/70 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stream Preview */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Stream Preview</h2>
        <div className="bg-wise-surface border border-wise-border rounded-lg overflow-hidden">
          <div className="aspect-video bg-black/50 flex items-center justify-center">
            {streamStatus.isLive ? (
              <div className="text-center">
                <span className="text-6xl block mb-4 animate-pulse">📻</span>
                <p className="text-text-secondary">Stream Active</p>
                <p className="text-sm text-text-muted mt-2">{streamStatus.viewers} viewers</p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-6xl block mb-4 opacity-30">👁️</span>
                <p className="text-text-secondary">Preview Unavailable</p>
                <p className="text-sm text-text-muted mt-2">Start streaming to see live preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stream Stats */}
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
              <span className="text-lg">📊</span>
            </div>
            <h3 className="font-semibold text-text-primary">Stream Stats</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-text-muted mb-1">Viewers</p>
              <p className="text-2xl font-bold text-wise-electric">{streamStatus.viewers}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Bitrate</p>
              <p className="text-lg font-semibold text-text-primary">{streamStatus.bitrate} kbps</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">FPS</p>
              <p className="text-lg font-semibold text-text-primary">{streamStatus.fps} fps</p>
            </div>
            <div>
              <p className="text-sm text-text-muted mb-1">Uptime</p>
              <p className="text-lg font-semibold text-text-primary">
                {Math.floor(streamStatus.uptime / 60)}:{String(streamStatus.uptime % 60).padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>

        {/* Audio Mixer */}
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
              <span className="text-lg">🔊</span>
            </div>
            <h3 className="font-semibold text-text-primary">Audio Mixer</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-text-muted">Microphone</label>
                <span className="text-sm text-wise-electric">-12dB</span>
              </div>
              <div className="w-full bg-wise-black rounded-full h-2">
                <div className="bg-wise-electric h-2 rounded-full" style={{ width: '50%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-text-muted">System Audio</label>
                <span className="text-sm text-wise-electric">-6dB</span>
              </div>
              <div className="w-full bg-wise-black rounded-full h-2">
                <div className="bg-wise-electric h-2 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-text-muted">Master</label>
                <span className="text-sm text-wise-electric">-3dB</span>
              </div>
              <div className="w-full bg-wise-black rounded-full h-2">
                <div className="bg-wise-electric h-2 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-wise-surface border border-wise-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-wise-electric/10 border border-wise-electric/30 rounded-lg">
              <span className="text-lg">⚡</span>
            </div>
            <h3 className="font-semibold text-text-primary">Quick Actions</h3>
          </div>
          <div className="space-y-2">
            {[
              { icon: '📷', label: 'Camera Settings' },
              { icon: '🎤', label: 'Microphone Test' },
              { icon: '💬', label: 'Chat Settings' },
              { icon: '⚙️', label: 'Advanced Settings' },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full px-4 py-2 bg-wise-electric/10 hover:bg-wise-electric/20 border border-wise-border rounded-lg text-wise-electric text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Available Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const statusColor =
              feature.status === 'READY'
                ? 'bg-green-500/10 text-green-400'
                : feature.status === 'PARTIAL'
                  ? 'bg-yellow-500/10 text-yellow-400'
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

      {/* Setup Guide */}
      {!streamSettings.rtmpUrl && (
        <div className="bg-wise-surface border border-wise-border rounded-lg p-8">
          <div className="flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Setup Required</h3>
              <p className="text-text-muted mb-4">
                To start streaming, configure your RTMP settings. Contact your administrator or configure in Advanced Settings.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-wise-electric hover:bg-wise-electric_hover text-wise-black font-semibold rounded-lg transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
