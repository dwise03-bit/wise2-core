'use client';
import { useEffect, useState, FormEvent } from 'react';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  CloudOff,
  MapPin,
  Navigation,
  Radio,
  Wrench,
  Loader,
} from 'lucide-react';
import { SiteHeader } from '../components/SiteHeader';

type Job = {
  id: string;
  customerName: string;
  address: string;
  appointmentAt: string;
  complaint: string;
  status: 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';
};

const capabilities = [
  { icon: ClipboardList, title: 'Live Job Queue', copy: 'Technicians see today\'s dispatched jobs instantly.', accent: 'blue' },
  { icon: CheckCircle2, title: 'One-Tap Status Updates', copy: 'Move jobs from Dispatched to Completed from the truck.', accent: 'success' },
  { icon: CloudOff, title: 'Offline-First Sync', copy: 'Status changes queue locally and sync when signal returns.', accent: 'orange' },
  { icon: Camera, title: 'Photo-Backed Proof', copy: 'Before/after photos attach to the job automatically.', accent: 'cyan' },
  { icon: Navigation, title: 'Address & Route Detail', copy: 'Every job carries the service address and access notes.', accent: 'blue' },
  { icon: Radio, title: 'Dispatcher Visibility', copy: 'Office staff see field status in real time.', accent: 'orange' },
];

const statusStyles = {
  DISPATCHED: 'border-wise-blue/35 bg-wise-blue/10 text-wise-cyan',
  IN_PROGRESS: 'border-wise-orange/35 bg-wise-orange/10 text-wise-ember',
  COMPLETED: 'border-wise-success/35 bg-wise-success/10 text-wise-success',
};

const statusLabels = {
  DISPATCHED: 'Dispatched',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

function accentClasses(accent: string) {
  const classes: Record<string, string> = {
    orange: 'border-wise-orange/35 bg-wise-orange/10 text-wise-ember',
    success: 'border-wise-success/35 bg-wise-success/10 text-wise-success',
    cyan: 'border-wise-cyan/35 bg-wise-cyan/10 text-wise-cyan',
    blue: 'border-wise-blue/35 bg-wise-blue/10 text-wise-cyan',
  };
  return classes[accent] || classes.blue;
}

export default function FieldTechPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        const response = await fetch('/api/field/jobs');
        if (!response.ok) throw new Error('Failed to load jobs');
        setJobs(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          message: formData.get('message'),
          source: 'field-tech-page',
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      alert('Demo request submitted successfully!');
      e.currentTarget.reset();
    } catch (err) {
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
              Built For<br/>
              <span className="text-wise-blue">The Field.</span><br/>
              Not The<br/>
              <span className="text-wise-orange">Office.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-wise-mute">
              Every technician gets a live, mobile-optimized view of their day — dispatched jobs, one-tap status updates, and offline-first sync so a bad signal never means a lost update.
            </p>
          </div>

          <div className="relative">
            <div className="wise-panel relative p-6 sm:p-8">
              <p className="section-kicker">TODAY'S JOBS</p>
              <h3 className="mt-3 font-display text-2xl font-black uppercase text-white">
                <span className="text-wise-blue">{jobs.filter(j => j.status === 'DISPATCHED' || j.status === 'IN_PROGRESS').length}</span> Jobs Assigned
              </h3>

              <div className="mt-6 space-y-3">
                {loading && <div className="flex justify-center py-6"><Loader className="h-5 w-5 animate-spin text-wise-cyan" /></div>}
                {error && <p className="text-xs text-wise-ember">{error}</p>}
                {!loading && jobs.length === 0 && <p className="text-xs text-wise-mute">No jobs</p>}
                {jobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black uppercase text-white">{job.customerName}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyles[job.status]}`}>
                        {statusLabels[job.status]}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-wise-mute">{job.complaint}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-wise-mute">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {job.address}</span>
                      <span>{new Date(job.appointmentAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-wise-cyan/25 bg-wise-cyan/5 px-3.5 py-2.5 text-[11px] font-semibold uppercase text-wise-cyan">
                <CloudOff className="h-3.5 w-3.5" />
                Synced just now • works offline
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="animate-slideUp mx-auto max-w-7xl px-5 py-10 md:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Field Tech App</p>
          <h2 className="section-title">Everything A Tech Needs, Nothing They Don't</h2>
          <p className="mt-4 text-base leading-8 text-wise-mute">
            A mobile-optimized layer on top of the same WISE² system dispatch — lightweight payloads, quick actions, and offline-first architecture built for trucks, basements, and crawl spaces.
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
                <h3 className="mt-5 font-display text-2xl font-black uppercase text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-wise-mute">{item.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="animate-slideUp border-t border-white/10" id="contact">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-16">
          <div>
            <p className="font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
              WISE<span className="text-wise-blue">2</span>
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.22em] text-wise-cyan">HVAC Solutions</p>
            <p className="mt-6 max-w-md text-sm leading-8 text-wise-mute">
              Field Tech App preview built on the same WISE² mobile API used across every vertical — job list, quick status updates, and offline-first sync.
            </p>
          </div>

          <div className="wise-panel p-7">
            <p className="section-kicker text-left">See It On Your Team</p>
            <h3 className="mt-3 font-display text-4xl font-black uppercase text-white">Let's Get Your Techs Equipped.</h3>
            <form onSubmit={handleFormSubmit} className="mt-7 grid gap-4 sm:grid-cols-2">
              <input className="wise-input" placeholder="Your name" name="name" required />
              <input className="wise-input" placeholder="Phone number" name="phone" required />
              <input className="wise-input sm:col-span-2" placeholder="Email address" name="email" type="email" required />
              <textarea className="wise-input min-h-[132px] sm:col-span-2" placeholder="Tell us about your crew size..." name="message" />
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:col-span-2">
                <p className="text-xs uppercase text-wise-mute">✓ Form submission connected to backend</p>
                <button type="submit" disabled={submitting} className="wise-button-blue disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Request Demo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
