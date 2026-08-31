import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Lock,
  Mail,
  RefreshCw,
  Server,
  Shield,
  Sparkles,
  Zap,
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
} from '@/lib/cloud-brand';
import { CloudCrownLogo } from '@/components/cloud/CloudCrownLogo';

export default function CloudLandingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <CloudCrownLogo size="lg" />
            <p className={`${cloudEyebrow} mt-6`}>WISE² Cloud</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] sm:text-5xl lg:text-6xl">
              YOUR BUSINESS. YOUR CLOUD.
              <span className="block text-[#4DA3FF]">YOUR BRAND.</span>
            </h1>
            <p className="mt-4 text-lg font-semibold text-[#C8CCD2]">
              Your business deserves better infrastructure.
            </p>
            <p className="mt-5 text-lg text-[#B7C0CB]">
              White-label hosting, managed infrastructure, automation, backups, security, and
              business technology — powered by WISE².
            </p>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.32em] text-[#C8CCD2]">
              {CLOUD_TAGLINE}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/cloud/plans" className={cloudBtnPrimary}>
                View plans
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link href="/cloud/plans" className={cloudBtnGhost}>
                Get started
              </Link>
            </div>
          </div>
          <div className={`${cloudPanel} relative overflow-hidden p-2`}>
            <Image
              src="/cloud/wise2-cloud-dashboard.jpg"
              alt="WISE² Cloud client analysis dashboard"
              width={1200}
              height={800}
              className="h-auto w-full object-cover"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#050607] via-[#050607]/80 to-transparent p-6">
              <p className={cloudEyebrow}>Piff City Infrastructure</p>
              <p className="mt-2 text-sm font-bold text-white">WE DON&apos;T HOST. WE EMPOWER.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#090C10]/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {CLOUD_TRUST_ITEMS.map((item) => (
            <span
              key={item}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8FA0AE]"
            >
              <Check size={14} className="text-[#3DFF9A]" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className={cloudEyebrow}>Why WISE²</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-black sm:text-4xl">
          MORE THAN HOSTING.
          <span className="block text-[#4DA3FF]">IT&apos;S A BUSINESS PLATFORM.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[#B7C0CB]">
          We do not sell commodity disk space. We sell convenience, management, continuity,
          security, automation, support, and growth.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Server, title: 'HOST.', copy: 'Managed stacks with SSL, email, and backups.' },
            { icon: Zap, title: 'AUTOMATE.', copy: 'Paid orders provision one package — no manual ops.' },
            { icon: Sparkles, title: 'SCALE.', copy: 'Grow from one site to a full client portfolio.' },
          ].map((item) => (
            <div key={item.title} className={`${cloudPanel} p-6`}>
              <item.icon className="text-[#4DA3FF]" size={22} aria-hidden />
              <p className={`${cloudEyebrow} mt-4`}>{item.title}</p>
              <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090C10]/60 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>Price menu</p>
          <h2 className="mt-4 text-3xl font-black sm:text-4xl">Three plans. One obvious winner.</h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {CLOUD_PLANS_STATIC.map((plan) => (
              <div
                key={plan.id}
                className={`${cloudPanel} flex flex-col p-6 ${plan.highlight ? 'ring-1 ring-[#4DA3FF]/50 shadow-[0_0_56px_rgba(77,163,255,0.2)]' : ''}`}
              >
                <p className={cloudEyebrow}>{plan.highlight ? 'Most popular' : plan.name}</p>
                <h3 className="mt-3 text-4xl font-black">
                  ${plan.price}
                  <span className="text-lg text-[#8FA0AE]">/mo</span>
                </h3>
                <p className="mt-2 text-sm text-[#8EDBFF]">{plan.tagline}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-[#B7C0CB]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-[#4DA3FF]" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/cloud/plans?plan=${plan.id}`}
                  className={`${cloudBtnPrimary} mt-8 w-full`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className={cloudEyebrow}>Higher value</p>
        <h2 className="mt-4 text-3xl font-black">Bundles for operators</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CLOUD_UPSELLS.map((upsell) => (
            <div key={upsell.id} className={`${cloudPanel} p-6`}>
              <p className={cloudEyebrow}>{upsell.name}</p>
              <p className="mt-3 text-3xl font-black">
                From ${upsell.price}
                <span className="text-base text-[#8FA0AE]">/mo</span>
              </p>
              <p className="mt-2 text-sm text-[#B7C0CB]">{upsell.tagline}</p>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-[#7BC0FF]">
                {upsell.status === 'coming_soon' ? 'Coming soon' : 'Contact sales'}
              </p>
              {upsell.status === 'contact_sales' ? (
                <a href="mailto:sales@wise2.net" className={`${cloudBtnGhost} mt-4`}>
                  Contact sales
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090C10]/40 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className={cloudEyebrow}>How it works</p>
          <h2 className="mt-4 text-3xl font-black">Live in four steps</h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'Pick your plan',
              'Connect your domain',
              'WISE² provisions everything',
              'Your business goes live',
            ].map((step, index) => (
              <li key={step} className={`${cloudPanel} p-5`}>
                <span className="text-3xl font-black text-[#4DA3FF]/40">{index + 1}</span>
                <p className="mt-3 font-semibold text-white">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Lock, label: '100% white-label', copy: 'Your brand. Your clients.' },
            { icon: RefreshCw, label: 'API powered', copy: 'Automate. Provision. Scale.' },
            { icon: Shield, label: 'Built to profit', copy: 'Start small. Scale big.' },
          ].map((item) => (
            <div key={item.label} className={`${cloudPanel} p-6 text-center`}>
              <item.icon className="mx-auto text-[#4DA3FF]" size={24} aria-hidden />
              <p className="mt-4 font-bold">{item.label}</p>
              <p className="mt-2 text-sm text-[#8FA0AE]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-gradient-to-b from-[#0D141A] to-[#050607] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className={cloudEyebrow}>Build different</p>
          <h2 className="mt-4 text-4xl font-black sm:text-5xl">{CLOUD_TAGLINE}</h2>
          <p className="mt-4 text-[#B7C0CB]">Get started with WISE² Cloud today.</p>
          <Link href="/cloud/plans" className={`${cloudBtnPrimary} mt-10`}>
            Get started with WISE² Cloud
            <ArrowRight size={16} aria-hidden />
          </Link>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#8FA0AE]">
            <Mail size={14} aria-hidden />
            <a href="mailto:support@wise2.net" className="hover:text-white">
              support@wise2.net
            </a>
            <span aria-hidden>·</span>
            <a href="mailto:billing@wise2.net" className="hover:text-white">
              billing@wise2.net
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
