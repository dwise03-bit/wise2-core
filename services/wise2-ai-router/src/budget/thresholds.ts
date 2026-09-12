/**
 * Budget threshold constants and helpers
 */

export const DEFAULT_THRESHOLDS = {
  WARN_PCT: 50,      // Log warning
  COMPRESS_PCT: 70,  // Apply context compression
  RESTRICT_PCT: 85,  // Block cloud requests
  BRAKE_PCT: 100,    // Hard stop (emergency)
};

export const DEFAULT_DAILY_BUDGET_USD = 50.00;

/**
 * Human-readable threshold descriptions
 */
export const THRESHOLD_DESCRIPTIONS: Record<string, string> = {
  NORMAL: '✅ Budget normal - use any provider',
  WARN: '⚠️ 50-70% of budget used - consider local models',
  COMPRESS: '🟡 70-85% of budget used - applying context compression',
  RESTRICT: '🔴 85%+ of budget used - cloud requests blocked, local only',
  BRAKE: '🛑 Budget exhausted - emergency brake active',
};

/**
 * Suggested actions for each threshold
 */
export const THRESHOLD_ACTIONS: Record<string, string> = {
  NORMAL: 'Route to cheapest capable provider (prefer local)',
  WARN: 'Route to local where possible, monitor usage',
  COMPRESS: 'Compress context, prefer local, minimize tokens',
  RESTRICT: 'Local inference only, block all cloud',
  BRAKE: 'Block non-critical requests, LOCAL ONLY, alert admin',
};
