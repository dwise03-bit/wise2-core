import React, { useMemo, useState } from "react";

function exportBlueprint(item) {
  const blob = new Blob([JSON.stringify({ schema: "wise-touch-blueprint/v1", ...item }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `${item.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "blueprint"}.json`; anchor.click();
  URL.revokeObjectURL(url);
}

export default function BlueprintVault({ items, onRemove, onBuild }) {
  const [query, setQuery] = useState("");
  const blueprints = useMemo(() => items.filter((item) => item.type === "hybrid" || item.type === "prompt").filter((item) => `${item.name} ${item.payload?.prompt || item.payload?.text || ""}`.toLowerCase().includes(query.trim().toLowerCase())), [items, query]);
  return <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Build District 02 · Blueprint Vault</div><h2 className="mt-3 text-3xl font-black uppercase sm:text-5xl">Blueprints</h2><p className="mt-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Lock it in. Name it. Own it. Build it again.</p></div><div className="rounded-2xl border border-orange-500/30 px-6 py-4 text-center"><div className="text-4xl font-black text-orange-400">{blueprints.length}</div><div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filed permits</div></div></div>
    <input aria-label="Search blueprints" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved blueprints and prompts..." className="mt-7 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white" />
    {blueprints.length === 0 ? <div className="mt-7 rounded-3xl border border-zinc-800 bg-black/40 p-8 text-zinc-400">No matching blueprints. Save a completed Hybrid or production prompt to file the first one.</div> : <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{blueprints.map((item, index) => { const prompt = item.payload?.prompt || item.payload?.text || ""; return <article key={`${item.type}:${item.id}`} className="wt-panel rounded-3xl border border-zinc-800 bg-black/50 p-5"><div className="flex items-center justify-between"><span className="text-2xl font-black text-orange-500">{String(index + 1).padStart(2, "0")}</span><span className="rounded-full border border-emerald-500/30 px-3 py-1 text-[10px] font-black uppercase text-emerald-300">Blueprint Locked</span></div><div className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-500">{item.type}</div><h3 className="mt-2 text-xl font-black uppercase">{item.name}</h3><p className="mt-3 line-clamp-5 whitespace-pre-wrap text-xs leading-5 text-zinc-500">{prompt}</p><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => onBuild(prompt)} className="rounded-xl bg-orange-500 px-3 py-3 text-sm font-black uppercase text-black">Build This</button><button type="button" onClick={() => exportBlueprint(item)} className="rounded-xl border border-zinc-700 px-3 py-3 text-sm font-black uppercase text-zinc-300">Export JSON</button><button type="button" onClick={() => navigator.clipboard?.writeText(prompt)} className="rounded-xl border border-zinc-700 px-3 py-3 text-sm font-black uppercase text-zinc-300">Copy Prompt</button><button type="button" onClick={() => onRemove(item)} className="rounded-xl border border-red-500/30 px-3 py-3 text-sm font-black uppercase text-red-300">Archive</button></div></article>; })}</div>}
  </section>;
}
