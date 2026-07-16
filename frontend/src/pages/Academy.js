import React from "react";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { GraduationCap, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const COURSES = [
  { id: 1, title: "Mixing Fundamentals", lessons: 12, progress: 75, level: "Beginner" },
  { id: 2, title: "808 Design Masterclass", lessons: 8, progress: 40, level: "Intermediate" },
  { id: 3, title: "Vocal Production Pro", lessons: 15, progress: 20, level: "Advanced" },
  { id: 4, title: "Brand-Driven Sound", lessons: 10, progress: 100, level: "All Levels" },
  { id: 5, title: "Mastering for Streaming", lessons: 6, progress: 0, level: "Intermediate" },
  { id: 6, title: "Arrangement & Flow", lessons: 9, progress: 55, level: "Beginner" },
];

export default function Academy() {
  return (
    <PageScaffold icon={GraduationCap} title="Academy" sub="Learn & Level Up — master your craft">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {COURSES.map((c) => (
          <Card key={c.id} data-testid="course-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">{c.level}</span>
              <span className="text-[10px] text-neon-cyan">{c.lessons} lessons</span>
            </div>
            <div className="font-display text-base font-bold text-white mb-3">{c.title}</div>
            <div className="h-1.5 rounded-full bg-[#0e1a30] overflow-hidden mb-1"><div className="h-full bg-gradient-to-r from-neon-cyan to-neon-deep" style={{ width: `${c.progress}%` }} /></div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-400">{c.progress === 100 ? "Completed" : `${c.progress}% complete`}</span>
              <button onClick={() => toast(`Resuming ${c.title}`)} className="btn-ghost rounded-lg px-3 py-1.5 text-xs flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5" /> {c.progress === 0 ? "Start" : "Continue"}</button>
            </div>
          </Card>
        ))}
      </div>
    </PageScaffold>
  );
}
