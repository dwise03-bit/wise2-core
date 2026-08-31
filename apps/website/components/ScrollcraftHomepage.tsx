'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Gauge,
  MapPin,
  Zap,
} from 'lucide-react';

const poweredBusinesses = [
  {
    name: 'GET DOWN Pressure Washing',
    tagline: 'Local brand to multi-city growth',
    metric: '3 cities',
    description: 'Went from single location to operating across North Carolina with WISE² CRM, automation, and route management.',
    href: '/case-studies/get-down',
    icon: MapPin,
  },
  {
    name: 'CJAYS Auto Recon',
    tagline: 'Detailing business at scale',
    metric: '$18.6K revenue',
    description: 'Professional auto detailing app with job tracking, photo management, analytics, and customer database.',
    href: '/case-studies/cjays',
    icon: BarChart3,
  },
  {
    name: 'WISE² HVAC Solutions',
    tagline: 'Diagnostic accuracy on the jobsite',
    metric: '82% confidence',
    description: 'Field technician app with real-time diagnostics, AI analysis, and smart tool connectivity.',
    href: '/platform',
    icon: Gauge,
  },
  {
    name: 'SenCere Creative',
    tagline: 'Multi-brand ecommerce platform',
    metric: '3 brands',
    description: 'PIFF CITY, BLAKKHAIL, VANDALS—three distinct creative brands operating from one system.',
    href: '/sencere',
    icon: Briefcase,
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

  return (
    <main className="overflow-hidden bg-[#050607] text-white">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 bg-[#050607]">
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(142,219,255,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(220,231,239,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(220,231,239,0.65)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <RevealText className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Real Business. Real Results.
            </p>
            <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">
              WISE² Powers Service Businesses.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
              From pressure washing to HVAC to creative brands—WISE² gives service businesses the tools to scale. Field diagnostics, AI assistance, customer management, and automation all in one system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/platform"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#DCE7EF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] focus:ring-offset-2 focus:ring-offset-[#050607]"
              >
                Explore WISE²
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="border border-white/12 bg-[#080B0E]/92 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-[11px] uppercase tracking-[0.18em] text-[#8FA0AE]">
              <span>WISE² Operating System</span>
              <span className="text-[#8EDBFF]">Real businesses powered</span>
            </div>
            <div className="mt-5 space-y-4">
              {poweredBusinesses.map((business) => {
                const Icon = business.icon;
                return (
                  <div key={business.name} className="flex items-start gap-3 border-l border-[#8EDBFF]/30 pl-4 py-2">
                    <Icon className="mt-0.5 h-5 w-5 flex-none text-[#8EDBFF]" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white">{business.name}</p>
                      <p className="text-[11px] text-[#8FA0AE]">{business.metric}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Powered Businesses Grid */}
      <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <RevealText className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Four Real Businesses
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Built and scaled with WISE².
            </h2>
          </RevealText>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {poweredBusinesses.map((business, index) => {
              const Icon = business.icon;
              return (
                <motion.div
                  key={business.name}
                  initial={{ opacity: 0.55 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-20% 0px' }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                >
                  <Link
                    href={business.href}
                    className="group block min-h-64 bg-[#090C10] p-6 transition duration-200 hover:bg-[#0D141A] focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
                  >
                    <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                    <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#8FA0AE]">
                      {business.tagline}
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-white">{business.name}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{business.description}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#DCE7EF]">
                      Learn more
                      <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GET DOWN Case Study Teaser */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <RevealText>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">Proof</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">Real results. Real growth.</h2>
          </RevealText>
          <p className="max-w-2xl text-sm leading-7 text-[#B7C0CB]">
            When a service business chooses WISE², they get field tools, customer management, automations, and growth support. Here's what that looks like.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Link href="/case-studies/get-down" className="group overflow-hidden border border-white/10 bg-[#090C10] transition duration-200 hover:-translate-y-1 hover:border-[#8EDBFF]/40 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">
            <div className="relative aspect-[16/9] bg-black">
              <Image
                src="/uploads/daniel-real.jpg"
                alt="GET DOWN case study"
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black text-white">GET DOWN Pressure Washing</h3>
              <p className="mt-3 text-sm leading-7 text-[#B7C0CB]">
                Pressure washing company scaled from single location to 3-city operation using WISE² dispatch, CRM, and route management.
              </p>
            </div>
          </Link>

          <Link href="/case-studies/cjays" className="group overflow-hidden border border-white/10 bg-[#090C10] transition duration-200 hover:-translate-y-1 hover:border-[#8EDBFF]/40 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">
            <div className="relative aspect-[16/9] bg-black">
              <Image
                src="/wise-defense/instructors/IMG_1573.jpeg"
                alt="CJAYS case study"
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-black text-white">CJAYS Auto Recon</h3>
              <p className="mt-3 text-sm leading-7 text-[#B7C0CB]">
                Professional auto detailing app with job tracking, photo capture, and analytics dashboard powering real revenue.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <RevealText className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              What Service Businesses Get
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Field-first tools built for the real world.
            </h2>
          </RevealText>
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
            {[
              {
                title: 'Field Diagnostics',
                description: 'Smart tools capture real data. AI analysis turns readings into insights. Technicians save hours.',
                icon: Gauge,
              },
              {
                title: 'Customer Intelligence',
                description: 'Keep every customer record, job history, and service note in one system. No more scattered spreadsheets.',
                icon: CheckCircle2,
              },
              {
                title: 'Growth Automation',
                description: 'Automated follow-up, proposal generation, and route management scale your business without adding staff.',
                icon: Zap,
              },
              {
                title: 'Real Analytics',
                description: 'See revenue by technician, job completion rates, customer lifetime value, and operational metrics that matter.',
                icon: BarChart3,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0.55 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-20% 0px' }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.08 }}
                >
                  <div className="min-h-64 bg-[#090C10] p-6">
                    <Icon className="h-6 w-6 text-[#8EDBFF]" aria-hidden="true" />
                    <h3 className="mt-8 text-2xl font-black text-white">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="border-b border-white/10 bg-[#050607] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <RevealText className="max-w-3xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Products
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              WISE Imp is live on the desk.
            </h2>
          </RevealText>
          <Link
            href="/products/imp"
            className="group grid overflow-hidden border border-white/10 bg-[#090C10] transition hover:border-[#8EDBFF]/40 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="p-6 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8EDBFF]">
                Alpha 0.1 · Desktop companion
              </p>
              <h3 className="mt-4 text-3xl font-black text-white">WISE Imp</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#B7C0CB]">
                Always-on companion for operators and client machines. Try it in the browser, then install the Windows pet.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#DCE7EF]">
                Open product
                <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
            <div className="relative min-h-56 bg-black">
              <Image
                src="/products/wise-imp.png"
                alt="WISE Imp desktop companion"
                fill
                className="object-contain p-8"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-6 text-[#050607] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <Zap className="h-7 w-7" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-black leading-tight">Ready to scale your service business?</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#26313A]">
              WISE² gives you field tools, customer management, automations, and the intelligence to grow. Start building today.
            </p>
          </div>
          <Link href="/platform" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#050607] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#111A22] focus:outline-none focus:ring-2 focus:ring-[#050607] focus:ring-offset-2 focus:ring-offset-[#DCE7EF]">
            Build with WISE²
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
