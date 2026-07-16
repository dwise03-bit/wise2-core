import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function Toggle({ label, desc, on, onToggle, testid }) {
  return (
    <div className="flex items-center justify-between py-3 hair last:border-0">
      <div><div className="text-sm text-white">{label}</div><div className="text-[11px] text-slate-500">{desc}</div></div>
      <button data-testid={testid} onClick={onToggle} className={`w-11 h-6 rounded-full p-0.5 transition-colors ${on ? "bg-neon-cyan" : "bg-[#1a2942]"}`}>
        <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [prefs, setPrefs] = useState({ live: true, email: false, chat: true, auto: true });
  const t = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <PageScaffold icon={SettingsIcon} title="Settings" sub="System & Preferences">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-4">Profile</div>
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.avatar || "https://i.pravatar.cc/100?img=12"} alt="" className="w-16 h-16 rounded-full border border-neon-cyan/40 object-cover" />
            <div><div className="font-display text-lg font-bold text-white">{user?.name}</div><div className="text-xs text-slate-500">{user?.email}</div><div className="text-[10px] text-neon-cyan mt-1">{user?.role}</div></div>
          </div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Display Name</label>
          <input defaultValue={user?.name} className="w-full bg-[#0a1120] border border-[#1a2942] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan/60 mb-4" />
          <button onClick={() => toast.success("Profile updated")} className="btn-neon rounded-lg px-4 py-2 text-sm">Save Changes</button>
        </Card>
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-2">Preferences</div>
          <Toggle testid="pref-live" label="Live Session Alerts" desc="Notify when a stream goes live" on={prefs.live} onToggle={() => t("live")} />
          <Toggle testid="pref-email" label="Email Digest" desc="Weekly summary of your activity" on={prefs.email} onToggle={() => t("email")} />
          <Toggle testid="pref-chat" label="Chat Mentions" desc="Ping me when tagged in chat" on={prefs.chat} onToggle={() => t("chat")} />
          <Toggle testid="pref-auto" label="Auto-Master Renders" desc="Auto master on export" on={prefs.auto} onToggle={() => t("auto")} />
          <button data-testid="settings-logout" onClick={() => { logout(); nav("/login"); }} className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </Card>
      </div>
    </PageScaffold>
  );
}
