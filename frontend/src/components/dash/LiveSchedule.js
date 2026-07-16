import React from "react";
import { PanelHeader, ViewAll } from "./ui";
import { CalendarDays, Mic } from "lucide-react";

export default function LiveSchedule({ data }) {
  return (
    <div className="panel panel-hover flex flex-col" data-testid="live-schedule">
      <PanelHeader icon={CalendarDays} title="Live Schedule" right={<ViewAll label="View Full Schedule" />} />
      <div className="px-3 py-2 flex-1">
        {data.schedule.map((s) => (
          <div key={s.day} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
            <span className="w-9 text-[11px] font-bold text-neon-cyan tracking-wider">{s.day}</span>
            <span className="flex-1 text-[13px] text-slate-200 truncate">{s.title}</span>
            {s.live && <span className="text-[8px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded">LIVE</span>}
            <span className="text-[11px] text-slate-500 tabular-nums">{s.time}</span>
          </div>
        ))}
      </div>
      <div className="m-3 rounded-lg p-3 flex items-center gap-3 border border-fuchsia-500/30"
           style={{ background: "linear-gradient(90deg, rgba(217,70,239,0.12), rgba(139,92,246,0.06))" }}>
        <div className="w-9 h-9 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
          <Mic className="w-4 h-4 text-fuchsia-300" />
        </div>
        <div>
          <div className="font-display text-xs font-bold text-white tracking-wide">LIVE EVERY DAY</div>
          <div className="text-[10px] text-slate-400 tracking-wide">BUILDING. CREATING. INNOVATING.</div>
        </div>
      </div>
    </div>
  );
}
