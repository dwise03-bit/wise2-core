/**
 * Basic router tests
 * MVP verification - routing logic and budget enforcement
 */

import { BudgetEngine } from '../src/budget/engine';
import { DEFAULT_DAILY_BUDGET_USD, DEFAULT_THRESHOLDS } from '../src/budget/thresholds';

describe('Budget Engine', () => {
  let budgetEngine: BudgetEngine;

  beforeEach(() => {
    budgetEngine = new BudgetEngine({
      dailyBudget: 10.0,
      warnPct: DEFAULT_THRESHOLDS.WARN_PCT,
      compressPct: DEFAULT_THRESHOLDS.COMPRESS_PCT,
      restrictPct: DEFAULT_THRESHOLDS.RESTRICT_PCT,
      brakePct: DEFAULT_THRESHOLDS.BRAKE_PCT,
    });
  });

  test('should return NORMAL status at 0%', () => {
    const status = budgetEngine.getStatus();
    expect(status.threshold).toBe('NORMAL');
    expect(status.used_pct).toBe(0);
  });

  test('should allow requests within budget', () => {
    const result = budgetEngine.canProceed(1.0, false);
    expect(result.allowed).toBe(true);
  });

  test('should warn at 50%', () => {
    budgetEngine.recordCost(5.0);
    const status = budgetEngine.getStatus();
    expect(status.threshold).toBe('WARN');
    expect(status.used_pct).toBe(50);
  });

  test('should compress context at 70%', () => {
    budgetEngine.recordCost(7.0);
    const status = budgetEngine.getStatus();
    expect(status.threshold).toBe('COMPRESS');
  });

  test('should restrict cloud at 85%', () => {
    budgetEngine.recordCost(8.5);
    const result = budgetEngine.canProceed(0.5, true);
    expect(result.allowed).toBe(false);
    expect(result.threshold).toBe('RESTRICT');
  });

  test('should apply hard brake at 100%', () => {
    budgetEngine.recordCost(10.0);
    const result = budgetEngine.canProceed(0.1, false);
    expect(result.allowed).toBe(false);
    expect(result.threshold).toBe('BRAKE');
  });

  test('critical requests can override brake', () => {
    budgetEngine.recordCost(10.0);
    const result = budgetEngine.canProceed(0.1, false, true);
    expect(result.allowed).toBe(true);
  });

  test('should suggest compression levels', () => {
    budgetEngine.recordCost(5.0);
    const level = budgetEngine.getCompressionLevel(50);
    expect(level).toBe('light');

    budgetEngine.recordCost(2.0);
    const level2 = budgetEngine.getCompressionLevel(70);
    expect(level2).toBe('standard');
  });
});
