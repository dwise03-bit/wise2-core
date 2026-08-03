'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Eye,
  EyeOff,
  Play,
  Square,
  Pause,
  AlertCircle,
  ChevronDown,
  Users,
  Clock,
  Zap,
  Settings,
  LogIn,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type Platform = 'twitch' | 'youtube' | 'facebook' | 'custom';
type Resolution = '480p' | '720p' | '1080p' | '1440p' | '2160p';
type FPS = 24 | 30 | 48 | 50 | 60;
type Encoder = 'x264' | 'nvenc' | 'amd' | 'intel';
type StreamStatus = 'idle' | 'connecting' | 'live' | 'paused' | 'reconnecting' | 'error';

interface StreamConfig {
  platform: Platform;
  resolution: Resolution;
  fps: FPS;
  bitrate: number;
  encoder: Encoder;
  streamKey: string;
  encoderPreset?: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower';
  keyframeInterval?: number;
  bFrames?: number;
  profile?: 'baseline' | 'main' | 'high';
  level?: string;
}

interface StreamStats {
  viewers?: number;
  uptime?: number; // seconds
  currentBitrate?: number; // kbps
}

interface StreamControlProps {
  isStreaming?: boolean;
  onStartStream?: (config: StreamConfig) => void | Promise<void>;
  onStopStream?: () => void | Promise<void>;
  onPauseStream?: () => void | Promise<void>;
  onTestStream?: (config: StreamConfig) => void | Promise<void>;
  onAuthPlatform?: (platform: Platform) => void | Promise<void>;
  stats?: StreamStats;
  platformAuth?: Partial<Record<Platform, { authenticated: boolean; username?: string }>>;
}

// ============================================================================
// Bitrate Presets by Resolution & FPS
// ============================================================================

const bitratePresets: Record<Resolution, Record<FPS, { auto: number; min: number; max: number }>> = {
  '480p': {
    24: { auto: 800, min: 500, max: 1500 },
    30: { auto: 1000, min: 500, max: 1500 },
    48: { auto: 1200, min: 800, max: 2000 },
    50: { auto: 1300, min: 800, max: 2200 },
    60: { auto: 1500, min: 1000, max: 2500 },
  },
  '720p': {
    24: { auto: 2000, min: 1500, max: 4000 },
    30: { auto: 2500, min: 1500, max: 5000 },
    48: { auto: 3000, min: 2000, max: 6000 },
    50: { auto: 3200, min: 2000, max: 6500 },
    60: { auto: 5000, min: 3000, max: 8000 },
  },
  '1080p': {
    24: { auto: 4000, min: 3000, max: 8000 },
    30: { auto: 6000, min: 4000, max: 10000 },
    48: { auto: 7000, min: 5000, max: 12000 },
    50: { auto: 7500, min: 5000, max: 13000 },
    60: { auto: 12000, min: 8000, max: 20000 },
  },
  '1440p': {
    24: { auto: 6000, min: 5000, max: 12000 },
    30: { auto: 10000, min: 7000, max: 15000 },
    48: { auto: 12000, min: 9000, max: 18000 },
    50: { auto: 13000, min: 10000, max: 20000 },
    60: { auto: 18000, min: 13000, max: 30000 },
  },
  '2160p': {
    24: { auto: 12000, min: 10000, max: 25000 },
    30: { auto: 20000, min: 15000, max: 35000 },
    48: { auto: 24000, min: 18000, max: 40000 },
    50: { auto: 25000, min: 20000, max: 45000 },
    60: { auto: 35000, min: 25000, max: 51000 },
  },
};

// ============================================================================
// StreamControl Component
// ============================================================================

