'use client';

import React, { useState, useCallback } from 'react';
import { MasterMixer } from '@/components/MasterMixer';
import { TrackPanel } from '@/components/TrackPanel';
import { TimelineTrack } from '@/components/TimelineTrack';
import { TransportControls } from '@/components/TransportControls';

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
              <TrackPanel
                key={track.id}
                track={track}
                onVolumeChange={(volume) =>
                  handleTrackUpdate(track.id, { volume })
                }
                onMuteChange={(muted) =>
                  handleTrackUpdate(track.id, { muted })
                }
                onRemove={() => handleRemoveTrack(track.id)}
              />
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
              <div key={track.id} className="mb-2">
                <TimelineTrack
                  track={track}
                  currentTime={currentTime}
                  duration={300}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Master Mixer */}
        <div className="lg:col-span-1 bg-gray-950 border border-blue-500/20 rounded-lg p-4">
          <MasterMixer
            masterVolume={masterVolume}
            peakLevel={-3}
            rmsLevel={-12}
            lufsLevel={-14}
            onVolumeChange={setMasterVolume}
          />

          <div className="mt-6 border-t border-gray-700 pt-6">
            <TransportControls
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onStop={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              onRecord={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
