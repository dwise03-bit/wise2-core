'use client';

import { useEffect, useRef, useState } from 'react';
import { BrandEcosystemHomepage } from './BrandEcosystemHomepage';

// Exact user-approved 42.5-second film, uploaded to media storage with verified SHA-256.
// Do not substitute the previous five-scene Higgsfield montage.
const OFFICIAL_INTRO = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/63bb8669-0fc0-4751-8b31-f2304b78b42e.mp4';

export function CinematicHomepageExperience() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  const enter = () => {
    setTransitioning(true);
    setPlaying(false);
    window.setTimeout(() => { setEntered(true); setTransitioning(false); }, 650);
  };

  useEffect(() => {
    if (entered) return;
    const el = video.current;
    if (!el) return;
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [entered]);

  if (entered) {
    return <div>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => { setFailed(false); setMuted(true); setEntered(false); }}
          className="rounded-full border border-[#65ffa9] bg-[#071511]/95 px-5 py-3 text-xs font-bold tracking-wider text-[#65ffa9] shadow-xl"
        >↺ Replay intro</button>
      </div>
      <BrandEcosystemHomepage />
    </div>;
  }

  return <main className={`relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#020606] text-white transition-opacity duration-700 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
    <video
      ref={video}
      className="absolute inset-0 h-full w-full bg-black object-contain"
      autoPlay muted={muted} playsInline preload="metadata"
      onEnded={enter}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onError={() => { setFailed(true); setPlaying(false); }}
      aria-label="WISE² official cinematic subway intro"
    >
      <source src={OFFICIAL_INTRO} type="video/mp4" />
    </video>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60" />
    <div className="absolute left-5 top-6 z-10 sm:left-10 sm:top-9">
      <span className="text-xl font-black tracking-widest text-[#65ffa9]">WISE²</span>
      <p className="mt-1 text-[11px] uppercase tracking-[.25em] text-white/75">Two minds. One vision.</p>
    </div>
    <div className="absolute right-5 top-6 z-10 flex flex-wrap justify-end gap-2 sm:right-10 sm:top-9">
      <button className="rounded-md border border-[#65ffa9]/70 bg-[#00150f]/85 px-4 py-3 text-xs font-bold text-[#c4ffda]" onClick={() => setMuted(v => !v)}>{muted ? 'Enable sound' : 'Mute sound'}</button>
      <button className="rounded-md border border-[#65ffa9]/70 bg-[#00150f]/85 px-4 py-3 text-xs font-bold text-[#c4ffda]" onClick={() => { const el = video.current; if (!el) return; if (el.paused) el.play().catch(() => setPlaying(false)); else el.pause(); }}>{playing ? 'Pause' : 'Play'}</button>
      <button className="rounded-md border border-[#65ffa9]/70 bg-[#00150f]/85 px-4 py-3 text-xs font-bold text-[#c4ffda]" onClick={enter}>Skip intro →</button>
    </div>
    <div className="absolute bottom-8 left-5 right-5 z-10 flex flex-wrap items-end justify-between gap-4 sm:left-10 sm:right-10">
      <div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#65ffa9]">WISE² · THE EXPERIENCE</p>
        {failed ? <p role="alert" className="mt-3 text-sm text-amber-200">Intro temporarily unavailable. Enter the website below.</p> : <p className="mt-2 text-sm text-white/80">Follow IMP into the WISE² world.</p>}
      </div>
      <button onClick={enter} className="rounded-md border border-[#65ffa9] bg-[#00150f]/90 px-5 py-3 text-sm font-bold text-[#c4ffda]">Enter WISE² →</button>
    </div>
  </main>;
}
