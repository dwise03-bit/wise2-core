'use client';
import { FormEvent, useState } from 'react';
import { CommandWorld, HermesSidebar, LiveContextPanel, RouteButton } from './components';

const nav=['COMMAND','CHATS','AGENTS','PROJECTS','KNOWLEDGE','MEMORY','TASKS','AUTOMATIONS','CRM & SALES','PHONE (AI)','DISCORD','FILES','TOOLS','MONITORING','LOGS','SETTINGS'];
const agents=['Hermes','Coding','Deploy','HVAC','Sales','Phone','Research','Sound Labs','XR','Design'];
const live=[['Project','WISE² CORE'],['Environment','Production'],['Context Engine','Online'],['Knowledge','Synced'],['Infrastructure','Connected'],['System Alerts','0 critical']] as const;
const routes=['AUTO', 'LOCAL', 'CLOUD'];

export default function HermesPage(){
 const [route,setRoute]=useState('AUTO'); const [activeNav,setActiveNav]=useState('COMMAND'); const [activeAgent,setActiveAgent]=useState('Hermes');
 const [input,setInput]=useState(''); const [messages,setMessages]=useState<string[]>([]);
 const submit=(e:FormEvent)=>{e.preventDefault();if(!input.trim())return;setMessages(v=>[...v,input.trim()]);setInput('');};
 return <main className="min-h-screen bg-[#02070d] p-2 text-[#d9f4ff] sm:p-3">
  <header className="grid gap-3 border border-cyan-500/40 bg-[#04111c] p-4 xl:grid-cols-[1.4fr_1fr_1fr]">
   <div><h1 className="text-2xl font-black tracking-[.08em] text-white sm:text-3xl">W² WISE² HERMES</h1><p className="text-[10px] tracking-[.16em] text-cyan-300 sm:text-xs sm:tracking-[.2em]">YOUR AI OPERATOR · SECOND BRAIN · EXECUTION ENGINE</p></div>
   <div className="flex flex-wrap items-center gap-2">{routes.map(x=><RouteButton key={x} label={x} active={route===x} onClick={()=>setRoute(x)}/>)}</div>
   <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs">{['MAC','VPS','GPU'].map(x=><div key={x} className="rounded border border-cyan-800 bg-black/30 p-2 text-center sm:p-3"><span className="text-green-400">●</span> {x} ONLINE</div>)}</div>
  </header>
  <section className="mt-3 grid gap-3 xl:grid-cols-[180px_minmax(0,1.3fr)_minmax(320px,.9fr)_260px]">
   <HermesSidebar items={nav} active={activeNav} onSelect={setActiveNav}/>
   <section className="rounded border border-cyan-700 bg-[#04101a] p-4"><div className="flex justify-between border-b border-cyan-900 pb-3"><b className="text-2xl">HERMES</b><span className="text-xs text-green-400">● ONLINE</span></div><div className="h-[420px] space-y-3 overflow-y-auto py-4 xl:h-[500px]"><div className="rounded border border-cyan-900 bg-black/30 p-4 text-sm text-slate-300"><b className="text-white">Hermes</b><p className="mt-2">WISE² operating context loaded. Command the business, infrastructure, agents, field systems, or knowledge layer from here.</p></div>{messages.map((m,i)=><div key={`${m}-${i}`} className="rounded border border-cyan-800 bg-[#071a29] p-4 text-sm"><b>You</b><p className="mt-2 text-slate-300">{m}</p></div>)}</div><div className="rounded border border-cyan-900 bg-black/40 p-3 font-mono text-xs text-cyan-300">$ route {route.toLowerCase()}<br/><span className="text-green-400">✓ WISE² command layer ready</span></div></section>
   <CommandWorld/>
   <LiveContextPanel items={live}/>
  </section>  <section className="mt-3 rounded border border-cyan-800 bg-[#04101a] p-3"><b className="text-xs">WISE² AGENTS</b><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{agents.map(a=><button type="button" aria-pressed={activeAgent===a} onClick={()=>setActiveAgent(a)} key={a} className={`shrink-0 rounded border px-4 py-2 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${activeAgent===a?'border-green-400 bg-green-400/10':'border-cyan-900 bg-black/30 hover:border-cyan-600'}`}>{a} <span className="text-green-400">●</span></button>)}</div>   <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"><button type="button" aria-label="Add context" className="rounded border border-cyan-800 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">＋</button><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Hermes anything..." aria-label="Ask Hermes anything" className="min-w-0 rounded border border-cyan-800 bg-[#02070d] px-4 py-3 text-sm outline-none focus:border-cyan-400"/><div className="rounded border border-cyan-800 px-4 py-3 text-xs">Route: <b>{route}</b></div><button className="rounded bg-cyan-500 px-8 py-3 font-bold text-black hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Send</button></form>
  </section>
 </main>;
}