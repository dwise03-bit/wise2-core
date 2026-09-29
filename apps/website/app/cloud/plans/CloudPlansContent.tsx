'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowRight, Check, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
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

const STATIC_PLAN_FALLBACK: CloudPlan[] = CLOUD_PLANS_STATIC.map((plan) => ({
  id: plan.id,
  name: plan.name,
  priceMonthly: plan.price,
  features: plan.features,
  highlight: Boolean(plan.highlight),
  purchasable: false,
  twentyIPackageLabel: 'WISE² Cloud',
}));

export default function CloudPlansContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams?.get('plan');
  const [plans, setPlans] = useState<CloudPlan[]>(STATIC_PLAN_FALLBACK);
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
      .catch(() => setError('Live plan details are temporarily unavailable. You can still review plans and contact support.'));

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
    <section className="cloud-plans-page px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="cloud-plans-hero relative overflow-hidden border border-[#B8FF00]/20 bg-[#070B08] p-6 sm:p-10 lg:p-14">
          <div className="cloud-plans-hero-glow" aria-hidden />
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <p className={cloudEyebrow}>WISE² Cloud / Infrastructure</p>
              <span className="inline-flex items-center gap-2 border border-[#B8FF00]/25 bg-[#B8FF00]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#D7FFA0]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#B8FF00]" aria-hidden />
                Built for uptime
              </span>
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl">
              Infrastructure that keeps your business moving.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#B7C0CB] sm:text-lg">
          Recurring hosting with SSL, email, and backups. Pay through Stripe — WISE² provisions
          your stack automatically.
            </p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ['01', 'Managed setup'],
                ['02', 'Secure by default'],
                ['03', 'Human support'],
              ].map(([number, label]) => (
                <div key={number} className="border-l border-[#B8FF00]/50 pl-3">
                  <p className="text-[10px] font-bold tracking-[0.2em] text-[#B8FF00]">{number}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -right-20 -top-24 hidden h-72 w-72 rounded-full border border-[#B8FF00]/20 lg:block" aria-hidden />
          <div className="absolute -right-6 -top-10 hidden h-56 w-56 rounded-full border border-[#B8FF00]/10 lg:block" aria-hidden />
        </div>

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

        <div className="mt-10 flex items-end justify-between gap-6">
          <div>
            <p className={cloudEyebrow}>Simple monthly plans</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Pick the operating level that fits.</h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-6 text-[#8FA0AE] sm:block">Every plan includes the essentials. Scale when your business is ready.</p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              aria-pressed={selectedPlan === plan.id}
              className={`cloud-plan-card group relative flex min-h-[390px] flex-col p-6 text-left transition sm:p-7 ${selectedPlan === plan.id ? cloudPanelActive : `${cloudPanel} hover:border-[#B8FF00]/40`}`}
            >
              {plan.highlight ? <span className="absolute right-5 top-5 border border-[#B8FF00]/40 bg-[#B8FF00]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#B8FF00]">Most popular</span> : null}
              <div className="flex items-center gap-3">
                <span className={`flex h-9 w-9 items-center justify-center border ${selectedPlan === plan.id ? 'border-[#B8FF00] bg-[#B8FF00] text-[#020403]' : 'border-white/15 text-[#B8FF00]'}`} aria-hidden>
                  {plan.id === 'starter' ? <Sparkles size={16} /> : plan.id === 'business' ? <Gauge size={16} /> : <ShieldCheck size={16} />}
                </span>
                <p className={cloudEyebrow}>{plan.name.replace('WISE² Cloud ', '')}</p>
              </div>
              <h2 className="mt-7 text-5xl font-black tracking-[-0.05em] text-white">
                ${plan.priceMonthly}
                <span className="ml-1 text-base font-medium tracking-normal text-[#8FA0AE]">/mo</span>
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[#B7C0CB]">{CLOUD_PLANS_STATIC.find((item) => item.id === plan.id)?.tagline}</p>
              <div className="my-6 h-px bg-white/10" />
              <ul className="space-y-3 text-sm text-[#D4DAD5]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-[#B8FF00]" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <span className="mt-auto flex items-center gap-2 pt-8 text-xs font-bold uppercase tracking-[0.18em] text-[#B8FF00]">{selectedPlan === plan.id ? 'Selected plan' : 'Select plan'} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>

        <form className={`${cloudPanel} cloud-checkout-panel mt-10 max-w-4xl p-6 sm:p-8`} onSubmit={handleCheckout}>
          <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:items-start">
            <div>
              <p className={cloudEyebrow}>Next step</p>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Launch your WISE² Cloud site.</h2>
              <p className="mt-3 text-sm leading-6 text-[#8FA0AE]">Tell us where to send your setup details. We’ll keep the handoff clear and human.</p>
            </div>
            <div>
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
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
