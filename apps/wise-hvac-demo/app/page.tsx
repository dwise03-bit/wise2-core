import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CalendarCheck2,
  Fan,
  Flame,
  Phone,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Wrench,
  Zap,
} from 'lucide-react';
import { SiteHeader } from './components/SiteHeader';

const services = [
  {
    icon: Snowflake,
    title: 'Cooling Solutions',
    copy: 'High-efficiency AC installs, changeouts, and tune-ups built for fast comfort and lower runtime costs.',
    accent: 'blue',
  },
  {
    icon: Flame,
    title: 'Heating Solutions',
    copy: 'Furnaces, heat pumps, and repair plans that keep homes and light commercial spaces reliable through winter.',
    accent: 'orange',
  },
  {
    icon: Wrench,
    title: 'Preventive Maintenance',
    copy: 'Routine service that catches drain, airflow, and component issues before they become emergency calls.',
    accent: 'success',
  },
  {
    icon: BrainCircuit,
    title: 'System Diagnostics',
    copy: 'Smart troubleshooting workflows that shorten time-to-fix and help customers understand what failed and why.',
    accent: 'blue',
  },
  {
    icon: Fan,
    title: 'Indoor Air Quality',
    copy: 'Filtration, airflow balancing, and IAQ upgrades that make every season healthier and more comfortable.',
    accent: 'cyan',
  },
  {
    icon: ShieldCheck,
    title: 'Emergency Service',
    copy: 'Priority dispatch and after-hours response for the calls that cannot wait until tomorrow morning.',
    accent: 'orange',
  },
];

const stats = [
  ['24/7', 'Emergency response'],
  ['98%', 'Customer satisfaction target'],
  ['Same-day', 'Diagnostic turnaround'],
  ['Residential + Commercial', 'Service coverage'],
];

const highlights = [
  'Expert techs with clean, trustworthy presentation',
  'Upfront recommendations with photo-based proof',
  'AI-assisted diagnostics for faster issue isolation',
  'Energy-minded upgrades that actually add value',
];

const testimonials = [
  {
    quote:
      'They responded fast, showed up on time, and had the system cooling again the same day.',
    name: 'Mike R.',
    city: 'Greensboro, NC',
  },
  {
    quote:
      'Their diagnostics found the airflow issue two other companies missed. The difference was immediate.',
    name: 'Sarah J.',
    city: 'Greensboro, NC',
  },
  {
    quote:
      'Professional, knowledgeable, and honest. It felt premium without the hard sell.',
    name: 'David T.',
    city: 'High Point, NC',
  },
];

function accentClasses(accent: string) {
  if (accent === 'orange') {
    return 'border-wise-orange/35 bg-wise-orange/10 text-wise-ember';
  }
  if (accent === 'success') {
    return 'border-wise-success/35 bg-wise-success/10 text-wise-success';
  }
  if (accent === 'cyan') {
    return 'border-wise-cyan/35 bg-wise-cyan/10 text-wise-cyan';
  }
  return 'border-wise-blue/35 bg-wise-blue/10 text-wise-cyan';
}

