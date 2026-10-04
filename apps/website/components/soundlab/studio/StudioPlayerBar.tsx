'use client';

import { useMemo } from 'react';
import { Heart, Shuffle, SkipBack, SkipForward, Play, Pause, Repeat, Volume2, ListMusic, Maximize2 } from 'lucide-react';
import { useStudioPlayer } from './StudioPlayerContext';

function fmt(ratio: number, durationStr: string) {
  const [m, s] = durationStr.split(':').map(Number);
  const total = m * 60 + s;
  const cur = Math.round(ratio * total);
  return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, '0')}`;
}

export function StudioPlayerBar() {
  const { current, isPlaying, progress, toggle, next, prev, seek, queue } = useStudioPlayer();

  const track = current ?? queue[0] ?? null;
  const upNext = useMemo(() => {
    if (!track || !queue.length) return null;
    const idx = queue.findIndex((t) => t.id === track.id);
    return queue[(idx + 1) % queue.length] ?? null;
  }, [track, queue]);

  if (!track) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 h-20 bg-[#02050A]/92 backdrop-blur-xl border-t border-[#24C8FF]/14">
      <div className="max-w-[1600px] mx-auto h-full px-4 flex items-center gap-4">
        {/* now playing */}
        <div className="flex items-center gap-3 w-[22%] min-w-0">
          <div className="w-12 h-12 rounded-lg grid place-items-center shrink-0" style={{ background: 'linear-gradient(135deg,#0a2a4d,#02050A)' }}>
            <span className="text-sm font-black text-[#24C8FF]">W<sup className="text-[0.5em]">2</sup></span>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-black text-[#F7FBFF] truncate">{track.title}</p>
            <p className="text-[11px] text-[#8D9BAC] truncate">{track.artist}</p>
          </div>
          <button className="text-[#8D9BAC] hover:text-[#24C8FF] transition-colors shrink-0" aria-label="Like">
            <Heart size={16} />
          </button>
        </div>

        {/* transport + scrubber */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4">
            <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="Shuffle"><Shuffle size={16} /></button>
            <button onClick={prev} className="text-[#C7D4E2] hover:text-[#F7FBFF] transition-colors" aria-label="Previous"><SkipBack size={18} fill="currentColor" strokeWidth={0} /></button>
            <button
              onClick={toggle}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 grid place-items-center rounded-full bg-gradient-to-br from-[#008CFF] to-[#24C8FF] text-[#02050A] shadow-[0_0_18px_rgba(0,140,255,0.45)] hover:scale-105 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" strokeWidth={0} /> : <Play size={18} fill="currentColor" strokeWidth={0} className="ml-0.5" />}
            </button>
            <button onClick={next} className="text-[#C7D4E2] hover:text-[#F7FBFF] transition-colors" aria-label="Next"><SkipForward size={18} fill="currentColor" strokeWidth={0} /></button>
            <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="Repeat"><Repeat size={16} /></button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-xl">
            <span className="text-[10px] font-mono text-[#8D9BAC] w-9 text-right">{fmt(progress, track.duration)}</span>
            <button
              className="relative flex-1 h-5 flex items-center group cursor-pointer"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                seek((e.clientX - r.left) / r.width);
              }}
              aria-label="Seek"
            >
              <div className="relative w-full h-1 rounded-full bg-[#1a2b3d] overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#008CFF] to-[#24C8FF]" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#24C8FF] shadow-[0_0_8px_#24C8FF] opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress * 100}% - 5px)` }} />
            </button>
            <span className="text-[10px] font-mono text-[#8D9BAC] w-9">{track.duration}</span>
          </div>
        </div>

        {/* right controls + up next */}
        <div className="hidden md:flex items-center gap-3 w-[24%] justify-end">
          <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="Volume"><Volume2 size={17} /></button>
          <div className="w-20 h-1 rounded-full bg-[#1a2b3d] overflow-hidden">
            <div className="h-full w-3/4 rounded-full bg-[#24C8FF]/70" />
          </div>
          <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="Queue"><ListMusic size={17} /></button>
          <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="Expand"><Maximize2 size={15} /></button>

          {upNext && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-[#24C8FF]/12">
              <div className="text-right">
                <p className="text-[8px] font-bold tracking-widest text-[#24C8FF]">▲ UP NEXT</p>
                <p className="text-[11px] font-bold text-[#F7FBFF] leading-tight truncate max-w-[90px]">{upNext.title}</p>
                <p className="text-[9px] text-[#8D9BAC]">{upNext.genre} · {upNext.duration}</p>
              </div>
              <div className="w-9 h-9 rounded grid place-items-center shrink-0" style={{ background: 'linear-gradient(135deg,#10294d,#02050A)' }}>
                <span className="text-[10px] font-black text-[#24C8FF]">W<sup className="text-[0.5em]">2</sup></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
