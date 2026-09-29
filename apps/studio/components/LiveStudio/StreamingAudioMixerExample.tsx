'use client';

/**
 * Streaming Audio Mixer Example
 * Complete example demonstrating audio mixing for live streaming
 *
 * Features:
 * - Professional audio mixer UI
 * - Multi-source audio mixing:
 *   - Microphone input
 *   - System audio
 *   - Suno generated tracks
 *   - Media files
 * - RTMP stream output
 * - Real-time metering and level display
 * - Audio delay compensation
 * - Master output controls
 */

import React, { useState, useCallback } from 'react';
import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';
import { AudioMixer } from './AudioMixer';
import { MasterChannel } from './MasterChannel';

export function StreamingAudioMixerExample() {
  const {
    isInitialized,
    isStreaming,
    channels,
    masterVolume,
    masterMetering,
    audioState,
    addMicrophoneSource,
    addSystemAudioSource,
    addSunoTrackSource,
    addMediaSource,
    removeSource,
    setSourceVolume,
    setSourcePan,
    setSourceMute,
    toggleSourceSolo,
    setMasterVolume,
    setAudioDelay,
    connectToStream,
    disconnectStream,
    isStreamConnected,
    cleanup,
  } = useStreamingAudioMixer();

  const [showStreamSettings, setShowStreamSettings] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  /**
   * Handle add microphone
   */
  const handleAddMicrophone = async () => {
    const success = await addMicrophoneSource();
    if (success) {
      console.log('Microphone added successfully');
    } else {
      alert('Failed to add microphone. Check permissions.');
    }
  };

  /**
   * Handle add system audio
   */
  const handleAddSystemAudio = async () => {
    const success = await addSystemAudioSource();
    if (success) {
      console.log('System audio added successfully');
    } else {
      alert('Failed to add system audio.');
    }
  };

  /**
   * Handle add Suno track
   */
  const handleAddSunoTrack = async () => {
    const url = prompt('Enter Suno track URL:');
    if (url) {
      const success = await addSunoTrackSource(url);
      if (success) {
        console.log('Suno track added successfully');
      } else {
        alert('Failed to load Suno track.');
      }
    }
  };

  /**
   * Handle stream connection
   */
  const handleConnectStream = async () => {
    if (!streamUrl || !streamKey) {
      alert('Please enter stream URL and key');
      return;
    }

    const success = await connectToStream(streamUrl, streamKey);
    if (success) {
      setShowStreamSettings(false);
      console.log('Connected to stream');
    } else {
      alert('Failed to connect to stream');
    }
  };

  /**
   * Handle disconnect stream
   */
  const handleDisconnectStream = () => {
    disconnectStream();
    console.log('Disconnected from stream');
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎙️</div>
          <p className="text-white text-lg">Initializing audio mixer...</p>
          <p className="text-gray-400 text-sm mt-2">{audioState}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header Controls */}
      <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900 px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Title and Status */}
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Streaming Audio Mixer</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                isStreaming ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'
              }`}>
                {isStreaming ? '🔴 STREAMING' : '⚫ OFFLINE'}
              </span>
              <span className="text-xs text-gray-400">
                {channels.length} source{channels.length !== 1 ? 's' : ''} connected
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleAddMicrophone}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
              title="Add microphone input"
            >
              🎤 Mic
            </button>
            <button
              onClick={handleAddSystemAudio}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
              title="Add system audio"
            >
              🔊 System
            </button>
            <button
              onClick={handleAddSunoTrack}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded transition-colors"
              title="Add Suno track"
            >
              🤖 Suno
            </button>
            <div className="border-l border-gray-700 mx-2" />
            {!isStreaming ? (
              <button
                onClick={() => setShowStreamSettings(true)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
                title="Connect to stream"
              >
                ⚫ Go Live
              </button>
            ) : (
              <button
                onClick={handleDisconnectStream}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors animate-pulse"
                title="Disconnect from stream"
              >
                🔴 Stop
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stream Settings Modal */}
      {showStreamSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold text-white mb-4">Connect to Stream</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  RTMP Server URL
                </label>
                <input
                  type="text"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="rtmp://your-server.com/live"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Stream Key
                </label>
                <input
                  type="password"
                  value={streamKey}
                  onChange={(e) => setStreamKey(e.target.value)}
                  placeholder="Your stream key"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConnectStream}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors"
              >
                Go Live
              </button>
              <button
                onClick={() => setShowStreamSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col gap-4 p-4">
        {/* Mixer Section */}
        <div className="flex-1 min-h-0 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <AudioMixer
            channels={channels}
            masterVolume={masterVolume}
            masterPeakLevel={masterMetering.peakLevel}
            masterRmsLevel={masterMetering.rmsLevel}
            masterIsClipping={masterMetering.isClipping}
            onChannelVolumeChange={setSourceVolume}
            onChannelPanChange={setSourcePan}
            onChannelMuteToggle={setSourceMute}
            onChannelSoloToggle={toggleSourceSolo}
            onMasterVolumeChange={setMasterVolume}
          />
        </div>

        {/* Master Controls Section */}
        <div className="flex-shrink-0">
          <MasterChannel
            masterVolume={masterVolume}
            masterPeakLevel={masterMetering.peakLevel}
            masterRmsLevel={masterMetering.rmsLevel}
            isClipping={masterMetering.isClipping}
            outputDestination="both"
            onVolumeChange={setMasterVolume}
            onReset={() => setMasterVolume(-6)}
          />
        </div>
      </div>

      {/* Footer with Source Details */}
      {selectedSourceId && (
        <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              {channels.find((c) => c.id === selectedSourceId) && (
                <p className="text-sm text-gray-400">
                  Selected: {channels.find((c) => c.id === selectedSourceId)?.name}
                </p>
              )}
            </div>
            <button
              onClick={() => removeSource(selectedSourceId)}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm font-semibold rounded transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StreamingAudioMixerExample;
