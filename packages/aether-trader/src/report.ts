import type { BacktestResult, ValidationReport } from './types.ts';

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function summarizeResult(label: string, result: BacktestResult): string {
  return [
    `${label}:`,
    `  trades=${result.totalTrades}`,
    `  winRate=${percent(result.winRate)}`,
    `  profitFactor=${result.profitFactor.toFixed(2)}`,
    `  expectancy=${result.expectancy.toFixed(2)}`,
    `  netProfit=${result.netProfit.toFixed(2)}`,
    `  maxDrawdown=${result.maxDrawdown.toFixed(2)}`,
    `  gate=${result.passedPerformanceGate ? 'PASS' : 'FAIL'}`
  ].join('\n');
}

export function formatValidationReport(report: ValidationReport): string {
  const lines = [
    'AETHER-TRADER VALIDATION REPORT',
    summarizeResult('Training', report.training),
    summarizeResult('Validation', report.validation),
    summarizeResult('Out-of-sample', report.outOfSample),
    `Walk-forward slices=${report.walkForward.slices.length}`,
    `Monte Carlo median net profit=${report.monteCarlo.medianNetProfit.toFixed(2)}`,
    `Monte Carlo worst drawdown=${report.monteCarlo.worstDrawdown.toFixed(2)}`,
    `Monte Carlo risk of ruin=${percent(report.monteCarlo.riskOfRuin)}`,
    `Final assessment=${report.finalAssessment.toUpperCase()}`
  ];

  if (report.bottlenecks.length > 0) {
    lines.push('Bottlenecks:');
    for (const bottleneck of report.bottlenecks) {
      lines.push(`  - ${bottleneck}`);
    }
  }

  return lines.join('\n');
}
