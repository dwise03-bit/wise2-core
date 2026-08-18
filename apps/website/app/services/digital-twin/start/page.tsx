'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { digitalTwinOnboardingSteps } from '@/lib/digital-twin';

const INITIAL_FORM = {
  businessName: '',
  owner: '',
  contactEmail: '',
  website: '',
  industry: '',
  tone: '',
  phrases: '',
  services: '',
  faqs: '',
  salesRules: '',
  escalationContact: '',
  voiceConsent: false,
  videoConsent: false,
};

export default function DigitalTwinStartPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / digitalTwinOnboardingSteps.length) * 100, [step]);
  const current = digitalTwinOnboardingSteps[step];

  const update = (field: keyof typeof INITIAL_FORM, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAdvance = async () => {
    if (step < digitalTwinOnboardingSteps.length - 1) {
      setStep((currentStep) => Math.min(digitalTwinOnboardingSteps.length - 1, currentStep + 1));
      return;
    }

    try {
      setSubmitting(true);
      setSubmitMessage(null);

      const response = await fetch('/api/digital-twin/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: 'GROWTH',
          businessName: form.businessName,
          owner: form.owner,
          website: form.website,
          industry: form.industry,
          tone: form.tone,
          phrases: form.phrases,
          services: form.services,
          faqs: form.faqs,
          salesRules: form.salesRules,
          escalationContact: form.escalationContact,
          voiceConsent: form.voiceConsent,
          videoConsent: form.videoConsent,
          email: form.contactEmail,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit Digital Twin intake');
      }

      setSubmitMessage(`Intake saved for tenant ${data.tenantSlug}. Your Digital Twin is now in onboarding.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit intake';
      setSubmitMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-[#F4EBDD]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="rounded-[2rem] border border-[#F4EBDD]/10 bg-white/[0.03] p-7">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Digital Twin Onboarding</p>
              <h1 className="mt-4 text-4xl font-black uppercase">Start your build.</h1>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-[#39FF14]" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#bfb5a6]">
                Step {step + 1} of {digitalTwinOnboardingSteps.length}
              </p>
              <div className="mt-8 space-y-3">
                {digitalTwinOnboardingSteps.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border px-4 py-4 ${
                      index === step
                        ? 'border-[#39FF14]/45 bg-[#39FF14]/10'
                        : 'border-[#F4EBDD]/10 bg-black/20'
                    }`}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#39FF14]">{String(index + 1).padStart(2, '0')}</p>
                    <p className="mt-1 font-black uppercase text-[#F4EBDD]">{item.label}</p>
                    <p className="mt-1 text-xs leading-6 text-[#bdb3a4]">{item.description}</p>
                  </div>
                ))}
              </div>
            </aside>

            <section className="rounded-[2rem] border border-[#39FF14]/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">{current.label}</p>
              <h2 className="mt-3 text-4xl font-black uppercase">{current.description}</h2>

              <div className="mt-8 space-y-6">
                {step === 0 && (
                  <>
                    <Input label="Business name" value={form.businessName} onChange={(value) => update('businessName', value)} />
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input label="Owner / operator" value={form.owner} onChange={(value) => update('owner', value)} />
                      <Input label="Contact email" value={form.contactEmail} onChange={(value) => update('contactEmail', value)} />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <Input label="Website" value={form.website} onChange={(value) => update('website', value)} />
                      <Input label="Industry" value={form.industry} onChange={(value) => update('industry', value)} />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <Input label="Preferred tone" value={form.tone} onChange={(value) => update('tone', value)} />
                    <Textarea label="Signature phrases / vocabulary" value={form.phrases} onChange={(value) => update('phrases', value)} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <Textarea label="Core services and offers" value={form.services} onChange={(value) => update('services', value)} />
                    <Textarea label="FAQs, policies, SOPs, pricing notes" value={form.faqs} onChange={(value) => update('faqs', value)} />
                  </>
                )}

                {step === 3 && (
                  <div className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-6 text-sm leading-7 text-[#d5cbbb]">
                    WISE² will generate a writing profile from your approved examples, then give you three actions before activation: <span className="font-black text-[#39FF14]">APPROVE</span>, <span className="font-black text-[#39FF14]">EDIT</span>, or <span className="font-black text-[#39FF14]">REGENERATE</span>.
                  </div>
                )}

                {step === 4 && (
                  <ConsentCard
                    title="Voice cloning authorization"
                    description="Explicit consent is required before approved synthetic voice can be used for narration, marketing, training, or permitted customer communication."
                    checked={form.voiceConsent}
                    onChange={(checked) => update('voiceConsent', checked)}
                  />
                )}

                {step === 5 && (
                  <ConsentCard
                    title="Video likeness authorization"
                    description="Avatar and likeness workflows must be tied to approved assets, provenance, intended uses, and revocation controls."
                    checked={form.videoConsent}
                    onChange={(checked) => update('videoConsent', checked)}
                  />
                )}

                {step === 6 && (
                  <Textarea label="Sales rules, objections, pricing boundaries, booking rules" value={form.salesRules} onChange={(value) => update('salesRules', value)} />
                )}

                {step === 7 && (
                  <Textarea label="Escalation contact, complaint routing, emergency instructions" value={form.escalationContact} onChange={(value) => update('escalationContact', value)} />
                )}

                {step === 8 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      'Write a Facebook post',
                      'Respond to a pricing lead',
                      'Answer a warranty question',
                      'Create an appointment follow-up',
                      'Handle an angry customer',
                      'Generate a 30-second script',
                    ].map((scenario) => (
                      <div key={scenario} className="rounded-2xl border border-[#F4EBDD]/10 bg-black/20 p-5 text-sm font-semibold uppercase tracking-[0.08em] text-[#F4EBDD]">
                        {scenario}
                      </div>
                    ))}
                  </div>
                )}

                {step === 9 && (
                  <div className="rounded-[1.5rem] border border-[#39FF14]/20 bg-[#0c120c] p-6">
                    <h3 className="text-2xl font-black uppercase text-[#F4EBDD]">Activation checklist</h3>
                    <ul className="mt-5 space-y-3 text-sm leading-7 text-[#d5cbbb]">
                      <li>• Consent complete</li>
                      <li>• Required profiles approved</li>
                      <li>• Safety rules configured</li>
                      <li>• Escalation contact configured</li>
                      <li>• Approval boundaries confirmed</li>
                    </ul>
                    <Link
                      href="/dashboard/digital-twin"
                      className="mt-6 inline-flex rounded-2xl bg-[#39FF14] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#050505]"
                    >
                      Preview Command Center
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
                  disabled={step === 0}
                  className="rounded-2xl border border-[#F4EBDD]/15 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#F4EBDD] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleAdvance}
                  disabled={submitting}
                  className="rounded-2xl bg-[#39FF14] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#050505] disabled:opacity-60"
                >
                  {step === digitalTwinOnboardingSteps.length - 1 ? (submitting ? 'Submitting...' : 'Ready for Activation') : 'Next Step'}
                </button>
              </div>
              {submitMessage && (
                <div className="mt-6 rounded-2xl border border-[#F4EBDD]/10 bg-black/20 px-5 py-4 text-sm font-semibold text-[#F4EBDD]">
                  {submitMessage}
                </div>
              )}
            </section>
          </div>
        </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-[#39FF14]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[#F4EBDD]/14 bg-black/25 px-4 py-4 text-base text-[#F4EBDD] outline-none transition focus:border-[#39FF14]/60"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-[#39FF14]">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[160px] w-full rounded-2xl border border-[#F4EBDD]/14 bg-black/25 px-4 py-4 text-base text-[#F4EBDD] outline-none transition focus:border-[#39FF14]/60"
      />
    </label>
  );
}

function ConsentCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#F4EBDD]/10 bg-black/20 p-6">
      <h3 className="text-2xl font-black uppercase text-[#F4EBDD]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#d5cbbb]">{description}</p>
      <label className="mt-6 flex items-center gap-3 text-sm font-black uppercase tracking-[0.14em] text-[#39FF14]">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5" />
        Authorization captured
      </label>
    </div>
  );
}
