'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAudioEngine } from './useAudioEngine';
import { useStreaming } from './useStreaming';
import type { MixerChannelConfig } from '../types/streaming';

/**
 * Integration hook that connects audio engine to streaming system
 * Synchronizes mixer state, metrics, and audio data between systems
 */
export function useStreamingWithAudio() {
  const audio = useAudioEngine();
  const streaming = useStreaming();

  const [audioMixerChannels, setAudioMixerChannels] = useState<MixerChannelConfig[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    diskTotal: 8 * 1024 * 1024 * 1024, // 8TB default
    networkBandwidth: 0,
  });

  /**
   * Sync mixer channels from audio engine to streaming system
   */
  useEffect(() => {
    if (!audio.state.tracks) return;

    const channels: MixerChannelConfig[] = [
      // MIC channels
      {
        id: 'mic-1',
        name: 'MIC 1',
        label: 'Vocals',
        type: 'mic',
        volume: -12,
        peakLevel: audio.getAllPeakLevels().get(audio.state.tracks[0]?.getId()) ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: 0,
      },
      {
        id: 'mic-2',
        name: 'MIC 2',
        label: 'Guest',
        type: 'mic',
        volume: -12,
        peakLevel: audio.getAllPeakLevels().get(audio.state.tracks[1]?.getId()) ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: 0,
      },
      // Instrument channels
      {
        id: 'instr-1',
        name: 'INSTR 1',
        label: 'Guitar',
        type: 'playback',
        volume: -6,
        peakLevel: audio.getAllPeakLevels().get(audio.state.tracks[2]?.getId()) ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: -20,
      },
      {
        id: 'instr-2',
        name: 'INSTR 2',
        label: 'Keys',
        type: 'playback',
        volume: -6,
        peakLevel: audio.getAllPeakLevels().get(audio.state.tracks[3]?.getId()) ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: 20,
      },
      // Drums and playback
      {
        id: 'beat',
        name: 'BEAT',
        label: 'Drums',
        type: 'playback',
        volume: -3,
        peakLevel: audio.getAllPeakLevels().get(audio.state.tracks[4]?.getId()) ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: 0,
      },
      {
        id: 'playback',
        name: 'PLAYBACK',
        label: 'Track',
        type: 'playback',
        volume: 0,
        peakLevel: audio.getAllPeakLevels().get(audio.state.tracks[5]?.getId()) ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: 0,
      },
      // Master
      {
        id: 'master',
        name: 'MASTER',
        label: 'Output',
        type: 'master',
        volume: audio.state.masterVolume * 6 - 6, // Convert 0-1 to -6 to +6 dB
        peakLevel: audio.state.meterReading?.peak ?? -Infinity,
        isMuted: false,
        isSolo: false,
        pan: 0,
      },
    ];

    setAudioMixerChannels(channels);
  }, [audio.state.tracks, audio.state.masterVolume, audio.state.meterReading]);

  /**
   * Update audio engine when mixer channel volume changes
   */
  const handleChannelVolumeChange = useCallback(
    (channelId: string, volume: number) => {
      if (channelId === 'master') {
        // Convert dB to 0-1 range
        const gain = Math.pow(10, volume / 20);
        audio.setMasterVolume(Math.max(0, Math.min(1, gain)));
      } else {
        // Update track volume
        const track = audio.state.tracks.find((t) => t.getId() === channelId);
        if (track) {
          const gainNode = track.getOutputNode();
          gainNode.gain.value = Math.pow(10, volume / 20);
        }
      }
    },
    [audio]
  );

  /**
   * Update streaming metrics from audio engine
   */
  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics((prev) => ({
        ...prev,
        // Simulate CPU usage based on track count
        cpuUsage: Math.min(100, (audio.state.tracks.length / 16) * 100 + Math.random() * 10),
        // Simulate memory usage
        memoryUsage: Math.min(100, (audio.state.tracks.length / 24) * 100 + Math.random() * 5),
        // Calculate storage used (simulated based on recording duration)
        diskUsage: (audio.state.duration / 3600) * 44.1 * 1024 * 1024 * 1024, // ~44.1GB per hour at 44.1kHz
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [audio.state.tracks.length, audio.state.duration]);

  /**
   * Sync stream status with audio engine state
   */
  useEffect(() => {
    if (streaming.isStreaming) {
      // Update bitrate based on audio quality
      const bitrate = Math.round(
        (audio.state.tracks[0]?.getOutputNode().context.sampleRate ?? 48000) /
          1000 *
          (128 + audio.state.tracks.length * 64) /
          1000
      );

      // Simulate viewer count increase while streaming
      if (Math.random() < 0.3) {
        // 30% chance to add a viewer
        // This would come from real server data in production
      }
    }
  }, [streaming.isStreaming, audio.state.tracks.length]);

  return {
    // Audio engine state
    audio,

    // Streaming state
    streaming,

    // Mixer channels synced from audio engine
    audioMixerChannels,

    // System metrics
    systemMetrics,

    // Actions
    handleChannelVolumeChange,

    // Helpers
    getTotalTracks: () => audio.state.tracks.length,
    getRecordingStatus: () => (audio.state.isRecording ? 'recording' : 'idle'),
    getPlaybackStatus: () => (audio.state.isPlaying ? 'playing' : 'stopped'),
  };
}
