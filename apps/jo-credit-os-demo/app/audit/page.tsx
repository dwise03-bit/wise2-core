'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/wise';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditData {
  businessType: string;
  businessSize: string;
  monthlyRevenue: string;
  primaryChallenge: string;
  leadSources: string[];
  currentCRM: string;
  repetitiveTasks: string[];
  marketingChannels: string[];
  aiExperience: string;
  biggestBottleneck: string;
  name: string;
  email: string;
  phone: string;
}

interface AuditResult {
  score: number;
  automationOps: string[];
  acquisitionOps: string[];
  timeSavings: string;
  revenuePotential: string;
  recommendedPackage: string;
  packagePrice: string;
  nextAction: string;
}

// ─── Audit Engine ─────────────────────────────────────────────────────────────

function generateResult(data: AuditData): AuditResult {
  let score = 40;

  // Size signal
  if (data.businessSize === '6-20') score += 10;
  if (data.businessSize === '21-50') score += 15;
  if (data.businessSize === '50+') score += 20;

  // AI experience — lower = more opportunity
  if (data.aiExperience === 'none') score += 20;
  if (data.aiExperience === 'minimal') score += 15;
  if (data.aiExperience === 'some') score += 8;

  // Repetitive tasks
  score += Math.min(data.repetitiveTasks.length * 5, 20);

  // Multi-channel marketing
  score += Math.min(data.marketingChannels.length * 3, 12);

  score = Math.min(score, 98);

  // Automation opportunities
  const autoOps: string[] = [];
  if (data.repetitiveTasks.includes('follow-up'))
    autoOps.push('Automated lead follow-up sequences');
  if (data.repetitiveTasks.includes('scheduling'))
    autoOps.push('AI-powered appointment scheduling');
  if (data.repetitiveTasks.includes('invoicing'))
    autoOps.push('Automated invoicing & payment reminders');
  if (data.repetitiveTasks.includes('social'))
    autoOps.push('AI content generation for social media');
  if (data.repetitiveTasks.includes('reporting'))
    autoOps.push('Automated business performance reports');
  if (data.repetitiveTasks.includes('email'))
    autoOps.push('Smart email triage & response drafting');
  if (autoOps.length === 0)
    autoOps.push('Custom workflow automation based on your operations');

  // Acquisition opportunities
  const acqOps: string[] = [];
  if (data.leadSources.includes('referral'))
    acqOps.push('AI-optimized referral tracking system');
  if (data.leadSources.includes('social'))
    acqOps.push('Social media lead capture & nurturing');
  if (data.leadSources.includes('website'))
    acqOps.push('Website conversion funnel optimization');
  if (data.leadSources.includes('ads'))
    acqOps.push('Paid ad ROI tracking & optimization');
  if (acqOps.length === 0)
    acqOps.push('Multi-channel lead capture & CRM pipeline');

  // Package recommendation
  let pkg = 'Starter';
  let price = '$29/mo';
  if (score >= 70 || data.businessSize === '21-50' || data.businessSize === '50+') {
    pkg = 'Professional';
    price = '$99/mo';
  }
  if (score >= 85 || data.businessSize === '50+') {
    pkg = 'AI Implementation';
    price = 'Custom — starting at $499 setup';
  }

  const timeSavings =
    data.repetitiveTasks.length >= 4
      ? 'Est. 15-25 hrs/week'
      : data.repetitiveTasks.length >= 2
        ? 'Est. 8-15 hrs/week'
        : 'Est. 3-8 hrs/week';

  const revenuePotential =
    score >= 80
      ? 'High — significant automation & acquisition gaps identified'
      : score >= 60
        ? 'Medium-High — several quick wins available'
        : 'Medium — targeted improvements recommended';

  return {
    score,
    automationOps: autoOps,
    acquisitionOps: acqOps,
    timeSavings,
    revenuePotential,
    recommendedPackage: pkg,
    packagePrice: price,
    nextAction: score >= 70 ? 'consultation' : 'starter',
  };
}

// ─── Step Components ──────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Your Business' },
  { id: 2, label: 'Operations' },
  { id: 3, label: 'Marketing' },
  { id: 4, label: 'AI Readiness' },
  { id: 5, label: 'Contact' },
];

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all ${
            selected.includes(opt.value)
              ? 'bg-[#0094FF]/20 border-2 border-[#0094FF] text-white'
              : 'bg-[#111] border-2 border-[#1a1a1a] text-gray-400 hover:border-[#0094FF]/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-3 rounded-lg text-sm font-semibold text-left transition-all ${
            value === opt.value
              ? 'bg-[#0094FF]/20 border-2 border-[#0094FF] text-white'
              : 'bg-[#111] border-2 border-[#1a1a1a] text-gray-400 hover:border-[#0094FF]/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#0094FF' : score >= 60 ? '#A63CFF' : '#F2B632';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a1a" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{score}</span>
        <span className="text-xs text-gray-400 uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY: AuditData = {
  businessType: '',
  businessSize: '1-5',
  monthlyRevenue: '',
  primaryChallenge: '',
  leadSources: [],
  currentCRM: '',
  repetitiveTasks: [],
  marketingChannels: [],
  aiExperience: 'none',
  biggestBottleneck: '',
  name: '',
  email: '',
  phone: '',
};

