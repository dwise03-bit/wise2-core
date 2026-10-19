import React, { useEffect, useMemo, useRef, useState } from "react";
import { ServerCog, Sparkles, Upload } from "lucide-react";
import { getSubsystemsForSystem } from "../../data/catalog.js";
import { buildHybridPrompt } from "../hybrid/hybrid.js";
import { generateImage, getImageEntitlement, listImageProviders, transformImage } from "../image/imageClient.js";
import {
  ASPECT_RATIOS,
  BLEND_TOTAL,
  applyGeneratedPrompt,
  blendStatus,
  canGenerate,
  completeGeneration,
  createProject,
  editPrompt,
  failGeneration,
  rebalanceBlend,
  restoreProject,
  selectResult,
  selectSubsystem,
  selectSystem,
  serializeProject,
  setBlendSlots,
  setSource,
  startGeneration,
  updateSettings,
} from "./projectState.js";

const STORAGE_KEY = "wise-touch-workspace:v1";
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SLOTS = 4;

function loadProject() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? restoreProject(JSON.parse(raw)) : createProject();
  } catch {
    return createProject();
  }
}

function saveProject(project) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProject(project))); } catch { /* storage may be blocked; the workspace still works */ }
}

/** Plain-language prompt from the current selection. Respects manual edits upstream. */
function promptFor(project, systemById, subsystemById) {
  const system = systemById.get(project.systemId);
  const active = project.blendSlots.filter((slot) => slot.weight > 0);
  if (active.length >= 2 && blendStatus(project.blendSlots).valid) {
    const slots = active.map((slot) => ({
      sourceType: slot.sourceType,
      weight: slot.weight,
      source: slot.sourceType === "subsystem" ? subsystemById.get(slot.sourceId) : systemById.get(slot.sourceId),
    })).filter((slot) => slot.source);
    return buildHybridPrompt(slots);
  }
  if (!system) return "";
  const sub = project.subsystem ? subsystemById.get(project.subsystem.id) : null;
  const core = sub?.description || system.coreDNA || system.vibe || system.description || "";
  return [`WISE TOUCH ${system.name}${sub ? ` — ${sub.name}` : ""}`, core, "Preserve the subject's identity, pose, and key details. Apply the selected art direction."].filter(Boolean).join("\n\n");
}

