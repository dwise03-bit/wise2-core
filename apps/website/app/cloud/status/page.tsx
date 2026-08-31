'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cloudEyebrow, cloudPanel } from '@/lib/cloud-brand';
import { getApiBaseUrl } from '@/lib/wise-api';

type LaunchGate = {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'manual';
  detail: string;
};

type LaunchStatus = {
  ready: boolean;
  storefrontLive: boolean;
  cloudBaseUrl: string;
  gates: LaunchGate[];
  provider: { ok: boolean; name: string; packageTypeCount: number };
};

function statusColor(status: LaunchGate['status']) {
  if (status === 'pass') {
    return 'text-[#3DFF9A]';
  }
  if (status === 'fail') {
    return 'text-red-300';
  }
  return 'text-amber-300';
}

export default function CloudLaunchStatusPage() {
  const [status, setStatus] = useState<LaunchStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${getApiBaseUrl()}/v1/cloud/launch-status`)
      .then((response) => response.json())
      .then((data) => setStatus(data))
      .catch(() => setError('Could not reach WISE² Cloud API.'));
  }, []);

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className={cloudEyebrow}>Internal launch checklist</p>
        <h1 className="mt-4 text-4xl font-black">WISE² Cloud launch status</h1>
        <p className="mt-4 text-[#B7C0CB]">
          Do not set <code className="text-[#8EDBFF]">CLOUD_STOREFRONT_LIVE=true</code> until every
          revenue-critical gate passes.
        </p>

        {error ? <p className="mt-6 text-red-300">{error}</p> : null}

        {status ? (
          <>
            <div className={`${cloudPanel} mt-8 p-6`}>
              <p className="text-sm text-[#8FA0AE]">Overall readiness</p>
              <p
                className={`mt-2 text-3xl font-black ${status.ready ? 'text-[#3DFF9A]' : 'text-amber-300'}`}
              >
                {status.ready ? 'READY FOR LIVE SALES' : 'NOT READY — CHECKOUT BLOCKED'}
              </p>
              <p className="mt-2 text-sm text-[#B7C0CB]">
                Storefront: {status.storefrontLive ? 'LIVE' : 'PRIVATE'} · API provider:{' '}
                {status.provider.ok ? 'OK' : 'FAIL'} · URL: {status.cloudBaseUrl}
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {status.gates.map((gate) => (
                <li key={gate.id} className={`${cloudPanel} p-4`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold">{gate.label}</span>
                    <span className={`text-xs font-bold uppercase tracking-[0.2em] ${statusColor(gate.status)}`}>
                      {gate.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#8FA0AE]">{gate.detail}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <Link href="/cloud/plans" className="mt-8 inline-block text-sm text-[#8EDBFF] hover:text-white">
          Back to plans
        </Link>
      </div>
    </section>
  );
}
