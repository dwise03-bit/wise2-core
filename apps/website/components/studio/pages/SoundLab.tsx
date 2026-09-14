'use client';

import { useState, useRef, useEffect } from 'react';

interface Track {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

export default function SoundLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'Drums', volume: 80, pan: 0, muted: false, solo: false, color: '#FF6B6B' },
    { id: '2', name: 'Bass', volume: 75, pan: 0, muted: false, solo: false, color: '#4ECDC4' },
    { id: '3', name: 'Vocals', volume: 85, pan: 0, muted: false, solo: false, color: '#FFE66D' },
    { id: '4', name: 'Guitar', volume: 70, pan: -20, muted: false, solo: false, color: '#95E1D3' },
    { id: '5', name: 'Keys', volume: 65, pan: 20, muted: false, solo: false, color: '#F38181' },
    { id: '6', name: 'Synth', volume: 60, pan: 0, muted: false, solo: false, color: '#AA96DA' },
    { id: '7', name: 'Strings', volume: 55, pan: 0, muted: false, solo: false, color: '#FCBAD3' },
  ]);
  const [selectedTrack, setSelectedTrack] = useState('1');
  const [effects, setEffects] = useState({
    reverb: 0,
    delay: 0,
    compression: 0,
    eq: { low: 0, mid: 0, high: 0 },
  });

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    const gridSpacing = canvas.width / 12;
    for (let i = 0; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSpacing, 0);
      ctx.lineTo(i * gridSpacing, canvas.height);
      ctx.stroke();
    }

    // Playhead
    const playheadX = (playheadPosition / duration) * canvas.width;
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
  }, [playheadPosition, duration]);

  // Playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(t => {
          const newTime = t + 0.016;
          setPlayheadPosition(newTime);
          if (newTime >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 16);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedTrackData = tracks.find(t => t.id === selectedTrack);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', color: '#e6e6e6' }}>
      {/* WAVEFORM CANVAS */}
      <div style={{ flex: 1, background: '#0a0a0a', borderRadius: '8px', border: '1px solid #1a1a1a', overflow: 'hidden', position: 'relative' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }} />
      </div>

      {/* TRANSPORT CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#0d0d0d', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1a1a1a' }}>
        <button
          onClick={() => { setIsPlaying(!isPlaying); setCurrentTime(0); }}
          style={{
            width: '44px', height: '44px', borderRadius: '22px',
            background: isPlaying ? 'rgba(57,255,20,.2)' : '#1a1a1a',
            border: isPlaying ? '1px solid #39FF14' : '1px solid #333',
            color: isPlaying ? '#39FF14' : '#888',
            cursor: 'pointer', fontWeight: 700, fontSize: '16px'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={() => { setIsPlaying(false); setCurrentTime(0); setPlayheadPosition(0); }}
          style={{
            width: '44px', height: '44px', borderRadius: '22px',
            background: '#1a1a1a', border: '1px solid #333',
            color: '#888', cursor: 'pointer', fontSize: '16px'
          }}
        >
          ⏹
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <span style={{ color: '#39FF14', fontWeight: 700, minWidth: '40px' }}>{formatTime(currentTime)}</span>
          <span style={{ color: '#555' }}>/</span>
          <span style={{ color: '#888' }}>{formatTime(duration)}</span>
        </div>

        <div style={{ flex: 1, height: '4px', background: '#1a1a1a', borderRadius: '2px', cursor: 'pointer' }} />

        <button style={{ width: '44px', height: '44px', borderRadius: '22px', background: '#1a1a1a', border: '1px solid #333', color: '#888', cursor: 'pointer', fontSize: '14px' }}>
          🎙️
        </button>
      </div>

      {/* MIXER + EFFECTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px', height: '280px' }}>
        {/* MIXER */}
        <div style={{ background: '#0d0d0d', borderRadius: '8px', border: '1px solid #1a1a1a', overflow: 'auto', padding: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  padding: '12px', borderRadius: '8px',
                  background: selectedTrack === track.id ? 'rgba(57,255,20,.1)' : '#0a0a0a',
                  border: selectedTrack === track.id ? '1px solid #39FF14' : '1px solid #222',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: track.color, opacity: track.muted ? 0.3 : 1 }} />
                <div style={{ fontSize: '11px', textAlign: 'center', color: '#aaa', fontWeight: 600 }}>{track.name}</div>

                {/* FADER */}
                <input
                  type="range" min="0" max="100" value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) })}
                  style={{ width: '80px', height: '24px', transform: 'rotate(-90deg)', cursor: 'pointer' }}
                />

                {/* MUTE / SOLO */}
                <div style={{ display: 'flex', gap: '4px', fontSize: '10px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}
                    style={{
                      width: '24px', height: '24px', borderRadius: '4px',
                      background: track.muted ? 'rgba(255,107,107,.2)' : '#1a1a1a',
                      border: track.muted ? '1px solid #FF6B6B' : '1px solid #333',
                      color: track.muted ? '#FF6B6B' : '#777',
                      cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    M
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }}
                    style={{
                      width: '24px', height: '24px', borderRadius: '4px',
                      background: track.solo ? 'rgba(57,255,20,.2)' : '#1a1a1a',
                      border: track.solo ? '1px solid #39FF14' : '1px solid #333',
                      color: track.solo ? '#39FF14' : '#777',
                      cursor: 'pointer', fontWeight: 700
                    }}
                  >
                    S
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EFFECTS RACK */}
        <div style={{ background: '#0d0d0d', borderRadius: '8px', border: '1px solid #1a1a1a', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#39FF14', letterSpacing: '1px', textTransform: 'uppercase' }}>Effects</div>

          <div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>Reverb</div>
            <input type="range" min="0" max="100" value={effects.reverb} onChange={(e) => setEffects({ ...effects, reverb: Number(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{effects.reverb}%</div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>Delay</div>
            <input type="range" min="0" max="100" value={effects.delay} onChange={(e) => setEffects({ ...effects, delay: Number(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{effects.delay}%</div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>Compression</div>
            <input type="range" min="0" max="100" value={effects.compression} onChange={(e) => setEffects({ ...effects, compression: Number(e.target.value) })} style={{ width: '100%', cursor: 'pointer' }} />
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>{effects.compression}%</div>
          </div>

          <div style={{ borderTop: '1px solid #222', paddingTop: '8px' }}>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>EQ Low</div>
            <input type="range" min="-12" max="12" value={effects.eq.low} onChange={(e) => setEffects({ ...effects, eq: { ...effects.eq, low: Number(e.target.value) } })} style={{ width: '100%', cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
