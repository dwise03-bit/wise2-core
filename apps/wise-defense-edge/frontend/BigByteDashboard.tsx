'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Radio, Zap, Volume2, Waves } from 'lucide-react';

interface IncidentData {
  id: string;
  headline: string;
  threatLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  approximateLocation: string;
  category: string;
  incidentType: string;
  confidence: number;
  timestamp: string;
}

interface SpectrumPoint {
  frequency: number;
  power_db: number;
}

interface DisplayState {
  state: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ALERT';
  timestamp: string;
  animation: {
    radar: string;
    spectrum: string;
    alerts: string;
    duration_ms: number;
  };
}

export default function BigByteDashboard() {
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  const [displayState, setDisplayState] = useState<DisplayState>({
    state: 'IDLE',
    timestamp: new Date().toISOString(),
    animation: { radar: 'pulse_slow', spectrum: 'idle', alerts: 'fade_in', duration_ms: 500 }
  });

  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [spectrumData, setSpectrumData] = useState<SpectrumPoint[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const radarAnimationRef = useRef(0);
  const spectrumAnimationRef = useRef(0);
  const pulsePhaseRef = useRef(0);

  // Animate crime radar
  const drawCrimeRadar = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 20;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw animated radar rings
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    for (let i = 1; i <= 5; i++) {
      const radius = (maxRadius / 5) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw sweeping radar beam
    const sweepAngle = (radarAnimationRef.current / 100) * Math.PI * 2;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(sweepAngle) * maxRadius,
      centerY + Math.sin(sweepAngle) * maxRadius
    );
    ctx.stroke();

    // Draw watch zone rings with pulsing effect
    const pulseScale = 0.8 + Math.sin(pulsePhaseRef.current / 20) * 0.2;

    // Inner zone (immediate area)
    ctx.strokeStyle = '#ffff00';
    ctx.globalAlpha = 0.4 * pulseScale;
    ctx.beginPath();
    ctx.arc(centerX, centerY, (maxRadius / 5) * 2 * pulseScale, 0, Math.PI * 2);
    ctx.stroke();

    // Outer zone (extended area)
    ctx.strokeStyle = '#ff6600';
    ctx.globalAlpha = 0.3 * (1 - pulseScale);
    ctx.beginPath();
    ctx.arc(centerX, centerY, (maxRadius / 5) * 4 * (1 - pulseScale + 0.8), 0, Math.PI * 2);
    ctx.stroke();

    // Draw incident markers with pulse
    ctx.globalAlpha = 1;
    incidents.slice(0, 5).forEach((incident, idx) => {
      // Simulate position on radar
      const angle = (idx / 5) * Math.PI * 2 + sweepAngle;
      const distance = ((incident.confidence / 100) * maxRadius) / 2;

      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Color based on threat level
      let color = '#00ff00';
      if (incident.threatLevel === 'ELEVATED') color = '#ffff00';
      if (incident.threatLevel === 'HIGH') color = '#ff6600';
      if (incident.threatLevel === 'CRITICAL') color = '#ff0000';

      // Pulsing marker
      const markerScale = 0.6 + Math.sin(pulsePhaseRef.current / 15 + idx) * 0.4;
      const markerSize = 8 * markerScale;

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8 * markerScale;
      ctx.fillRect(x - markerSize / 2, y - markerSize / 2, markerSize, markerSize);

      // Glow effect
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3 * markerScale;
      ctx.beginPath();
      ctx.arc(x, y, markerSize * 2, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw cross-hairs
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY);
    ctx.lineTo(centerX + 20, centerY);
    ctx.moveTo(centerX, centerY - 20);
    ctx.lineTo(centerX, centerY + 20);
    ctx.stroke();

    radarAnimationRef.current = (radarAnimationRef.current + 1) % 360;
  };

  // Animate spectrum waveform
  const drawSpectrum = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = '#1a3a3a';
    ctx.lineWidth = 1;

    for (let freq = 100; freq <= 1200; freq += 100) {
      const x = padding + ((freq - 88) / (1200 - 88)) * (width - padding * 2);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }

    for (let power = -100; power <= 0; power += 10) {
      const y = height - padding - ((power + 100) / 100) * (height - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Generate animated spectrum with wave motion
    if (spectrumData.length > 0) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;

      ctx.beginPath();
      spectrumData.forEach((point, idx) => {
        // Add wave animation
        const waveOffset = Math.sin((spectrumAnimationRef.current / 50) + (idx / spectrumData.length) * Math.PI * 2) * 10;
        const animatedPower = point.power_db + waveOffset;

        const x = padding + ((point.frequency - 88) / (1200 - 88)) * (width - padding * 2);
        const y = height - padding - ((animatedPower + 100) / 100) * (height - padding * 2);

        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Gradient fill under curve
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#00ff00';
      const lastPoint = spectrumData[spectrumData.length - 1];
      const lastX = padding + ((lastPoint.frequency - 88) / (1200 - 88)) * (width - padding * 2);
      ctx.lineTo(lastX, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.fill();
    }

    // Draw frequency labels
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    for (let freq = 100; freq <= 1200; freq += 200) {
      const x = padding + ((freq - 88) / (1200 - 88)) * (width - padding * 2);
      ctx.fillText(`${freq}M`, x, height - padding + 20);
    }

    ctx.textAlign = 'right';
    for (let power = -100; power <= 0; power += 20) {
      const y = height - padding - ((power + 100) / 100) * (height - padding * 2);
      ctx.fillText(`${power}dB`, padding - 10, y + 5);
    }

    spectrumAnimationRef.current = (spectrumAnimationRef.current + 1) % 100;
  };

  // Draw audio waveform
  const drawWaveform = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    // Draw waveform centerline
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw animated waveform based on audio level
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x += 4) {
      const t = (x / width) * Math.PI * 4 + (spectrumAnimationRef.current / 20);
      const amp = (audioLevel / 100) * (height / 2 - 10);
      const y = height / 2 + Math.sin(t) * amp * Math.cos(spectrumAnimationRef.current / 30);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw frequency bars
    ctx.fillStyle = '#00ff00';
    for (let i = 0; i < 8; i++) {
      const barHeight = (audioLevel / 100) * (height / 2);
      const x = (i / 8) * width;
      const y = height / 2 - barHeight;

      ctx.globalAlpha = 0.5 + (i / 8) * 0.5;
      ctx.fillRect(x + 2, y, width / 10 - 4, barHeight * 2);
    }
    ctx.globalAlpha = 1;
  };

  // Animation loop
  useEffect(() => {
    const animationId = setInterval(() => {
      pulsePhaseRef.current = (pulsePhaseRef.current + 1) % 360;

      if (radarCanvasRef.current) drawCrimeRadar(radarCanvasRef.current);
      if (spectrumCanvasRef.current) drawSpectrum(spectrumCanvasRef.current);
      if (waveformCanvasRef.current) drawWaveform(waveformCanvasRef.current);
    }, 50); // 20 FPS for smooth animation

    return () => clearInterval(animationId);
  }, [incidents, spectrumData, audioLevel]);

  // Fetch data
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('/api/incidents?limit=10');
        const data = await res.json();
        if (data.incidents) setIncidents(data.incidents);
      } catch (err) {
        console.error('Failed to fetch incidents:', err);
      }
    };

    const fetchSpectrum = async () => {
      try {
        const res = await fetch('/api/sdr/spectrum');
        const data = await res.json();
        if (data.spectrum) setSpectrumData(data.spectrum);
      } catch (err) {
        console.error('Failed to fetch spectrum:', err);
      }
    };

    const fetchState = async () => {
      try {
        const res = await fetch('/api/imp/state');
        const data = await res.json();
        if (data.display_state) {
          setDisplayState(data.display_state);
          setIsListening(data.display_state.state === 'LISTENING');
          setAudioLevel(data.audio_level || audioLevel);
        }
      } catch (err) {
        console.error('Failed to fetch state:', err);
      }
    };

    const incidentTimer = setInterval(fetchIncidents, 10000);
    const spectrumTimer = setInterval(fetchSpectrum, 10000);
    const stateTimer = setInterval(fetchState, 500);

    fetchIncidents();
    fetchSpectrum();
    fetchState();

    return () => {
      clearInterval(incidentTimer);
      clearInterval(spectrumTimer);
      clearInterval(stateTimer);
    };
  }, []);

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-blue-400';
      case 'ELEVATED': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden" style={{ fontFamily: 'monospace' }}>
      {/* Header */}
      <div className="p-4 border-b border-green-600/30 flex justify-between items-center bg-black/50">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-green-500 animate-pulse" />
          <div>
            <h1 className="text-2xl font-black tracking-widest text-green-400">BIG BYTE COMMAND CENTER</h1>
            <p className="text-xs text-gray-500">WISE DEFENSE - Always-On Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isListening && (
            <div className="flex items-center gap-2 animate-pulse">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-cyan-400 font-black">LISTENING</span>
            </div>
          )}

          <div className={`px-3 py-1 rounded border ${displayState.state === 'ALERT' ? 'border-red-500 bg-red-900/20' : 'border-green-600/30'}`}>
            <span className="text-xs font-mono uppercase">{displayState.state}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="p-4 h-[calc(100vh-80px)] grid grid-cols-3 gap-4">
        {/* Left: Crime Radar */}
        <div className="col-span-1 border border-green-600/30 rounded-lg bg-black/30 overflow-hidden">
          <div className="p-3 border-b border-green-600/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-black tracking-wider text-red-500">CRIME RADAR</h2>
          </div>
          <canvas
            ref={radarCanvasRef}
            width={400}
            height={400}
            className="w-full h-[calc(100%-40px)]"
          />
        </div>

        {/* Center: Spectrum Monitor */}
        <div className="col-span-1 border border-green-600/30 rounded-lg bg-black/30 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-green-600/20 flex items-center gap-2">
            <Waves className="w-4 h-4 text-green-500" />
            <h2 className="text-sm font-black tracking-wider text-green-500">SPECTRUM MONITOR</h2>
          </div>
          <canvas
            ref={spectrumCanvasRef}
            width={400}
            height={300}
            className="flex-1"
          />
          <div className="p-3 bg-black/50 border-t border-green-600/20 text-xs text-green-400">
            Signals: {spectrumData.length} | Peak: {Math.max(...spectrumData.map(s => s.power_db), -100).toFixed(1)} dB
          </div>
        </div>

        {/* Right: Alerts + Audio Waveform */}
        <div className="col-span-1 flex flex-col gap-4">
          {/* Waveform */}
          <div className="border border-green-600/30 rounded-lg bg-black/30 overflow-hidden flex-1">
            <div className="p-3 border-b border-green-600/20 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-black tracking-wider text-cyan-400">AUDIO STREAM</h2>
            </div>
            <canvas
              ref={waveformCanvasRef}
              width={300}
              height={150}
              className="w-full h-[calc(100%-40px)]"
            />
          </div>

          {/* Alert Stack */}
          <div className="border border-yellow-600/30 rounded-lg bg-black/30 overflow-hidden flex-1 flex flex-col">
            <div className="p-3 border-b border-yellow-600/20">
              <h2 className="text-sm font-black tracking-wider text-yellow-500">ACTIVE ALERTS</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {incidents.slice(0, 5).map((incident, idx) => (
                <div
                  key={incident.id}
                  className={`p-2 rounded text-xs border animate-slide-in ${
                    incident.threatLevel === 'CRITICAL'
                      ? 'border-red-600 bg-red-900/20'
                      : incident.threatLevel === 'HIGH'
                      ? 'border-orange-600 bg-orange-900/20'
                      : 'border-yellow-600 bg-yellow-900/20'
                  }`}
                  style={{
                    animationDelay: `${idx * 100}ms`
                  }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className={`font-black ${getThreatColor(incident.threatLevel)}`}>
                        {incident.threatLevel}
                      </p>
                      <p className="text-gray-300">{incident.headline}</p>
                      <p className="text-gray-500 text-xs">{incident.approximateLocation}</p>
                    </div>
                    <span className="text-gray-400">{incident.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
