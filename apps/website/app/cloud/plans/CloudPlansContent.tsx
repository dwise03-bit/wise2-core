'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/wise-api';
import {
  CLOUD_PLANS_STATIC,
  cloudBtnPrimary,
  cloudEyebrow,
  cloudPanel,
  cloudPanelActive,
} from '@/lib/cloud-brand';

type CloudPlan = {
  id: 'starter' | 'business' | 'pro';
  name: string;
  priceMonthly: number;
  features: string[];
  highlight: boolean;
  purchasable: boolean;
  twentyIPackageLabel: string;
  testMode?: boolean;
};

type LaunchStatus = {
  ready: boolean;
  storefrontLive: boolean;
  gates: Array<{ id: string; label: string; status: string; detail: string }>;
};

function planCta(planId: CloudPlan['id']) {
  return CLOUD_PLANS_STATIC.find((plan) => plan.id === planId)?.cta ?? 'Continue';
}

export default function CloudPlansContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan');
  const [plans, setPlans] = useState<CloudPlan[]>([]);
  const [launch, setLaunch] = useState<LaunchStatus | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<CloudPlan['id']>(
    initialPlan === 'starter' || initialPlan === 'business' || initialPlan === 'pro'
      ? initialPlan
      : 'business',
  );
  const [email, setEmail] = useState('');
  const [domainName, setDomainName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const api = getApiBaseUrl();
    fetch(`${api}/v1/cloud/plans`)
      .then((response) => response.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setError('Could not load WISE² Cloud plans.'));

    fetch(`${api}/v1/cloud/launch-status`)
      .then((response) => response.json())
      .then((data) => setLaunch(data))
      .catch(() => undefined);
  }, []);

  const checkoutBlocked = launch && !launch.storefrontLive && !plans.some((plan) => plan.testMode);

  async function handleCheckout(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${getApiBaseUrl()}/v1/cloud/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, email, domainName }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.orderId) {
        window.location.href = `/cloud/order/${data.orderId}`;
      }
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className={cloudEyebrow}>WISE² Cloud Plans</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">Choose your hosting plan</h1>
        <p className="mt-4 max-w-2xl text-[#B7C0CB]">
          Recurring hosting with SSL, email, and backups. Pay through Stripe — WISE² provisions
          your stack automatically.
        </p>

        {checkoutBlocked ? (
          <div className="mt-6 flex items-start gap-3 border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden />
            <div>
              <p className="font-bold">Storefront not live yet</p>
              <p className="mt-1 text-amber-100/90">
                Checkout is disabled until launch gates pass.{' '}
                <Link href="/cloud/status" className="underline hover:text-white">
                  View launch status
                </Link>
              </p>
            </div>
          </div>
        ) : null}

        {plans.some((plan) => plan.testMode) ? (
          <p className="mt-3 text-sm text-amber-300">Test mode enabled — checkout skips Stripe.</p>
        ) : null}

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 text-left transition ${selectedPlan === plan.id ? cloudPanelActive : `${cloudPanel} hover:border-white/20`}`}
            >
              <p className={cloudEyebrow}>{plan.highlight ? 'Most popular' : plan.name}</p>
              <h2 className="mt-4 text-4xl font-black">
                ${plan.priceMonthly}
                <span className="text-base text-[#8FA0AE]">/mo</span>
              </h2>
              <p className="mt-2 text-sm text-[#8EDBFF]">{plan.twentyIPackageLabel}</p>
              <ul className="mt-6 space-y-2 text-sm text-[#B7C0CB]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-[#4DA3FF]" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              {!plan.purchasable ? (
                <p className="mt-6 text-xs uppercase tracking-[0.18em] text-amber-300">
                  Checkout configuring…
                </p>
              ) : null}
            </button>
          ))}
        </div>

        <form className={`${cloudPanel} mt-12 max-w-2xl p-6`} onSubmit={handleCheckout}>
          <h2 className="text-xl font-bold">Launch your WISE² Cloud site</h2>
          <p className="mt-2 text-sm text-[#8FA0AE]">
            Already a customer?{' '}
            <Link href="/cloud/dashboard" className="text-[#8EDBFF] hover:text-white">
              View my services
            </Link>
          </p>
          <div className="mt-6 grid gap-4">
            <label className="block text-sm">
              <span className="mb-2 block text-[#B7C0CB]">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full border border-white/10 bg-[#050607] px-4 py-3 text-white outline-none focus:border-[#4DA3FF]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-[#B7C0CB]">Primary domain</span>
              <input
                required
                type="text"
                placeholder="yourdomain.com"
                value={domainName}
                onChange={(event) => setDomainName(event.target.value)}
                className="w-full border border-white/10 bg-[#050607] px-4 py-3 text-white outline-none focus:border-[#4DA3FF]"
              />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
          <p className="mt-6 text-xs text-[#8FA0AE]">
            By continuing you agree to the{' '}
            <Link href="/terms" className="text-[#8EDBFF] hover:text-white">
              Terms of Service
            </Link>
            ,{' '}
            <Link href="/cloud/acceptable-use" className="text-[#8EDBFF] hover:text-white">
              Acceptable Use Policy
            </Link>
            , and{' '}
            <Link href="/cloud/refunds" className="text-[#8EDBFF] hover:text-white">
              Refund Policy
            </Link>
            .
          </p>
          <button
            type="submit"
            disabled={loading || Boolean(checkoutBlocked)}
            className={`${cloudBtnPrimary} mt-6`}
          >
            {loading
              ? 'Starting checkout...'
              : checkoutBlocked
                ? 'Checkout not live'
                : plans.some((p) => p.testMode)
                  ? 'Start test checkout'
                  : planCta(selectedPlan)}
          </button>
        </form>
      </div>
    </section>
  );
}
