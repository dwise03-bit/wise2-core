'use client';

import { FormEvent, useState } from 'react';
import { useHermesChat } from '@/hooks/useHermesChat';

const nav = ['COMMAND','CHATS','AGENTS','PROJECTS','KNOWLEDGE','MEMORY','TASKS','AUTOMATIONS','CRM & SALES','PHONE (AI)','DISCORD','FILES','TOOLS','MONITORING','LOGS','SETTINGS'];
const agents = ['Hermes','Coding','Deploy','HVAC','Sales','Phone','Research','Sound Labs','XR','Design'];
const context = [['Project','wise2-core'],['Branch','main'],['Active Memory','Synced'],['Tools Connected','12 tools online'],['Docker Services','Healthy'],['System Alerts','0 critical'],['Active Agents','4 running']];

export default function HermesPage() {
  const [route, setRoute] = useState('AUTO');
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading, model, provider, error } = useHermesChat();
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!input.trim()) return; const value=input; setInput(''); await sendMessage(value, route.toLowerCase()); };

  return <main className="min-h-screen bg-[#02070d] text-[#d9f4ff] p-3 font-sans">
    <header className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr] border border-cyan-500/40 bg-[#04111c] p-4 shadow-[0_0_35px_rgba(0,180,255,.12)]">
      <div><h1 className="text-3xl font-black tracking-[.08em] text-white">W² WISE² HERMES</h1><p className="text-xs tracking-[.22em] text-cyan-300">YOUR AI OPERATOR · SECOND BRAIN · EXECUTION ENGINE</p></div>
      <div className="flex items-center gap-2">{['AUTO','LOCAL','CLOUD'].map(x=><button key={x} onClick={()=>setRoute(x)} className={`rounded border px-5 py-2 text-xs font-bold ${route===x?'border-green-400 bg-green-400/15 text-green-300 shadow-[0_0_18px_rgba(34,197,94,.25)]':'border-cyan-800 bg-[#061622] text-cyan-200'}`}>{x}</button>)}</div>
      <div className="grid grid-cols-3 gap-2 text-xs">{['MAC ONLINE','VPS ONLINE','GPU ONLINE'].map(x=><div key={x} className="rounded border border-cyan-800 bg-black/30 p-3 text-center"><span className="text-green-400">●</span> {x}</div>)}</div>
    </header>

    <section className="mt-3 grid gap-3 xl:grid-cols-[180px_minmax(0,1.4fr)_minmax(320px,.9fr)_270px]">
      <aside className="rounded border border-cyan-800 bg-[#04101a] p-2">{nav.map((x,i)=><div key={x} className={`mb-1 rounded px-3 py-2 text-xs ${i===0?'bg-cyan-500/15 text-white ring-1 ring-cyan-400':'text-slate-400'}`}>{x}</div>)}</aside>
      <section className="rounded border border-cyan-700 bg-[#04101a] p-4">
        <div className="mb-4 flex items-center justify-between border-b border-cyan-900 pb-3"><div><span className="text-2xl font-black text-white">HERMES</span><span className="ml-3 text-[10px] tracking-widest text-cyan-400">AI OPERATOR · SECOND BRAIN</span></div><span className="text-xs text-green-400">● ONLINE</span></div>
        <div className="h-[500px] space-y-3 overflow-y-auto pr-1">
          {messages.length===0 && <><div className="rounded border border-cyan-900 bg-[#071a29] p-4"><b>You</b><p className="mt-2 text-sm text-slate-300">Deploy the latest WISE² build, run tests, and give me a full status.</p></div><div className="rounded border border-cyan-900 bg-black/30 p-4"><b>Hermes</b><p className="mt-2 text-sm text-cyan-100">Ready. I can inspect, reason, and execute through the connected WISE² operating layer.</p></div></>}
          {messages.map(m=><div key={m.id} className={`rounded border p-4 ${m.role==='user'?'border-cyan-800 bg-[#071a29]':'border-green-900/70 bg-black/30'}`}><b>{m.role==='user'?'You':'Hermes'}</b><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{m.content}</p></div>)}
          {isLoading && <div className="text-sm text-green-400">Hermes is working…</div>}{error && <div className="text-sm text-red-400">{error}</div>}
        </div>
        <div className="mt-4 rounded border border-cyan-900 bg-black/40 p-3 font-mono text-xs text-cyan-300"><div>$ route {route.toLowerCase()}</div><div>$ model {model || 'auto'} · provider {provider || 'local-first'}</div><div className="text-green-400">✓ Command layer ready</div></div>
      </section>      <section className="relative min-h-[650px] overflow-hidden rounded border border-cyan-700 bg-[radial-gradient(circle_at_50%_42%,rgba(0,174,255,.22),transparent_22%),linear-gradient(180deg,#061526,#02070d)] p-5 text-center">
        <p className="text-xl font-black tracking-wider text-white">WISE² COMMAND WORLD</p><p className="text-[10px] tracking-[.2em] text-cyan-300">REAL-TIME INTELLIGENCE. REAL-WORLD ACTION.</p>
        <div className="mx-auto mt-16 flex h-80 w-80 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/5 shadow-[0_0_80px_rgba(0,174,255,.3)]">
          <div className="flex h-48 w-48 flex-col items-center justify-center rounded-full border-2 border-cyan-300 bg-[#061522] shadow-[0_0_55px_rgba(0,200,255,.45)]"><span className="text-5xl font-black">W²</span><span className="mt-2 text-xs font-bold text-cyan-300">CONTEXT ENGINE</span><span className="mt-3 text-[10px] leading-5 text-slate-400">PEOPLE · PROJECTS<br/>KNOWLEDGE · OPERATIONS<br/>REAL-WORLD IMPACT</span></div>
        </div>
        <div className="absolute left-5 top-44 rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 text-xs">BUSINESS OPERATIONS</div><div className="absolute right-5 top-52 rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 text-xs">FIELD OPERATIONS</div><div className="absolute bottom-36 left-8 rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 text-xs">AI AGENTS</div><div className="absolute bottom-32 right-8 rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 text-xs">INFRASTRUCTURE</div>
        <p className="absolute bottom-8 left-0 right-0 text-sm font-bold tracking-[.16em] text-cyan-300">ONE CONNECTED OPERATING LAYER<br/><span className="text-[10px] text-slate-500">FROM INTELLIGENCE TO IMPACT</span></p>
      </section>
      <aside className="rounded border border-cyan-800 bg-[#04101a] p-3"><div className="mb-3 flex justify-between"><b>LIVE CONTEXT</b><span className="text-xs text-cyan-400">↻ Sync</span></div>{context.map(([a,b])=><div key={a} className="mb-2 rounded border border-cyan-900 bg-black/30 p-3"><div className="text-[10px] text-slate-500">{a}</div><div className={`text-sm ${b.includes('critical')?'text-green-400':'text-cyan-100'}`}>{b}</div></div>)}<div className="mt-4 border-t border-cyan-900 pt-3"><b className="text-xs">RECENT ACTIVITY</b>{['Build pipeline ready','Hermes chat connected','Knowledge indexed','HVAC agent available'].map(x=><div key={x} className="mt-2 text-xs text-slate-400"><span className="text-green-400">●</span> {x}</div>)}</div></aside>
    </section>

    <section className="mt-3 rounded border border-cyan-800 bg-[#04101a] p-3"><div className="mb-3 text-xs font-bold">WISE² AGENTS</div><div className="flex flex-wrap gap-2">{agents.map((a,i)=><button key={a} className={`rounded border px-4 py-2 text-xs ${i===0?'border-green-400 bg-green-400/10':'border-cyan-900 bg-black/30'}`}>{a} <span className="text-green-400">●</span></button>)}</div>
      <form onSubmit={submit} className="mt-3 flex gap-2"><button type="button" className="rounded border border-cyan-800 px-4">＋</button><button type="button" className="rounded border border-cyan-800 px-4">🎤</button><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask Hermes anything..." className="min-w-0 flex-1 rounded border border-cyan-800 bg-[#02070d] px-4 py-3 text-sm outline-none focus:border-cyan-400"/><div className="rounded border border-cyan-800 px-4 py-3 text-xs">Route: <b>{route}</b></div><button disabled={isLoading} className="rounded bg-cyan-500 px-8 font-bold text-black hover:bg-cyan-300 disabled:opacity-50">Send</button></form>
    </section>
  </main>;
}