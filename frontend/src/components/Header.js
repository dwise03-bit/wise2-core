import React, { useEffect, useRef, useState } from "react";
import { Search, Bell, Settings, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Header() {
  const { user, logout } = useAuth();
  const [notifs, setNotifs] = useState({ items: [], unread: 0 });
  const [open, setOpen] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const ref = useRef(null);

  const loadNotifs = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifs(data);
    } catch {}
  };
  useEffect(() => { loadNotifs(); const id = setInterval(loadNotifs, 15000); return () => clearInterval(id); }, []);

  useEffect(() => {
    if (!q) { setResults(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setResults(data);
      } catch {}
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const markRead = async () => {
    try { await api.post("/notifications/read"); await loadNotifs(); toast.success("All notifications marked as read"); } catch {}
  };

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-6 border-b border-slate-800 bg-bg-surface/60 backdrop-blur-xl relative z-20" data-testid="header">
      {/* Search */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
        <input
          data-testid="global-search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tracks, projects, artists..."
          className="w-full bg-bg-base border border-slate-800 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-neon-cyan/60 focus:outline-none focus:shadow-neon-sm"
        />
        {results && results.projects && results.projects.length > 0 && (
          <div className="absolute top-12 left-0 right-0 card-panel p-2 z-30 shadow-neon-sm">
            {results.projects.map((p) => (
              <div key={p.id} className="px-3 py-2 hover:bg-white/5 rounded-md text-sm text-slate-200 cursor-pointer">
                {p.name} <span className="text-slate-500 text-xs">· {p.genre}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System status */}
      <div className="hidden lg:flex items-center gap-2 text-xs">
        <span className="text-slate-500 tracking-widest uppercase">System Status</span>
        <span className="w-2 h-2 rounded-full bg-led-green shadow-[0_0_8px_#22c55e]"></span>
        <span className="text-neon-cyan">All Systems Operational</span>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          data-testid="notifications-button"
          onClick={() => setOpen((o) => !o)}
          className="relative w-9 h-9 rounded-full bg-bg-base border border-slate-800 hover:border-neon-cyan/40 flex items-center justify-center"
        >
          <Bell className="w-4 h-4 text-slate-300" />
          {notifs.unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-neon-cyan text-bg-base text-[10px] font-bold flex items-center justify-center">{notifs.unread}</span>
          )}
        </button>
        {open && (
          <div className="absolute right-0 top-11 w-80 card-panel p-3 z-40" data-testid="notifications-panel">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
              <div className="font-display text-sm text-white">Notifications</div>
              <button className="text-xs text-neon-cyan hover:underline" onClick={markRead} data-testid="notifications-mark-read">Mark all read</button>
            </div>
            <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
              {notifs.items.map((n) => (
                <div key={n.id} className={`px-2 py-2 rounded-md text-sm ${n.read ? "text-slate-500" : "text-slate-200 bg-white/5"}`}>{n.text}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="w-9 h-9 rounded-full bg-bg-base border border-slate-800 hover:border-neon-cyan/40 flex items-center justify-center" data-testid="settings-button">
        <Settings className="w-4 h-4 text-slate-300" />
      </button>
      <button className="w-9 h-9 rounded-full bg-bg-base border border-slate-800 hover:border-neon-cyan/40 flex items-center justify-center" data-testid="help-button">
        <HelpCircle className="w-4 h-4 text-slate-300" />
      </button>

      {/* Admin badge */}
      <div className="relative" ref={ref}>
        <button
          data-testid="user-badge"
          onClick={() => setShowUser((s) => !s)}
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-white/5"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan to-neon-deep flex items-center justify-center font-bold text-bg-base text-sm">
            {user?.initials || "AD"}
          </div>
          <div className="text-left leading-tight">
            <div className="text-white text-sm font-medium">{user?.name || "Admin"}</div>
            <div className="text-slate-400 text-[11px]">{user?.role || "Administrator"}</div>
          </div>
        </button>
        {showUser && (
          <div className="absolute right-0 top-12 w-56 card-panel p-2 z-40">
            <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-800">{user?.email}</div>
            <button
              data-testid="logout-button"
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md mt-1"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
