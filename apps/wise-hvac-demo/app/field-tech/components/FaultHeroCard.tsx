'use client';

import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';
import type { FaultSeverity } from '@/lib/imp-diagnostics';

export function FaultHeroCard({
  severity,
  eyebrow,
  title,
  faultName,
  explanation,
}: {
  severity: FaultSeverity;
  eyebrow: string;
  title: string;
  faultName: string;
  explanation: string;
}) {
  const Icon = severity === 'NORMAL' ? CheckCircle2 : severity === 'INSUFFICIENT_DATA' ? HelpCircle : AlertTriangle;

  return (
    <section className="imp-hero" data-severity={severity} aria-label={`${title}: ${faultName}`}>
      <div className="imp-hero-icon" aria-hidden>
        <Icon size={26} strokeWidth={2.2} />
      </div>
      <div className="imp-hero-copy">
        <small>{eyebrow}</small>
        <strong>{title}</strong>
        <b>{faultName}</b>
        <p>{explanation}</p>
      </div>
      <div className="imp-hvac-scan" aria-hidden>
        <div className="imp-pipe" />
        <div className="imp-pipe-core" />
        <div className="imp-scan-lines" />
      </div>
    </section>
  );
}
