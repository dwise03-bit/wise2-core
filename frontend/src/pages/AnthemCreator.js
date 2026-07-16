import React, { useState } from "react";
import { toast } from "sonner";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Music2, Plus, Sparkles, Trash2 } from "lucide-react";

const GENRES = ["Hip Hop", "Trap", "R&B", "Drill", "Pop", "Afrobeat"];

export default function AnthemCreator() {
  const [genre, setGenre] = useState("Hip Hop");
  const [bpm, setBpm] = useState(140);
  const [key, setKey] = useState("A Minor");
  const [sections, setSections] = useState([
    { id: 1, type: "Intro", text: "" },
    { id: 2, type: "Verse 1", text: "City lights, organized chaos in my veins…" },
    { id: 3, type: "Hook", text: "We build it up, we never fold…" },
  ]);

  const add = () => setSections((s) => [...s, { id: Date.now(), type: "Verse", text: "" }]);
  const update = (id, text) => setSections((s) => s.map((x) => (x.id === id ? { ...x, text } : x)));
  const remove = (id) => setSections((s) => s.filter((x) => x.id !== id));

  return (
    <PageScaffold icon={Music2} title="Anthem Creator" sub="Song & Lyrics Studio — craft your next anthem"
      actions={<button onClick={() => toast.success("AI generated a hook idea 🎵")} className="btn-neon rounded-lg px-4 py-2 text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Assist</button>}>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Track Setup</div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Genre</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {GENRES.map((g) => (
              <button key={g} onClick={() => setGenre(g)} className={`text-[11px] px-2.5 py-1 rounded-full border ${genre === g ? "border-neon-cyan text-neon-cyan bg-neon-cyan/10" : "border-[#1a2942] text-slate-400"}`}>{g}</button>
            ))}
          </div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">BPM — {bpm}</label>
          <input type="range" min="60" max="200" value={bpm} onChange={(e) => setBpm(+e.target.value)} className="w-full accent-[#00d4ff] mb-4" />
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Key</label>
          <select value={key} onChange={(e) => setKey(e.target.value)} className="w-full bg-[#0a1120] border border-[#1a2942] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan/60">
            {["A Minor", "C Major", "G Minor", "F# Minor", "D Major"].map((k) => <option key={k}>{k}</option>)}
          </select>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-sm font-bold text-white uppercase tracking-wide">Lyrics</span>
            <button onClick={add} className="btn-ghost rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Section</button>
          </div>
          <div className="space-y-3">
            {sections.map((s) => (
              <div key={s.id} className="bg-[#0a1120] border border-[#1a2942] rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-neon-cyan uppercase tracking-wide">{s.type}</span>
                  <button onClick={() => remove(s.id)} className="text-slate-600 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <textarea value={s.text} onChange={(e) => update(s.id, e.target.value)} rows={2} placeholder="Write your bars…" className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageScaffold>
  );
}
