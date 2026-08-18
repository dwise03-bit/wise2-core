import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Factory,
  FolderKanban,
  HardHat,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { CATEGORY_COLORS } from "../data/legacyCatalog.js";
import { DEFAULT_SYSTEMS, SUBSYSTEMS, SUBSYSTEM_BY_ID, SYSTEM_BY_ID, getSubsystemForSystem } from "../data/catalog.js";
import {
  hasFavorite,
  hybridFavorite,
  loadFavorites,
  persistFavorites,
  promptFavorite,
  toggleFavorite as toggleFavoriteRecord,
} from "../features/favorites/favorites.js";
import { buildHybrid, buildHybridPrompt } from "../features/hybrid/hybrid.js";
import {
  ASPECT_RATIOS,
  MOODS,
  OUTPUT_TYPES,
  TARGET_ENGINES,
  generateProductionPrompt,
} from "../features/prompt-engine/promptEngine.js";
import { enhancePromptWithClaude } from "../features/prompt-engine/claudeClient.js";
import { hasAdvancedSearch, searchCatalog } from "../features/search/searchCatalog.js";
import VideoBuilder from "../features/video/VideoBuilder.jsx";
import AssetLibrary from "../features/assets/AssetLibrary.jsx";
import { assetFromVideoJob, loadAssets, persistAssets, removeAsset, upsertAsset } from "../features/assets/assets.js";
import AuthPanel from "../features/auth/AuthPanel.jsx";
import { getMe, getUserState, login, logout, mergeUserState, register, saveUserState } from "../features/auth/authClient.js";
import BlueprintVault from "../features/blueprints/BlueprintVault.jsx";
import BuildPreview from "../features/preview/BuildPreview.jsx";
import Storefront from "../features/commerce/Storefront.jsx";
import ResourcesCenter from "../features/resources/ResourcesCenter.jsx";
import AccountCenter from "../features/account/AccountCenter.jsx";
import CheckoutPanel from "../features/commerce/CheckoutPanel.jsx";
import { TAB_LABELS, WEBSITE_TABS, pathFromTab, tabFromPath } from "../routes/websiteRoutes.js";
import ImageBuilder from "../features/image/ImageBuilder.jsx";

function subsystemDescription(subsystem, system) {
  return getSubsystemForSystem(system.id, subsystem)?.description || `${subsystem.replace("™", "")} — ${system.vibe}`;
}

function lineBreak(count = 1) {
  return String.fromCharCode(...Array(count).fill(10));
}

function buildPrompt(system, subsystem = "") {
  const core = subsystem ? subsystemDescription(subsystem, system) : system.vibe;
  return [
    "WISE TOUCH PROMPT", "",
    `System: ${system.name}`,
    subsystem ? `Subsystem: ${subsystem}` : "",
    "", "CORE SYSTEM PROMPT:", core,
    "", "STYLE INSTRUCTIONS:",
    "Heavy cinematic atmosphere, premium composition, layered textures, analog realism, gritty detail, cinematic lighting, strong visual hierarchy, and high-end streetwear/editorial energy.",
    "", "TEXTURE RULES:",
    "35mm film grain, halftone print texture, dust, scratches, film burn edges, subtle chromatic aberration, distressed analog wear, cinematic contrast.",
    "", "COMPOSITION RULES:",
    "Preserve the important subject, pose, identity, clothing structure, product shape, and visual intent unless a full transformation is requested.",
    "", "OUTPUT GOAL:",
    "Create a fully realized Wise Touch cinematic visual using the system language above."
  ].filter(Boolean).join(lineBreak());
}

