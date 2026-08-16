'use client';

/**
 * RecordingControl Component
 *
 * Professional recording interface with:
 * - Record/Stop buttons with countdown timer
 * - Recording time display
 * - Clipping indicator
 * - Recording status
 * - Latency display
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RecordingEngine, type RecordedAudioBuffer } from '@/lib/audioRecording';

export interface RecordingControlProps {
  onRecordingComplete?: (buffer: RecordedAudioBuffer) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
  onClipping?: () => void;
  className?: string;
}

export function RecordingControl({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
  onClipping,
  className = '',
}: RecordingControlProps) {
  // State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const [peakLevel, setPeakLevel] = useState(-60);
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const engineRef = useRef<RecordingEngine | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<number>(0);

  /**
   * Initialize recording engine on mount
   */
  useEffect(() => {
    const initEngine = async () => {
      try {
        const engine = new RecordingEngine({
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        });

        await engine.initialize();

        // Setup callbacks
        engine.onLevelChange((peak, rms) => {
          setPeakLevel(peak);
        });

        engine.onClippingDetected(() => {
          setIsClipping(true);
          onClipping?.();
          // Reset clipping indicator after 500ms
          setTimeout(() => setIsClipping(false), 500);
        });

        engineRef.current = engine;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize recording engine');
        console.error('RecordingEngine init error:', err);
      }
    };

    initEngine();

    return () => {
      engineRef.current?.dispose();
    };
  }, [onClipping]);

  /**
   * Handle record button click
   */
  const handleRecordClick = useCallback(async () => {
    if (!engineRef.current) {
      setError('Recording engine not initialized');
      return;
    }

    try {
      if (isRecording) {
        // Stop recording
        const recorded = engineRef.current.stopRecording();
        setIsRecording(false);
        setRecordingDuration(0);

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        onRecordingStop?.();

        if (recorded) {
          onRecordingComplete?.(recorded);
        }
      } else {
        // Start recording
        engineRef.current.startRecording();
        setIsRecording(true);
        setIsClipping(false);
        setPeakLevel(-60);
        setRecordingDuration(0);

        onRecordingStart?.();

        // Update duration display
        durationIntervalRef.current = setInterval(() => {
          const metrics = engineRef.current?.getMetrics();
          if (metrics) {
            setRecordingDuration(metrics.duration);
            setLatency(metrics.latency);
          }
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recording error');
      console.error('Recording error:', err);
      setIsRecording(false);
    }
  }, [isRecording, onRecordingStart, onRecordingStop, onRecordingComplete]);

  /**
   * Format time display (mm:ss.ms)
   */
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 100);
    return `${minutes}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  /**
   * Cleanup interval on unmount
   */
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`recording-control ${className}`}>
      <div className="space-y-4">
        {/* Recording Status */}
        <div className="flex items-center justify-between bg-slate-900 rounded-lg p-4">
          <div className="flex items-center gap-4">
            {/* Record Button */}
            <button
              onClick={handleRecordClick}
              className={`relative w-12 h-12 rounded-full font-bold text-white transition-all ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title={isRecording ? 'Stop recording' : 'Start recording'}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              <div className={`absolute inset-1 rounded-full ${isRecording ? 'bg-red-500' : ''}`} />
              <span className="relative">●</span>
            </button>

            {/* Duration Display */}
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-white">
                {formatTime(recordingDuration)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Recording Time</div>
            </div>
          </div>

          {/* Clipping Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                isClipping ? 'bg-red-500 shadow-lg shadow-red-500' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs text-slate-400">{isClipping ? 'CLIPPING' : 'OK'}</span>
          </div>
        </div>

        {/* Peak Level Display */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-2">Peak Level</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                  style={{
                    width: `${Math.max(0, (peakLevel + 60) / 66) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="text-sm font-mono text-white w-12 text-right">
              {peakLevel.toFixed(1)} dB
            </div>
          </div>
        </div>

        {/* Latency Display */}
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-xs text-slate-400">Round-trip Latency</div>
          <div className="text-sm font-mono text-white">
            {latency.toFixed(1)} ms
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {latency < 10 ? '✓ Professional grade' : '⚠ Higher latency'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-slate-500 text-center">
          {isRecording
            ? 'Click to stop recording'
            : 'Click to start recording from microphone'}
        </div>
      </div>
    </div>
  );
}

export default RecordingControl;
