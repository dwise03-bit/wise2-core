'use client';

import { Workflow, Check, ArrowRight, MoreVertical } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Idea', sub: 'Lyrics or Concept' },
  { n: 2, label: 'Beat', sub: 'Generate or Choose' },
  { n: 3, label: 'Vocals', sub: 'AI or Upload' },
  { n: 4, label: 'Mix', sub: 'Studio Quality' },
  { n: 5, label: 'Master', sub: 'Radio Ready' },
  { n: 6, label: 'Export', sub: 'Deliver & Own' },
];
const ACTIVE = 1;

const CHECKLIST = [
  { label: 'Beat Generated', done: true },
  { label: 'Vocals In Progress', done: false, active: true },
  { label: 'Mixing…', done: false },
];

export function ProductionWorkflow() {
  return (
    <section className="relative bg-[#02050A] px-4 md:px-6 py-4 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto rounded-2xl border border-[#24C8FF]/12 bg-[#040B18]/60 p-5 md:p-6">
        <div className="flex items-center gap-2.5 mb-6">
          <Workflow size={20} className="text-[#24C8FF]" />
          <div>
            <h2 className="text-lg font-black text-[#F7FBFF]">PRODUCTION WORKFLOW</h2>
            <p className="text-[11px] text-[#8D9BAC]">Your song from idea to industry ready.</p>
          </div>
        </div>

        {/* stepper */}
        <div className="relative flex items-start justify-between mb-8">
          <div className="absolute top-5 left-[7%] right-[7%] h-0.5 bg-[#24C8FF]/12">
            <div className="h-full bg-gradient-to-r from-[#008CFF] to-[#24C8FF]" style={{ width: `${((ACTIVE - 1) / (STEPS.length - 1)) * 100}%` }} />
          </div>
          {STEPS.map((s) => {
            const done = s.n < ACTIVE;
            const isActive = s.n === ACTIVE;
            return (
              <div key={s.n} className="relative z-10 flex flex-col items-center text-center w-[16%]">
                <div
                  className={`w-10 h-10 rounded-full grid place-items-center text-sm font-black transition-colors ${
                    isActive
                      ? 'bg-gradient-to-br from-[#008CFF] to-[#24C8FF] text-[#02050A] shadow-[0_0_20px_rgba(36,200,255,0.5)]'
                      : done
                        ? 'bg-[#008CFF]/20 border border-[#24C8FF]/50 text-[#24C8FF]'
                        : 'bg-[#071321] border border-[#24C8FF]/15 text-[#8D9BAC]'
                  }`}
                >
                  {done ? <Check size={16} /> : s.n}
                </div>
                <p className={`mt-2 text-[11px] font-bold ${isActive ? 'text-[#F7FBFF]' : 'text-[#8D9BAC]'}`}>{s.label}</p>
                <p className="hidden sm:block text-[9px] text-[#8D9BAC]/70 leading-tight mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* My Project panel */}
        <div className="rounded-xl border border-[#24C8FF]/15 bg-[#071321]/70 p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 grid place-items-center" style={{ background: 'linear-gradient(135deg,#0a2a4d,#02050A)' }}>
              <span className="text-xl font-black text-[#24C8FF]">
                W<sup className="text-[0.5em]">2</sup>
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold tracking-widest text-[#8D9BAC]">MY PROJECT</p>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#F7FBFF]">NEW TRACK</h3>
                <span className="text-[9px] font-bold text-[#8BE8FF] bg-[#008CFF]/15 border border-[#24C8FF]/25 px-1.5 py-0.5 rounded">
                  In Progress · Full Song
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#02050A] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#008CFF] to-[#24C8FF]" style={{ width: '62%' }} />
                </div>
                <span className="text-[11px] font-mono font-bold text-[#24C8FF]">62%</span>
              </div>
            </div>
            <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-r from-[#008CFF] to-[#24C8FF] text-[#02050A] text-[11px] font-black tracking-wide hover:shadow-[0_0_20px_rgba(36,200,255,0.45)] transition-shadow cursor-pointer shrink-0">
              OPEN STUDIO <ArrowRight size={13} />
            </button>
            <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="Project options">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {CHECKLIST.map((c) => (
              <div key={c.label} className="flex items-center gap-2 rounded-lg bg-[#02050A]/60 border border-[#24C8FF]/10 px-3 py-2">
                <span
                  className={`w-4 h-4 rounded grid place-items-center shrink-0 ${
                    c.done ? 'bg-[#008CFF] text-[#02050A]' : c.active ? 'border border-[#24C8FF] text-[#24C8FF]' : 'border border-[#8D9BAC]/40'
                  }`}
                >
                  {c.done && <Check size={11} />}
                </span>
                <span className={`text-[11px] font-semibold ${c.done ? 'text-[#F7FBFF]' : 'text-[#8D9BAC]'}`}>{c.label}</span>
                {c.active && (
                  <span className="ml-auto flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1 h-1 rounded-full bg-[#24C8FF] motion-safe:animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
