'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Camera, LogOut, Clock } from 'lucide-react';
import { UI_CONSTANTS } from './streamingConstants';

interface StreamTransportProps {
  isLive: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onScreenshot: () => void;
  onDisconnect: () => void;
  isMuted?: boolean;
  canPause?: boolean;
}

export default function StreamTransport({
  isLive,
  isPaused,
  onPause,
  onResume,
  onMute,
  onUnmute,
  onScreenshot,
  onDisconnect,
  isMuted = false,
  canPause = true,
}: StreamTransportProps) {
  const [pauseTimeRemaining, setPauseTimeRemaining] = useState(0);
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  // Countdown timer for pause
  useEffect(() => {
    if (!isPaused || pauseTimeRemaining === 0) return;

    const timer = setInterval(() => {
      setPauseTimeRemaining((prev) => {
        if (prev <= 1) {
          onResume();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, pauseTimeRemaining, onResume]);

  const handlePause = useCallback(() => {
    if (canPause && isLive && !isPaused) {
      onPause();
      setPauseTimeRemaining(UI_CONSTANTS.PAUSE_MAX_DURATION);
    }
  }, [isLive, isPaused, canPause, onPause]);

  const handleResume = useCallback(() => {
    if (isPaused) {
      onResume();
      setPauseTimeRemaining(0);
    }
  }, [isPaused, onResume]);

  const handleScreenshot = useCallback(async () => {
    setIsScreenshotting(true);
    try {
      await onScreenshot();
      // Show brief success feedback
      setTimeout(() => setIsScreenshotting(false), 1000);
    } catch (error) {
      console.error('Screenshot failed:', error);
      setIsScreenshotting(false);
    }
  }, [onScreenshot]);

  if (!isLive) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Play/Pause Controls */}
        <div className="flex items-center gap-2">
          {!isPaused ? (
            <button
              onClick={handlePause}
              disabled={!canPause}
              title={canPause ? 'Pause stream (up to 30s)' : 'Cannot pause'}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center gap-2 transition"
            >
              <Pause className="w-4 h-4" />
              <span className="hidden sm:inline">Pause</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleResume}
                title="Resume stream"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4" />
                <span className="hidden sm:inline">Resume</span>
              </button>

              {pauseTimeRemaining > 0 && (
                <div className="px-3 py-2 bg-slate-700 rounded-lg flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-mono">{pauseTimeRemaining}s</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audio Control */}
        <div>
          <button
            onClick={isMuted ? onUnmute : onMute}
            title={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg font-medium flex items-center gap-2 transition"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">Unmute</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">Mute</span>
              </>
            )}
          </button>
        </div>

        {/* Screenshot Button */}
        <div>
          <button
            onClick={handleScreenshot}
            disabled={isScreenshotting}
            title="Capture screenshot"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-2 transition"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isScreenshotting ? 'Capturing...' : 'Screenshot'}
            </span>
          </button>
        </div>

        {/* Disconnect Button */}
        <div className="ml-auto">
          <button
            onClick={onDisconnect}
            title="Stop and disconnect stream"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            {isPaused ? 'Stream paused' : 'Stream active'}
          </span>
        </div>

        {isPaused && pauseTimeRemaining > 0 && (
          <span className="text-amber-400 font-medium">
            Resuming in {pauseTimeRemaining}s
          </span>
        )}

        <div className="flex gap-4 ml-auto">
          <div>
            <span className="text-gray-500">Controls:</span>
            <span className="ml-2 font-mono text-xs text-gray-400">
              P = Pause, M = Mute, S = Screenshot
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
