'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  FileSearch,
  Gauge,
  HardDrive,
  Radio,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

const operatingAreas = [
  {
    name: 'WISE² Core',
    label: 'Operating layer',
    description:
      'The command system tying field work, client records, automations, media, and decision support into one working stack.',
    href: '/platform',
    icon: Cpu,
  },
  {
    name: 'WISE² HVAC',
    label: 'Field diagnostics',
    description:
      'Technician workflows for capturing equipment data, reading measurements, and turning site notes into recommended action.',
    href: '/fieldtech',
    icon: Gauge,
  },
  {
    name: 'WISE Defense',
    label: 'Training systems',
    description:
      'A darker division for training, edge technology, and specialized systems under the TRAIN. TEACH. PROTECT. standard.',
    href: '/wise-defense',
    icon: ShieldCheck,
  },
  {
    name: 'SoundLab',
    label: 'Creative infrastructure',
    description:
      'Audio, production, and campaign workflows for artists and creative businesses that need real operational support.',
    href: '/soundlab',
    icon: Radio,
  },
];

const dataFlow = [
  { label: 'Real data', value: 'Unit note + readings' },
  { label: 'WISE² AI', value: 'Context retained' },
  { label: 'Analysis', value: 'Pattern reviewed' },
  { label: 'Diagnosis', value: 'Probable cause' },
  { label: 'Action', value: 'Next step assigned' },
];

const readings = [
  { label: 'Suction pressure', value: '118 PSI', accent: '#8EDBFF' },
  { label: 'Liquid line temp', value: '91°F', accent: '#F2B632' },
  { label: 'Voltage check', value: '247 V', accent: '#DCE7EF' },
  { label: 'Subcooling', value: '8.4°F', accent: '#8EDBFF' },
];

const evidence = [
  'Production Next.js website, dashboards, auth flows, and product apps live in one repository.',
  'HVAC field-tech app, iPhone wrapper, and production deployment workflow are actively maintained.',
  'Client commerce, field operations, creative tools, and deployment workflows share one operating foundation.',
];

const clientSignals = [
  {
    title: 'Field Operations',
    text: 'Technician workflows, diagnostic records, and mobile-ready job views connected to the same operating core.',
    image: '/uploads/daniel-real.jpg',
    href: '/fieldtech',
  },
  {
    title: 'WISE Defense',
    text: 'Instructor and training imagery connected to a distinct division identity without overtaking the parent brand.',
    image: '/wise-defense/instructors/IMG_1573.jpeg',
    href: '/wise-defense',
  },
];

