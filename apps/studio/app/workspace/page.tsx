'use client';

import React, { useState, useCallback } from 'react';
import { ProtectedRoute } from '../../components/Auth/ProtectedRoute';
import AnimatedGuide from '../../components/AnimatedGuide';
import { BottomNav } from '../../components/BottomNav';

function StudioWorkspaceContent() {
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [tracks, setTracks] = useState([
    { id: '1', name: 'Vocal', volume: 0.8, muted: false, solo: false },
    { id: '2', name: 'Drums', volume: 0.7, muted: false, solo: false },
  ]);
  const [guideVisible, setGuideVisible] = useState(true);
  const [guideAnimation, setGuideAnimation] = useState<'idle' | 'typing' | 'thinking'>('idle');

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
  const handleRecord = () => {
    if (recordingStatus === 'idle') {
      setRecordingStatus('recording');
    } else if (recordingStatus === 'recording') {
      setRecordingStatus('paused');
    } else {
      setRecordingStatus('idle');
    }
  };

  return (
    <>
    <div className="min-h-screen bg-wise-bg text-wise-text-primary overflow-hidden flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-wise-medium bg-wise-bg/80 backdrop-blur-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-wise-primary to-wise-primary-active rounded flex items-center justify-center font-bold text-wise-bg text-xs sm:text-sm flex-shrink-0">
              W2
            </div>
            <span className="font-bold text-sm sm:text-xl truncate">WISE² Studio</span>
          </div>
          <div className="hidden sm:block text-xs sm:text-sm text-wise-text-secondary">SoundLabs Recording Studio</div>
          <a href="/" className="text-xs sm:text-sm text-wise-text-secondary hover:text-wise-primary transition-colors flex-shrink-0">
            ← Back
          </a>
        </div>
      </header>

      {/* Studio Workspace - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-5 gap-3 sm:gap-4 p-3 sm:p-4 pb-24 lg:pb-4 overflow-hidden"
        style={{ gridTemplateRows: '1fr' }}>
        {/* Left Panel - Tracks (Mobile: full width, Tablet/Desktop: 1/5) */}
        <div className="lg:col-span-1 bg-wise-surface-secondary border border-wise-medium rounded-lg p-3 sm:p-4 overflow-y-auto max-h-[40vh] lg:max-h-none">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide truncate">Tracks</h3>
            <button
              onClick={handleAddTrack}
              className="px-2 sm:px-3 py-2 sm:py-2 text-xs bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded transition whitespace-nowrap flex-shrink-0 min-h-[44px] sm:min-h-[40px]"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="bg-wise-surface border border-wise-medium rounded p-2 sm:p-3">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="font-semibold text-xs sm:text-sm truncate flex-1">{track.name}</div>
                  <button
                    onClick={() => handleRemoveTrack(track.id)}
                    className="text-wise-accent-red hover:text-wise-accent-red/80 text-sm transition min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-wise-text-secondary block mb-1">Volume: {Math.round(track.volume * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume * 100}
                      onChange={(e) =>
                        handleTrackUpdate(track.id, { volume: parseInt(e.target.value) / 100 })
                      }
                      className="w-full h-2 sm:h-3"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleTrackUpdate(track.id, { muted: !track.muted })
                      }
                      className={`flex-1 px-2 py-2 rounded transition font-semibold text-xs min-h-[44px] ${
                        track.muted ? 'bg-wise-accent-red/50' : 'bg-wise-surface'
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() =>
                        handleTrackUpdate(track.id, { solo: !track.solo })
                      }
                      className={`flex-1 px-2 py-2 rounded transition font-semibold text-xs min-h-[44px] ${
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

        {/* Center - Timeline (Mobile: full width, Tablet/Desktop: 3/5) */}
        <div className="lg:col-span-3 bg-wise-surface-secondary border border-wise-medium rounded-lg p-3 sm:p-4 overflow-x-auto flex flex-col max-h-[50vh] lg:max-h-none">
          <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-wise-medium pb-2 sm:pb-3 gap-2">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">Timeline</h3>
            <div className="text-xs text-wise-text-muted whitespace-nowrap">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div key={track.id} className="mb-2 bg-wise-surface border border-wise-medium rounded p-2">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-wise-text-primary truncate flex-1">{track.name}</span>
                  <span className="text-xs text-wise-text-muted whitespace-nowrap">{track.muted ? 'MUTED' : 'ACTIVE'}</span>
                </div>
                <div className="relative h-10 sm:h-12 bg-wise-surface rounded border border-wise-subtle">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 sm:w-12 h-5 sm:h-6 bg-gradient-to-r from-wise-primary to-wise-primary-hover rounded opacity-30" />
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

        {/* Right Panel - Master Mixer (Mobile: full width below, Tablet/Desktop: 1/5) */}
        <div className="lg:col-span-1 bg-wise-surface-secondary border border-wise-medium rounded-lg p-3 sm:p-4 flex flex-col max-h-[45vh] lg:max-h-none overflow-y-auto lg:overflow-y-visible">
          {/* Master Mixer */}
          <div className="mb-4 sm:mb-6">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Master</h3>
            <div className="bg-wise-surface border border-wise-medium rounded p-3 sm:p-4 space-y-3">
              <div>
                <label className="text-xs text-wise-text-secondary block mb-1">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
                  className="w-full h-2 sm:h-3"
                />
                <div className="text-xs text-wise-text-muted mt-1 text-center">{Math.round(masterVolume * 100)}%</div>
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
          <div className="border-t border-wise-medium pt-3 sm:pt-4 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Transport</h3>
            <div className="space-y-2">
              <button
                onClick={handlePlayPause}
                className="w-full py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold transition flex items-center justify-center gap-2 min-h-[48px] text-sm"
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={handleStop}
                className="w-full py-3 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded font-semibold transition border border-wise-medium min-h-[48px] text-sm"
              >
                ⏹ Stop
              </button>
              <button className="w-full py-3 bg-wise-accent-red hover:opacity-90 text-wise-text-primary rounded font-semibold transition min-h-[48px] text-sm">
                ● Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Animated Guide Widget - Hidden on mobile, visible on tablet+ */}
    {guideVisible && (
      <div className="hidden md:fixed md:bottom-6 md:left-6 md:z-40">
        <div className="flex flex-col gap-3">
          <AnimatedGuide animation={guideAnimation} width={140} height={140} />
          <div className="flex gap-2 bg-wise-surface/80 backdrop-blur rounded-lg p-2 border border-wise-medium">
            <button
              onClick={() => setGuideAnimation('idle')}
              className={`px-2 py-1 text-xs rounded transition min-h-[44px] flex items-center justify-center ${
                guideAnimation === 'idle'
                  ? 'bg-wise-primary text-wise-bg'
                  : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
              }`}
              title="Idle state"
            >
              Idle
            </button>
            <button
              onClick={() => setGuideAnimation('typing')}
              className={`px-2 py-1 text-xs rounded transition min-h-[44px] flex items-center justify-center ${
                guideAnimation === 'typing'
                  ? 'bg-wise-primary text-wise-bg'
                  : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
              }`}
              title="Typing state"
            >
              Type
            </button>
            <button
              onClick={() => setGuideAnimation('thinking')}
              className={`px-2 py-1 text-xs rounded transition min-h-[44px] flex items-center justify-center ${
                guideAnimation === 'thinking'
                  ? 'bg-wise-primary text-wise-bg'
                  : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
              }`}
              title="Thinking state"
            >
              Think
            </button>
            <button
              onClick={() => setGuideVisible(false)}
              className="px-2 py-1 text-xs rounded bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary transition min-h-[44px] flex items-center justify-center"
              title="Hide guide"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    )}
    {/* Show guide button when hidden - Hidden on mobile */}
    {!guideVisible && (
      <button
        onClick={() => setGuideVisible(true)}
        className="hidden md:fixed md:bottom-6 md:left-6 md:z-40 px-3 py-2 text-sm bg-wise-primary hover:bg-wise-primary-hover text-wise-bg rounded font-semibold transition min-h-[44px]"
        title="Show guide"
      >
        Show Guide 🦊
      </button>
    )}
    {/* Support Chat Button - Adjusts position on mobile */}
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 hidden lg:block">
      <button
        type="button"
        aria-label="Open support chat"
        title="Open support chat"
        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-wise-primary/30 bg-gradient-to-br from-wise-primary to-wise-primary-active text-xl sm:text-2xl text-wise-text-primary shadow-[0_0_35px_rgba(0,148,255,0.35)] backdrop-blur-xl transition-transform hover:scale-105 min-h-[48px] min-w-[48px]"
      >
        💬
      </button>
    </div>

    {/* Bottom Navigation for Mobile */}
    <BottomNav
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      onStop={handleStop}
      onRecord={handleRecord}
      recordingStatus={recordingStatus}
    />
    </>
  );
}

export default function StudioWorkspacePage() {
  return (
    <ProtectedRoute>
      <StudioWorkspaceContent />
    </ProtectedRoute>
  );
}
