'use client';

import React, { useState, useCallback } from 'react';

export default function StudioWorkspacePage() {
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tracks, setTracks] = useState([
    { id: '1', name: 'Vocal', volume: 0.8, muted: false, solo: false },
    { id: '2', name: 'Drums', volume: 0.7, muted: false, solo: false },
  ]);

  const handleAddTrack = useCallback(() => {
    const newTrack = {
      id: String(Date.now()),
      name: `Track ${tracks.length + 1}`,
      volume: 0.8,
      muted: false,
      solo: false,
    };
    setTracks([...tracks, newTrack]);
  }, [tracks.length]);

  const handleRemoveTrack = useCallback((id: string) => {
    setTracks(tracks.filter((t) => t.id !== id));
  }, [tracks]);

  const handleTrackUpdate = useCallback(
    (id: string, updates: Partial<(typeof tracks)[0]>) => {
      setTracks(tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    },
    [tracks]
  );

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  return (
    <div className="min-h-screen bg-wise-bg text-wise-text-primary overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-wise-medium bg-wise-bg/80 backdrop-blur-lg">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-wise-primary to-wise-primary-active rounded flex items-center justify-center font-bold text-wise-bg">
              W2
            </div>
            <span className="font-bold text-xl">WISE² Studio</span>
          </div>
          <div className="text-sm text-wise-text-secondary">SoundLabs Recording Studio</div>
          <a href="/" className="text-sm text-wise-text-secondary hover:text-wise-primary transition-colors">
            ← Back
          </a>
        </div>
      </header>

      {/* Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 h-[calc(100vh-80px)] overflow-hidden">
        {/* Left Panel - Tracks */}
        <div className="lg:col-span-1 bg-wise-surface-secondary border border-wise-medium rounded-lg p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wide">Tracks</h3>
            <button
              onClick={handleAddTrack}
              className="px-2 py-1 text-xs bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded transition"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="bg-wise-surface border border-wise-medium rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">{track.name}</div>
                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    className="text-wise-accent-red hover:text-wise-accent-red/80 text-xs transition"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-wise-text-secondary">Volume: {Math.round(track.volume * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume * 100}
                      onChange={(e) =>
                        handleTrackUpdate(track.id, { volume: parseInt(e.target.value) / 100 })
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleTrackUpdate(track.id, { muted: !track.muted })
                      }
                      className={`px-2 py-1 rounded transition ${
                        track.muted ? 'bg-wise-accent-red/50' : 'bg-wise-surface'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() =>
                        handleTrackUpdate(track.id, { solo: !track.solo })
                      }
                      className={`px-2 py-1 rounded transition ${
                        track.solo ? 'bg-wise-accent-orange/50' : 'bg-wise-surface'
                      }`}
                    >
                      S
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Timeline */}
        <div className="lg:col-span-3 bg-wise-surface-secondary border border-wise-medium rounded-lg p-4 overflow-x-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-wise-medium pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wide">Timeline</h3>
            <div className="text-xs text-wise-text-muted">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div key={track.id} className="mb-2 bg-wise-surface border border-wise-medium rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-wise-text-primary">{track.name}</span>
                  <span className="text-xs text-wise-text-muted">{track.muted ? 'MUTED' : 'ACTIVE'}</span>
                </div>
                <div className="relative h-12 bg-wise-surface rounded border border-wise-subtle">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-6 bg-gradient-to-r from-wise-primary to-wise-primary-hover rounded opacity-30" />
                  </div>
                  <div
                    className="absolute top-0 h-full w-px bg-wise-accent-red"
                    style={{ left: `${(currentTime / 300) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Master Mixer */}
        <div className="lg:col-span-1 bg-wise-surface-secondary border border-wise-medium rounded-lg p-4 flex flex-col">
          {/* Master Mixer */}
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Master</h3>
            <div className="bg-wise-surface border border-wise-medium rounded p-4 space-y-3">
              <div>
                <label className="text-xs text-wise-text-secondary">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
                  className="w-full"
                />
                <div className="text-xs text-wise-text-muted mt-1">{Math.round(masterVolume * 100)}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-wise-card p-2 rounded">
                  <div className="text-wise-text-muted">Peak</div>
                  <div className="text-wise-accent-green font-semibold">-3 dB</div>
                </div>
                <div className="bg-wise-card p-2 rounded">
                  <div className="text-wise-text-muted">RMS</div>
                  <div className="text-wise-accent-green font-semibold">-12 dB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="border-t border-wise-medium pt-4 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Transport</h3>
            <div className="space-y-2">
              <button
                onClick={handlePlayPause}
                className="w-full py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold transition flex items-center justify-center gap-2"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={handleStop}
                className="w-full py-3 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded font-semibold transition border border-wise-medium"
              >
                ⏹ Stop
              </button>
              <button className="w-full py-3 bg-wise-accent-red hover:opacity-90 text-wise-text-primary rounded font-semibold transition">
                ● Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        aria-label="Open support chat"
        title="Open support chat"
        className="flex h-14 w-14 items-center justify-center rounded-full border border-wise-primary/30 bg-gradient-to-br from-wise-primary to-wise-primary-active text-2xl text-wise-text-primary shadow-[0_0_35px_rgba(0,148,255,0.35)] backdrop-blur-xl transition-transform hover:scale-105"
      >
        💬
      </button>
    </div>
  );
}
