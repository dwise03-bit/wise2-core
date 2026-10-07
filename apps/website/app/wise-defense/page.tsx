'use client';

import { useState } from 'react';
import { Menu, X, ShieldCheck, Target, Users, GraduationCap, ArrowRight, CheckCircle2, Phone, Mail } from 'lucide-react';
import { wiseDefenseInstructors } from '@/data/wise2-content';

const training = [
  { icon: ShieldCheck, title: 'FIREARM SAFETY', text: 'Build safe, responsible habits and confidence from the ground up.' },
  { icon: Target, title: 'MARKSMANSHIP', text: 'Fundamentals, accuracy, consistency, and practical skill development.' },
  { icon: GraduationCap, title: 'PRIVATE TRAINING', text: 'Focused instruction built around your current experience and goals.' },
  { icon: Users, title: 'GROUP TRAINING', text: 'Structured training for families, organizations, and community groups.' },
];

export default function WiseDefenseLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const instructor = wiseDefenseInstructors.find((item) => item.featured) || wiseDefenseInstructors[0];
  const nav = [
    ['TRAINING', '#training'],
    ['INSTRUCTOR', '#instructor'],
    ['ABOUT', '#about'],
    ['CONTACT', '#contact'],
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-red-700">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Wise Defense home">
            <div className="grid h-11 w-11 place-items-center border border-white/30 bg-gradient-to-br from-white via-zinc-300 to-zinc-600 text-xl font-black text-black shadow-[0_0_30px_rgba(255,255,255,.08)]">WD</div>
            <div>
              <div className="text-sm font-black tracking-[.2em]">WISE DEFENSE</div>
              <div className="mt-1 text-[9px] font-bold tracking-[.28em] text-red-500">TRAIN. TEACH. PROTECT.</div>
            </div>
          </a>
          <div className="hidden items-center gap-8 lg:flex">
            {nav.map(([label, href]) => <a key={label} href={href} className="text-[11px] font-bold tracking-[.18em] text-zinc-400 transition hover:text-white">{label}</a>)}
            <a href="#contact" className="bg-red-700 px-5 py-3 text-[11px] font-black tracking-[.16em] transition hover:bg-red-600">BOOK TRAINING</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 lg:hidden" aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-white/10 bg-black px-6 py-5 lg:hidden">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-white/10 py-4 text-sm font-bold tracking-[.15em]">{label}</a>)}<a href="#contact" onClick={() => setMenuOpen(false)} className="mt-5 block bg-red-700 px-5 py-4 text-center text-xs font-black tracking-[.16em]">BOOK TRAINING</a></div>}
      </nav>

      <section id="top" className="relative min-h-[92svh] pt-20">
        <img src={instructor.actionImage} alt="Wise Defense professional firearms training" className="absolute inset-0 h-full w-full object-cover object-center lg:object-[68%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
        <div className="relative mx-auto flex min-h-[calc(92svh-5rem)] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3 text-[11px] font-black tracking-[.28em] text-red-500"><span className="h-px w-10 bg-red-600" /> PROFESSIONAL FIREARMS TRAINING</div>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[.88] tracking-[-.055em] sm:text-7xl lg:text-[92px]">TRAIN WITH<br/><span className="text-zinc-300">PURPOSE.</span></h1>
            <p className="mt-7 text-lg font-black tracking-[.22em] text-red-500 sm:text-xl">TRAIN. TEACH. PROTECT.</p>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">Professional firearms safety and skills training built around discipline, confidence, responsibility, and real instruction.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="inline-flex items-center justify-center gap-3 bg-red-700 px-7 py-4 text-xs font-black tracking-[.16em] hover:bg-red-600">BOOK TRAINING <ArrowRight size={16}/></a>
              <a href="#training" className="inline-flex items-center justify-center gap-3 border border-white/25 bg-black/30 px-7 py-4 text-xs font-black tracking-[.16em] backdrop-blur hover:border-white">VIEW TRAINING</a>
            </div>
          </div>
        </div>
      </section>

      <section id="training" className="border-y border-white/10 bg-[#090909] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mb-12 max-w-2xl"><p className="text-xs font-black tracking-[.25em] text-red-500">TRAINING</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">BUILD SKILL.<br/>BUILD CONFIDENCE.</h2></div>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {training.map(({icon: Icon,title,text}) => <article key={title} className="bg-[#080808] p-7 transition hover:bg-[#101010]"><Icon className="mb-8 text-red-600" size={30}/><h3 className="text-sm font-black tracking-[.12em]">{title}</h3><p className="mt-4 text-sm leading-6 text-zinc-400">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="instructor" className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative min-h-[520px] overflow-hidden border border-white/10"><img src={instructor.image} alt={instructor.name} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"/><div className="absolute bottom-0 p-7"><div className="text-xs font-black tracking-[.2em] text-red-500">LEAD INSTRUCTOR</div><div className="mt-2 text-3xl font-black">{instructor.name}</div></div></div>
          <div>
            <p className="text-xs font-black tracking-[.25em] text-red-500">INSTRUCTION THAT MEETS YOU WHERE YOU ARE</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">SAFETY FIRST.<br/>SKILL FOR LIFE.</h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-zinc-400">{instructor.bio}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">{instructor.specialties.map((item) => <div key={item} className="flex items-center gap-3 border-b border-white/10 py-3 text-sm font-semibold text-zinc-200"><CheckCircle2 size={17} className="text-red-600"/>{item}</div>)}</div>
            <a href="#contact" className="mt-9 inline-flex items-center gap-3 border border-red-700 px-6 py-4 text-xs font-black tracking-[.16em] text-red-500 transition hover:bg-red-700 hover:text-white">SCHEDULE A SESSION <ArrowRight size={16}/></a>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-white/10 bg-gradient-to-br from-[#110707] to-black py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center sm:px-8">
          <p className="text-xs font-black tracking-[.25em] text-red-500">WISE DEFENSE LLC</p>
          <h2 className="mt-5 text-4xl font-black uppercase tracking-tight sm:text-6xl">Prepared. Responsible.<br/>Confident.</h2>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-zinc-400">Wise Defense is centered on responsible firearm education and practical training. Every session prioritizes safety, disciplined fundamentals, and instruction you can carry forward with confidence.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">{['SAFETY & EDUCATION','PRIVATE INSTRUCTION','COMMUNITY FOCUSED','SKILL DEVELOPMENT'].map(x=><span key={x} className="border border-white/15 px-4 py-2 text-[10px] font-black tracking-[.15em] text-zinc-300">{x}</span>)}</div>
        </div>
      </section>

      <section id="contact" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="overflow-hidden border border-red-800/50 bg-[#0b0808] p-8 sm:p-12 lg:flex lg:items-center lg:justify-between">
            <div><p className="text-xs font-black tracking-[.25em] text-red-500">READY TO TRAIN?</p><h2 className="mt-3 text-4xl font-black sm:text-5xl">BOOK YOUR SESSION.</h2><p className="mt-4 max-w-xl text-zinc-400">Contact Wise Defense to discuss your experience level, training goals, and the right session for you.</p></div>
            <div className="mt-8 flex flex-col gap-3 lg:mt-0">
              <a href="tel:+13367090472" className="inline-flex items-center gap-3 bg-red-700 px-7 py-4 text-sm font-black hover:bg-red-600"><Phone size={18}/> (336) 709-0472</a>
              <a href="mailto:info@wisedefensellc.com?subject=Wise%20Defense%20Training%20Request" className="inline-flex items-center gap-3 border border-white/20 px-7 py-4 text-sm font-bold text-zinc-200 hover:border-white"><Mail size={18}/> EMAIL WISE DEFENSE</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 text-xs text-zinc-500 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div><span className="font-black tracking-[.15em] text-white">WISE DEFENSE LLC</span><span className="ml-3 text-red-600">TRAIN. TEACH. PROTECT.</span></div>
          <div>© 2026 WISE DEFENSE LLC. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </main>
  );
}
