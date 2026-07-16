import React, { useState } from "react";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { SlidersVertical, Volume2, VolumeX } from "lucide-react";

const CHANNELS = [
  { name: "Kick", color: "#00d4ff" },
  { name: "Snare", color: "#22c55e" },
  { name: "Hats", color: "#eab308" },
  { name: "808", color: "#f97316" },
  { name: "Vocals", color: "#a855f7" },
  { name: "Adlibs", color: "#ec4899" },
  { name: "Melody", color: "#38bdf8" },
  { name: "FX", color: "#f43f5e" },
];

export default function MixingConsole() {
  const [levels, setLevels] = useState(CHANNELS.map(() => 70 + Math.round(Math.random() * 15)));
  const [muted, setMuted] = useState(CHANNELS.map(() => false));

  return (
    <PageScaffold icon={SlidersVertical} title="Mixing Console" sub="Mix & Produce — balance every element">
      <Card>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CHANNELS.map((c, i) => (
            <div key={c.name} className="flex flex-col items-center gap-2 min-w-[74px] bg-[#0a1120] border border-[#1a2942] rounded-lg p-3" data-testid="mix-channel">
              <span className="text-[11px] font-semibold text-white">{c.name}</span>
              <div className="text-[10px] tabular-nums" style={{ color: c.color }}>{levels[i]}</div>
              <div className="relative h-40 flex items-end">
                <input
                  type="range" min="0" max="100" value={levels[i]}
                  onChange={(e) => setLevels((l) => l.map((x, j) => (j === i ? +e.target.value : x)))}
                  className="h-40 accent-current"
                  style={{ writingMode: "vertical-lr", direction: "rtl", accentColor: c.color, width: 20 }}
                />
              </div>
              <div className="flex gap-1.5 w-full">
                {Array.from({ length: 8 }).map((_, k) => {
                  const on = (100 - k * 12) <= levels[i] && !muted[i];
                  return <span key={k} className="flex-1 h-1 rounded-sm" style={{ background: on ? c.color : "#16233d", boxShadow: on ? `0 0 4px ${c.color}` : "none" }} />;
                })}
              </div>
              <button onClick={() => setMuted((m) => m.map((x, j) => (j === i ? !x : x)))} className={`w-full text-[10px] py-1 rounded ${muted[i] ? "bg-red-500/20 text-red-400" : "bg-[#12203a] text-slate-400"}`}>
                {muted[i] ? <VolumeX className="w-3 h-3 mx-auto" /> : <Volume2 className="w-3 h-3 mx-auto" />}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </PageScaffold>
  );
}
