import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Smile, MoreHorizontal } from "lucide-react";

function Wave() {
  const bars = 80;
  const vals = React.useMemo(() =>
    Array.from({ length: bars }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 0.4) * Math.cos(i * 0.13))),
  []);
  return (
    <div className="flex items-center gap-[2px] h-10">
      {vals.map((v, i) => (
        <div key={i} style={{ height: `${v * 100}%` }} className="w-[3px] rounded-sm bg-neon-cyan/70 shadow-[0_0_3px_#00d4ff]" />
      ))}
    </div>
  );
}

export default function StudioStatus() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get("/stats/studio").then(r => setS(r.data)); }, []);
  if (!s) return <div className="card-panel p-5 h-full" />;

  const specs = [
    { v: s.sample_rate, l: "Sample Rate" },
    { v: s.bit_depth, l: "Bit Depth" },
    { v: s.buffer, l: "Buffer Size" },
    { v: s.latency, l: "Latency" },
  ];

  return (
    <div className="card-panel p-5 h-full" data-testid="studio-status">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="font-display text-white text-sm tracking-widest">STUDIO STATUS</div>
          <span className="w-2 h-2 rounded-full bg-led-green shadow-[0_0_6px_#22c55e] animate-pulseGlow"/>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-500"/>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full border border-neon-cyan/40 flex items-center justify-center text-neon-cyan">
          <Smile className="w-5 h-5"/>
        </div>
        <div>
          <div className="text-white text-sm">Studio Online</div>
          <div className="text-slate-400 text-xs">All Systems Operational</div>
        </div>
        <div className="flex-1"><Wave/></div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {specs.map((sp) => (
          <div key={sp.l} className="bg-bg-base/60 rounded-lg p-3 border border-slate-800">
            <div className="text-neon-cyan font-display text-sm">{sp.v}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{sp.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
