'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommandWorld, HermesSidebar, LiveContextPanel, RouteButton } from './components';

const nav=['COMMAND','CHATS','AGENTS','PROJECTS','KNOWLEDGE','MEMORY','TASKS','AUTOMATIONS','CRM & SALES','PHONE (AI)','DISCORD','FILES','TOOLS','MONITORING','LOGS','SETTINGS'];
const routes=['AUTO', 'LOCAL', 'CLOUD'];
const agents=['Hermes','Coding','Deploy','HVAC','Sales','Phone','Research','Sound Labs','XR','Design'];
const navTargets:Record<string,string>={COMMAND:'/hermes',CHATS:'/hermes',AGENTS:'/agents',PROJECTS:'/projects',KNOWLEDGE:'/knowledge',MEMORY:'/memory',TASKS:'/tasks',AUTOMATIONS:'/automations','CRM & SALES':'/crm','PHONE (AI)':'/phone',DISCORD:'/discord',FILES:'/files',TOOLS:'/tools',MONITORING:'/monitoring',LOGS:'/logs',SETTINGS:'/settings'};
const agentPrompts:Record<string,string>={Hermes:'Operate WISE²',Coding:'Open coding agent',Deploy:'Inspect deployment status',HVAC:'Open HVAC field operations',Sales:'Open CRM and sales',Phone:'Open AI Phone',Research:'Start research agent','Sound Labs':'Open Sound Labs',XR:'Open XR Command',Design:'Open design agent'};
const live=[['Project','WISE² CORE'],['Environment','Production'],['Context Engine','Online'],['Knowledge','Synced'],['Infrastructure','Connected'],['System Alerts','0 critical']] as const;
const focusClass='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02070d]';

