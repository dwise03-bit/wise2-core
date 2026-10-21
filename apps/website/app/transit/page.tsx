'use client';

import { useEffect, useRef, useState } from 'react';

const clips = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/hf_20261021_195451_638a756c-8aea-4b43-9ea3-b90953559491.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/hf_20261021_204449_a145b4a5-db4f-46ab-90ed-9ae119f19c7a.mp4',
  'https://d8j0ntlcm91z4.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/hf_20261021_205935_2839bf51-45e3-4c0a-bf20-2a0b2b158ffe.mp4',
];
const imp = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3G8Nn9NFwKLGqBbTrrVrvDTpJm0/9ba19d99-ba87-44f1-a973-5e7f6ad191cf.png';
const stops = [
  { title: 'AI Automation', href: '/ai-audit', caption: 'Build your next intelligent workflow' },
  { title: 'WISE² Services', href: '/consulting', caption: 'Explore the studio and our solutions' },
  { title: 'WISE² Home', href: '/', caption: 'Return to the main website' },
];
export default function TransitPage() {
  const [scene, setScene] = useState(0);
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [hint, setHint] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const showHub = () => { setEntered(true); setPlaying(false); };
  useEffect(() => {
    if (entered) return;
    const el = video.current;
    if (!el) return;
    el.load();
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [scene, entered]);
  const next = () => { if (scene < clips.length - 1) setScene(n => n + 1); else showHub(); };
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050709] text-white">
      <style>{`
        .transit-grain { background:radial-gradient(ellipse at 50% 20%,rgba(30,83,65,.16),transparent 64%),linear-gradient(180deg,transparent 60%,#030808); }
        .transit-glow { text-shadow:0 3px 32px rgba(0,0,0,.9),0 0 28px rgba(51,255,148,.18) }
        .transit-film { filter:contrast(1.1) saturate(.9) brightness(.95); }
        .transit-vignette {background:radial-gradient(ellipse 85% 75% at 50% 42%,transparent 32%,rgba(1,5,7,.52) 100%),linear-gradient(to bottom,rgba(0,0,0,.52),transparent 22%,transparent 68%,rgba(0,0,0,.8));}
        .transit-cine-card{background:linear-gradient(135deg,rgba(8,26,23,.94),rgba(4,10,15,.96));box-shadow:0 15px 70px rgba(0,0,0,.36);backdrop-filter:blur(12px);}
        .transit-stage{background:radial-gradient(ellipse at 50% 25%,rgba(33,123,91,.17),transparent 62%),#030708;}
        @media(prefers-reduced-motion:reduce){.transit-motion{animation:none!important;transition:none!important}}
      `}</style>
      {!entered ? (
        <section className="relative flex min-h-screen items-center justify-center">
          <video key={scene} ref={video} autoPlay muted={muted} playsInline preload="metadata" onEnded={next}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            className="transit-film absolute inset-0 h-full w-full object-cover" aria-label={`First-person WISE² subway scene ${scene + 1}`}>
            <source src={clips[scene]} type="video/mp4" />
          </video>
          <div aria-hidden="true" className="transit-grain pointer-events-none absolute inset-0" /><div aria-hidden="true" className="transit-vignette pointer-events-none absolute inset-0" />
          <div className="absolute left-5 top-5 z-20 sm:left-9 sm:top-8">
            <a href="/" className="text-xl font-black tracking-widest text-[#65ffa9]">WISE²</a>
            <p className="mt-1 text-xs uppercase tracking-[.25em] text-white/70">The Hidden Platform</p>
          </div>
          <div className="absolute right-5 top-5 z-20 flex flex-wrap justify-end gap-2 sm:right-9 sm:top-8">
            <button className="rounded border border-white/50 bg-black/70 px-3 py-2 text-sm" onClick={() => setMuted(m => !m)} aria-label={muted ? 'Enable sound' : 'Mute sound'}>{muted ? 'Sound off' : 'Sound on'}</button>
            <button className="rounded border border-white/50 bg-black/70 px-3 py-2 text-sm" onClick={() => { if (video.current?.paused) video.current.play().catch(() => setPlaying(false)); else video.current?.pause(); }}>{playing ? 'Pause' : 'Play'}</button>
            <button className="rounded border border-[#65ffa9] bg-black/80 px-3 py-2 text-sm text-[#65ffa9]" onClick={showHub}>Skip intro</button>
          </div>
          <div className="absolute bottom-10 left-5 right-5 z-20 flex items-end justify-between gap-4 sm:left-9 sm:right-9">
            <div>
              <p className="text-xs uppercase tracking-[.25em] text-[#65ffa9]">Platform signal {String(scene + 1).padStart(2,'0')} / 03</p>
              <h1 className="transit-glow mt-2 text-2xl font-bold sm:text-4xl">{['Nothing unusual. Yet.','Someone sees you.','Follow him.'][scene]}</h1>
              <div className="mt-4 flex gap-2">{clips.map((_,i)=><span key={i} className={`h-1 w-12 ${i <= scene ? 'bg-[#65ffa9]' : 'bg-white/30'}`} />)}</div>
            </div>
            <button onClick={next} className="shrink-0 rounded border border-white/50 bg-black/75 px-5 py-3 text-sm hover:border-[#65ffa9]">{scene === 2 ? 'Enter network →' : 'Continue →'}</button>
          </div>
        </section>
      ) : (
        <section className="transit-stage relative flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center">
          <a href="/" className="absolute left-6 top-7 font-black tracking-[.2em] text-[#65ffa9]">WISE²</a>
          <p className="text-xs font-bold uppercase tracking-[.35em] text-[#65ffa9]">Access recognized</p>
          <h1 className="transit-glow mt-5 text-4xl font-black sm:text-7xl">WELCOME TO THE NETWORK</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/75">The platform was here all along. Choose your destination. The cinematic station entrance is coming next; these destinations work now.</p>
          <div className="mt-12 grid w-full max-w-5xl gap-4 md:grid-cols-3">
            {stops.map(s => <a key={s.href} href={s.href} className="transit-cine-card rounded-lg border border-[#65ffa9]/40 p-7 text-left transition hover:border-[#65ffa9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#65ffa9]"><span className="text-xs uppercase tracking-widest text-[#65ffa9]">WISE² Transit</span><h2 className="mt-4 text-2xl font-bold">{s.title} ↗</h2><p className="mt-3 text-sm text-white/65">{s.caption}</p></a>)}
          </div>
          <button className="mt-10 text-sm text-white/70 underline" onClick={() => {setScene(0);setEntered(false)}}>Replay the journey</button>
        </section>
      )}
      <aside className="fixed bottom-24 right-5 z-30 max-w-[230px] sm:right-9">
        {hint && <div className="mb-2 rounded-lg border border-[#65ffa9]/60 bg-[#071311]/95 p-4 text-sm shadow-xl"><p className="font-bold text-[#65ffa9]">WISE² IMP</p><p className="mt-2 text-white/80">{entered ? 'Pick a station. I will show you around.' : 'Psst. There is more here than you can see. Follow me.'}</p><button className="mt-2 text-xs underline" onClick={() => setHint(false)}>Close</button></div>}
        <button onClick={() => setHint(h => !h)} className="block h-20 w-20 overflow-hidden rounded-full border-2 border-[#65ffa9] bg-white shadow-lg shadow-emerald-500/30" aria-label="Talk to IMP, your WISE² guide" aria-expanded={hint}>
          <img src={imp} alt="WISE² IMP guide" className="h-full w-full object-contain" />
        </button>
      </aside>
    </main>
  );
}