export default function WiseTouchDirectoryCleanRebuild() {
  const [tab, setTabState] = useState(() => typeof window === "undefined" ? "dashboard" : tabFromPath(window.location.pathname));
  const setTab = useCallback((next) => {
    const resolved = WEBSITE_TABS.includes(next) ? next : "dashboard";
    setTabState(resolved);
    if (typeof window !== "undefined" && window.location.pathname !== pathFromTab(resolved)) window.history.pushState({ tab: resolved }, "", pathFromTab(resolved));
  }, []);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchFilters, setSearchFilters] = useState({
    flagship: false,
    fullyDocumented: false,
    favorites: false,
    hybridReady: false,
    promptReady: false,
  });
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [selectedSubsystem, setSelectedSubsystem] = useState(null);
  const [manualCopyText, setManualCopyText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [currentPromptFavorite, setCurrentPromptFavorite] = useState(null);
  const [favoriteState, setFavoriteState] = useState(() => {
    try { return loadFavorites(typeof window === "undefined" ? null : window.localStorage, DEFAULT_SYSTEMS); }
    catch { return { version: 2, items: [] }; }
  });
  const [meterSlots, setMeterSlots] = useState([
    { sourceType: "system", source: DEFAULT_SYSTEMS[0], weight: 40 },
    { sourceType: "system", source: DEFAULT_SYSTEMS[1], weight: 30 },
    { sourceType: "system", source: DEFAULT_SYSTEMS[2], weight: 20 },
    { sourceType: "system", source: DEFAULT_SYSTEMS[3], weight: 10 },
  ]);
  const [dnaControls, setDnaControls] = useState({
    lineStyle: "Bold Ink / Cel",
    palette: "Neon Orange + Teal",
    lighting: "High Contrast",
    texture: "Gritty / Detailed",
    composition: "Dynamic Angle",
    mood: "Dark / Epic",
    detail: "Deep Layers",
    blendStrength: 70,
  });
  const [promptForm, setPromptForm] = useState({
    systemId: DEFAULT_SYSTEMS[0].id,
    subsystemId: DEFAULT_SYSTEMS[0].subsystemIds[0],
    subject: "",
    mood: MOODS[0],
    outputType: OUTPUT_TYPES[0],
    aspectRatio: ASPECT_RATIOS[0],
    targetEngine: TARGET_ENGINES[0],
    additionalInstructions: "",
  });
  const [promptDraft, setPromptDraft] = useState("");
  const [claudeState, setClaudeState] = useState({ status: "idle", message: "" });
  const [assetState, setAssetState] = useState(() => {
    try { return loadAssets(typeof window === "undefined" ? null : window.localStorage); }
    catch { return { version: 1, items: [] }; }
  });
  const [reusedVideoPrompt, setReusedVideoPrompt] = useState("");
  const [blueprintDraft, setBlueprintDraft] = useState("");
  const [authState, setAuthState] = useState({ user: null, status: "loading", message: "" });
  const [syncReady, setSyncReady] = useState(false);

  useEffect(() => {
    try { persistFavorites(typeof window === "undefined" ? null : window.localStorage, favoriteState); } catch {}
  }, [favoriteState]);
  useEffect(() => { const onPopState = () => setTabState(tabFromPath(window.location.pathname)); window.addEventListener("popstate", onPopState); return () => window.removeEventListener("popstate", onPopState); }, []);
  useEffect(() => {
    try { persistAssets(typeof window === "undefined" ? null : window.localStorage, assetState); } catch {}
  }, [assetState]);
  const hydrateAccount = async (user) => { const remote = (await getUserState()).state; const merged = mergeUserState(remote, { favorites: favoriteState, assets: assetState }); setFavoriteState(merged.favorites); setAssetState(merged.assets); await saveUserState(merged); setAuthState({ user, status: "success", message: "Account synced." }); setSyncReady(true); };
  useEffect(() => { getMe().then(({ user }) => hydrateAccount(user)).catch(() => { setAuthState({ user: null, status: "idle", message: "" }); setSyncReady(false); }); }, []);
  useEffect(() => { if (!authState.user || !syncReady) return undefined; const timer = window.setTimeout(() => saveUserState({ favorites: favoriteState, assets: assetState }).catch(() => setAuthState((current) => ({ ...current, status: "error", message: "Account sync failed; local backup is safe." }))), 600); return () => window.clearTimeout(timer); }, [favoriteState, assetState, authState.user, syncReady]);
  const submitAuth = async (mode, form) => { setAuthState({ user: null, status: "loading", message: "" }); try { const result = await (mode === "register" ? register(form) : login(form)); await hydrateAccount(result.user); } catch (error) { setAuthState({ user: null, status: "error", message: error.message }); } };

  const categories = useMemo(() => ["ALL", ...new Set(DEFAULT_SYSTEMS.map((system) => system.category))], []);
  const subsystemTotal = DEFAULT_SYSTEMS.reduce((sum, system) => sum + system.subsystems.length, 0);
  const currentHybrid = useMemo(() => buildHybrid(meterSlots), [meterSlots]);
  const meterTotal = currentHybrid.totalWeight;
  const meterReady = currentHybrid.valid;
  const hybridBlueprintPrompt = useMemo(() => `${buildHybridPrompt(meterSlots)}\n\nVISUAL DNA ASSEMBLY:\n${Object.entries(dnaControls).map(([key, value]) => `${key.replace(/([A-Z])/g, " $1").toUpperCase()}: ${value}`).join("\n")}`, [meterSlots, dnaControls]);
  const foremanLine = meterTotal === 100 ? "There we go. Hundred percent. Now we’re up to code." : meterTotal > 100 ? `Whoa, Picasso. We got ${meterTotal}%. Math ain’t optional on this job.` : tab === "video" ? "Stand back. Sparks are flyin’." : tab === "directory" ? "Aight, lemme see the blueprints." : "You bring the idea. I’ll make sure the thing don’t fall over.";
  const promptSystem = SYSTEM_BY_ID.get(promptForm.systemId) || DEFAULT_SYSTEMS[0];
  const promptSubsystemOptions = promptSystem.subsystemIds.map((id) => SUBSYSTEM_BY_ID.get(id)).filter(Boolean);
  const promptSubsystem = promptForm.subsystemId ? SUBSYSTEM_BY_ID.get(promptForm.subsystemId) : null;
  const promptResult = useMemo(() => generateProductionPrompt({
    ...promptForm,
    system: promptSystem,
    subsystem: promptSubsystem,
  }), [promptForm, promptSystem, promptSubsystem]);

  useEffect(() => {
    setPromptDraft(promptResult.text);
    setClaudeState({ status: "idle", message: "" });
  }, [promptResult.text]);
  useEffect(() => { setBlueprintDraft(hybridBlueprintPrompt); }, [hybridBlueprintPrompt]);

  const filteredSystems = useMemo(() => {
    const q = query.toLowerCase();
    return DEFAULT_SYSTEMS.filter((system) => {
      const searchable = `${system.name} ${system.category} ${system.vibe} ${(system.tags || []).join(" ")} ${system.subsystems.join(" ")}`.toLowerCase();
      return searchable.includes(q) && (categoryFilter === "ALL" || system.category === categoryFilter);
    });
  }, [query, categoryFilter]);

  const groupedSystems = useMemo(() => filteredSystems.reduce((groups, system) => {
    if (!groups[system.category]) groups[system.category] = [];
    groups[system.category].push(system);
    return groups;
  }, {}), [filteredSystems]);

  const favoriteItems = favoriteState.items;
  const favoriteSystems = DEFAULT_SYSTEMS.filter((system) => hasFavorite(favoriteState, "system", system.id));
  const favoriteIds = favoriteItems.map((item) => item.id);
  const searchMode = Boolean(query.trim()) || hasAdvancedSearch(searchFilters);
  const searchResults = useMemo(() => searchCatalog({
    systems: DEFAULT_SYSTEMS,
    subsystems: SUBSYSTEMS,
    query,
    filters: { ...searchFilters, category: categoryFilter },
    favoriteIds,
  }), [query, categoryFilter, searchFilters, favoriteIds.join("|")]);

  const copyText = async (text, favorite = null) => {
    setManualCopyText(text);
    setCurrentPromptFavorite(favorite);
    setCopyStatus("Prompt generated. Select from the preview if it does not copy automatically.");
    let copied = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {}
    if (!copied) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        copied = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {}
    }
    setCopyStatus(copied ? "Copied to clipboard." : "Prompt generated. Select it from the preview and press Ctrl+C.");
  };

  const toggleFavorite = (item) => {
    const next = toggleFavoriteRecord(favoriteState, item);
    setFavoriteState(next);
  };

  const systemFavorite = (system) => ({ type: "system", id: system.id, name: system.name });
  const subsystemFavorite = (subsystem) => ({ type: "subsystem", id: subsystem.id, name: subsystem.name, parentSystemId: subsystem.parentSystemId });

  const updateMeterSlot = (index, patch) => {
    setMeterSlots((current) => current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)));
  };

  const openSearchResult = (result) => {
    if (result.type === "system") {
      setSelectedSystem(result.record);
      setSelectedSubsystem(null);
      return;
    }

    const parent = SYSTEM_BY_ID.get(result.record.parentSystemId);
    if (parent) {
      setSelectedSystem(parent);
      setSelectedSubsystem(result.record);
    }
  };

  const openFavorite = (item) => {
    if (item.type === "system") {
      const system = SYSTEM_BY_ID.get(item.id);
      if (system) setSelectedSystem(system);
      return;
    }
    if (item.type === "subsystem") {
      const subsystem = SUBSYSTEM_BY_ID.get(item.id);
      const parent = subsystem ? SYSTEM_BY_ID.get(subsystem.parentSystemId) : null;
      if (subsystem && parent) { setSelectedSystem(parent); setSelectedSubsystem(subsystem); }
      return;
    }
    const text = item.type === "prompt" ? item.payload?.text : item.payload?.prompt;
    if (text) copyText(text, item.type === "prompt" ? item : null);
  };

  if (selectedSystem && selectedSubsystem) {
    return (
      <main className="min-h-screen bg-black p-4 text-white sm:p-6">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={() => setSelectedSubsystem(null)} className="mb-6 rounded-2xl border border-zinc-700 px-4 py-3 font-bold text-zinc-300">← Back to {selectedSystem.name}</button>
          {manualCopyText && (
            <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-zinc-950 p-4">
              <div className="mb-3 text-sm font-black text-yellow-300">{copyStatus}</div>
              <textarea value={manualCopyText} readOnly onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} className="h-60 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-200" />
              {currentPromptFavorite && <button type="button" onClick={() => toggleFavorite(currentPromptFavorite)} className="mt-3 rounded-xl border border-yellow-500/40 px-4 py-2 text-sm font-black text-yellow-300">{hasFavorite(favoriteState, "prompt", currentPromptFavorite.id) ? "★ Prompt Saved" : "☆ Save Prompt"}</button>}
            </div>
          )}
          <article className="rounded-[2rem] border border-yellow-500/20 bg-zinc-950 p-6 sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">WT Docs · Subsystem</div>
            <h1 className="mt-4 text-3xl font-black sm:text-5xl">{selectedSubsystem.name}</h1>
            <button type="button" onClick={() => setSelectedSubsystem(null)} className="mt-3 text-left text-sm font-bold text-zinc-400 hover:text-yellow-300">Parent: {selectedSystem.name}</button>
            <p className="mt-6 text-base leading-7 text-zinc-300">{selectedSubsystem.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-300">{selectedSubsystem.category}</span>
              <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">Hybrid Ready</span>
              <span className="rounded-full border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-300">Prompt Ready</span>
              <span className="rounded-full border border-yellow-500/40 px-3 py-1 text-xs font-bold text-yellow-300">Docs: {selectedSubsystem.documentationStatus}</span>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Visual DNA</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                  {selectedSubsystem.visualDNA.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </section>
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Use Cases</h2>
                {selectedSubsystem.useCases.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm text-zinc-300">{selectedSubsystem.useCases.map((item) => <li key={item}>• {item}</li>)}</ul>
                ) : <p className="mt-4 text-sm leading-6 text-zinc-500">Authoritative use cases have not been documented yet.</p>}
              </section>
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Related Systems</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{selectedSubsystem.relatedSystemIds.length > 0 ? selectedSubsystem.relatedSystemIds.join(", ") : "No authoritative relationships documented yet."}</p>
              </section>
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Related Subsystems</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{selectedSubsystem.relatedSubsystemIds.length > 0 ? selectedSubsystem.relatedSubsystemIds.join(", ") : "No authoritative relationships documented yet."}</p>
              </section>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => { const text = buildPrompt(selectedSystem, selectedSubsystem.name); copyText(text, promptFavorite(text, selectedSubsystem.id, `${selectedSubsystem.name} Prompt`)); }} className="rounded-2xl bg-yellow-500 px-5 py-4 font-black text-black">Generate & Copy Prompt</button>
              <button type="button" onClick={() => toggleFavorite(subsystemFavorite(selectedSubsystem))} className={`rounded-2xl border px-5 py-4 font-black ${hasFavorite(favoriteState, "subsystem", selectedSubsystem.id) ? "border-yellow-400 bg-yellow-500 text-black" : "border-zinc-700 text-zinc-200"}`}>{hasFavorite(favoriteState, "subsystem", selectedSubsystem.id) ? "★ Subsystem Saved" : "☆ Save Subsystem"}</button>
              <button type="button" onClick={() => { setMeterSlots((current) => current.map((slot, index) => index === 0 ? { ...slot, sourceType: "subsystem", source: selectedSubsystem } : slot)); setSelectedSubsystem(null); setSelectedSystem(null); setTab("meter"); }} className="rounded-2xl border border-zinc-700 px-5 py-4 font-black text-zinc-200">Use Subsystem in Hybrid</button>
            </div>
          </article>
        </div>
      </main>
    );
  }

  if (selectedSystem) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <button onClick={() => setSelectedSystem(null)} className="mb-6 rounded-2xl border border-zinc-700 px-4 py-3 font-bold text-zinc-300">← Back</button>
          {manualCopyText && (
            <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-zinc-950 p-4">
              <div className="mb-3 text-sm font-black text-yellow-300">{copyStatus}</div>
              <textarea value={manualCopyText} readOnly onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} className="h-60 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-200" />
              {currentPromptFavorite && <button type="button" onClick={() => toggleFavorite(currentPromptFavorite)} className="mt-3 rounded-xl border border-yellow-500/40 px-4 py-2 text-sm font-black text-yellow-300">{hasFavorite(favoriteState, "prompt", currentPromptFavorite.id) ? "★ Prompt Saved" : "☆ Save Prompt"}</button>}
            </div>
          )}
          <article className="rounded-[2rem] border border-yellow-500/20 bg-zinc-950 p-6 sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">WT Docs · System</div>
            <h1 className="mt-4 text-3xl font-black sm:text-5xl">{selectedSystem.name}</h1>
            <p className="mt-6 max-w-4xl text-base leading-7 text-zinc-300">{selectedSystem.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-300">{selectedSystem.category}</span>
              {selectedSystem.flagship && <span className="rounded-full border border-yellow-500/40 px-3 py-1 text-xs font-bold text-yellow-300">Flagship</span>}
              <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">Hybrid Ready</span>
              <span className="rounded-full border border-cyan-500/40 px-3 py-1 text-xs font-bold text-cyan-300">Prompt Ready</span>
              <span className="rounded-full border border-yellow-500/40 px-3 py-1 text-xs font-bold text-yellow-300">Docs: {selectedSystem.documentationStatus}</span>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Core DNA</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-300">{selectedSystem.coreDNA}</p>
              </section>
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Visual DNA</h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                  {selectedSystem.visualDNA.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </section>
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Use Cases</h2>
                {selectedSystem.useCases.length > 0 ? (
                  <ul className="mt-4 space-y-3 text-sm text-zinc-300">{selectedSystem.useCases.map((item) => <li key={item}>• {item}</li>)}</ul>
                ) : <p className="mt-4 text-sm leading-6 text-zinc-500">Authoritative use cases have not been documented yet.</p>}
              </section>
              <section className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                <h2 className="text-lg font-black text-yellow-300">Related Systems</h2>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{selectedSystem.relatedSystemIds.length > 0 ? selectedSystem.relatedSystemIds.join(", ") : "No authoritative relationships documented yet."}</p>
              </section>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => { const text = buildPrompt(selectedSystem); copyText(text, promptFavorite(text, selectedSystem.id, `${selectedSystem.name} Prompt`)); }} className="rounded-2xl bg-yellow-500 px-5 py-4 font-black text-black">Generate & Copy Main Prompt</button>
              <button type="button" onClick={() => toggleFavorite(systemFavorite(selectedSystem))} className={`rounded-2xl border px-5 py-4 font-black ${hasFavorite(favoriteState, "system", selectedSystem.id) ? "border-yellow-400 bg-yellow-500 text-black" : "border-zinc-700 text-zinc-200"}`}>{hasFavorite(favoriteState, "system", selectedSystem.id) ? "★ Favorited" : "☆ Add to Favorites"}</button>
              <button type="button" onClick={() => { setMeterSlots((current) => current.map((slot, index) => index === 0 ? { ...slot, sourceType: "system", source: selectedSystem } : slot)); setSelectedSystem(null); setTab("meter"); }} className="rounded-2xl border border-zinc-700 px-5 py-4 font-black text-zinc-200">Use in Hybrid</button>
            </div>
          </article>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div><div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Subsystems</div><h2 className="mt-2 text-3xl font-black">{selectedSystem.subsystems.length} documentation records</h2></div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {selectedSystem.subsystems.map((subsystemName) => {
              const subsystem = getSubsystemForSystem(selectedSystem.id, subsystemName);
              return (
                <div key={subsystemName} className="rounded-3xl border border-zinc-800 bg-black/50 p-5">
                  <h2 className="text-xl font-black">{subsystemName}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{subsystemDescription(subsystemName, selectedSystem)}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => subsystem && setSelectedSubsystem(subsystem)} className="rounded-2xl border border-zinc-700 px-4 py-3 font-black text-zinc-200">View Docs</button>
                    <button type="button" onClick={() => { const text = buildPrompt(selectedSystem, subsystemName); copyText(text, promptFavorite(text, subsystem.id, `${subsystemName} Prompt`)); }} className="rounded-2xl bg-yellow-500 px-4 py-3 font-black text-black">Copy Prompt</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wt-shell min-h-screen bg-black p-3 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        {manualCopyText && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-zinc-950 p-4">
            <div className="mb-3 text-sm font-black text-yellow-300">{copyStatus}</div>
            <textarea value={manualCopyText} readOnly onFocus={(event) => event.currentTarget.select()} onClick={(event) => event.currentTarget.select()} className="h-60 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm text-zinc-200" />
            {currentPromptFavorite && <button type="button" onClick={() => toggleFavorite(currentPromptFavorite)} className="mt-3 rounded-xl border border-yellow-500/40 px-4 py-2 text-sm font-black text-yellow-300">{hasFavorite(favoriteState, "prompt", currentPromptFavorite.id) ? "★ Prompt Saved" : "☆ Save Prompt"}</button>}
          </div>
        )}
        <section className="wt-hero overflow-hidden rounded-[1.5rem] border border-orange-500/40 bg-zinc-950 p-5 sm:p-8">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3"><span className="wt-district">W²</span><span className="text-xs font-black uppercase tracking-[0.35em] text-orange-400">Build District 02 · 建設地区 02</span></div>
              <h1 className="mt-5 text-4xl font-black uppercase leading-[0.9] sm:text-6xl">WISE TOUCH<br/><span className="text-orange-500">Prompt Shop</span></h1>
              <p className="mt-5 max-w-2xl text-sm font-bold uppercase tracking-[0.16em] text-zinc-400">The build floor for visual DNA · Build. Mix. Create. Dominate.</p>
              <button type="button" onClick={() => setTab("directory")} className="wt-primary mt-6 rounded-xl bg-orange-500 px-6 py-4 font-black uppercase text-black">Enter the System Bays →</button>
            </div>
            <aside className="wt-foreman rounded-2xl border border-orange-500/40 bg-black/80 p-4">
              <div className="flex gap-4"><div className="wt-hardhat"><HardHat size={34}/></div><div><div className="text-xs font-black uppercase tracking-[0.25em] text-orange-400">Foreman Mode · Active</div><div className="mt-2 text-lg font-black italic leading-6">“{foremanLine}”</div></div></div>
              <div className="mt-4 flex items-center justify-between border-t border-orange-500/20 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500"><span>Build technician online</span><span className="text-emerald-400">● Up to code</span></div>
            </aside>
          </div>
        </section>

        <div className="mt-4"><AuthPanel {...authState} onSubmit={submitAuth} onLogout={async () => { await logout(); setAuthState({ user: null, status: "idle", message: "Signed out. Local backup remains available." }); setSyncReady(false); }} /></div>

        <nav aria-label="Primary website navigation" className="my-6 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3">
          <label className="block lg:hidden"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">Navigate Build District</span><select aria-label="Current website screen" value={tab} onChange={(event)=>setTab(event.target.value)} className="h-12 w-full rounded-xl border border-zinc-800 bg-black px-4 text-sm font-black uppercase text-white">{WEBSITE_TABS.map((item)=><option key={item} value={item}>{TAB_LABELS[item]}</option>)}</select></label>
          <div className="hidden flex-wrap gap-3 lg:flex">{WEBSITE_TABS.map((item) => (
            <button key={item} onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined} className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-wider ${tab === item ? "bg-orange-500 text-black" : "bg-black/40 text-zinc-400"}`}>{TAB_LABELS[item]}</button>
          ))}</div>
        </nav>

        {tab === "dashboard" && (
          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[[Factory, "System Bays", DEFAULT_SYSTEMS.length, "Browse visual systems", "directory"], [Boxes, "Subsystems", subsystemTotal, "Production DNA modules", "directory"], [SlidersHorizontal, "Hybrid Mix", `${meterTotal}%`, meterReady ? "Locked and structurally sound" : "Measurements required", "meter"], [FolderKanban, "My Builds", assetState.items.length, "Generated assets", "results"]].map(([Icon, label, value, note, target]) => <button key={label} type="button" onClick={() => setTab(target)} className="wt-panel rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-left"><Icon className="text-orange-500"/><div className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{label}</div><div className="mt-2 text-4xl font-black text-orange-400">{value}</div><div className="mt-2 text-xs font-bold uppercase text-zinc-500">{note}</div></button>)}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              <section className="wt-panel rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">// Quick Start · Six-Step Workflow</div><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["01","Select Systems","directory"],["02","Set Influence","meter"],["03","Assemble DNA","meter"],["04","Preview Build","preview"],["05","Save Blueprint","blueprints"],["06","Generate","video"]].map(([number,label,target])=><button key={number} onClick={()=>setTab(target)} className="rounded-xl border border-orange-500/20 bg-black/50 p-4 text-left transition hover:border-orange-500"><span className="text-2xl font-black text-orange-500">{number}</span><span className="mt-2 block text-xs font-black uppercase text-zinc-300">{label}</span></button>)}</div></section>
              <section className="wt-panel rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><div className="flex items-center gap-3"><Sparkles className="text-orange-500"/><div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Today’s Blueprint</div></div><h2 className="mt-5 text-2xl font-black uppercase">{currentHybrid.name || "Untitled Build"}</h2><p className="mt-3 text-sm leading-6 text-zinc-500">{currentHybrid.description || "Select systems and assemble your visual DNA."}</p><button onClick={()=>setTab("meter")} className="mt-5 w-full rounded-xl border border-orange-500/50 px-4 py-3 text-sm font-black uppercase text-orange-400">Open Hybrid Mixer →</button></section>
            </div>
          </section>
        )}

        {tab === "directory" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"><div className="text-xs uppercase tracking-widest text-zinc-500">Systems</div><div className="mt-2 text-4xl font-black text-yellow-300">{DEFAULT_SYSTEMS.length}</div></div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"><div className="text-xs uppercase tracking-widest text-zinc-500">Subsystems</div><div className="mt-2 text-4xl font-black text-yellow-300">{subsystemTotal}</div></div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"><div className="text-xs uppercase tracking-widest text-zinc-500">Favorites</div><div className="mt-2 text-4xl font-black text-yellow-300">{favoriteItems.length}</div></div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5"><div className="text-xs uppercase tracking-widest text-zinc-500">Categories</div><div className="mt-2 text-4xl font-black text-yellow-300">{categories.length - 1}</div></div>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Systems, Subsystems, DNA, descriptions, or use cases..." aria-label="Search WISE TOUCH catalog" className="h-14 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white" />
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-14 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            <div className="mb-8 mt-4 flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
              {[
                ["flagship", "Flagship"],
                ["fullyDocumented", "Fully Documented"],
                ["favorites", "Favorites"],
                ["hybridReady", "Hybrid Ready"],
                ["promptReady", "Prompt Ready"],
              ].map(([key, label]) => (
                <label key={key} className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold ${searchFilters[key] ? "border-yellow-400 bg-yellow-500 text-black" : "border-zinc-700 text-zinc-300"}`}>
                  <input type="checkbox" checked={searchFilters[key]} onChange={(event) => setSearchFilters((current) => ({ ...current, [key]: event.target.checked }))} className="sr-only" />
                  {label}
                </label>
              ))}
              {searchMode && <button type="button" onClick={() => { setQuery(""); setSearchFilters({ flagship: false, fullyDocumented: false, favorites: false, hybridReady: false, promptReady: false }); }} className="rounded-xl border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-400">Clear Search</button>}
            </div>

            {searchMode ? (
              <section>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                  <div><div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">WT Search</div><h2 className="mt-2 text-3xl font-black">{searchResults.length} results</h2></div>
                  <div className="text-sm text-zinc-500">{searchResults.filter((result) => result.type === "system").length} Systems · {searchResults.filter((result) => result.type === "subsystem").length} Subsystems</div>
                </div>
                {searchResults.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">No Systems or Subsystems match this search and filter combination.</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {searchResults.map((result) => {
                      const parent = result.type === "subsystem" ? SYSTEM_BY_ID.get(result.record.parentSystemId) : null;
                      return (
                        <button key={result.id} type="button" onClick={() => openSearchResult(result)} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 text-left transition hover:border-yellow-500/60">
                          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${result.type === "system" ? "bg-yellow-500 text-black" : "border border-cyan-500/40 text-cyan-300"}`}>{result.type}</div>
                          <h3 className="mt-4 text-xl font-black">{result.record.name}</h3>
                          {parent && <div className="mt-2 text-xs font-bold text-zinc-500">Parent: {parent.name}</div>}
                          <p className="mt-3 line-clamp-4 text-sm leading-6 text-zinc-400">{result.record.description}</p>
                          <div className="mt-4 text-xs font-bold uppercase tracking-wider text-yellow-300">{result.record.category}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedSystems).map(([category, systems]) => (
                  <section key={category}>
                    <h2 className="mb-4 text-3xl font-black text-yellow-300">{category} <span className="text-sm text-zinc-500">({systems.length} systems)</span></h2>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {systems.map((system, bayIndex) => (
                        <div key={system.name} className={`rounded-[2rem] border border-zinc-800 bg-gradient-to-br ${CATEGORY_COLORS[system.category] || CATEGORY_COLORS.default} p-5`}>
                          <button onClick={() => setSelectedSystem(system)} className="w-full text-left">
                            <div className="flex items-center justify-between"><div className="text-xs font-black uppercase tracking-widest text-yellow-300">Bay {String(bayIndex + 1).padStart(2, "0")} · {system.category}</div><span className="text-[10px] font-black uppercase text-zinc-600">DNA Locked</span></div>
                            <h3 className="mt-3 text-2xl font-black">{system.name}</h3>
                            <p className="mt-4 text-sm leading-6 text-zinc-400">{system.vibe}</p>
                          </button>
                          <div className="mt-5 flex gap-3">
                            <button type="button" onClick={() => toggleFavorite(systemFavorite(system))} className={`rounded-2xl border px-4 py-3 font-black ${hasFavorite(favoriteState, "system", system.id) ? "border-yellow-400 bg-yellow-500 text-black" : "border-zinc-700 text-zinc-300"}`}>★</button>
                            <button type="button" onClick={() => { const text = buildPrompt(system); copyText(text, promptFavorite(text, system.id, `${system.name} Prompt`)); }} className="flex-1 rounded-2xl bg-yellow-500 px-4 py-3 font-black text-black">Copy Main Prompt</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "prompt" && (
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 sm:p-8">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">WT Prompt Engine</div>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">Production Prompt Builder</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Build generator-ready direction from real WISE TOUCH System and Subsystem DNA.</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-bold text-zinc-300">System
                <select value={promptForm.systemId} onChange={(event) => { const system = SYSTEM_BY_ID.get(event.target.value); setPromptForm((current) => ({ ...current, systemId: event.target.value, subsystemId: system?.subsystemIds[0] || "" })); }} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
                  {DEFAULT_SYSTEMS.map((system) => <option key={system.id} value={system.id}>{system.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold text-zinc-300">Subsystem
                <select value={promptForm.subsystemId} onChange={(event) => setPromptForm((current) => ({ ...current, subsystemId: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
                  <option value="">No Subsystem</option>
                  {promptSubsystemOptions.map((subsystem) => <option key={subsystem.id} value={subsystem.id}>{subsystem.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold text-zinc-300 md:col-span-2">Subject or Concept
                <textarea value={promptForm.subject} onChange={(event) => setPromptForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Describe the subject, scene, product, character, or campaign concept..." className="mt-2 h-28 w-full rounded-2xl border border-zinc-800 bg-black/50 p-4 text-white" />
              </label>
              <label className="text-sm font-bold text-zinc-300">Mood
                <select value={promptForm.mood} onChange={(event) => setPromptForm((current) => ({ ...current, mood: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">{MOODS.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-bold text-zinc-300">Output Type
                <select value={promptForm.outputType} onChange={(event) => setPromptForm((current) => ({ ...current, outputType: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">{OUTPUT_TYPES.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-bold text-zinc-300">Aspect Ratio
                <select value={promptForm.aspectRatio} onChange={(event) => setPromptForm((current) => ({ ...current, aspectRatio: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">{ASPECT_RATIOS.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-bold text-zinc-300">Target Engine
                <select value={promptForm.targetEngine} onChange={(event) => setPromptForm((current) => ({ ...current, targetEngine: event.target.value }))} className="mt-2 h-14 w-full rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">{TARGET_ENGINES.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-bold text-zinc-300 md:col-span-2">Additional Instructions
                <textarea value={promptForm.additionalInstructions} onChange={(event) => setPromptForm((current) => ({ ...current, additionalInstructions: event.target.value }))} placeholder="Identity, wardrobe, product, typography, camera, motion, exclusions, or delivery requirements..." className="mt-2 h-28 w-full rounded-2xl border border-zinc-800 bg-black/50 p-4 text-white" />
              </label>
            </div>

            <div className="mt-8 rounded-3xl border border-yellow-500/20 bg-black/50 p-5">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Prompt Preview</div>
              {promptResult.valid ? <textarea aria-label="Editable production prompt" value={promptDraft} onChange={(event) => setPromptDraft(event.target.value)} className="mt-4 h-80 w-full rounded-2xl border border-zinc-800 bg-black p-4 text-sm leading-6 text-zinc-200" /> : <div className="mt-4 text-sm font-bold text-red-400">{promptResult.errors.join(" ")}</div>}
              {claudeState.message && <div className={`mt-3 text-sm font-bold ${claudeState.status === "error" ? "text-red-400" : "text-emerald-300"}`}>{claudeState.message}</div>}
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button type="button" disabled={!promptResult.valid || !promptDraft.trim()} onClick={() => { const favorite = promptFavorite(promptDraft, `engine:${promptSystem.id}:${promptSubsystem?.id || "none"}:${promptForm.outputType}:${promptForm.targetEngine}`, `${promptForm.outputType} — ${promptForm.subject}`); copyText(promptDraft, favorite); }} className={`rounded-2xl py-4 font-black ${promptResult.valid ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-500"}`}>Copy Production Prompt</button>
                <button type="button" disabled={!promptResult.valid || !promptDraft.trim()} onClick={() => { const favorite = promptFavorite(promptDraft, `engine:${promptSystem.id}:${promptSubsystem?.id || "none"}:${promptForm.outputType}:${promptForm.targetEngine}`, `${promptForm.outputType} — ${promptForm.subject}`); toggleFavorite(favorite); }} className="rounded-2xl border border-zinc-700 py-4 font-black text-zinc-200">Save Prompt</button>
                <button type="button" disabled={!promptResult.valid || !promptDraft.trim() || claudeState.status === "loading"} onClick={async () => { setClaudeState({ status: "loading", message: "Claude is enhancing the prompt…" }); try { const result = await enhancePromptWithClaude(promptDraft); setPromptDraft(result.enhancedPrompt); setClaudeState({ status: "success", message: `Enhanced with ${result.model}.` }); } catch (error) { setClaudeState({ status: "error", message: error.message }); } }} className="rounded-2xl border border-purple-500/50 py-4 font-black text-purple-200">{claudeState.status === "loading" ? "Enhancing…" : "Enhance with Claude"}</button>
              </div>
            </div>
          </section>
        )}

        {tab === "favorites" && (
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <h2 className="text-4xl font-black">Favorites</h2>
            <p className="mt-3 text-sm text-zinc-500">Systems, Subsystems, Hybrids, and Prompts saved in one persistent collection.</p>
            {favoriteItems.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-zinc-800 bg-black/40 p-6 text-zinc-400">No favorites saved yet.</div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {favoriteItems.map((item) => (
                  <div key={`${item.type}:${item.id}`} className="rounded-3xl border border-zinc-800 bg-black/50 p-5">
                    <div className="text-xs font-black uppercase tracking-widest text-yellow-300">{item.type}</div>
                    <h3 className="mt-3 text-xl font-black">{item.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">{item.type === "system" ? "System documentation record" : item.type === "subsystem" ? "Subsystem documentation record" : item.type === "hybrid" ? "Saved weighted Hybrid with reusable prompt" : "Saved production prompt"}</p>
                    <div className="mt-5 flex gap-3">
                      <button type="button" aria-label={`Remove ${item.name} from favorites`} onClick={() => toggleFavorite(item)} className="rounded-2xl border border-yellow-400 bg-yellow-500 px-4 py-3 font-black text-black">★</button>
                      <button type="button" onClick={() => openFavorite(item)} className="flex-1 rounded-2xl border border-zinc-700 px-4 py-3 font-black text-zinc-200">{item.type === "system" || item.type === "subsystem" ? "Open Docs" : "Reuse Prompt"}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "video" && <VideoBuilder systems={DEFAULT_SYSTEMS} systemById={SYSTEM_BY_ID} subsystemById={SUBSYSTEM_BY_ID} initialPrompt={reusedVideoPrompt} onSavePrompt={(text, system, subsystem) => toggleFavorite(promptFavorite(text, `video:${system.id}:${subsystem?.id || "none"}`, `Video — ${system.name}`))} onAssetCompleted={(job, context) => setAssetState((current) => upsertAsset(current, assetFromVideoJob(job, { prompt: context.prompt, systemId: context.system.id, systemName: context.system.name, subsystemId: context.subsystem?.id, subsystemName: context.subsystem?.name, aspectRatio: context.aspectRatio, duration: context.duration })))} />}

        {tab === "image" && <ImageBuilder systems={DEFAULT_SYSTEMS} initialPrompt={reusedVideoPrompt} onCompleted={(result, context)=>setAssetState((current)=>upsertAsset(current,{ id:`image:${result.id}`, type:"image", name:context.sourceName ? `WISE TOUCH · ${context.sourceName}` : "WISE TOUCH Local Image", assetUrl:result.assetUrl, providerId:result.providerId, prompt:context.prompt, aspectRatio:context.aspectRatio, createdAt:new Date().toISOString(), completedAt:new Date().toISOString() }))} />}

        {tab === "blueprints" && <BlueprintVault items={favoriteItems} onRemove={toggleFavorite} onBuild={(prompt) => { setReusedVideoPrompt(prompt); setTab("video"); }} />}

        {tab === "preview" && <BuildPreview hybrid={currentHybrid} slots={meterSlots} dnaControls={dnaControls} prompt={blueprintDraft} onPromptChange={setBlueprintDraft} onBack={() => setTab("meter")} onCopy={() => copyText(blueprintDraft, promptFavorite(blueprintDraft, currentHybrid.id, "Hybrid Blueprint"))} saved={hasFavorite(favoriteState, "hybrid", currentHybrid.id)} onSave={() => toggleFavorite(hybridFavorite(currentHybrid, blueprintDraft))} onGenerate={() => { setReusedVideoPrompt(blueprintDraft); setTab("video"); }} />}

        {tab === "results" && <AssetLibrary library={assetState} onDelete={(id) => setAssetState((current) => removeAsset(current, id))} onNewBuild={() => setTab("video")} onReusePrompt={(asset) => { setReusedVideoPrompt(asset.prompt); setTab("video"); }} />}

        {tab === "packs" && <Storefront mode="packs" onCheckout={()=>setTab("checkout")} />}

        {tab === "marketplace" && <Storefront mode="blueprints" onCheckout={()=>setTab("checkout")} onUseBlueprint={(listing) => { setReusedVideoPrompt(`${listing.name} — ${listing.subtitle}\n\nCommercial blueprint preview. Customize this structure with your selected WISE TOUCH System DNA before generation.`); setTab("video"); }} />}

        {tab === "checkout" && <CheckoutPanel user={authState.user} onBack={()=>setTab("packs")} />}

        {tab === "resources" && <ResourcesCenter onOpenTool={setTab} />}

        {tab === "account" && <AccountCenter user={authState.user} authStatus={authState.status} favoriteCount={favoriteItems.length} blueprintCount={favoriteItems.filter((item)=>item.type === "hybrid" || item.type === "prompt").length} assetCount={assetState.items.length} onOpen={setTab} onSignOut={async () => { await logout(); setAuthState({ user: null, status: "idle", message: "Signed out. Local backup remains available." }); setSyncReady(false); }} />}

        {tab === "meter" && (
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">Build District 02 · Engine Room</div><div className="mt-3 flex items-center gap-3"><SlidersHorizontal className="text-yellow-300" /><h2 className="text-4xl font-black uppercase">Hybrid Mixer</h2></div><p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Assemble your visual DNA · 100% or nothing.</p></div><div className={`rounded-2xl border px-6 py-4 text-center ${meterReady ? "border-emerald-500/40" : "border-red-500/40"}`}><div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Influence Total</div><div className={`text-4xl font-black ${meterReady ? "text-emerald-400" : "text-red-400"}`}>{meterTotal}%</div></div></div>
            <div className="grid gap-5 md:grid-cols-2">
              {meterSlots.map((slot, index) => {
                const sourceOptions = slot.sourceType === "subsystem" ? SUBSYSTEMS : DEFAULT_SYSTEMS;
                return (
                <div key={index} className="rounded-3xl border border-zinc-800 bg-black/40 p-5">
                  <div className="mb-2 text-sm font-black uppercase tracking-widest text-zinc-500">Source {index + 1}</div>
                  <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                    <select aria-label={`Source ${index + 1} type`} value={slot.sourceType} onChange={(event) => { const sourceType = event.target.value; const options = sourceType === "subsystem" ? SUBSYSTEMS : DEFAULT_SYSTEMS; updateMeterSlot(index, { sourceType, source: options[0] }); }} className="h-14 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
                      <option value="system">System</option><option value="subsystem">Subsystem</option>
                    </select>
                    <select aria-label={`Source ${index + 1}`} value={slot.source.id} onChange={(event) => { const next = sourceOptions.find((source) => source.id === event.target.value); if (next) updateMeterSlot(index, { source: next }); }} className="h-14 min-w-0 rounded-2xl border border-zinc-800 bg-black/50 px-4 text-white">
                      {sourceOptions.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}
                    </select>
                  </div>
                  <div className="mt-4 flex justify-between font-black"><span className="text-zinc-500">Influence</span><span className="text-yellow-300">{slot.weight}%</span></div>
                  <input type="range" min="0" max="100" value={slot.weight} onChange={(event) => updateMeterSlot(index, { weight: Number(event.target.value) })} className="mt-3 w-full" />
                </div>
              )})}
            </div>
            <section className="mt-6 rounded-3xl border border-orange-500/20 bg-black/40 p-5">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-orange-400">03 // Visual DNA Assembly</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["lineStyle", "Line Style", ["Bold Ink / Cel", "Clean Vector", "Painterly", "Technical Line"]],
                  ["palette", "Color Palette", ["Neon Orange + Teal", "Black + Crimson", "Chrome + Ice", "Muted Film"]],
                  ["lighting", "Lighting", ["High Contrast", "Neon Night", "Soft Editorial", "Divine Backlight"]],
                  ["texture", "Texture", ["Gritty / Detailed", "Chrome Gloss", "Analog Grain", "Clean Minimal"]],
                  ["composition", "Composition", ["Dynamic Angle", "Hero Centered", "Wide Cinematic", "Editorial Grid"]],
                  ["mood", "Mood", ["Dark / Epic", "Luxury Noir", "Playful Chaos", "Spiritual Awe"]],
                  ["detail", "Depth / Detail", ["Deep Layers", "Ultra Detailed", "Balanced", "Graphic Flat"]],
                ].map(([key, label, choices]) => <label key={key} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-black uppercase tracking-wider text-zinc-500">{label}<select value={dnaControls[key]} onChange={(event) => setDnaControls((current) => ({ ...current, [key]: event.target.value }))} className="mt-3 h-11 w-full rounded-xl border border-zinc-800 bg-black px-3 text-xs font-bold text-zinc-200">{choices.map((choice) => <option key={choice}>{choice}</option>)}</select></label>)}
                <label className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-black uppercase tracking-wider text-zinc-500">Blend Strength<div className="mt-3 flex items-center justify-between"><span>Subtle</span><span className="text-orange-400">{dnaControls.blendStrength}%</span><span>Bold</span></div><input type="range" min="0" max="100" value={dnaControls.blendStrength} onChange={(event) => setDnaControls((current) => ({ ...current, blendStrength: Number(event.target.value) }))} className="mt-3 w-full" /></label>
              </div>
            </section>
            <div className="mt-8 rounded-3xl border border-zinc-800 bg-black/40 p-5">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-yellow-300">Hybrid Preview</div>
              <h3 className="mt-3 text-2xl font-black">{currentHybrid.name || "Choose sources"}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{currentHybrid.description}</p>
              <div className="mt-4 text-sm font-bold text-cyan-300">Compatibility: {currentHybrid.compatibility.level} — {currentHybrid.compatibility.reason}</div>
              <div className="mt-4 flex flex-wrap gap-2">{currentHybrid.hybridDNA.slice(0, 8).map((dna) => <span key={dna} className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{dna}</span>)}</div>
              {!meterReady && <div className="mt-4 text-sm font-bold text-red-400">{currentHybrid.errors.join(" ")}</div>}
            </div>
            <div className={`mt-8 text-5xl font-black ${meterReady ? "text-yellow-300" : "text-red-400"}`}>{meterTotal}%</div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={!meterReady} onClick={() => meterReady && setTab("preview")} className={`w-full rounded-2xl py-4 font-black ${meterReady ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-500"}`}>{meterReady ? "Preview This Vision" : "Complete Hybrid To Build"}</button>
              <button type="button" disabled={!meterReady} onClick={() => meterReady && toggleFavorite(hybridFavorite(currentHybrid, hybridBlueprintPrompt))} className={`w-full rounded-2xl border py-4 font-black ${meterReady && hasFavorite(favoriteState, "hybrid", currentHybrid.id) ? "border-yellow-400 bg-yellow-500 text-black" : "border-zinc-700 text-zinc-300"}`}>{meterReady && hasFavorite(favoriteState, "hybrid", currentHybrid.id) ? "★ Blueprint Saved" : "☆ Save Blueprint"}</button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
