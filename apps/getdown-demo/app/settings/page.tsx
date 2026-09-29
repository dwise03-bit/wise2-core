'use client';

import { AlertTriangle, CheckCircle2, CircleDashed, Play, ShieldCheck } from 'lucide-react';
import { Badge, Panel, SectionHead } from '@/components/ui/kit';
import { GetDownMark, PoweredByWise } from '@/components/shell/Brand';
import { useTour } from '@/components/tour/TourProvider';

const INTEGRATIONS = [
  { name: 'Jobber', purpose: 'Field service scheduling and job records', state: 'simulated', note: 'Operations AI reads the schedule in production. Simulated here.' },
  { name: 'Email (business inbox)', purpose: 'Inbox AI morning scan and draft replies', state: 'simulated', note: 'Reads only. Never sends without approval.' },
  { name: 'Kale Insurance / Erie', purpose: 'COI requests and renewals', state: 'simulated', note: 'Contact: Alex Mullen. No email leaves this demo.' },
  { name: 'Payment processing', purpose: 'Deposits, invoices, card and ACH', state: 'sandbox', note: 'Sandbox mode. No real charge is possible.' },
  { name: 'SMS / texting', purpose: 'Customer follow-up and review requests', state: 'disabled', note: 'Disabled entirely in the owner demo.' },
  { name: 'Google Business Profile', purpose: 'Review capture and post publishing', state: 'disabled', note: 'Publishing requires explicit production authorization.' },
  { name: 'Social publishing', purpose: 'Marketing AI content distribution', state: 'disabled', note: 'Drafts only. Nothing is posted.' },
  { name: 'WISE² Revenue Engine', purpose: 'Data model, AI orchestration, design system', state: 'connected', note: 'The platform this command center is built on.' },
];

const STATE_META = {
  connected: { tone: 'neon' as const, icon: CheckCircle2, label: 'Connected' },
  simulated: { tone: 'amber' as const, icon: CircleDashed, label: 'Simulated' },
  sandbox: { tone: 'electric' as const, icon: ShieldCheck, label: 'Sandbox' },
  disabled: { tone: 'red' as const, icon: AlertTriangle, label: 'Disabled' },
};

export default function SettingsPage() {
  const { demoMode, setDemoMode, start } = useTour();

  return (
    <div className="mx-auto max-w-[1720px] space-y-5">
      <div>
        <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gd-steel">
          Demo configuration, integration state, and data-safety posture.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <SectionHead title="Business Profile" />
          <div className="mb-4">
            <GetDownMark size="md" />
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Positioning', 'Multifamily Exterior Cleaning Specialist'],
              ['Primary engine', 'Engine A — Multifamily / Commercial'],
              ['Secondary engine', 'Engine B — Premium Permanent Lighting'],
              ['Signature line', 'We get down to the dirt.'],
              ['Supporting', 'Power. Precision. Clean.'],
              ['Insurance', 'Kale Insurance · Erie Coverage'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-white/[0.05] pb-2">
                <span className="text-gd-steel">{k}</span>
                <span className="text-right text-white">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <PoweredByWise />
          </div>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Demo Controls" />
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 transition-all ${
              demoMode
                ? 'border-gd-amber/45 bg-gd-amber/10'
                : 'border-white/12 bg-white/[0.03]'
            }`}
          >
            <div className="text-left">
              <p
                className={`font-display text-sm font-black uppercase tracking-wider ${
                  demoMode ? 'text-gd-amber' : 'text-gd-steel'
                }`}
              >
                Owner Demo Mode
              </p>
              <p className="mt-1 text-[11px] text-gd-steel">
                {demoMode
                  ? 'Simulated-data banner visible on every screen.'
                  : 'Banner hidden — data is still simulated.'}
              </p>
            </div>
            <span
              className={`relative h-6 w-11 rounded-full transition-colors ${
                demoMode ? 'bg-gd-amber/40' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                  demoMode ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          </button>

          <button
            onClick={start}
            className="mt-3 flex w-full items-center gap-2 rounded-xl border border-gd-neon/45 bg-gd-neon/12 px-4 py-3.5 text-left transition-all hover:bg-gd-neon/20"
          >
            <Play className="h-4 w-4 fill-current text-gd-neon" />
            <div>
              <p className="font-display text-sm font-black uppercase tracking-wider text-gd-neon">
                Start Owner Tour
              </p>
              <p className="mt-0.5 text-[11px] text-gd-steel">
                12 guided steps · approximately 5–7 minutes
              </p>
            </div>
          </button>

          <div className="mt-4 space-y-2 text-[11px] leading-relaxed text-gd-steel">
            <p>
              Demo data resets on page reload. Pipeline and dispatch changes you make during a
              presentation live only in the browser session.
            </p>
            <p>
              Present full-screen at 1920×1080 for the intended layout. The tour advances with the
              right arrow or space bar.
            </p>
          </div>
        </Panel>

        <Panel className="border-gd-neon/25 p-5">
          <SectionHead title="Data Safety" sub="What this demo cannot do" />
          <div className="space-y-2">
            {[
              'Send a real SMS or email',
              'Charge a real card or move money',
              'Create a real invoice against a customer',
              'Publish social or Google Business Profile content',
              'Modify any production customer record',
              'Trigger a production automation',
              'Use production credentials from the browser',
            ].map((r) => (
              <div
                key={r}
                className="flex items-center gap-2.5 rounded-lg border border-gd-neon/20 bg-gd-neon/[0.05] px-3 py-2 text-xs text-gd-chrome"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-gd-neon" />
                {r}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="p-5">
        <SectionHead
          title="Integrations"
          sub="What is genuinely connected, what is simulated, and what is switched off"
        />
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {INTEGRATIONS.map((i) => {
            const meta = STATE_META[i.state as keyof typeof STATE_META];
            const Icon = meta.icon;
            return (
              <div
                key={i.name}
                className="flex items-start gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3"
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    meta.tone === 'neon'
                      ? 'text-gd-neon'
                      : meta.tone === 'amber'
                        ? 'text-gd-amber'
                        : meta.tone === 'red'
                          ? 'text-gd-red'
                          : 'text-gd-electric'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-white">{i.name}</p>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-gd-steel">{i.purpose}</p>
                  <p className="mt-1 text-[11px] text-gd-chrome">{i.note}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
