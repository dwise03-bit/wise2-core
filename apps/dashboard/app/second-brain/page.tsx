'use client';

import { useMemo, useState } from 'react';
import { Archive, ArrowUpRight, BookOpen, Brain, Check, FileText, Filter, Link2, Plus, Search, Sparkles, Tag, X } from 'lucide-react';

type Note = {
  id: string;
  title: string;
  excerpt: string;
  collection: string;
  tags: string[];
  updated: string;
  status: 'Active' | 'Decision' | 'Reference';
};

const initialNotes: Note[] = [
  { id: 'revenue-os', title: 'Revenue OS operating rhythm', excerpt: 'The weekly loop for turning signal into pipeline: capture, qualify, follow up, and learn.', collection: 'Operating System', tags: ['revenue', 'process'], updated: '12 min ago', status: 'Active' },
  { id: 'telnyx', title: 'Telnyx production integration', excerpt: 'Voice and WhatsApp are routed through the provider boundary. Webhooks terminate at api.wise2.net.', collection: 'Integrations', tags: ['telnyx', 'production'], updated: 'Yesterday', status: 'Reference' },
  { id: 'second-brain', title: 'Second Brain: capture rules', excerpt: 'Every durable decision gets a short title, context, owner, next action, and source link.', collection: 'Operating System', tags: ['knowledge', 'decisions'], updated: '2 days ago', status: 'Decision' },
  { id: 'contractor-os', title: 'Contractor OS north star', excerpt: 'A calm control plane for small teams: fewer tabs, clear ownership, and action at the edge of context.', collection: 'Strategy', tags: ['wise²', 'strategy'], updated: '4 days ago', status: 'Decision' },
];

