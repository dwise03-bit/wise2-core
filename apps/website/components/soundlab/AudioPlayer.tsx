'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, AlertCircle } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  isActive: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const BAR_COUNT = 28;

function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

export function AudioPlayer({ src, isActive, onPlay, onPause }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);
  const [bars] = useState(() =>
    // Deterministic per-index pattern (not Math.random) so server and client
    // markup match exactly and avoid a hydration mismatch.
    Array.from({ length: BAR_COUNT }, (_, i) => {
      const wave = Math.sin(i * 0.9) * 0.5 + Math.sin(i * 2.3) * 0.3;
      return Math.round(45 + wave * 40);
    })
  );

  useEffect(() => {
    if (!isActive && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isActive]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isActive) {
      audio.pause();
      onPause();
    } else {
      audio.play().catch(() => setError(true));
      onPlay();
    }
  };

  return (
    <div>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1));
        }}
        onEnded={() => {
          onPause();
          setProgress(0);
          setCurrentTime(0);
        }}
        onError={() => setError(true)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={error}
          aria-label={isActive ? 'Pause sample' : 'Play sample'}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            error
              ? 'bg-white/5 text-gray-600 cursor-not-allowed'
              : isActive
              ? 'bg-[#9AFF00] text-black shadow-[0_0_16px_rgba(154,255,0,0.6)]'
              : 'bg-white/10 text-white hover:bg-[#9AFF00]/20 hover:text-[#9AFF00]'
          }`}
        >
          {error ? <AlertCircle size={16} /> : isActive ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <div className="flex-1 flex items-end gap-[2px] h-8">
          {bars.map((h, i) => {
            const filled = i / bars.length <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-sm transition-colors ${
                  filled ? 'bg-[#9AFF00]' : 'bg-white/15'
                } ${isActive ? 'animate-pulse' : ''}`}
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 0.04}s`,
                  animationDuration: '0.8s',
                }}
              />
            );
          })}
        </div>

        <span className="text-[10px] text-gray-500 tabular-nums w-8 text-right">
          {error ? '--:--' : isActive ? formatTime(currentTime) : formatTime(duration)}
        </span>
      </div>

      {error && (
        <p className="mt-2 text-[10px] text-gray-600">Sample audio unavailable in this preview.</p>
      )}
    </div>
  );
}
