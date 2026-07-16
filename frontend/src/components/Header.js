import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ASSETS } from "@/lib/assets";
import { Search, Bell, Mail, Settings, ChevronDown, Radio, FolderKanban, Users, LogOut, Command, Check } from "lucide-react";

function Counter({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
      <div className="leading-none">
        <div className="text-[8px] tracking-[0.18em] text-slate-500 uppercase">{label}</div>
        <div className="font-display text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ live_viewers: 358, projects_live: 4, community_online: 1247 });
  const [notifs, setNotifs] = useState({ items: [], unread: 0 });
  const [openN, setOpenN] = useState(false);
  const [openU, setOpenU] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const loadNotifs = () => api.get("/notifications").then((r) => setNotifs(r.data)).catch(() => {});

  useEffect(() => {
    api.get("/dashboard").then((r) => setStats(r.data.stats)).catch(() => {});
    loadNotifs();
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpenN(false); setOpenU(false); } };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markRead = async () => {
    await api.post("/notifications/read").catch(() => {});
    loadNotifs();
  };

  return (
    <header ref={ref} className="h-16 shrink-0 flex items-center gap-4 px-5 border-b border-[#12203a] bg-[#070b16]/80 backdrop-blur-md relative z-30" data-testid="header">
      {/* Search */}
      <div className="relative w-[340px] max-w-[34vw]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          data-testid="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search projects, artists, files..."
          className="w-full bg-[#0a1120] border border-[#1a2942] rounded-lg pl-9 pr-14 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-neon-cyan/60"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-500 border border-[#1a2942] rounded px-1.5 py-0.5">
          <Command className="w-2.5 h-2.5" /> K
        </span>
      </div>

      {/* Center monogram */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-end gap-0.5 no-drag">
          <span className="font-tech text-2xl font-bold text-white leading-none neon-text">W</span>
          <span className="font-tech text-xs font-bold neon-text leading-none mb-0.5">2</span>
        </div>
      </div>

      {/* Counters */}
      <div className="hidden lg:flex items-center gap-5 pr-3 border-r border-[#1a2942]">
        <Counter icon={Radio} iconClass="text-red-500" label="Live Viewers" value={stats.live_viewers} />
        <Counter icon={FolderKanban} iconClass="text-neon-cyan" label="Projects Live" value={stats.projects_live} />
        <Counter icon={Users} iconClass="text-neon-cyan" label="Community Online" value={stats.community_online.toLocaleString()} />
      </div>

      {/* User */}
      <div className="relative">
        <button data-testid="user-menu-btn" onClick={() => { setOpenU((v) => !v); setOpenN(false); }} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/5">
          <img src={user?.avatar || "https://i.pravatar.cc/100?img=12"} alt="" className="w-8 h-8 rounded-full border border-neon-cyan/40 object-cover" />
          <div className="text-left leading-none hidden sm:block">
            <div className="font-display text-xs font-semibold text-white">{user?.name || "D.WISE"}</div>
            <div className="text-[10px] text-slate-500">{user?.role || "Administrator"}</div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
        {openU && (
          <div className="absolute right-0 top-12 w-52 panel p-2 shadow-2xl" data-testid="user-dropdown">
            <div className="px-2 py-1.5 text-[11px] text-slate-400 truncate">{user?.email}</div>
            <button onClick={() => { setOpenU(false); navigate("/settings"); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button data-testid="logout-btn" onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button data-testid="notif-btn" onClick={() => { setOpenN((v) => !v); setOpenU(false); if (!openN) markRead(); }} className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400">
          <Bell className="w-4.5 h-4.5" />
          {notifs.unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-neon-cyan text-[9px] font-bold text-[#04121f] flex items-center justify-center">{notifs.unread}</span>
          )}
        </button>
        {openN && (
          <div className="absolute right-0 top-12 w-80 panel p-0 shadow-2xl overflow-hidden" data-testid="notif-dropdown">
            <div className="px-4 py-3 hair flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-white tracking-wide">NOTIFICATIONS</span>
              <Check className="w-4 h-4 text-neon-cyan" />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.items.map((n) => (
                <div key={n.id} className="px-4 py-3 hair hover:bg-white/5 text-sm text-slate-300">{n.text}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="relative p-2 rounded-lg hover:bg-white/5 text-slate-400" data-testid="mail-btn">
        <Mail className="w-4.5 h-4.5" />
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-fuchsia-500 text-[9px] font-bold text-white flex items-center justify-center">12</span>
      </button>

      <button onClick={() => navigate("/settings")} className="p-2 rounded-lg hover:bg-white/5 text-slate-400" data-testid="settings-icon-btn">
        <Settings className="w-4.5 h-4.5" />
      </button>
    </header>
  );
}