function RevealText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollcraftHomepage() {
  const reduceMotion = useReducedMotion();
  const arrivalRef = useRef<HTMLElement>(null);
  const flowRef = useRef<HTMLElement>(null);
  const hvacRef = useRef<HTMLElement>(null);

  const { scrollYProgress: arrivalProgress } = useScroll({
    target: arrivalRef,
    offset: ['start start', 'end start'],
  });
  const { scrollYProgress: flowProgress } = useScroll({
    target: flowRef,
    offset: ['start end', 'end start'],
  });
  const { scrollYProgress: hvacProgress } = useScroll({
    target: hvacRef,
    offset: ['start end', 'end start'],
  });

  const heroScale = useTransform(arrivalProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.08]);
  const heroY = useTransform(arrivalProgress, [0, 1], reduceMotion ? [0, 0] : [0, 80]);
  const dataX = useTransform(flowProgress, [0.12, 0.82], reduceMotion ? ['0%', '0%'] : ['0%', '78%']);
  const gaugeNeedle = useTransform(hvacProgress, [0.18, 0.72], reduceMotion ? [-34, -34] : [-34, 42]);
  const phoneY = useTransform(hvacProgress, [0, 1], reduceMotion ? [0, 0] : [30, -30]);

  return (
    <main className="overflow-hidden bg-[#050607] text-white">
      <section ref={arrivalRef} className="relative min-h-[calc(100vh-4rem)] border-b border-white/10">
        <motion.div className="absolute inset-0" style={{ scale: heroScale, y: heroY }}>
          <Image
            src="/brand/wise2-hero-united.webp"
            alt="WISE² brand system artwork showing the connected business operating system"
            fill
            priority
            className="object-cover opacity-42"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,6,7,0.98)_0%,rgba(5,6,7,0.9)_42%,rgba(5,6,7,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,7,0)_0%,rgba(5,6,7,0.94)_96%)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-end gap-10 px-4 pb-10 pt-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16">
          <RevealText className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Real-world experience / Intelligent systems
            </p>
            <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">
              Intelligent tools for real-world businesses.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
              WISE² builds operating systems, field applications, training technology, and client infrastructure for teams that need software grounded in actual work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/platform"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#DCE7EF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] focus:ring-offset-2 focus:ring-offset-[#050607]"
              >
                Explore the Platform
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/work"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#8EDBFF]/70 hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] focus:ring-offset-2 focus:ring-offset-[#050607]"
              >
                See Built Work
              </Link>
            </div>
          </RevealText>

          <motion.div
            style={{ y: useTransform(arrivalProgress, [0, 1], reduceMotion ? [0, 0] : [0, -36]) }}
            className="mb-2 border border-white/12 bg-[#080B0E]/85 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
              <span>WISE² journey</span>
              <span className="text-[#8EDBFF]">Scrollcraft layer</span>
            </div>
            <div className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {['The field', 'The data', 'The system'].map((step) => (
                <article key={step} className="border-l border-[#8EDBFF]/40 pl-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8EDBFF]">
                    {step}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#AEB8C3]">
                    The page moves through WISE² the same way the work does: from real context to intelligent action.
                  </p>
                </article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative border-b border-white/10 bg-[#07090C]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <RevealText>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              From the real world
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">WISE² was not designed in isolation.</h2>
            <p className="mt-5 text-base leading-8 text-[#B7C0CB]">
              Field jobs, client builds, creative production, deployment problems, and hardware experiments shape the system. Scrollcraft makes that progression visible instead of stacking claims.
            </p>
          </RevealText>
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-80 overflow-hidden border border-white/10 bg-black"
            >
              <Image src="/uploads/daniel-real.jpg" alt="Daniel Wise in WISE² source imagery" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </motion.div>
            <motion.div
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0 0 0)' }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative min-h-80 overflow-hidden border border-white/10 bg-black sm:mt-14"
            >
              <Image src="/wise-defense/instructors/IMG_1573.jpeg" alt="WISE² training and field systems source imagery" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </motion.div>
          </div>
        </div>
      </section>

      <section ref={flowRef} className="relative bg-[#050607] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <RevealText className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Data enters WISE²
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Real data. Better decisions.</h2>
          </RevealText>
          <div className="sticky top-20 mt-10 border border-white/10 bg-[#080B0E] p-5 sm:p-8">
            <div className="relative hidden h-36 items-center md:flex">
              <div className="absolute left-[5%] right-[7%] top-1/2 h-px bg-[#8EDBFF]/25" />
              <motion.div
                style={{ x: dataX }}
                className="absolute left-[5%] top-[calc(50%-0.55rem)] h-5 w-5 border border-[#8EDBFF] bg-[#8EDBFF]"
              />
              <div className="grid w-full grid-cols-5 gap-4">
                {dataFlow.map((item) => (
                  <div key={item.label} className="relative min-h-28 border border-white/10 bg-[#050607] p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8EDBFF]">{item.label}</p>
                    <p className="mt-3 text-sm leading-6 text-[#DCE7EF]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:hidden">
              {dataFlow.map((item) => (
                <div key={item.label} className="border-l border-[#8EDBFF]/50 bg-[#050607] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8EDBFF]">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[#DCE7EF]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8EDBFF]">System interpretation</p>
                <h3 className="mt-4 text-2xl font-black">The motion follows the work.</h3>
                <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">
                  Context moves through the system before it becomes a recommendation. The animation is intentionally simple: it explains sequence, not spectacle.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {evidence.map((item) => (
                  <div key={item} className="flex gap-3 border border-white/10 bg-[#0A0E12] p-4">
                    <FileSearch className="mt-1 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
                    <p className="text-sm leading-6 text-[#C8D0D9]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="h-24" aria-hidden="true" />
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <RevealText>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">WISE² Core</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">The intelligence layer connects the divisions.</h2>
            <p className="mt-5 text-base leading-8 text-[#B7C0CB]">
              Each area keeps its own personality, but the operating philosophy stays the same: field truth enters, WISE² organizes it, the team acts.
            </p>
          </RevealText>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {operatingAreas.map((area, index) => {
              const Icon = area.icon;
              return (
                <motion.div
                  key={area.name}
                  initial={{ opacity: 0.55 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-20% 0px' }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                >
                  <Link href={area.href} className="group block min-h-64 bg-[#090C10] p-6 transition duration-200 hover:bg-[#0D141A] focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">
                    <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#8FA0AE]">{area.label}</p>
                    <h3 className="mt-3 text-2xl font-black text-white">{area.name}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{area.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#DCE7EF]">
                      Open area
                      <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={hvacRef} className="relative bg-[#050607] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <RevealText>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#F2B632]">WISE² HVAC</p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Professional diagnostics, translated into software.</h2>
              <p className="mt-5 text-base leading-8 text-[#B7C0CB]">
                This sequence uses instrument-style readings to show how field context becomes analysis. Values are illustrative product UI content, not published performance claims.
              </p>
            </RevealText>
            <motion.div style={{ y: phoneY }} className="mt-8 border border-white/10 bg-[#080B0E] p-5">
              <div className="mx-auto max-w-sm rounded-[2rem] border border-[#DCE7EF]/30 bg-black p-3 shadow-2xl">
                <div className="rounded-[1.4rem] border border-white/10 bg-[#071015] p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8EDBFF]">WISE² Field Tech</p>
                      <p className="mt-1 text-sm font-semibold text-white">RTU diagnostic capture</p>
                    </div>
                    <span className="h-3 w-3 rounded-full bg-[#F2B632]" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {readings.slice(0, 4).map((reading) => (
                      <div key={reading.label} className="border border-white/10 bg-black/55 p-3">
                        <p className="text-[9px] uppercase tracking-[0.18em] text-[#8FA0AE]">{reading.label}</p>
                        <p className="mt-2 font-mono text-xl font-bold" style={{ color: reading.accent }}>{reading.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border border-[#8EDBFF]/30 bg-[#8EDBFF]/8 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8EDBFF]">AI note</p>
                    <p className="mt-2 text-sm leading-6 text-[#DCE7EF]">Compare readings against nameplate and job history before recommending action.</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#8FA0AE]">
                Product UI visualization. Authentic HVAC photography or screenshots should replace this once captured.
              </p>
            </motion.div>
          </div>
          <div className="space-y-5">
            <div className="border border-white/10 bg-[#0A0E12] p-6">
              <div className="relative mx-auto h-52 w-52 rounded-full border border-[#8EDBFF]/30 bg-[#050607]">
                <div className="absolute inset-6 rounded-full border border-white/10" />
                <motion.div
                  className="absolute left-1/2 top-1/2 h-1 w-20 origin-left bg-[#8EDBFF]"
                  style={{ rotate: gaugeNeedle }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#8FA0AE]">Diagnostic confidence</p>
                  <p className="mt-2 text-4xl font-black text-white">82%</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {readings.map((reading, index) => (
                <motion.div
                  key={reading.label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
                  className="border border-white/10 bg-[#0A0E12] p-5"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8FA0AE]">{reading.label}</p>
                  <p className="mt-4 font-mono text-3xl font-bold" style={{ color: reading.accent }}>{reading.value}</p>
                </motion.div>
              ))}
            </div>
            <div className="border border-[#F2B632]/35 bg-[#151006] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F2B632]">Recommended action</p>
              <p className="mt-3 text-lg font-semibold text-white">Verify airflow, compare nameplate data, document readings, and create the next work order step.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <RevealText>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">Proof and outcomes</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Visible artifacts, not borrowed credibility.</h2>
          </RevealText>
          <p className="max-w-2xl text-sm leading-7 text-[#B7C0CB]">
            These examples use existing WISE² assets. Missing case-study numbers, testimonials, and client claims stay out until the team can verify them.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {clientSignals.map((item) => (
            <Link key={item.title} href={item.href} className="group overflow-hidden border border-white/10 bg-[#090C10] transition duration-200 hover:-translate-y-1 hover:border-[#8EDBFF]/40 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">
              <div className="relative aspect-[16/9] bg-black">
                <Image src={item.image} alt={`${item.title} visual artifact`} fill className="object-cover transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#B7C0CB]">{item.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-6 text-[#050607] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <HardDrive className="h-7 w-7" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black leading-tight">Built from real work. Powered by intelligence.</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#26313A]">
              Field workflow, client system, web platform, automation, or product prototype. The answer starts with what is true today.
            </p>
          </div>
          <Link href="/start-your-build" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#050607] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#111A22] focus:outline-none focus:ring-2 focus:ring-[#050607] focus:ring-offset-2 focus:ring-offset-[#DCE7EF]">
            Start Your Build
            <Wrench size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
