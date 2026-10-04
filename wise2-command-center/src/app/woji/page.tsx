"use client";

import { useState } from "react";
import {
  canMarkComplete,
  nextCompletionChain,
  type WojiProjectState,
} from "@/lib/woji";
import {
  executeWojiChain,
  type WojiExecutionResult,
} from "@/lib/woji/orchestrator";
import type { WojiProjectRecord } from "@/lib/woji/state";
import type { WojiRole } from "@/lib/woji/permissions";

const COMMANDS = [
  ["👌", "Approve"],
  ["🔒", "Lock"],
  ["💚", "Prefer"],
  ["⏭️", "Next"],
  ["🩺", "Health"],
  ["🎯", "Target"],
  ["🧩", "Missing"],
  ["🔧", "Fix"],
  ["🛠️", "Build"],
  ["🧪", "Test"],
  ["💾", "Checkpoint"],
  ["↩️", "Restore"],
  ["♻️", "Resume"],
  ["📡", "History"],
  ["📦", "Package"],
  ["🏃", "Run"],
  ["🏁", "Finish"],
  ["⏹️", "Stop"],
] as const;

const initialState: WojiProjectState = {
  projectId: "wise2-command-center",
  target: "WOJI Control Engine V1",
  progress: 0,
  locks: [],
  missing: ["Connect a verified project registry"],
  blockers: [],
  activeWork: [],
  tests: [],
  handoffReady: false,
  nextAction: "Run a permitted WOJI command",
};

const initialRecord: WojiProjectRecord = {
  ...initialState,
  name: "WISE² Command Center",
  contractVersion: "WOJI-CONTRACT/1.0",
  locksDetailed: [],
  events: [],
  checkpoints: [],
  updatedAt: "Not yet synchronized",
};

const roleOptions: WojiRole[] = ["viewer", "creator", "builder", "operator", "owner"];

