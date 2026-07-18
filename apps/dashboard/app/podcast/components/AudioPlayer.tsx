'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  src: string;
  title: string;
  onDownload?: () => void;
}

export function AudioPlayer({ src, title, onDownload }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-6 space-y-4"
    >
      {/* Title */}
      <h3 className="font-bold text-lg text-white">{title}</h3>

      {/* Audio Element (hidden) */}
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Player Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <motion.button
          onClick={handlePlayPause}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full transition-all text-white font-bold text-lg shadow-lg"
        >
          {isPlaying ? '⏸' : '▶'}
        </motion.button>

        {/* Progress Bar */}
        <div className="flex-1 flex flex-col gap-2">
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-2 bg-black/50 rounded-full cursor-pointer hover:bg-black/60 transition-colors"
          >
            {/* Buffered Progress */}
            <div className="absolute inset-0 h-full bg-purple-500/20 rounded-full" />

            {/* Current Progress */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
              transition={{ type: 'tween' }}
            />

            {/* Scrubber Handle */}
            {progressPercent > 0 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                style={{ left: `calc(${progressPercent}% - 8px)` }}
                transition={{ type: 'tween' }}
              />
            )}
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Download Button */}
      {onDownload && (
        <motion.button
          onClick={onDownload}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/50 hover:to-emerald-500/50 border border-green-500/50 text-green-300 font-medium rounded-lg transition-all"
        >
          ⬇️ Download Audio
        </motion.button>
      )}
    </motion.div>
  );
}
