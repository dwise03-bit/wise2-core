'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';

interface DemoFormPageProps {
  title: string;
  subtitle: string;
  backHref: string;
  fields: { label: string; placeholder: string; type?: string }[];
  submitLabel: string;
  note?: string;
}

export function DemoFormPage({
  title,
  subtitle,
  backHref,
  fields,
  submitLabel,
  note,
}: DemoFormPageProps) {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">{title}</h1>
        <p className="text-sm text-white/50">{subtitle}</p>
      </header>

      <GlassCard className="space-y-4">
        {fields.map((field) => (
          <div key={field.label}>
            <label className="text-xs text-white/50">{field.label}</label>
            <input
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              className="mt-1 w-full rounded-cherry border border-cherry-bubblegum/20 bg-cherry-soft/60 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-cherry-hot focus:outline-none"
            />
          </div>
        ))}
        <button type="button" className={`w-full ${CHERRY_LAYOUT.btnPrimary}`}>
          {submitLabel}
        </button>
        {note && <p className="text-center text-[10px] text-white/30">{note}</p>}
      </GlassCard>
    </div>
  );
}
