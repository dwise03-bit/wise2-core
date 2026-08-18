import React, { useMemo, useState } from "react";
import { filterAssets } from "./assets.js";

export default function AssetLibrary({ library, onDelete, onReusePrompt, onNewBuild }) {
  const [filters, setFilters] = useState({ query: "", type: "all", providerId: "all" });
  const results = useMemo(() => filterAssets(library, filters), [library, filters]);
  const providers = [...new Set(library.items.map((item) => item.providerId).filter(Boolean))];
  return (
    <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 sm:p-8">
      <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Build District 02 · Project Yard</div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-3xl font-black uppercase sm:text-5xl">My Builds</h2><p className="mt-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Every masterpiece lives here.</p></div><div className="flex items-center gap-4"><button type="button" onClick={onNewBuild} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-black uppercase text-black">+ New Build</button><div className="text-4xl font-black text-yellow-300">{library.items.length}</div></div></div>
      <div className="mt-7 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <input aria-label="Search generated assets" value={filters.query} onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))} placeholder="Search name, System, Subsystem, provider, or prompt..." className="h-14 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white" />
        <select aria-label="Filter asset type" value={filters.type} onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))} className="h-14 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white"><option value="all">All Types</option><option value="video">Video</option><option value="image">Image</option></select>
        <select aria-label="Filter provider" value={filters.providerId} onChange={(event) => setFilters((current) => ({ ...current, providerId: event.target.value }))} className="h-14 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white"><option value="all">All Providers</option>{providers.map((provider) => <option key={provider} value={provider}>{provider}</option>)}</select>
      </div>
      {results.length === 0 ? <div className="mt-7 rounded-3xl border border-zinc-800 bg-black/40 p-8 text-zinc-400">{library.items.length ? "No assets match these filters." : "Completed generations will appear here automatically."}</div> : (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          {results.map((asset) => <article key={asset.id} className="overflow-hidden rounded-3xl border border-zinc-800 bg-black/50">
            {asset.type === "video" ? <video controls preload="metadata" src={asset.assetUrl} className="aspect-video w-full bg-black object-contain" /> : <img src={asset.assetUrl} alt={asset.name} className="aspect-video w-full bg-black object-contain" />}
            <div className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div className="text-xs font-black uppercase tracking-widest text-cyan-300">{asset.type} · {asset.providerId}</div><div className="text-xs text-zinc-500">{new Date(asset.completedAt).toLocaleString()}</div></div><h3 className="mt-3 text-xl font-black">{asset.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">{asset.systemName && <span className="rounded-full border border-yellow-500/30 px-3 py-1 text-xs text-yellow-200">{asset.systemName}</span>}{asset.subsystemName && <span className="rounded-full border border-cyan-500/30 px-3 py-1 text-xs text-cyan-200">{asset.subsystemName}</span>}{asset.aspectRatio && <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{asset.aspectRatio}</span>}{asset.duration && <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{asset.duration}s</span>}</div>
              <details className="mt-4 rounded-2xl border border-zinc-800 p-3"><summary className="cursor-pointer text-sm font-black text-zinc-300">Production Prompt</summary><p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-zinc-500">{asset.prompt}</p></details>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><a href={asset.assetUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-700 px-3 py-3 text-center text-sm font-black text-zinc-200">Open</a><a href={asset.assetUrl} download className="rounded-xl border border-zinc-700 px-3 py-3 text-center text-sm font-black text-zinc-200">Download</a><button type="button" onClick={() => onReusePrompt(asset)} className="rounded-xl border border-yellow-500/40 px-3 py-3 text-sm font-black text-yellow-300">Reuse</button><button type="button" onClick={() => onDelete(asset.id)} className="rounded-xl border border-red-500/30 px-3 py-3 text-sm font-black text-red-300">Delete</button></div>
            </div>
          </article>)}
        </div>
      )}
    </section>
  );
}
