import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Sparkles, Music4, Briefcase, Server, Rocket,
  ShieldCheck, MessageSquare, HardDrive, Package, Truck, GraduationCap,
  FolderKanban, BarChart3, Cpu, Store, DollarSign, FileText, ChevronDown
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai", label: "AI", icon: Sparkles },
  { to: "/sound-labs", label: "Sound Labs", icon: Music4 },
  { to: "/business", label: "Business", icon: Briefcase, chev: true },
  { to: "/infrastructure", label: "Infrastructure", icon: Server },
  { to: "/deployments", label: "Deployments", icon: Rocket },
  { to: "/cyber-security", label: "Cyber Security", icon: ShieldCheck },
  { to: "/communications", label: "Communications", icon: MessageSquare },
  { to: "/storage", label: "Storage", icon: HardDrive },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/fleet", label: "Fleet", icon: Truck },
  { to: "/training", label: "Training", icon: GraduationCap },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/automation", label: "Automation", icon: Cpu },
  { to: "/store", label: "Store", icon: Store },
  { to: "/finance", label: "Finance", icon: DollarSign },
  { to: "/documents", label: "Documents", icon: FileText },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-full bg-bg-surface border-r border-slate-800 flex flex-col" data-testid="sidebar">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-deep flex items-center justify-center font-display font-extrabold text-bg-base text-xl shadow-neon-sm">
          W<sup className="text-[10px]">2</sup>
        </div>
        <div className="leading-tight">
          <div className="font-display text-white text-sm tracking-wide">WISE²</div>
          <div className="text-neon-cyan text-[10px] uppercase tracking-[0.2em]">Enterprise</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 pl-5 pr-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? "side-active text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1">{item.label}</span>
            {item.chev && <ChevronDown className="w-3.5 h-3.5 opacity-50" />}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-[10px] tracking-[0.25em] text-slate-500 uppercase">Organized Chaos.</div>
        <div className="text-[10px] tracking-[0.25em] text-neon-cyan uppercase font-semibold">Total Control.</div>
        <div className="text-[10px] text-slate-600 mt-2">v1.0.0</div>
      </div>
    </aside>
  );
}
