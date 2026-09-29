'use client';

/**
 * DAW Integration Example
 * Complete working example of Sound Lab DAW core components
 *
 * This component demonstrates:
 * - Integrating Timeline, Track, ClipEditor, TransportControl, and Mixer
 * - State management for multi-track project
 * - Clip management and playback
 * - Real-time level metering
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Timeline } from './Timeline';
import { Track } from './Track';
import { ClipEditor } from './ClipEditor';
import { TransportControl } from './TransportControl';
import { Mixer, type ChannelStrip } from './Mixer';

/**
 * Track data structure
 */
interface TrackData {
  id: string;
  name: string;
  volume: number;
  pan: number;
  isMuted: boolean;
  isSoloed: boolean;
  isArmed: boolean;
  peakLevel: number;
  clips: Array<{
    id: string;
    name: string;
    audioBuffer: AudioBuffer;
    startTime: number;
    duration: number;
    displayStart: number;
    displayEnd: number;
    fadeIn: number;
    fadeOut: number;
    type: 'recorded' | 'generated';
  }>;
}

/**
 * DAW Example Component
 */
export function DAWExample() {
  // Project state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [duration, setDuration] = useState(120); // 2 minutes
  const [bpm, setBpm] = useState(120);
  const [zoom, setZoom] = useState(2);
  const [scrollX, setScrollX] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(60);
  const [isClickEnabled, setIsClickEnabled] = useState(false);
  const [clickVolume, setClickVolume] = useState(0.8);

  // Tracks state
  const [tracks, setTracks] = useState<TrackData[]>([
    {
      id: 'track-1',
      name: 'Drums',
      volume: 1,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      isArmed: false,
      peakLevel: -12,
      clips: [],
    },
    {
      id: 'track-2',
      name: 'Bass',
      volume: 0.9,
      pan: -0.1,
      isMuted: false,
      isSoloed: false,
      isArmed: false,
      peakLevel: -10,
      clips: [],
    },
    {
      id: 'track-3',
      name: 'Vocals',
      volume: 1.1,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      isArmed: false,
      peakLevel: -8,
      clips: [],
    },
  ]);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(1);
  const [masterPeakLevel, setMasterPeakLevel] = useState(-6);

  const audioContextRef = useRef<AudioContext | null>(null);

  /**
   * Initialize audio context
   */
  useEffect(() => {
    if (!audioContextRef.current) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
    }

    return () => {
      // Don't close audio context - keep it alive for playback
    };
  }, []);

  /**
   * Handle playback animation loop
   */
  useEffect(() => {
    if (!isPlaying) return;

    const startTime = Date.now();
    const startPosition = playheadPosition;

    const tick = () => {
      const elapsed = (Date.now() - startTime) / 1000; // in seconds
      let newPosition = startPosition + elapsed;

      // Handle loop
      if (isLooping && loopEnd) {
        if (newPosition >= loopEnd) {
          newPosition = loopStart + (newPosition - loopEnd);
        }
      } else if (newPosition >= duration) {
        setIsPlaying(false);
        setPlayheadPosition(0);
        return;
      }

      setPlayheadPosition(newPosition);
      requestAnimationFrame(tick);
    };

    const animationId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, playheadPosition, duration, isLooping, loopStart, loopEnd]);

  /**
   * Update track volume
   */
  const handleTrackVolumeChange = useCallback((trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, volume } : track))
    );
  }, []);

  /**
   * Update track pan
   */
  const handleTrackPanChange = useCallback((trackId: string, pan: number) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, pan } : track))
    );
  }, []);

  /**
   * Toggle track mute
   */
  const handleTrackMuteToggle = useCallback((trackId: string, muted: boolean) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, isMuted: muted } : track))
    );
  }, []);

  /**
   * Toggle track solo
   */
  const handleTrackSoloToggle = useCallback((trackId: string, soloed: boolean) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, isSoloed: soloed } : track))
    );
  }, []);

  /**
   * Toggle track record arm
   */
  const handleTrackArmToggle = useCallback((trackId: string, armed: boolean) => {
    setTracks((prev) =>
      prev.map((track) => (track.id === trackId ? { ...track, isArmed: armed } : track))
    );
  }, []);

  /**
   * Delete track
   */
  const handleTrackDelete = useCallback((trackId: string) => {
    setTracks((prev) => prev.filter((track) => track.id !== trackId));
    if (selectedTrackId === trackId) {
      setSelectedTrackId(null);
    }
  }, [selectedTrackId]);

  /**
   * Add new track
   */
  const handleAddTrack = useCallback(() => {
    const newTrack: TrackData = {
      id: `track-${Date.now()}`,
      name: `Track ${tracks.length + 1}`,
      volume: 1,
      pan: 0,
      isMuted: false,
      isSoloed: false,
      isArmed: false,
      peakLevel: -20,
      clips: [],
    };
    setTracks((prev) => [...prev, newTrack]);
  }, [tracks.length]);

  /**
   * Pixels per second based on zoom and sample rate
   */
  const pxPerSecond = 50 * zoom;

  /**
   * Get channel strips for mixer
   */
  const mixerChannels: ChannelStrip[] = tracks.map((track) => ({
    id: track.id,
    name: track.name,
    volume: track.volume,
    pan: track.pan,
    isMuted: track.isMuted,
    isSoloed: track.isSoloed,
    peakLevel: track.peakLevel,
  }));

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-white">Sound Lab DAW</h1>
        <p className="text-sm text-gray-400">Professional multi-track audio editing</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden p-4">
        {/* Left Sidebar - Track List */}
        <div className="flex-shrink-0 w-48 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto">
          <h2 className="text-sm font-bold text-white mb-3">Tracks ({tracks.length})</h2>

          <div className="space-y-2 mb-3">
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedTrackId === track.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="font-semibold truncate">{track.name}</div>
                <div className="text-xs text-gray-400">Vol: {(track.volume * 100).toFixed(0)}%</div>
              </button>
            ))}
          </div>

          <button
            onClick={handleAddTrack}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors"
          >
            + Add Track
          </button>
        </div>

        {/* Center - Timeline and Tracks */}
        <div className="flex-1 flex flex-col bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          {/* Timeline */}
          <Timeline
            duration={duration}
            playheadPosition={playheadPosition}
            pxPerSecond={pxPerSecond}
            zoom={zoom}
            scrollX={scrollX}
            bpm={bpm}
            isLooping={isLooping}
            loopStart={loopStart}
            loopEnd={loopEnd}
            onPlayheadChange={setPlayheadPosition}
            onZoomChange={setZoom}
            onScrollChange={setScrollX}
            onLoopChange={(enabled, start, end) => {
              setIsLooping(enabled);
              if (start !== undefined) setLoopStart(start);
              if (end !== undefined) setLoopEnd(end);
            }}
          >
            {/* Track Lanes */}
            <div className="flex">
              {tracks.map((track) => (
                <Track
                  key={track.id}
                  id={track.id}
                  name={track.name}
                  index={tracks.indexOf(track)}
                  volume={track.volume}
                  pan={track.pan}
                  isMuted={track.isMuted}
                  isSoloed={track.isSoloed}
                  isArmed={track.isArmed}
                  peakLevel={track.peakLevel}
                  isSelected={selectedTrackId === track.id}
                  onVolumeChange={(vol) => handleTrackVolumeChange(track.id, vol)}
                  onPanChange={(pan) => handleTrackPanChange(track.id, pan)}
                  onMuteToggle={(muted) => handleTrackMuteToggle(track.id, muted)}
                  onSoloToggle={(soloed) => handleTrackSoloToggle(track.id, soloed)}
                  onArmToggle={(armed) => handleTrackArmToggle(track.id, armed)}
                  onSelect={() => setSelectedTrackId(track.id)}
                  onDelete={() => handleTrackDelete(track.id)}
                  onNameChange={(name) => {
                    setTracks((prev) =>
                      prev.map((t) => (t.id === track.id ? { ...t, name } : t))
                    );
                  }}
                >
                  {/* Clips in this track */}
                  <div className="relative w-full h-full">
                    {track.clips.map((clip) => (
                      <ClipEditor
                        key={clip.id}
                        id={clip.id}
                        trackId={track.id}
                        name={clip.name}
                        audioBuffer={clip.audioBuffer}
                        type={clip.type}
                        startTime={clip.startTime}
                        duration={clip.duration}
                        displayStart={clip.displayStart}
                        displayEnd={clip.displayEnd}
                        fadeIn={clip.fadeIn}
                        fadeOut={clip.fadeOut}
                        isSelected={selectedClipId === clip.id}
                        pxPerSecond={pxPerSecond}
                        onSelect={() => setSelectedClipId(clip.id)}
                        onMove={(startTime) => {
                          setTracks((prev) =>
                            prev.map((t) =>
                              t.id === track.id
                                ? {
                                    ...t,
                                    clips: t.clips.map((c) =>
                                      c.id === clip.id ? { ...c, startTime } : c
                                    ),
                                  }
                                : t
                            )
                          );
                        }}
                      />
                    ))}
                  </div>
                </Track>
              ))}
            </div>
          </Timeline>

          {/* Transport Control */}
          <TransportControl
            isPlaying={isPlaying}
            playheadPosition={playheadPosition}
            duration={duration}
            bpm={bpm}
            isLooping={isLooping}
            loopStart={loopStart}
            loopEnd={loopEnd}
            isClickEnabled={isClickEnabled}
            clickVolume={clickVolume}
            onPlayToggle={setIsPlaying}
            onStop={() => {
              setIsPlaying(false);
              setPlayheadPosition(0);
            }}
            onBpmChange={setBpm}
            onLoopToggle={setIsLooping}
            onLoopStartChange={setLoopStart}
            onLoopEndChange={setLoopEnd}
            onClickToggle={setIsClickEnabled}
            onClickVolumeChange={setClickVolume}
          />
        </div>

        {/* Right Sidebar - Mixer */}
        <div className="flex-shrink-0 w-96 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
          <Mixer
            channels={mixerChannels}
            masterVolume={masterVolume}
            masterPeakLevel={masterPeakLevel}
            onChannelVolumeChange={handleTrackVolumeChange}
            onChannelPanChange={handleTrackPanChange}
            onChannelMuteToggle={handleTrackMuteToggle}
            onChannelSoloToggle={handleTrackSoloToggle}
            onChannelSelect={setSelectedTrackId}
            onMasterVolumeChange={setMasterVolume}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-2 flex justify-between items-center text-xs text-gray-400">
        <div>
          {isPlaying ? '▶ Playing' : '⏸ Stopped'} · {selectedTrackId ? `Track: ${tracks.find((t) => t.id === selectedTrackId)?.name}` : 'No track selected'}
        </div>
        <div>
          {zoom.toFixed(1)}x zoom · {bpm} BPM · {(duration / 60).toFixed(1)}m duration
        </div>
      </div>
    </div>
  );
}
