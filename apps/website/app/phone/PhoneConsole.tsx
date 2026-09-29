'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBrowserAuthToken } from '@/lib/auth-session';

interface PhoneConfig {
  enabled: boolean;
  phoneNumber: string | null;
  greeting: string;
  aiPersona: string;
}

interface PhoneCall {
  id: string;
  callerNumber: string;
  callerName: string | null;
  status: string;
  durationSeconds: number | null;
  intent: string | null;
  outcome: string | null;
  summary: string | null;
  startedAt: string;
}

interface PhoneDashboard {
  config: PhoneConfig;
  stats: {
    callsToday: number;
    totalCalls: number;
    avgDurationSeconds: number;
    leadsCaptured: number;
    aiActive: boolean;
  };
  recentCalls: PhoneCall[];
  capabilities: string[];
  poweredBy: string;
}

interface SimulateTurn {
  userMessage: string;
  response: string;
  shouldTransfer: boolean;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function PhoneConsole() {
  const [token, setToken] = useState<string | null>(null);
  const [health, setHealth] = useState<{ status?: string; voice?: string } | null>(null);
  const [dashboard, setDashboard] = useState<PhoneDashboard | null>(null);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [simulateText, setSimulateText] = useState('I need to book a service visit this week.');
  const [turns, setTurns] = useState<SimulateTurn[]>([]);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    setToken(getBrowserAuthToken());

    fetch('/api/v1/ai-phone/health')
      .then(async (res) => {
        setApiReady(res.ok);
        if (res.ok) setHealth(await res.json());
      })
      .catch(() => setApiReady(false));
  }, []);

  useEffect(() => {
    if (!token) return;

    fetch('/api/v1/business-os/phone', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          setError('Sign in to load your live call desk.');
          return;
        }
        if (res.status === 404) {
          setApiReady(false);
          setError('AI Phone routes are not in the running API image yet.');
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(typeof body.message === 'string' ? body.message : 'Could not load AI Phone.');
          return;
        }
        const data = (await res.json()) as PhoneDashboard;
        setDashboard(data);
        setGreeting(data.config.greeting);
        setApiReady(true);
      })
      .catch(() => setError('Could not reach the AI Phone API.'));
  }, [token]);

  const livePstn = Boolean(dashboard?.config.phoneNumber);
  const voiceMode = health?.voice === 'openai' ? 'OpenAI voice' : 'Simulated voice';

  const saveGreeting = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/business-os/phone', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ greeting }),
      });
      if (!res.ok) {
        throw new Error('Could not save greeting.');
      }
      const data = (await res.json()) as { config: PhoneConfig };
      setDashboard((current) => (current ? { ...current, config: { ...current.config, ...data.config } } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save greeting.');
    } finally {
      setSaving(false);
    }
  };

  const runSimulate = async () => {
    if (!token) return;
    const messages = simulateText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!messages.length) return;

    setSimulating(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/business-os/phone/simulate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) {
        throw new Error('Simulate path is unavailable on this API.');
      }
      const data = (await res.json()) as { conversation?: SimulateTurn[] };
      setTurns(data.conversation || []);
      const refresh = await fetch('/api/v1/business-os/phone', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refresh.ok) {
        const next = (await refresh.json()) as PhoneDashboard;
        setDashboard(next);
        setGreeting(next.config.greeting);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulate failed.');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <section className="border-b border-white/10 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">WISE² AI Phone</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight sm:text-6xl">
            The receptionist that writes back into the OS.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#B7C0CB]">
            Answer inbound calls, capture leads, and keep a real call log. This page hits the live
            WISE² API, not a mock storefront.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em]">
            <span className="border border-white/15 px-3 py-2 text-[#DCE7EF]">
              API {apiReady === null ? 'checking' : apiReady ? 'reachable' : 'missing'}
            </span>
            <span className="border border-white/15 px-3 py-2 text-[#DCE7EF]">{voiceMode}</span>
            <span className="border border-white/15 px-3 py-2 text-[#DCE7EF]">
              {livePstn ? 'Line configured' : 'Live PSTN not configured'}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        {error && (
          <p className="mb-6 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
        )}

        {!token && (
          <div className="mb-10 border border-white/10 bg-[#090C10] p-6">
            <h2 className="text-2xl font-black">Sign in to test the live desk</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#B7C0CB]">
              After login, this page loads your tenant config, recent calls, and the simulate path
              at <code>/api/v1/business-os/phone</code>.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login?next=/phone"
                className="inline-flex min-h-12 items-center bg-[#DCE7EF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607]"
              >
                Sign in
              </Link>
              <a
                href="/cherry-count/phone"
                className="inline-flex min-h-12 items-center border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white"
              >
                Open Cherry Count desk
              </a>
            </div>
          </div>
        )}

        {dashboard && (
          <>
            <div className="mb-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-4">
              {[
                ['Calls today', String(dashboard.stats.callsToday)],
                ['Total calls', String(dashboard.stats.totalCalls)],
                ['Leads captured', String(dashboard.stats.leadsCaptured)],
                ['Avg duration', formatDuration(dashboard.stats.avgDurationSeconds)],
              ].map(([label, value]) => (
                <article key={label} className="bg-[#090C10] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8FA0AE]">{label}</p>
                  <p className="mt-3 text-3xl font-black">{value}</p>
                </article>
              ))}
            </div>

            <div className="mb-10 grid gap-px overflow-hidden border border-white/10 bg-white/10 lg:grid-cols-2">
              <article className="bg-[#090C10] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8EDBFF]">Line</p>
                <h2 className="mt-4 text-2xl font-black">{dashboard.config.aiPersona}</h2>
                <p className="mt-3 text-sm text-[#B7C0CB]">
                  {dashboard.config.phoneNumber ||
                    'No Twilio number is assigned. Use simulate below — live PSTN is not configured.'}
                </p>
                <textarea
                  value={greeting}
                  onChange={(event) => setGreeting(event.target.value)}
                  rows={5}
                  className="mt-5 w-full border border-white/15 bg-[#050607] px-3 py-2 text-sm text-[#DCE7EF] outline-none focus:ring-2 focus:ring-[#8EDBFF]"
                />
                <button
                  type="button"
                  onClick={saveGreeting}
                  disabled={saving}
                  className="mt-4 min-h-11 bg-[#DCE7EF] px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#050607] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save greeting'}
                </button>
              </article>

              <article className="bg-[#090C10] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8EDBFF]">Simulate a call</p>
                <h2 className="mt-4 text-2xl font-black">Talk to the API</h2>
                <p className="mt-3 text-sm leading-7 text-[#B7C0CB]">
                  One line per caller turn. This writes a real call record through
                  <code className="mx-1">POST /api/v1/business-os/phone/simulate</code>.
                </p>
                <textarea
                  value={simulateText}
                  onChange={(event) => setSimulateText(event.target.value)}
                  rows={5}
                  className="mt-5 w-full border border-white/15 bg-[#050607] px-3 py-2 text-sm text-[#DCE7EF] outline-none focus:ring-2 focus:ring-[#8EDBFF]"
                />
                <button
                  type="button"
                  onClick={runSimulate}
                  disabled={simulating}
                  className="mt-4 min-h-11 bg-[#DCE7EF] px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#050607] disabled:opacity-60"
                >
                  {simulating ? 'Running…' : 'Run simulated call'}
                </button>
              </article>
            </div>
          </>
        )}

        {turns.length > 0 && (
          <div className="mb-10 border border-white/10 bg-[#090C10] p-6">
            <h2 className="text-xl font-black">Last simulated conversation</h2>
            <ol className="mt-4 space-y-4">
              {turns.map((turn, index) => (
                <li key={`${turn.userMessage}-${index}`} className="border-l border-[#8EDBFF]/40 pl-4">
                  <p className="text-sm text-[#8FA0AE]">Caller</p>
                  <p className="mt-1 text-sm text-white">{turn.userMessage}</p>
                  <p className="mt-3 text-sm text-[#8FA0AE]">AI Phone</p>
                  <p className="mt-1 text-sm text-[#DCE7EF]">{turn.response}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2">
          {(dashboard?.capabilities || [
            'Answer inbound calls 24/7 with a custom greeting',
            'Identify existing customers from caller ID',
            'Capture leads and book appointments',
            'Send SMS follow-ups after the call',
            'Transfer urgent callers to a human',
            'Take after-hours voicemail',
          ]).map((capability) => (
            <article key={capability} className="bg-[#090C10] p-5 text-sm leading-7 text-[#B7C0CB]">
              {capability}
            </article>
          ))}
        </div>

        {dashboard?.recentCalls?.length ? (
          <div className="mt-10 border border-white/10">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-xl font-black">Recent calls</h2>
            </div>
            <ul>
              {dashboard.recentCalls.map((call) => (
                <li key={call.id} className="border-b border-white/10 px-5 py-4 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{call.callerName || call.callerNumber}</p>
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8FA0AE]">
                      {call.outcome || call.status}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-[#B7C0CB]">
                    {call.summary || call.intent || 'No summary yet'} · {formatDuration(call.durationSeconds)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-10 text-sm text-[#6F7D89]">
          {dashboard?.poweredBy || 'WISE² AI Phone'} · Live PSTN requires Twilio account, auth token, and
          an assigned number. Until those exist, use this simulate desk.
        </p>
      </section>
    </main>
  );
}
