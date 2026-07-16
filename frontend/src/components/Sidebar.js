import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutGrid, Fingerprint, Music2, Mic, SlidersVertical, Sparkles,
  Radio, Users, Trophy, GraduationCap, Vault, BarChart3, Settings,
  ChevronRight, Circle,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";

const NAV = [
  { to: "/studio", icon: LayoutGrid, label: "Studio", sub: "Command Center" },
  { to: "/brand-dna", icon: Fingerprint, label: "Brand DNA", sub: "Identity Engine" },
  { to: "/anthem-creator", icon: Music2, label: "Anthem Creator", sub: "Song & Lyrics Studio" },
  { to: "/recording-room", icon: Mic, label: "Recording Room", sub: "Sessions & Vocals" },
  { to: "/mixing-console", icon: SlidersVertical, label: "Mixing Console", sub: "Mix & Produce" },
  { to: "/mastering", icon: Sparkles, label: "Mastering", sub: "Polish & Perfect" },
  { to: "/live", icon: Radio, label: "Live", sub: "Watch & Interact", live: true },
  { to: "/community", icon: Users, label: "Community", sub: "Connect & Collaborate", chevron: true },
  { to: "/challenges", icon: Trophy, label: "Challenges", sub: "Compete & Win" },
  { to: "/academy", icon: GraduationCap, label: "Academy", sub: "Learn & Level Up" },
  { to: "/brand-vault", icon: Vault, label: "Brand Vault", sub: "Assets & Deliverables" },
  { to: "/analytics", icon: BarChart3, label: "Analytics", sub: "Insights & Reports" },
  { to: "/settings", icon: Settings, label: "Settings", sub: "System & Preferences" },
];

export default function Sidebar() {
  return (
    <aside className="w-[248px] shrink-0 h-screen flex flex-col bg-[#070b16] border-r border-[#12203a]" data-testid="sidebar">
      {/* Brand header */}
      <div className="px-5 pt-5 pb-4 hair">
        <div className="flex items-end gap-1">
          <span className="font-tech text-4xl font-bold text-white leading-none">WISE</span>
          <span className="font-tech text-base font-bold neon-text leading-none mb-1">2</span>
        </div>
        <div className="text-[10px] tracking-mega text-slate-400 mt-1">SOUND LABS</div>
        <div className="text-[9px] tracking-[0.25em] text-slate-600 mt-2">ORGANIZED CHAOS COMMAND CENTER</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto hide-scroll py-2">
        {NAV.map(({ to, icon: Icon, label, sub, live, chevron }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`nav-${to.slice(1)}`}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-5 py-2.5 text-slate-400 ${isActive ? "nav-active" : ""}`
            }
          >
            <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-[13px] font-semibold uppercase tracking-wide text-current truncate">{label}</span>
                {live && (
                  <span className="flex items-center gap-1 text-[8px] font-bold text-red-400 bg-red-500/15 px-1.5 py-0.5 rounded">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{sub}</div>
            </div>
            {chevron && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
          </NavLink>
        ))}
      </nav>

      {/* Footer brand */}
      <div className="px-5 py-4 border-t border-[#12203a]">
        <div className="flex items-end gap-1 opacity-80">
          <span className="font-tech text-2xl font-bold text-slate-300 leading-none">WISE</span>
          <span className="font-tech text-xs font-bold text-slate-400 leading-none mb-0.5">2</span>
        </div>
        <div className="text-[9px] tracking-mega text-slate-600 mt-0.5">SOUND LABS</div>
        <svg viewBox="0 0 200 20" className="w-full h-4 my-2 opacity-70">
          {Array.from({ length: 40 }).map((_, i) => {
            const h = 3 + Math.abs(Math.sin(i * 0.9)) * 14;
            return <rect key={i} x={i * 5} y={(20 - h) / 2} width="2" height={h} rx="1" fill="#0ea5d9" opacity={0.5 + (i % 3) * 0.15} />;
          })}
        </svg>
        <div className="text-[8px] tracking-[0.2em] text-slate-600">YOUR BRAND. YOUR SOUND. YOUR LEGACY.</div>
        <div className="mt-3 panel px-3 py-2 flex items-center gap-2">
          <Circle className="w-2.5 h-2.5 text-green-500 fill-green-500 animate-glow" />
          <div>
            <div className="text-[10px] font-semibold text-slate-200 tracking-wide">SYSTEM STATUS</div>
            <div className="text-[9px] text-green-500">ALL SYSTEMS OPERATIONAL</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
