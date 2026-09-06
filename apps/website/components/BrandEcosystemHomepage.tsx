"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Circle,
  Cpu,
  Gauge,
  Layers3,
  Menu,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { useState } from "react";

const metrics = [
  ["01", "connected operating layer", "Everything speaks to everything."],
  ["24/7", "systems that keep moving", "Momentum does not clock out."],
  ["04", "ways to run the work", "Cloud, edge, desktop, mobile."],
  ["∞", "room to grow into", "Start where you are. Build forward."],
];

const capabilities = [
  {
    icon: Workflow,
    number: "01",
    title: "AI workflows",
    copy: "Turn repeatable work into intelligent systems that execute, remember, and improve.",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Business infrastructure",
    copy: "Bring cloud, VPS, edge, desktop, and mobile operations into one coherent layer.",
  },
  {
    icon: Gauge,
    number: "03",
    title: "Command visibility",
    copy: "See what is moving, what is stuck, and what deserves attention before it becomes a fire.",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Durable control",
    copy: "Build with practical security, documented decisions, and systems your team can actually own.",
  },
];

const deployments = [
  {
    label: "WISE² IMP SYSTEMS",
    title: "WISE IMPS",
    copy: "Voice, edge intelligence, and AI automation built for real life.",
    image: "/wise-imp/imps-product.png",
    href: "/products/imp",
    tone: "cyan",
  },
  {
    label: "FIELD OPERATIONS",
    title: "HVAC intelligence",
    copy: "Diagnostics, dispatch, maintenance, and customer history in one field-ready flow.",
    image: "/brand/wise2-command-center.jpg",
    href: "/hvac",
    tone: "lime",
  },
  {
    label: "CREATIVE OPERATIONS",
    title: "Sound Labs",
    copy: "A production environment for turning ideas into finished assets, campaigns, and culture.",
    image: "/brand/wise2-brand-identity.png",
    href: "/sound-labs",
    tone: "purple",
  },
  {
    label: "CLIENT OPERATIONS",
    title: "The client OS",
    copy: "A shared operating layer for keeping relationships, work, and momentum visible.",
    image: "/brand/wise2-hero-united-source.png",
    href: "/platform",
    tone: "white",
  },
  {
    label: "CONTRACTOR OPERATIONS",
    title: "Contractor OS",
    copy: "CRM, estimates, scheduling, dispatch, and field work in one system.",
    image: "/brand/wise2-command-center.jpg",
    href: "/fieldtech",
    tone: "gold",
  },
];

