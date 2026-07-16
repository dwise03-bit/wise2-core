import React from "react";
import { PanelHeader } from "./ui";
import { Trophy, Crown, ChevronDown, ShieldHalf } from "lucide-react";

export default function Leaderboard({ data }) {
  return (
    <div className="panel panel-hover flex flex-col" data-testid="leaderboard">
      <PanelHeader
        icon={Trophy}
        title="Community Leaderboard"
        right={<button className="flex items-center gap-1 text-[10px] text-slate-300 border border-[#1a2942] rounded px-2 py-1 hover:border-neon-cyan/50">THIS MONTH <ChevronDown className="w-3 h-3" /></button>}
      />
      <div className="px-3 py-2 flex-1">
        {data.leaderboard.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="leaderboard-row">
            <span className={`w-4 text-sm font-bold ${u.rank === 1 ? "text-yellow-400" : "text-slate-500"}`}>{u.rank}</span>
            <div className="relative">
              <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              {u.rank === 1 && <Crown className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
            </div>
            <span className="flex-1 text-[13px] font-medium text-white truncate">{u.name}</span>
            <span className="text-xs font-semibold text-neon-cyan tabular-nums">{u.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </div>
      <div className="m-3 rounded-lg p-3 flex items-center gap-3 border border-fuchsia-500/30"
           style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.14), rgba(217,70,239,0.06))" }}>
        <div>
          <div className="text-[10px] tracking-widest text-slate-300 uppercase">Earn XP. Level Up. Unlock Rewards.</div>
          <div className="font-display text-sm font-bold text-white">BECOME A <span className="neon-text">WISE</span> ELITE</div>
        </div>
        <div className="ml-auto w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/40">
          <ShieldHalf className="w-5 h-5 text-fuchsia-300" />
        </div>
      </div>
    </div>
  );
}
