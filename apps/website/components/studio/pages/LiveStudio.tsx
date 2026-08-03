'use client';

import { useState, useEffect } from 'react';

interface Channel {
  id: string;
  name: string;
  level: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

interface StreamSettings {
  platform: 'twitch' | 'youtube' | 'custom';
  bitrate: number;
  resolution: '720p' | '1080p' | '4k';
  fps: 30 | 60;
}

export default function LiveStudio() {
  const [isLive, setIsLive] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'Vocals', level: -6, muted: false, solo: false, color: '#39FF14' },
    { id: '2', name: 'Beat', level: -8, muted: false, solo: false, color: '#00D9FF' },
    { id: '3', name: 'Keys', level: -12, muted: false, solo: false, color: '#e0a83c' },
    { id: '4', name: 'Bass', level: -10, muted: false, solo: false, color: '#ff5c5c' },
  ]);
  const [masterLevel, setMasterLevel] = useState(-3);
  const [settings, setSettings] = useState<StreamSettings>({
    platform: 'twitch',
    bitrate: 6000,
    resolution: '1080p',
    fps: 60,
  });
  const [viewerCount, setViewerCount] = useState(0);
  const [aiFeatures, setAiFeatures] = useState({
    autoMix: false,
    noiseSuppression: false,
    audioEnhance: true,
  });

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 10));
    }, 2000);
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (!aiFeatures.autoMix) return;
    const interval = setInterval(() => {
      setChannels(prev =>
        prev.map(ch => ({
          ...ch,
          level: Math.max(-20, Math.min(0, ch.level + (Math.random() - 0.5) * 2)),
        }))
      );
    }, 500);
    return () => clearInterval(interval);
  }, [aiFeatures.autoMix]);

  const updateChannelLevel = (id: string, level: number) => {
    setChannels(prev =>
      prev.map(ch => (ch.id === id ? { ...ch, level: Math.max(-20, Math.min(0, level)) } : ch))
    );
  };

  const toggleMute = (id: string) => {
    setChannels(prev => prev.map(ch => (ch.id === id ? { ...ch, muted: !ch.muted } : ch)));
  };

  const toggleSolo = (id: string) => {
    setChannels(prev =>
      prev.map(ch => (ch.id === id ? { ...ch, solo: !ch.solo } : { ...ch, muted: ch.id !== id }))
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#fff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(to right, #39FF14, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            LIVE STUDIO
          </div>
          <div style={{ color: '#666', marginTop: '8px' }}>Professional streaming suite with AI enhancement</div>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          style={{
            padding: '16px 32px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '18px',
            border: 'none',
            cursor: 'pointer',
            background: isLive ? 'rgba(255, 92, 92, 0.8)' : '#39FF14',
            color: isLive ? '#fff' : '#000',
            transition: 'all 0.3s',
            animation: isLive ? 'pulse 1s infinite' : 'none',
          }}
        >
          {isLive ? '● LIVE' : '▶ GO LIVE'}
        </button>
      </div>

      {/* Live Stats */}
      {isLive && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Viewers', value: viewerCount.toLocaleString(), color: '#39FF14' },
            { label: 'Bitrate', value: settings.bitrate + ' kbps', color: '#00D9FF' },
            { label: 'Resolution', value: settings.resolution, color: '#e0a83c' },
            { label: 'FPS', value: settings.fps, color: '#ff5c5c' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: '#1a1a1a',
                border: `2px solid ${stat.color}40`,
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                transition: 'all 0.3s',
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
        {/* Mixer */}
        <div style={{ background: '#0d0d0d', border: '1px solid #333', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: '#39FF14', textTransform: 'uppercase', fontWeight: 700, marginBottom: '24px' }}>
            🎚️ Mixer Console
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {channels.map((channel) => (
              <div key={channel.id} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', padding: '16px' }}>
                <div style={{ color: channel.color, fontSize: '12px', fontWeight: 700, marginBottom: '12px', textAlign: 'center' }}>
                  {channel.name}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <input
                    type="range"
                    min="-20"
                    max="0"
                    step="0.1"
                    value={channel.level}
                    onChange={(e) => updateChannelLevel(channel.id, parseFloat(e.target.value))}
                    style={{
                      width: '8px',
                      height: '120px',
                      appearance: 'slider-vertical',
                      writingMode: 'bt-lr',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ fontSize: '12px', color: '#666' }}>{channel.level.toFixed(1)}dB</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                  <button
                    onClick={() => toggleMute(channel.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      border: channel.muted ? '1px solid #ff5c5c' : '1px solid #444',
                      background: channel.muted ? 'rgba(255, 92, 92, 0.2)' : '#333',
                      color: channel.muted ? '#ff9999' : '#888',
                      cursor: 'pointer',
                    }}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(channel.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      border: channel.solo ? '1px solid #e0a83c' : '1px solid #444',
                      background: channel.solo ? 'rgba(224, 168, 60, 0.2)' : '#333',
                      color: channel.solo ? '#e0c69c' : '#888',
                      cursor: 'pointer',
                    }}
                  >
                    S
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #333', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#39FF14', fontWeight: 700 }}>Master Level</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#00D9FF' }}>{masterLevel.toFixed(1)}dB</div>
            </div>
            <input
              type="range"
              min="-20"
              max="0"
              step="0.1"
              value={masterLevel}
              onChange={(e) => setMasterLevel(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '4px',
                background: '#1a1a1a',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* AI Features */}
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(57, 255, 20, 0.4)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#39FF14', textTransform: 'uppercase', fontWeight: 700, marginBottom: '16px' }}>
              🤖 AI Enhancement
            </div>
            {['autoMix', 'noiseSuppression', 'audioEnhance'].map((key) => (
              <button
                key={key}
                onClick={() => setAiFeatures(prev => ({ ...prev, [key]: !prev[key as keyof typeof aiFeatures] }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: aiFeatures[key as keyof typeof aiFeatures] ? '1px solid #39FF14' : '1px solid #444',
                  background: aiFeatures[key as keyof typeof aiFeatures] ? 'rgba(57, 255, 20, 0.2)' : '#333',
                  color: aiFeatures[key as keyof typeof aiFeatures] ? '#39FF14' : '#888',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
              >
                {aiFeatures[key as keyof typeof aiFeatures] ? '✓' : '○'} {key === 'autoMix' ? 'Auto-Mix' : key === 'noiseSuppression' ? 'Noise Kill' : 'Enhance'}
              </button>
            ))}
          </div>

          {/* Platform */}
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(0, 217, 255, 0.4)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#00D9FF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '12px' }}>
              📡 Platform
            </div>
            <select
              value={settings.platform}
              onChange={(e) => setSettings({ ...settings, platform: e.target.value as StreamSettings['platform'] })}
              style={{
                width: '100%',
                background: '#333',
                border: '1px solid #444',
                borderRadius: '6px',
                padding: '8px',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              <option>twitch</option>
              <option>youtube</option>
              <option>custom</option>
            </select>
          </div>

          {/* Status */}
          <div style={{ background: '#1a1a1a', border: '1px solid rgba(224, 168, 60, 0.4)', borderRadius: '8px', padding: '16px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '14px',
                background: isLive ? 'rgba(255, 92, 92, 0.2)' : '#333',
                color: isLive ? '#ff9999' : '#888',
                border: isLive ? '1px solid rgba(255, 92, 92, 0.5)' : '1px solid #444',
              }}
            >
              {isLive ? '🔴 STREAMING' : '⚫ OFFLINE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
