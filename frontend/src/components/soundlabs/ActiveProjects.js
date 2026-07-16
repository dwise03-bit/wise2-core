import React from "react";
import { usePlayer } from "@/context/PlayerContext";
import { MoreHorizontal } from "lucide-react";

function MiniWave({ playing, active }) {
  const bars = 46;
  const vals = React.useMemo(() =>
    Array.from({ length: bars }, (_, i) => 0.2 + 0.8 * Math.abs(Math.sin(i * 0.5) * Math.cos(i * 0.11))),
  []);
  return (
    <div className={`flex items-center gap-[2px] h-6 ${playing && active ? "opacity-100" : "opacity-70"}`}>
      {vals.map((v, i) => (
        <div
          key={i}
          style={{ height: `${v * 100}%` }}
          className={`w-[2px] rounded-sm ${active ? "bg-neon-cyan" : "bg-slate-500"}`}
        />
      ))}
    </div>
  );
}

export default function ActiveProjects() {
  const { projects, current, selectProject, playing } = usePlayer();
  return (
    <div className="card-panel p-5 h-full" data-testid="active-projects">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-white text-sm">Active Projects</div>
        <button className="text-neon-cyan text-xs hover:underline" data-testid="active-projects-view-all">View All</button>
      </div>
      <div className="space-y-3">
        {projects.map((p) => {
          const isCurrent = current?.id === p.id;
          return (
            <div
              key={p.id}
              data-testid={`project-${p.id}`}
              onClick={() => selectProject(p.id)}
              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isCurrent ? "bg-neon-cyan/10 border border-neon-cyan/30" : "hover:bg-white/5 border border-transparent"}`}
            >
              <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${p.color} shadow-neon-sm shrink-0`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="text-white text-sm font-medium truncate">{p.name}</div>
                  <MoreHorizontal className="w-4 h-4 text-slate-500"/>
                </div>
                <div className="text-[11px] text-slate-400 mb-1">{p.genre} · {p.tracks} Tracks</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1"><MiniWave playing={playing} active={isCurrent}/></div>
                  <div className="text-[11px] text-slate-500 tabular-nums">{p.duration}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
