'use client';

import { DiagnosticHeader } from './DiagnosticHeader';
import { FaultHeroCard } from './FaultHeroCard';
import { DiagnosticEvidenceGrid } from './DiagnosticMetricCard';
import { ConfidencePanel } from './ConfidencePanel';
import { RecommendedActionsPanel } from './RecommendedActionRow';
import { DiagnosticReportActions } from './DiagnosticReportActions';
import type { ImpDiagnosticViewModel, RecommendedActionModel } from '@/lib/imp-diagnostics';

export function ImpDiagnosticResultsScreen({
  model,
  onViewReport,
  onShareReport,
  onActionPress,
  onRunAgain,
  viewLoading,
  shareLoading,
}: {
  model: ImpDiagnosticViewModel;
  onViewReport: () => void;
  onShareReport: () => void;
  onActionPress?: (action: RecommendedActionModel) => void;
  onRunAgain?: () => void;
  viewLoading?: boolean;
  shareLoading?: boolean;
}) {
  return (
    <>
      <DiagnosticHeader systemId={model.systemId} />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <FaultHeroCard
            severity={model.severity}
            eyebrow={model.heroEyebrow}
            title={model.heroTitle}
            faultName={model.faultName}
            explanation={model.explanation}
          />
          <DiagnosticEvidenceGrid
            evidence={model.evidence}
            normalCount={model.normalEvidenceCount}
          />
          <ConfidencePanel
            confidenceLabel={model.confidenceLabel}
            confidence={model.confidence}
            band={model.confidenceBand}
          />
          <RecommendedActionsPanel
            actions={model.recommendations}
            onActionPress={onActionPress}
          />
          <DiagnosticReportActions
            onViewReport={onViewReport}
            onShareReport={onShareReport}
            viewDisabled={!model.hasDiagnosis}
            shareDisabled={!model.hasDiagnosis}
            viewLoading={viewLoading}
            shareLoading={shareLoading}
          />
          {onRunAgain ? (
            <button type="button" className="imp-text-btn" onClick={onRunAgain}>
              RUN NEW ANALYSIS
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function ImpDiagnosticLoadingState({ systemId }: { systemId: string }) {
  return (
    <>
      <DiagnosticHeader systemId={systemId} />
      <div className="imp-scroll">
        <div className="imp-scroll-inner">
          <div className="imp-skeleton" style={{ height: 120 }} />
          <div className="imp-evidence-grid">
            <div className="imp-skeleton" style={{ height: 118 }} />
            <div className="imp-skeleton" style={{ height: 118 }} />
            <div className="imp-skeleton" style={{ height: 118 }} />
            <div className="imp-skeleton" style={{ height: 118 }} />
          </div>
          <div className="imp-skeleton" style={{ height: 140 }} />
          <div className="imp-skeleton" style={{ height: 220 }} />
        </div>
      </div>
    </>
  );
}
