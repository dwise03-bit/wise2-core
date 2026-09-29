'use client';

type SidebarProps = { items: string[]; active: string; onSelect: (item: string) => void };
type ContextItem = readonly [string, string];

const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02070d]';

export function HermesSidebar({ items, active, onSelect }: SidebarProps) {
  return <aside aria-label="Hermes navigation" className="flex gap-2 overflow-x-auto rounded border border-cyan-500/30 bg-[#02070d] p-3 xl:block xl:overflow-visible">
    {items.map(item => <button key={item} type="button" aria-pressed={active === item} onClick={() => onSelect(item)} className={`shrink-0 rounded px-3 py-2 text-left text-xs font-medium transition-all border ${focus} ${active === item ? 'bg-cyan-500/20 text-cyan-100 border-cyan-400/50' : 'text-slate-400 hover:text-cyan-100 border-transparent'}`}>{item}</button>)}
  </aside>;
}

export function CommandWorld() {
  return <section aria-label="WISE² Command World" className="relative min-h-[540px] overflow-hidden rounded border border-cyan-600/40 bg-[#02070d] p-5 text-center sm:min-h-[650px]">
    <h2 className="text-xl font-black tracking-wider text-white">WISE² COMMAND WORLD</h2>
    <p className="text-[10px] tracking-[.2em] text-cyan-300">REAL-TIME INTELLIGENCE · REAL-WORLD ACTION</p>
    <div className="mx-auto mt-12 flex h-64 w-64 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/5 shadow-[0_0_80px_rgba(0,174,255,.3)] sm:mt-16 sm:h-80 sm:w-80">
      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-2 border-cyan-300 bg-[#061522] shadow-[0_0_55px_rgba(0,200,255,.45)] sm:h-48 sm:w-48"><span className="text-5xl font-black">W²</span><span className="mt-2 text-xs font-bold text-cyan-300">CONTEXT ENGINE</span><span className="mt-3 text-[10px] leading-5 text-slate-400">PEOPLE · PROJECTS<br/>KNOWLEDGE · OPERATIONS<br/>REAL-WORLD IMPACT</span></div>
    </div>    <div className="mt-8 grid grid-cols-2 gap-2 text-xs sm:absolute sm:inset-x-5 sm:top-44 sm:block">
      <span className="rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 sm:absolute sm:left-0">BUSINESS OPERATIONS</span><span className="rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 sm:absolute sm:right-0 sm:top-8">FIELD OPERATIONS</span>
      <span className="rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 sm:absolute sm:left-3 sm:top-80">AI AGENTS</span><span className="rounded border border-cyan-700 bg-[#061522]/90 px-3 py-2 sm:absolute sm:right-3 sm:top-80">INFRASTRUCTURE</span>
    </div>
    <p className="mt-10 text-sm font-bold tracking-[.16em] text-cyan-300 sm:absolute sm:bottom-8 sm:left-0 sm:right-0">ONE CONNECTED OPERATING LAYER<br/><span className="text-[10px] text-slate-500">FROM INTELLIGENCE TO IMPACT</span></p>
  </section>;
}

export function LiveContextPanel({ items, onSync }: { items: readonly ContextItem[]; onSync: () => void }) {
  return <aside className="rounded border border-cyan-500/30 bg-[#02070d] p-4"><div className="mb-4 flex justify-between items-center"><b className="text-sm font-semibold tracking-wide text-white">LIVE CONTEXT</b><button type="button" onClick={onSync} className={`text-xs text-cyan-400 hover:text-cyan-200 transition ${focus}`}>↻ Sync</button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">{items.map(([label, value]) => <div key={label} className="rounded border border-cyan-500/30 bg-[#04101a]/50 p-3"><div className="text-[10px] font-medium text-cyan-400/70 uppercase tracking-wider">{label}</div><div className="text-sm font-semibold text-cyan-100 mt-1">{value}</div></div>)}</div>
    <div className="mt-4 border-t border-cyan-500/20 pt-3 text-xs leading-6 text-slate-400 space-y-1"><div><span className="text-green-400">●</span> Operating layer ready</div><div><span className="text-green-400">●</span> Field signal strong</div><div><span className="text-green-400">●</span> Automation online</div></div>
  </aside>;
}

export function RouteButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`rounded-full border px-5 py-2 text-xs font-bold transition-all ${focus} ${active ? 'border-green-400/60 bg-green-400/20 text-green-300 shadow-sm shadow-green-500/10' : 'border-cyan-500/40 bg-cyan-500/5 text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-500/10'}`}>{label}</button>;
}