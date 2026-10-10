import React, { useEffect, useMemo, useState } from "react";
import { ASPECT_RATIOS, MOODS, generateProductionPrompt } from "../prompt-engine/promptEngine.js";
import { createVideoJob, getVideoJob, listVideoProviders } from "./videoClient.js";

const TERMINAL = new Set(["completed", "failed"]);

export default function VideoBuilder({ systems, systemById, subsystemById, onSavePrompt, onAssetCompleted, initialPrompt = "" }) {
  const first = systems[0];
  const [form, setForm] = useState({ systemId: first.id, subsystemId: first.subsystemIds[0] || "", subject: "", mood: MOODS[0], aspectRatio: "16:9", duration: 5, providerId: "lowest-cost", maxCostUsd: 1 });
  const [providers, setProviders] = useState([]);
  const [providerError, setProviderError] = useState("");
  const [draft, setDraft] = useState("");
  const [job, setJob] = useState(null);

  const system = systemById.get(form.systemId) || first;
  const subsystems = system.subsystemIds.map((id) => subsystemById.get(id)).filter(Boolean);
  const subsystem = form.subsystemId ? subsystemById.get(form.subsystemId) : null;
  const generated = useMemo(() => generateProductionPrompt({
    ...form, system, subsystem, outputType: "Video", targetEngine: "Universal",
    additionalInstructions: `Motion duration: ${form.duration} seconds. Create continuous cinematic movement suitable for video generation.`,
  }), [form, system, subsystem]);

  useEffect(() => { setDraft(initialPrompt || generated.text); }, [generated.text, initialPrompt]);
  useEffect(() => {
    let active = true;
    listVideoProviders(undefined, form.duration).then((result) => { if (active) setProviders(result.providers); }).catch((error) => { if (active) setProviderError(error.message); });
    return () => { active = false; };
  }, [form.duration]);
  useEffect(() => {
    if (!job || TERMINAL.has(job.status)) return undefined;
    const timer = window.setTimeout(async () => {
      try { setJob(await getVideoJob(job.id)); }
      catch (error) { setJob((current) => ({ ...current, error: error.message })); }
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [job]);
  useEffect(() => {
    if (job?.status === "completed" && job.assetUrl) onAssetCompleted(job, { system, subsystem, prompt: draft, aspectRatio: form.aspectRatio, duration: form.duration });
  }, [job?.id, job?.status, job?.assetUrl]);

  const cheapestProvider = providers.filter((provider) => provider.configured && Number.isFinite(provider.estimatedCostUsd)).sort((a,b)=>a.estimatedCostUsd-b.estimatedCostUsd)[0];
  const selectedProvider = form.providerId === "lowest-cost" ? cheapestProvider : providers.find((provider) => provider.id === form.providerId);
  const status = job?.status || "draft";
  const stages = ["Initializing Systems", "Blending DNA", "Building Visuals", "Refining Details", "Finalizing Output"];
  const activeStage = status === "completed" ? 5 : status === "processing" ? 3 : ["queued", "starting"].includes(status) ? 2 : status === "submitting" ? 1 : 0;
  const progress = status === "completed" ? 100 : status === "processing" ? 70 : ["queued", "starting"].includes(status) ? 35 : status === "submitting" ? 15 : 0;
  const foremanLine = status === "completed"
    ? "Built. Inspected. Beautiful. Next."
    : status === "failed"
      ? "Who wired this thing? Gimme a second."
      : status === "processing"
        ? "Stand back. Sparks are flyin'."
        : ["submitting", "queued", "starting"].includes(status)
          ? "Aight, hold up. I'm layin' every pixel like concrete."
          : selectedProvider && !selectedProvider.configured
            ? "Boss, this provider panel needs wiring before we fire it up."
            : "Blueprint loaded. Let's bring it to life.";
  const submit = async () => {
    setJob({ status: "submitting", error: null });
    try {
      setJob(await createVideoJob({ providerId: form.providerId, prompt: draft, options: { aspectRatio: form.aspectRatio, duration: Number(form.duration), maxCostUsd: Number(form.maxCostUsd) } }));
    } catch (error) {
      setJob({ status: "failed", error: error.message });
    }
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-orange-500/30 bg-zinc-950 shadow-2xl shadow-orange-950/20">
      <div className="border-b border-orange-500/20 bg-gradient-to-r from-orange-950/60 via-zinc-950 to-zinc-950 p-5 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.32em] text-orange-400">Step 06 · Generation Bay</div>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none sm:text-5xl">Generate Your <span className="text-orange-500">Masterpiece</span></h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">Turn the approved blueprint into motion, monitor every fabrication stage, and file the finished output directly into My Builds.</p>
          </div>
          <aside className="rounded-2xl border border-orange-500/30 bg-black/60 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">Build Foreman · Live Inspection</div>
            <p className="mt-2 text-sm font-bold leading-6 text-zinc-200">“{foremanLine}”</p>
          </aside>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="grid gap-2 sm:grid-cols-5" aria-label="Generation progress">
          {stages.map((stage, index) => {
            const complete = index < activeStage;
            const active = index === activeStage && status !== "failed" && status !== "draft" && status !== "completed";
            return <div key={stage} className={`rounded-xl border p-3 ${complete ? "border-orange-500 bg-orange-500/15" : active ? "border-amber-300 bg-amber-300/10" : "border-zinc-800 bg-black/40"}`}>
              <div className={`text-[10px] font-black uppercase tracking-wider ${complete || active ? "text-orange-400" : "text-zinc-600"}`}>{String(index + 1).padStart(2, "0")}</div>
              <div className="mt-1 text-xs font-black text-zinc-200">{stage}</div>
            </div>;
          })}
        </div>

      <div className="mt-8 rounded-3xl border border-zinc-800 bg-black/30 p-5">
        <div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Generation Specifications</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-zinc-300">System
          <select value={form.systemId} onChange={(event) => { const next = systemById.get(event.target.value); setForm((current) => ({ ...current, systemId: event.target.value, subsystemId: next?.subsystemIds[0] || "" })); }} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
            {systems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-zinc-300">Subsystem
          <select value={form.subsystemId} onChange={(event) => setForm((current) => ({ ...current, subsystemId: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
            <option value="">No Subsystem</option>{subsystems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-zinc-300 md:col-span-2">Subject or Scene
          <textarea value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Describe the subject, action, camera movement, and intended shot..." className="mt-2 h-28 w-full rounded-2xl border border-zinc-800 bg-black/50 p-4 text-white" />
        </label>
        <label className="text-sm font-bold text-zinc-300">Mood
          <select value={form.mood} onChange={(event) => setForm((current) => ({ ...current, mood: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">{MOODS.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-zinc-300">Provider
          <select value={form.providerId} onChange={(event) => setForm((current) => ({ ...current, providerId: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
            <option value="lowest-cost">Auto · Lowest configured cost</option>{(providers.length ? providers : [{ id: "replicate", name: "Replicate", configured: false }]).map((item) => <option key={item.id} value={item.id}>{item.name}{item.configured ? ` — ${Number.isFinite(item.estimatedCostUsd) ? `est. $${item.estimatedCostUsd.toFixed(2)}` : "price setup required"}` : " — Setup required"}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-zinc-300">Aspect Ratio
          <select value={form.aspectRatio} onChange={(event) => setForm((current) => ({ ...current, aspectRatio: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">{ASPECT_RATIOS.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="text-sm font-bold text-zinc-300">Duration
          <select value={form.duration} onChange={(event) => setForm((current) => ({ ...current, duration: Number(event.target.value) }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white"><option value={5}>5 seconds</option><option value={10}>10 seconds</option></select>
        </label>
        <label className="text-sm font-bold text-zinc-300">Maximum Video Spend
          <input aria-label="Maximum video spend" type="number" min="0.01" step="0.01" value={form.maxCostUsd} onChange={(event)=>setForm((current)=>({...current,maxCostUsd:event.target.value}))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white" />
        </label>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-orange-500/20 bg-black/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Live Blueprint · Build Instructions</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Editable before fabrication</div>
        </div>
        {(generated.valid || draft.trim()) ? <textarea aria-label="Editable video prompt" value={draft} onChange={(event) => setDraft(event.target.value)} className="mt-4 h-72 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm leading-6 text-zinc-200" /> : <div className="mt-4 text-sm font-bold text-red-400">{generated.errors.join(" ")}</div>}
        {providerError && <div className="mt-3 text-sm font-bold text-red-400">{providerError}</div>}
        {form.providerId === "lowest-cost" && !cheapestProvider && <div className="mt-3 text-sm font-bold text-amber-300">Lowest-cost mode needs at least one configured provider with current operator-supplied pricing.</div>}
        {selectedProvider && !selectedProvider.configured && <div className="mt-3 text-sm font-bold text-amber-300">{selectedProvider.name} needs server-side credentials before generation can start.</div>}
        {selectedProvider && Number.isFinite(selectedProvider.estimatedCostUsd) && <div className="mt-3 text-sm font-bold text-emerald-300">Preflight estimate: ${selectedProvider.estimatedCostUsd.toFixed(2)} · protected by your ${Number(form.maxCostUsd || 0).toFixed(2)} maximum.</div>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => onSavePrompt(draft, system, subsystem)} disabled={!draft.trim()} className="rounded-2xl border border-zinc-700 py-4 font-black text-zinc-200">Save Video Prompt</button>
          <button type="button" onClick={submit} disabled={!draft.trim() || !selectedProvider?.configured || (job && !TERMINAL.has(job.status))} className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-400 py-4 font-black uppercase tracking-wide text-black disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500">{job && !TERMINAL.has(job.status) ? "Build in Progress…" : "Start Masterpiece Build"}</button>
        </div>
      </div>

      {job && <div className="mt-6 rounded-3xl border border-zinc-800 bg-black/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Fabrication Status · {job.status}</div>
          {job.id && <div className="font-mono text-[10px] uppercase text-zinc-500">Build ID · {job.id}</div>}
        </div>
        {Number.isFinite(job.estimatedCostUsd) && <div className="mt-3 text-xs font-bold text-emerald-300">Estimated provider cost · ${job.estimatedCostUsd.toFixed(2)}</div>}
        {!job.error && <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-900"><div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-300 transition-all duration-700" style={{ width: `${progress}%` }} /></div>}
        {job.error && <div className="mt-3 text-sm font-bold text-red-400">{job.error}</div>}
        {job.assetUrl && <div className="mt-5"><video controls src={job.assetUrl} className="w-full rounded-2xl border border-zinc-800" /><div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-bold text-emerald-300">Masterpiece complete and filed in My Builds.</div></div>}
      </div>}
      </div>
    </section>
  );
}
