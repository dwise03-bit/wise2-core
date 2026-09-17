'use client';

import React, { useState } from 'react';

type NavItem = { label: string; icon: string };

type Job = { name: string; when: string; status: string };

const navItems: NavItem[] = [
  { label: 'Overview', icon: '⌂' },
  { label: 'Hermes', icon: '▣' },
  { label: 'Create', icon: '✎' },
  { label: 'Library', icon: '▱' },
  { label: 'Models', icon: '⬡' },
  { label: 'Jobs', icon: '▤' },
  { label: 'Assets', icon: '▰' },
  { label: 'Agents', icon: '♙' },
  { label: 'Integrations', icon: '⌘' },
  { label: 'Cost & Usage', icon: '◉' },
  { label: 'Settings', icon: '⚙' },
];

const jobs: Job[] = [
  { name: 'mountain fortress at sunset', when: '2 minutes ago', status: 'Completed' },
  { name: 'cyberpunk cityscape', when: '12 minutes ago', status: 'Completed' },
  { name: 'WISE2 logo concept', when: '1 hour ago', status: 'Completed' },
  { name: 'forest with glowing trees', when: '2 hours ago', status: 'Completed' },
];

export default function HermesControlPage() {
  const [activeNav, setActiveNav] = useState('Hermes');
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('FLUX.1 [dev]');
  const [aspect, setAspect] = useState('16:9 (Landscape)');
  const [style, setStyle] = useState('Cinematic');

  return (
    <div className="hermes-piff-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Permanent+Marker&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        :root {
          --void: #050506;
          --panel: rgba(8, 9, 12, .94);
          --panel-2: rgba(14, 15, 20, .92);
          --line: rgba(255,255,255,.13);
          --text: #f5f5f5;
          --muted: #9296a1;
          --purple: #b600ff;
          --purple-2: #7b12ff;
          --green: #9cff00;
          --cyan: #00e5ff;
        }
        * { box-sizing: border-box; }
        .hermes-piff-shell {
          min-height: 100vh;
          color: var(--text);
          background:
            radial-gradient(circle at 18% 12%, rgba(182,0,255,.20), transparent 25%),
            radial-gradient(circle at 80% 8%, rgba(156,255,0,.09), transparent 24%),
            linear-gradient(rgba(255,255,255,.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.016) 1px, transparent 1px),
            #050506;
          background-size: auto, auto, 42px 42px, 42px 42px, auto;
          font-family: Inter, system-ui, sans-serif;
          overflow-x: hidden;
        }
        .chrome {
          font-family: Anton, Impact, sans-serif;
          letter-spacing: .06em;
          background: linear-gradient(180deg,#fff 0%,#9a9a9a 32%,#fefefe 48%,#4b4b4b 74%,#fff 100%);
          -webkit-background-clip: text;
          color: transparent;
          text-shadow: 0 0 26px rgba(255,255,255,.12);
        }
        .graffiti { font-family: 'Permanent Marker', cursive; text-transform: uppercase; }
        .panel {
          background: linear-gradient(180deg, rgba(15,16,21,.96), rgba(5,6,9,.96));
          border: 1px solid var(--line);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.02), 0 20px 60px rgba(0,0,0,.35);
          position: relative;
          overflow: hidden;
        }
        .panel:before {
          content: '';
          position: absolute; inset: 0;
          pointer-events: none;
          background-image: radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px);
          background-size: 7px 7px;
          opacity: .38;
          mix-blend-mode: screen;
        }
        .purple-glow { box-shadow: 0 0 22px rgba(182,0,255,.38), inset 0 0 18px rgba(182,0,255,.16); }
        .green { color: var(--green); }
        .purple { color: #cf4cff; }
        .cyan { color: var(--cyan); }
        .hero-image {
          background-image:
            linear-gradient(90deg, rgba(5,5,6,.28), rgba(5,5,6,.10), rgba(5,5,6,.36)),
            url('https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/apps/website/public/brand/wise2-hero-united.webp');
          background-size: cover;
          background-position: center;
          filter: saturate(1.18) contrast(1.08);
        }
        .hero-smoke {
          background:
            radial-gradient(circle at 50% 100%, rgba(182,0,255,.23), transparent 35%),
            linear-gradient(180deg, transparent 35%, rgba(0,0,0,.78));
        }
        .meter { height: 7px; border-radius: 999px; background: #263040; overflow: hidden; }
        .meter > span { display:block; height:100%; border-radius:inherit; background: linear-gradient(90deg,#78ffd6,#9cff00); }
        .pill { border:1px solid rgba(156,255,0,.33); color:#70ffaf; background:rgba(0,255,120,.06); border-radius:999px; padding:.18rem .6rem; font-size:.7rem; }
        .scratched { position:relative; }
        .scratched:after {
          content:''; position:absolute; inset:0; pointer-events:none; opacity:.10;
          background: repeating-linear-gradient(164deg, transparent 0 18px, #fff 19px 20px, transparent 21px 44px);
        }
        .select-dark, .prompt-dark {
          background:#080a0e; border:1px solid #2b3340; color:#fff; border-radius:.6rem;
        }
        .select-dark { padding:.72rem .8rem; width:100%; }
        .prompt-dark { width:100%; min-height:105px; padding:1rem; resize:vertical; outline:none; }
        .prompt-dark:focus, .select-dark:focus { border-color:var(--purple); box-shadow:0 0 0 2px rgba(182,0,255,.12); outline:none; }
        .generate-btn {
          background: linear-gradient(90deg,#6f00ff,#d100ff,#7f00ff);
          border:1px solid #ec9bff; color:white; font-weight:900; letter-spacing:.08em; text-transform:uppercase;
          box-shadow:0 0 28px rgba(182,0,255,.54), inset 0 0 20px rgba(255,255,255,.12);
        }
        .generate-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .usage-line { height:80px; position:relative; background:linear-gradient(180deg,transparent,rgba(156,255,0,.05)); }
        .usage-line svg { width:100%; height:100%; }
        .donut { width:112px; height:112px; border-radius:50%; background:conic-gradient(#9cff00 0 48%, #b600ff 48% 70%, #6b49ff 70% 85%, #d48dff 85% 95%, #374151 95% 100%); position:relative; }
        .donut:after { content:''; position:absolute; inset:18px; border-radius:50%; background:#0b0d12; }
        .nav-active { border:1px solid #cc52ff; background:linear-gradient(90deg,rgba(182,0,255,.34),rgba(182,0,255,.10)); box-shadow:0 0 18px rgba(182,0,255,.48); }
        @media (max-width: 1100px) {
          .side-nav { display:none; }
          .main-grid { grid-template-columns:1fr !important; }
          .hero-people { min-height:260px !important; }
        }
      `}</style>

      <div className="grid min-h-screen" style={{ gridTemplateColumns: '190px 1fr' }}>
        <aside className="side-nav border-r border-white/10 bg-black/90 p-3 flex flex-col gap-3 sticky top-0 h-screen">
          <div className="panel p-3 text-center">
            <div className="chrome text-2xl">WISE²</div>
            <div className="text-[9px] tracking-[.32em] text-cyan-300">COMMAND CENTER</div>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button key={item.label} onClick={() => setActiveNav(item.label)} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${activeNav === item.label ? 'nav-active' : 'hover:bg-white/5'}`}>
                <span className="w-5 text-center text-lg text-gray-200">{item.icon}</span><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div aria-label="BUILD AUTOMATE DOMINATE" className="mt-auto p-3 graffiti text-2xl leading-tight scratched">
            <span className="text-white">BUILD</span><br/><span className="purple">AUTOMATE</span><br/><span className="green">DOMINATE</span>
          </div>
          <div className="text-[10px] text-gray-500">v0.3.0 | dwise03-bit</div>
        </aside>

        <main className="p-3 md:p-4 space-y-3">
          <header className="panel hero-image scratched min-h-[285px] rounded-xl overflow-hidden">
            <div className="hero-smoke absolute inset-0" />
            <div className="relative z-10 h-full min-h-[285px] grid grid-cols-12 items-center px-5 md:px-8 py-5 hero-people">
              <div className="col-span-12 md:col-span-3 self-end pb-2">
                <div className="graffiti text-3xl purple">DANIEL “D.WISE”</div>
                <div className="text-[10px] tracking-[.18em] text-gray-300">FOUNDER & SYSTEM ARCHITECT</div>
                <div className="graffiti text-2xl mt-3 text-white">“TAKE CONTROL”</div>
              </div>
              <div className="col-span-12 md:col-span-6 text-center self-start pt-2">
                <div className="chrome text-2xl md:text-4xl mb-1">WISE² BUSINESS OS</div>
                <div className="relative inline-block">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl">♛</div>
                  <h1 className="graffiti text-6xl md:text-8xl tracking-tight text-white drop-shadow-[0_0_12px_rgba(182,0,255,.8)]">HERMES</h1>
                </div>
                <div className="graffiti green text-2xl md:text-3xl mt-1">AI IMAGE GENERATION & VISUAL INTELLIGENCE</div>
                <div className="mt-3 text-xs md:text-sm tracking-[.5em] text-gray-300">CREATE • EDIT • MANAGE • DEPLOY</div>
              </div>
              <div className="col-span-12 md:col-span-3 text-right self-end pb-2">
                <div className="graffiti text-3xl purple">DARRIN “DARRIN WISE”</div>
                <div className="text-[10px] tracking-[.18em] text-gray-300">OPERATIONS & GROWTH LEADER</div>
                <div className="graffiti text-2xl mt-3 text-white">“NO APOLOGIES”</div>
              </div>
            </div>
          </header>

          <section className="main-grid grid gap-3" style={{ gridTemplateColumns: '1.45fr .95fr' }}>
            <div className="panel rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3"><span className="purple text-2xl">✎</span><h2 className="graffiti green text-2xl">CREATE SOMETHING REAL</h2></div>
              <p className="text-xs text-gray-400 mb-3">Turn your ideas into reality with Hermes.</p>
              <textarea className="prompt-dark" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe the image you want to create..." />
              <div className="text-right text-[11px] text-gray-400 mt-1">{prompt.length}/2000</div>
              <div className="grid md:grid-cols-4 gap-2 mt-3">
                <label className="text-[10px] text-gray-400">Model<select className="select-dark mt-1" value={model} onChange={e=>setModel(e.target.value)}><option>FLUX.1 [dev]</option><option>SDXL</option><option>Local AI</option></select></label>
                <label className="text-[10px] text-gray-400">Aspect Ratio<select className="select-dark mt-1" value={aspect} onChange={e=>setAspect(e.target.value)}><option>16:9 (Landscape)</option><option>1:1 (Square)</option><option>9:16 (Portrait)</option></select></label>
                <label className="text-[10px] text-gray-400">Style<select className="select-dark mt-1" value={style} onChange={e=>setStyle(e.target.value)}><option>Cinematic</option><option>Street</option><option>Product</option></select></label>
                <button className="select-dark mt-4 text-sm">☷ Advanced</button>
              </div>
              <button className="generate-btn w-full rounded-lg py-3 mt-3 transition">⚡ GENERATE IMAGE</button>
            </div>

            <div className="panel rounded-xl p-4 min-h-[335px]">
              <div className="flex items-center gap-2"><span className="purple">◉</span><h2 className="graffiti green text-2xl">PREVIEW</h2></div>
              <div className="mt-3 h-[255px] border border-dashed border-white/20 rounded-lg grid place-items-center text-center bg-black/20">
                <div><div className="text-4xl text-gray-500">▧</div><p className="mt-3 text-sm text-gray-300">Your generated image will appear here.</p><p className="graffiti purple text-2xl mt-2">VISUALIZE • CREATE • DOMINATE</p></div>
              </div>
            </div>
          </section>

          <section className="grid xl:grid-cols-3 gap-3">
            <div className="panel rounded-xl p-4">
              <div className="flex justify-between"><h3 className="graffiti green text-xl">SYSTEM STATUS</h3><span className="pill">● Online</span></div>
              <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                {[['3','AI Models','Ready'],['8','Active Agents','Healthy'],['42','Jobs Today','+12%'],['245ms','Avg. Latency','Good']].map(([v,l,s])=><div key={l} className="border border-white/10 rounded-lg p-3 bg-white/[.02]"><div className="text-2xl font-black cyan">{v}</div><div className="text-[10px] text-gray-300 mt-1">{l}</div><div className="text-[10px] text-green-400 mt-2">{s}</div></div>)}
              </div>
            </div>

            <div className="panel rounded-xl p-4">
              <div className="flex justify-between"><h3 className="graffiti green text-xl">USAGE & COST</h3><span className="text-xs border border-white/10 rounded px-2 py-1">This Month⌄</span></div>
              <div className="flex items-end gap-8 mt-2"><div><div className="text-3xl font-black text-emerald-300">$12.48</div><div className="text-xs text-gray-400">Total Cost <span className="text-green-400">↓ -18%</span></div></div><div><div className="text-2xl font-black">1,342</div><div className="text-xs text-gray-400">Images Generated <span className="text-green-400">↑ +24%</span></div></div></div>
              <div className="usage-line mt-3"><svg viewBox="0 0 420 80" preserveAspectRatio="none"><polyline fill="none" stroke="#9cff00" strokeWidth="2" points="0,62 50,45 100,50 145,34 190,58 230,48 270,35 315,20 360,31 420,8" /></svg></div>
            </div>

            <div className="panel rounded-xl p-4">
              <h3 className="graffiti green text-xl">CONTEXT BREAKDOWN</h3>
              <div className="flex gap-5 mt-4 items-center"><div className="donut shrink-0"><div className="absolute inset-0 z-10 grid place-items-center text-center text-sm font-bold">128K<br/><span className="text-[9px] text-gray-400 font-normal">Context</span></div></div><div className="space-y-2 text-[11px] flex-1">{[['Image Generation','48%','#9cff00'],['Prompt Processing','22%','#b600ff'],['Style Conditioning','15%','#6b49ff'],['Safety & Filtering','10%','#d48dff'],['Other','5%','#64748b']].map(([l,v,c])=><div key={l} className="flex justify-between"><span><i className="inline-block w-2 h-2 rounded-full mr-2" style={{background:c}} />{l}</span><b>{v}</b></div>)}</div></div>
            </div>
          </section>

          <section className="grid xl:grid-cols-3 gap-3">
            <div className="panel rounded-xl p-4">
              <h3 className="graffiti green text-xl">TUNING CONTROLS</h3>
              <div className="space-y-4 mt-4">{[['Temperature','70%','0.7'],['Max Tokens','42%','1024'],['Guidance Scale','60%','7.5'],['Reasoning Depth','55%','Medium']].map(([label,width,value])=><div key={label} className="grid grid-cols-[120px_1fr_70px] items-center gap-3 text-xs"><span>{label}</span><div className="meter"><span style={{width}} /></div><span className="border border-white/10 rounded px-2 py-1 text-center">{value}</span></div>)}</div>
            </div>

            <div className="panel rounded-xl p-4">
              <div className="flex justify-between"><h3 className="graffiti green text-xl">INTEGRATIONS</h3><button className="text-xs text-cyan-300">Manage</button></div>
              <div className="space-y-2 mt-4 text-sm">{[['Local AI (Ollama)','Connected'],['Ghostty Backend','Connected'],['Discord','Connected'],['Asset Locker','Ready'],['Webhooks','Configured']].map(([name,status])=><div key={name} className="flex justify-between border-b border-white/5 pb-2"><span>{name}</span><span className="text-green-400">● {status}</span></div>)}</div>
            </div>

            <div className="panel rounded-xl p-4">
              <div className="flex justify-between"><h3 className="graffiti green text-xl">RECENT JOBS</h3><button className="text-xs text-cyan-300">View All</button></div>
              <div className="mt-3">{jobs.map(job=><div key={job.name} className="flex items-center justify-between border-b border-white/5 py-2"><div><div className="text-sm">{job.name}</div><div className="text-[10px] text-gray-500">{job.when}</div></div><span className="pill">{job.status}</span></div>)}</div>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-[10px] tracking-[.25em] text-gray-400">
            <span>WISE² BUILDS THE SYSTEM. <b className="purple">PIFF CITY BUILDS THE CULTURE.</b></span>
            <span className="graffiti green text-xl tracking-normal">TOGETHER WE BUILD LEGACY.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
