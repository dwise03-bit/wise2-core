import React from "react";
import { PanelHeader, ViewAll, Waveform } from "./ui";
import { FolderKanban } from "lucide-react";

export default function ActiveProjects({ data }) {
  return (
    <div className="panel panel-hover flex flex-col" data-testid="active-projects">
      <PanelHeader icon={FolderKanban} title="Active Projects" right={<ViewAll />} />
      <div className="px-3 py-2 space-y-2">
        {data.projects.map((p, idx) => (
          <div key={p.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors ${idx === 0 ? "ring-1 ring-neon-cyan/40 bg-neon-cyan/[0.03]" : ""}`} data-testid="project-item">
            <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white truncate">{p.name}</span>
                {p.live && <span className="text-[8px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded shrink-0">LIVE</span>}
              </div>
              <div className="text-[10px] text-slate-500 mb-1">{p.type}</div>
              <div className="flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-[#0e1a30] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-deep" style={{ width: `${p.progress}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{p.progress}%</span>
              </div>
            </div>
            <Waveform bars={14} seed={idx * 3} className="w-16 hidden xl:flex" />
          </div>
        ))}
      </div>
    </div>
  );
}
