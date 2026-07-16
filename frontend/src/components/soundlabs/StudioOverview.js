import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FolderKanban, Music2, Drum, Puzzle } from "lucide-react";

function Spark({ series, color }) {
  const max = Math.max(...series, 1);
  const min = Math.min(...series);
  const range = Math.max(max - min, 1);
  const w = 100, h = 30;
  const pts = series.map((v, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export default function StudioOverview() {
  const [ov, setOv] = useState(null);
  const [res, setRes] = useState(null);

  const load = async () => {
    const [a, b] = await Promise.all([api.get("/stats/overview"), api.get("/stats/resources")]);
    setOv(a.data); setRes(b.data);
  };
  useEffect(() => { load(); const id = setInterval(() => api.get("/stats/resources").then(r => setRes(r.data)), 3000); return () => clearInterval(id); }, []);

  if (!ov || !res) return <div className="card-panel p-5 h-full" />;

  const cards = [
    { icon: FolderKanban, v: ov.projects, l: "Projects" },
    { icon: Music2, v: ov.tracks, l: "Tracks" },
    { icon: Drum, v: ov.beats, l: "Beats" },
    { icon: Puzzle, v: ov.plugins, l: "Plugins" },
  ];

  const metrics = [
    { l: "CPU Usage", v: res.cpu.value, s: res.cpu.series, c: "#00d4ff" },
    { l: "Memory", v: res.memory.value, s: res.memory.series, c: "#22c55e" },
    { l: "Disk Space", v: res.disk.value, s: res.disk.series, c: "#eab308" },
    { l: "Network", v: res.network.value, s: res.network.series, c: "#a855f7" },
  ];

  return (
    <div className="card-panel p-5" data-testid="studio-overview">
      <div className="font-display text-white text-sm mb-3">Studio Overview</div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {cards.map((c) => (
          <div key={c.l} className="bg-bg-base/60 rounded-lg p-3 border border-slate-800">
            <c.icon className="w-4 h-4 text-neon-cyan mb-1"/>
            <div className="text-white font-display text-lg">{c.v}</div>
            <div className="text-[10px] text-slate-400">{c.l}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.l} className="bg-bg-base/60 rounded-lg p-2 border border-slate-800">
            <div className="text-[10px] text-slate-400">{m.l}</div>
            <div className="text-white font-display text-sm">{m.v}%</div>
            <Spark series={m.s} color={m.c}/>
          </div>
        ))}
      </div>
    </div>
  );
}
