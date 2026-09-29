'use client';

import { Activity, Flame, Gauge, Snowflake, Wind } from 'lucide-react';
import type { DiagnosticMetricCardModel, MetricIconKey, MetricSeverity } from '@/lib/imp-diagnostics';

const ICONS: Record<MetricIconKey, typeof Gauge> = {
  gauge: Gauge,
  snowflake: Snowflake,
  flame: Flame,
  wind: Wind,
  activity: Activity,
  generic: Activity,
};

export function DiagnosticMetricCard({
  label,
  value,
  unit,
  status,
  icon,
  severity,
  expectedRange,
}: DiagnosticMetricCardModel) {
  const Icon = ICONS[icon] || Activity;
  const resolved: MetricSeverity = severity || status;

  return (
    <article className="imp-metric-card" aria-label={`${label} ${value} ${unit} ${resolved}`}>
      <div>
        <Icon aria-hidden />
        <small>{label}</small>
      </div>
      <div className="imp-metric-value">
        <strong>{value}</strong>
        {unit ? <span>{unit}</span> : null}
      </div>
      <span className="imp-status-pill" data-severity={resolved}>
        {resolved}
      </span>
      <span className="sr-only">Expected range {expectedRange}</span>
    </article>
  );
}

export function DiagnosticEvidenceGrid({
  evidence,
  normalCount,
}: {
  evidence: DiagnosticMetricCardModel[];
  normalCount: number;
}) {
  return (
    <section aria-label="Evidence">
      <div className="imp-section-label">
        <h2 data-tone="green">EVIDENCE</h2>
        <span className="imp-normal-badge">
          {normalCount}/{evidence.length || 0} NORMAL
        </span>
      </div>
      <div className="imp-evidence-grid">
        {evidence.map((metric) => (
          <DiagnosticMetricCard key={metric.id} {...metric} />
        ))}
      </div>
    </section>
  );
}
