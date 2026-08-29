'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicFooter } from '@/components/navigation';
import { getDigitalTwinPackage } from '@/lib/digital-twin';

const servicePlans = {
  SERVICE_QUICK_START: { name: 'WISE² Quick Start', price: 99, description: 'Business audit, action plan, and project intake.', billingCycle: 'one_time' },
  SERVICE_LAUNCH: { name: 'WISE² Launch', price: 299, description: 'Premium one-page website, mobile optimization, and lead capture.', billingCycle: 'one_time' },
  SERVICE_BUSINESS_BUILD: { name: 'WISE² Business Build', price: 799, description: 'Website, branding, automation/AI, and business-system setup.', billingCycle: 'one_time' },
  SERVICE_CARE: { name: 'WISE² Care', price: 49, description: 'Ongoing site care and essential support.', billingCycle: 'monthly' },
  SERVICE_GROWTH: { name: 'WISE² Growth', price: 99, description: 'Ongoing optimization, automation support, and growth improvements.', billingCycle: 'monthly' },
} as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const product = searchParams.get('product') || 'platform';
  const planId = searchParams.get('plan') || (product === 'digital-twin' ? 'GROWTH' : 'PRO');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const isDigitalTwin = product === 'digital-twin';
  const isService = product === 'service';
  const twinPlan = getDigitalTwinPackage(planId);
  const servicePlan = servicePlans[planId as keyof typeof servicePlans];
  const plan = isService && servicePlan
    ? servicePlan
    : isDigitalTwin
      ? { name: twinPlan.name, price: twinPlan.price ?? 'Custom', description: twinPlan.description, billingCycle: 'monthly' }
      : { name: 'Professional', price: 99, description: 'For growing businesses', billingCycle: 'monthly' };
  const isOneTime = plan.billingCycle === 'one_time';

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!email || !fullName) throw new Error('Please fill in all fields');
      if (isService && !servicePlan) throw new Error('This service package is not available.');
      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, product, email, fullName, billingCycle: plan.billingCycle,
          successUrl: `${window.location.origin}/checkout/success?product=${product}&plan=${planId}`,
          cancelUrl: `${window.location.origin}/checkout/cancel` }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Failed to create checkout session');
      if (!data.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return <div><main className="min-h-screen bg-[#050607] pb-20 pt-16 text-white"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><div className="grid gap-12 md:grid-cols-2">
    <div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">Secure WISE² Checkout</p><h1 className="mb-3 text-4xl font-black uppercase tracking-[0.05em]">{isService ? 'Start Your WISE² Build' : isDigitalTwin ? 'Build Your Digital Twin' : 'Complete Your Build'}</h1><p className="mb-8 text-[#B7C0CB]">Enter your details and continue to secure payment. Your WISE² onboarding begins after payment.</p>
    <form onSubmit={handleCheckout} className="space-y-6">{error && <div className="border border-red-500 bg-red-500/15 p-4 text-red-200">{error}</div>}
      <label className="block font-semibold">Full Name<input value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-2 w-full border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#8EDBFF]" placeholder="Your name" disabled={loading}/></label>
      <label className="block font-semibold">Email Address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#8EDBFF]" placeholder="you@example.com" disabled={loading}/></label>
      <p className="text-sm leading-6 text-[#8FA0AE]">You’ll be sent to our secure payment processor. WISE² will use these details to start your project onboarding.</p>
      <button disabled={loading} className="w-full bg-[#DCE7EF] px-5 py-4 font-bold uppercase tracking-[0.12em] text-[#050607] hover:bg-white disabled:opacity-50">{loading ? 'Processing...' : 'Continue to Payment'}</button>
      <button type="button" onClick={()=>router.back()} disabled={loading} className="w-full border border-[#8EDBFF]/40 px-5 py-3 font-semibold text-[#8EDBFF]">Back</button>
    </form></div>
    <div><div className="sticky top-28 border border-white/12 bg-[#090C10] p-8"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8EDBFF]">Order Summary</p><h2 className="mt-5 text-2xl font-black">{plan.name}</h2><p className="mt-3 text-sm leading-7 text-[#B7C0CB]">{plan.description}</p><div className="my-8 border-y border-white/10 py-6"><div className="flex items-end justify-between"><span className="text-[#8FA0AE]">Price</span><span className="text-3xl font-black text-[#DCE7EF]">{typeof plan.price === 'number' ? `$${plan.price}` : plan.price}{!isOneTime && typeof plan.price === 'number' && <span className="text-base font-medium text-[#8FA0AE]">/mo</span>}</span></div></div><div className="flex justify-between text-sm"><span className="text-[#8FA0AE]">Billing</span><span className="font-semibold">{isOneTime ? 'One-time' : 'Monthly'}</span></div><div className="mt-6 border border-[#8EDBFF]/25 bg-[#8EDBFF]/5 p-4 text-sm leading-6 text-[#B7C0CB]">✓ Secure checkout<br/>✓ WISE² project onboarding<br/>{isOneTime ? '✓ No recurring charge for this package' : '✓ Recurring WISE² support'}</div></div></div>
  </div></div></main><PublicFooter /></div>;
}

export default function CheckoutPage() { return <Suspense fallback={<div className="min-h-screen bg-[#050607]"/>}><CheckoutContent /></Suspense>; }
