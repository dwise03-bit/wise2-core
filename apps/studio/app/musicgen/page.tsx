'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Music,
  Zap,
  Clock,
  Activity,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  Loader,
  BarChart3,
  Maximize2,
  Settings,
} from 'lucide-react';
import { MusicGenerationPromptBuilder } from '@/components/MusicGeneration/PromptBuilder';
import GenerationLibrary from '@/components/MusicGeneration/GenerationLibrary';
import { VoiceCloner } from '@/components/MusicGeneration/VoiceCloner';
import { GeneratedTrack } from '@/types/aimusic';

/**
 * Music Generation Page - Main Entry Point
 * Features:
 * - Responsive layout with sidebar + tabs
 * - Real-time polling updates (every 2 seconds when generating)
 * - Auto-refresh library every 5 seconds while generating
 * - Keyboard shortcuts (Ctrl+Shift+G = focus prompt, Space = play/pause)
 * - Dark theme with WISE² design system
 * - Fully responsive (collapses sidebar on mobile)
 */

type TabType = 'queue' | 'library' | 'cloning';

interface GenerationQueueItem {
  id: string;
  track: GeneratedTrack;
  queuePosition: number;
  estimatedTime: number;
}

interface RecentGeneration {
  id: string;
  title: string;
  createdAt: Date;
  duration: number;
  status: 'complete' | 'generating' | 'queued' | 'failed';
}

