"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Disc3,
  Headphones,
  Mic2,
  Pause,
  Play,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";

const nav = [
  "Studio",
  "Beats",
  "Samples",
  "AI Tools",
  "Mix / Master",
  "REAPER",
  "Discord",
  "Publish",
  "Settings",
];
const stations: Array<{
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  glow: string;
}> = [
  {
    title: "Recording Studio",
    subtitle: "Ideas · Record · Create · Repeat",
    Icon: Mic2,
    glow: "from-emerald-400/30",
  },
  {
    title: "Beat Lab",
    subtitle: "Pads · Patterns · Performance",
    Icon: Disc3,
    glow: "from-blue-500/35",
  },
  {
    title: "AI Producer",
    subtitle: "Generate · Remix · Master",
    Icon: Bot,
    glow: "from-cyan-400/30",
  },
  {
    title: "Reaper Studio",
    subtitle: "Digital audio workstation",
    Icon: SlidersHorizontal,
    glow: "from-violet-400/25",
  },
];

export default function SoundLabsPage() {
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("Session ready · local controls active");
  const [live, setLive] = useState(false);
  const action = (message: string) => setNotice(message);

  return (
    <main className="min-h-screen overflow-hidden bg-[#03070d] text-white">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_50%_20%,rgba(0,154,255,.25),transparent_38%),linear-gradient(115deg,#020409,#06111e_48%,#020409)]">
        <div className="pointer-events-none absolute inset-0 bg-[url('/brand/sound-labs-4k-hyperreal.png')] bg-cover bg-center opacity-45 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 bg-[url('/brand/wise2-hero-united.webp')] bg-cover bg-center opacity-20 mix-blend-lighten" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020409]/35 via-[#020409]/70 to-[#020409]/90" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(0,198,255,.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
        <div className="relative mx-auto grid min-h-screen max-w-[1800px] grid-cols-1 lg:grid-cols-[220px_1fr_250px]">
          <aside className="hidden border-r border-cyan-300/20 bg-black/45 p-5 lg:block">
            <p className="mb-10 text-sm font-black tracking-[.18em]">
              WELCOME TO
              <br />
              <span className="text-cyan-300">WISE² SOUND LABS</span>
            </p>
            <nav className="space-y-2" aria-label="Sound Labs navigation">
              {nav.map((item, i) => (
                <Link
                  key={item}
                  href={i === 0 ? "/sound-labs" : "/platform"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider ${i === 0 ? "bg-emerald-400/20 text-emerald-300 ring-1 ring-emerald-300/60" : "text-slate-300 hover:bg-white/10"}`}
                >
                  <Waves className="h-4 w-4" />
                  {item}
                </Link>
              ))}
            </nav>
            <div className="mt-16 rounded-xl border border-cyan-300/30 bg-black/45 p-4 text-xs">
              <p className="font-black text-cyan-200">LIVE COLLAB</p>
              <p className="mt-2 text-emerald-300">● Discord Connected</p>
              <p className="mt-1 text-slate-400">4 creators online</p>
            </div>
          </aside>
          <section className="min-w-0 p-5 md:p-8">
            <header className="text-center">
              <p className="text-[10px] font-black tracking-[.45em] text-cyan-200">
                WISE² COMMAND CENTER · SESSION 0042
              </p>
              <h1 className="mt-2 text-5xl font-black uppercase italic tracking-tight md:text-7xl">
                <span className="text-slate-100 drop-shadow-[0_0_18px_rgba(0,200,255,.6)]">
                  WISE²
                </span>{" "}
                <span className="text-emerald-400">Sound Labs</span>
              </h1>
              <p className="mt-2 text-xs font-bold tracking-[.32em] text-slate-300">
                CREATE · CAPTURE · COLLABORATE · MONETIZE
              </p>
              <div className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <Status label="ENGINE ONLINE" color="text-emerald-300" />
                <Status label="MASCHINE READY" color="text-cyan-300" />
                <Status label="DISCORD 4 ONLINE" color="text-violet-300" />
              </div>
            </header>
            <div className="relative mx-auto mt-8 h-44 max-w-5xl overflow-hidden rounded-2xl border border-emerald-300/35 bg-black/60 shadow-[0_0_50px_rgba(0,200,140,.2)]">
              <div className="absolute inset-0 bg-[url('/brand/wise2-hero-united.webp')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020409] via-transparent to-[#020409]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-5 pb-4 pt-10">
                <p className="text-[10px] font-black uppercase tracking-[.3em] text-emerald-300">WISE² UNITED · GLOBAL CREATORS</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/80">Four voices. One session. One sound.</p>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-cyan-300/35 bg-black/35 p-5 shadow-[0_0_50px_rgba(0,145,255,.2)] backdrop-blur-sm md:p-7">
              <div className="mb-5 rounded-xl border border-white/10 bg-black/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.25em] text-slate-400">
                      NOW PLAYING
                    </p>
                    <p className="mt-1 text-lg font-black">
                      Midnight Circuit{" "}
                      <span className="text-cyan-300">· C MIN · 128 BPM</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      aria-label="Play session"
                      onClick={() => {
                        setPlaying(true);
                        action("Playback running · Midnight Circuit");
                      }}
                      className={`rounded-full p-3 text-black ${playing ? "bg-emerald-300 ring-2 ring-emerald-200/60" : "bg-emerald-400 hover:bg-emerald-300"}`}
                    >
                      <Play className="h-4 w-4 fill-current" />
                    </button>
                    <button
                      aria-label="Pause session"
                      onClick={() => {
                        setPlaying(false);
                        action("Playback paused · session position preserved");
                      }}
                      className="rounded-full border border-white/15 p-3 text-slate-200 hover:border-cyan-300"
                    >
                      <Pause className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex h-10 items-center gap-1 overflow-hidden">
                  {Array.from({ length: 72 }, (_, i) => (
                    <span
                      key={i}
                      className={`w-1 shrink-0 rounded-full ${playing && i % 7 === 0 ? "bg-emerald-300" : "bg-cyan-400/70"}`}
                      style={{ height: `${10 + ((i * 17) % 28)}px` }}
                    />
                  ))}
                </div>
                <p
                  aria-live="polite"
                  className="mt-3 text-[11px] text-slate-400"
                >
                  {notice}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {stations.map(({ title, subtitle, Icon, glow }) => (
                  <div
                    key={title}
                    className={`group rounded-xl border border-white/15 bg-gradient-to-br ${glow} to-black/70 p-5 transition hover:-translate-y-1 hover:border-cyan-300/70 hover:shadow-[0_0_28px_rgba(0,200,255,.18)]`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-8 w-8 text-cyan-200" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                        ONLINE
                      </span>
                    </div>
                    <h2 className="mt-8 text-xl font-black uppercase">
                      {title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
                    <button
                      onClick={() =>
                        action(
                          `${title} opened · bridge-independent demo state`,
                        )
                      }
                      className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-200 hover:text-white"
                    >
                      Enter station <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs">
                <span className="text-emerald-300">
                  ● SESSION ONLINE · GLOBAL CREATORS
                </span>
                <span className="text-slate-400">
                  44.1 kHz · 2.1 ms · 128 BPM · C MIN
                </span>
                <Link
                  href="/quest?surface=soundlabs"
                  className="rounded-lg bg-emerald-400 px-4 py-2 font-black text-black hover:bg-emerald-300"
                >
                  OPEN XR ROOM
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Metric label="MASTER" value="-6.2 dB" color="text-emerald-300" />
              <Metric label="INPUT" value="-12.4 dB" color="text-cyan-300" />
              <Metric label="OUTPUT" value="-4.8 dB" color="text-blue-300" />
            </div>
          </section>
          <aside className="hidden border-l border-cyan-300/20 bg-black/45 p-5 xl:block">
            <div className="rounded-xl border border-cyan-300/35 bg-black/45 p-4">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-cyan-300" />
                <h2 className="font-black">AI PRODUCER</h2>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                WISE² IMP is ready for your next move.
              </p>
              {[
                "Generate beat",
                "Expand loop",
                "Clean vocals",
                "Master track",
              ].map((a) => (
                <button
                  key={a}
                  onClick={() =>
                    action(
                      `${a} queued for preview · no project changes applied`,
                    )
                  }
                  className="mt-3 flex w-full items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-slate-200 hover:border-emerald-300/60"
                >
                  <Sparkles className="h-3 w-3 text-emerald-300" />
                  {a}
                </button>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-violet-300/30 bg-black/45 p-4">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-violet-300" />
                <h2 className="font-black">LIVE STATUS</h2>
              </div>
              <p className="mt-3 text-xs text-emerald-300">
                ● {live ? "Streaming locally" : "Studio ready"}
              </p>
              <p className="mt-1 text-xs text-slate-400">Discord · 4 online</p>
              <button
                onClick={() => {
                  setLive(!live);
                  action(
                    live
                      ? "Live preview stopped"
                      : "Live preview started · publish connection required",
                  );
                }}
                className={`mt-4 w-full rounded-lg px-3 py-2 text-xs font-black ${live ? "bg-slate-200 text-black" : "bg-rose-500 hover:bg-rose-400"}`}
              >
                {live ? "END PREVIEW" : "GO LIVE"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-black/45 p-4">
      <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400">
        <span>{label}</span>
        <Headphones className="h-4 w-4" />
      </div>
      <p className={`mt-3 text-2xl font-black ${color}`}>{value}</p>
      <div className="mt-3 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent" />
    </div>
  );
}
function Status({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`rounded-full border border-white/10 bg-black/40 px-3 py-1 ${color}`}
    >
      <Activity className="mr-1 inline h-3 w-3" />
      {label}
    </span>
  );
}
