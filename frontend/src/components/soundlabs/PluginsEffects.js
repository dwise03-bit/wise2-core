import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import * as Switch from "@radix-ui/react-switch";
import { toast } from "sonner";

export default function PluginsEffects() {
  const [plugins, setPlugins] = useState([]);
  const load = async () => { const { data } = await api.get("/plugins"); setPlugins(data); };
  useEffect(() => { load(); }, []);

  const toggle = async (id, enabled) => {
    setPlugins((ps) => ps.map(p => p.id === id ? { ...p, enabled } : p));
    try {
      await api.post(`/plugins/${id}/toggle`, { enabled });
      toast.success(`${enabled ? "Enabled" : "Disabled"} plugin`);
    } catch {
      toast.error("Toggle failed");
      load();
    }
  };

  return (
    <div className="card-panel p-4 h-full" data-testid="plugins-effects">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-white text-sm">Plugins & Effects</div>
        <button className="text-neon-cyan text-xs hover:underline" data-testid="plugins-view-all">View All</button>
      </div>
      <div className="space-y-2">
        {plugins.map((p) => (
          <div key={p.id} className="flex items-center gap-2 bg-bg-base/60 rounded-lg p-2 border border-slate-800">
            <div className="w-7 h-7 rounded-md bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan font-display text-xs">{p.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[12px] truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{p.category}</div>
            </div>
            <span className={`text-[10px] tracking-widest ${p.enabled ? "text-led-green" : "text-slate-500"}`}>{p.enabled ? "ON" : "OFF"}</span>
            <Switch.Root
              data-testid={`plugin-toggle-${p.id}`}
              checked={p.enabled}
              onCheckedChange={(v) => toggle(p.id, v)}
              className="w-9 h-5 bg-slate-700 rounded-full relative data-[state=checked]:bg-neon-cyan/70 outline-none"
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full translate-x-0.5 transition-transform data-[state=checked]:translate-x-[18px]"/>
            </Switch.Root>
          </div>
        ))}
      </div>
    </div>
  );
}
