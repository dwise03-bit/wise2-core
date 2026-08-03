'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AlertCircle, Settings, Eye, Zap } from 'lucide-react';
import type {
  StreamingPlatform,
  Resolution,
  FPS,
  Encoder,
  Preset,
  BitrateSettings,
} from './streamingTypes';
import {
  PLATFORM_CONFIGS,
  RESOLUTION_PRESETS,
  FPS_OPTIONS,
  BITRATE_PRESETS,
  ENCODER_PRESETS,
  PRESET_DESCRIPTIONS,
  ENCODER_OPTIONS,
  DEFAULT_STREAM_SETTINGS,
  UI_CONSTANTS,
} from './streamingConstants';

interface StreamingControlProps {
  onStreamStart?: () => void;
  onStreamStop?: () => void;
  onSettingsChange?: (settings: any) => void;
  isLive?: boolean;
  isPaused?: boolean;
  lastError?: string;
}

export default function StreamingControl({
  onStreamStart,
  onStreamStop,
  onSettingsChange,
  isLive = false,
  isPaused = false,
  lastError,
}: StreamingControlProps) {
  const [platform, setPlatform] = useState<StreamingPlatform>('twitch');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [fps, setFps] = useState<FPS>(30);
  const [bitrateMode, setBitrateMode] = useState<'auto' | 'custom'>('auto');
  const [customBitrate, setCustomBitrate] = useState<BitrateSettings>(
    BITRATE_PRESETS['720p']
  );
  const [encoder, setEncoder] = useState<Encoder>('x264');
  const [preset, setPreset] = useState<Preset>('veryfast');
  const [streamKey, setStreamKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [keyframeInterval, setKeyframeInterval] = useState(2);
  const [bFrames, setBFrames] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate recommended bitrate based on resolution
  const getRecommendedBitrate = useCallback((res: Resolution) => {
    return BITRATE_PRESETS[res];
  }, []);

  // Update bitrate when resolution changes
  useEffect(() => {
    const recommended = getRecommendedBitrate(resolution);
    setCustomBitrate({
      mode: bitrateMode,
      min: recommended.min,
      max: recommended.max,
      current: recommended.recommended,
    });
  }, [resolution, bitrateMode, getRecommendedBitrate]);

  const handleStreamStart = useCallback(async () => {
    setIsLoading(true);
    try {
      // Validate stream key
      if (!streamKey.trim()) {
        console.error('Stream key is required');
        return;
      }

      const config = PLATFORM_CONFIGS[platform];
      if (config.streamKeyPattern && !config.streamKeyPattern.test(streamKey)) {
        console.error('Invalid stream key format');
        return;
      }

      // Notify parent
      onStreamStart?.();
    } catch (error) {
      console.error('Failed to start stream:', error);
    } finally {
      setIsLoading(false);
    }
  }, [platform, streamKey, onStreamStart]);

  const handleStreamStop = useCallback(() => {
    setIsLoading(true);
    try {
      onStreamStop?.();
    } finally {
      setIsLoading(false);
    }
  }, [onStreamStop]);

  const handlePlatformChange = (newPlatform: StreamingPlatform) => {
    setPlatform(newPlatform);
    setStreamKey('');
  };

  const toggleShowStreamKey = useCallback(() => {
    // Implementation for toggling visibility
  }, []);

  const copyStreamKey = useCallback(() => {
    navigator.clipboard.writeText(streamKey);
  }, [streamKey]);

  const handleTestStream = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate stream test
      console.log('Testing stream configuration...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const statusBadgeColor = isLive
    ? 'bg-red-500'
    : isPaused
      ? 'bg-yellow-500'
      : 'bg-gray-600';

  const statusText = isLive ? '🔴 LIVE' : isPaused ? '⏸ PAUSED' : 'Idle';

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-400" />
          Stream Control
        </h2>
        <div className={`px-4 py-2 rounded-full font-mono text-sm font-bold text-white ${statusBadgeColor}`}>
          {statusText}
        </div>
      </div>

      {/* Error Display */}
      {lastError && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{lastError}</p>
        </div>
      )}

      {/* Platform Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Streaming Platform
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.keys(PLATFORM_CONFIGS) as StreamingPlatform[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePlatformChange(p)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition ${
                platform === p
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-700 text-gray-200 hover:bg-slate-600'
              }`}
            >
              {PLATFORM_CONFIGS[p].name}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Key Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Stream Key
        </label>
        <div className="flex gap-2">
          <input
            type="password"
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
            placeholder="Enter your stream key"
            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={copyStreamKey}
            disabled={!streamKey}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-gray-300 rounded-lg text-sm font-medium"
          >
            Copy
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quality Settings Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Resolution */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          >
            {Object.keys(RESOLUTION_PRESETS).map((res) => (
              <option key={res} value={res}>
                {res}
              </option>
            ))}
          </select>
        </div>

        {/* FPS */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Frame Rate
          </label>
          <select
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value) as FPS)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          >
            {FPS_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f} fps
              </option>
            ))}
          </select>
        </div>

        {/* Bitrate Mode */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Bitrate
          </label>
          <select
            value={bitrateMode}
            onChange={(e) => setBitrateMode(e.target.value as 'auto' | 'custom')}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="auto">Auto</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Encoder */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Encoder
          </label>
          <select
            value={encoder}
            onChange={(e) => setEncoder(e.target.value as Encoder)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          >
            {Object.entries(ENCODER_OPTIONS).map(([key, { name }]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset & Bitrate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Preset */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">
            Preset
          </label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as Preset)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          >
            {ENCODER_PRESETS.map((p) => (
              <option key={p} value={p}>
                {p} - {PRESET_DESCRIPTIONS[p]}
              </option>
            ))}
          </select>
        </div>

        {/* Bitrate Slider */}
        {bitrateMode === 'custom' && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Bitrate: {customBitrate.current} kbps
            </label>
            <input
              type="range"
              min={customBitrate.min}
              max={customBitrate.max}
              value={customBitrate.current}
              onChange={(e) =>
                setCustomBitrate({
                  ...customBitrate,
                  current: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-amber-400 hover:text-amber-300 text-sm font-medium flex items-center gap-1"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-slate-700/50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Keyframe Interval (s)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={keyframeInterval}
                  onChange={(e) => setKeyframeInterval(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  B-Frames
                </label>
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={bFrames}
                  onChange={(e) => setBFrames(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleTestStream}
          disabled={!streamKey || isLoading || isLive}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
        >
          {isLoading ? 'Testing...' : 'Test Stream'}
        </button>

        {!isLive ? (
          <button
            onClick={handleStreamStart}
            disabled={!streamKey || isLoading}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            {isLoading ? 'Starting...' : 'Start Streaming'}
          </button>
        ) : (
          <button
            onClick={handleStreamStop}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Stop Stream
          </button>
        )}
      </div>
    </div>
  );
}
