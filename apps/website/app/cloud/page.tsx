'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Lock,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Zap,
  Globe,
  CheckCircle2,
  Gauge,
  Mail,
} from 'lucide-react';
import {
  CLOUD_PLANS_STATIC,
  CLOUD_TRUST_ITEMS,
  cloudBtnGhost,
  cloudBtnPrimary,
  cloudEyebrow,
  cloudPanel,
} from '@/lib/cloud-brand';
import { CloudScrollFX } from '@/components/cloud/CloudScrollFX';

export default function CloudLandingPage() {
  return (
    <main className="cloud-landing bg-[#0a0d0f] text-[#ffffff] overflow-hidden">
      {/* HERO - NEON CYBERPUNK */}
      <section className="cloud-hero relative border-b border-[#B8FF00]/20 overflow-hidden bg-gradient-to-b from-[#0f1419] to-[#0a0d0f]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8FF00]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00FF00]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-32 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* LEFT: Leadership + Vision */}
            <div className="space-y-8">
              <div>
                <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4 glow" style={{textShadow: '0 0 20px rgba(184,255,0,0.6)'}}>
                  DISCIPLINE • EXECUTION • RESULTS
                </p>
                <h1 className="text-6xl font-black leading-tight mb-6" style={{textShadow: '0 0 40px rgba(184,255,0,0.4)'}}>
                  Build Your Empire.
                  <br/>
                  <span className="text-[#B8FF00]">Change Culture.</span>
                </h1>
              </div>

              <div className="space-y-4">
                <p className="text-[#a0b0c0] text-lg leading-relaxed">
                  WISE² Cloud is the infrastructure for builders. Enterprise security. Infinite scale. Real support. Built for founders who demand excellence.
                </p>
                <div className="flex gap-8 text-sm">
                  <div>
                    <p className="text-[#B8FF00] font-black mb-2">PEOPLE</p>
                    <p className="text-[#6b7a8c]">Real humans, 24/7</p>
                  </div>
                  <div>
                    <p className="text-[#B8FF00] font-black mb-2">AI</p>
                    <p className="text-[#6b7a8c]">Autonomous optimization</p>
                  </div>
                  <div>
                    <p className="text-[#B8FF00] font-black mb-2">OPPORTUNITY</p>
                    <p className="text-[#6b7a8c]">Scale without limits</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/cloud/plans" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#B8FF00] text-[#000000] font-black hover:shadow-[0_0_30px_rgba(184,255,0,0.5)] transition-all duration-300">
                  Launch now
                  <ArrowRight size={18} />
                </Link>
                <Link href="/cloud/audit" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#B8FF00]/40 text-[#B8FF00] font-semibold hover:border-[#B8FF00] hover:shadow-[0_0_20px_rgba(184,255,0,0.3)] transition-all">
                  Free audit
                </Link>
              </div>
            </div>

            {/* RIGHT: Leadership Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B8FF00]/20 to-transparent rounded-2xl" />
              <Image
                src="/brand/wise2-hero-united.webp"
                alt="WISE² Leadership - Building Empires"
                width={500}
                height={500}
                priority
                className="w-full h-auto rounded-2xl relative z-10 border border-[#B8FF00]/30"
                style={{boxShadow: '0 0 40px rgba(184,255,0,0.3)'}}
              />
              <p className="mt-6 text-center text-[#6b7a8c] text-sm font-mono">
                WISE² United • People × AI × Opportunity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP - NEON */}
      <section data-cloud-reveal className="border-b border-[#B8FF00]/20 bg-[#0a0d0f] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {CLOUD_TRUST_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8FF00]" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>
              <Check size={14} className="text-[#B8FF00]" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* SERVICE STRIP - CAPABILITIES */}
      <section data-cloud-reveal className="border-b border-[#B8FF00]/20 bg-gradient-to-b from-[#0f1419] to-[#0a0d0f] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-8 text-center" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Capabilities</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe, label: 'Web Hosting' },
              { icon: CheckCircle2, label: 'Reseller Hosting' },
              { icon: Server, label: 'VPS Servers' },
              { icon: Globe, label: 'Domains' },
              { icon: Mail, label: 'Email Services' },
              { icon: Lock, label: 'SSL & Security' },
              { icon: RefreshCw, label: 'Daily Backups' },
              { icon: Gauge, label: 'Managed Hosting' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center group">
                <div className="p-6 rounded-lg border border-[#B8FF00]/20 mb-3 group-hover:border-[#B8FF00] group-hover:shadow-[0_0_20px_rgba(184,255,0,0.3)] transition-all duration-300 bg-[#0f1419]/50">
                  <Icon size={28} className="mx-auto text-[#B8FF00]" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[#a0b0c0]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMAND CENTER - AUTOMATION */}
      <section data-cloud-reveal className="border-b border-[#B8FF00]/20 bg-[#0a0d0f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Automation</p>
            <h2 className="text-4xl font-black sm:text-5xl leading-tight" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Build. Automate. Dominate.
            </h2>
            <p className="mt-6 text-[#a0b0c0] text-lg max-w-2xl mx-auto">
              One system for everything. Deploy apps, manage clients, track revenue, scale infinitely.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Server,
                label: 'Instant Deployment',
                detail: 'Deploy applications in minutes. No servers to manage. Automatic scaling under load.',
              },
              {
                icon: Gauge,
                label: 'Real-Time Analytics',
                detail: 'Watch your metrics live. Performance, uptime, resource usage in one dashboard.',
              },
              {
                icon: Lock,
                label: 'Security Built-In',
                detail: 'SSL, DDoS protection, firewalls, backups. Enterprise-grade security out of the box.',
              },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="p-6 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 hover:border-[#B8FF00] hover:shadow-[0_0_30px_rgba(184,255,0,0.2)] transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Icon size={24} className="text-[#B8FF00] mt-1 shrink-0" style={{filter: 'drop-shadow(0 0 10px rgba(184,255,0,0.4))'}} />
                  <div>
                    <p className="font-black text-sm uppercase tracking-widest text-[#B8FF00]">{label}</p>
                    <p className="mt-3 text-sm leading-6 text-[#a0b0c0]">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/cloud/plans" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#B8FF00] text-[#000000] font-black hover:shadow-[0_0_30px_rgba(184,255,0,0.5)] transition-all">
              Start Building
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PILLARS - EMPIRE BUILDING */}
      <section data-cloud-reveal className="bg-gradient-to-b from-[#0a0d0f] to-[#0f1419] px-4 py-20 sm:px-6 lg:px-8 border-b border-[#B8FF00]/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Foundation</p>
            <h2 className="text-4xl font-black sm:text-5xl" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Three Pillars.
              <br/>
              <span className="text-[#B8FF00]">Infinite Possibilities.</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Server, title: 'STRATEGY', copy: 'Enterprise architecture designed for founders who think big.' },
              { icon: Zap, title: 'AUTOMATION', copy: 'Workflows that scale. Revenue automation. Zero manual work.' },
              { icon: Sparkles, title: 'WEALTH', copy: 'Build systems that generate passive income. Forever.' },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="p-8 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 hover:border-[#B8FF00] hover:shadow-[0_0_30px_rgba(184,255,0,0.2)] transition-all duration-300">
                <Icon className="text-[#B8FF00]" size={28} style={{filter: 'drop-shadow(0 0 10px rgba(184,255,0,0.4))'}} />
                <p className="font-black text-lg uppercase tracking-widest mt-6 text-[#B8FF00]">{title}</p>
                <p className="mt-4 text-sm leading-7 text-[#a0b0c0]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING - DOMINANCE */}
      <section data-cloud-reveal className="border-y border-[#B8FF00]/20 bg-[#0a0d0f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Results Dominate</p>
            <h2 className="text-4xl font-black sm:text-5xl" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>Plans Built for Growth.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {CLOUD_PLANS_STATIC.map((plan) => (
              <div key={plan.id} className={`flex flex-col p-8 rounded-lg border transition-all duration-300 ${plan.highlight ? 'border-[#B8FF00] bg-[#0f1419] shadow-[0_0_40px_rgba(184,255,0,0.3)]' : 'border-[#B8FF00]/20 bg-[#0f1419]/50 hover:border-[#B8FF00] hover:shadow-[0_0_20px_rgba(184,255,0,0.2)]'}`}>
                <p className={`text-[#B8FF00] font-black text-xs uppercase tracking-widest ${plan.highlight ? '' : ''}`}>{plan.highlight ? '★ MOST POPULAR' : plan.name}</p>
                <h3 className="mt-4 text-5xl font-black text-white">${plan.price}<span className="text-lg text-[#6b7a8c]">/mo</span></h3>
                <p className="mt-3 text-sm text-[#B8FF00] font-semibold">{plan.tagline}</p>
                <ul className="mt-8 flex-1 space-y-3 text-sm text-[#a0b0c0]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={16} className="mt-0.5 shrink-0 text-[#B8FF00]" style={{filter: 'drop-shadow(0 0 5px rgba(184,255,0,0.4))'}} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={`/cloud/plans?plan=${plan.id}`} className={`mt-8 w-full py-4 font-black text-center transition-all duration-300 ${plan.highlight ? 'bg-[#B8FF00] text-[#000000] hover:shadow-[0_0_40px_rgba(184,255,0,0.5)]' : 'border border-[#B8FF00]/40 text-[#B8FF00] hover:border-[#B8FF00] hover:shadow-[0_0_20px_rgba(184,255,0,0.3)]'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESELLER - BUILD YOUR EMPIRE */}
      <section data-cloud-reveal className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Reseller Program</p>
            <h2 className="text-4xl font-black mb-8" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Build Your Own Empire.
              <br/>
              <span className="text-[#B8FF00]">100% Profit.</span>
            </h2>
            <ul className="space-y-4 text-[#a0b0c0] mb-10">
              {['Free Billing & Portal', 'Unlimited Clients', 'Set Your Own Pricing', '24/7 Priority Support', '100% White Label'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <Check size={20} className="text-[#B8FF00] shrink-0" style={{filter: 'drop-shadow(0 0 5px rgba(184,255,0,0.4))'}} />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/cloud/plans?tab=reseller" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#B8FF00] text-[#000000] font-black hover:shadow-[0_0_30px_rgba(184,255,0,0.5)] transition-all">
              Start Selling
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="p-12 rounded-lg border border-[#B8FF00]/20 bg-gradient-to-br from-[#B8FF00]/10 to-transparent text-center">
            <Sparkles size={56} className="mx-auto text-[#B8FF00] mb-6" style={{filter: 'drop-shadow(0 0 20px rgba(184,255,0,0.4))'}} />
            <p className="text-xl font-black text-[#B8FF00]" style={{textShadow: '0 0 20px rgba(184,255,0,0.4)'}}>
              Your clients' success<br/>becomes your legacy.
            </p>
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE - PERFORMANCE */}
      <section data-cloud-reveal className="border-y border-[#B8FF00]/20 bg-gradient-to-b from-[#0a0d0f] to-[#0f1419] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Performance</p>
            <h2 className="text-4xl font-black" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>Built for Speed. Built to Last.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Server, label: 'NVMe SSD', detail: 'Lightning-fast storage' },
              { icon: Globe, label: 'Global CDN', detail: 'Content everywhere' },
              { icon: Shield, label: 'Enterprise Grade', detail: 'Military-level security' },
              { icon: Zap, label: 'Auto-Scaling', detail: 'Unlimited capacity' },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className="p-6 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 text-center hover:border-[#B8FF00] hover:shadow-[0_0_20px_rgba(184,255,0,0.2)] transition-all">
                <Icon size={28} className="mx-auto text-[#B8FF00] mb-4" style={{filter: 'drop-shadow(0 0 10px rgba(184,255,0,0.4))'}} />
                <p className="font-black text-sm uppercase tracking-widest text-[#B8FF00]">{label}</p>
                <p className="text-xs text-[#6b7a8c] mt-2">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY - FORTRESS */}
      <section data-cloud-reveal className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div className="p-12 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 flex items-center justify-center">
            <Lock size={96} className="text-[#B8FF00]" style={{filter: 'drop-shadow(0 0 20px rgba(184,255,0,0.4))'}} />
          </div>
          <div>
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Fortress Grade</p>
            <h2 className="text-4xl font-black mb-8" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Enterprise Security.
              <br/>
              <span className="text-[#B8FF00]">Zero Compromise.</span>
            </h2>
            <ul className="space-y-4 text-[#a0b0c0]">
              {[
                'DDoS Protection (Multi-layer)',
                'Web Application Firewall (WAF)',
                'Real-time Malware Scanning',
                'Free SSL Certificates (Auto-Renew)',
                'Automatic Daily Backups',
                '24/7 Threat Intelligence',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <Check size={20} className="text-[#B8FF00] shrink-0" style={{filter: 'drop-shadow(0 0 5px rgba(184,255,0,0.4))'}} />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AI INNOVATION */}
      <section className="border-y border-[#B8FF00]/20 bg-gradient-to-b from-[#0f1419] to-[#0a0d0f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>AI Innovation</p>
            <h2 className="text-4xl font-black mb-8" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Intelligence at Scale.
              <br/>
              <span className="text-[#B8FF00]">Zero Friction.</span>
            </h2>
            <ul className="space-y-4 text-[#a0b0c0]">
              {[
                'AI-Optimized Performance',
                'Predictive Resource Management',
                'Smart Threat Detection',
                'Autonomous Backup Systems',
                'Real-Time Optimization',
                'One-Command Deploy',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <Check size={20} className="text-[#B8FF00] shrink-0" style={{filter: 'drop-shadow(0 0 5px rgba(184,255,0,0.4))'}} />
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-12 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 flex items-center justify-center">
            <Sparkles size={96} className="text-[#B8FF00]" style={{filter: 'drop-shadow(0 0 20px rgba(184,255,0,0.4))'}} />
          </div>
        </div>
      </section>

      {/* MIGRATION - ZERO FRICTION */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Zero-Friction Migration</p>
          <h2 className="text-4xl font-black mb-12" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>Move Your Empire in 48 Hours.</h2>
          <ul className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            {['Free Transfer', 'Free Databases', 'Zero Downtime', 'Expert Team', 'All Plans'].map((item) => (
              <li key={item} className="flex flex-col items-center justify-center gap-2">
                <Check size={20} className="text-[#B8FF00]" style={{filter: 'drop-shadow(0 0 5px rgba(184,255,0,0.4))'}} />
                <span className="text-sm font-semibold text-[#a0b0c0]">{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/cloud/plans?tab=migration" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#B8FF00] text-[#000000] font-black hover:shadow-[0_0_30px_rgba(184,255,0,0.5)] transition-all">
            Start Migration
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* CONSULTING - STRATEGY */}
      <section className="border-y border-[#B8FF00]/20 bg-[#0a0d0f] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-16 items-center">
          <div className="p-12 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 flex items-center justify-center">
            <Gauge size={96} className="text-[#B8FF00]" style={{filter: 'drop-shadow(0 0 20px rgba(184,255,0,0.4))'}} />
          </div>
          <div>
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Strategic Planning</p>
            <h2 className="text-4xl font-black mb-6" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Unsure About Your Path?
              <br/>
              <span className="text-[#B8FF00]">We'll Architect It.</span>
            </h2>
            <p className="text-lg text-[#a0b0c0] mb-8 leading-relaxed">
              Free infrastructure audit. We analyze your current setup and design the perfect system for infinite growth. No obligation. Real strategy from real experts.
            </p>
            <Link href="/cloud/audit" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#B8FF00] text-[#000000] font-black hover:shadow-[0_0_30px_rgba(184,255,0,0.5)] transition-all">
              Get Free Audit
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* BUILT DIFFERENT */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-4" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Why WISE²</p>
            <h2 className="text-4xl font-black" style={{textShadow: '0 0 30px rgba(184,255,0,0.3)'}}>
              Built Different.
              <br/>
              <span className="text-[#B8FF00]">Built for Legends.</span>
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              'All-in-One Platform',
              'Enterprise-Grade Security',
              'Real Humans 24/7',
              'Transparent Pricing',
              'AI-Powered Optimization',
              'Unlimited Backups',
              'Global Infrastructure',
              'Infinite Scale',
            ].map((benefit) => (
              <div key={benefit} className="p-6 rounded-lg border border-[#B8FF00]/20 bg-[#0f1419]/50 hover:border-[#B8FF00] hover:shadow-[0_0_20px_rgba(184,255,0,0.2)] transition-all flex items-start gap-4">
                <Check className="text-[#B8FF00] shrink-0 mt-1" size={20} style={{filter: 'drop-shadow(0 0 5px rgba(184,255,0,0.4))'}} />
                <span className="font-semibold text-[#a0b0c0]">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA - DOMINANCE */}
      <section data-cloud-reveal className="border-t border-[#B8FF00]/20 bg-gradient-to-b from-[#0f1419] via-[#0a0d0f] to-[#000000] px-4 py-28 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B8FF00]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B8FF00]/5 rounded-full blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl text-center relative z-10">
          <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-6" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>The Choice is Clear</p>
          <h2 className="text-5xl sm:text-6xl font-black mb-6 leading-tight" style={{textShadow: '0 0 40px rgba(184,255,0,0.4)'}}>
            Ready to Build Your
            <br/>
            <span className="text-[#B8FF00]">Empire?</span>
          </h2>
          <p className="text-xl text-[#a0b0c0] mb-12 leading-relaxed">
            Join the founders, entrepreneurs, and visionaries who've chosen WISE² Cloud as their operating system.
            <br/>
            Your success story starts here.
          </p>
          <Link href="/cloud/plans" className="inline-flex items-center justify-center gap-2 px-12 py-6 bg-[#B8FF00] text-[#000000] font-black text-lg hover:shadow-[0_0_40px_rgba(184,255,0,0.6)] transition-all duration-300">
            Launch Your Empire
            <ArrowRight size={20} />
          </Link>
          <p className="mt-10 text-[#6b7a8c] text-sm">
            No credit card required. Free infrastructure audit included. Cancel anytime.
          </p>
        </div>
      </section>

      {/* FEATURED CLIENTS */}
      <section data-cloud-reveal className="border-t border-[#B8FF00]/20 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[#B8FF00] text-xs font-black uppercase tracking-widest mb-8" style={{textShadow: '0 0 10px rgba(184,255,0,0.4)'}}>Trusted By Industry Leaders</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-[#6b7a8c]">
            {['Fresh Winds Church', 'Rocky Tops', 'Once Upon A Child', "Logan's Heating & Cooling", 'Savôré', 'CJays Auto Recon', '& Growing'].map((client) => (
              <span key={client} className="text-sm font-semibold hover:text-[#B8FF00] transition-colors">{client}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#B8FF00]/20 bg-[#000000] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <p className="text-[#B8FF00] font-black text-3xl mb-2" style={{textShadow: '0 0 20px rgba(184,255,0,0.4)'}}>WISE²</p>
              <p className="text-sm text-[#6b7a8c] mt-2">People × AI × Opportunity
                <br/>
                <span className="text-xs">Building Empires.</span>
              </p>
            </div>
            <div>
              <p className="font-black text-[#B8FF00] mb-4 uppercase text-xs tracking-widest">Navigation</p>
              <ul className="space-y-2 text-sm text-[#6b7a8c]">
                <li><Link href="/cloud" className="hover:text-[#B8FF00] transition-colors font-semibold">Cloud Hosting</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">Reseller Program</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">VPS Servers</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">Domains</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-black text-[#B8FF00] mb-4 uppercase text-xs tracking-widest">Company</p>
              <ul className="space-y-2 text-sm text-[#6b7a8c]">
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">About</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">Support</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00] transition-colors font-semibold">Careers</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-black text-[#B8FF00] mb-4 uppercase text-xs tracking-widest">Contact</p>
              <ul className="space-y-2 text-sm text-[#6b7a8c]">
                <li><a href="mailto:support@wise2.net" className="hover:text-[#B8FF00] transition-colors font-semibold">support@wise2.net</a></li>
                <li><a href="mailto:sales@wise2.net" className="hover:text-[#B8FF00] transition-colors font-semibold">sales@wise2.net</a></li>
                <li className="text-xs mt-4 text-[#4a5a6a]">🇺🇸 USA Based</li>
                <li className="text-xs text-[#4a5a6a]">24/7 Expert Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#B8FF00]/20 pt-8 text-center text-sm text-[#4a5a6a]">
            <p>© 2026 WISE² United. All Rights Reserved. | <span className="text-[#6b7a8c]">Building Empires. Changing Culture.</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