export default function SecondBrainPage() {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState(initialNotes[0].id);
  const [query, setQuery] = useState('');
  const [captureOpen, setCaptureOpen] = useState(false);
  const [capture, setCapture] = useState('');
  const selected = notes.find((note) => note.id === selectedId) ?? notes[0];
  const filtered = useMemo(() => notes.filter((note) => `${note.title} ${note.excerpt} ${note.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [notes, query]);

  function saveCapture() {
    const title = capture.trim().split('\n')[0] || 'Untitled thought';
    const note: Note = { id: `capture-${Date.now()}`, title, excerpt: capture.trim() || 'A new thought captured from the command center.', collection: 'Inbox', tags: ['captured'], updated: 'Just now', status: 'Active' };
    setNotes((current) => [note, ...current]);
    setSelectedId(note.id);
    setCapture('');
    setCaptureOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-100">
      <header className="border-b border-white/10 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2cd588]/15 text-[#2cd588]"><Brain size={22} aria-hidden="true" /></div><div><p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#2cd588]">WISE² / COMMAND CENTER</p><h1 className="text-2xl font-semibold tracking-tight">Second Brain</h1><p className="mt-1 text-xs text-slate-500">Business memory and operating context</p></div></div>
          <div className="flex items-center gap-2"><a href="wise2://digital-twin" className="hidden min-h-11 items-center gap-2 rounded-lg border border-white/15 px-3 text-xs text-slate-300 transition hover:border-[#2cd588]/50 hover:text-white sm:flex"><ArrowUpRight size={15} /> Open Quest</a><span className="hidden items-center gap-2 rounded-full border border-[#2cd588]/25 bg-[#2cd588]/10 px-3 py-2 text-xs text-[#8ee9bc] lg:flex"><span className="h-2 w-2 rounded-full bg-[#2cd588]" /> Synced locally</span><button onClick={() => setCaptureOpen(true)} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#2cd588] px-4 text-sm font-semibold text-[#04130c] transition hover:bg-[#63e5a7] focus:outline-none focus:ring-2 focus:ring-[#2cd588]" aria-label="Capture a new thought"><Plus size={17} /> Capture thought</button></div>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1500px] gap-5 p-5 sm:p-8 lg:grid-cols-[220px_minmax(360px,540px)_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div><p className="mb-3 text-[11px] font-semibold uppercase tracking-[.18em] text-slate-500">Collections</p><div className="space-y-1">{['All notes', 'Inbox', 'Operating System', 'Integrations', 'Strategy'].map((item, index) => <button key={item} className={`flex min-h-11 w-full cursor-pointer items-center justify-between rounded-lg px-3 text-left text-sm transition ${index === 0 ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><span className="flex items-center gap-3">{index === 0 ? <BookOpen size={16} /> : <Archive size={16} />}{item}</span>{index === 0 && <span className="text-xs text-slate-500">{notes.length}</span>}</button>)}</div></div>
          <div className="rounded-xl border border-white/10 bg-white/[.03] p-4"><div className="mb-3 flex items-center gap-2 text-sm font-medium"><Sparkles size={16} className="text-[#2cd588]" /> Brain health</div><div className="mb-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[82%] rounded-full bg-[#2cd588]" /></div><p className="text-xs leading-5 text-slate-500">82% of recent decisions have an owner and next action.</p></div>
        </aside>
        <section className="min-w-0">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3"><Search size={17} className="text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your brain..." className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-600" aria-label="Search notes" /><Filter size={16} className="text-slate-500" /></div>
          <div className="mb-4 flex items-center justify-between"><p className="text-xs text-slate-500">{filtered.length} notes · updated recently</p><button className="cursor-pointer text-xs text-slate-400 transition hover:text-white">Sort: recent</button></div>
          <div className="space-y-2">{filtered.map((note) => <button key={note.id} onClick={() => setSelectedId(note.id)} className={`w-full cursor-pointer rounded-xl border p-4 text-left transition hover:border-[#2cd588]/40 ${selectedId === note.id ? 'border-[#2cd588]/50 bg-[#2cd588]/[.07]' : 'border-white/10 bg-white/[.025]'}`}><div className="mb-2 flex items-start justify-between gap-3"><div className="flex items-center gap-2"><FileText size={15} className={selectedId === note.id ? 'text-[#2cd588]' : 'text-slate-500'} /><h2 className="text-sm font-medium text-slate-100">{note.title}</h2></div><span className="whitespace-nowrap text-[11px] text-slate-600">{note.updated}</span></div><p className="line-clamp-2 text-xs leading-5 text-slate-400">{note.excerpt}</p><div className="mt-3 flex flex-wrap gap-2">{note.tags.map((tag) => <span key={tag} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-slate-500">#{tag}</span>)}</div></button>)}</div>
        </section>
        <article className="min-h-[520px] rounded-2xl border border-white/10 bg-[#0b0f15] p-6 sm:p-8"><div className="mb-8 flex items-start justify-between gap-4"><div><div className="mb-3 flex items-center gap-2 text-xs text-[#8ee9bc]"><span className="rounded-md bg-[#2cd588]/10 px-2 py-1">{selected?.status}</span><span className="text-slate-600">{selected?.collection}</span></div><h2 className="text-2xl font-semibold tracking-tight text-white">{selected?.title}</h2><p className="mt-2 text-xs text-slate-500">Last updated {selected?.updated} · owned by WISE²</p></div><button className="min-h-11 min-w-11 cursor-pointer rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-white/25 hover:text-white" aria-label="Open note actions"><ArrowUpRight size={18} /></button></div><div className="space-y-5 text-sm leading-7 text-slate-300"><p>{selected?.excerpt}</p><div className="rounded-xl border-l-2 border-[#2cd588] bg-[#2cd588]/[.05] p-4 text-sm leading-6 text-slate-300"><strong className="font-medium text-[#8ee9bc]">Working context</strong><p className="mt-1">This note is available to the WISE² Business Operator as context. Keep durable knowledge here; keep credentials and secrets out.</p></div><div><h3 className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Connected signals</h3><div className="flex flex-wrap gap-2"><span className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400"><Link2 size={13} /> Revenue OS</span><span className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400"><Tag size={13} /> {selected?.tags[0]}</span></div></div></div></article>
      </main>
      {captureOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5" role="dialog" aria-modal="true" aria-labelledby="capture-title"><div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#10151d] p-6 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 id="capture-title" className="text-lg font-semibold">Capture a thought</h2><button onClick={() => setCaptureOpen(false)} className="min-h-11 min-w-11 cursor-pointer rounded-lg p-2 text-slate-400 hover:text-white" aria-label="Close capture dialog"><X size={18} /></button></div><textarea autoFocus value={capture} onChange={(e) => setCapture(e.target.value)} placeholder="What should WISE² remember?" className="min-h-36 w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none transition focus:border-[#2cd588]" /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setCaptureOpen(false)} className="min-h-11 cursor-pointer rounded-lg px-4 text-sm text-slate-400 hover:text-white">Cancel</button><button onClick={saveCapture} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-[#2cd588] px-4 text-sm font-semibold text-[#04130c] hover:bg-[#63e5a7]"><Check size={16} /> Save to inbox</button></div></div></div>}
    </div>
  );
}