export function BrandEcosystemHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="wise-home overflow-hidden bg-[#050505] text-[#f5f7f2]">
      <div className="wise-topline">
        <span>WISE² / FIELD-BUILT INTELLIGENCE</span>
        <span className="hidden sm:inline">
          SYSTEM STATUS <i /> ALL SYSTEMS NOMINAL
        </span>
      </div>
      <header className="wise-header fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[78px] max-w-[1320px] items-center justify-between px-6 lg:px-10">
          <Link href="/" aria-label="WISE2 home" className="leading-none">
            <span className="block text-[27px] font-black tracking-[-.09em]">
              WISE<sup className="text-sm text-[#b9ff00]">²</sup>
            </span>
            <span className="mt-1 block text-[9px] font-bold tracking-[.38em] text-[#b9ff00]">
              REAL-WORLD INTELLIGENCE
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-[11px] font-bold tracking-[.16em] text-white/65 lg:flex">
            <Link
              href="#system"
              className="transition-colors hover:text-[#b9ff00]"
            >
              SYSTEM
            </Link>
            <Link
              href="#deployments"
              className="transition-colors hover:text-[#b9ff00]"
            >
              DEPLOYMENTS
            </Link>
            <Link
              href="#method"
              className="transition-colors hover:text-[#b9ff00]"
            >
              METHOD
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-[#b9ff00]"
            >
              ABOUT
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/audit"
              className="inline-flex min-h-11 items-center gap-2 bg-[#b9ff00] px-4 py-3 text-[10px] font-black tracking-[.13em] text-black transition-transform hover:-translate-y-0.5"
            >
              START WITH AN AUDIT <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              aria-label={
                menuOpen ? "Close navigation menu" : "Open navigation menu"
              }
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center border border-white/20 text-white lg:hidden"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#050505] px-6 py-5 lg:hidden">
            <div className="flex flex-col gap-4 text-xs font-bold tracking-[.16em] text-white/70">
              <Link href="#system" onClick={() => setMenuOpen(false)}>
                SYSTEM
              </Link>
              <Link href="#deployments" onClick={() => setMenuOpen(false)}>
                DEPLOYMENTS
              </Link>
              <Link href="#method" onClick={() => setMenuOpen(false)}>
                METHOD
              </Link>
              <Link href="/about" onClick={() => setMenuOpen(false)}>
                ABOUT
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="wise-hero relative flex min-h-[890px] items-end pt-[110px] lg:min-h-[980px]">
        <Image
          src="/brand/wise2-hero-united-source.png"
          alt="WISE² team and business operating system brand artwork"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="wise-hero-grid absolute inset-0" />
        <div className="wise-hero-shade wise-hero-shade-horizontal absolute inset-0" />
        <div className="wise-hero-shade wise-hero-shade-vertical absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-[1320px] gap-14 px-6 pb-16 lg:grid-cols-[1fr_330px] lg:items-end lg:px-10 lg:pb-24">
          <div className="max-w-[760px]">
            <p className="wise-kicker mb-7">
              WISE² · BUSINESS OPERATING SYSTEM
            </p>
            <h1 className="wise-display">
              Make the
              <br />
              <span>whole thing</span>
              <br />
              move.
            </h1>
            <p className="mt-8 max-w-[540px] text-base leading-7 text-white/75 lg:text-lg">
              WISE² connects the tools, people, intelligence, and infrastructure
              behind real businesses—so good work stops getting lost between
              systems.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/platform"
                className="wise-button inline-flex min-h-12 items-center gap-3 bg-[#b9ff00] px-6 py-4 text-xs font-black tracking-[.12em] text-black"
              >
                ENTER THE SYSTEM <ArrowRight size={16} />
              </Link>
              <Link
                href="#system"
                className="wise-button inline-flex min-h-12 items-center gap-3 border border-white/30 bg-black/20 px-6 py-4 text-xs font-bold tracking-[.12em] text-white"
              >
                SEE HOW IT WORKS
              </Link>
            </div>
            <div className="mt-16 flex items-center gap-3 text-[10px] font-bold tracking-[.2em] text-white/50">
              <ArrowDown size={15} className="text-[#b9ff00]" /> SCROLL TO
              EXPLORE THE OPERATING LAYER
            </div>
          </div>
          <div className="wise-status-panel hidden border border-white/15 bg-black/45 p-5 backdrop-blur-md lg:block">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-[10px] font-bold tracking-[.16em] text-white/50">
              <span>LIVE SYSTEM READOUT</span>
              <span className="flex items-center gap-2 text-[#b9ff00]">
                <Circle size={7} fill="currentColor" /> LIVE
              </span>
            </div>
            <div className="space-y-5 pt-5">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/55">OPERATING LAYER</span>
                  <strong>ONLINE</strong>
                </div>
                <div className="wise-meter">
                  <i style={{ width: "94%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/55">AUTOMATION LOAD</span>
                  <strong>72%</strong>
                </div>
                <div className="wise-meter">
                  <i style={{ width: "72%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/55">FIELD SIGNAL</span>
                  <strong>STRONG</strong>
                </div>
                <div className="wise-meter">
                  <i style={{ width: "86%" }} />
                </div>
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-4 text-[10px] leading-5 text-white/40">
              A practical intelligence layer for the work that cannot wait.
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b0d0b] px-6 py-5 lg:px-10">
        <div className="mx-auto grid max-w-[1320px] gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([value, label, copy]) => (
            <div
              key={label}
              className="wise-metric bg-[#0b0d0b] px-6 py-7 lg:px-8"
            >
              <div className="flex items-start justify-between">
                <p className="text-4xl font-black tracking-[-.06em] text-[#b9ff00]">
                  {value}
                </p>
                <span className="text-[10px] text-white/25">/ W²</span>
              </div>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/65">
                {label}
              </p>
              <p className="mt-2 text-xs leading-5 text-white/35">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="system"
        className="wise-section mx-auto max-w-[1320px] px-6 py-28 lg:px-10 lg:py-36"
      >
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <p className="wise-kicker mb-5">THE WISE² DIFFERENCE</p>
            <h2 className="wise-heading max-w-2xl">
              One layer for the work <span>between</span> the work.
            </h2>
          </div>
          <p className="max-w-lg text-base leading-7 text-white/60">
            Most businesses do not need more disconnected tools. They need the
            intelligence and operating rhythm to make the tools they already
            have work together.
          </p>
        </div>
        <div className="wise-layer-diagram mt-16">
          <div className="wise-layer-label">
            <span>01</span>
            <strong>CAPTURE</strong>
            <small>Signal from the field</small>
          </div>
          <div className="wise-layer-label">
            <span>02</span>
            <strong>ORCHESTRATE</strong>
            <small>Intelligence in motion</small>
          </div>
          <div className="wise-layer-label">
            <span>03</span>
            <strong>DEPLOY</strong>
            <small>Work that lands</small>
          </div>
        </div>
        <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2">
          {capabilities.map(({ icon: Icon, number, title, copy }) => (
            <article
              key={title}
              className="wise-capability group bg-[#0b0d0b] p-8 lg:p-10"
            >
              <div className="flex items-start justify-between">
                <Icon size={27} strokeWidth={1.5} className="text-[#b9ff00]" />
                <span className="text-[10px] font-bold tracking-[.18em] text-white/30">
                  {number}
                </span>
              </div>
              <h3 className="mt-16 text-2xl font-black uppercase tracking-[-.03em]">
                {title}
              </h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
                {copy}
              </p>
              <div className="mt-8 h-px w-0 bg-[#b9ff00] transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>
      </section>

      <section
        id="deployments"
        className="wise-work border-y border-white/10 bg-[#f5f7f2] px-6 py-28 text-[#050505] lg:px-10 lg:py-36"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="wise-kicker mb-5 text-[#5c7900]">
                BUILT IN THE REAL WORLD
              </p>
              <h2 className="wise-heading max-w-2xl">Proof over promises.</h2>
            </div>
            <Link
              href="/apps"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-black tracking-[.15em] text-[#5c7900]"
            >
              VIEW ALL SYSTEMS <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {deployments.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="wise-project group block overflow-hidden bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#101210]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute left-5 top-5 border border-white/30 bg-black/35 px-3 py-2 text-[9px] font-bold tracking-[.16em] text-white">
                    0{index + 1} / LIVE DEPLOYMENT
                  </span>
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[10px] font-bold tracking-[.22em] ${item.tone === "lime" ? "text-[#5c7900]" : item.tone === "purple" ? "text-[#7a42ad]" : "text-black/45"}`}
                    >
                      {item.label}
                    </p>
                    <ChevronRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                  <h3 className="mt-4 text-3xl font-black uppercase tracking-[-.04em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-black/60">
                    {item.copy}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 text-[10px] font-black tracking-[.16em]">
                    EXPLORE SYSTEM <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="method"
        className="wise-section px-6 py-28 lg:px-10 lg:py-36"
      >
        <div className="mx-auto max-w-[1320px]">
          <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <p className="wise-kicker mb-5">THE METHOD</p>
              <h2 className="wise-heading">
                From scattered effort to <span>synchronized momentum.</span>
              </h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-white/60">
              Every WISE² build starts with the real operating conditions—not a
              slide deck version of the business.
            </p>
          </div>
          <div className="mt-16 grid gap-px bg-white/10 md:grid-cols-3">
            <div className="wise-method">
              <span>01</span>
              <h3>MAP THE REALITY</h3>
              <p>
                Find the friction, hidden work, and signals your current tools
                are missing.
              </p>
            </div>
            <div className="wise-method">
              <span>02</span>
              <h3>BUILD THE LAYER</h3>
              <p>
                Connect the people, intelligence, and infrastructure that move
                the work forward.
              </p>
            </div>
            <div className="wise-method">
              <span>03</span>
              <h3>KEEP IT MOVING</h3>
              <p>
                Measure what matters, document the system, and keep improving
                from the field.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="wise-proof border-y border-white/10 px-6 py-28 lg:px-10 lg:py-36">
        <div className="mx-auto grid max-w-[1320px] gap-14 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="wise-kicker mb-5">WHY WISE²</p>
            <h2 className="wise-heading max-w-3xl">
              Your business is already a system.{" "}
              <span>Make it intentional.</span>
            </h2>
          </div>
          <div className="border border-white/15 bg-[#101210] p-8 lg:p-10">
            <Cpu className="text-[#b9ff00]" size={28} strokeWidth={1.5} />
            <p className="mt-10 text-xl font-bold leading-8">
              We build the layer that lets your people do their best work
              without fighting the infrastructure around them.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-white/60">
              {[
                "Practical AI, not theater",
                "Systems your team can own",
                "Built for cloud, edge, and field reality",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-[#b9ff00]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="wise-cta relative px-6 py-32 text-center lg:px-10 lg:py-44">
        <div className="wise-cta-orbit absolute inset-0" />
        <div className="relative mx-auto max-w-4xl">
          <p className="wise-kicker mb-6">START WITH THE MESSY VERSION</p>
          <h2 className="wise-display text-6xl md:text-9xl">
            Make your
            <br />
            <span>move.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-md text-sm leading-6 text-white/60">
            Get a clear picture of where your business is, what is slowing it
            down, and what to build next.
          </p>
          <Link
            href="/audit"
            className="wise-button mt-10 inline-flex min-h-12 items-center gap-3 bg-[#b9ff00] px-7 py-4 text-xs font-black tracking-[.12em] text-black"
          >
            GET YOUR BUSINESS AI AUDIT <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-9 lg:px-10">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-5 text-[10px] font-bold tracking-[.14em] text-white/40 md:flex-row md:items-center">
          <span className="text-lg tracking-[-.08em] text-white">
            WISE<sup className="text-[#b9ff00]">²</sup>
          </span>
          <span>INTELLIGENT TOOLS FOR REAL-WORLD BUSINESSES</span>
          <span>© 2026 WISE²</span>
        </div>
      </footer>
    </main>
  );
}
