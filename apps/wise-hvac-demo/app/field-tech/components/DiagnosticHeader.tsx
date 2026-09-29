'use client';

export function DiagnosticHeader({
  systemId,
  title = 'AI DIAGNOSTIC RESULTS',
  subtitle = 'POWERED BY IMP INTELLIGENCE',
}: {
  systemId: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <header className="imp-header">
      <div className="imp-wordmark">
        <strong>WISE²</strong>
        <span>IMP TECH</span>
      </div>
      <div className="imp-header-title">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      <div className="imp-system-id" aria-label={`System ID ${systemId}`}>
        <span>SYSTEM ID</span>
        <strong>{systemId}</strong>
      </div>
    </header>
  );
}
