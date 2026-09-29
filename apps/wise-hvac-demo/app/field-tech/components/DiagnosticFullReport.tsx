'use client';

import type { ImpDiagnosticViewModel } from '@/lib/imp-diagnostics';

export function DiagnosticFullReport({
  model,
  customerName,
  onClose,
}: {
  model: ImpDiagnosticViewModel;
  customerName?: string;
  onClose: () => void;
}) {
  return (
    <div className="imp-sheet" role="dialog" aria-modal="true" aria-label="Full diagnostic report">
      <div className="imp-sheet-card">
        <h3>FULL DIAGNOSTIC REPORT</h3>
        <p>
          {customerName || 'Job'} · System {model.systemId}
          {model.generatedAt ? ` · ${new Date(model.generatedAt).toLocaleString()}` : ''}
        </p>
        <p><strong style={{ color: '#F4F7F8' }}>{model.heroTitle}</strong> — {model.faultName}</p>
        <p>{model.explanation}</p>
        <p>Confidence: {model.confidenceLabel}{model.confidenceBand ? ` (${model.confidenceBand})` : ''}</p>
        <p>Equipment: {model.equipmentLabel}</p>
        <h3 style={{ marginTop: 16, fontSize: 13 }}>Evidence</h3>
        <ul>
          {model.evidence.map((item) => (
            <li key={item.id}>{item.label}: {item.value} {item.unit} ({item.status})</li>
          ))}
        </ul>
        <h3 style={{ marginTop: 16, fontSize: 13 }}>Recommended action</h3>
        <ol>
          {model.recommendations.map((item) => (
            <li key={item.id}>{item.instruction}</li>
          ))}
        </ol>
        {model.parts.length ? (
          <>
            <h3 style={{ marginTop: 16, fontSize: 13 }}>Likely parts</h3>
            <ul>{model.parts.map((part) => <li key={part}>{part}</li>)}</ul>
          </>
        ) : null}
        <h3 style={{ marginTop: 16, fontSize: 13 }}>Safety</h3>
        <p>{model.safety}</p>
        <h3 style={{ marginTop: 16, fontSize: 13 }}>Customer-ready explanation</h3>
        <p>{model.customerSummary}</p>
        <p style={{ marginTop: 16, fontSize: 11 }}>{model.disclaimer}</p>
        <button type="button" className="imp-primary" onClick={onClose} style={{ marginTop: 16 }}>
          CLOSE REPORT
        </button>
      </div>
    </div>
  );
}
