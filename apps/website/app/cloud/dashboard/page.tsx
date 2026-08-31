'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { getApiBaseUrl } from '@/lib/wise-api';
import { cloudBtnGhost, cloudBtnPrimary, cloudEyebrow, cloudPanel } from '@/lib/cloud-brand';

type CloudService = {
  id: string;
  planId: string;
  domainName: string;
  state: string;
  subscriptionStatus?: string;
  externalServiceId?: string;
};

export default function CloudDashboardPage() {
  const [email, setEmail] = useState('');
  const [services, setServices] = useState<CloudService[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadServices(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/v1/cloud/services?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not load services');
      }
      setServices(data.services ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load services');
    } finally {
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/v1/cloud/portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not open billing portal');
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Portal unavailable');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className={cloudEyebrow}>Customer dashboard</p>
        <h1 className="mt-4 text-4xl font-black">My hosting services</h1>
        <p className="mt-4 text-[#B7C0CB]">
          Look up services by checkout email. Manage billing through Stripe Customer Portal.
        </p>

        <form onSubmit={loadServices} className="mt-8 flex flex-col gap-4 sm:flex-row">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="flex-1 border border-white/10 bg-[#090C10] px-4 py-3 outline-none focus:border-[#4DA3FF]"
          />
          <button type="submit" disabled={loading} className={cloudBtnPrimary}>
            Load services
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

        <div className="mt-8 space-y-4">
          {services.map((service) => (
            <div key={service.id} className={`${cloudPanel} p-5`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={cloudEyebrow}>{service.planId}</p>
                  <h2 className="mt-2 text-xl font-bold">{service.domainName}</h2>
                </div>
                <Link
                  href={`/cloud/order/${service.id}`}
                  className="text-sm font-semibold text-[#8EDBFF] hover:text-white"
                >
                  View status
                </Link>
              </div>
              <p className="mt-3 text-sm text-[#B7C0CB]">
                State: {service.state}
                {service.externalServiceId ? ` · Package ${service.externalServiceId}` : ''}
              </p>
            </div>
          ))}
        </div>

        {services.length > 0 ? (
          <button type="button" onClick={openBillingPortal} disabled={loading} className={`${cloudBtnGhost} mt-8`}>
            Manage billing
          </button>
        ) : null}
      </div>
    </section>
  );
}
