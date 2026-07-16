import React, { useEffect, useState } from "react";
import { Volume2, VolumeX, Play, Bell, Share2, Users, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { ASSETS } from "@/lib/assets";

const STATUS_STYLE = {
  COMPLETED: "text-green-400",
  LIVE: "text-red-400",
  "UP NEXT": "text-neon-cyan",
  WAITING: "text-slate-500",
};

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <div className="font-display text-lg font-bold text-white leading-none">{value}</div>
      <div className="text-[8px] tracking-widest text-slate-400 uppercase">{label}</div>
    </div>
  );
}

export default function LiveStudio({ data }) {
  const s = data.live_studio;
  const [muted, setMuted] = useState(true);
  const [elapsed, setElapsed] = useState(s.elapsed);

  useEffect(() => {
    const [h, m, sec] = s.elapsed.split(":").map(Number);
    let total = h * 3600 + m * 60 + sec;
    const id = setInterval(() => {
      total += 1;
      const hh = String(Math.floor(total / 3600)).padStart(2, "0");
      const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
      const ss = String(total % 60).padStart(2, "0");
      setElapsed(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => clearInterval(id);
  }, [s.elapsed]);

  return (
    <div className="panel panel-hover overflow-hidden" data-testid="live-studio">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 hair">
        <div className="flex items-center gap-3 min-w-0">
          <Volume2 className="w-4 h-4 text-neon-cyan" />
          <span className="font-display text-base font-bold tracking-wider text-white">LIVE STUDIO</span>
          <span className="text-[9px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded">LIVE</span>
          <span className="hidden xl:inline text-[10px] tracking-widest text-slate-500 uppercase truncate">{s.tagline}</span>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 border border-red-500/40 rounded px-2 py-1">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
        </span>
      </div>

      {/* Video / hero */}
      <div className="relative">
        <img src={ASSETS.studioHero} alt="Live studio" className="w-full h-[300px] object-cover" />
        <div className="scan" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-transparent to-transparent" />

        {/* stat box */}
        <div className="absolute top-4 right-4 panel px-4 py-3 bg-[#070b16]/85 backdrop-blur">
          <div className="text-center mb-3">
            <div className="font-display text-2xl font-bold neon-text tracking-wide">{elapsed}</div>
            <div className="text-[8px] tracking-widest text-slate-400 uppercase">Elapsed</div>
          </div>
          <div className="flex gap-4">
            <Stat icon={Users} value={s.viewers} label="Viewers" color="text-red-400" />
            <Stat icon={ThumbsUp} value={s.likes} label="Likes" color="text-neon-cyan" />
            <Stat icon={MessageSquare} value={s.comments} label="Comments" color="text-fuchsia-400" />
          </div>
        </div>

        {/* now building */}
        <div className="absolute bottom-4 left-4">
          <div className="text-[10px] tracking-widest text-neon-cyan uppercase">Now Building</div>
          <div className="font-display text-2xl font-bold text-white">{s.title}</div>
        </div>
      </div>

      {/* Stage progress */}
      <div className="px-4 py-4 hair">
        <div className="flex items-stretch">
          {s.stages.map((st, i) => (
            <div key={st.name} className="flex-1 flex flex-col items-center text-center relative">
              {i < s.stages.length - 1 && <div className="absolute top-1.5 left-1/2 w-full h-px bg-[#1a2942]" />}
              <div className={`relative z-10 w-3 h-3 rounded-full mb-2 ${st.status === "COMPLETED" ? "bg-green-500" : st.status === "LIVE" ? "bg-red-500 live-dot" : st.status === "UP NEXT" ? "bg-neon-cyan" : "bg-[#1a2942]"}`} />
              <div className="text-[9px] font-semibold text-slate-300 uppercase tracking-wide leading-tight">{st.name}</div>
              <div className={`text-[8px] font-bold uppercase tracking-wider mt-0.5 ${STATUS_STYLE[st.status]}`}>{st.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 flex items-center gap-2">
        <button data-testid="unmute-btn" onClick={() => setMuted((m) => !m)} className="btn-ghost flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-slate-300">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {muted ? "UNMUTE" : "MUTE"}
        </button>
        <button data-testid="watch-live-btn" onClick={() => toast.success("Joining live stream…")} className="btn-neon flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm">
          <Play className="w-4 h-4 fill-current" /> WATCH LIVE
        </button>
        <button data-testid="reminder-btn" onClick={() => toast.success("Reminder set — we'll ping you!")} className="btn-ghost flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-slate-300">
          <Bell className="w-4 h-4" /> ADD REMINDER
        </button>
        <button data-testid="share-btn" onClick={() => toast("Share link copied")} className="btn-ghost ml-auto rounded-lg p-2.5 text-slate-300">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
