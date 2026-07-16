import React from "react";
import { Music, Sliders, Sparkles, Share2, Plus, Circle, Upload, Drum, Wand2, Rocket } from "lucide-react";
import { toast } from "sonner";

const HERO_IMG = "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMHJlY29yZGluZyUyMGNvbnNvbGV8ZW58MHx8fHwxNzg0MTE3NTMyfDA&ixlib=rb-4.1.0&q=85";

const QUICK = [
  { key: "create", label: "CREATE", desc: "Compose & Record", icon: Music },
  { key: "produce", label: "PRODUCE", desc: "Mix & Engineer", icon: Sliders },
  { key: "master", label: "MASTER", desc: "Perfect Your Sound", icon: Sparkles },
  { key: "distribute", label: "DISTRIBUTE", desc: "Share Worldwide", icon: Share2 },
];

const ACTIONS = [
  { key: "new-project", label: "New Project", icon: Plus },
  { key: "record", label: "Record", icon: Circle },
  { key: "import", label: "Import", icon: Upload },
  { key: "beat-maker", label: "Beat Maker", icon: Drum },
  { key: "ai-master", label: "AI Master", icon: Wand2 },
  { key: "publish", label: "Publish", icon: Rocket },
];

export default function HeroBanner() {
  return (
    <div className="relative card-panel overflow-hidden">
      <div className="relative h-56">
        <img src={HERO_IMG} alt="Studio" className="absolute inset-0 w-full h-full object-cover opacity-60"/>
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base via-bg-base/70 to-transparent"/>
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-transparent to-transparent"/>
        <div className="relative p-8 h-full flex flex-col justify-center">
          <h1 className="font-display text-4xl md:text-5xl text-white mb-2" data-testid="hero-title">Sound Labs</h1>
          <p className="text-slate-300 text-sm max-w-md">Professional tools for music production, beat making, and audio engineering.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-6 -mt-8 relative z-10">
        {QUICK.map((q) => (
          <div key={q.key} data-testid={`quick-${q.key}`} className="card-panel p-4 flex flex-col items-center text-center bg-bg-card/95 hover:border-neon-cyan/40 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan mb-2">
              <q.icon className="w-4 h-4"/>
            </div>
            <div className="font-display text-xs text-white tracking-widest">{q.label}</div>
            <div className="text-[10px] text-slate-400">{q.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-6 gap-2 p-6 pt-4">
        {ACTIONS.map((a) => (
          <button
            key={a.key}
            data-testid={`action-${a.key}`}
            onClick={() => toast.success(`${a.label} launched`)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <a.icon className="w-5 h-5 text-neon-cyan group-hover:drop-shadow-[0_0_6px_#00d4ff]"/>
            <div className="text-[11px] text-slate-300">{a.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
