"use client";

import { useState } from "react";
import AppNav from "@/components/AppNav";
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
    <>
      <AppNav />
      <main className="min-h-screen bg-[#050505] px-5 py-6 text-[#f6f0e4] sm:px-8 lg:ml-[200px] lg:px-12 lg:py-10">
        <div className="mx-auto max-w-[1500px]">
          <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#d8a43a]">WISE² / Control Surface</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#f6f0e4] md:text-6xl">WOJI Control Deck</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a9a39a]">The command contract, permission gate, lock memory, orchestrator, event log, and recovery checkpoints in one operating view.</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-200">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-300" /> Engine connected · {record.contractVersion}
            </div>
          </header>

          <section className="grid gap-4 rounded-3xl border border-[#d8a43a]/25 bg-[radial-gradient(circle_at_top_right,rgba(216,164,58,0.16),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-5 shadow-2xl shadow-black/20 lg:grid-cols-[1.35fr_0.65fr] lg:p-7">
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
    </>
  );
}

function PulseStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><p className="text-[0.62rem] uppercase tracking-[0.16em] text-[#817b74]">{label}</p><p className={`mt-2 text-sm font-semibold ${tone}`}>{value}</p></div>;
}

function MemoryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return <div className="flex gap-3 rounded-xl border border-white/10 bg-[#0f121a] p-3"><span className="text-lg">{icon}</span><div className="min-w-0"><p className="text-xs uppercase tracking-[0.13em] text-[#817b74]">{label}</p><p className="mt-1 truncate text-sm text-[#f6f0e4]">{value}</p></div></div>;
}
