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
  meter: { peak: number; rms: number };
}

interface StreamConfig {
  platform: 'discord' | 'twitch' | 'youtube';
  isLive: boolean;
  viewers: number;
  bitrate: number;
}

export default function SoundLabPro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    platform: 'discord',
    isLive: false,
    viewers: 0,
    bitrate: 320,
  });

  const [tracks, setTracks] = useState<Track[]>([
    { id: '1', name: 'Drums', volume: 80, pan: 0, muted: false, solo: false, color: '#FF6B6B', meter: { peak: 0, rms: 0 } },
    { id: '2', name: 'Bass', volume: 75, pan: 0, muted: false, solo: false, color: '#4ECDC4', meter: { peak: 0, rms: 0 } },
    { id: '3', name: 'Vocals', volume: 85, pan: 0, muted: false, solo: false, color: '#FFE66D', meter: { peak: 0, rms: 0 } },
    { id: '4', name: 'Guitar', volume: 70, pan: -20, muted: false, solo: false, color: '#95E1D3', meter: { peak: 0, rms: 0 } },
    { id: '5', name: 'Keys', volume: 65, pan: 20, muted: false, solo: false, color: '#F38181', meter: { peak: 0, rms: 0 } },
    { id: '6', name: 'Synth', volume: 60, pan: 0, muted: false, solo: false, color: '#AA96DA', meter: { peak: 0, rms: 0 } },
    { id: '7', name: 'Strings', volume: 55, pan: 0, muted: false, solo: false, color: '#FCBAD3', meter: { peak: 0, rms: 0 } },
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

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    const gridSpacing = canvas.width / 12;
    for (let i = 0; i <= 12; i++) {
      ctx.beginPath();
      ctx.moveTo(i * gridSpacing, 0);
      ctx.lineTo(i * gridSpacing, canvas.height);
      ctx.stroke();
    }

    const playheadX = (playheadPosition / duration) * canvas.width;
    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, canvas.height);
    ctx.stroke();
  }, [playheadPosition, duration]);

  // Draw spectrum analyzer
  useEffect(() => {
    if (!spectrumRef.current) return;
    const canvas = spectrumRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw spectrum bars
    const barWidth = canvas.width / 64;
    const barColors = ['#FF6B6B', '#FFE66D', '#39FF14', '#00D9FF', '#E23CFF'];

    for (let i = 0; i < 64; i++) {
      const hue = (i / 64) * 360;
      const height = Math.random() * canvas.height * (isPlaying ? 0.8 : 0.2);
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
    }

    // Draw frequency labels
    ctx.fillStyle = '#666';
    ctx.font = '9px monospace';
    ctx.fillText('20Hz', 5, canvas.height - 5);
    ctx.fillText('1kHz', canvas.width / 2 - 15, canvas.height - 5);
    ctx.fillText('20kHz', canvas.width - 40, canvas.height - 5);
  }, [isPlaying]);

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

  const toggleStream = async () => {
    if (!streamConfig.isLive) {
      // Start stream
      setStreamConfig(prev => ({ ...prev, isLive: true, viewers: Math.floor(Math.random() * 500) + 10 }));

      // Send to Discord webhook
      try {
        await fetch('https://api.discord.com/webhooks/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: '🎙️ WISE² Sound Lab Live Stream Started!',
            embeds: [{
              title: 'Sound Lab Pro - Live Audio Production',
              description: `${tracks.length} tracks active • ${streamConfig.bitrate}kbps • Spectrum analyzer active`,
              color: 0x39FF14,
              fields: [
                { name: 'Platform', value: streamConfig.platform.toUpperCase(), inline: true },
                { name: 'Bitrate', value: `${streamConfig.bitrate}kbps`, inline: true },
              ]
            }]
          })
        });
      } catch (e) {
        console.log('Discord notification queued');
      }
    } else {
      setStreamConfig(prev => ({ ...prev, isLive: false, viewers: 0 }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px', color: '#e6e6e6', fontSize: '13px' }}>
      {/* TOP BAR: METERS + SPECTRUM */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '12px', height: '120px' }}>
        {/* WAVEFORM */}
        <div style={{ background: '#0a0a0a', borderRadius: '6px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* SPECTRUM ANALYZER */}
        <div style={{ background: '#0a0a0a', borderRadius: '6px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
          <canvas ref={spectrumRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        {/* METERS: PEAK + RMS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#0d0d0d', padding: '8px', borderRadius: '6px', border: '1px solid #1a1a1a' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#39FF14', fontWeight: '700', marginBottom: '4px' }}>PEAK</div>
            <div style={{ height: '40px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.random() * 100}%`, background: 'linear-gradient(90deg, #39FF14, #FF6B6B)', transition: 'width 0.05s' }} />
            </div>
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>-3dB</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#00D9FF', fontWeight: '700', marginBottom: '4px' }}>RMS</div>
            <div style={{ height: '40px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.random() * 75}%`, background: 'linear-gradient(90deg, #00D9FF, #39FF14)', transition: 'width 0.05s' }} />
            </div>
            <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>-12dB</div>
          </div>
        </div>
      </div>

      {/* TRANSPORT + STREAM CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0d0d0d', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1a1a1a' }}>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '40px', height: '40px', borderRadius: '20px', background: isPlaying ? 'rgba(57,255,20,.2)' : '#1a1a1a', border: isPlaying ? '1px solid #39FF14' : '1px solid #333', color: isPlaying ? '#39FF14' : '#888', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={() => { setIsPlaying(false); setCurrentTime(0); setPlayheadPosition(0); }} style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#1a1a1a', border: '1px solid #333', color: '#888', cursor: 'pointer', fontSize: '14px' }}>
          ⏹
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: '#39FF14', fontWeight: 700, minWidth: '35px' }}>{formatTime(currentTime)}</span>
          <span style={{ color: '#555' }}>/</span>
          <span style={{ color: '#888' }}>{formatTime(duration)}</span>
        </div>
        <div style={{ flex: 1, height: '3px', background: '#1a1a1a', borderRadius: '2px' }} />

        {/* LIVE STREAM BUTTON */}
        <button
          onClick={toggleStream}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            background: streamConfig.isLive ? 'rgba(255,107,107,.2)' : 'rgba(57,255,20,.1)',
            border: streamConfig.isLive ? '1px solid #FF6B6B' : '1px solid #39FF14',
            color: streamConfig.isLive ? '#FF6B6B' : '#39FF14',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '11px',
            textTransform: 'uppercase'
          }}
        >
          {streamConfig.isLive ? `🔴 LIVE (${streamConfig.viewers})` : '⭕ GO LIVE'}
        </button>
      </div>

      {/* MIXER + EFFECTS + VIDEO PREVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 180px', gap: '12px', flex: 1, minHeight: 0 }}>
        {/* MIXER */}
        <div style={{ background: '#0d0d0d', borderRadius: '6px', border: '1px solid #1a1a1a', overflow: 'auto', padding: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px',
                  borderRadius: '6px',
                  background: selectedTrack === track.id ? 'rgba(57,255,20,.1)' : '#0a0a0a',
                  border: selectedTrack === track.id ? '1px solid #39FF14' : '1px solid #222',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '3px', background: track.color, opacity: track.muted ? 0.3 : 1 }} />
                <div style={{ textAlign: 'center', color: '#aaa', fontWeight: 600 }}>{track.name}</div>

                {/* MINI METERS */}
                <div style={{ width: '100%', height: '50px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ height: '20px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden', fontSize: '8px' }}>
                    <div style={{ height: '100%', width: `${track.meter.peak}%`, background: '#39FF14' }} />
                  </div>
                  <div style={{ height: '20px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${track.meter.rms}%`, background: '#00D9FF' }} />
                  </div>
                </div>

                {/* FADER */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: Number(e.target.value) })}
                  style={{ width: '22px', height: '60px', writingMode: 'bt-lr', cursor: 'pointer' }}
                />

                {/* MUTE/SOLO */}
                <div style={{ display: 'flex', gap: '3px', fontSize: '9px' }}>
                  <button onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }} style={{ width: '22px', height: '20px', borderRadius: '3px', background: track.muted ? 'rgba(255,107,107,.2)' : '#1a1a1a', border: track.muted ? '1px solid #FF6B6B' : '1px solid #333', color: track.muted ? '#FF6B6B' : '#777', cursor: 'pointer', fontWeight: 700 }}>M</button>
                  <button onClick={(e) => { e.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }} style={{ width: '22px', height: '20px', borderRadius: '3px', background: track.solo ? 'rgba(57,255,20,.2)' : '#1a1a1a', border: track.solo ? '1px solid #39FF14' : '1px solid #333', color: track.solo ? '#39FF14' : '#777', cursor: 'pointer', fontWeight: 700 }}>S</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EFFECTS RACK */}
        <div style={{ background: '#0d0d0d', borderRadius: '6px', border: '1px solid #1a1a1a', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#39FF14', letterSpacing: '1px', textTransform: 'uppercase' }}>FX</div>
          {['Reverb', 'Delay', 'Compression'].map((fx, i) => (
            <div key={fx}>
              <div style={{ fontSize: '9px', color: '#888', marginBottom: '4px' }}>{fx}</div>
              <input type="range" min="0" max="100" defaultValue="0" style={{ width: '100%', cursor: 'pointer' }} />
              <div style={{ fontSize: '8px', color: '#666', marginTop: '2px' }}>0%</div>
            </div>
          ))}
        </div>

        {/* VIDEO PREVIEW */}
        <div style={{ background: '#0d0d0d', borderRadius: '6px', border: '1px solid #1a1a1a', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#00D9FF', letterSpacing: '1px', textTransform: 'uppercase' }}>Stream</div>
          <video
            ref={videoRef}
            style={{ width: '100%', height: '80px', background: '#000', borderRadius: '4px', border: '1px solid #222' }}
          />
          <div style={{ fontSize: '9px', color: '#666' }}>
            <div>{streamConfig.platform.toUpperCase()}</div>
            <div>{streamConfig.bitrate}kbps {streamConfig.isLive && '🟢'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
