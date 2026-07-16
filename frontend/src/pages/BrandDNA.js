import React, { useState } from "react";
import { toast } from "sonner";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Fingerprint, Save } from "lucide-react";

const TRAITS = ["Bold", "Luxury", "Energy", "Authentic", "Innovative", "Street"];

function Radar({ vals }) {
  const n = vals.length;
  const coords = vals.map((v, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (v / 100) * 80;
    return `${100 + r * Math.cos(a)},${100 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[280px] mx-auto">
      {[27, 53, 80].map((r) => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#1a2942" strokeWidth="1" />)}
      {vals.map((_, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(a)} y2={100 + 80 * Math.sin(a)} stroke="#1a2942" strokeWidth="1" />;
      })}
      <polygon points={coords} fill="rgba(0,212,255,0.22)" stroke="#00d4ff" strokeWidth="2" />
      {TRAITS.map((t, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        return <text key={t} x={100 + 95 * Math.cos(a)} y={100 + 95 * Math.sin(a)} fontSize="9" fill="#94a3b8" textAnchor="middle" dominantBaseline="middle">{t}</text>;
      })}
    </svg>
  );
}

export default function BrandDNA() {
  const [name, setName] = useState("Urban Grind");
  const [mission, setMission] = useState("Fuel the hustle with sound that moves the streets.");
  const [vals, setVals] = useState([80, 55, 90, 70, 65, 85]);

  return (
    <PageScaffold icon={Fingerprint} title="Brand DNA" sub="Identity Engine — define the soul of your sound"
      actions={<button onClick={() => toast.success("Brand DNA saved")} className="btn-neon rounded-lg px-4 py-2 text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Save Profile</button>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Brand Name</label>
          <input data-testid="brand-name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a1120] border border-[#1a2942] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan/60 mb-4" />
          <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Mission Statement</label>
          <textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={3} className="w-full bg-[#0a1120] border border-[#1a2942] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-cyan/60 mb-4" />
          <div className="space-y-3">
            {TRAITS.map((t, i) => (
              <div key={t}>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1"><span>{t}</span><span className="text-neon-cyan">{vals[i]}</span></div>
                <input type="range" min="0" max="100" value={vals[i]} onChange={(e) => setVals((v) => v.map((x, j) => (j === i ? +e.target.value : x)))} className="w-full accent-[#00d4ff]" />
              </div>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col items-center justify-center">
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-2">Identity Signature</div>
          <Radar vals={vals} />
          <div className="mt-4 text-center">
            <div className="font-display text-xl font-bold neon-text">{name}</div>
            <div className="text-xs text-slate-400 mt-1 max-w-xs">{mission}</div>
          </div>
        </Card>
      </div>
    </PageScaffold>
  );
}
