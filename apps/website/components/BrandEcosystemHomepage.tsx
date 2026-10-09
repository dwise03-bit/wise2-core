'use client';
import { motion, useReducedMotion } from 'framer-motion';

const stages=[['01','REQUEST','Tell WISE² what needs to happen.'],['02','WISE COMMAND','Hermes understands intent and routes the work.'],['03','HIVE INTELLIGENCE','Owl Eye verifies. Specialists prepare the outcome.'],['04','APPROVAL','You stay in control before consequential action.'],['05','EXECUTION','WISE² acts through connected tools and Hive Nodes.'],['06','SAUCE VAULT','Results return as reusable organizational knowledge.']] as const;
const specialists=['OWL EYE / RESEARCH + VERIFY','SALES','WEB','CREATIVE','OPERATIONS','FINANCE','SHANNON / AUTHORIZED SECURITY'];
const ringInsets=['0%','13%','26%'];
const nodePositions=['left-0 top-[46%]','right-0 top-[46%]','left-[38%] top-0','left-[40%] bottom-0'];

export function BrandEcosystemHomepage(){
 const reduce=useReducedMotion();
 return <main className="min-h-screen overflow-hidden bg-[#03050a] text-white">
  <section className="relative isolate min-h-[92vh] overflow-hidden border-b border-white/10 px-5 py-24 sm:px-8 lg:px-12">
   <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_38%,rgba(92,90,255,.18),transparent_22%),radial-gradient(circle_at_50%_45%,rgba(0,194,255,.10),transparent_42%),linear-gradient(180deg,#02040a_0%,#060817_55%,#02040a_100%)]"/>
   <div className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-16 lg:grid-cols-[1fr_.9fr]">
    <div><p className="text-xs font-bold uppercase tracking-[.32em] text-blue-300">WISE² / THE AI BUSINESS OPERATING SYSTEM</p>
     <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.055em] sm:text-7xl xl:text-8xl">Tell us what<br/><span className="bg-gradient-to-r from-white via-blue-200 to-violet-300 bg-clip-text text-transparent">needs to happen.</span></h1>
     <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">WISE² turns an outcome into researched, verified, approved and executed work—then compounds the result into reusable intelligence.</p>
     <div className="mt-10 flex flex-wrap gap-3"><a href="/hermes" className="rounded-full bg-white px-7 py-3 text-sm font-black text-[#03050a] transition hover:bg-blue-100">Put WISE² to work →</a><a href="#living-hive" className="rounded-full border border-blue-300/30 bg-blue-300/5 px-7 py-3 text-sm font-bold text-blue-100 transition hover:bg-blue-300/10">See the Hive at work</a></div>
     <p className="mt-6 text-xs tracking-wide text-slate-500">Research + verify before action · Approval before consequence · Results reported back</p>
    </div>
    <div className="relative mx-auto aspect-square w-full max-w-[560px]">
     {[0,1,2].map(r=><motion.div key={r} aria-hidden className="absolute rounded-full border border-blue-300/15" style={{inset:ringInsets[r]}} animate={reduce?undefined:{rotate:r%2?360:-360}} transition={{duration:28+r*9,repeat:Infinity,ease:'linear'}}/>)}
     <div className="absolute inset-[24%] rounded-full border border-violet-300/30 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,.32),rgba(112,110,255,.18)_22%,rgba(4,7,18,.95)_65%)] shadow-[0_0_100px_rgba(82,116,255,.22)]"><div className="flex h-full flex-col items-center justify-center text-center"><div className="text-5xl font-black tracking-[-.08em] sm:text-7xl">W²</div><div className="mt-3 text-[10px] font-bold tracking-[.28em] text-blue-200">WISE COMMAND</div><div className="mt-1 text-[9px] tracking-[.18em] text-violet-300">HERMES</div></div></div>
     {['OWL EYE','AGENTS','APPROVAL','NODES'].map((label,i)=><motion.div key={label} className={'absolute '+nodePositions[i]+' rounded-full border border-blue-300/25 bg-[#080c18]/90 px-4 py-2 text-[9px] font-bold tracking-[.16em] text-blue-100'} animate={reduce?undefined:{opacity:[.55,1,.55]}} transition={{duration:2.5+i*.4,repeat:Infinity}}>{label}</motion.div>)}
    </div>
   </div>
  </section>
  <section id="living-hive" className="mx-auto max-w-7xl px-5 py-24 sm:px-8"><p className="text-xs font-bold tracking-[.3em] text-violet-300">THE LIVING HIVE</p><h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-6xl">One request. The right intelligence. Human-controlled execution.</h2><div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-3">{stages.map(([n,t,d])=><div key={t} className="bg-[#060914] p-7"><div className="text-[10px] font-bold tracking-[.25em] text-blue-300">{n}</div><h3 className="mt-5 text-lg font-black">{t}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{d}</p></div>)}</div></section>
  <section className="border-y border-white/10 bg-[#050711] px-5 py-24 sm:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-xs font-bold tracking-[.3em] text-blue-300">ONE HIVE / MANY SPECIALISTS</p><h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-5xl">WISE Command routes the work.</h2><p className="mt-6 max-w-lg text-base leading-7 text-slate-400">Hermes coordinates context and progress. Owl Eye researches and verifies. Specialized agents prepare domain work. Shannon handles authorized security under stricter scope and approval gates.</p></div><div className="grid gap-3 sm:grid-cols-2">{specialists.map(x=><div key={x} className="rounded-2xl border border-blue-300/15 bg-blue-300/[.03] p-5 text-xs font-bold tracking-[.12em] text-slate-200">{x}</div>)}</div></div></section>
  <section className="mx-auto max-w-7xl px-5 py-24 text-center sm:px-8"><p className="text-xs font-bold tracking-[.3em] text-violet-300">YOUR BUSINESS. CONNECTED.</p><h2 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-6xl">The Hive doesn’t stop at an answer.</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400">Connected Hive Nodes and integrations turn approved decisions into outcomes. Completed work returns to Sauce Vault so the organization gets smarter with every cycle.</p><a href="/hermes" className="mt-10 inline-block rounded-full bg-gradient-to-r from-blue-200 to-violet-300 px-8 py-4 text-sm font-black text-[#03050a]">Tell WISE² what needs to happen →</a></section>
 </main>;
}
