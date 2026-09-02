'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';
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
      if (!response.ok) throw new Error(data.message || 'Checkout failed');

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.orderId) window.location.href = `/cloud/order/${data.orderId}`;
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
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">Put your business on WISE² Cloud.</h1>
        <p className="mt-4 max-w-2xl text-[#B7C0CB]">
          One WISE² experience for hosting, SSL, business email, backups, monitoring and support.
          Choose a plan and we handle the infrastructure behind it.
        </p>

        {checkoutBlocked ? (
          <div className="mt-6 flex items-start gap-3 border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden />
            <div>
              <p className="font-bold">Checkout is being finalized</p>
              <p className="mt-1 text-amber-100/90">WISE² Cloud will not accept a payment until every provisioning launch gate passes.</p>
            </div>
          </div>
        ) : null}

        {plans.some((plan) => plan.testMode) ? (
          <p className="mt-3 text-sm text-amber-300">WISE² Cloud validation mode is active.</p>
        ) : null}

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 text-left transition ${selectedPlan === plan.id ? cloudPanelActive : `${cloudPanel} hover:border-white/20`}`}
            >
              <p className={cloudEyebrow}>{plan.highlight ? 'Most popular' : `WISE² Cloud ${plan.name}`}</p>
              <h2 className="mt-4 text-4xl font-black">${plan.priceMonthly}<span className="text-base text-[#8FA0AE]">/mo</span></h2>
              <p className="mt-2 text-sm text-[#B8FF00]">Managed by WISE²</p>
              <ul className="mt-6 space-y-2 text-sm text-[#B7C0CB]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={14} className="mt-0.5 shrink-0 text-[#B8FF00]" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              {!plan.purchasable ? <p className="mt-6 text-xs uppercase tracking-[0.18em] text-amber-300">Finalizing checkout</p> : null}
            </button>
          ))}
        </div>

        <form className={`${cloudPanel} mt-12 max-w-2xl p-6`} onSubmit={handleCheckout}>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 text-[#B8FF00]" size={22} aria-hidden />
            <div>
              <h2 className="text-xl font-bold">Start your WISE² Cloud service</h2>
              <p className="mt-2 text-sm text-[#8FA0AE]">Your account, billing, provisioning and support stay inside the WISE² customer experience.</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-[#8FA0AE]">Already a customer? <Link href="/cloud/dashboard" className="text-[#B8FF00] hover:text-white">Open WISE² Cloud Dashboard</Link></p>
          <div className="mt-6 grid gap-4">
            <label className="block text-sm">
              <span className="mb-2 block text-[#B7C0CB]">Business email</span>
              <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-white/10 bg-[#050607] px-4 py-3 text-white outline-none focus:border-[#B8FF00]" />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-[#B7C0CB]">Primary domain</span>
              <input required type="text" placeholder="yourbusiness.com" value={domainName} onChange={(event) => setDomainName(event.target.value)} className="w-full border border-white/10 bg-[#050607] px-4 py-3 text-white outline-none focus:border-[#B8FF00]" />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
          <p className="mt-6 text-xs text-[#8FA0AE]">
            By continuing you agree to the <Link href="/terms" className="text-[#B8FF00] hover:text-white">Terms of Service</Link>,{' '}
            <Link href="/cloud/acceptable-use" className="text-[#B8FF00] hover:text-white">Acceptable Use Policy</Link>, and{' '}
            <Link href="/cloud/refunds" className="text-[#B8FF00] hover:text-white">Refund Policy</Link>.
          </p>
          <button type="submit" disabled={loading || Boolean(checkoutBlocked)} className={`${cloudBtnPrimary} mt-6`}>
            {loading ? 'Starting secure checkout...' : checkoutBlocked ? 'Checkout finalizing' : plans.some((p) => p.testMode) ? 'Run validation checkout' : planCta(selectedPlan)}
          </button>
        </form>
      </div>
    </section>
  );
}