export default function Page() {
  return (
    <main className="min-h-screen bg-wise-void text-wise-text">
      <div className="relative overflow-hidden">
        <div className="wise-bg-pointer absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <SiteHeader />

        <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-24 lg:pt-14">
          <div className="animate-riseIn">
            <p className="inline-flex rounded-full border border-wise-blue/30 bg-wise-blue/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-wise-cyan">
              Powered by WISE²
            </p>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
              Comfort.
              <br />
              <span className="text-wise-blue">Efficiency.</span>
              <br />
              Expertise.
              <br />
              <span className="text-wise-orange">All Year Long.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-wise-mute sm:text-lg">
              WISE HVAC Solutions combines advanced diagnostics, experienced technicians, and a
              bold customer experience to keep homes and businesses comfortable in every season.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-wise-blue/35 bg-wise-blue px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-neon transition hover:-translate-y-0.5"
              >
                Schedule Service <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="tel:3367090472"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-wise-orange/35 hover:bg-wise-orange/10"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="wise-chip">
                  <p className="font-display text-2xl font-black uppercase text-white">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-wise-mute">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-riseIn lg:pl-6">
            <div className="hero-stage">
              <div className="hero-ring hero-ring-blue" />
              <div className="hero-ring hero-ring-orange" />
              <div className="hero-snowflake">
                <Snowflake className="h-28 w-28 sm:h-36 sm:w-36" strokeWidth={1.4} />
              </div>
              <div className="hero-flame">
                <Flame className="h-24 w-24 sm:h-28 sm:w-28" strokeWidth={1.8} />
              </div>

              <div className="relative z-10 mx-auto max-w-[440px] pt-10 text-center">
                <p className="font-display text-5xl font-black uppercase tracking-[0.08em] text-white sm:text-6xl">
                  WISE<span className="text-wise-blue">2</span>
                </p>
                <p className="mt-2 text-xl font-black uppercase tracking-[0.18em] text-wise-cyan sm:text-2xl">
                  HVAC Solutions
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.34em] text-wise-mute">
                  Smarter Systems. Stronger Solutions.
                </p>
              </div>

              <div className="hvac-unit">
                <div className="hvac-grille" />
                <div className="hvac-badge">WISE²</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-8 md:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item, index) => (
            <div key={item} className="wise-panel flex items-start gap-3 p-5">
              <div
                className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${
                  index % 2 === 0
                    ? 'border-wise-blue/35 bg-wise-blue/10 text-wise-cyan'
                    : 'border-wise-orange/35 bg-wise-orange/10 text-wise-ember'
                }`}
              >
                {index % 2 === 0 ? <Sparkles className="h-5 w-5" /> : <BadgeCheck className="h-5 w-5" />}
              </div>
              <p className="text-sm leading-7 text-wise-text/90">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-4 md:px-8 lg:px-10">
        <Link
          href="/field-tech"
          className="wise-panel flex flex-col gap-4 p-6 transition hover:border-wise-cyan/30 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="section-kicker text-left">New: Field Tech App</p>
            <p className="mt-2 font-display text-2xl font-black uppercase text-white sm:text-3xl">
              See the mobile experience our technicians run on.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-wise-cyan">
            View Field Tech App <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Our Services</p>
          <h2 className="section-title">Complete HVAC Solutions</h2>
          <p className="mt-4 text-base leading-8 text-wise-mute">
            Residential and light commercial support designed around speed, transparency, and
            real comfort performance.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="wise-service-card">
                <div className={`inline-flex rounded-2xl border px-4 py-3 ${accentClasses(service.accent)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-[0.05em] text-white">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-wise-mute">{service.copy}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-wise-cyan">
                  Learn More <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section id="why-wise" className="mx-auto max-w-7xl px-5 py-8 md:px-8 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <div className="wise-panel relative overflow-hidden p-7 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,167,255,.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,122,24,.16),transparent_35%)]" />
            <div className="relative">
              <p className="section-kicker text-left">Powered by WISE²</p>
              <h3 className="mt-3 font-display text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                Smarter Systems.
                <br />
                <span className="text-wise-orange">Stronger Solutions.</span>
              </h3>
              <p className="mt-5 max-w-xl text-sm leading-8 text-wise-mute sm:text-base">
                This demo takes the uploaded fire-and-ice concept and turns it into a real landing
                page structure with service positioning, proof points, responsive sections, and
                conversion-focused CTAs.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ['Advanced AI Diagnostics', 'Accurate answers and faster fixes.'],
                  ['Energy-Efficient Solutions', 'Lower operating costs without guesswork.'],
                  ['Top-Quality Equipment', 'Built for performance and reliability.'],
                  ['100% Satisfaction Focus', 'A premium experience from first call to finish.'],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-wise-mute">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="wise-panel flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-kicker text-left">24/7 Support</p>
                <h3 className="mt-2 font-display text-4xl font-black uppercase text-white">
                  We&apos;re Here When You Need Us.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-wise-mute">
                  Day or night, weekends or holidays, the page keeps emergency service prominent so
                  the offer reads clearly at a glance.
                </p>
              </div>
              <Link href="#contact" className="wise-button-orange whitespace-nowrap">
                Schedule Now
              </Link>
            </div>

            <div id="special" className="wise-panel special-offer p-7">
              <p className="section-kicker text-left text-wise-orange">New Customer Special</p>
              <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-display text-7xl font-black leading-none text-white">$79</p>
                  <p className="mt-2 text-2xl font-black uppercase tracking-[0.08em] text-white">
                    AC Tune-Up Special
                  </p>
                </div>
                <div className="max-w-md">
                  <p className="text-sm leading-7 text-wise-text/90">
                    Improve efficiency, lower bills, and extend system life with a clear
                    entry-point offer that gives the demo a strong conversion hook.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">What Customers Say</p>
          <h2 className="section-title">Trust That Feels Immediate</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="wise-panel p-6">
              <div className="mb-5 flex gap-1 text-wise-ember">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-base leading-8 text-wise-text/90">&ldquo;{item.quote}&rdquo;</p>
              <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-white">
                {item.name}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-wise-mute">{item.city}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-16">
          <div>
            <p className="font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
              WISE<span className="text-wise-blue">2</span>
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-wise-cyan">
              HVAC Solutions
            </p>
            <p className="mt-6 max-w-md text-sm leading-8 text-wise-mute">
              A coded demo built from the uploaded mockup so the look has real layout logic, mobile
              behavior, and production-ready structure.
            </p>
            <div className="mt-8 space-y-3 text-sm text-wise-text/90">
              <p className="inline-flex items-center gap-3"><Phone className="h-4 w-4 text-wise-cyan" /> 336 709 0472</p>
              <p className="inline-flex items-center gap-3"><Zap className="h-4 w-4 text-wise-orange" /> dwise@wisehvacsolutions.com</p>
              <p className="inline-flex items-center gap-3"><CalendarCheck2 className="h-4 w-4 text-wise-cyan" /> Residential + Commercial Service</p>
            </div>
          </div>

          <div className="wise-panel p-7">
            <p className="section-kicker text-left">Ready For Total Comfort?</p>
            <h3 className="mt-3 font-display text-4xl font-black uppercase text-white">
              Let&apos;s Get Started Today.
            </h3>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <input className="wise-input" placeholder="Your name" />
              <input className="wise-input" placeholder="Phone number" />
              <input className="wise-input sm:col-span-2" placeholder="Email address" />
              <textarea className="wise-input min-h-[132px] sm:col-span-2" placeholder="Tell us what your system is doing..." />
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-wise-mute">
                Demo form only. No live submission is connected.
              </p>
              <button className="wise-button-blue">Request Service</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
