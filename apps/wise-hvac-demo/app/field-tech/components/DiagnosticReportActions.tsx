'use client';

import { FileText, Loader2, Share2 } from 'lucide-react';

export function DiagnosticReportActions({
  onViewReport,
  onShareReport,
  viewDisabled,
  shareDisabled,
  viewLoading,
  shareLoading,
}: {
  onViewReport: () => void;
  onShareReport: () => void;
  viewDisabled?: boolean;
  shareDisabled?: boolean;
  viewLoading?: boolean;
  shareLoading?: boolean;
}) {
  return (
    <div className="imp-report-actions">
      <button
        type="button"
        className="imp-report-btn"
        data-tone="blue"
        onClick={onViewReport}
        disabled={viewDisabled || viewLoading}
        aria-label="View full report"
        aria-busy={viewLoading}
      >
        {viewLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText size={22} aria-hidden />}
        <span>
          <strong>VIEW FULL REPORT</strong>
          <small>Detailed analysis & data</small>
        </span>
      </button>
      <button
        type="button"
        className="imp-report-btn"
        data-tone="green"
        onClick={onShareReport}
        disabled={shareDisabled || shareLoading}
        aria-label="Share report"
        aria-busy={shareLoading}
      >
        {shareLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 size={22} aria-hidden />}
        <span>
          <strong>SHARE REPORT</strong>
          <small>Email or send to team</small>
        </span>
      </button>
    </div>
  );
}
