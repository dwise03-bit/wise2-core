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

export default function HermesPage(){
 const router=useRouter(); const [route,setRoute]=useState('AUTO'); const [activeNav,setActiveNav]=useState('COMMAND'); const [activeAgent,setActiveAgent]=useState('Hermes');
 const [input,setInput]=useState(''); const [messages,setMessages]=useState<{role:string;content:string}[]>([]); const [busy,setBusy]=useState(false); const [status,setStatus]=useState('Ready');
 const handleNav=(item:string)=>{setActiveNav(item);router.push(navTargets[item]||'/hermes');};
 const handleAgent=(agent:string)=>{setActiveAgent(agent);setInput(agentPrompts[agent]||`Open ${agent}`);};
 const handleAddContext=()=>{setInput(v=>v?`${v} [attach context]`:'[attach context]');};
 const sync=async()=>{setStatus('Syncing…');try{const r=await fetch('/api/health',{cache:'no-store'});setStatus(r.ok?'Synced':'Sync unavailable');}catch{setStatus('Sync unavailable');}};
 const submit=async(e:FormEvent)=>{e.preventDefault();const text=input.trim();if(!text||busy)return;setInput('');setMessages(v=>[...v,{role:'user',content:text}]);setBusy(true);setStatus('Hermes working…');
  try{const r=await fetch('/api/v1/hermes/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,mode:route.toLowerCase()})});const data=await r.json().catch(()=>({}));const reply=data.response||data.message||(r.ok?'Command accepted.':'Hermes API unavailable.');setMessages(v=>[...v,{role:'assistant',content:reply}]);setStatus(r.ok?'Ready':'API unavailable');}catch{setMessages(v=>[...v,{role:'assistant',content:'Hermes connection unavailable. Your command was preserved.'}]);setStatus('Connection unavailable');}finally{setBusy(false);}};
 return <main className="min-h-screen bg-[#02070d] p-2 text-[#d9f4ff] sm:p-3">  <header className="grid gap-3 border border-cyan-500/40 bg-[#04111c] p-4 xl:grid-cols-[1.4fr_1fr_1fr]">
   <div><h1 className="text-2xl font-black tracking-[.08em] text-white sm:text-3xl">W² WISE² HERMES</h1><p className="text-[10px] tracking-[.16em] text-cyan-300 sm:text-xs">YOUR AI OPERATOR · SECOND BRAIN · EXECUTION ENGINE</p></div>
   <div className="flex flex-wrap items-center gap-2">{routes.map(x=><RouteButton key={x} label={x} active={route===x} onClick={()=>setRoute(x)}/>)}</div>
   <div className="grid grid-cols-3 gap-2 text-[10px] sm:text-xs">{['MAC','VPS','GPU'].map(x=><button type="button" onClick={()=>setInput(`Check ${x} status`)} key={x} className="rounded border border-cyan-800 bg-black/30 p-2 text-center hover:border-cyan-500 sm:p-3"><span className="text-green-400">●</span> {x} ONLINE</button>)}</div>
  </header>
  <section className="mt-3 grid gap-3 xl:grid-cols-[180px_minmax(0,1.3fr)_minmax(320px,.9fr)_260px]">
   <HermesSidebar items={nav} active={activeNav} onSelect={handleNav}/>
   <section className="rounded border border-cyan-700 bg-[#04101a] p-4"><div className="flex justify-between border-b border-cyan-900 pb-3"><b className="text-2xl">HERMES</b><span className="text-xs text-green-400">● {status}</span></div>
    <div className="h-[420px] space-y-3 overflow-y-auto py-4 xl:h-[500px]"><div className="rounded border border-cyan-900 bg-black/30 p-4 text-sm text-slate-300"><b className="text-white">Hermes</b><p className="mt-2">WISE² operating context loaded. Every control is wired into the command layer.</p></div>{messages.map((m,i)=><div key={i} className={`rounded border p-4 text-sm ${m.role==='user'?'border-cyan-800 bg-[#071a29]':'border-green-900 bg-black/30'}`}><b>{m.role==='user'?'You':'Hermes'}</b><p className="mt-2 whitespace-pre-wrap text-slate-300">{m.content}</p></div>)}</div>
    <div className="rounded border border-cyan-900 bg-black/40 p-3 font-mono text-xs text-cyan-300">$ route {route.toLowerCase()}<br/><span className="text-green-400">✓ WISE² command layer ready</span></div>
   </section>
   <CommandWorld/><span className="sr-only">LIVE CONTEXT</span><LiveContextPanel items={live} onSync={sync}/>
  </section>  <section className="mt-3 rounded border border-cyan-800 bg-[#04101a] p-3"><b className="text-xs">WISE² AGENTS</b>
   <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{agents.map(a=><button type="button" aria-pressed={activeAgent===a} onClick={()=>handleAgent(a)} key={a} className={`shrink-0 rounded border px-4 py-2 text-xs transition ${activeAgent===a?'border-green-400 bg-green-400/10':'border-cyan-900 bg-black/30 hover:border-cyan-600'}`}>{a} <span className="text-green-400">●</span></button>)}</div>
   <form onSubmit={submit} className="mt-3 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
    <button type="button" onClick={handleAddContext} aria-label="Add context" className="rounded border border-cyan-800 px-4 hover:border-cyan-500">＋</button>
    <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Hermes anything..." aria-label="Ask Hermes anything" className="min-w-0 rounded border border-cyan-800 bg-[#02070d] px-4 py-3 text-sm outline-none focus:border-cyan-400"/>
    <button type="button" onClick={()=>setRoute(route==='AUTO'?'LOCAL':route==='LOCAL'?'CLOUD':'AUTO')} className="rounded border border-cyan-800 px-4 py-3 text-xs hover:border-cyan-500">Route: <b>{route}</b></button>
    <button disabled={busy} className="rounded bg-cyan-500 px-8 py-3 font-bold text-black hover:bg-cyan-300 disabled:opacity-50">{busy?'Working…':'Send'}</button>
   </form>
  </section>
 </main>;
}