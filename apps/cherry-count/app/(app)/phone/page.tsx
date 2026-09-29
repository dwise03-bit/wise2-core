'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Clock,
  MessageSquare,
  Phone,
  PhoneCall,
  PhoneForwarded,
  Sparkles,
  Voicemail,
} from 'lucide-react';
import { GlassCard, SectionHeader, StatCard } from '@/components/ui';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { cherryPhoneDashboard, cherryUpdatePhoneConfig } from '@/lib/api';
import type { CherryPhoneCall, CherryPhoneDashboard } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  DEMO_PHONE_CALLS,
  DEMO_PHONE_CAPABILITIES,
  DEMO_PHONE_CONFIG,
  DEMO_PHONE_STATS,
} from '@/lib/demo-data';

const OUTCOME_STYLES: Record<string, string> = {
  HOLD_PLACED: 'bg-cherry-hot/20 text-cherry-hot',
  SMS_SENT: 'bg-cherry-royal/20 text-cherry-lavender',
  TRANSFERRED: 'bg-cherry-bubblegum/15 text-cherry-bubblegum',
  VOICEMAIL: 'bg-white/10 text-white/70',
};

function formatDuration(seconds: number | null) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PhonePage() {
  const { isAuthenticated } = useAuth();
  const [config, setConfig] = useState<CherryPhoneDashboard['config']>(DEMO_PHONE_CONFIG);
  const [stats, setStats] = useState(DEMO_PHONE_STATS);
  const [calls, setCalls] = useState<CherryPhoneCall[]>(DEMO_PHONE_CALLS);
  const [capabilities, setCapabilities] = useState(DEMO_PHONE_CAPABILITIES);
  const [greeting, setGreeting] = useState(DEMO_PHONE_CONFIG.greeting);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    cherryPhoneDashboard()
      .then((data) => {
        setConfig(data.config);
        setStats(data.stats);
        setCalls(data.recentCalls);
        setCapabilities(data.capabilities);
        setGreeting(data.config.greeting);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggleEnabled = async () => {
    const next = !config.enabled;
    setConfig((c) => ({ ...c, enabled: next }));
    if (!isAuthenticated) return;

    setSaving(true);
    try {
      const res = await cherryUpdatePhoneConfig({ enabled: next });
      setConfig(res.config);
      setStats((s) => ({ ...s, aiActive: res.config.enabled }));
    } finally {
      setSaving(false);
    }
  };

  const saveGreeting = async () => {
    if (!isAuthenticated) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setSaving(true);
    try {
      const res = await cherryUpdatePhoneConfig({ greeting });
      setConfig(res.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <DemoModeBanner />

      <header className="mb-6 text-center" data-tour="phone-hero">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cherry-royal/40 to-cherry-hot/30">
          <Phone className="h-9 w-9 text-cherry-lavender" />
        </div>
        <h1 className="font-serif text-2xl font-bold uppercase">AI Phone</h1>
        <p className="mt-1 text-sm text-cherry-lavender">WISE² answers while you sell</p>
        <p className="mt-3 font-mono text-xl font-semibold tracking-wide text-cherry-bubblegum">
          {config.phoneNumber ?? '(404) 867-2446'}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase ${
              config.enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${config.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'}`} />
            {config.enabled ? 'Live' : 'Paused'}
          </span>
          <button
            type="button"
            onClick={toggleEnabled}
            disabled={saving}
            className="rounded-full border border-cherry-hot/40 px-3 py-1 text-xs text-cherry-hot"
          >
            {config.enabled ? 'Pause' : 'Go Live'}
          </button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3" data-tour="phone-stats">
        <StatCard label="Calls Today" value={loading ? '…' : stats.callsToday} accent />
        <StatCard label="Avg Duration" value={formatDuration(stats.avgDurationSeconds)} />
        <StatCard label="Leads Captured" value={stats.leadsCaptured} />
        <StatCard label="Total Calls" value={stats.totalCalls} />
      </div>

      <GlassCard className="mb-6" glow data-tour="phone-greeting">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cherry-hot" />
          <p className="text-sm font-semibold">{config.aiPersona} greets every caller</p>
        </div>
        <textarea
          value={greeting}
          onChange={(e) => setGreeting(e.target.value)}
          rows={4}
          className="w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-soft/60 px-3 py-2 text-sm leading-relaxed text-white/80 outline-none focus:border-cherry-hot/50"
        />
        <button
          type="button"
          onClick={saveGreeting}
          disabled={saving}
          className={`mt-3 w-full ${CHERRY_LAYOUT.btnPrimary}`}
        >
          {saved ? 'Saved ✓' : 'Save Greeting'}
        </button>
      </GlassCard>

      <SectionHeader title="What Cherry Handles" />
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {capabilities.map((cap) => (
          <GlassCard key={cap} className="flex items-start gap-2 py-3 text-sm">
            <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-cherry-hot" />
            {cap}
          </GlassCard>
        ))}
      </div>

      <SectionHeader
        title="Recent Calls"
        action={
          <span className="text-xs text-white/40">
            Transfer: {config.transferNumber ?? '—'}
          </span>
        }
      />
      <div className="mb-6 space-y-2" data-tour="phone-calls">
        {calls.map((call) => (
          <GlassCard key={call.id} className="py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{call.callerName ?? 'Unknown caller'}</p>
                <p className="text-xs text-white/50">{call.callerNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40">{formatTime(call.startedAt)}</p>
                <p className="text-sm font-semibold text-cherry-bubblegum">
                  {formatDuration(call.durationSeconds)}
                </p>
              </div>
            </div>
            {call.intent && (
              <p className="mt-2 text-xs uppercase tracking-wider text-cherry-lavender/80">
                {call.intent}
              </p>
            )}
            {call.summary && (
              <p className="mt-1 text-sm leading-relaxed text-white/70">{call.summary}</p>
            )}
            {call.outcome && (
              <span
                className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
                  OUTCOME_STYLES[call.outcome] ?? 'bg-white/10 text-white/60'
                }`}
              >
                {call.outcome === 'SMS_SENT' && <MessageSquare className="h-3 w-3" />}
                {call.outcome === 'TRANSFERRED' && <PhoneForwarded className="h-3 w-3" />}
                {call.outcome === 'VOICEMAIL' && <Voicemail className="h-3 w-3" />}
                {call.outcome.replace(/_/g, ' ')}
              </span>
            )}
          </GlassCard>
        ))}
      </div>

      <SectionHeader title="Hours & Routing" />
      <GlassCard className="mb-6 space-y-3 text-sm">
        <div className="flex items-center gap-2 text-white/70">
          <Clock className="h-4 w-4 text-cherry-hot" />
          Mon–Sat business hours · Sun closed
        </div>
        <div className="flex flex-wrap gap-2">
          {config.smsEnabled && (
            <span className="rounded-full bg-cherry-royal/20 px-3 py-1 text-xs text-cherry-lavender">
              SMS follow-up on
            </span>
          )}
          {config.voicemailEnabled && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
              Voicemail on
            </span>
          )}
        </div>
        <p className="text-xs text-white/40">
          Urgent calls transfer to {config.transferNumber}. After-hours callers hear your custom message.
        </p>
      </GlassCard>

      <Link href="/ai" className={`block w-full text-center ${CHERRY_LAYOUT.btnGhost}`}>
        Open Cherry AI Assistant
      </Link>

      <p className="mt-4 text-center text-[10px] text-white/30">
        Powered by WISE² AI Phone · Calls sync with your CRM automatically
      </p>
    </div>
  );
}
