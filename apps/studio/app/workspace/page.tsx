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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-500/30 bg-black/80 backdrop-blur-lg">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center font-bold text-black">
              W2
            </div>
            <span className="font-bold text-xl">WISE² Studio</span>
          </div>
          <div className="text-sm text-gray-400">SoundLabs Recording Studio</div>
          <a href="/" className="text-sm text-gray-400 hover:text-blue-400">
            ← Back
          </a>
        </div>
      </header>

      {/* Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 h-[calc(100vh-80px)] overflow-hidden">
        {/* Left Panel - Tracks */}
        <div className="lg:col-span-1 bg-gray-950 border border-blue-500/20 rounded-lg p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wide">Tracks</h3>
            <button
              onClick={handleAddTrack}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded transition"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="bg-gray-900 border border-blue-500/30 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-sm">{track.name}</div>
                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    className="text-red-500 hover:text-red-400 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-gray-400">Volume: {Math.round(track.volume * 100)}%</label>
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
                      className={`px-2 py-1 rounded ${
                        track.muted ? 'bg-red-600/50' : 'bg-gray-700'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() =>
                        handleTrackUpdate(track.id, { solo: !track.solo })
                      }
                      className={`px-2 py-1 rounded ${
                        track.solo ? 'bg-yellow-600/50' : 'bg-gray-700'
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
        <div className="lg:col-span-3 bg-gray-950 border border-blue-500/20 rounded-lg p-4 overflow-x-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
            <h3 className="font-bold text-sm uppercase tracking-wide">Timeline</h3>
            <div className="text-xs text-gray-500">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div key={track.id} className="mb-2 bg-gray-900 border border-blue-500/20 rounded p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-300">{track.name}</span>
                  <span className="text-xs text-gray-500">{track.muted ? 'MUTED' : 'ACTIVE'}</span>
                </div>
                <div className="relative h-12 bg-gray-800 rounded border border-blue-500/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded opacity-30" />
                  </div>
                  <div
                    className="absolute top-0 h-full w-px bg-red-500"
                    style={{ left: `${(currentTime / 300) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Master Mixer */}
        <div className="lg:col-span-1 bg-gray-950 border border-blue-500/20 rounded-lg p-4 flex flex-col">
          {/* Master Mixer */}
          <div className="mb-6">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Master</h3>
            <div className="bg-gray-900 border border-blue-500/30 rounded p-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">{Math.round(masterVolume * 100)}%</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-500">Peak</div>
                  <div className="text-green-400 font-semibold">-3 dB</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-500">RMS</div>
                  <div className="text-green-400 font-semibold">-12 dB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="border-t border-gray-700 pt-4 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3">Transport</h3>
            <div className="space-y-2">
              <button
                onClick={handlePlayPause}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition flex items-center justify-center gap-2"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={handleStop}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded font-semibold transition"
              >
                ⏹ Stop
              </button>
              <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded font-semibold transition">
                ● Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