export default function WojiControlPage() {
  const [record, setRecord] = useState(initialRecord);
  const [role, setRole] = useState<WojiRole>("owner");
  const [humanApproved, setHumanApproved] = useState(false);
  const [command, setCommand] = useState("");
  const [target, setTarget] = useState(initialState.target ?? "");
  const [scope, setScope] = useState("control-deck");
  const [lockLevel, setLockLevel] = useState<1 | 2 | 3>(1);
  const [result, setResult] = useState<WojiExecutionResult | null>(null);

  const run = (raw: string) => {
    if (!raw.trim()) return;
    const execution = executeWojiChain(record, raw, role, {
      actor: "WOJI Control Deck",
      humanApproved,
      lockDecision: target || undefined,
      lockLevel,
      now: new Date().toISOString(),
      scope,
      target: target || undefined,
      workItem: target || "WOJI Control Deck",
    });
    setRecord(execution.record);
    setResult(execution);
    setCommand("");
  };

  const complete = canMarkComplete(record);
  const outcome = result?.outcomes.at(-1);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03070d] px-4 py-6 text-[#f4f7fb] sm:px-8 lg:px-12 lg:py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(41,137,216,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(41,137,216,.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(3,7,13,.35),rgba(3,7,13,.92)),url('/woji/board/atlanta-cinematic.png')] bg-cover bg-center opacity-50" />
      <div className="mx-auto max-w-[1500px]">
          <header className="mb-8 flex flex-col gap-5 border-b border-[#4aa9ef]/30 pb-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#7cc9ff]">WISE² Executive Ecosystem · Atlanta, Georgia</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">WOJI Control Deck</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b4c2ce]">Powered by the WISE² Business OS. One operating system for two powered businesses — with verified commands, memory, and recovery in one view.</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.08] px-4 py-3 text-sm text-emerald-200">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_#86efac]" /> Engine connected · {record.contractVersion}
            </div>
          </header>

          <section className="relative mb-5 grid gap-4 lg:grid-cols-[250px_1fr_250px] lg:items-center">
            <ExecutiveCard image="/woji/board/daniel-wise.jpg" name="Daniel Wise" role="Founder · CEO · System Architect" accent="cyan" />
            <div className="order-first rounded-3xl border border-[#1198ff]/60 bg-[#050a12]/85 p-6 text-center shadow-[0_0_50px_rgba(17,152,255,.12)] backdrop-blur-md lg:order-none"><p className="text-[10px] uppercase tracking-[.28em] text-[#9caebe]">WISE²</p><h2 className="mt-2 font-serif text-4xl font-bold text-white">THE BUSINESS OPERATING SYSTEM</h2><p className="mt-3 text-[10px] uppercase tracking-[.2em] text-[#69c9ff]">Organized chaos · built to operate</p><div className="mx-auto mt-5 h-px max-w-xs bg-gradient-to-r from-transparent via-[#1198ff] to-transparent" /><div className="mt-5 grid gap-3 sm:grid-cols-2"><BusinessCard title="PIFF CITY" subtitle="Retail · Culture · Commerce" accent="purple" /><BusinessCard title="WISE SHINE" subtitle="Mobile Detailing · Atlanta" accent="gold" /></div></div>
            <ExecutiveCard image="/woji/board/darrin-cook.jpg" name="Darrin Cook" role="Partner · COO · Operations" accent="purple" />
          </section>
          <div className="mb-6 rounded-2xl border border-white/15 bg-[#050a12]/80 px-5 py-4 text-center backdrop-blur-md"><p className="font-serif text-lg font-bold tracking-wide text-white">ONE OS · TWO POWERED BUSINESSES</p><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-[#9caebe]">AI · CRM · Automation · Payments · Analytics · Operations</p></div>

          <section className="grid gap-4 rounded-3xl border border-[#1198ff]/35 bg-[radial-gradient(circle_at_top_right,rgba(17,152,255,0.2),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-5 shadow-2xl shadow-black/40 lg:grid-cols-[1.35fr_0.65fr] lg:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#a9a39a]"><span className="rounded-full border border-[#d8a43a]/30 px-3 py-1 text-[#d8a43a]">Project Pulse</span><span>Verified state only</span></div>
              <h2 className="mt-5 text-2xl font-semibold">{record.target ?? "No target synchronized"}</h2>
              <p className="mt-2 text-sm text-[#a9a39a]">Next action: <span className="text-[#f6f0e4]">{record.nextAction ?? "Awaiting a permitted command"}</span></p>
              <div className="mt-6 flex items-end justify-between"><span className="text-xs uppercase tracking-[0.18em] text-[#a9a39a]">Actual verified progress</span><strong className="text-3xl text-[#d8a43a]">{record.progress}%</strong></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[linear-gradient(90deg,#a36f10,#d8a43a)] transition-all" style={{ width: `${Math.max(0, Math.min(100, record.progress))}%` }} /></div>
              <p className="mt-2 text-xs text-[#817b74]">No progress is inferred from queued work or UI actions.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <PulseStat label="Missing" value={record.missing.length ? String(record.missing.length) : "None"} tone={record.missing.length ? "text-amber-200" : "text-emerald-200"} />
              <PulseStat label="Blockers" value={record.blockers.length ? String(record.blockers.length) : "None"} tone={record.blockers.length ? "text-rose-200" : "text-emerald-200"} />
              <PulseStat label="QA" value={record.tests.length ? `${record.tests.filter((test) => test.passed).length}/${record.tests.length}` : "Not run"} tone="text-[#f6f0e4]" />
              <PulseStat label="Handoff" value={record.handoffReady ? "Ready" : "Not ready"} tone={record.handoffReady ? "text-emerald-200" : "text-[#f6f0e4]"} />
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-[#a9a39a]">Command contract</p><h2 className="mt-1 text-xl font-semibold">Issue approved WOJI commands</h2></div><label className="flex items-center gap-2 text-xs text-[#a9a39a]"><span>Role</span><select value={role} onChange={(event) => setRole(event.target.value as WojiRole)} className="rounded-lg border border-white/10 bg-[#0f121a] px-2 py-2 text-[#f6f0e4]">{roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">{COMMANDS.map(([token, label]) => <button key={token} type="button" onClick={() => run(token)} className="rounded-xl border border-white/10 bg-[#0f121a] px-2 py-3 text-center transition hover:border-[#d8a43a]/50 hover:bg-[#d8a43a]/10"><span className="block text-xl">{token}</span><span className="mt-1 block text-[0.64rem] uppercase tracking-[0.12em] text-[#a9a39a]">{label}</span></button>)}</div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row"><input value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") run(command); }} placeholder="Compose a chain, e.g. 👌🔒⏭️" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0f121a] px-4 py-3 text-sm text-[#f6f0e4] outline-none placeholder:text-[#817b74] focus:border-[#d8a43a]/60" /><button type="button" onClick={() => run(command)} className="rounded-xl bg-[#d8a43a] px-5 py-3 text-sm font-semibold text-[#050505] transition hover:bg-[#f0c86c]">Execute chain</button></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="text-xs text-[#a9a39a]">Current target<input value={target} onChange={(event) => setTarget(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f121a] px-3 py-2 text-sm text-[#f6f0e4]" /></label><label className="text-xs text-[#a9a39a]">Lock scope<input value={scope} onChange={(event) => setScope(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f121a] px-3 py-2 text-sm text-[#f6f0e4]" /></label><label className="text-xs text-[#a9a39a]">Lock level<select value={lockLevel} onChange={(event) => setLockLevel(Number(event.target.value) as 1 | 2 | 3)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0f121a] px-3 py-2 text-sm text-[#f6f0e4]"><option value={1}>🔒 Normal</option><option value={2}>🔒🔒 Architecture / brand</option><option value={3}>🔒🔒🔒 Permanent / global</option></select></label></div>
              <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#a9a39a]"><input type="checkbox" checked={humanApproved} onChange={(event) => setHumanApproved(event.target.checked)} className="mt-1 accent-[#d8a43a]" /> Human gate approved for protected completion or deployment operations. This does not bypass permissions or locks.</label>
              {result && <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex flex-wrap items-center gap-2"><span className="text-lg">{outcome?.code ?? "🧠"}</span><strong className="text-sm">{outcome?.result ?? "No command executed"}</strong>{result.unknown.length > 0 && <span className="text-xs text-amber-200">Unknown: {result.unknown.join(" ")}</span>}</div><p className="mt-2 text-xs text-[#a9a39a]">Normalized chain: <span className="text-[#f6f0e4]">{result.plan.normalized}</span></p></div>}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:p-6"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-[#a9a39a]">Execution flow</p><h2 className="mt-1 text-xl font-semibold">WOJI memory and QA</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#a9a39a]">{record.events.length} events</span></div><div className="mt-5 space-y-3"><MemoryRow icon="🔒" label="Locked decisions" value={record.locks.length ? record.locks.join(" · ") : "None recorded"} /><MemoryRow icon="🔧" label="Active work" value={record.activeWork.length ? record.activeWork.join(" · ") : "No active work"} /><MemoryRow icon="🧩" label="Missing work" value={record.missing.length ? record.missing.join(" · ") : "No missing items"} /><MemoryRow icon="🧪" label="QA state" value={record.tests.length ? record.tests.map((test) => `${test.name}: ${test.passed ? "pass" : "fail"}`).join(" · ") : "No QA result recorded"} /><MemoryRow icon="💾" label="Checkpoints" value={record.checkpoints.length ? `${record.checkpoints.length} recovery point${record.checkpoints.length === 1 ? "" : "s"}` : "None recorded"} /></div><div className="mt-5 rounded-2xl border border-[#d8a43a]/20 bg-[#d8a43a]/[0.06] p-4 text-sm"><span className="text-[#d8a43a]">Next verified chain</span><code className="mt-2 block text-lg text-[#f6f0e4]">{nextCompletionChain(record)}</code>{complete && <p className="mt-2 text-xs text-emerald-200">All completion gates are satisfied. 💯 remains a protected owner action.</p>}</div></section>
          </div>

          <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.035] p-5 lg:p-6"><div className="flex items-end justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-[#a9a39a]">📡 History</p><h2 className="mt-1 text-xl font-semibold">Event log</h2></div><span className="text-xs text-[#817b74]">{record.updatedAt}</span></div>{record.events.length === 0 ? <p className="mt-5 rounded-xl border border-dashed border-white/10 p-4 text-sm text-[#817b74]">No events yet. Every accepted command will appear here with its actor, action, result, and checkpoint context.</p> : <div className="mt-5 grid gap-2 md:grid-cols-2">{record.events.slice().reverse().map((event) => <div key={event.id} className="rounded-xl border border-white/10 bg-[#0f121a] p-3 text-sm"><div className="flex items-center justify-between gap-3"><span className="text-[#d8a43a]">{event.woji} {event.action}</span><time className="text-[0.65rem] text-[#817b74]">{event.at}</time></div><p className="mt-1 text-xs text-[#a9a39a]">{event.result} · {event.actor}</p></div>)}</div>}</section>
        </div>
    </main>
  );
}

function ExecutiveCard({ image, name, role, accent }: { image: string; name: string; role: string; accent: "cyan" | "purple" }) {
  return <div className={`overflow-hidden rounded-[2rem] border-2 bg-[#050a12]/90 shadow-2xl backdrop-blur-md ${accent === "cyan" ? "border-[#1198ff]" : "border-[#a646ff]"}`}><img src={image} alt={name} className="h-52 w-full object-cover object-center" /><div className="p-4 text-center"><h3 className="font-serif text-xl font-bold uppercase text-white">{name}</h3><p className={`mt-1 text-[9px] font-semibold uppercase tracking-[.14em] ${accent === "cyan" ? "text-[#69c9ff]" : "text-[#d493ff]"}`}>{role}</p></div></div>;
}

function BusinessCard({ title, subtitle, accent }: { title: string; subtitle: string; accent: "purple" | "gold" }) {
  return <div className={`rounded-2xl border-2 bg-[#050a12]/80 p-4 ${accent === "purple" ? "border-[#a646ff]" : "border-[#f0b82f]"}`}><h3 className="font-serif text-xl font-bold text-white">{title}</h3><p className={`mt-1 text-[9px] uppercase tracking-[.12em] ${accent === "purple" ? "text-[#d493ff]" : "text-[#f5c95b]"}`}>{subtitle}</p></div>;
}

function PulseStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-[0.62rem] uppercase tracking-[0.16em] text-[#817b74]">{label}</p><p className={`mt-2 text-sm font-semibold ${tone}`}>{value}</p></div>;
}

function MemoryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="flex gap-3 rounded-xl border border-white/10 bg-[#0f121a] p-3"><span className="text-lg">{icon}</span><div className="min-w-0"><p className="text-xs uppercase tracking-[0.13em] text-[#817b74]">{label}</p><p className="mt-1 truncate text-sm text-[#f6f0e4]">{value}</p></div></div>;
}
