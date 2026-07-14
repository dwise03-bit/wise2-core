'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { TransportControls } from '../components/TransportControls';
import { TrackPanel } from '../components/TrackPanel';
import { MasterMixer } from '../components/MasterMixer';

export default function StudioPage() {
  const audio = useAudioEngine();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [bpmInput, setBpmInput] = useState('120');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = Play/Pause
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (audio.state.isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
      }

      // Shift+Space = Stop
      if (e.code === 'Space' && e.shiftKey) {
        e.preventDefault();
        audio.stop();
      }

      // R = Record
      if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (audio.state.isRecording) {
          audio.stopRecording();
        } else {
          audio.startRecording();
        }
      }

      // T = Add track
      if (e.code === 'KeyT' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const track = audio.addTrack();
        if (track) setSelectedTrackId(track.getId());
      }

      // Delete = Remove track
      if (e.code === 'Delete' && selectedTrackId) {
        audio.removeTrack(selectedTrackId);
        setSelectedTrackId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audio, selectedTrackId]);

  const handleBPMChange = () => {
    const bpm = parseFloat(bpmInput);
    if (!isNaN(bpm) && bpm > 0) {
      audio.setBPM(bpm);
    }
  };

  const peakLevels = audio.getAllPeakLevels();
  const meterReading = audio.state.meterReading;

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-2xl font-bold focus:outline-none focus:border-b-2 focus:border-blue-500 mb-1"
              placeholder="Project Name"
            />
            <p className="text-sm text-gray-400">
              {audio.state.tracks.length} track{audio.state.tracks.length !== 1 ? 's' : ''} •{' '}
              {audio.state.isInitialized ? '✓ Ready' : '⚠ Initializing...'}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* BPM Input */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">BPM:</label>
              <input
                type="number"
                min="20"
                max="300"
                value={bpmInput}
                onChange={(e) => setBpmInput(e.target.value)}
                onBlur={handleBPMChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBPMChange();
                }}
                className="w-16 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Add Track Button */}
            <button
              onClick={() => {
                const track = audio.addTrack();
                if (track) setSelectedTrackId(track.getId());
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition-colors"
              title="Add Track (T)"
            >
              + Track
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-4 p-4">
        {/* Left Sidebar - Tracks List */}
        <div className="w-64 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3">TRACKS</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {audio.state.tracks.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-8">
                  No tracks yet
                  <br />
                  Press T or click + Track
                </p>
              ) : (
                audio.state.tracks.map((track) => (
                  <TrackPanel
                    key={track.getId()}
                    track={track}
                    isSelected={selectedTrackId === track.getId()}
                    onSelect={() => setSelectedTrackId(track.getId())}
                    onRemove={() => {
                      audio.removeTrack(track.getId());
                      if (selectedTrackId === track.getId()) {
                        setSelectedTrackId(null);
                      }
                    }}
                    peakLevel={peakLevels.get(track.getId()) || -Infinity}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center - Transport & Timeline */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <TransportControls
            isPlaying={audio.state.isPlaying}
            isRecording={audio.state.isRecording}
            currentTime={audio.state.currentTime}
            duration={audio.state.duration}
            onPlay={audio.play}
            onPause={audio.pause}
            onStop={audio.stop}
            onRecord={() => {
              if (audio.state.isRecording) {
                audio.stopRecording();
              } else {
                audio.startRecording();
              }
            }}
            onSeek={audio.seek}
          />

          {/* Timeline/Clips Area */}
          <div className="flex-1 bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-auto">
            {audio.state.tracks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <p className="text-lg mb-4">No tracks yet</p>
                  <p className="text-sm text-gray-600">
                    Add a track to start recording or arranging
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {audio.state.tracks.map((track) => (
                  <div
                    key={track.getId()}
                    className={`h-24 bg-gray-900 border rounded cursor-pointer transition-colors ${
                      selectedTrackId === track.getId()
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedTrackId(track.getId())}
                  >
                    <div className="h-full flex items-center px-4 text-sm text-gray-500">
                      Drop audio clips here
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Master & Metering */}
        <div className="w-72 flex flex-col gap-4 overflow-y-auto">
          {meterReading && (
            <MasterMixer
              masterVolume={audio.state.masterVolume}
              peakLevel={meterReading.peak}
              rmsLevel={meterReading.rms}
              lufsLevel={meterReading.lufs}
              onVolumeChange={audio.setMasterVolume}
            />
          )}

          {/* Settings Panel */}
          <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-4">Settings</h3>
            <div className="space-y-3 text-xs text-gray-400">
              <div>
                <p>Sample Rate: {(audio.state.tracks[0]?.getOutputNode().context.sampleRate || 48000) / 1000} kHz</p>
              </div>
              <div>
                <p>Recording: {audio.state.isRecording ? '● Recording' : '○ Ready'}</p>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">
                  Space: Play • Shift+Space: Stop • R: Record • T: Add Track • Delete: Remove
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
