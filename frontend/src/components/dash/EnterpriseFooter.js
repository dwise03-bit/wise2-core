import React from "react";
import { toast } from "sonner";
import { ASSETS } from "@/lib/assets";
import { Orbit, Compass, Boxes, Check, ArrowRight } from "lucide-react";

const ICONS = { GENESIS: Compass, ATLAS: Boxes, ORBIT: Orbit };

export default function EnterpriseFooter({ data }) {
  const m = data.metrics;
  const r = data.roadmap;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {/* Enterprise */}
      <div className="panel panel-hover overflow-hidden relative" data-testid="enterprise-card">
        <img src={ASSETS.city} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b16] via-[#070b16]/85 to-transparent" />
        <div className="relative p-4">
          <div className="flex items-end gap-1 mb-3">
            <span className="font-tech text-lg font-bold text-white leading-none">WISE</span>
            <span className="font-tech text-[10px] font-bold neon-text leading-none mb-0.5">2</span>
            <span className="font-display text-sm font-bold text-slate-400 tracking-widest ml-1">ENTERPRISE</span>
          </div>
          <div className="flex gap-3">
            {data.enterprise.map((e) => {
              const Icon = ICONS[e.code] || Orbit;
              return (
                <div key={e.code} className="flex-1 text-center">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mb-1.5">
                    <Icon className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div className="text-[8px] text-slate-500 tracking-wider">{e.name}</div>
                  <div className="font-display text-xs font-bold text-white tracking-wide">{e.code}</div>
                  <div className="text-[8px] text-slate-500">{e.subtitle}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Latest update */}
      <div className="panel panel-hover overflow-hidden relative" data-testid="update-card">
        <img src={ASSETS.city} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] to-[#070b16]/70" />
        <div className="relative p-4 flex flex-col h-full">
          <div className="text-[10px] tracking-widest text-slate-400 uppercase">Latest from WISE²</div>
          <div className="font-display text-lg font-bold neon-text mt-1">{data.update.version}</div>
          <p className="text-xs text-slate-400 mt-1 flex-1">{data.update.desc}</p>
          <button onClick={() => toast("Changelog opening…")} className="btn-ghost self-start mt-3 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-200 flex items-center gap-1">
            VIEW UPDATE <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Roadmap */}
      <div className="panel panel-hover p-4 flex flex-col" data-testid="roadmap-card">
        <div className="flex items-center justify-between">
          <span className="font-display text-sm font-bold text-white tracking-wider uppercase">Roadmap Progress</span>
          <span className="text-[10px] text-slate-400">{r.quarter}</span>
        </div>
        <div className="text-[10px] text-neon-cyan mt-1">{r.completed} / {r.total} COMPLETED</div>
        <div className="flex items-center mt-5 mb-1">
          {r.steps.map((done, i) => (
            <React.Fragment key={i}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500" : "border-2 border-[#1a2942] bg-[#0a1120]"}`}>
                {done ? <Check className="w-3.5 h-3.5 text-[#04121f]" /> : <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />}
              </div>
              {i < r.steps.length - 1 && <div className={`h-0.5 flex-1 ${r.steps[i + 1] || done ? "bg-gradient-to-r from-green-500 to-neon-cyan" : "bg-[#1a2942]"}`} />}
            </React.Fragment>
          ))}
        </div>
        <button onClick={() => toast("Roadmap opening…")} className="btn-ghost self-start mt-auto rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-200">VIEW ROADMAP</button>
      </div>

      {/* Metrics */}
      <div className="panel panel-hover p-4" data-testid="metrics-card">
        <div className="font-display text-sm font-bold text-white tracking-wider uppercase mb-3">Platform Metrics</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { v: m.projects_completed.toLocaleString(), l: "Projects Completed", c: "text-neon-cyan" },
            { v: m.happy_clients.toLocaleString(), l: "Happy Clients", c: "text-white" },
            { v: m.client_satisfaction, l: "Client Satisfaction", c: "text-green-400" },
            { v: m.countries_served, l: "Countries Served", c: "text-fuchsia-400" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className={`font-display text-xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-[8px] text-slate-500 tracking-wide uppercase leading-tight mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
