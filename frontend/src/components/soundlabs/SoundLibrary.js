import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Drum, AudioWaveform, Zap, Mic, Piano, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ICONS = {
  drum: Drum,
  waveform: AudioWaveform,
  zap: Zap,
  mic: Mic,
  piano: Piano,
  sparkles: Sparkles,
};

export default function SoundLibrary() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/library").then(r => setItems(r.data)); }, []);
  return (
    <div className="card-panel p-4 h-full" data-testid="sound-library">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-white text-sm">Sound Library</div>
        <button className="text-neon-cyan text-xs hover:underline" data-testid="library-view-all">View All</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((c) => {
          const Ic = ICONS[c.icon] || Sparkles;
          return (
            <button
              key={c.id}
              onClick={() => toast.info(`${c.name} · ${c.count.toLocaleString()} items`)}
              data-testid={`library-${c.id}`}
              className="bg-bg-base/60 rounded-lg p-3 border border-slate-800 hover:border-neon-cyan/40 hover:-translate-y-0.5 transition-transform text-center"
            >
              <Ic className="w-6 h-6 mx-auto text-neon-cyan mb-1"/>
              <div className="text-[11px] text-white">{c.name}</div>
              <div className="text-[10px] text-slate-400">{c.count.toLocaleString()}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
