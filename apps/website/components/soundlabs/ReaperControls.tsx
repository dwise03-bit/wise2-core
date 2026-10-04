'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, Circle } from 'lucide-react';
import { useSoundLabsProduction } from '@/lib/hooks/useSoundLabsProduction';

const TRACKS = ['Master', 'Drums', 'Bass', 'Melody'];
const EFFECTS = ['Reverb', 'Delay', 'Compression', 'EQ'];
const SEED_LEVELS = [58, 42, 65, 30]; // deterministic initial mixer levels

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ReaperControls() {
  const { reaperTransport, isLoading } = useSoundLabsProduction();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [position, setPosition] = useState(0);
  const [levels, setLevels] = useState<number[]>(SEED_LEVELS);
  const rafRef = useRef<number | null>(null);

  // Animate mixer meters only while transport is active (and motion is allowed).
  useEffect(() => {
    if (!isPlaying || prefersReducedMotion()) return;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 120) {
        last = t;
        setLevels((prev) =>
          prev.map((v, i) => {
            const target = 25 + 60 * Math.abs(Math.sin(t / 600 + i * 1.3));
            return Math.round(v + (target - v) * 0.4);
          })
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  const handleTransport = async (action: 'play' | 'stop' | 'record' | 'pause') => {
    const success = await reaperTransport(action);
    if (success) {
      if (action === 'play') setIsPlaying(true);
      if (action === 'stop' || action === 'pause') setIsPlaying(false);
      if (action === 'record') setIsRecording((v) => !v);
    }
  };

  return (
    <div className="space-y-6">
      {/* Transport Controls */}
      <div className="p-8 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-8">REAPER Transport Control</h3>

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#00D9FF]/60 text-sm">Playhead</span>
            <span className="text-white font-semibold font-mono tabular-nums">
              {Math.floor(position / 60)}:{String(position % 60).padStart(2, '0')}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3600"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            aria-label="Playhead position"
            className="w-full accent-[#00D9FF]"
          />
        </div>

        {/* Transport Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => handleTransport('play')}
            disabled={isLoading || isRecording}
            aria-label="Play"
            aria-pressed={isPlaying}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/60 ${
              isPlaying
                ? 'bg-gradient-to-br from-[#00D9FF] to-[#00FF7F] text-[#050607] shadow-lg shadow-[#00D9FF]/40'
                : 'bg-[#050607] border-2 border-[#00D9FF]/50 text-[#00D9FF] hover:border-[#00D9FF]'
            }`}
          >
            <Play size={24} fill="currentColor" strokeWidth={0} />
          </button>

          <button
            type="button"
            onClick={() => handleTransport('pause')}
            disabled={isLoading || !isPlaying}
            aria-label="Pause"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-[#050607] border-2 border-[#00D9FF]/30 text-[#00D9FF] hover:border-[#00D9FF] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/60"
          >
            <Pause size={22} fill="currentColor" strokeWidth={0} />
          </button>

          <button
            type="button"
            onClick={() => handleTransport('stop')}
            disabled={isLoading}
            aria-label="Stop"
            className="flex items-center justify-center w-16 h-16 rounded-full bg-[#050607] border-2 border-[#00D9FF]/30 text-[#00D9FF] hover:border-[#00D9FF] transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/60"
          >
            <Square size={20} fill="currentColor" strokeWidth={0} />
          </button>

          <button
            type="button"
            onClick={() => handleTransport('record')}
            disabled={isLoading}
            aria-label={isRecording ? 'Stop recording' : 'Record'}
            aria-pressed={isRecording}
            className={`flex items-center justify-center w-16 h-16 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 ${
              isRecording
                ? 'bg-red-500/80 text-white shadow-lg shadow-red-500/50 motion-safe:animate-pulse'
                : 'bg-[#050607] border-2 border-red-500/30 text-red-400 hover:border-red-500'
            }`}
          >
            <Circle size={22} fill="currentColor" strokeWidth={0} />
          </button>
        </div>

        {/* Mixer Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TRACKS.map((track, i) => (
            <div key={track} className="p-3 rounded-lg bg-[#050607] border border-[#00D9FF]/10">
              <p className="text-xs text-[#00D9FF]/60 mb-2">{track}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-4 bg-[#0a0a0c] rounded flex items-center overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00D9FF] to-[#00FF7F]"
                    style={{ width: `${isPlaying ? levels[i] : 0}%`, transition: 'width 120ms linear' }}
                  />
                </div>
                <span className="text-xs text-white font-semibold w-10 text-right font-mono tabular-nums">
                  {isPlaying ? Math.round(-40 + (levels[i] / 100) * 40) : '-∞'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effects Rack */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h4 className="text-lg font-semibold text-white mb-4">Effects Rack</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {EFFECTS.map((effect) => (
            <div
              key={effect}
              className="p-4 rounded-lg bg-[#050607] border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">{effect}</span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#00FF7F]/15 text-[#00FF7F]">
                  ON
                </span>
              </div>
              <div className="h-1 bg-[#0a0a0c] rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-[#00D9FF] to-[#00FF7F]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
