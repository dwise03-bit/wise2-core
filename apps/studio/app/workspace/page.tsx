'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProtectedRoute } from '../../components/Auth/ProtectedRoute';
import AnimatedGuide from '../../components/AnimatedGuide';
import { BottomNav } from '../../components/BottomNav';
import { Gallery } from '../../components/Gallery';
import { LiveStreamPanel } from '../../components/LiveStreamPanel';
import { DiscordChatPanel } from '../../components/DiscordChatPanel';
import { CinematicGallery } from '../../components/CinematicGallery';
import { AIMusicGenerator } from '../../components/AIMusicGenerator';
import { useAudioEngine } from '../../hooks/useAudioEngine';

type TabType = 'audio' | 'video' | 'chat' | 'gallery' | 'ai-music';

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
  const [peakLevel, setPeakLevel] = useState(-60);
  const [rmsLevel, setRmsLevel] = useState(-60);
  const [activeTab, setActiveTab] = useState<TabType>('audio');
  const [showGallery, setShowGallery] = useState(false);

  // Initialize Web Audio API
  const {
    isInitialized,
    initializeAudioContext,
    createTrack: createAudioTrack,
    setTrackVolume: setAudioTrackVolume,
    setTrackMute: setAudioTrackMute,
    startPlayback,
    stopPlayback,
    setMasterVolume: setAudioMasterVolume,
    audioLevels,
  } = useAudioEngine();

  // Initialize audio context on mount
  useEffect(() => {
    initializeAudioContext();
  }, [initializeAudioContext]);

  // Create audio tracks when tracks change
  useEffect(() => {
    if (!isInitialized) return;
    tracks.forEach((track) => {
      createAudioTrack(track.id);
    });
  }, [isInitialized, tracks, createAudioTrack]);

  // Update audio track properties
  useEffect(() => {
    tracks.forEach((track) => {
      setAudioTrackVolume(track.id, track.volume);
      setAudioTrackMute(track.id, track.muted);
    });
  }, [tracks, setAudioTrackVolume, setAudioTrackMute]);

  // Update master volume
  useEffect(() => {
    if (isInitialized) {
      setAudioMasterVolume(masterVolume);
    }
  }, [masterVolume, isInitialized, setAudioMasterVolume]);

  // Simulate level meters from audio
  useEffect(() => {
    if (isPlaying || recordingStatus === 'recording') {
      const interval = setInterval(() => {
        setPeakLevel(Math.random() * -20 - 20);
        setRmsLevel(Math.random() * -30 - 30);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isPlaying, recordingStatus]);

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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      startPlayback(tracks.map((t) => t.id));
    } else {
      stopPlayback(tracks.map((t) => t.id));
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    stopPlayback(tracks.map((t) => t.id));
  };

  const handleRecord = () => {
    if (recordingStatus === 'idle') {
      setRecordingStatus('recording');
      startPlayback(tracks.map((t) => t.id));
    } else if (recordingStatus === 'recording') {
      setRecordingStatus('paused');
      stopPlayback(tracks.map((t) => t.id));
    } else {
      setRecordingStatus('idle');
    }
  };

  return (
    <>
    <div className="min-h-screen bg-wise-bg text-wise-text-primary overflow-hidden flex flex-col">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 border-b border-wise-medium bg-wise-bg/80 backdrop-blur-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <motion.div
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-wise-primary to-wise-primary-active rounded flex items-center justify-center font-bold text-wise-bg text-xs sm:text-sm flex-shrink-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              W2
            </motion.div>
            <span className="font-bold text-sm sm:text-xl truncate">WISE² Studio</span>
          </div>
          <div className="hidden sm:block text-xs sm:text-sm text-wise-text-secondary">SoundLabs Recording Studio</div>
          <motion.a
            href="/"
            className="text-xs sm:text-sm text-wise-text-secondary hover:text-wise-primary transition-colors flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back
          </motion.a>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      {!showGallery && (
        <motion.div
          className="sticky top-16 z-40 bg-wise-surface-secondary border-b border-wise-medium flex items-center gap-1 overflow-x-auto px-3 sm:px-4 py-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {[
            { id: 'audio', label: '🎵 Audio', icon: '🎵' },
            { id: 'video', label: '📹 Video', icon: '📹' },
            { id: 'chat', label: '💬 Chat', icon: '💬' },
            { id: 'gallery', label: '🖼️ Gallery', icon: '🖼️' },
            { id: 'ai-music', label: '✨ AI Music', icon: '✨' },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition flex items-center gap-2 min-h-[44px] ${
                activeTab === tab.id
                  ? 'bg-wise-primary text-white shadow-lg'
                  : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label.split(' ')[1]}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Studio Workspace - Responsive Layout */}
      {!showGallery ? (
      <div className="flex-1 flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 pb-24 lg:pb-4 overflow-auto min-h-0"
        style={{}}>
        {/* Tab Content - Audio (Default) */}
        {activeTab === 'audio' && (
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-3 sm:gap-4 h-full overflow-auto"
          style={{ gridTemplateRows: '1fr' }}>
        {/* Left Panel - Tracks (Mobile: full width, Tablet/Desktop: 1/5) */}
        <motion.div
          className="lg:col-span-1 bg-wise-surface-secondary border border-wise-medium rounded-lg p-3 sm:p-4 overflow-y-auto max-h-[40vh] lg:max-h-none"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 gap-2">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide truncate">Tracks</h3>
            <motion.button
              onClick={handleAddTrack}
              className="px-2 sm:px-3 py-2 sm:py-2 text-xs bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded transition whitespace-nowrap flex-shrink-0 min-h-[44px] sm:min-h-[40px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Add
            </motion.button>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  className="bg-wise-surface border border-wise-medium rounded p-2 sm:p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="font-semibold text-xs sm:text-sm truncate flex-1">{track.name}</div>
                    <motion.button
                      onClick={() => handleRemoveTrack(track.id)}
                      className="text-wise-accent-red hover:text-wise-accent-red/80 text-sm transition min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
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
                        className="w-full h-2 sm:h-3 accent-wise-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() =>
                          handleTrackUpdate(track.id, { muted: !track.muted })
                        }
                        className={`flex-1 px-2 py-2 rounded transition font-semibold text-xs min-h-[44px] ${
                          track.muted ? 'bg-wise-accent-red/50 text-white' : 'bg-wise-surface text-wise-text-primary'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        M
                      </motion.button>
                      <motion.button
                        onClick={() =>
                          handleTrackUpdate(track.id, { solo: !track.solo })
                        }
                        className={`flex-1 px-2 py-2 rounded transition font-semibold text-xs min-h-[44px] ${
                          track.solo ? 'bg-wise-accent-orange/50 text-white' : 'bg-wise-surface text-wise-text-primary'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        S
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Center - Timeline (Mobile: full width, Tablet/Desktop: 3/5) */}
        <motion.div
          className="lg:col-span-3 bg-wise-surface-secondary border border-wise-medium rounded-lg p-3 sm:p-4 overflow-auto flex flex-col max-h-[50vh] lg:max-h-none"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-wise-medium pb-2 sm:pb-3 gap-2">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">Timeline</h3>
            <motion.div
              className="text-xs text-wise-text-muted whitespace-nowrap font-mono"
              key={currentTime}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            <AnimatePresence mode="popLayout">
              {tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  className="bg-wise-surface rounded-lg p-3 h-16 border border-wise-medium flex items-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex-1">
                    <div className="text-xs font-semibold mb-1">{track.name}</div>
                    <div className="flex gap-1">
                      {[...Array(16)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-wise-accent-green/50 rounded-sm"
                          style={{ height: '20px' }}
                          animate={{
                            height: isPlaying ? ['20px', `${Math.random() * 30 + 10}px`, '20px'] : '20px'
                          }}
                          transition={{ duration: Math.random() * 0.5 + 0.3, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Panel - Master Mixer (Mobile: full width below, Tablet/Desktop: 1/5) */}
        <motion.div
          className="lg:col-span-1 bg-wise-surface-secondary border border-wise-medium rounded-lg p-3 sm:p-4 flex flex-col max-h-[45vh] lg:max-h-none overflow-y-auto lg:overflow-y-visible"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
        >
          {/* Master Mixer */}
          <div className="mb-4 sm:mb-6">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Master</h3>
            <motion.div
              className="bg-wise-surface border border-wise-medium rounded p-3 sm:p-4 space-y-3"
              whileHover={{ scale: 1.02 }}
            >
              <div>
                <label className="text-xs text-wise-text-secondary block mb-1">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={(e) => setMasterVolume(parseInt(e.target.value) / 100)}
                  className="w-full h-2 sm:h-3 accent-wise-primary"
                />
                <motion.div
                  className="text-xs text-wise-text-muted mt-1 text-center font-semibold text-wise-accent-green"
                  key={masterVolume}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {Math.round(masterVolume * 100)}%
                </motion.div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <motion.div
                  className="bg-wise-card p-2 rounded"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-wise-text-muted">Peak</div>
                  <div className="text-wise-accent-green font-semibold">{peakLevel.toFixed(0)} dB</div>
                </motion.div>
                <motion.div
                  className="bg-wise-card p-2 rounded"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-wise-text-muted">RMS</div>
                  <div className="text-wise-accent-green font-semibold">{rmsLevel.toFixed(0)} dB</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Transport Controls */}
          <div className="border-t border-wise-medium pt-3 sm:pt-4 flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">Transport</h3>
            <div className="space-y-2">
              <motion.button
                onClick={handlePlayPause}
                className="w-full py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold transition flex items-center justify-center gap-2 min-h-[48px] text-sm"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 148, 255, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </motion.button>
              <motion.button
                onClick={handleStop}
                className="w-full py-3 bg-wise-surface hover:bg-wise-surface/80 text-wise-text-primary rounded font-semibold transition border border-wise-medium min-h-[48px] text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ⏹ Stop
              </motion.button>
              <motion.button
                onClick={handleRecord}
                className={`w-full py-3 font-semibold transition min-h-[48px] text-sm rounded ${
                  recordingStatus === 'recording'
                    ? 'bg-wise-accent-red text-white animate-pulse'
                    : 'bg-wise-accent-red hover:opacity-90 text-wise-text-primary'
                }`}
                whileHover={recordingStatus === 'idle' ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                animate={recordingStatus === 'recording' ? { scale: [1, 1.02, 1] } : {}}
                transition={recordingStatus === 'recording' ? { duration: 1, repeat: Infinity } : {}}
              >
                ● {recordingStatus === 'idle' ? 'Record' : recordingStatus === 'recording' ? 'Recording' : 'Resume'}
              </motion.button>
            </div>
          </div>

        </motion.div>
      </div>
        )}

        {/* Tab Content - Video Streaming */}
        {activeTab === 'video' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 overflow-auto"
          >
            <LiveStreamPanel />
          </motion.div>
        )}

        {/* Tab Content - Discord Chat */}
        {activeTab === 'chat' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 overflow-auto"
          >
            <DiscordChatPanel />
          </motion.div>
        )}

        {/* Tab Content - Cinematic Gallery */}
        {activeTab === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 overflow-hidden"
          >
            <CinematicGallery title="Project Gallery" />
          </motion.div>
        )}

        {/* Tab Content - AI Music Generation */}
        {activeTab === 'ai-music' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex-1 overflow-hidden"
          >
            <AIMusicGenerator />
          </motion.div>
        )}
      </div>
      ) : (
        <motion.div
          className="flex-1 overflow-auto p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Project Gallery</h2>
              <motion.button
                onClick={() => setShowGallery(false)}
                className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Studio
              </motion.button>
            </div>
            <Gallery />
          </div>
        </motion.div>
      )}
    </div>
    {/* Animated Guide Widget - Hidden on mobile, visible on tablet+ */}
    <AnimatePresence>
      {guideVisible && (
        <motion.div
          className="hidden md:fixed md:bottom-6 md:left-6 md:z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="flex flex-col gap-3">
            <AnimatedGuide animation={guideAnimation} width={140} height={140} />
            <motion.div
              className="flex gap-2 bg-wise-surface/80 backdrop-blur rounded-lg p-2 border border-wise-medium"
              layout
            >
              <motion.button
                onClick={() => setGuideAnimation('idle')}
                className={`px-2 py-1 text-xs rounded transition min-h-[44px] flex items-center justify-center ${
                  guideAnimation === 'idle'
                    ? 'bg-wise-primary text-wise-bg'
                    : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
                }`}
                title="Idle state"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Idle
              </motion.button>
              <motion.button
                onClick={() => setGuideAnimation('typing')}
                className={`px-2 py-1 text-xs rounded transition min-h-[44px] flex items-center justify-center ${
                  guideAnimation === 'typing'
                    ? 'bg-wise-primary text-wise-bg'
                    : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
                }`}
                title="Typing state"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Type
              </motion.button>
              <motion.button
                onClick={() => setGuideAnimation('thinking')}
                className={`px-2 py-1 text-xs rounded transition min-h-[44px] flex items-center justify-center ${
                  guideAnimation === 'thinking'
                    ? 'bg-wise-primary text-wise-bg'
                    : 'bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary'
                }`}
                title="Thinking state"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Think
              </motion.button>
              <motion.button
                onClick={() => setGuideVisible(false)}
                className="px-2 py-1 text-xs rounded bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-secondary transition min-h-[44px] flex items-center justify-center"
                title="Hide guide"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Show guide button when hidden - Hidden on mobile */}
    <AnimatePresence>
      {!guideVisible && (
        <motion.button
          onClick={() => setGuideVisible(true)}
          className="hidden md:fixed md:bottom-6 md:left-6 md:z-40 px-3 py-2 text-sm bg-wise-primary hover:bg-wise-primary-hover text-wise-bg rounded font-semibold transition min-h-[44px]"
          title="Show guide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Show Guide 🦊
        </motion.button>
      )}
    </AnimatePresence>

    {/* Support Chat Button - Adjusts position on mobile */}
    <motion.div
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 hidden lg:block"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        type="button"
        aria-label="Open support chat"
        title="Open support chat"
        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-wise-primary/30 bg-gradient-to-br from-wise-primary to-wise-primary-active text-xl sm:text-2xl text-wise-text-primary shadow-[0_0_35px_rgba(0,148,255,0.35)] backdrop-blur-xl transition-transform min-h-[48px] min-w-[48px]"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        💬
      </motion.button>
    </motion.div>

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
