import React, { useState } from "react";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

const PRESETS = [
  { id: "club", name: "Club Ready", desc: "Loud, punchy, wide", lufs: "-8 LUFS" },
  { id: "stream", name: "Streaming", desc: "Balanced for Spotify/Apple", lufs: "-14 LUFS" },
  { id: "warm", name: "Warm Analog", desc: "Tape saturation & glue", lufs: "-11 LUFS" },
  { id: "clean", name: "Clean Master", desc: "Transparent & dynamic", lufs: "-12 LUFS" },
];

export default function Mastering() {
  const [sel, setSel] = useState("stream");
  const [applied, setApplied] = useState(false);

  return (
    <PageScaffold icon={Sparkles} title="Mastering" sub="Polish & Perfect — finalize your sound"
      actions={<button onClick={() => { setApplied(true); toast.success("Master applied & rendered"); }} className="btn-neon rounded-lg px-4 py-2 text-sm">Render Master</button>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Mastering Presets</div>
          <div className="space-y-2">
            {PRESETS.map((p) => (
              <button key={p.id} data-testid={`preset-${p.id}`} onClick={() => { setSel(p.id); setApplied(false); }} className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left ${sel === p.id ? "border-neon-cyan bg-neon-cyan/[0.06]" : "border-[#1a2942] bg-[#0a1120]"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${sel === p.id ? "bg-neon-cyan" : "border border-[#1a2942]"}`}>{sel === p.id && <Check className="w-3.5 h-3.5 text-[#04121f]" />}</div>
                <div className="flex-1"><div className="text-sm font-semibold text-white">{p.name}</div><div className="text-[11px] text-slate-500">{p.desc}</div></div>
                <span className="text-[11px] text-neon-cyan tabular-nums">{p.lufs}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col">
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-4">Loudness</div>
          <div className="flex-1 flex items-end justify-center gap-1.5">
            {Array.from({ length: 32 }).map((_, i) => {
              const active = i < (applied ? 26 : 18);
              const color = i > 27 ? "#ef4444" : i > 22 ? "#eab308" : "#22c55e";
              return <span key={i} className="w-2.5 rounded-sm transition-all" style={{ height: `${20 + (i / 32) * 80}%`, background: active ? color : "#16233d", boxShadow: active ? `0 0 6px ${color}` : "none" }} />;
            })}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div><div className="font-display text-xl font-bold text-white">{applied ? "-9.2" : "-14.1"}</div><div className="text-[9px] text-slate-500 uppercase tracking-wide">LUFS</div></div>
            <div><div className="font-display text-xl font-bold text-green-400">{applied ? "-0.3" : "-1.2"}</div><div className="text-[9px] text-slate-500 uppercase tracking-wide">True Peak</div></div>
            <div><div className="font-display text-xl font-bold text-neon-cyan">{applied ? "8.4" : "11.2"}</div><div className="text-[9px] text-slate-500 uppercase tracking-wide">Dynamics</div></div>
          </div>
        </Card>
      </div>
    </PageScaffold>
  );
}
