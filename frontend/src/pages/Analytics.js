import React from "react";
import PageScaffold, { Card, StatTile } from "@/components/PageScaffold";
import { BarChart3 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const streams = [
  { m: "Jan", v: 1200 }, { m: "Feb", v: 2100 }, { m: "Mar", v: 1800 }, { m: "Apr", v: 3200 },
  { m: "May", v: 4100 }, { m: "Jun", v: 5300 }, { m: "Jul", v: 6800 },
];
const genres = [
  { g: "Hip Hop", v: 42 }, { g: "Trap", v: 28 }, { g: "R&B", v: 15 }, { g: "Drill", v: 9 }, { g: "Pop", v: 6 },
];

export default function Analytics() {
  return (
    <PageScaffold icon={BarChart3} title="Analytics" sub="Insights & Reports — track your growth">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Total Streams" value="248K" />
        <StatTile label="Monthly Listeners" value="18.2K" accent="text-white" />
        <StatTile label="Avg. Completion" value="87%" accent="text-green-400" />
        <StatTile label="New Followers" value="+2,410" accent="text-fuchsia-400" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Streams Over Time</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={streams}>
              <defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00d4ff" stopOpacity={0.5} /><stop offset="100%" stopColor="#00d4ff" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#16233d" vertical={false} />
              <XAxis dataKey="m" stroke="#475569" fontSize={11} /><YAxis stroke="#475569" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0a1120", border: "1px solid #1a2942", borderRadius: 8 }} />
              <Area type="monotone" dataKey="v" stroke="#00d4ff" strokeWidth={2} fill="url(#c)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Genre Split</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={genres} layout="vertical">
              <XAxis type="number" stroke="#475569" fontSize={11} /><YAxis dataKey="g" type="category" stroke="#475569" fontSize={11} width={60} />
              <Tooltip contentStyle={{ background: "#0a1120", border: "1px solid #1a2942", borderRadius: 8 }} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
              <Bar dataKey="v" fill="#a855f7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </PageScaffold>
  );
}