export function StreamControl({
  isStreaming = false,
  onStartStream,
  onStopStream,
  onPauseStream,
  onTestStream,
  onAuthPlatform,
  stats,
  platformAuth,
}: StreamControlProps) {
  // ----
  // State
  // ----

  // Platform & Auth
  const [platform, setPlatform] = useState<Platform>('twitch');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Stream Config
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [fps, setFps] = useState<FPS>(60);
  const [bitrate, setBitrate] = useState<number | 'auto'>('auto');
  const [customBitrate, setCustomBitrate] = useState(12000);
  const [encoder, setEncoder] = useState<Encoder>('x264');

  // Stream Key
  const [streamKey, setStreamKey] = useState('');
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Advanced Encoder Settings
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [encoderPreset, setEncoderPreset] = useState<'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower'>('fast');
  const [keyframeInterval, setKeyframeInterval] = useState(2);
  const [bFrames, setBFrames] = useState(3);
  const [profile, setProfile] = useState<'baseline' | 'main' | 'high'>('main');
  const [level, setLevel] = useState('auto');

  // Stream Status
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [testingStream, setTestingStream] = useState(false);
  const [streamStartTime, setStreamStartTime] = useState<number | null>(null);

  // ----
  // Computed
  // ----

  const isAuthenticated = platformAuth?.[platform]?.authenticated ?? false;
  const platformUsername = platformAuth?.[platform]?.username;

  const bitratePreset = bitratePresets[resolution][fps];
  const effectiveBitrate = bitrate === 'auto' ? bitratePreset.auto : customBitrate;

  // ----
  // Effects
  // ----

  // Track uptime
  useEffect(() => {
    if (!isStreaming || streamStatus !== 'live') return;

    const timer = setInterval(() => {
      setStreamStartTime((t) => (t ? t + 1 : 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isStreaming, streamStatus]);

  // ----
  // Handlers
  // ----

  const handleAuth = async () => {
    setIsAuthenticating(true);
    try {
      await onAuthPlatform?.(platform);
    } catch (err) {
      setConnectionError(`Failed to authenticate with ${platform}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleTestStream = async () => {
    if (!streamKey.trim()) {
      setConnectionError('Stream key is required');
      return;
    }

    setTestingStream(true);
    setConnectionError(null);

    try {
      const config = buildConfig();
      await onTestStream?.(config);
      setConnectionError(null);
    } catch (err) {
      setConnectionError('Test stream failed. Check your stream key and connection.');
    } finally {
      setTestingStream(false);
    }
  };

  const handleStartStream = async () => {
    if (!streamKey.trim()) {
      setConnectionError('Stream key is required');
      return;
    }

    setStreamStatus('connecting');
    setConnectionError(null);
    setStreamStartTime(0);

    try {
      const config = buildConfig();
      await onStartStream?.(config);
      setStreamStatus('live');
    } catch (err) {
      setStreamStatus('error');
      setConnectionError('Failed to start stream. Check your stream key.');
    }
  };

  const handleStopStream = async () => {
    setStreamStatus('idle');
    setStreamStartTime(null);
    try {
      await onStopStream?.();
    } catch (err) {
      setConnectionError('Failed to stop stream');
    }
  };

  const handlePauseStream = async () => {
    setStreamStatus('paused');
    try {
      await onPauseStream?.();
    } catch (err) {
      setStreamStatus('live');
      setConnectionError('Failed to pause stream');
    }
  };

  const handleResetStreamKey = () => {
    setStreamKey('');
    setShowResetConfirm(false);
  };

  const copyStreamKey = () => {
    if (streamKey) {
      navigator.clipboard.writeText(streamKey);
    }
  };

  const buildConfig = (): StreamConfig => ({
    platform,
    resolution,
    fps,
    bitrate: effectiveBitrate,
    encoder,
    streamKey,
    encoderPreset,
    keyframeInterval,
    bFrames,
    profile,
    level: level === 'auto' ? undefined : level,
  });

  // ----
  // Render
  // ----

  return (
    <div className="flex flex-col gap-6 bg-gradient-to-b from-studio-bg to-studio-panel rounded-lg border border-studio-line p-6">
      {/* ================================================================== */}
      {/* HEADER: Status Display */}
      {/* ================================================================== */}

      <div className="flex items-start justify-between gap-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {streamStatus === 'idle' && (
            <div className="px-3 py-1.5 bg-studio-meter-off border border-studio-line rounded-full text-xs font-bold text-studio-line flex items-center gap-2">
              <span className="w-2 h-2 bg-wise-text-muted rounded-full"></span>
              Idle
            </div>
          )}
          {streamStatus === 'connecting' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-3 py-1.5 bg-yellow-900/30 border border-yellow-700 rounded-full text-xs font-bold text-yellow-400 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              Connecting...
            </motion.div>
          )}
          {streamStatus === 'live' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="px-3 py-1.5 bg-red-900/30 border border-red-700 rounded-full text-xs font-bold text-red-400 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              🔴 LIVE
            </motion.div>
          )}
          {streamStatus === 'paused' && (
            <div className="px-3 py-1.5 bg-orange-900/30 border border-orange-700 rounded-full text-xs font-bold text-orange-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Paused
            </div>
          )}
          {streamStatus === 'reconnecting' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="px-3 py-1.5 bg-blue-900/30 border border-blue-700 rounded-full text-xs font-bold text-blue-400 flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Reconnecting...
            </motion.div>
          )}
          {streamStatus === 'error' && (
            <div className="px-3 py-1.5 bg-red-900/30 border border-red-700 rounded-full text-xs font-bold text-red-400 flex items-center gap-2">
              <AlertCircle size={14} />
              Error
            </div>
          )}
        </div>

        {/* Stats */}
        {isStreaming && (
          <div className="flex items-center gap-4 text-xs text-wise-text-secondary">
            {stats?.viewers !== undefined && (
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-wise-accent" />
                <span className="font-mono">{stats.viewers.toLocaleString()} viewers</span>
              </div>
            )}
            {streamStartTime !== null && (
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-wise-accent" />
                <span className="font-mono">{formatUptime(streamStartTime)}</span>
              </div>
            )}
            {stats?.currentBitrate !== undefined && (
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-wise-accent" />
                <span className="font-mono">{stats.currentBitrate} kbps</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* PLATFORM SELECTION & AUTH */}
      {/* ================================================================== */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-wise-text-muted block mb-3 uppercase tracking-wider">
          Streaming Platform
        </label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {(['twitch', 'youtube', 'facebook', 'custom'] as const).map((p) => (
            <motion.button
              key={p}
              onClick={() => setPlatform(p)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isStreaming}
              className={`py-2.5 px-3 rounded text-xs font-semibold transition ${
                platform === p
                  ? 'bg-wise-primary text-white border border-wise-primary-hover'
                  : 'bg-studio-raised text-wise-text-secondary border border-studio-line hover:bg-studio-input'
              } ${isStreaming ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Platform Auth Status */}
        {!isAuthenticated && (
          <motion.button
            onClick={handleAuth}
            disabled={isAuthenticating || isStreaming}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 px-3 rounded text-xs font-semibold bg-wise-primary/10 border border-wise-primary text-wise-primary hover:bg-wise-primary/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={14} />
            Authorize with {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </motion.button>
        )}

        {isAuthenticated && platformUsername && (
          <div className="px-3 py-2 rounded bg-studio-raised border border-studio-line text-xs text-wise-text-secondary">
            <span className="text-wise-accent font-semibold">{platformUsername}</span>
            {' '} authenticated
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* STREAM KEY MANAGEMENT */}
      {/* ================================================================== */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
          Stream Key
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showStreamKey ? 'text' : 'password'}
              value={streamKey}
              onChange={(e) => setStreamKey(e.target.value)}
              disabled={isStreaming}
              placeholder="Enter your stream key..."
              className="w-full px-3 py-2.5 bg-studio-input border border-studio-line rounded text-wise-text-primary text-sm focus:border-wise-primary focus:outline-none focus:ring-1 focus:ring-wise-primary/30 transition disabled:opacity-50"
            />
            <button
              onClick={() => setShowStreamKey(!showStreamKey)}
              disabled={!streamKey}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-wise-text-muted hover:text-wise-primary transition disabled:opacity-50"
            >
              {showStreamKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <motion.button
            onClick={copyStreamKey}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!streamKey}
            title="Copy to clipboard"
            className="px-3 py-2.5 bg-studio-raised hover:bg-studio-input border border-studio-line rounded text-wise-text-secondary hover:text-wise-primary transition disabled:opacity-50"
          >
            <Copy size={16} />
          </motion.button>
          <motion.button
            onClick={() => setShowResetConfirm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!streamKey || isStreaming}
            title="Reset stream key"
            className="px-3 py-2.5 bg-studio-raised hover:bg-red-900/20 border border-studio-line hover:border-red-700 rounded text-wise-text-secondary hover:text-red-400 transition disabled:opacity-50"
          >
            ✕
          </motion.button>
        </div>

        {/* Reset Confirmation */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-900/20 border border-red-700 rounded p-3 flex gap-3 items-center"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-300 flex-1">Clear stream key?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-1 text-xs rounded bg-studio-raised border border-studio-line text-wise-text-secondary hover:bg-studio-input"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetStreamKey}
                  className="px-2 py-1 text-xs rounded bg-red-900/30 border border-red-700 text-red-300 hover:bg-red-900/50"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================== */}
      {/* RESOLUTION & FPS */}
      {/* ================================================================== */}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
            Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            disabled={isStreaming}
            className="w-full px-3 py-2.5 bg-studio-input border border-studio-line rounded text-wise-text-primary text-sm focus:border-wise-primary focus:outline-none focus:ring-1 focus:ring-wise-primary/30 transition disabled:opacity-50"
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="1440p">1440p</option>
            <option value="2160p">2160p (4K)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
            FPS
          </label>
          <select
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value) as FPS)}
            disabled={isStreaming}
            className="w-full px-3 py-2.5 bg-studio-input border border-studio-line rounded text-wise-text-primary text-sm focus:border-wise-primary focus:outline-none focus:ring-1 focus:ring-wise-primary/30 transition disabled:opacity-50"
          >
            <option value={24}>24 FPS</option>
            <option value={30}>30 FPS</option>
            <option value={48}>48 FPS</option>
            <option value={50}>50 FPS</option>
            <option value={60}>60 FPS</option>
          </select>
        </div>
      </div>

      {/* Quality Preview */}
      <div className="px-3 py-2 rounded bg-studio-raised border border-studio-line text-xs text-wise-text-secondary font-mono">
        {resolution} @ {fps}fps = {bitratePreset.auto} kbps (recommended)
      </div>

      {/* ================================================================== */}
      {/* BITRATE CONTROL */}
      {/* ================================================================== */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
          Bitrate Control
        </label>
        <div className="flex gap-2">
          <motion.button
            onClick={() => setBitrate('auto')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isStreaming}
            className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition ${
              bitrate === 'auto'
                ? 'bg-wise-primary text-white border border-wise-primary-hover'
                : 'bg-studio-raised text-wise-text-secondary border border-studio-line hover:bg-studio-input'
            } ${isStreaming ? 'cursor-not-allowed' : ''}`}
          >
            Auto
          </motion.button>
          <motion.button
            onClick={() => setBitrate(customBitrate)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isStreaming}
            className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition ${
              bitrate !== 'auto'
                ? 'bg-wise-primary text-white border border-wise-primary-hover'
                : 'bg-studio-raised text-wise-text-secondary border border-studio-line hover:bg-studio-input'
            } ${isStreaming ? 'cursor-not-allowed' : ''}`}
          >
            Custom
          </motion.button>
        </div>

        {/* Custom Bitrate Slider */}
        <AnimatePresence>
          {bitrate !== 'auto' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min="500"
                  max="51000"
                  step="100"
                  value={customBitrate}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setCustomBitrate(val);
                    setBitrate(val);
                  }}
                  disabled={isStreaming}
                  className="flex-1 h-2 bg-studio-raised border border-studio-line rounded cursor-pointer accent-wise-primary disabled:opacity-50"
                />
                <div className="text-xs font-mono bg-studio-input px-3 py-2 rounded border border-studio-line text-wise-accent min-w-24 text-center">
                  {customBitrate.toLocaleString()} kbps
                </div>
              </div>
              <div className="text-xs text-wise-text-muted">
                Range: {bitratePreset.min} - {bitratePreset.max} kbps (recommended)
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================== */}
      {/* ENCODER SELECTION */}
      {/* ================================================================== */}

      <div className="space-y-2">
        <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
          Encoder
        </label>
        <select
          value={encoder}
          onChange={(e) => setEncoder(e.target.value as Encoder)}
          disabled={isStreaming}
          className="w-full px-3 py-2.5 bg-studio-input border border-studio-line rounded text-wise-text-primary text-sm focus:border-wise-primary focus:outline-none focus:ring-1 focus:ring-wise-primary/30 transition disabled:opacity-50"
        >
          <option value="x264">x264 (Software)</option>
          <option value="nvenc">NVIDIA NVENC (GPU)</option>
          <option value="amd">AMD VCE (GPU)</option>
          <option value="intel">Intel QSV (GPU)</option>
        </select>
      </div>

      {/* ================================================================== */}
      {/* ADVANCED ENCODER SETTINGS */}
      {/* ================================================================== */}

      <div className="border-t border-studio-line pt-4">
        <motion.button
          onClick={() => setShowAdvanced(!showAdvanced)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-xs font-bold text-wise-text-muted uppercase tracking-wider hover:text-wise-primary transition"
        >
          <Settings size={14} />
          Advanced Encoder Settings
          <motion.div
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 space-y-4 pt-4 border-t border-studio-line"
            >
              {/* Encoder Preset */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-wise-text-muted uppercase tracking-wider">
                    Encoder Preset
                  </label>
                  <span className="text-xs text-wise-accent font-semibold">{encoderPreset}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={['ultrafast', 'superfast', 'veryfast', 'faster', 'fast', 'medium', 'slow', 'slower'].indexOf(encoderPreset)}
                  onChange={(e) => {
                    const presets: ('ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower')[] = [
                      'ultrafast',
                      'superfast',
                      'veryfast',
                      'faster',
                      'fast',
                      'medium',
                      'slow',
                      'slower',
                    ];
                    setEncoderPreset(presets[parseInt(e.target.value)]);
                  }}
                  disabled={isStreaming}
                  className="w-full h-2 bg-studio-raised border border-studio-line rounded cursor-pointer accent-wise-primary disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-wise-text-muted">
                  <span>Faster</span>
                  <span>Better Quality</span>
                </div>
              </div>

              {/* Keyframe Interval */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-wise-text-muted uppercase tracking-wider">
                    Keyframe Interval
                  </label>
                  <span className="text-xs text-wise-accent font-mono">
                    {keyframeInterval === 0 ? 'Auto' : `${keyframeInterval}s`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={keyframeInterval}
                  onChange={(e) => setKeyframeInterval(parseInt(e.target.value))}
                  disabled={isStreaming}
                  className="w-full h-2 bg-studio-raised border border-studio-line rounded cursor-pointer accent-wise-primary disabled:opacity-50"
                />
              </div>

              {/* B-Frames */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-wise-text-muted uppercase tracking-wider">
                    B-Frames
                  </label>
                  <span className="text-xs text-wise-accent font-mono">{bFrames}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={bFrames}
                  onChange={(e) => setBFrames(parseInt(e.target.value))}
                  disabled={isStreaming}
                  className="w-full h-2 bg-studio-raised border border-studio-line rounded cursor-pointer accent-wise-primary disabled:opacity-50"
                />
              </div>

              {/* Profile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
                  Profile
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['baseline', 'main', 'high'] as const).map((p) => (
                    <motion.button
                      key={p}
                      onClick={() => setProfile(p)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isStreaming}
                      className={`py-2 px-3 rounded text-xs font-semibold transition ${
                        profile === p
                          ? 'bg-wise-primary text-white border border-wise-primary-hover'
                          : 'bg-studio-raised text-wise-text-secondary border border-studio-line hover:bg-studio-input'
                      } ${isStreaming ? 'cursor-not-allowed' : ''}`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-wise-text-muted block uppercase tracking-wider">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isStreaming}
                  className="w-full px-3 py-2.5 bg-studio-input border border-studio-line rounded text-wise-text-primary text-sm focus:border-wise-primary focus:outline-none focus:ring-1 focus:ring-wise-primary/30 transition disabled:opacity-50"
                >
                  <option value="auto">Auto</option>
                  <option value="3.0">H.264 Level 3.0</option>
                  <option value="3.1">H.264 Level 3.1</option>
                  <option value="4.0">H.264 Level 4.0</option>
                  <option value="4.1">H.264 Level 4.1</option>
                  <option value="4.2">H.264 Level 4.2</option>
                  <option value="5.0">H.264 Level 5.0</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================== */}
      {/* ERROR MESSAGE */}
      {/* ================================================================== */}

      <AnimatePresence>
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-900/30 border border-red-700 rounded p-3 flex gap-3 items-start"
          >
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-300">{connectionError}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* STREAMING CONTROLS */}
      {/* ================================================================== */}

      <div className="flex flex-col gap-3 pt-4 border-t border-studio-line">
        {!isStreaming ? (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={handleTestStream}
              disabled={!streamKey.trim() || testingStream}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-3 bg-studio-raised hover:bg-studio-input border border-studio-line rounded text-wise-text-secondary hover:text-wise-primary text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {testingStream ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <Play size={14} />
                  </motion.div>
                  Testing...
                </>
              ) : (
                <>
                  <Play size={14} />
                  Test Stream
                </>
              )}
            </motion.button>
            <motion.button
              onClick={handleStartStream}
              disabled={!streamKey.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-3 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={16} />
              START STREAM
            </motion.button>
          </div>
        ) : (
          <>
            {streamStatus === 'live' && (
              <motion.button
                onClick={handlePauseStream}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-3 px-3 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm font-bold transition flex items-center justify-center gap-2"
              >
                <Pause size={16} />
                PAUSE STREAM (Max 30s)
              </motion.button>
            )}
            <motion.button
              onClick={handleStopStream}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-3 bg-red-700 hover:bg-red-800 rounded text-white text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <Square size={16} />
              STOP STREAM
            </motion.button>
          </>
        )}
      </div>

      {/* ================================================================== */}
      {/* SUMMARY PANEL */}
      {/* ================================================================== */}

      <div className="bg-studio-raised border border-studio-line rounded p-4 space-y-2 text-xs">
        <div className="font-mono text-wise-text-secondary">
          <span className="text-wise-accent">{resolution}</span>
          {' '}@ <span className="text-wise-accent">{fps}fps</span>
          {' '}&bull; <span className="text-wise-accent">{effectiveBitrate.toLocaleString()} kbps</span>
        </div>
        <div className="text-wise-text-muted">
          {encoder === 'x264' && 'x264 Software Encoding • Good for CPU budgets'}
          {encoder === 'nvenc' && 'NVIDIA NVENC • Best for NVIDIA GPUs'}
          {encoder === 'amd' && 'AMD VCE • Best for AMD GPUs'}
          {encoder === 'intel' && 'Intel QSV • Best for Intel Arc/iGPU'}
        </div>
        <div className="text-wise-text-muted">
          Profile: <span className="text-wise-accent">{profile}</span>
          {' '}&bull; Preset: <span className="text-wise-accent">{encoderPreset}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
