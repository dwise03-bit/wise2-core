/**
 * Troubleshooter Header Component
 */

'use client';

export function TroubleshooterHeader() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-wise-text-primary">Master Troubleshooter</h1>
          <p className="text-wise-text-secondary mt-1">
            Proactive issue detection and automated recommendations
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-wise-green-neon/10 border border-wise-green-neon/30 rounded-lg">
          <div className="w-2 h-2 bg-wise-green-neon rounded-full animate-pulse" />
          <span className="text-sm font-medium text-wise-green-neon">Monitoring</span>
        </div>
      </div>
    </div>
  );
}
