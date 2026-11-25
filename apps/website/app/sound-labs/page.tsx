"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Disc3, Library, Plus, SlidersHorizontal, Sparkles } from "lucide-react";
import { getBrowserAuthToken } from "@/lib/auth-session";

type Project = { id: string; name: string; description?: string; createdAt: string; generationStatus?: string };
const input = "w-full rounded-xl border border-white/15 bg-[#101722] px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/20";

export default function SoundLabsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [genre, setGenre] = useState("hip-hop");
  const [mood, setMood] = useState("");
  const [duration, setDuration] = useState(30);
  const [tempo, setTempo] = useState(90);
  const [confirmed, setConfirmed] = useState(false);
  const [working, setWorking] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem("wise2-sound-labs-draft") || "{}");
      setTitle(draft.title || ""); setPrompt(draft.prompt || ""); setLyrics(draft.lyrics || "");
      setGenre(draft.genre || "hip-hop"); setMood(draft.mood || "");
      setDuration(draft.duration || 30); setTempo(draft.tempo || 90);
    } catch { /* Ignore an invalid local draft. */ }
    setReady(true);
    void refresh();
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("wise2-sound-labs-draft", JSON.stringify({ title, prompt, lyrics, genre, mood, duration, tempo }));
  }, [ready, title, prompt, lyrics, genre, mood, duration, tempo]);

  async function refresh() {
    const token = getBrowserAuthToken();
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch("/api/v1/sound-labs/me/projects", { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Could not load your library");
      setProjects(data.projects || []); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load your library"); }
    finally { setLoading(false); }
  }

  async function create() {
    const token = getBrowserAuthToken();
    if (!token) { setError("Sign in to create and save music."); return; }
    if (!confirmed || !prompt.trim()) return;
    setWorking(true); setError("");
    try {
      const name = title.trim() || prompt.trim().slice(0, 64);
      const created = await fetch("/api/v1/sound-labs/me/projects", {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: prompt.trim() }),
      });
      const projectData = await created.json();
      if (!created.ok) throw new Error(projectData.message || projectData.error || "Could not create project");
      const project = projectData.project;
      if (!project?.id) throw new Error("Project saved, but no ID was returned. Check your library before trying again.");
      if (lyrics.trim()) {
        const saved = await fetch(`/api/v1/sound-labs/me/projects/${project.id}`, {
          method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ lyrics: lyrics.trim(), lyricsTitle: name }),
        });
        if (!saved.ok) throw new Error("Project saved, but lyrics could not be saved. Open the project to review it.");
      }
      const result = await fetch(`/api/v1/sound-labs/me/projects/${project.id}/generate`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, lyrics: prompt.trim(), options: { genre, mood: mood.trim() || undefined, duration, tempo } }),
      });
      const data = await result.json();
      if (!result.ok || !data.success) throw new Error(`${data.message || "Generation failed"}. Your project is saved in the library.`);
      setConfirmed(false);
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed"); await refresh(); }
    finally { setWorking(false); }
  }

  return <main className="min-h-screen bg-[#070b12] text-white">
    <div className="mx-auto grid min-h-screen max-w-[1800px] lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-[#0c111a] p-5 lg:border-b-0 lg:border-r">
        <Link href="/" className="text-xl font-black tracking-tight">WISE² <span className="text-cyan-300">SOUND LABS</span></Link>
        <nav className="mt-7 flex gap-2 lg:flex-col" aria-label="Sound Labs">
          <a href="#create" className="flex items-center gap-2 rounded-xl bg-cyan-400/15 px-4 py-3 font-semibold text-cyan-200"><Plus size={18}/> Create</a>
          <a href="#library" className="flex items-center gap-2 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10"><Library size={18}/> Library</a>
          <Link href="/soundlab" className="flex items-center gap-2 rounded-xl px-4 py-3 text-slate-300 hover:bg-white/10"><SlidersHorizontal size={18}/> Studio</Link>
        </nav>
        <p className="mt-8 hidden text-xs leading-relaxed text-slate-500 lg:block">Drafts stay on this device. Generation uses your WISE² plan allowance.</p>
      </aside>
      <div className="min-w-0 bg-[radial-gradient(circle_at_65%_0%,rgba(0,164,213,.14),transparent_35%)] px-4 pb-24 pt-8 sm:px-8">
        <header className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[.28em] text-cyan-300">Make something yours</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">Create your next sound.</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Describe the beat, shape the mood, and keep every take in your library.</p>
        </header>
        <div className="mx-auto mt-10 grid max-w-6xl gap-7 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <section id="create" className="h-fit rounded-3xl border border-white/10 bg-[#0e141d] p-5 shadow-2xl sm:p-7" aria-label="Create music">
            <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="text-cyan-300"/> Create</h2><span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-200">MusicGen</span></div>
            <div className="mt-6 flex rounded-xl bg-black/40 p-1" role="tablist" aria-label="Creation mode">
              {(["simple", "advanced"] as const).map(value => <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold capitalize ${mode === value ? "bg-white text-black" : "text-slate-400"}`}>{value}</button>)}
            </div>
            <label className="mt-6 block text-sm font-semibold" htmlFor="track-title">Title <span className="font-normal text-slate-500">optional</span></label>
            <input id="track-title" className={`${input} mt-2`} value={title} onChange={e => setTitle(e.target.value)} placeholder="Give this take a name" maxLength={100}/>
            <label className="mt-5 block text-sm font-semibold" htmlFor="track-prompt">Describe the instrumental</label>
            <textarea id="track-prompt" className={`${input} mt-2 min-h-36 resize-y`} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Dark piano, spacious Queensbridge drums, warm bass, slow head-nod pocket..." maxLength={500}/>
            {mode === "advanced" && <div className="mt-5 space-y-5">
              <div><label className="block text-sm font-semibold" htmlFor="track-lyrics">Lyrics notebook</label><textarea id="track-lyrics" className={`${input} mt-2 min-h-40 resize-y`} value={lyrics} onChange={e => setLyrics(e.target.value)} placeholder="Save your lyrics with this project for recording later..."/><p className="mt-1 text-xs text-amber-200/80">MusicGen makes instrumental audio. It does not sing these lyrics or clone a voice.</p></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-semibold" htmlFor="genre">Genre</label><input id="genre" className={`${input} mt-2`} value={genre} onChange={e => setGenre(e.target.value)} maxLength={60}/></div><div><label className="text-sm font-semibold" htmlFor="mood">Mood</label><input id="mood" className={`${input} mt-2`} value={mood} onChange={e => setMood(e.target.value)} placeholder="Gritty" maxLength={60}/></div></div>
              <div><label className="text-sm font-semibold" htmlFor="duration">Duration · {duration}s</label><input id="duration" type="range" min="10" max="120" step="5" className="mt-2 w-full accent-cyan-300" value={duration} onChange={e => setDuration(Number(e.target.value))}/></div>
              <div><label className="text-sm font-semibold" htmlFor="tempo">Tempo · {tempo} BPM</label><input id="tempo" type="range" min="30" max="200" className="mt-2 w-full accent-cyan-300" value={tempo} onChange={e => setTempo(Number(e.target.value))}/></div>
            </div>}
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-relaxed text-slate-300"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 accent-cyan-300"/> Generate one instrumental take using my WISE² plan allowance. Editing this draft is free until I generate.</label>
            <button type="button" onClick={create} disabled={working || !prompt.trim() || !confirmed} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-bold text-[#071017] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"><Sparkles size={18}/>{working ? "Making your take…" : "Create instrumental"}</button>
            {error && <p role="alert" className="mt-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
          </section>
          <section id="library" className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-cyan-300">Your space</p><h2 className="mt-1 text-3xl font-black">Library</h2></div><span className="text-sm text-slate-400">{projects.length} projects</span></div>
            {!getBrowserAuthToken() ? <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center"><p>Sign in to see your music and save new takes.</p><Link className="mt-4 inline-block font-semibold text-cyan-300 underline" href="/auth/signin">Sign in</Link></div> : loading ? <p className="text-slate-400">Loading your library…</p> : projects.length === 0 ? <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-12 text-center"><Disc3 className="mx-auto mb-4 text-cyan-300" size={36}/><p className="font-semibold">Your first track starts here.</p><p className="mt-2 text-sm text-slate-400">Describe an instrumental on the left, then save your take.</p></div> : <div className="grid gap-4 sm:grid-cols-2">
              {projects.map(project => <Link key={project.id} href={`/sound-labs/${project.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111923] transition hover:border-cyan-300/60 hover:bg-[#172330]"><div className="flex aspect-[2.2] items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(25,190,217,.25),transparent_60%),linear-gradient(130deg,#101c2c,#07101b)]"><Disc3 size={58} className="text-cyan-200/70 transition group-hover:rotate-12"/></div><div className="p-4"><h3 className="truncate font-bold">{project.name}</h3><p className="mt-1 truncate text-sm text-slate-400">{project.description || "Sound Labs project"}</p><div className="mt-4 flex items-center justify-between text-xs text-slate-400"><span>{new Date(project.createdAt).toLocaleDateString()}</span><span className="capitalize text-cyan-300">{project.generationStatus || "Draft"}</span></div></div></Link>)}
            </div>}
          </section>
        </div>
      </div>
    </div>
  </main>;
}
