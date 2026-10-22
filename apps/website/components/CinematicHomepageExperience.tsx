'use client';

import { useEffect, useRef, useState } from 'react';
import { BrandEcosystemHomepage } from './BrandEcosystemHomepage';

const base = 'https://d8j0ntlcm91z4.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/';
const scenes = [
  { name: 'The Descent', src: base + 'hf_20261021_195451_638a756c-8aea-4b43-9ea3-b90953559491.mp4' },
  { name: 'Something in the Station', src: base + 'hf_20261021_204449_a145b4a5-db4f-46ab-90ed-9ae119f19c7a.mp4' },
  { name: 'Follow Him', src: base + 'hf_20261021_205935_2839bf51-45e3-4c0a-bf20-2a0b2b158ffe.mp4' },
  { name: 'The Hidden Entrance', src: base + 'hf_20261022_041926_43abcdfb-1b1d-4a74-8184-a07cc8e55042.mp4' },
  { name: 'The Reveal', src: base + 'hf_20261022_043055_a8230d56-f77c-494f-a64e-a012d523c588.mp4' },
];

export function CinematicHomepageExperience() {
  const [entered, setEntered] = useState(false);
  const [scene, setScene] = useState(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const enter = () => { setEntered(true); setPlaying(false); };
  const next = () => scene === scenes.length - 1 ? enter() : setScene(s => s + 1);

  useEffect(() => {
    if (entered) return;
    setFailed(false);
    const el = video.current;
    if (!el) return;
    el.load();
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [scene, entered]);

  if (entered) {
    return <div>
      <div className="fixed bottom-5 right-5 z-50">
        <button onClick={() => { setScene(0); setEntered(false); }} className="rounded-full border border-[#65ffa9] bg-[#071511]/95 px-5 py-3 text-xs font-bold tracking-wider text-[#65ffa9] shadow-xl">↺ Replay WISE² intro</button>
      </div>
      <BrandEcosystemHomepage />
    </div>;
  }

  return <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#020606] text-white">
    <style>{`
      .wise-film { position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:contrast(1.08) saturate(.92); }
      .wise-film-shade { position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.62),transparent 24%,transparent 63%,rgba(0,0,0,.88)),radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.28)); }
      .wise-film-button { border:1px solid rgba(101,255,169,.7);background:rgba(0,15,12,.82);color:#c4ffda;border-radius:6px;padding:11px 15px;font-size:12px;font-weight:700;cursor:pointer; }
      .wise-film-button:hover { background:rgba(15,66,44,.95); }
      @media(prefers-reduced-motion:reduce){.wise-film{filter:none}}
    `}</style>
    <video key={scene} ref={video} className="wise-film" autoPlay muted={muted} playsInline preload="auto" onEnded={next} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} aria-label={`WISE² cinematic introduction, scene ${scene+1}: ${scenes[scene].name}`}>
      <source src={scenes[scene].src} type="video/mp4" />
    </video>
    <div className="wise-film-shade"/>
    <div className="absolute left-5 top-6 z-10 sm:left-10 sm:top-9">
      <a href="/transit" className="text-xl font-black tracking-widest text-[#65ffa9]">WISE²</a>
      <p className="mt-1 text-[11px] uppercase tracking-[.25em] text-white/75">Two minds. One vision.</p>
    </div>
    <div className="absolute right-5 top-6 z-10 flex flex-wrap justify-end gap-2 sm:right-10 sm:top-9">
      <button className="wise-film-button" onClick={() => setMuted(m => !m)} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>{muted ? 'Sound off' : 'Sound on'}</button>
      <button className="wise-film-button" onClick={() => {const el=video.current;if (!el)return; if(el.paused)el.play().catch(()=>setPlaying(false));else el.pause();}}>{playing ? 'Pause' : 'Play'}</button>
      <button className="wise-film-button" onClick={enter}>Skip intro →</button>
    </div>
    <div className="absolute bottom-7 left-5 right-5 z-10 flex flex-wrap items-end justify-between gap-4 sm:bottom-10 sm:left-10 sm:right-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.25em] text-[#65ffa9]">Scene {String(scene+1).padStart(2,'0')} / 05</p>
        <h1 className="mt-2 text-2xl font-black tracking-wide sm:text-5xl">{scenes[scene].name}</h1>
        <div className="mt-4 flex gap-2" aria-label="Film progress">{scenes.map((s,i) => <span key={s.name} className={`h-1 w-9 rounded-full ${i<=scene?'bg-[#65ffa9]':'bg-white/30'}`}/>)}</div>
        {failed && <p role="alert" className="mt-3 text-sm text-amber-300">Video unavailable. Continue or skip to the website.</p>}
      </div>
      <button className="wise-film-button" onClick={next}>{scene === 4 ? 'Enter WISE² →' : 'Continue →'}</button>
    </div>
  </main>;
}
