'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicFooter } from '@/components/navigation';
import { DASHBOARD_URL } from '@/lib/urls';
import { getDigitalTwinPackage } from '@/lib/digital-twin';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const product = searchParams.get('product') || 'platform';
  const planId = searchParams.get('plan');
  const isDigitalTwin = product === 'digital-twin';
  const twinPlan = getDigitalTwinPackage(planId);

  return (
    <>
      <main className="bg-[#050505] min-h-screen pt-32 pb-20 flex items-center justify-center text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-7xl mb-8 animate-bounce">✓</div>

            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-[0.08em] text-white mb-4">
              {isDigitalTwin ? 'Digital Twin ' : 'Payment '}
              <span className="text-[#C7FF2E]">Activated!</span>
            </h1>

            <p className="text-xl text-[#B7BDC8] mb-8">
              {isDigitalTwin
                ? `${twinPlan.name} is now moving into tenant setup, onboarding, and approval-controlled training.`
                : 'Welcome to WISE². Your build is active. Let’s get your system set up.'}
            </p>

            <div className="bg-white/[0.04] border-2 border-[#C7FF2E]/30 rounded-3xl p-8 md:p-12 mb-8">
              <div className="space-y-6 text-left">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Build Status</p>
                  <p className="text-2xl font-bold text-[#C7FF2E]">
                    {isDigitalTwin ? 'Provisioning + Onboarding' : 'Active ✓'}
                  </p>
                </div>

                <div className="border-t border-[#C7FF2E]/20 pt-6">
                  <p className="text-gray-300 text-sm mb-4 font-semibold">Here&apos;s what happens next:</p>
                  <ul className="space-y-4">
                    <SuccessStep
                      number="1"
                      title={isDigitalTwin ? 'Attach the twin to your tenant' : 'Complete your business setup'}
                      body={
                        isDigitalTwin
                          ? 'We keep the Digital Twin scoped to the purchasing tenant so knowledge, approvals, and automation boundaries stay isolated.'
                          : 'Takes about 5 minutes and helps us configure WISE² for you.'
                      }
                    />
                    <SuccessStep
                      number="2"
                      title={isDigitalTwin ? 'Run onboarding, consent, and training' : 'A WISE² consultant will reach out'}
                      body={
                        isDigitalTwin
                          ? 'Configure business knowledge, brand voice, sales rules, and any authorized voice or likeness capabilities.'
                          : 'We review your setup and schedule your implementation call.'
                      }
                    />
                    <SuccessStep
                      number="3"
                      title={isDigitalTwin ? 'Test, approve, and activate' : 'Enter the WISE² system'}
                      body={
                        isDigitalTwin
                          ? 'Use the test lab, approvals, and command center to verify the twin before public-facing actions go live.'
                          : 'Your AI operating system goes live.'
                      }
                    />
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href={isDigitalTwin ? '/services/digital-twin/start' : '/onboarding'}
                className="px-8 py-4 bg-[#C7FF2E] text-[#050505] rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 inline-block"
                style={{ boxShadow: '0 0 24px rgba(199,255,46,0.4)' }}
              >
                {isDigitalTwin ? 'START DIGITAL TWIN ONBOARDING →' : 'SET UP MY BUILD →'}
              </Link>
              <a
                href={isDigitalTwin ? '/dashboard/digital-twin' : DASHBOARD_URL}
                className="px-8 py-4 bg-white/[0.04] border-2 border-[#C7FF2E]/40 text-[#C7FF2E] rounded-lg font-bold text-lg hover:border-[#C7FF2E]/60 transition-all duration-300 inline-block"
              >
                {isDigitalTwin ? 'Open Command Center' : 'Go to System'}
              </a>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}

function SuccessStep({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
        style={{ background: 'rgba(199,255,46,0.2)', color: '#C7FF2E' }}
      >
        {number}
      </div>
      <div>
        <p className="text-white font-semibold">{title}</p>
        <p className="text-gray-400 text-sm">{body}</p>
      </div>
    </li>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
