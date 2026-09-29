'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { AuditResult } from '@/lib/ai-audit';

export default function AiAuditResultPage() {
  const params = useParams<{ auditId: string }>();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(`wise2-audit:${params.auditId}`);
    if (stored) {
      setResult(JSON.parse(stored).result as AuditResult);
    }
    setLoading(false);
  }, [params.auditId]);

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050607] text-[#39FF14]"><Loader2 className="animate-spin" /></main>;
  }

  if (!result) {
    return <main className="min-h-screen bg-[#050607] px-5 py-24 text-center text-white"><h1 className="text-3xl font-black">This snapshot has expired.</h1><p className="mx-auto mt-4 max-w-md text-[#AAB5C2]">Start a new free audit and we&apos;ll build a fresh opportunity snapshot.</p><Link href="/ai-audit/start" className="mt-7 inline-flex items-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-black text-[#050607]">Start again <ArrowRight size={16} /></Link></main>;
  }

  return <main className="min-h-screen bg-[#050607] px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.28em] text-[#39FF14]">Your opportunity snapshot</p><div className="mt-6 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div className="border border-[#39FF14]/40 bg-[#0A0E12] p-8"><p className="text-sm text-[#9AA6B2]">AI opportunity score</p><p className="mt-2 text-8xl font-black text-[#39FF14]">{result.score}</p><p className="text-sm text-[#9AA6B2]">out of 100</p><p className="mt-8 text-sm leading-6 text-[#C7D0DB]">{result.summary}</p></div><div><h1 className="text-3xl font-black sm:text-4xl">Where WISE² sees leverage</h1><div className="mt-6 space-y-4">{result.opportunities.map((opportunity) => <div key={opportunity.title} className="border border-white/10 bg-[#0A0E12] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-bold">{opportunity.title}</p><span className="text-xs font-bold uppercase tracking-[0.16em] text-[#0094FF]">{opportunity.priority}</span></div><p className="mt-2 text-sm text-[#39FF14]">{opportunity.capability}</p><p className="mt-2 text-sm leading-6 text-[#AAB5C2]">{opportunity.rationale}</p></div>)}</div><div className="mt-8 border border-[#0094FF]/40 bg-[#0094FF]/10 p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0094FF]">Recommended next move</p><h2 className="mt-2 text-2xl font-black">{result.nextStep}</h2><p className="mt-2 text-sm leading-6 text-[#C7D0DB]">Get a full live review, prioritized report, and 90-day roadmap for $149.</p><Link href="/consulting/audit" className="mt-5 inline-flex items-center gap-2 bg-[#39FF14] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#050607]">See the deep-dive audit <ArrowRight size={16} /></Link></div></div></div></div></main>;
}