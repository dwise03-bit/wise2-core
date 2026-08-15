'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Eye, EyeOff, Play, Square, AlertCircle } from 'lucide-react';

type Platform = 'twitch' | 'youtube' | 'facebook' | 'custom';
type Resolution = '480p' | '720p' | '1080p';
type FPS = 30 | 60;

interface OBSStreamControlProps {
  isStreaming: boolean;
  onStartStream: (config: StreamConfig) => void;
  onStopStream: () => void;
}

interface StreamConfig {
  platform: Platform;
  resolution: Resolution;
  fps: FPS;
  bitrate: number | 'auto';
  encoder: 'x264' | 'hardware';
  streamKey: string;
}

export function OBSStreamControl({
  isStreaming,
  onStartStream,
  onStopStream,
}: OBSStreamControlProps) {
  const [platform, setPlatform] = useState<Platform>('twitch');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [fps, setFps] = useState<FPS>(60);
  const [bitrate, setBitrate] = useState<number | 'auto'>('auto');
  const [customBitrate, setCustomBitrate] = useState(5000);
  const [encoder, setEncoder] = useState<'x264' | 'hardware'>('x264');
  const [streamKey, setStreamKey] = useState('');
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const resolutionBitrates: Record<Resolution, Record<FPS, { auto: number; min: number; max: number }>> = {
    '480p': { 30: { auto: 1000, min: 500, max: 2500 }, 60: { auto: 1500, min: 1000, max: 3500 } },
    '720p': { 30: { auto: 2500, min: 1500, max: 5000 }, 60: { auto: 5000, min: 3000, max: 8000 } },
    '1080p': { 30: { auto: 4000, min: 2500, max: 8000 }, 60: { auto: 8000, min: 5000, max: 15000 } },
  };

  const getBitrateRecommendation = () => {
    return resolutionBitrates[resolution][fps];
  };

  const handleStartStream = async () => {
    if (!streamKey.trim()) {
      setConnectionError('Stream key is required');
      return;
    }

    setStreamStatus('connecting');
    setConnectionError(null);

    // Simulate connection delay
    setTimeout(() => {
      try {
        onStartStream({
          platform,
          resolution,
          fps,
          bitrate: bitrate === 'auto' ? getBitrateRecommendation().auto : customBitrate,
          encoder,
          streamKey,
        });
        setStreamStatus('live');
      } catch (error) {
        setStreamStatus('idle');
        setConnectionError('Failed to start stream. Check your stream key.');
      }
    }, 2000);
  };

  const handleStopStream = () => {
    onStopStream();
    setStreamStatus('idle');
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(streamKey);
  };

  return (
    <div className="flex flex-col gap-4 bg-gradient-to-b from-gray-950 to-gray-900 rounded-lg border border-gray-800 p-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {streamStatus === 'idle' && (
          <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs font-bold text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
            Idle
          </div>
        )}
        {streamStatus === 'connecting' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 rounded-full text-xs font-bold text-yellow-400 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Connecting...
          </motion.div>
        )}
        {streamStatus === 'live' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="px-3 py-1 bg-red-900/30 border border-red-700 rounded-full text-xs font-bold text-red-400 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            LIVE
          </motion.div>
        )}
      </div>

      {/* Platform Selection */}
      <div>
        <label className="text-xs font-bold text-gray-400 block mb-2">PLATFORM</label>
        <div className="grid grid-cols-2 gap-2">
          {(['twitch', 'youtube', 'facebook', 'custom'] as const).map((p) => (
            <motion.button
              key={p}
              onClick={() => setPlatform(p)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`py-2 px-3 rounded text-xs font-semibold transition ${
                platform === p
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stream Key */}
      <div>
        <label className="text-xs font-bold text-gray-400 block mb-2">STREAM KEY</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showStreamKey ? 'text' : 'password'}
              value={streamKey}
              onChange={(e) => setStreamKey(e.target.value)}
              disabled={isStreaming}
              placeholder="Enter your stream key..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
            />
            <button
              onClick={() => setShowStreamKey(!showStreamKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition"
            >
              {showStreamKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <motion.button
            onClick={copyStreamKey}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!streamKey}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-400 transition disabled:opacity-50"
          >
            <Copy size={16} />
          </motion.button>
        </div>
      </div>

      {/* Resolution & FPS */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-400 block mb-2">RESOLUTION</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as Resolution)}
            disabled={isStreaming}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          >
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 block mb-2">FPS</label>
          <select
            value={fps}
            onChange={(e) => setFps(parseInt(e.target.value) as FPS)}
            disabled={isStreaming}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
          >
            <option value={30}>30 FPS</option>
            <option value={60}>60 FPS</option>
          </select>
        </div>
      </div>

      {/* Bitrate */}
      <div>
        <label className="text-xs font-bold text-gray-400 block mb-2">
          BITRATE
          {bitrate === 'auto' && (
            <span className="text-gray-500 text-xs font-normal ml-2">
              (Auto: {getBitrateRecommendation().auto} kbps)
            </span>
          )}
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <motion.button
              onClick={() => setBitrate('auto')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition ${
                bitrate === 'auto'
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              Auto
            </motion.button>
            <motion.button
              onClick={() => setBitrate(customBitrate)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition ${
                bitrate !== 'auto'
                  ? 'bg-blue-600 text-white border border-blue-500'
                  : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
              }`}
            >
              Custom
            </motion.button>
          </div>
          <AnimatePresence>
            {bitrate !== 'auto' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex gap-2 items-center"
              >
                <input
                  type="range"
                  min={getBitrateRecommendation().min}
                  max={getBitrateRecommendation().max}
                  step={100}
                  value={customBitrate}
                  onChange={(e) => {
                    setCustomBitrate(parseInt(e.target.value));
                    setBitrate(parseInt(e.target.value));
                  }}
                  className="flex-1"
                />
                <div className="text-xs font-mono bg-gray-800 px-3 py-1 rounded border border-gray-700 text-gray-300 min-w-16 text-center">
                  {customBitrate} kbps
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Encoder */}
      <div>
        <label className="text-xs font-bold text-gray-400 block mb-2">ENCODER</label>
        <select
          value={encoder}
          onChange={(e) => setEncoder(e.target.value as 'x264' | 'hardware')}
          disabled={isStreaming}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition disabled:opacity-50"
        >
          <option value="x264">x264 (Software)</option>
          <option value="hardware">Hardware (NVIDIA/AMD)</option>
        </select>
      </div>

      {/* Error Message */}
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

      {/* Stream Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {!isStreaming ? (
          <>
            <motion.button
              onClick={() => {
                /* Test stream */
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-300 text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <Play size={14} />
              Test
            </motion.button>
            <motion.button
              onClick={handleStartStream}
              disabled={!streamKey.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-2 px-3 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={14} />
              START STREAM
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={handleStopStream}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="col-span-2 py-2 px-3 bg-gray-600 hover:bg-gray-700 rounded text-white text-sm font-bold transition flex items-center justify-center gap-2"
          >
            <Square size={14} />
            STOP STREAM
          </motion.button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gray-900 border border-gray-800 rounded p-3 text-xs text-gray-400 space-y-1">
        <div className="font-mono">
          {resolution} @ {fps}fps • {bitrate === 'auto' ? getBitrateRecommendation().auto : customBitrate} kbps
        </div>
        <div className="text-gray-500">
          {encoder === 'x264' ? 'Software encoding' : 'Hardware acceleration enabled'}
        </div>
      </div>
    </div>
  );
}
