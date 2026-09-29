'use client';

import { useEffect, useState } from 'react';
import { LayoutWrapper } from '../layout-wrapper';

interface PhoneDashboard {
  config: { enabled: boolean; phoneNumber: string | null; greeting: string; aiPersona: string };
  stats: { callsToday: number; totalCalls: number; leadsCaptured: number };
  recentCalls: Array<{ id: string; callerNumber: string; callerName: string | null; outcome: string | null; summary: string | null }>;
  capabilities: string[];
}

export default function DashboardPhonePage() {
  const [data, setData] = useState<PhoneDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState('I need to book a service visit this week.');
  const [busy, setBusy] = useState(false);

  const token = typeof window === 'undefined' ? null : localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) {
      setError('Sign in to load the live AI Phone desk.');
      return;
    }

    fetch('/api/v1/business-os/phone', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('AI Phone API is not available on this host.');
        setData(await res.json());
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load AI Phone.'));
  }, [token]);

  const simulate = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch('/api/v1/business-os/phone/simulate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.split('\n').map((line) => line.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Simulate path is unavailable.');
      const refresh = await fetch('/api/v1/business-os/phone', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (refresh.ok) setData(await refresh.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulate failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-[#2cd588]">AI Phone</h1>
        <p className="mt-2 text-sm text-gray-400">
          Live desk against `/api/v1/business-os/phone`. No mock storefront.
        </p>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {data && (
          <div className="mt-6 space-y-4">
            <p className="text-white">
              {data.config.phoneNumber || 'Live PSTN is not configured. Use simulate.'}
            </p>
            <p className="text-gray-300">
              Today {data.stats.callsToday} · Total {data.stats.totalCalls} · Leads {data.stats.leadsCaptured}
            </p>
            <textarea
              value={messages}
              onChange={(event) => setMessages(event.target.value)}
              rows={4}
              className="w-full bg-black/40 border border-[#2cd588]/40 p-3 text-white"
            />
            <button
              type="button"
              onClick={simulate}
              disabled={busy}
              className="bg-[#2cd588] px-4 py-2 text-black font-semibold disabled:opacity-60"
            >
              {busy ? 'Running…' : 'Run simulated call'}
            </button>
            <ul className="space-y-2 text-sm text-gray-300">
              {data.recentCalls.map((call) => (
                <li key={call.id}>
                  {call.callerName || call.callerNumber} · {call.outcome || 'open'} · {call.summary || 'No summary'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
