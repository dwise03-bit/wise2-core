'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/wise-api';
import { cloudBtnGhost, cloudBtnPrimary, cloudEyebrow, cloudPanel } from '@/lib/cloud-brand';

type CloudOrder = {
  id: string;
  planId: string;
  email: string;
  domainName: string;
  state: string;
  externalServiceId?: string;
  failureReason?: string;
};

const STATE_COPY: Record<string, string> = {
  pending_payment: 'Waiting for payment',
  paid: 'Payment received',
  queued: 'Queued for provisioning',
  provisioning: 'Setting up your WISE² Cloud service',
  active: 'Your hosting service is active',
  failed: 'Provisioning failed',
  cancelled: 'Order cancelled',
};

const IN_PROGRESS = new Set(['pending_payment', 'paid', 'queued', 'provisioning']);

export default function CloudOrderPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<CloudOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetch(`${getApiBaseUrl()}/v1/cloud/orders/${params.id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Order not found');
        }
        if (active) {
          setOrder(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load order');
        }
      }
    }

    loadOrder();
    const interval = window.setInterval(loadOrder, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [params?.id]);

  const isActive = order?.state === 'active';
  const inProgress = order ? IN_PROGRESS.has(order.state) : false;

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className={cloudEyebrow}>Order status</p>
        <h1 className="mt-4 text-4xl font-black">WISE² Cloud provisioning</h1>

        {error ? <p className="mt-6 text-red-300">{error}</p> : null}

        {!order && !error ? (
          <div className="mt-8 flex items-center gap-3 text-[#B7C0CB]">
            <Loader2 className="animate-spin text-[#4DA3FF]" size={20} aria-hidden />
            Loading order…
          </div>
        ) : null}

        {order ? (
          <>
            {isActive ? (
              <div className={`${cloudPanel} mt-8 flex items-start gap-4 border-[#4DA3FF]/40 p-6`}>
                <CheckCircle2 className="shrink-0 text-[#4DA3FF]" size={28} aria-hidden />
                <div>
                  <p className="font-bold text-white">You&apos;re live on WISE² Cloud</p>
                  <p className="mt-2 text-sm text-[#B7C0CB]">
                    {order.domainName} is provisioned. Log in to your hosting stack with the
                    credentials from your welcome email, or manage billing anytime.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/cloud/dashboard" className={cloudBtnPrimary}>
                      My services
                    </Link>
                    <Link href="/cloud/plans" className={cloudBtnGhost}>
                      Add another site
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={`${cloudPanel} mt-8 p-6`}>
              <div className="flex items-center gap-3">
                {inProgress ? (
                  <Loader2 className="animate-spin text-[#4DA3FF]" size={18} aria-hidden />
                ) : null}
                <p className={cloudEyebrow}>{STATE_COPY[order.state] ?? order.state}</p>
              </div>
              {inProgress ? (
                <p className="mt-3 text-sm text-[#8FA0AE]">
                  This page refreshes every 5 seconds while we finish setup.
                </p>
              ) : null}
              <dl className="mt-6 space-y-4 text-sm text-[#B7C0CB]">
                <div>
                  <dt className="text-white">Plan</dt>
                  <dd className="mt-1 capitalize">{order.planId}</dd>
                </div>
                <div>
                  <dt className="text-white">Domain</dt>
                  <dd className="mt-1">{order.domainName}</dd>
                </div>
                <div>
                  <dt className="text-white">Email</dt>
                  <dd className="mt-1">{order.email}</dd>
                </div>
                {order.externalServiceId ? (
                  <div>
                    <dt className="text-white">Hosting package</dt>
                    <dd className="mt-1">{order.externalServiceId}</dd>
                  </div>
                ) : null}
                {order.failureReason ? (
                  <div>
                    <dt className="text-white">Failure</dt>
                    <dd className="mt-1 text-red-300">{order.failureReason}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
