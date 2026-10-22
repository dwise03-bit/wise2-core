'use client';

import { useEffect, useRef, useState } from 'react';

const SOURCE = '/media/wise2-tunnel-background.mp4';
const CROSSFADE_SECONDS = 0.9;

export function LoopingTunnelBackground() {
  const first = useRef<HTMLVideoElement>(null);
  const second = useRef<HTMLVideoElement>(null);
  const active = useRef<0 | 1>(0);
  const switching = useRef(false);
  const [front, setFront] = useState<0 | 1>(0);

  useEffect(() => {
    const videos = [first.current, second.current] as const;
    const a = videos[0];
    const b = videos[1];
    if (!a || !b) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onTime = () => {
      const current = videos[active.current];
      const upcoming = videos[active.current === 0 ? 1 : 0];
      if (!current || !upcoming || switching.current || !Number.isFinite(current.duration)) return;
      if (current.duration - current.currentTime > CROSSFADE_SECONDS) return;
      switching.current = true;
      upcoming.currentTime = 0;
      upcoming.play().then(() => {
        active.current = active.current === 0 ? 1 : 0;
        setFront(active.current);
        window.setTimeout(() => {
          current.pause();
          current.currentTime = 0;
          switching.current = false;
        }, CROSSFADE_SECONDS * 1000);
      }).catch(() => { switching.current = false; });
    };
    a.addEventListener('timeupdate', onTime);
    b.addEventListener('timeupdate', onTime);
    a.play().catch(() => {});
    return () => {
      a.removeEventListener('timeupdate', onTime);
      b.removeEventListener('timeupdate', onTime);
      a.pause();
      b.pause();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#07120f]">
      {[first, second].map((ref, index) => (
        <video key={index} ref={ref} muted playsInline preload="auto" loop={false}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out motion-reduce:hidden ${front === index ? 'opacity-100' : 'opacity-0'}`}>
          <source src={SOURCE} type="video/mp4" />
        </video>
      ))}
      <div className="absolute inset-0 bg-[#020908]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020908]/20 via-[#020908]/30 to-[#020908]/70" />
    </div>
  );
}
