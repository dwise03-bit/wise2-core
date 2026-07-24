'use client';

import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useAudioMeter } from '@/hooks/audio/useAudioMeter';
import { SegmentedMeter } from '@/components/Shared/Meters/SegmentedMeter';
import { ClipTrack } from '@/components/Shared';
import { Icons } from '@/components/Icons';
import type { ClipData } from '@/hooks/useClips';

interface Track {
  id: string;
  name: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  peak: number;
}

export default function SoundLabPage() {
  const { isInitialized, createTrack, setTrackVolume, setTrackMute, startPlayback, stopPlayback, audioLevels } =
    useAudioEngine();
  const { data: meterData, controls: meterControls } = useAudioMeter({
    updateFrequency: 50,
  });

  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'Mic 1', volume: 0.8, muted: false, solo: false, peak: -60 },
  ]);
  const [clips, setClips] = useState<ClipData[]>([
    {
      id: 'clip-1',
      trackId: '1',
      name: 'Intro',
      audioBuffer: null as any,
      startTime: 0,
      duration: 3,
      displayStart: 0,
      displayEnd: 3,
      fadeIn: 0.5,
      fadeOut: 0.5,
      isSelected: false,
    },
    {
      id: 'clip-2',
      trackId: '1',
      name: 'Verse',
      audioBuffer: null as any,
      startTime: 3,
      duration: 4,
      displayStart: 3,
      displayEnd: 7,
      fadeIn: 0.1,
      fadeOut: 0.1,
      isSelected: false,
    },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [zoom, setZoom] = useState(50); // pixels per second
  const [playheadTime, setPlayheadTime] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const playheadIntervalRef = useRef<NodeJS.Timeout>();

  // Get clips for first track
  const trackClips = useMemo(() => clips.filter((c) => c.trackId === '1'), [clips]);

  // Add new track
  const handleAddTrack = useCallback(() => {
    const newTrackId = String(tracks.length + 1);
    createTrack(newTrackId);
    setTracks((prev) => [
      ...prev,
      {
        id: newTrackId,
        name: `Track ${tracks.length + 1}`,
        volume: 0.8,
        muted: false,
        solo: false,
        peak: -60,
      },
    ]);
  }, [tracks.length, createTrack]);

  // Toggle track mute
  const handleTrackMute = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          setTrackMute(trackId, !t.muted);
          return { ...t, muted: !t.muted };
        }
        return t;
      })
    );
  }, [setTrackMute]);

  // Set track volume
  const handleTrackVolume = useCallback((trackId: string, volume: number) => {
    setTrackVolume(trackId, volume);
    setTracks((prev) => prev.map((t) => (t.id === trackId ? { ...t, volume } : t)));
  }, [setTrackVolume]);

  // Play/Pause
  const handlePlayPause = useCallback(() => {
    if (!isInitialized) return;

    if (isPlaying) {
      stopPlayback(tracks.map((t) => t.id));
      if (playheadIntervalRef.current) {
        clearInterval(playheadIntervalRef.current);
      }
      setIsPlaying(false);
    } else {
      startPlayback(tracks.map((t) => t.id));
      setIsPlaying(true);

      playheadIntervalRef.current = setInterval(() => {
        setPlayheadTime((prev) => prev + 0.033); // 30ms increment
      }, 33);
    }
  }, [isPlaying, tracks, isInitialized, startPlayback, stopPlayback]);

  // Stop playback
  const handleStop = useCallback(() => {
    stopPlayback(tracks.map((t) => t.id));
    if (playheadIntervalRef.current) {
      clearInterval(playheadIntervalRef.current);
    }
    setIsPlaying(false);
    setPlayheadTime(0);
  }, [tracks, stopPlayback]);

  React.useEffect(() => {
    return () => {
      if (playheadIntervalRef.current) {
        clearInterval(playheadIntervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: '"Rajdhani", sans-serif' }}>
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#39FF14', fontWeight: 900 }}>
            <span style={{ display: 'inline-block', marginRight: '10px' }}>
              <Icons.Activity size={28} />
            </span>
            SOUND LAB
          </h1>
          <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '12px' }}>Professional audio production</p>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {isInitialized ? (
            <span style={{ color: '#2CD588' }}>✓ Audio Ready</span>
          ) : (
            <span style={{ color: '#FF5535' }}>○ Initializing...</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* Master Meter Panel */}
        <div
          style={{
            width: '120px',
            borderRight: '1px solid rgba(57, 255, 20, 0.1)',
            padding: '20px 10px',
            overflowY: 'auto',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8))',
          }}
        >
          <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', marginBottom: '12px' }}>Master</div>
          <div style={{ marginBottom: '20px' }}>
            <SegmentedMeter peakLevel={meterData?.master || -60} size="small" />
          </div>

          {/* Master Volume */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '6px' }}>Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: '#39FF14',
              }}
            />
            <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
              {Math.round(masterVolume * 100)}%
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Transport Controls */}
          <div
            style={{
              padding: '15px 20px',
              borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.4))',
            }}
          >
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              style={{
                background: isPlaying ? '#39FF14' : 'rgba(57, 255, 20, 0.2)',
                color: isPlaying ? '#000' : '#39FF14',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#39FF14';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isPlaying ? '#39FF14' : 'rgba(57, 255, 20, 0.2)';
                e.currentTarget.style.color = isPlaying ? '#000' : '#39FF14';
              }}
            >
              {isPlaying ? <Icons.Pause size={16} /> : <Icons.Play size={16} />}
              {isPlaying ? 'Playing' : 'Play'}
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              style={{
                background: 'rgba(255, 85, 53, 0.2)',
                color: '#FF5535',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                transition: 'all 0.2s',
              }}
            >
              <Icons.Stop size={16} />
            </button>

            {/* Time Display */}
            <div style={{ flex: 1, marginLeft: '20px' }}>
              <div
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '14px',
                  color: '#39FF14',
                  fontWeight: 600,
                }}
              >
                {Math.floor(playheadTime / 60)}:{(playheadTime % 60).toFixed(2).padStart(5, '0')}
              </div>
            </div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '20px' }}>
              <button
                onClick={() => setZoom(Math.max(10, zoom - 10))}
                style={{
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                  color: '#39FF14',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                −
              </button>
              <span style={{ fontSize: '10px', color: '#666', minWidth: '40px', textAlign: 'center' }}>
                {zoom}px
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                style={{
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                  color: '#39FF14',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Mixer Tracks */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              gap: '12px',
              padding: '20px',
              overflowX: 'auto',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(10,10,10,0.8))',
            }}
          >
            {tracks.map((track) => (
              <div
                key={track.id}
                style={{
                  minWidth: '140px',
                  background: 'linear-gradient(180deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95))',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Track Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, flex: 1 }}>{track.name}</span>
                  <button
                    onClick={() => handleTrackMute(track.id)}
                    style={{
                      background: track.muted ? '#FF5535' : 'rgba(57, 255, 20, 0.1)',
                      color: track.muted ? '#fff' : '#888',
                      border: 'none',
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                    }}
                  >
                    <Icons.Mute size={12} />
                  </button>
                </div>

                {/* Meter */}
                <div>
                  <SegmentedMeter peakLevel={audioLevels[track.id]?.peak || -60} size="small" />
                </div>

                {/* Peak Level */}
                <div style={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                  {(audioLevels[track.id]?.peak || -60).toFixed(1)} dB
                </div>

                {/* Volume Slider */}
                <div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume}
                    onChange={(e) => handleTrackVolume(track.id, parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      accentColor: '#39FF14',
                    }}
                  />
                  <div style={{ fontSize: '8px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
                    {Math.round(track.volume * 100)}%
                  </div>
                </div>
              </div>
            ))}

            {/* Add Track Button */}
            <div
              style={{
                minWidth: '140px',
                background: 'rgba(57, 255, 20, 0.05)',
                border: '1px dashed rgba(57, 255, 20, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={handleAddTrack}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(57, 255, 20, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)';
              }}
            >
              <span style={{ fontSize: '24px', color: '#39FF14' }}>+</span>
            </div>
          </div>

          {/* Timeline Area with Clips */}
          <div
            style={{
              height: '240px',
              borderTop: '1px solid rgba(57, 255, 20, 0.1)',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: '10px', color: '#666', padding: '12px 20px 0 20px' }}>
              TIMELINE (Phase 2.1 - Clips Visualization)
            </div>

            {/* ClipTrack Component */}
            <div style={{ flex: 1, position: 'relative', overflow: 'auto', borderTop: '1px solid rgba(57, 255, 20, 0.1)' }}>
              <ClipTrack
                clips={trackClips}
                pxPerSecond={zoom}
                height={180}
                onClipSelect={setSelectedClipId}
                selectedClipId={selectedClipId || undefined}
              />

              {/* Playhead Overlay */}
              <div
                style={{
                  position: 'fixed',
                  left: `${(playheadTime * zoom) % 800 + 120}px`,
                  top: 'calc(100vh - 240px)',
                  width: '2px',
                  height: '180px',
                  background: '#39FF14',
                  boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)',
                  pointerEvents: 'none',
                  zIndex: 10,
                }}
              />
            </div>

            {/* Clip Info */}
            {selectedClipId && trackClips.find((c) => c.id === selectedClipId) && (
              <div
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid rgba(57, 255, 20, 0.1)',
                  fontSize: '11px',
                  color: '#39FF14',
                  background: 'rgba(0,0,0,0.3)',
                }}
              >
                Selected: {trackClips.find((c) => c.id === selectedClipId)?.name} •{' '}
                {trackClips.find((c) => c.id === selectedClipId)?.duration.toFixed(2)}s
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