export default function MusicGenerationPage() {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('library');

  // Generation state
  const [generations, setGenerations] = useState<GeneratedTrack[]>([]);
  const [generationQueue, setGenerationQueue] = useState<GenerationQueueItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Polling interval for real-time updates
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for generation status updates
  const pollGenerationStatus = useCallback(async () => {
    if (generationQueue.length === 0) return;

    try {
      const ids = generationQueue.map(item => item.id).join(',');
      const response = await fetch(`/api/musicgen/status?generationIds=${ids}`);

      if (response.ok) {
        const data = (await response.json()) as any;

        data.updates?.forEach?.((update: any) => {
          setGenerationQueue(prev =>
            prev.map(item =>
              item.id === update.id
                ? {
                    ...item,
                    track: {
                      ...item.track,
                      progress: update.progress,
                      status: update.status,
                      estimatedTime: update.estimatedTime,
                    },
                  }
                : item
            )
          );
        });
      }
    } catch (err) {
      console.error('Failed to poll generation status:', err);
    }
  }, [generationQueue.length]);

  // Setup polling on mount
  useEffect(() => {
    if (generationQueue.length > 0) {
      // Poll immediately
      pollGenerationStatus();

      // Then poll every 2 seconds
      pollIntervalRef.current = setInterval(() => {
        pollGenerationStatus();
      }, 2000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [generationQueue.length, pollGenerationStatus]);

  // Auto-refresh library every 5s while generating
  useEffect(() => {
    if (isGenerating) {
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchGenerations();
      }, 5000);
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [isGenerating]);

  // Fetch generations from API
  const fetchGenerations = useCallback(async () => {
    try {
      const response = await fetch('/api/musicgen/generations?limit=20');
      if (response.ok) {
        const data = (await response.json()) as any;
        setGenerations(data.tracks);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to fetch generations:', err);
    }
  }, []);

  // Load more generations
  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/musicgen/generations?limit=20&offset=${generations.length}`
      );
      if (response.ok) {
        const data = (await response.json()) as any;
        setGenerations(prev => [...prev, ...data.tracks]);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error('Failed to load more generations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [generations.length]);

  // Playback handlers
  const handlePlayGeneration = useCallback((track: GeneratedTrack) => {
    if (track.url) {
      setPlayingTrackId(track.id);
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch(err => {
          console.error('Failed to play audio:', err);
          setPlayingTrackId(null);
        });
      }
    }
  }, []);

  const handleDeleteGeneration = useCallback((trackId: string) => {
    setGenerations(prev => prev.filter(t => t.id !== trackId));
  }, []);

  const handleToggleFavorite = useCallback((trackId: string) => {
    setGenerations(prev =>
      prev.map(t =>
        t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t
      )
    );
  }, []);

  const handleRemixGeneration = useCallback((trackId: string) => {
    const track = generations.find(t => t.id === trackId);
    if (track) {
      // TODO: Open remix modal or navigate to generation with pre-filled params
      console.log('Remix:', track);
    }
  }, [generations]);

  const handleExportGeneration = useCallback(
    (trackId: string, format: 'mp3' | 'wav' | 'flac' | 'opus' | 'ogg') => {
      const track = generations.find(t => t.id === trackId);
      if (track && track.url) {
        const link = document.createElement('a');
        link.href = track.url;
        link.download = `${track.title || `generation-${track.id}`}.${format}`;
        link.click();
      }
    },
    [generations]
  );

  const handleAddToSoundLab = useCallback((trackId: string) => {
    // TODO: Implement SoundLab integration
    console.log('Add to SoundLab:', trackId);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+G: Focus prompt builder
      if (e.ctrlKey && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setActiveTab('library');
        const promptInput = document.querySelector('textarea[placeholder*="Describe"]') as HTMLTextAreaElement;
        if (promptInput) {
          promptInput.focus();
        }
      }

      // Space: Play/pause preview (if audio is focused)
      if (e.code === 'Space' && document.activeElement === audioRef.current) {
        e.preventDefault();
        if (audioRef.current) {
          if (audioRef.current.paused) {
            audioRef.current.play();
          } else {
            audioRef.current.pause();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  // Calculate queue stats
  const queueStats = useMemo(() => {
    const totalTime = generationQueue.reduce((sum, item) => sum + (item.estimatedTime || 0), 0);
    return {
      count: generationQueue.length,
      totalTime,
      firstEstimate: generationQueue[0]?.estimatedTime || 0,
    };
  }, [generationQueue]);

  return (
    <div className="min-h-screen bg-studio-bg text-wise-text-primary flex flex-col">
      {/* Navigation Breadcrumb */}
      <nav className="h-14 bg-studio-panel/50 border-b border-studio-line flex items-center px-6 gap-2 text-sm">
        <a href="/" className="flex items-center gap-2 text-wise-text-secondary hover:text-wise-accent transition">
          <Home className="w-4 h-4" />
          Home
        </a>
        <ChevronRight className="w-4 h-4 text-studio-line" />
        <span className="text-wise-text-primary font-semibold flex items-center gap-2">
          <Music className="w-4 h-4" />
          Music Generation
        </span>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? '80px' : '25%' }}
          className="border-r border-studio-line bg-studio-panel/30 overflow-y-auto flex flex-col transition-all duration-300"
        >
          <div className="p-4 space-y-6 flex-1">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full h-10 rounded-lg bg-studio-raised border border-studio-line hover:border-wise-accent transition flex items-center justify-center text-wise-text-secondary"
            >
              {sidebarCollapsed ? '→' : '← Collapse'}
            </button>

            {!sidebarCollapsed && (
              <>
                {/* Prompt Builder */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase text-wise-accent">Quick Builder</h3>
                  <div className="bg-studio-raised border border-studio-line rounded-lg p-4 space-y-3">
                    <textarea
                      placeholder="Describe your track..."
                      className="w-full h-20 bg-studio-input border border-studio-line rounded px-3 py-2 text-xs text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:ring-2 focus:ring-wise-accent transition resize-none"
                    />
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-wise-accent text-black text-xs font-semibold rounded hover:shadow-lg hover:shadow-wise-accent/30 transition">
                        <Zap className="w-3 h-3 inline mr-1" />
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Queue Status */}
                {generationQueue.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase text-wise-accent">Queue</h3>
                    <div className="bg-studio-raised border border-studio-line rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-wise-text-secondary">Items:</span>
                        <span className="text-sm font-bold text-wise-accent">{queueStats.count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-wise-text-secondary">Est. Time:</span>
                        <span className="text-sm font-bold text-wise-accent">
                          ~{Math.ceil(queueStats.totalTime / 60)}m
                        </span>
                      </div>
                      <div className="h-1 bg-studio-input rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent"
                          animate={{ width: `${Math.min((queueStats.count / 10) * 100, 100)}%` }}
                          transition={{ type: 'spring', stiffness: 100 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Generations */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase text-wise-accent">Recent</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {recentGenerations.length === 0 ? (
                      <p className="text-xs text-wise-text-muted">No generations yet</p>
                    ) : (
                      recentGenerations.map(gen => (
                        <motion.div
                          key={gen.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-2 bg-studio-raised border border-studio-line rounded hover:border-wise-accent transition cursor-pointer"
                        >
                          <p className="text-xs font-semibold text-wise-text-primary truncate">
                            {gen.title}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-wise-text-muted">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {gen.duration}s
                            </span>
                            <span className={`text-xs font-semibold ${
                              gen.status === 'complete' ? 'text-wise-accent-green' :
                              gen.status === 'generating' ? 'text-yellow-500' :
                              'text-wise-text-muted'
                            }`}>
                              {gen.status === 'complete' ? '✓' : '⏳'}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-studio-line p-4 space-y-2">
            <button className="w-full h-10 rounded-lg bg-studio-raised border border-studio-line hover:border-wise-accent transition text-xs font-semibold text-wise-text-secondary flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              {!sidebarCollapsed && 'Settings'}
            </button>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-10 bg-red-900/20 border-b border-red-900/50 flex items-center px-6 gap-3 text-sm text-red-400"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-xs hover:text-red-300 transition"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation */}
          <div className="h-12 border-b border-studio-line bg-studio-panel/50 flex items-center px-6 gap-1">
            {[
              { id: 'library' as TabType, label: '📚 My Library', icon: Music },
              { id: 'queue' as TabType, label: '⏳ Generation Queue', icon: Clock },
              { id: 'cloning' as TabType, label: '🎤 Voice Cloning', icon: Activity },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 h-full text-sm font-semibold transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-wise-accent border-wise-accent'
                    : 'text-wise-text-secondary border-transparent hover:text-wise-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'library' && (
                <motion.div
                  key="library"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full"
                >
                  <GenerationLibrary
                    generations={generations}
                    onPlayGeneration={handlePlayGeneration}
                    onDeleteGeneration={handleDeleteGeneration}
                    onToggleFavorite={handleToggleFavorite}
                    onRemixGeneration={handleRemixGeneration}
                    onExportGeneration={handleExportGeneration}
                    onAddToSoundLab={handleAddToSoundLab}
                    isLoading={isLoading}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                  />
                </motion.div>
              )}

              {activeTab === 'queue' && (
                <motion.div
                  key="queue"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full overflow-y-auto p-6"
                >
                  <div className="max-w-4xl">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                          <Clock className="w-6 h-6 text-wise-accent" />
                          Generation Queue
                        </h2>
                        <p className="text-wise-text-secondary text-sm">
                          {generationQueue.length} track{generationQueue.length !== 1 ? 's' : ''} in queue
                        </p>
                      </div>

                      {generationQueue.length === 0 ? (
                        <div className="text-center py-12">
                          <Loader className="w-12 h-12 text-studio-line mx-auto mb-4 opacity-50" />
                          <p className="text-wise-text-muted">No tracks currently generating</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {generationQueue.map((item, idx) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="p-4 bg-studio-raised border border-studio-line rounded-lg space-y-3"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-wise-text-primary">
                                    #{idx + 1} - {item.track.title || item.track.prompt.substring(0, 50)}
                                  </p>
                                  <p className="text-xs text-wise-text-muted mt-1">
                                    {item.track.genre} • {item.track.mood}
                                  </p>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                  item.track.status === 'generating'
                                    ? 'bg-yellow-900/30 text-yellow-300'
                                    : 'bg-blue-900/30 text-blue-300'
                                }`}>
                                  {item.track.status === 'generating' ? 'Generating' : 'Queued'}
                                </span>
                              </div>

                              {/* Progress Bar */}
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-wise-text-muted">Progress</span>
                                  <span className="text-sm font-bold text-wise-accent">{item.track.progress}%</span>
                                </div>
                                <div className="h-2 bg-studio-input rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-wise-accent-dim to-wise-accent"
                                    animate={{ width: `${item.track.progress}%` }}
                                    transition={{ type: 'tween', duration: 0.5 }}
                                  />
                                </div>
                              </div>

                              {/* ETA */}
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-wise-text-muted">Est. time remaining:</span>
                                <span className="font-semibold text-wise-accent">
                                  ~{Math.max(0, Math.ceil((item.estimatedTime * (100 - item.track.progress)) / 100))}s
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cloning' && (
                <motion.div
                  key="cloning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full w-full overflow-y-auto"
                >
                  <VoiceCloner />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Hidden Audio Element for Playback */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingTrackId(null)}
        onPlay={() => {
          // Audio is playing
        }}
        onPause={() => {
          // Audio is paused
        }}
      />

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 bg-studio-raised border border-studio-line rounded-lg p-3 text-xs text-wise-text-muted space-y-1 max-w-48">
        <p className="font-semibold text-wise-text-secondary">⌨️ Shortcuts</p>
        <p>
          <kbd className="px-2 py-1 bg-studio-input rounded text-xs">Ctrl+Shift+G</kbd> Focus prompt
        </p>
        <p>
          <kbd className="px-2 py-1 bg-studio-input rounded text-xs">Space</kbd> Play/Pause
        </p>
      </div>
    </div>
  );
}