export default function AuditPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AuditData>(EMPTY);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (field: keyof AuditData, value: AuditData[keyof AuditData]) =>
    setData((d) => ({ ...d, [field]: value }));

  const progress = ((step - 1) / STEPS.length) * 100;

  const handleSubmit = async () => {
    setSubmitting(true);
    // Persist lead asynchronously — non-blocking, best-effort
    fetch('/api/v1/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: data.businessType,
        contactName: data.name,
        email: data.email,
        phone: data.phone || undefined,
        industry: data.businessType,
        primaryProblem: data.primaryChallenge,
        leadSource: 'business-ai-audit',
        notes: `Size: ${data.businessSize} | Revenue: ${data.monthlyRevenue} | AI: ${data.aiExperience} | Bottleneck: ${data.biggestBottleneck}`,
        tags: ['audit', 'website'],
      }),
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 800));
    setResult(generateResult(data));
    setStep(6);
    setSubmitting(false);
  };

  const canProceed = () => {
    if (step === 1) return data.businessType.trim().length > 0 && data.primaryChallenge.trim().length > 0;
    if (step === 2) return data.repetitiveTasks.length > 0;
    if (step === 3) return data.marketingChannels.length > 0;
    if (step === 4) return data.aiExperience.length > 0;
    if (step === 5) return data.name.trim().length > 0 && data.email.includes('@');
    return true;
  };

  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white pb-20">
        {/* Header */}
        <div className="text-center px-6 mb-12">
          <div className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-4"
            style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}>
            FREE — TAKES 3 MINUTES
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            BUSINESS AI AUDIT
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Discover your AI opportunity score and see exactly where WISE² can automate your operations and capture more customers.
          </p>
        </div>

        {step < 6 && (
          <div className="max-w-2xl mx-auto px-6">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Step {step} of {STEPS.length}</span>
                <span>{STEPS[step - 1]?.label}</span>
              </div>
              <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress + 20}%`, background: 'linear-gradient(90deg, #0066FF, #0094FF)' }}
                />
              </div>
            </div>

            {/* Step Card */}
            <div className="rounded-2xl p-8 md:p-10"
              style={{ background: '#0d0d0d', border: '1px solid rgba(0,148,255,0.15)' }}>

              {/* STEP 1 — Your Business */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Tell us about your business</h2>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">What type of business do you run?</label>
                    <input
                      type="text"
                      placeholder="e.g. Auto detailing, consulting, real estate, e-commerce..."
                      value={data.businessType}
                      onChange={(e) => set('businessType', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF]"
                      style={{ background: '#111', border: '2px solid #1a1a1a' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">How many people work in your business?</label>
                    <RadioGroup
                      options={[
                        { value: '1', label: 'Just me' },
                        { value: '1-5', label: '2–5 people' },
                        { value: '6-20', label: '6–20 people' },
                        { value: '21-50', label: '21–50 people' },
                        { value: '50+', label: '50+ people' },
                      ]}
                      value={data.businessSize}
                      onChange={(v) => set('businessSize', v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Monthly revenue range</label>
                    <RadioGroup
                      options={[
                        { value: 'pre-revenue', label: 'Pre-revenue' },
                        { value: 'under-10k', label: 'Under $10K' },
                        { value: '10k-50k', label: '$10K–$50K' },
                        { value: '50k-200k', label: '$50K–$200K' },
                        { value: '200k+', label: '$200K+' },
                      ]}
                      value={data.monthlyRevenue}
                      onChange={(v) => set('monthlyRevenue', v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">What is your biggest business challenge right now?</label>
                    <textarea
                      placeholder="e.g. I spend too much time on follow-up and can't scale..."
                      value={data.primaryChallenge}
                      onChange={(e) => set('primaryChallenge', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 h-24 focus:outline-none focus:border-[#0094FF] resize-none"
                      style={{ background: '#111', border: '2px solid #1a1a1a' }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 — Operations */}
              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Your daily operations</h2>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Which tasks take up the most repetitive time? (select all that apply)</label>
                    <CheckboxGroup
                      options={[
                        { value: 'follow-up', label: '📞 Lead follow-up' },
                        { value: 'scheduling', label: '📅 Scheduling' },
                        { value: 'invoicing', label: '💰 Invoicing / billing' },
                        { value: 'social', label: '📱 Social media posts' },
                        { value: 'reporting', label: '📊 Reporting' },
                        { value: 'email', label: '✉️ Email management' },
                        { value: 'data-entry', label: '⌨️ Data entry' },
                        { value: 'customer-service', label: '🎧 Customer service' },
                      ]}
                      selected={data.repetitiveTasks}
                      onChange={(v) => set('repetitiveTasks', v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">How do you currently manage customers and leads?</label>
                    <RadioGroup
                      options={[
                        { value: 'nothing', label: 'Nothing formal' },
                        { value: 'spreadsheet', label: 'Spreadsheets' },
                        { value: 'basic-crm', label: 'Basic CRM' },
                        { value: 'advanced-crm', label: 'Full CRM system' },
                      ]}
                      value={data.currentCRM}
                      onChange={(v) => set('currentCRM', v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">What is your single biggest operational bottleneck?</label>
                    <textarea
                      placeholder="e.g. We lose leads because nobody follows up fast enough..."
                      value={data.biggestBottleneck}
                      onChange={(e) => set('biggestBottleneck', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 h-20 focus:outline-none focus:border-[#0094FF] resize-none"
                      style={{ background: '#111', border: '2px solid #1a1a1a' }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3 — Marketing */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Customer acquisition</h2>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Where do most of your customers come from? (select all that apply)</label>
                    <CheckboxGroup
                      options={[
                        { value: 'referral', label: '🤝 Word of mouth / referrals' },
                        { value: 'social', label: '📱 Social media (organic)' },
                        { value: 'ads', label: '💸 Paid ads' },
                        { value: 'website', label: '🌐 Website / SEO' },
                        { value: 'networking', label: '🏢 Networking / events' },
                        { value: 'repeat', label: '🔄 Repeat customers' },
                        { value: 'cold-outreach', label: '📧 Cold outreach' },
                        { value: 'marketplace', label: '🛒 Marketplace / platform' },
                      ]}
                      selected={data.leadSources}
                      onChange={(v) => set('leadSources', v)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Which marketing channels are you currently using?</label>
                    <CheckboxGroup
                      options={[
                        { value: 'instagram', label: 'Instagram' },
                        { value: 'facebook', label: 'Facebook' },
                        { value: 'google', label: 'Google Ads' },
                        { value: 'email-marketing', label: 'Email marketing' },
                        { value: 'tiktok', label: 'TikTok' },
                        { value: 'youtube', label: 'YouTube' },
                        { value: 'seo', label: 'SEO / Blog' },
                        { value: 'none-marketing', label: 'None yet' },
                      ]}
                      selected={data.marketingChannels}
                      onChange={(v) => set('marketingChannels', v)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 — AI Readiness */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Your AI experience</h2>
                  <p className="text-gray-400 text-sm">Honest answers help us make the most relevant recommendations.</p>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">How much AI are you currently using in your business?</label>
                    <RadioGroup
                      options={[
                        { value: 'none', label: "None — I'm starting from scratch" },
                        { value: 'minimal', label: "Minimal — tried ChatGPT a few times" },
                        { value: 'some', label: 'Some — use AI tools regularly' },
                        { value: 'advanced', label: 'Advanced — AI in multiple workflows' },
                      ]}
                      value={data.aiExperience}
                      onChange={(v) => set('aiExperience', v)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5 — Contact */}
              {step === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Where should we send your results?</h2>
                  <p className="text-gray-400 text-sm">Your results are ready. We'll email them to you and a consultant will follow up if you'd like to discuss.</p>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Your name</label>
                    <input
                      type="text"
                      placeholder="First and last name"
                      value={data.name}
                      onChange={(e) => set('name', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF]"
                      style={{ background: '#111', border: '2px solid #1a1a1a' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email address</label>
                    <input
                      type="email"
                      placeholder="you@yourbusiness.com"
                      value={data.email}
                      onChange={(e) => set('email', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF]"
                      style={{ background: '#111', border: '2px solid #1a1a1a' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone (optional — for consultation scheduling)</label>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={data.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF]"
                      style={{ background: '#111', border: '2px solid #1a1a1a' }}
                    />
                  </div>

                  <p className="text-xs text-gray-600">
                    By submitting, you agree to receive your audit results and information about WISE². No spam. Unsubscribe anytime.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-3 rounded-lg font-semibold text-gray-400 hover:text-white transition"
                  style={{ background: '#111', border: '1px solid #1a1a1a' }}
                >
                  ← Back
                </button>
              )}
              <button
                onClick={step === 5 ? handleSubmit : () => setStep((s) => s + 1)}
                disabled={!canProceed() || submitting}
                className="flex-1 py-3 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: canProceed() && !submitting
                    ? 'linear-gradient(135deg, #0066FF 0%, #0094FF 100%)'
                    : '#1a1a1a',
                  color: '#fff',
                  boxShadow: canProceed() ? '0 0 20px rgba(0,148,255,0.3)' : 'none',
                }}
              >
                {submitting
                  ? 'Analyzing your business...'
                  : step === 5
                    ? 'GET MY AI AUDIT RESULTS'
                    : 'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {step === 6 && result && (
          <div className="max-w-3xl mx-auto px-6">
            {/* Score header */}
            <div className="rounded-2xl p-8 md:p-12 mb-8 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.1) 0%, rgba(0,148,255,0.05) 100%)', border: '1px solid rgba(0,148,255,0.25)' }}>
              <p className="text-sm text-[#0094FF] font-bold tracking-widest mb-2">YOUR AI OPPORTUNITY SCORE</p>
              <ScoreRing score={result.score} />
              <p className="text-gray-400 mt-4 text-sm max-w-sm mx-auto">
                {result.score >= 80
                  ? 'High opportunity — significant automation and acquisition gains available'
                  : result.score >= 60
                    ? 'Strong opportunity — multiple high-value improvements identified'
                    : 'Solid foundation — targeted AI investments will drive real results'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Automation Opportunities */}
              <div className="rounded-xl p-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <h3 className="font-bold text-[#0094FF] mb-4 flex items-center gap-2">
                  <span>⚡</span> AUTOMATION OPPORTUNITIES
                </h3>
                <ul className="space-y-3">
                  {result.automationOps.map((op, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-[#0094FF] mt-0.5 flex-shrink-0">✓</span> {op}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Acquisition Opportunities */}
              <div className="rounded-xl p-6" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <h3 className="font-bold text-[#A63CFF] mb-4 flex items-center gap-2">
                  <span>🎯</span> ACQUISITION OPPORTUNITIES
                </h3>
                <ul className="space-y-3">
                  {result.acquisitionOps.map((op, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-[#A63CFF] mt-0.5 flex-shrink-0">✓</span> {op}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl p-5 text-center" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Time Savings Potential</p>
                <p className="text-lg font-bold text-[#0094FF]">{result.timeSavings}</p>
                <p className="text-xs text-gray-600 mt-1">estimate — based on your inputs</p>
              </div>
              <div className="rounded-xl p-5 text-center" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Revenue Opportunity</p>
                <p className="text-sm font-bold text-[#A63CFF]">{result.revenuePotential}</p>
              </div>
            </div>

            {/* Recommended package */}
            <div className="rounded-2xl p-8 mb-8"
              style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(166,60,255,0.05))', border: '2px solid rgba(0,148,255,0.3)' }}>
              <p className="text-xs text-[#0094FF] font-bold tracking-widest mb-2">RECOMMENDED FOR {data.name.split(' ')[0].toUpperCase()}</p>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-2xl font-black mb-1">WISE² {result.recommendedPackage}</h3>
                  <p className="text-[#0094FF] font-bold text-lg">{result.packagePrice}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Based on your {data.businessType} operation and identified opportunities.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/consulting"
                    className="px-6 py-3 rounded-lg font-bold text-white text-center transition-all"
                    style={{ background: 'linear-gradient(135deg, #0066FF, #0094FF)', boxShadow: '0 0 20px rgba(0,148,255,0.3)', minWidth: 200 }}
                  >
                    BOOK FREE CONSULTATION
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-6 py-3 rounded-lg font-semibold text-center transition-all"
                    style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}
                  >
                    View All Plans →
                  </Link>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="rounded-xl p-6 mb-8" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
              <h3 className="font-bold mb-4">What happens next</h3>
              <div className="space-y-4">
                {[
                  { n: 1, text: 'Your audit results are being sent to ' + data.email },
                  { n: 2, text: 'A WISE² consultant will review your audit and reach out within 1 business day' },
                  { n: 3, text: "In your consultation we'll map out a custom WISE² implementation for your business" },
                  { n: 4, text: 'We get to work — most implementations are live within 2 weeks' },
                ].map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(0,148,255,0.2)', color: '#0094FF' }}>
                      {n}
                    </div>
                    <p className="text-gray-300 text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-400 transition underline"
              >
                ← Back to WISE²
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
