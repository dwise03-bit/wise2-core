'use client';

import { useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import type { ConfidenceBand } from '@/lib/imp-diagnostics';

export function ConfidenceGauge({
  confidence,
  band,
}: {
  confidence: number | null;
  band: ConfidenceBand | null;
}) {
  const [progress, setProgress] = useState(0);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const safe = confidence === null ? 0 : Math.max(0, Math.min(100, confidence));

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setProgress(safe);
      return;
    }
    setProgress(0);
    const frame = requestAnimationFrame(() => setProgress(safe));
    return () => cancelAnimationFrame(frame);
  }, [safe]);

  const dash = useMemo(() => (progress / 100) * circumference, [progress, circumference]);

  return (
    <div className="imp-gauge-wrap" aria-hidden={confidence === null}>
      <div className="imp-gauge-wave" />
      <svg className="imp-gauge" viewBox="0 0 96 96" role="img" aria-label={`Confidence ${confidence === null ? 'not available' : `${confidence} percent, ${band || ''}`}`}>
        <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(102,255,120,0.08)" strokeWidth="1" />
        <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(120,140,150,0.18)" strokeWidth="1.2" />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(120,140,150,0.2)"
          strokeWidth="6"
        />
        <circle
          data-progress
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="#66FF78"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform="rotate(-90 48 48)"
          style={{ transition: 'stroke-dasharray 550ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
        <circle cx="48" cy="48" r="22" fill="none" stroke="rgba(102,255,120,0.22)" strokeWidth="1" />
      </svg>
      <div className="imp-gauge-label">{band || '—'}</div>
    </div>
  );
}

export function ConfidencePanel({
  confidenceLabel,
  confidence,
  band,
}: {
  confidenceLabel: string;
  confidence: number | null;
  band: ConfidenceBand | null;
}) {
  const filled = confidence === null ? 0 : Math.min(4, Math.ceil(confidence / 25) || (confidence > 0 ? 1 : 0));

  return (
    <section className="imp-confidence" aria-label="Diagnostic confidence">
      <div className="imp-confidence-copy" data-band={band || undefined}>
        <small>
          DIAGNOSTIC CONFIDENCE
          <Info size={12} aria-hidden />
        </small>
        <strong>{confidenceLabel}</strong>
        <div className="imp-segments" data-band={band || undefined} aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <span key={index} data-on={index < filled} />
          ))}
        </div>
        <div className="imp-segment-labels" aria-hidden>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      <ConfidenceGauge confidence={confidence} band={band} />
    </section>
  );
}
