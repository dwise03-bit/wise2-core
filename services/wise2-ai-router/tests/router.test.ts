/**
 * Basic router tests
 * MVP verification - routing logic and budget enforcement
 */

import { BudgetEngine } from '../src/budget/engine';
import { DEFAULT_THRESHOLDS } from '../src/budget/thresholds';

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

import { AIRouter } from '../src/router';
import { AIProvider, AIRequest, Model } from '../src/types/request';

class FakeProvider implements AIProvider {
  constructor(public name: string, private healthy: boolean, private answer: string) {}
  async isHealthy() { return this.healthy; }
  async listModels(): Promise<Model[]> { return [{ id: `${this.name}-model`, name: `${this.name}-model`, provider: this.name, contextWindow: 8192, capabilities: ['chat'], healthy: this.healthy }]; }
  async estimate() { return { tokens: 1, cost: 0 }; }
  async generate() { return this.answer; }
}

describe('AI Router free GPU fallback', () => {
  const request: AIRequest = {
    project_id: 'wise2-core', agent_id: 'hermes', user_id: 'test', task_type: 'chat',
    messages: [{ role: 'user', content: 'ping' }], route_mode: 'AUTO', privacy_class: 'public',
  };

  test('AUTO falls back to first healthy zero-cost cloud provider', async () => {
    const local = new FakeProvider('ollama', false, 'local') as any;
    const cloud = new FakeProvider('kaggle-ollama', true, 'kaggle');
    const budget = new BudgetEngine({ dailyBudget: 10, warnPct: 50, compressPct: 70, restrictPct: 85, brakePct: 100 });
    const telemetry = { logEvent: jest.fn().mockResolvedValue(undefined) } as any;
    const router = new AIRouter(local, budget, telemetry, [cloud]);
    (router as any).secondBrain = { query: jest.fn().mockResolvedValue({ contexts: [] }) };
    const result: any = await router.route(request);
    expect(result.response).toBe('kaggle');
    expect(result.routing.actual_route).toBe('CLOUD');
    expect(result.routing.provider).toBe('kaggle-ollama');
    expect(result.routing.estimated_cost).toBe(0);
  });

  test('LOCAL never spills to a cloud provider', async () => {
    const local = new FakeProvider('ollama', false, 'local') as any;
    const cloud = new FakeProvider('kaggle-ollama', true, 'kaggle');
    const budget = new BudgetEngine({ dailyBudget: 10, warnPct: 50, compressPct: 70, restrictPct: 85, brakePct: 100 });
    const telemetry = { logEvent: jest.fn().mockResolvedValue(undefined) } as any;
    const router = new AIRouter(local, budget, telemetry, [cloud]);
    const result: any = await router.route({ ...request, route_mode: 'LOCAL' });
    expect(result.error).toBeDefined();
  });
});
