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
  BarChart3,
  Mail,
} from 'lucide-react';
import {
  CLOUD_PLANS_STATIC,
  CLOUD_TAGLINE,
  CLOUD_TRUST_ITEMS,
  CLOUD_UPSELLS,
  cloudBtnGhost,
  cloudBtnPrimary,
  cloudEyebrow,
  cloudPanel,
  WISE_CLOUD,
} from '@/lib/cloud-brand';

export default function CloudLandingPage() {
  return (
    <main className="bg-[#020403] text-white overflow-hidden">
      {/* HERO */}
      <section className="relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#B8FF00]/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-12 items-center min-h-[600px]">

          {/* LEFT: System Status HUD */}
          <div className={`${cloudPanel} p-4 text-xs`}>
            <p className={cloudEyebrow}>Cloud System Status</p>
            <div className="mt-4 space-y-2 text-[#8FA0AE]">
              <div className="flex justify-between">
                <span>Web Servers</span>
                <span className="text-[#B8FF00]">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Database Clusters</span>
                <span className="text-[#B8FF00]">Secure</span>
              </div>
              <div className="flex justify-between">
                <span>Storage Systems</span>
                <span className="text-[#B8FF00]">Online</span>
              </div>
              <div className="flex justify-between">
                <span>Network</span>
                <span className="text-[#B8FF00]">Optimal</span>
              </div>
              <div className="flex justify-between">
                <span>Backups</span>
                <span className="text-[#B8FF00]">Protected</span>
              </div>
              <div className="flex justify-between">
                <span>Security</span>
                <span className="text-[#B8FF00]">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime</span>
                <span className="text-[#B8FF00]">99.99%</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#B8FF00] rounded-full animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>

          {/* CENTER: Hero Content */}
          <div className="lg:col-span-1 text-center">
            <div className="mb-6">
              <p className="text-5xl font-black text-[#B8FF00] mb-2">WISE²</p>
              <p className="text-4xl font-black">CLOUD</p>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
              YOUR BUSINESS.
              <br />
              <span className="text-[#B8FF00]">OUR INFRASTRUCTURE.</span>
            </h1>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#B8FF00] mb-6">
              Fast. Secure. Scalable. Reliable.
            </p>
            <p className="text-[#A7ADA8] mb-8 leading-relaxed">
              WISE² Cloud delivers enterprise-grade hosting and infrastructure built for performance, security, and growth. Power your business. Host for clients. Build your empire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cloud/plans" className={cloudBtnPrimary}>
                Get started
                <ArrowRight size={16} />
              </Link>
              <Link href="/cloud/plans" className={cloudBtnGhost}>
                Build your cloud
              </Link>
            </div>
          </div>

          {/* RIGHT: Approved WISE² Leaders */}
          <div className="relative hidden lg:block">
            <Image
              src="/brand/wise2-hero-united.webp"
              alt="WISE² Leadership Team"
              width={400}
              height={400}
              priority
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-white/10 bg-[#090D0A] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {CLOUD_TRUST_ITEMS.map((item) => (
            <span key={item} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A7ADA8]">
              <Check size={14} className="text-[#B8FF00]" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* SERVICE STRIP */}
      <section className="border-b border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { icon: Globe, label: 'Web Hosting' },
              { icon: CheckCircle2, label: 'Reseller Hosting' },
              { icon: Server, label: 'VPS Servers' },
              { icon: Globe, label: 'Domains' },
              { icon: Mail, label: 'Business Email' },
              { icon: Lock, label: 'SSL & Security' },
              { icon: RefreshCw, label: 'Daily Backups' },
              { icon: Gauge, label: 'Managed Hosting' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center group">
                <div className={`${cloudPanel} p-4 rounded mb-3 group-hover:border-[#B8FF00] transition`}>
                  <Icon size={24} className="mx-auto text-[#B8FF00]" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOUD COMMAND CENTER */}
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>WISE² Cloud Command Center</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">Real-Time Monitoring. 24/7 Protection. Maximum Performance.</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Uptime', value: '99.99%', detail: '4+ Years Operations' },
              { label: 'Active Servers', value: '128', detail: '+2 this month' },
              { label: 'Total Domains', value: '542', detail: '+28 this month' },
              { label: 'Bandwidth', value: '12.4 TB', detail: '+2.1% this month' },
              { label: 'Storage Used', value: '3.6 TB / 10 TB', detail: '36% Used' },
              { label: 'Databases', value: '256', detail: 'Active Databases' },
              { label: 'Customers', value: '1,248', detail: '+38 this month' },
              { label: 'Monthly Revenue', value: '$24,780', detail: '+23% this month' },
            ].map(({ label, value, detail }) => (
              <div key={label} className={cloudPanel + ' p-6'}>
                <p className={cloudEyebrow}>{label}</p>
                <p className="mt-3 text-3xl font-black">{value}</p>
                <p className="mt-2 text-xs text-[#8FA0AE]">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY WISE² */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>Why WISE²</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl mb-4">
            More Than Hosting.
            <span className="block text-[#B8FF00]">It's a Business Platform.</span>
          </h2>
          <p className="max-w-2xl text-[#A7ADA8] mb-10">
            We do not sell commodity disk space. We sell convenience, management, continuity, security, automation, support, and growth.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Server, title: 'HOST.', copy: 'Managed stacks with SSL, email, and backups.' },
              { icon: Zap, title: 'AUTOMATE.', copy: 'Paid orders provision one package—no manual ops.' },
              { icon: Sparkles, title: 'SCALE.', copy: 'Grow from one site to a full client portfolio.' },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className={cloudPanel + ' p-6'}>
                <Icon className="text-[#B8FF00]" size={22} />
                <p className={`${cloudEyebrow} mt-4`}>{title}</p>
                <p className="mt-4 text-sm leading-7 text-[#A7ADA8]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-y border-white/10 bg-[#090D0A] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>Price Menu</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl mb-10">Three Plans. One Obvious Winner.</h2>

          <div className="grid gap-6 lg:grid-cols-4">
            {CLOUD_PLANS_STATIC.map((plan) => (
              <div key={plan.id} className={`${cloudPanel} flex flex-col p-6 ${plan.highlight ? 'ring-1 ring-[#B8FF00]/50 shadow-[0_0_56px_rgba(184,255,0,0.2)]' : ''}`}>
                <p className={cloudEyebrow}>{plan.highlight ? 'MOST POPULAR' : plan.name}</p>
                <h3 className="mt-3 text-4xl font-black">${plan.price}<span className="text-lg text-[#8FA0AE]">/mo</span></h3>
                <p className="mt-2 text-sm text-[#B8FF00]">{plan.tagline}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-[#A7ADA8]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#B8FF00]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={`/cloud/plans?plan=${plan.id}`} className={`${cloudBtnPrimary} mt-8 w-full justify-center`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESELLER OPPORTUNITY */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className={cloudEyebrow}>Reseller Opportunity</p>
            <h2 className="mt-4 text-3xl font-black mb-6">Start Your Hosting Business.</h2>
            <ul className="space-y-4 text-[#A7ADA8] mb-8">
              {['Free Billing System', 'Host Unlimited Clients', 'Set Your Own Prices', '24/7 Expert Support', '100% White Label'].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-[#B8FF00]" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-3xl font-black text-[#B8FF00] mb-8">Keep 100% of the Profit</p>
            <Link href="/cloud/plans?tab=reseller" className={cloudBtnPrimary}>
              Start selling
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className={cloudPanel + ' p-8 text-center'}>
            <Sparkles size={48} className="mx-auto text-[#B8FF00] mb-4" />
            <p className="font-semibold">Build your hosting empire with WISE² Cloud</p>
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section className="border-y border-white/10 bg-[#090D0A] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>Infrastructure That Performs</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Server, label: 'NVMe SSD', detail: 'Blazing Fast' },
              { icon: Globe, label: 'Global CDN', detail: 'Worldwide' },
              { icon: Shield, label: '99.99% Uptime', detail: 'SLA Guaranteed' },
              { icon: Zap, label: 'Scalable', detail: 'On Demand' },
            ].map(({ icon: Icon, label, detail }) => (
              <div key={label} className={cloudPanel + ' p-6 text-center'}>
                <Icon size={24} className="mx-auto text-[#B8FF00] mb-4" />
                <p className="font-bold text-sm">{label}</p>
                <p className="text-xs text-[#8FA0AE] mt-2">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div className={cloudPanel + ' p-8 flex items-center justify-center'}>
            <Lock size={80} className="text-[#B8FF00]" />
          </div>
          <div>
            <p className={cloudEyebrow}>Security You Can Trust</p>
            <h2 className="mt-4 text-3xl font-black mb-6">Your Data. Our Priority.</h2>
            <ul className="space-y-3 text-[#A7ADA8]">
              {[
                'DDoS Protection',
                'Web Application Firewall',
                'Malware Scanning',
                'Free SSL Certificates',
                'Automatic Backups',
                '24/7 Threat Monitoring',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-[#B8FF00]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AI MANAGEMENT */}
      <section className="border-y border-white/10 bg-[#090D0A] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className={cloudEyebrow}>AI-Powered Management</p>
            <h2 className="mt-4 text-3xl font-black mb-6">Smarter Hosting. Less Work.</h2>
            <ul className="space-y-3 text-[#A7ADA8]">
              {[
                'AI Server Optimization',
                'Predictive Monitoring',
                'Smart Resource Allocation',
                'Automated Backups',
                'Instant Threat Detection',
                'One-Click Management',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={16} className="text-[#B8FF00]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={cloudPanel + ' p-8 flex items-center justify-center'}>
            <Sparkles size={80} className="text-[#B8FF00]" />
          </div>
        </div>
      </section>

      {/* MIGRATION */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className={cloudEyebrow}>Free Migration</p>
          <h2 className="mt-4 text-3xl font-black mb-4">We Move You for Free!</h2>
          <ul className="max-w-2xl mx-auto grid grid-cols-2 gap-4 mb-8 text-[#A7ADA8]">
            {['Free Website Transfer', 'Free Database Transfer', 'Zero Downtime', 'Expert Team', 'All Plans'].map((item) => (
              <li key={item} className="flex items-center justify-center gap-2">
                <Check size={16} className="text-[#B8FF00]" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/cloud/plans?tab=migration" className={cloudBtnPrimary}>
            Migrate now
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CONSULTING */}
      <section className="border-y border-white/10 bg-[#090D0A] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div className={cloudPanel + ' p-8 flex items-center justify-center'}>
            <Gauge size={80} className="text-[#B8FF00]" />
          </div>
          <div>
            <p className={cloudEyebrow}>Consulting & Business Audit</p>
            <h2 className="mt-4 text-3xl font-black mb-4">Not Sure What You Need?</h2>
            <p className="text-[#A7ADA8] mb-6">
              Let our experts audit your current setup and recommend the perfect infrastructure for growth.
            </p>
            <Link href="/cloud/audit" className={cloudBtnPrimary}>
              Get your free audit
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* BUILT DIFFERENT */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>Built Different. Built WISE².</p>
          <h2 className="mt-4 text-3xl font-black mb-10">Enterprise. Affordable. Personal.</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              'All-in-One Cloud Platform',
              'Enterprise Security',
              'Real Human Support',
              'Affordable Pricing',
              'AI-Powered Tools',
              'Automated Backups',
              'Global Infrastructure',
              'Endless Possibilities',
            ].map((benefit) => (
              <div key={benefit} className={cloudPanel + ' p-6 flex items-center gap-4'}>
                <Check className="text-[#B8FF00] shrink-0" size={20} />
                <span className="font-semibold">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#0D141A] to-[#020403] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className={cloudEyebrow}>Ready to Launch Your Empire?</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl mb-4">
            Join Thousands Who Trust WISE² Cloud to Power Their Success.
          </h2>
          <Link href="/cloud/plans" className={cloudBtnPrimary + ' inline-flex mt-10'}>
            Build your cloud today
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* FEATURED CLIENTS */}
      <section className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className={cloudEyebrow}>Featured Clients</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-[#8FA0AE]">
            {['Fresh Winds Church', 'Rocky Tops', 'Once Upon A Child', "Logan's Heating & Cooling", 'Savôré', 'CJays Auto Recon', '& More'].map((client) => (
              <span key={client} className="text-sm font-semibold">{client}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#090D0A] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="text-[#B8FF00] font-black text-2xl">WISE²</p>
              <p className="text-sm text-[#A7ADA8] mt-2">Your Business.<br/>Our Infrastructure.</p>
            </div>
            <div>
              <p className="font-semibold mb-4">Navigation</p>
              <ul className="space-y-2 text-sm text-[#A7ADA8]">
                <li><Link href="#" className="hover:text-[#B8FF00]">Hosting</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00]">Reseller</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00]">VPS</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00]">Domains</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-sm text-[#A7ADA8]">
                <li><Link href="#" className="hover:text-[#B8FF00]">About</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00]">Support</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00]">Blog</Link></li>
                <li><Link href="#" className="hover:text-[#B8FF00]">Careers</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Contact</p>
              <ul className="space-y-2 text-sm text-[#A7ADA8]">
                <li><a href="mailto:support@wise2.net" className="hover:text-[#B8FF00]">support@wise2.net</a></li>
                <li><a href="mailto:sales@wise2.net" className="hover:text-[#B8FF00]">sales@wise2.net</a></li>
                <li className="text-xs mt-4">🇺🇸 USA Based</li>
                <li className="text-xs">24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-[#8FA0AE]">
            <p>© 2026 WISE² United. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
