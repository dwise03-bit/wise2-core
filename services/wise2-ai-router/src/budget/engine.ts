/**
 * Budget Engine - Enforces daily spending limits
 * Implements 4-tier threshold system: 50% warn → 70% compress → 85% restrict → 100% brake
 */

import { BudgetStatus } from '../types/request';

export type BudgetThreshold = 'NORMAL' | 'WARN' | 'COMPRESS' | 'RESTRICT' | 'BRAKE';

export class BudgetEngine {
  private dailyBudget: number;
  private warnPct: number;
  private compressPct: number;
  private restrictPct: number;
  private brakePct: number;

  // In-memory tracking (reset daily)
  private dailySpend: number = 0;
  private lastResetDate: string = this.getTodayStr();

  constructor(config: {
    dailyBudget: number;
    warnPct: number;
    compressPct: number;
    restrictPct: number;
    brakePct: number;
  }) {
    this.dailyBudget = config.dailyBudget;
    this.warnPct = config.warnPct;
    this.compressPct = config.compressPct;
    this.restrictPct = config.restrictPct;
    this.brakePct = config.brakePct;
  }

  /**
   * Get current budget status
   */
  getStatus(): BudgetStatus {
    this.checkDailyReset();

    const usedPct = (this.dailySpend / this.dailyBudget) * 100;
    const threshold = this.getThreshold(usedPct);

    return {
      daily_budget: this.dailyBudget,
      used: Math.round(this.dailySpend * 1000000) / 1000000, // Round to 6 decimals
      remaining: Math.max(0, Math.round((this.dailyBudget - this.dailySpend) * 1000000) / 1000000),
      used_pct: Math.round(usedPct),
      threshold,
    };
  }

  /**
   * Check if request can proceed given current budget
   * Returns: { allowed: boolean, reason?: string, threshold: BudgetThreshold }
   */
  canProceed(
    cost: number,
    isCloudRequest: boolean,
    isCritical: boolean = false
  ): { allowed: boolean; reason?: string; threshold: BudgetThreshold } {
    this.checkDailyReset();

    const newTotal = this.dailySpend + cost;
    const projectedPct = (newTotal / this.dailyBudget) * 100;
    const threshold = this.getThreshold(projectedPct);

    // BRAKE: Hard stop unless critical
    if (projectedPct >= this.brakePct) {
      if (!isCritical) {
        return {
          allowed: false,
          reason: `Daily budget exhausted (${Math.round(projectedPct)}%). Local inference available.`,
          threshold: 'BRAKE',
        };
      }
      // Critical requests can override, but warn
      console.warn(`BUDGET BRAKE: Critical request proceeding despite exhausted budget (${Math.round(projectedPct)}%)`);
      return { allowed: true, threshold: 'BRAKE' };
    }

    // RESTRICT: Block cloud requests
    if (projectedPct >= this.restrictPct && isCloudRequest) {
      return {
        allowed: false,
        reason: `Budget restriction active (${Math.round(projectedPct)}%). Cloud requests blocked. Use local models.`,
        threshold: 'RESTRICT',
      };
    }

    // All other thresholds allow the request but may apply context compression
    return { allowed: true, threshold };
  }

  /**
   * Record a request's actual cost
   */
  recordCost(cost: number): void {
    this.checkDailyReset();
    this.dailySpend += cost;
  }

  /**
   * Get threshold level for usage percentage
   */
  private getThreshold(usedPct: number): BudgetThreshold {
    if (usedPct >= this.brakePct) return 'BRAKE';
    if (usedPct >= this.restrictPct) return 'RESTRICT';
    if (usedPct >= this.compressPct) return 'COMPRESS';
    if (usedPct >= this.warnPct) return 'WARN';
    return 'NORMAL';
  }

  /**
   * Check if daily budget should be reset
   */
  private checkDailyReset(): void {
    const today = this.getTodayStr();
    if (today !== this.lastResetDate) {
      this.dailySpend = 0;
      this.lastResetDate = today;
      console.log(`Budget reset for ${today}`);
    }
  }

  /**
   * Get today's date as string (YYYY-MM-DD)
   */
  private getTodayStr(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Suggest context compression level based on budget
   */
  getCompressionLevel(currentUsedPct: number): 'none' | 'light' | 'standard' | 'aggressive' {
    if (currentUsedPct >= this.brakePct) return 'aggressive';
    if (currentUsedPct >= this.restrictPct) return 'aggressive';
    if (currentUsedPct >= this.compressPct) return 'standard';
    if (currentUsedPct >= this.warnPct) return 'light';
    return 'none';
  }
}
