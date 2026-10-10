import React, { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Clock3, GraduationCap, PlayCircle, Search } from "lucide-react";
import { LEARNING_RESOURCES, RESOURCE_PROGRESS_KEY, normalizeProgress, progressPercent, toggleResourceComplete } from "./resources.js";

function loadProgress() {
  try { return normalizeProgress(JSON.parse(window.localStorage.getItem(RESOURCE_PROGRESS_KEY) || "{}")); }
  catch { return normalizeProgress(); }
}

export default function ResourcesCenter({ onOpenTool }) {
  const [progress, setProgress] = useState(loadProgress);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("All");
  const [selectedId, setSelectedId] = useState(LEARNING_RESOURCES[0].id);
  const visible = useMemo(() => LEARNING_RESOURCES.filter((item) => (level === "All" || item.level === level) && `${item.title} ${item.type} ${item.level} ${item.summary}`.toLowerCase().includes(query.toLowerCase())), [level, query]);
  const selected = LEARNING_RESOURCES.find((item) => item.id === selectedId) || visible[0] || LEARNING_RESOURCES[0];
  const completed = progress.completedIds.includes(selected.id);
  const update = (id) => setProgress((current) => { const next = toggleResourceComplete(current, id); window.localStorage.setItem(RESOURCE_PROGRESS_KEY, JSON.stringify(next)); return next; });

  return <section className="overflow-hidden rounded-[2rem] border border-orange-500/30 bg-zinc-950">
    <header className="border-b border-orange-500/20 bg-gradient-to-r from-orange-950/60 via-zinc-950 to-black p-5 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end"><div><div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Build District 02 · Training Yard</div><h2 className="mt-3 text-4xl font-black uppercase sm:text-5xl">Resources // Learn & Grow</h2><p className="mt-3 text-sm font-bold uppercase tracking-wider text-zinc-400">Field guides, workshops, and production playbooks.</p></div><aside className="rounded-2xl border border-orange-500/30 bg-black/60 p-4"><div className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">Foreman Training Note</div><p className="mt-2 text-sm font-bold text-zinc-200">“Measure twice, build once. Unless it’s prompts—then test everything.”</p></aside></div>
    </header>

    <div className="grid gap-6 p-5 lg:grid-cols-[1fr_22rem] sm:p-8">
      <main>
        <section className="rounded-2xl border border-zinc-800 bg-black/40 p-5"><div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Builder Certification Path</div><div className="mt-2 text-3xl font-black">{progressPercent(progress)}% Complete</div></div><div className="text-xs font-bold uppercase text-zinc-500">{progress.completedIds.length} of {LEARNING_RESOURCES.length} modules</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-300 transition-all" style={{width:`${progressPercent(progress)}%`}}/></div></section>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"><label className="relative"><Search className="absolute left-4 top-4 text-zinc-600" size={18}/><input aria-label="Search learning resources" value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search guides, workshops, and playbooks..." className="h-12 w-full rounded-xl border border-zinc-800 bg-black pl-11 pr-4 text-sm"/></label><select aria-label="Filter learning level" value={level} onChange={(event)=>setLevel(event.target.value)} className="h-12 rounded-xl border border-zinc-800 bg-black px-4 text-sm"><option>All</option><option>Starter</option><option>Builder</option><option>Pro</option></select></div>

        {visible.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{visible.map((item)=><button type="button" key={item.id} onClick={()=>setSelectedId(item.id)} className={`rounded-2xl border p-5 text-left transition ${selected.id === item.id ? "border-orange-500 bg-orange-500/10" : "border-zinc-800 bg-black/40 hover:border-orange-500/40"}`}><div className="flex items-start justify-between gap-3"><div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">{progress.completedIds.includes(item.id)?<CheckCircle2 size={22}/>:<BookOpen size={22}/>}</div><span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${progress.completedIds.includes(item.id)?"bg-emerald-500/15 text-emerald-300":"bg-zinc-900 text-zinc-500"}`}>{progress.completedIds.includes(item.id)?"Complete":item.level}</span></div><div className="mt-4 text-xs font-black uppercase tracking-wider text-orange-400">{item.type}</div><h3 className="mt-2 text-xl font-black uppercase">{item.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{item.summary}</p><div className="mt-4 flex items-center gap-2 text-xs font-bold text-zinc-500"><Clock3 size={14}/>{item.minutes} minute module</div></button>)}</div>:<div className="mt-5 rounded-2xl border border-zinc-800 bg-black/40 p-8 text-zinc-500">No training modules match that search.</div>}
      </main>

      <aside className="self-start rounded-2xl border border-orange-500/30 bg-black/60 p-5 lg:sticky lg:top-5"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-orange-400"><GraduationCap size={18}/> Active Module</div><h3 className="mt-4 text-2xl font-black uppercase">{selected.title}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{selected.summary}</p><div className="mt-5 space-y-2">{selected.steps.map((step,index)=><div key={step} className="flex gap-3 rounded-xl border border-zinc-800 p-3"><span className="font-mono text-xs font-black text-orange-400">{String(index+1).padStart(2,"0")}</span><span className="text-xs font-bold leading-5 text-zinc-300">{step}</span></div>)}</div><button type="button" onClick={()=>onOpenTool(selected.destination)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-xs font-black uppercase text-black"><PlayCircle size={17}/> Open Practice Tool</button><button type="button" onClick={()=>update(selected.id)} className={`mt-3 w-full rounded-xl border py-3 text-xs font-black uppercase ${completed?"border-emerald-500/50 text-emerald-300":"border-zinc-700 text-zinc-300"}`}>{completed?"✓ Marked Complete":"Mark Module Complete"}</button></aside>
    </div>
  </section>;
}
