import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  CloudOff,
  MapPin,
  Navigation,
  Radio,
  Signal,
  Snowflake,
  Wrench,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

const jobs = [
  {
    id: 'job-4471',
    customer: 'Miller Residence',
    serviceType: 'AC Diagnostic',
    scheduledStart: '9:00 AM',
    status: 'DISPATCHED',
    address: '214 Birchwood Dr',
  },
  {
    id: 'job-4472',
    customer: 'Greensboro Family Dental',
    serviceType: 'Preventive Maintenance',
    scheduledStart: '11:30 AM',
    status: 'IN_PROGRESS',
    address: '88 Pinnacle Ct, Ste 200',
  },
  {
    id: 'job-4470',
    customer: 'Thompson Residence',
    serviceType: 'Heat Pump Repair',
    scheduledStart: '8:00 AM',
    status: 'COMPLETED',
    address: '502 Sedgefield Rd',
  },
];

const statusStyles: Record<string, string> = {
  DISPATCHED: 'border-wise-blue/35 bg-wise-blue/10 text-wise-cyan',
  IN_PROGRESS: 'border-wise-orange/35 bg-wise-orange/10 text-wise-ember',
  COMPLETED: 'border-wise-success/35 bg-wise-success/10 text-wise-success',
};

const statusLabels: Record<string, string> = {
  DISPATCHED: 'Dispatched',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const capabilities = [
  {
    icon: ClipboardList,
    title: 'Live Job Queue',
    copy: 'Technicians see today’s dispatched jobs, scheduled windows, and customer notes the moment a job is assigned — no dispatcher phone call required.',
    accent: 'blue',
  },
  {
    icon: CheckCircle2,
    title: 'One-Tap Status Updates',
    copy: 'Move a job from Dispatched to In Progress to Completed from the truck, with photo and note attachments logged automatically to the customer record.',
    accent: 'success',
  },
  {
    icon: CloudOff,
    title: 'Offline-First Sync',
    copy: 'Dead zones and basements don’t stop the job. Status changes queue locally and sync the moment signal returns — nothing gets lost.',
    accent: 'orange',
  },
  {
    icon: Camera,
    title: 'Photo-Backed Proof',
    copy: 'Before/after photos attach directly to the job so estimates, invoices, and reviews all point back to real evidence.',
    accent: 'cyan',
  },
  {
    icon: Navigation,
    title: 'Address & Route Detail',
    copy: 'Every job carries the service address and access notes a tech needs before they knock — no digging through a separate CRM tab.',
    accent: 'blue',
  },
  {
    icon: Radio,
    title: 'Dispatcher Visibility',
    copy: 'Office staff see field status in real time — who’s on site, who’s wrapping up, and which jobs are still unassigned.',
    accent: 'orange',
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

export default function FieldTechPage() {
  return (
    <main className="min-h-screen bg-wise-void text-wise-text">
      <div className="relative overflow-hidden">
        <div className="wise-bg-pointer absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <SiteHeader activeHref="/field-tech" />

        <section className="relative z-10 mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-8 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-24 lg:pt-14 animate-fadeInUp">
          <div className="animate-riseIn">
            <p className="inline-flex rounded-full border border-wise-blue/30 bg-wise-blue/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-wise-cyan">
              Powered by WISE²
            </p>
            <h1 className="mt-6 font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl lg:text-7xl">
              Built For
              <br />
              <span className="text-wise-blue">The Field.</span>
              <br />
              Not The
              <br />
              <span className="text-wise-orange">Office.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-wise-mute sm:text-lg">
              Every technician gets a live, mobile-optimized view of their day — dispatched
              jobs, one-tap status updates, and offline-first sync so a bad signal never means a
              lost update.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-wise-blue/35 bg-wise-blue px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-neon transition hover:-translate-y-0.5"
              >
                Schedule Service <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-wise-orange/35 hover:bg-wise-orange/10"
              >
                Back To Home
              </Link>
            </div>
          </div>

          <div className="relative animate-riseIn lg:pl-6">
            <div className="mx-auto w-full max-w-[360px] rounded-[40px] border border-white/12 bg-black/40 p-3 shadow-neon">
              <div className="rounded-[30px] border border-white/10 bg-wise-void p-4">
                <div className="flex items-center justify-between px-1 pb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-wise-mute">
                  <span>9:41</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Signal className="h-3.5 w-3.5" /> Field App
                  </span>
                </div>

                <div className="flex items-center justify-between px-1 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-wise-mute">Today</p>
                    <p className="font-display text-xl font-black uppercase text-white">
                      3 Jobs Assigned
                    </p>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-wise-blue/35 bg-wise-blue/10 text-wise-cyan">
                    <Wrench className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-black uppercase tracking-[0.04em] text-white">
                          {job.customer}
                        </p>
                        <span
                          className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${statusStyles[job.status]}`}
                        >
                          {statusLabels[job.status]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-wise-mute">{job.serviceType}</p>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-wise-mute">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {job.address}
                        </span>
                        <span>{job.scheduledStart}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-wise-cyan/25 bg-wise-cyan/5 px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-wise-cyan">
                  <CloudOff className="h-3.5 w-3.5" />
                  Synced 2 min ago • works offline
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="animate-slideUp mx-auto max-w-7xl px-5 py-10 md:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Field Tech App</p>
          <h2 className="section-title">Everything A Tech Needs, Nothing They Don&apos;t</h2>
          <p className="mt-4 text-base leading-8 text-wise-mute">
            A mobile-optimized layer on top of the same WISE² system dispatch and the office use
            — lightweight payloads, quick actions, and offline-first architecture built for trucks,
            basements, and crawl spaces.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="wise-service-card animate-scaleIn" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`inline-flex rounded-2xl border px-4 py-3 ${accentClasses(item.accent)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-[0.05em] text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-wise-mute">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="animate-slideUp mx-auto max-w-7xl px-5 pb-8 md:px-8 lg:px-10">
        <div className="wise-panel relative overflow-hidden p-7 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(36,167,255,.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(255,122,24,.16),transparent_35%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="section-kicker text-left">From Dispatch To Done</p>
              <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none text-white sm:text-4xl">
                One System.
                <br />
                <span className="text-wise-orange">Office To Truck.</span>
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-wise-mute">
                A job dispatched from the office shows up on a tech’s phone instantly. A status
                update from the field flows back to dispatch, the customer record, and the revenue
                report — all without a separate app or a manual re-entry step.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <div className="wise-chip text-center">
                <Snowflake className="mx-auto h-5 w-5 text-wise-cyan" />
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-wise-mute">Dispatch</p>
              </div>
              <div className="grid place-items-center text-wise-mute">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="wise-chip text-center">
                <Wrench className="mx-auto h-5 w-5 text-wise-ember" />
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-wise-mute">Field App</p>
              </div>
              <div className="grid place-items-center text-wise-mute">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="wise-chip text-center">
                <CheckCircle2 className="mx-auto h-5 w-5 text-wise-success" />
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-wise-mute">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-slideUp border-t border-white/10" id="contact">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-16">
          <div>
            <p className="font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
              WISE<span className="text-wise-blue">2</span>
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-wise-cyan">
              HVAC Solutions
            </p>
            <p className="mt-6 max-w-md text-sm leading-8 text-wise-mute">
              Field Tech App preview built on the same WISE² mobile API used across every vertical
              — job list, quick status updates, and offline-first sync.
            </p>
          </div>

          <div className="wise-panel p-7">
            <p className="section-kicker text-left">See It On Your Team</p>
            <h3 className="mt-3 font-display text-4xl font-black uppercase text-white">
              Let&apos;s Get Your Techs Equipped.
            </h3>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <input className="wise-input" placeholder="Your name" />
              <input className="wise-input" placeholder="Phone number" />
              <input className="wise-input sm:col-span-2" placeholder="Email address" />
              <textarea className="wise-input min-h-[132px] sm:col-span-2" placeholder="Tell us about your crew size and current dispatch process..." />
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-wise-mute">
                Demo form only. No live submission is connected.
              </p>
              <button className="wise-button-blue">Request Demo</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
