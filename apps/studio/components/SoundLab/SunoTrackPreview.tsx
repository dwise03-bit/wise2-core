'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Download,
  Edit,
  Repeat,
  Music,
  Clock,
  Gauge,
  HardDrive,
} from 'lucide-react';
import { SunoGeneration, SunoExportOptions } from '../../types/suno';

interface SunoTrackPreviewProps {
  generation: SunoGeneration;
  onRegenerate?: (generation: SunoGeneration) => void;
  onExport?: (format: 'mp3' | 'wav' | 'flac') => Promise<void>;
  onAddToSoundLab?: () => void;
}

export function SunoTrackPreview({
  generation,
  onRegenerate,
  onExport,
  onAddToSoundLab,
}: SunoTrackPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isExporting, setIsExporting] = useState<'mp3' | 'wav' | 'flac' | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate waveform visualization data
  const waveformData = generation.waveformData ||
    Array.from({ length: 100 }, () => Math.random() * 0.8);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleExport = async (format: 'mp3' | 'wav' | 'flac') => {
    setIsExporting(format);
    try {
      await onExport?.(format);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * (audioRef.current.duration || generation.duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-gradient-to-br from-studio-panel to-studio-bg border border-wise-medium rounded-xl overflow-hidden space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-wise-accent/20 rounded-lg">
              <Music className="w-6 h-6 text-wise-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-wise-text-primary">Track Preview</h3>
              <p className="text-sm text-wise-text-muted">{generation.params.genre}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              generation.status === 'Completed'
                ? 'bg-wise-accent-green/20 text-wise-accent-green'
                : generation.status === 'Failed'
                ? 'bg-wise-accent-red/20 text-wise-accent-red'
                : 'bg-studio-input text-wise-text-muted'
            }`}
          >
            {generation.status}
          </span>
        </div>

        {/* Generation Info */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-wise-text-muted uppercase mb-2">Prompt</p>
            <p className="text-sm text-wise-text-primary">{generation.params.prompt}</p>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-wise-text-muted">
            <span>Waveform</span>
            <span className="font-mono">
              {formatTime(currentTime)} / {formatTime(generation.duration)}
            </span>
          </div>

          {/* Waveform Canvas */}
          <motion.div
            whileHover={{ opacity: 0.8 }}
            onClick={handleWaveformClick}
            className="relative h-16 bg-gradient-to-b from-studio-input to-studio-line rounded-lg overflow-hidden cursor-pointer group"
          >
            {/* Waveform Bars */}
            <div className="absolute inset-0 flex items-center justify-end gap-0.5 px-2 opacity-60">
              {waveformData.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-wise-accent to-wise-accent-bright rounded-t transition-all"
                  style={{
                    height: `${value * 100}%`,
                  }}
                />
              ))}
            </div>

            {/* Progress Indicator */}
            <motion.div
              className="absolute top-0 h-full w-1 bg-wise-accent pointer-events-none"
              style={{
                left: `${(currentTime / generation.duration) * 100}%`,
              }}
            />

            {/* Time Hover Tooltip */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition">
              <p className="text-xs font-mono text-wise-accent">Click to seek</p>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="h-1 bg-studio-line rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentTime / generation.duration) * 100}%` }}
              className="h-full bg-wise-accent"
            />
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlayPause}
              className="p-3 bg-wise-accent text-studio-panel rounded-full hover:shadow-lg hover:shadow-wise-accent/50 transition"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </motion.button>

            {/* Reset Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="p-3 bg-studio-input border border-wise-medium rounded-full text-wise-text-secondary hover:text-wise-accent transition"
              title="Reset to start"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-wise-text-muted" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (audioRef.current) {
                  audioRef.current.volume = newVolume;
                }
              }}
              className="w-24 h-2 bg-studio-line rounded-lg appearance-none cursor-pointer slider accent-wise-accent"
            />
            <span className="text-xs text-wise-text-muted w-8 text-right font-mono">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-studio-input rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-wise-text-muted" />
              <p className="text-xs text-wise-text-muted">Duration</p>
            </div>
            <p className="text-sm font-semibold text-wise-text-primary font-mono">
              {generation.duration}s
            </p>
          </div>

          <div className="bg-studio-input rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-wise-text-muted" />
              <p className="text-xs text-wise-text-muted">Bitrate</p>
            </div>
            <p className="text-sm font-semibold text-wise-text-primary">
              {generation.bitrate}
            </p>
          </div>

          <div className="bg-studio-input rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-4 h-4 text-wise-text-muted" />
              <p className="text-xs text-wise-text-muted">File Size</p>
            </div>
            <p className="text-sm font-semibold text-wise-text-primary">
              {generation.fileSize}
            </p>
          </div>

          <div className="bg-studio-input rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-wise-text-muted" />
              <p className="text-xs text-wise-text-muted">Plays</p>
            </div>
            <p className="text-sm font-semibold text-wise-text-primary">
              {generation.playCount}
            </p>
          </div>
        </div>

        {/* Generation Settings */}
        <div className="bg-studio-input/50 border border-wise-medium rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-wise-text-primary">Settings Used</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-wise-text-muted mb-1">Genre</p>
              <p className="font-semibold text-wise-text-secondary">{generation.params.genre}</p>
            </div>
            <div>
              <p className="text-wise-text-muted mb-1">Mood</p>
              <p className="font-semibold text-wise-text-secondary">{generation.params.mood}</p>
            </div>
            <div>
              <p className="text-wise-text-muted mb-1">Tempo</p>
              <p className="font-semibold text-wise-text-secondary font-mono">
                {generation.params.tempo} BPM
              </p>
            </div>
            <div>
              <p className="text-wise-text-muted mb-1">Voice</p>
              <p className="font-semibold text-wise-text-secondary">{generation.params.voice}</p>
            </div>
            <div>
              <p className="text-wise-text-muted mb-1">Key</p>
              <p className="font-semibold text-wise-text-secondary">
                {generation.params.key} {generation.params.scale}
              </p>
            </div>
            <div>
              <p className="text-wise-text-muted mb-1">Type</p>
              <p className="font-semibold text-wise-text-secondary">
                {generation.params.vocalType}
              </p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-wise-text-primary">Export</p>
          <div className="grid grid-cols-3 gap-3">
            {(['mp3', 'wav', 'flac'] as const).map((format) => (
              <motion.button
                key={format}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport(format)}
                disabled={isExporting === format}
                className={`py-2.5 px-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition ${
                  isExporting === format
                    ? 'bg-wise-accent text-studio-panel opacity-75'
                    : 'bg-studio-input border border-wise-medium text-wise-text-primary hover:border-wise-accent'
                }`}
              >
                {isExporting === format ? (
                  <>
                    <div className="w-4 h-4 border-2 border-studio-panel border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {format.toUpperCase()}
                  </>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {generation.status === 'Completed' && onAddToSoundLab && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddToSoundLab}
              className="flex-1 py-3 px-4 bg-wise-accent/20 border border-wise-accent rounded-lg font-semibold text-wise-accent hover:bg-wise-accent/30 transition"
            >
              Add to SoundLab
            </motion.button>
          )}

          {onRegenerate && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRegenerate(generation)}
              className="flex-1 py-3 px-4 bg-studio-input border border-wise-medium rounded-lg font-semibold text-wise-text-primary hover:border-wise-accent transition flex items-center justify-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              Regenerate
            </motion.button>
          )}
        </div>

        {/* Hidden Audio Element */}
        {generation.audioUrl && (
          <audio
            ref={audioRef}
            src={generation.audioUrl}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
            onEnded={() => setIsPlaying(false)}
          />
        )}
      </div>
    </motion.div>
  );
}