export default function UnifiedCreativeWorkspace({ systems = [], initialPrompt = "", onCompleted }) {
  const [project, setProject] = useState(loadProject);
  const [sourceFile, setSourceFile] = useState(null);
  const [sourcePreview, setSourcePreview] = useState("");
  const [provider, setProvider] = useState(null);
  const [entitlement, setEntitlement] = useState({ active: false, watermarkRequired: true });
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const seeded = useRef(false);

  const systemById = useMemo(() => new Map(systems.map((item) => [item.id, item])), [systems]);
  const subsystemById = useMemo(() => {
    const map = new Map();
    systems.forEach((system) => getSubsystemsForSystem(system.id).forEach((sub) => sub && map.set(sub.id, sub)));
    return map;
  }, [systems]);
  const subsystemOptions = useMemo(() => (project.systemId ? getSubsystemsForSystem(project.systemId).filter(Boolean) : []), [project.systemId]);
  const filteredSystems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term ? systems.filter((item) => item.name.toLowerCase().includes(term)) : systems;
  }, [systems, query]);

  const blend = blendStatus(project.blendSlots);
  const gate = canGenerate(project);
  const selected = project.history.find((item) => item.id === project.selectedResultId) || null;
  const providerReady = Boolean(provider?.configured);

  useEffect(() => { try { saveProject(project); } catch { /* ignored */ } }, [project]);
  useEffect(() => { listImageProviders().then((items) => setProvider(items[0] || null)).catch(() => setProvider({ configured: false, name: "Local image engine" })); }, []);
  useEffect(() => { getImageEntitlement().then(setEntitlement).catch(() => {}); }, []);
  useEffect(() => {
    if (!sourceFile) { setSourcePreview(""); return undefined; }
    const url = URL.createObjectURL(sourceFile);
    setSourcePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [sourceFile]);
  // Seed the prompt once from another tab's "build this" action. Typed edits still win later.
  useEffect(() => {
    if (!initialPrompt || seeded.current) return;
    seeded.current = true;
    setProject((current) => editPrompt(current, initialPrompt));
  }, [initialPrompt]);
  // Keep the generated prompt in step with selections, unless the person has edited it.
  const selectionKey = JSON.stringify([project.systemId, project.subsystem, project.blendSlots]);
  useEffect(() => {
    const text = promptFor(project, systemById, subsystemById);
    if (text) setProject((current) => applyGeneratedPrompt(current, text));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, systemById, subsystemById]);

  const onFile = (file) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) { setNotice("Upload a PNG, JPEG, or WebP image."); return; }
    if (file.size > MAX_BYTES) { setNotice("That image is over 10MB. Choose a smaller file."); return; }
    setNotice("");
    setSourceFile(file);
    setProject((current) => setSource(current, { name: file.name, type: file.type, size: file.size }));
  };

  const removeSource = () => {
    setSourceFile(null);
    setProject((current) => setSource(current, null));
  };

  const generate = async () => {
    setNotice("");
    if (!providerReady) { setNotice("The local image engine is not connected. Set LOCAL_IMAGE_API_URL and start the engine."); return; }
    if (project.source && !sourceFile) { setNotice("Re-upload your photo to transform it. Saved projects keep your settings, not the file."); return; }
    if (!gate.allowed) { setNotice(gate.reasons[0]); return; }
    const running = startGeneration(project);
    setProject(running);
    const input = {
      prompt: running.prompt.draft,
      negativePrompt: running.settings.negativePrompt,
      aspectRatio: running.settings.aspectRatio,
      steps: running.settings.steps,
      strength: running.settings.strength,
    };
    try {
      const result = sourceFile ? await transformImage(sourceFile, input) : await generateImage(input);
      setProject((current) => completeGeneration(current, result));
      onCompleted?.(result, { ...input, sourceName: sourceFile?.name || null });
    } catch (error) {
      setProject((current) => failGeneration(current, error.message));
    }
  };

  const updateSlot = (index, patch) => {
    const slots = project.blendSlots.map((slot, position) => (position === index ? { ...slot, ...patch } : slot));
    setProject((current) => setBlendSlots(current, slots));
  };
  const addSlot = () => {
    const first = systems[0];
    if (!first || project.blendSlots.length >= MAX_SLOTS) return;
    setProject((current) => setBlendSlots(current, [...current.blendSlots, { sourceId: first.id, sourceType: "system", parentId: null, weight: 0 }]));
  };
  const removeSlot = (index) => setProject((current) => setBlendSlots(current, current.blendSlots.filter((_, position) => position !== index)));

  const sourceOptions = [
    ...systems.map((system) => ({ id: system.id, type: "system", parentId: null, label: system.name })),
    ...[...subsystemById.values()].map((sub) => ({ id: sub.id, type: "subsystem", parentId: sub.parentSystemId, label: `${systemById.get(sub.parentSystemId)?.name || "System"} — ${sub.name}` })),
  ];

  return (
    <section aria-labelledby="workspace-title" className="rounded-[1.5rem] border border-orange-500/30 bg-zinc-950 text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-500/20 bg-black/60 p-4 sm:p-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-400">Build District 02 · Creative Workspace</p>
          <h2 id="workspace-title" className="text-2xl font-black uppercase sm:text-3xl">One window. Source to finished image.</h2>
        </div>
        <div className="text-xs font-bold text-zinc-400" aria-live="polite">
          {providerReady ? <span className="text-emerald-300">● Local engine ready</span> : <span className="text-amber-300">● {provider ? "Local engine not connected" : "Checking engine…"}</span>}
          <span className="ml-3">{entitlement.active ? "Pro · clean downloads" : "Free · W² watermark"}</span>
        </div>
      </header>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[14rem_1fr_19rem]">
        {/* Left: source */}
        <aside aria-label="Source photo" className="space-y-3">
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-black/50 p-4 text-center hover:border-orange-500 focus-within:border-orange-500">
            <Upload className="text-orange-400" aria-hidden="true" />
            <span className="mt-2 text-sm font-black">{project.source ? project.source.name : "Choose a photo"}</span>
            <span className="mt-1 text-xs text-zinc-500">PNG, JPEG, or WebP · 10MB max</span>
            <input aria-label="Upload source photo" type="file" accept={ACCEPTED.join(",")} className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
          </label>
          {project.source && <button type="button" onClick={removeSource} className="w-full rounded-lg border border-zinc-800 py-2 text-xs font-black uppercase text-zinc-300 hover:border-orange-500">Remove photo</button>}
          {project.source && !sourceFile && <p className="text-xs font-bold text-amber-300">Saved photo name only. Re-upload to transform it.</p>}
          {project.source === null && <p className="text-xs text-zinc-500">No photo: the engine generates from text only.</p>}
        </aside>

        {/* Center: canvas */}
        <main aria-label="Image canvas" className="min-w-0">
          <div className="flex min-h-[18rem] items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black/60 p-3 sm:min-h-[26rem]">
            {selected ? (
              <img src={selected.assetUrl} alt={`Finished build ${selected.id.slice(0, 8)}`} className="max-h-[32rem] w-auto max-w-full rounded-xl object-contain" />
            ) : sourcePreview ? (
              <img src={sourcePreview} alt="Your uploaded source photo" className="max-h-[32rem] w-auto max-w-full rounded-xl object-contain opacity-80" />
            ) : (
              <p className="max-w-sm text-center text-sm font-bold text-zinc-500">Pick a system, set your blend, and generate. Your finished image appears here and stays while you adjust settings.</p>
            )}
          </div>
          {selected && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-zinc-400">
              <span>{selected.watermarked ? "Free build · W² watermark baked in" : "Paid build · clean original"}</span>
              <a href={selected.assetUrl} download className="rounded-lg border border-emerald-500/40 px-3 py-2 font-black uppercase text-emerald-300">Download</a>
              <span>Filed in My Builds</span>
            </div>
          )}
          {project.history.length > 0 && (
            <nav aria-label="Build history" className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {project.history.map((item) => (
                <button key={item.id} type="button" onClick={() => setProject((current) => selectResult(current, item.id))} aria-current={item.id === project.selectedResultId ? "true" : undefined} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${item.id === project.selectedResultId ? "border-orange-500" : "border-zinc-800"}`}>
                  <img src={item.assetUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </nav>
          )}
        </main>

        {/* Right: contextual controls */}
        <aside aria-label="Creative controls" className="space-y-4">
          <fieldset className="space-y-2">
            <legend className="text-[11px] font-black uppercase tracking-wider text-orange-400">System</legend>
            <label className="block text-xs font-bold text-zinc-400">Search systems
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm" placeholder="Type to filter" />
            </label>
            <label className="block text-xs font-bold text-zinc-400">System
              <select value={project.systemId || ""} onChange={(event) => setProject((current) => selectSystem(current, event.target.value))} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black px-2 text-sm">
                <option value="" disabled>Choose a system</option>
                {filteredSystems.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold text-zinc-400">Subsystem
              <select value={project.subsystem?.id || ""} disabled={!subsystemOptions.length} onChange={(event) => { const sub = subsystemById.get(event.target.value); if (sub) setProject((current) => selectSubsystem(current, { id: sub.id, parentId: sub.parentSystemId })); }} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black px-2 text-sm disabled:opacity-40">
                <option value="">None</option>
                {subsystemOptions.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
              </select>
            </label>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-black uppercase tracking-wider text-orange-400">Blend</legend>
            <p className={`text-xs font-bold ${blend.valid ? "text-emerald-300" : "text-amber-300"}`} role="status">{blend.valid ? (blend.total ? `Total ${blend.total}% — ready` : "Single source. Add up to four to blend.") : blend.reason}</p>
            {project.blendSlots.map((slot, index) => (
              <div key={`${slot.sourceId}-${index}`} className="grid grid-cols-[1fr_4.5rem_auto] items-end gap-2">
                <label className="text-[11px] font-bold text-zinc-400">Source
                  <select value={slot.sourceId} onChange={(event) => { const option = sourceOptions.find((item) => item.id === event.target.value); if (option) updateSlot(index, { sourceId: option.id, sourceType: option.type, parentId: option.parentId }); }} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-black px-2 text-xs">
                    {sourceOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </label>
                <label className="text-[11px] font-bold text-zinc-400">%
                  <input type="number" min="0" max={BLEND_TOTAL} step="1" value={slot.weight} onChange={(event) => updateSlot(index, { weight: Math.min(BLEND_TOTAL, Math.max(0, Math.round(Number(event.target.value) || 0))) })} className="mt-1 h-9 w-full rounded-lg border border-zinc-800 bg-black px-2 text-xs" />
                </label>
                <button type="button" onClick={() => removeSlot(index)} aria-label={`Remove blend source ${index + 1}`} className="h-9 rounded-lg border border-zinc-800 px-2 text-xs font-black text-zinc-400 hover:border-orange-500">✕</button>
              </div>
            ))}
            <div className="flex gap-2">
              <button type="button" onClick={addSlot} disabled={project.blendSlots.length >= MAX_SLOTS} className="flex-1 rounded-lg border border-zinc-800 py-2 text-xs font-black uppercase text-zinc-300 hover:border-orange-500 disabled:opacity-40">Add source</button>
              <button type="button" onClick={() => setProject((current) => rebalanceBlend(current))} disabled={blend.valid} className="flex-1 rounded-lg border border-orange-500/40 py-2 text-xs font-black uppercase text-orange-300 disabled:opacity-40">Rebalance to 100</button>
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-black uppercase tracking-wider text-orange-400">Output</legend>
            <label className="block text-xs font-bold text-zinc-400">Aspect ratio
              <select value={project.settings.aspectRatio} onChange={(event) => setProject((current) => updateSettings(current, { aspectRatio: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black px-2 text-sm">
                {ASPECT_RATIOS.map((ratio) => <option key={ratio} value={ratio}>{ratio}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold text-zinc-400">Quality steps
              <input type="number" min="8" max="30" value={project.settings.steps} onChange={(event) => setProject((current) => updateSettings(current, { steps: Number(event.target.value) }))} className="mt-1 h-10 w-full rounded-lg border border-zinc-800 bg-black px-2 text-sm" />
            </label>
            {project.source && (
              <label className="block text-xs font-bold text-zinc-400">Photo transformation {Math.round(project.settings.strength * 100)}%
                <input type="range" min="0.15" max="0.9" step="0.01" value={project.settings.strength} onChange={(event) => setProject((current) => updateSettings(current, { strength: Number(event.target.value) }))} className="mt-2 w-full accent-orange-500" />
              </label>
            )}
          </fieldset>
        </aside>
      </div>

      {/* Bottom: prompt and generate */}
      <div className="border-t border-orange-500/20 bg-black/50 p-4 sm:p-5">
        <label className="block text-xs font-bold text-zinc-400">Prompt
          {project.prompt.manualOverride && <span className="ml-2 text-amber-300">Manual edit · selection changes won't overwrite it</span>}
          <textarea value={project.prompt.draft} onChange={(event) => setProject((current) => editPrompt(current, event.target.value))} className="mt-2 h-28 w-full rounded-xl border border-zinc-800 bg-black p-3 text-sm leading-6" aria-describedby="prompt-help" />
        </label>
        <p id="prompt-help" className="mt-1 text-xs text-zinc-500">Built from your system, subsystem, and blend. Edit freely; your text is kept.</p>
        {project.prompt.manualOverride && <button type="button" onClick={() => setProject((current) => applyGeneratedPrompt(current, promptFor(current, systemById, subsystemById), { force: true }))} className="mt-2 text-xs font-black uppercase text-orange-300 underline-offset-4 hover:underline">Use generated prompt again</button>}

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="button" onClick={generate} disabled={!gate.allowed || !providerReady || project.generation.status === "loading"} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF5C00] py-4 font-black uppercase text-black disabled:bg-zinc-800 disabled:text-zinc-500">
            <Sparkles size={18} aria-hidden="true" />{project.generation.status === "loading" ? "Building…" : sourceFile ? "Transform photo" : "Generate image"}
          </button>
          <span className="text-xs text-zinc-500"><ServerCog size={14} className="mr-1 inline" aria-hidden="true" />No per-image API fee · server power and storage still apply</span>
        </div>
        <div role="status" aria-live="polite" className="mt-3 min-h-5 text-sm font-bold">
          {notice && <span className="text-amber-300">{notice}</span>}
          {!notice && !gate.allowed && project.generation.status !== "loading" && <span className="text-zinc-400">{gate.reasons[0]}</span>}
          {project.generation.status === "error" && <span className="text-red-300">{project.generation.message}</span>}
          {project.generation.status === "success" && <span className="text-emerald-300">{project.generation.message}</span>}
        </div>
      </div>
    </section>
  );
}
