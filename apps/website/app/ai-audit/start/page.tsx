'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { type AuditInput, type AuditResult } from '@/lib/ai-audit';
import type { Dispatch, SetStateAction } from 'react';

const initialForm: AuditInput = {
  businessName: '',
  contactName: '',
  email: '',
  website: '',
  industry: '',
  teamSize: '',
  revenueRange: '',
  primaryProblem: '',
  currentTools: '',
  priorityWorkflow: '',
};

type StringSetter = Dispatch<SetStateAction<string>>;

export default function AiAuditStartPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: keyof AuditInput, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const canAdvance = step === 1 ? !!form.businessName && !!form.contactName && !!form.email : !!form.industry && !!form.primaryProblem;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/ai-audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to generate your snapshot.');
      setResult(data.result);
      sessionStorage.setItem(`wise2-audit:${data.result.id}`, JSON.stringify({ form, result: data.result }));
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to generate your snapshot.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-[#050607] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#39FF14]">Your opportunity snapshot</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border border-[#39FF14]/40 bg-[#0A0E12] p-8">
              <p className="text-sm text-[#9AA6B2]">AI opportunity score</p>
              <p className="mt-2 text-8xl font-black text-[#39FF14]">{result.score}</p>
              <p className="text-sm text-[#9AA6B2]">out of 100</p>
              <p className="mt-8 text-sm leading-6 text-[#C7D0DB]">{result.summary}</p>
            </div>
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">Where WISE² sees leverage</h1>
              <div className="mt-6 space-y-4">
                {result.opportunities.map((opportunity) => (
                  <div key={opportunity.title} className="border border-white/10 bg-[#0A0E12] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-bold">{opportunity.title}</p>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0094FF]">{opportunity.priority}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#39FF14]">{opportunity.capability}</p>
                    <p className="mt-2 text-sm leading-6 text-[#AAB5C2]">{opportunity.rationale}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 border border-[#0094FF]/40 bg-[#0094FF]/10 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0094FF]">Recommended next move</p>
                <h2 className="mt-2 text-2xl font-black">{result.nextStep}</h2>
                <p className="mt-2 text-sm leading-6 text-[#C7D0DB]">Get a full live review, prioritized report, and 90-day roadmap for $149.</p>
                <Link href="/consulting/audit" className="mt-5 inline-flex items-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#050607]">See the deep-dive audit <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050607] px-5 py-12 text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/ai-audit" className="inline-flex items-center gap-2 text-sm text-[#9AA6B2] hover:text-white"><ArrowLeft size={16} /> Back to audit overview</Link>
        <div className="mt-10 flex items-end justify-between gap-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-[#39FF14]">Free snapshot</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Let&apos;s locate the leverage.</h1></div>
          <span className="text-sm text-[#9AA6B2]">Step {step} of 2</span>
        </div>
        <div className="mt-7 h-1 bg-white/10"><div className="h-1 bg-[#39FF14] transition-all" style={{ width: `${step * 50}%` }} /></div>

        <form onSubmit={submit} className="mt-10 border border-white/10 bg-[#0A0E12] p-6 sm:p-10">
          {step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Business name *" value={form.businessName} onChange={(value) => update('businessName', value)} />
              <Field label="Your name *" value={form.contactName} onChange={(value) => update('contactName', value)} />
              <Field label="Work email *" type="email" value={form.email} onChange={(value) => update('email', value)} />
              <Field label="Website" value={form.website} onChange={(value) => update('website', value)} />
              <SelectField label="Team size" value={form.teamSize} onChange={(value) => update('teamSize', value)} options={['Solo', '2-5', '6-20', '21-50', '50+']} />
              <SelectField label="Annual revenue" value={form.revenueRange} onChange={(value) => update('revenueRange', value)} options={['Pre-revenue', 'Under $250k', '$250k-$1m', '$1m+']} />
            </div>
          ) : (
            <div className="space-y-5">
              <Field label="Industry *" value={form.industry} onChange={(value) => update('industry', value)} />
              <TextField label="What is slowing the business down right now? *" value={form.primaryProblem} onChange={(value) => update('primaryProblem', value)} />
              <Field label="Which workflow would you fix first?" value={form.priorityWorkflow} onChange={(value) => update('priorityWorkflow', value)} />
              <Field label="What tools or systems do you use today?" value={form.currentTools} onChange={(value) => update('currentTools', value)} />
            </div>
          )}

          {error && <p className="mt-5 border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-200" role="alert">{error}</p>}
          <div className="mt-8 flex justify-between gap-4">
            <button type="button" onClick={() => setStep(1)} disabled={step === 1} className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-sm font-bold text-[#C7D0DB] disabled:opacity-30"><ArrowLeft size={16} /> Back</button>
            {step === 1 ? <button type="button" onClick={() => setStep(2)} disabled={!canAdvance} className="inline-flex items-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-black text-[#050607] disabled:cursor-not-allowed disabled:opacity-40">Continue <ArrowRight size={16} /></button> : <button type="submit" disabled={!canAdvance || loading} className="inline-flex items-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-black text-[#050607] disabled:cursor-not-allowed disabled:opacity-40">{loading ? <><Loader2 className="animate-spin" size={16} /> Building snapshot</> : <>Show my snapshot <ArrowRight size={16} /></>}</button>}
          </div>
        </form>
      </div>
    </main>
  );
}

function Field(props: { label: string; value: string; onChange: StringSetter; type?: string }) {
  return <label className="block text-sm font-bold text-[#D4DAE2]">{props.label}<input type={props.type || 'text'} value={props.value} onChange={(event) => props.onChange(event.target.value)} className="mt-2 w-full border border-white/15 bg-[#050607] px-4 py-3 font-normal text-white outline-none transition focus:border-[#39FF14]" /></label>;
}

function TextField(props: { label: string; value: string; onChange: StringSetter }) {
  return <label className="block text-sm font-bold text-[#D4DAE2]">{props.label}<textarea value={props.value} onChange={(event) => props.onChange(event.target.value)} rows={4} className="mt-2 w-full resize-y border border-white/15 bg-[#050607] px-4 py-3 font-normal text-white outline-none transition focus:border-[#39FF14]" /></label>;
}

function SelectField(props: { label: string; value: string; onChange: StringSetter; options: string[] }) {
  return <label className="block text-sm font-bold text-[#D4DAE2]">{props.label}<select value={props.value} onChange={(event) => props.onChange(event.target.value)} className="mt-2 w-full border border-white/15 bg-[#050607] px-4 py-3 font-normal text-white outline-none focus:border-[#39FF14]"><option value="">Select one</option>{props.options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}