export default function HermesPage(){
 const router=useRouter(); const [route,setRoute]=useState('AUTO'); const [activeNav,setActiveNav]=useState('COMMAND'); const [activeAgent,setActiveAgent]=useState('Hermes');
 const [input,setInput]=useState(''); const [messages,setMessages]=useState<{role:string;content:string}[]>([]); const [busy,setBusy]=useState(false); const [status,setStatus]=useState('Ready');
 const handleNav=(item:string)=>{setActiveNav(item);router.push(navTargets[item]||'/hermes');};
 const handleAgent=(agent:string)=>{setActiveAgent(agent);setInput(agentPrompts[agent]||`Open ${agent}`);};
 const handleAddContext=()=>{setInput(v=>v?`${v} [attach context]`:'[attach context]');};
 const sync=async()=>{setStatus('Syncing…');try{const r=await fetch('/api/health',{cache:'no-store'});setStatus(r.ok?'Synced':'Sync unavailable');}catch{setStatus('Sync unavailable');}};
 const submit=async(e:FormEvent)=>{e.preventDefault();const text=input.trim();if(!text||busy)return;setInput('');setMessages(v=>[...v,{role:'user',content:text}]);setBusy(true);setStatus('Hermes working…');
  try{const r=await fetch('/api/v1/hermes/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,mode:route.toLowerCase()})});const data=await r.json().catch(()=>({}));const reply=data.response||data.message||(r.ok?'Command accepted.':'Hermes API unavailable.');setMessages(v=>[...v,{role:'assistant',content:reply}]);setStatus(r.ok?'Ready':'API unavailable');}catch{setMessages(v=>[...v,{role:'assistant',content:'Hermes connection unavailable. Your command was preserved.'}]);setStatus('Connection unavailable');}finally{setBusy(false);}};
 return <main className="min-h-screen overflow-x-hidden bg-[#02070d] text-[#d9f4ff]">
  <div className="relative isolate overflow-hidden px-2 py-2 sm:px-3">
   <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(0,190,255,.16),transparent_38%),linear-gradient(180deg,#02070d_0%,#041522_48%,#02070d_100%)]" />
   <header className="grid gap-4 border border-cyan-500/30 bg-[#02070d]/95 p-5 backdrop-blur-sm xl:grid-cols-[1.4fr_1fr_1fr]">
   <div className="min-w-0"><h1 className="text-2xl font-black tracking-[-.02em] text-white sm:text-3xl">W² WISE² HERMES</h1><p className="max-w-full break-words text-[10px] tracking-[.12em] text-cyan-300/80 sm:text-xs mt-1 font-medium">YOUR AI OPERATOR · SECOND BRAIN · EXECUTION ENGINE</p></div>
   <div className="flex flex-wrap items-center gap-2">{routes.map(x=><RouteButton key={x} label={x} active={route===x} onClick={()=>setRoute(x)}/>)}</div>
   <div className="grid grid-cols-1 gap-2 text-[10px] sm:grid-cols-3 sm:text-xs">{['MAC','VPS','GPU'].map(x=><button type="button" onClick={()=>setInput(`Check ${x} status`)} key={x} className={`rounded border border-cyan-500/40 bg-cyan-500/5 p-3 text-center hover:border-cyan-400/60 hover:bg-cyan-500/10 font-medium transition ${focusClass}`}><span className="text-green-400">●</span> {x} ONLINE</button>)}</div>
  </header>
  <section className="mt-4 grid gap-4 xl:grid-cols-[180px_minmax(0,1.3fr)_minmax(320px,.9fr)_260px]">
   <HermesSidebar items={nav} active={activeNav} onSelect={handleNav}/>
   <section className="rounded border border-cyan-500/30 bg-[#02070d] p-5"><div className="flex justify-between border-b border-cyan-500/20 pb-4 mb-4"><b className="text-lg font-bold tracking-wide text-white">HERMES</b><span aria-live="polite" className="text-xs font-medium text-green-400">● {status}</span></div>
    <div className="h-[420px] space-y-3 overflow-y-auto py-4 xl:h-[500px]"><div className="rounded border border-cyan-500/30 bg-[#04101a]/50 p-4 text-sm text-slate-300"><b className="text-cyan-100">Hermes</b><p className="mt-2">WISE² operating context loaded. Every control is wired into the command layer.</p></div>{messages.map((m,i)=><div key={i} className={`rounded border p-4 text-sm ${m.role==='user'?'border-cyan-500/30 bg-[#071a29]/60':'border-green-500/30 bg-green-950/20'}`}><b className={m.role==='user'?'text-cyan-100':'text-green-300'}>{m.role==='user'?'You':'Hermes'}</b><p className="mt-2 whitespace-pre-wrap text-slate-300">{m.content}</p></div>)}</div>
    <div className="rounded border border-cyan-500/30 bg-[#04101a]/50 p-3 font-mono text-xs text-cyan-300">$ route {route.toLowerCase()}<br/><span className="text-green-400">✓ WISE² command layer ready</span></div>
   </section>
   <CommandWorld/><span className="sr-only">LIVE CONTEXT</span><LiveContextPanel items={live} onSync={sync}/>
  </section>  <section className="mt-4 rounded border border-cyan-500/30 bg-[#02070d] p-5"><b className="text-xs font-bold tracking-wide text-cyan-300">WISE² AGENTS</b>
   <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{agents.map(a=><button type="button" aria-pressed={activeAgent===a} onClick={()=>handleAgent(a)} key={a} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${activeAgent===a?'border-green-400/60 bg-green-400/20 text-green-300 shadow-sm shadow-green-500/10':'border-cyan-500/40 bg-cyan-500/5 text-cyan-300 hover:border-cyan-400/60'}`}>{a} <span className="text-green-400">●</span></button>)}</div>
   <form onSubmit={submit} className="mt-4 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
    <button type="button" onClick={handleAddContext} aria-label="Add context" className="rounded border border-cyan-500/40 bg-cyan-500/5 px-4 py-3 text-sm hover:border-cyan-400/60 hover:bg-cyan-500/10 transition font-semibold">＋</button>
    <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Hermes anything..." aria-label="Ask Hermes anything" className="min-w-0 rounded border border-cyan-500/40 bg-[#02070d] px-4 py-3 text-sm outline-none focus:border-cyan-400/80 focus:bg-[#04101a] transition"/>
    <button type="button" onClick={()=>setRoute(route==='AUTO'?'LOCAL':route==='LOCAL'?'CLOUD':'AUTO')} className="rounded border border-cyan-500/40 bg-cyan-500/5 px-4 py-3 text-xs font-semibold hover:border-cyan-400/60 transition">Route: <b>{route}</b></button>
    <button disabled={busy} className="rounded bg-cyan-500 px-8 py-3 font-bold text-black hover:bg-cyan-300 disabled:opacity-50 transition">{busy?'Working…':'Send'}</button>
   </form>
  </section>
  </div>
  <section className="relative flex min-h-[78vh] items-center overflow-hidden border-y border-cyan-900/70 px-6 py-24 sm:px-12 lg:px-24">
   <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,rgba(0,215,255,.18),transparent_18%),radial-gradient(circle_at_20%_80%,rgba(0,100,180,.12),transparent_28%)]" />
   <div className="relative max-w-5xl">
    <p className="mb-6 text-xs font-bold tracking-[.35em] text-cyan-300">01 / CONTEXT BEFORE COMMAND</p>
    <h2 className="max-w-4xl text-5xl font-black leading-[.92] tracking-[-.04em] text-white sm:text-7xl lg:text-8xl">The system sees<br/><span className="text-cyan-300">the whole field.</span></h2>
    <p className="mt-8 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">Hermes connects people, projects, knowledge, and infrastructure into one living operational view.</p>
    <div className="mt-12 flex flex-wrap gap-3 text-[10px] font-bold tracking-[.18em] text-cyan-200"><span className="border border-cyan-700/70 bg-cyan-950/30 px-4 py-3">PEOPLE</span><span className="border border-cyan-700/70 bg-cyan-950/30 px-4 py-3">PROJECTS</span><span className="border border-cyan-700/70 bg-cyan-950/30 px-4 py-3">KNOWLEDGE</span><span className="border border-cyan-700/70 bg-cyan-950/30 px-4 py-3">OPERATIONS</span></div>
   </div>
  </section>
  <section className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-6 py-24 sm:px-12">
   <div className="pointer-events-none absolute h-[70vw] w-[70vw] max-w-[720px] rounded-full border border-cyan-500/20 shadow-[0_0_140px_rgba(0,190,255,.12)]" />
   <div className="relative max-w-3xl text-center"><p className="mb-6 text-xs font-bold tracking-[.35em] text-green-300">02 / ORCHESTRATION LAYER</p><h2 className="text-5xl font-black leading-none tracking-[-.04em] text-white sm:text-7xl">One intent.<br/><span className="text-green-300">Every capable agent.</span></h2><p className="mx-auto mt-8 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">Route work to coding, deployment, HVAC, sales, research, design, and beyond—without losing the thread.</p><div className="mx-auto mt-12 grid max-w-lg grid-cols-2 gap-3 text-left sm:grid-cols-3"><div className="border border-green-900 bg-green-950/20 p-4"><b className="text-2xl text-white">10</b><p className="mt-1 text-[10px] tracking-widest text-green-100/70">SPECIALISTS</p></div><div className="border border-green-900 bg-green-950/20 p-4"><b className="text-2xl text-white">3</b><p className="mt-1 text-[10px] tracking-widest text-green-100/70">ROUTES</p></div><div className="border border-green-900 bg-green-950/20 p-4"><b className="text-2xl text-white">1</b><p className="mt-1 text-[10px] tracking-widest text-green-100/70">OPERATING LAYER</p></div></div></div>
  </section>
  <section className="relative flex min-h-[78vh] items-center overflow-hidden border-t border-cyan-900/70 px-6 py-24 sm:px-12 lg:px-24"><div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(0,160,220,.08)_45%,transparent_70%)]" /><div className="relative max-w-4xl"><p className="mb-6 text-xs font-bold tracking-[.35em] text-cyan-300">03 / FROM SIGNAL TO IMPACT</p><h2 className="text-5xl font-black leading-[.92] tracking-[-.04em] text-white sm:text-7xl">Intelligence<br/><span className="text-cyan-300">that moves.</span></h2><p className="mt-8 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">The next action is never buried. Hermes turns live context into clear decisions, coordinated execution, and measurable progress.</p><button type="button" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} className={`mt-10 border border-cyan-400 bg-cyan-400 px-6 py-3 text-xs font-black tracking-[.16em] text-black transition hover:bg-cyan-200 ${focusClass}`}>RETURN TO COMMAND ↑</button></div></section>
 </main>;
}
