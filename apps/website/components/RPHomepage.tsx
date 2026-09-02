'use client';
import Link from 'next/link';
import { ArrowRight, Zap, Users, Layers, Trophy } from 'lucide-react';

export function RPHomepage() {
  const progressionDimensions = [
    { label: 'Skills', icon: Zap, color: '#0094FF' },
    { label: 'Reputation', icon: Trophy, color: '#FF1493' },
    { label: 'Wealth', icon: Layers, color: '#0094FF' },
    { label: 'Relationships', icon: Users, color: '#FF1493' },
  ];

  const legacyArchetypes = [
    {
      name: 'Entrepreneur',
      description: 'Built an empire from hustle and vision',
      traits: ['Business Owner', 'Investor', 'Risk Taker'],
      color: '#0094FF',
    },
    {
      name: 'Community Icon',
      description: 'Shaped the city through influence and action',
      traits: ['Leader', 'Connected', 'Visionary'],
      color: '#FF1493',
    },
    {
      name: 'Street Legend',
      description: 'Carved your name into the underground',
      traits: ['Dangerous', 'Respected', 'Feared'],
      color: '#0094FF',
    },
    {
      name: 'City Hero',
      description: 'Saved lives and changed destinies',
      traits: ['Protector', 'Honorable', 'Trusted'],
      color: '#FF1493',
    },
  ];

  return (
    <main className="bg-[#0a0a0a] text-white overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-6 lg:px-8">
          <Link href="/" className="leading-none" aria-label="WISE2 RP home">
            <span className="block text-[26px] font-black tracking-[-.08em]">
              WISE<sup className="text-sm text-[#0094FF]">² RP</sup>
            </span>
            <span className="mt-1 block text-[9px] font-bold tracking-[.38em] text-[#FF1493]">YOUR LEGACY AWAITS</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-bold tracking-[.16em] text-white/50 md:flex">
            <Link href="#progression" className="transition-colors hover:text-[#0094FF]">
              PROGRESSION
            </Link>
            <Link href="#archetypes" className="transition-colors hover:text-[#FF1493]">
              ARCHETYPES
            </Link>
            <Link href="#systems" className="transition-colors hover:text-[#0094FF]">
              SYSTEMS
            </Link>
          </nav>
          <button className="border border-[#0094FF]/60 px-4 py-2 text-[10px] font-bold tracking-[.14em] text-[#0094FF] transition-all hover:bg-[#0094FF] hover:text-black hover:shadow-[0_0_20px_rgba(0,148,255,0.5)]">
            ENTER THE CITY
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-end justify-center pt-[74px] overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0094FF]/20 via-[#0a0a0a] to-[#FF1493]/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,148,255,0.1),rgba(10,10,10,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_120%,rgba(255,20,147,0.1),rgba(10,10,10,0))]" />
        </div>

        {/* Content */}
        <div className="relative mx-auto w-full max-w-[1240px] px-6 pb-20 lg:px-8 lg:pb-28">
          <div className="max-w-[700px] space-y-8">
            <div className="space-y-4">
              <p className="text-[11px] font-bold tracking-[.32em] text-[#0094FF] animate-pulse">
                WISE² ROLEPLAY · THE CITY AWAITS
              </p>
              <h1 className="text-[clamp(3.6rem,8vw,7.7rem)] font-black uppercase leading-[0.84] tracking-[-.06em]">
                Your City.<br />
                <span className="bg-gradient-to-r from-[#0094FF] to-[#FF1493] bg-clip-text text-transparent">
                  Your Story.
                </span>
                <br />
                Your Legacy.
              </h1>
            </div>

            <p className="max-w-[500px] text-lg leading-8 text-white/70">
              Build your identity through choices, actions, and relationships. No levels define you—your legacy does.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0094FF] to-[#0071CC] px-7 py-4 text-xs font-black tracking-[.12em] text-white transition-all hover:shadow-[0_0_30px_rgba(0,148,255,0.6)] hover:-translate-y-1">
                START YOUR STORY <ArrowRight size={16} />
              </button>
              <button className="inline-flex items-center gap-3 border border-[#FF1493]/40 bg-black/20 px-7 py-4 text-xs font-bold tracking-[.12em] text-white transition-all hover:border-[#FF1493] hover:shadow-[0_0_20px_rgba(255,20,147,0.4)]">
                EXPLORE THE CITY
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="text-[10px] font-bold tracking-[.2em] text-white/40 mb-2">ENTER</div>
          <svg className="w-5 h-5 text-[#0094FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Progression Section */}
      <section id="progression" className="relative border-y border-white/5 bg-[#050505] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-16">
            <p className="mb-4 text-[10px] font-bold tracking-[.3em] text-[#0094FF]">MULTI-DIMENSIONAL GROWTH</p>
            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-.04em] md:text-6xl">
              You're More Than <span className="text-white/40">A Level</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {progressionDimensions.map((dimension) => {
              const Icon = dimension.icon;
              return (
                <div
                  key={dimension.label}
                  className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 transition-all hover:border-white/20 hover:bg-gradient-to-br hover:from-white/[0.08]"
                >
                  <div className="mb-6 inline-block p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Icon size={24} style={{ color: dimension.color }} />
                  </div>
                  <h3 className="text-xl font-bold uppercase" style={{ color: dimension.color }}>
                    {dimension.label}
                  </h3>
                  <p className="mt-3 text-sm text-white/60">Advance through your actions, not just XP</p>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold uppercase">Legacy DNA</h3>
              <p className="text-white/70 leading-8">
                Your choices compound over time. Every decision, relationship, and achievement shapes who you become.
                Wealth, skills, reputation, and connections—they all tell your story.
              </p>
              <p className="text-sm text-white/50">
                Unlike traditional RPGs, there's no single "win state." Your legacy is unique to the path you choose.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[#0094FF]/20 bg-[#0094FF]/5 p-6 rounded-lg">
                <div className="text-2xl font-black text-[#0094FF] mb-2">Choices</div>
                <p className="text-xs text-white/60">Shape your identity</p>
              </div>
              <div className="border border-[#FF1493]/20 bg-[#FF1493]/5 p-6 rounded-lg">
                <div className="text-2xl font-black text-[#FF1493] mb-2">Actions</div>
                <p className="text-xs text-white/60">Build your reputation</p>
              </div>
              <div className="border border-[#0094FF]/20 bg-[#0094FF]/5 p-6 rounded-lg">
                <div className="text-2xl font-black text-[#0094FF] mb-2">Relationships</div>
                <p className="text-xs text-white/60">Connect your network</p>
              </div>
              <div className="border border-[#FF1493]/20 bg-[#FF1493]/5 p-6 rounded-lg">
                <div className="text-2xl font-black text-[#FF1493] mb-2">Legacy</div>
                <p className="text-xs text-white/60">Define your era</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Archetypes Section */}
      <section id="archetypes" className="relative px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-16">
            <p className="mb-4 text-[10px] font-bold tracking-[.3em] text-[#FF1493]">PLAYER ARCHETYPES</p>
            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-.04em] md:text-6xl">
              Choose Your <span className="text-white/40">Legacy Path</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {legacyArchetypes.map((archetype, idx) => (
              <div
                key={archetype.name}
                className="group relative overflow-hidden border transition-all"
                style={{
                  borderColor: `${archetype.color}40`,
                  backgroundColor: `${archetype.color}05`,
                }}
              >
                <div className="relative p-8">
                  <div className="mb-4 text-xs font-bold tracking-[.2em] text-white/40">
                    ARCHETYPE 0{idx + 1}
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-3" style={{ color: archetype.color }}>
                    {archetype.name}
                  </h3>
                  <p className="text-sm text-white/70 mb-6">{archetype.description}</p>
                  <div className="space-y-2">
                    {archetype.traits.map((trait) => (
                      <div key={trait} className="flex items-center gap-2">
                        <span style={{ color: archetype.color }}>+</span>
                        <span className="text-xs text-white/60">{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundImage: `linear-gradient(to right, transparent, ${archetype.color}, transparent)` }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Systems Preview Section */}
      <section id="systems" className="relative border-y border-white/5 bg-[#050505] px-6 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 text-[10px] font-bold tracking-[.3em] text-[#0094FF]">THE CITY SYSTEMS</p>
            <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-[-.04em] md:text-6xl">
              Interconnected <span className="text-white/40">Systems</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Economy', desc: 'Banking, credit, taxes, money flows' },
              { name: 'Employment', desc: 'Jobs, careers, business ownership' },
              { name: 'Real Estate', desc: 'Property, development, housing' },
              { name: 'Transportation', desc: 'Vehicles, dealerships, mechanics' },
              { name: 'Law & Order', desc: 'Police, courts, justice system' },
              { name: 'Underground', desc: 'Crews, territories, street life' },
            ].map((system) => (
              <div
                key={system.name}
                className="border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/[0.08]"
              >
                <h3 className="font-bold uppercase text-white/90">{system.name}</h3>
                <p className="mt-2 text-sm text-white/50">{system.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-28 text-center lg:py-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,148,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,20,147,0.08),transparent_60%)]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="mb-5 text-[10px] font-bold tracking-[.32em] text-[#0094FF]">READY TO RISE</p>
          <h2 className="text-5xl font-black uppercase leading-[0.88] tracking-[-.05em] md:text-8xl">
            Make Your Move.
          </h2>
          <p className="mx-auto mt-7 max-w-md text-base leading-7 text-white/60">
            Your city. Your story. Your legacy. Build it now.
          </p>
          <button className="mt-9 inline-flex items-center gap-3 bg-gradient-to-r from-[#0094FF] to-[#0071CC] px-8 py-4 text-xs font-black tracking-[.12em] text-white transition-all hover:shadow-[0_0_30px_rgba(0,148,255,0.6)] hover:-translate-y-1">
            ENTER THE GAME <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-4 text-[10px] font-bold tracking-[.12em] text-white/40 md:flex-row">
          <span className="text-lg tracking-[-.08em] text-white">
            WISE<sup className="text-[#0094FF]">² RP</sup>
          </span>
          <span>YOUR CITY · YOUR STORY · YOUR LEGACY</span>
          <span>© 2026 WISE²</span>
        </div>
      </footer>
    </main>
  );
}
