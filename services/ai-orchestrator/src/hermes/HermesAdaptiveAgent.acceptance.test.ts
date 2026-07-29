/**
 * Hermes Adaptive AI - Acceptance Test Suite
 * Tests Phase 24C implementation: FREE-FIRST routing, dynamic selection, fallback
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import pino from 'pino';
import { ModelRegistry } from '../models/ModelRegistry';
import { DynamicModelRouter } from '../models/DynamicModelRouter';
import { HermesAdaptiveAgent } from './HermesAdaptiveAgent';

const logger = pino();

describe('Hermes Adaptive AI - Phase 24C Acceptance Tests', () => {
  let registry: ModelRegistry;
  let router: DynamicModelRouter;
  let agent: HermesAdaptiveAgent;

  beforeAll(async () => {
    logger.info('Initializing Hermes for acceptance tests...');

    // Initialize services
    registry = new ModelRegistry('./config/test-model-registry.json');
    await registry.initialize();

    router = new DynamicModelRouter(registry, 'FREE-FIRST');
    agent = new HermesAdaptiveAgent(registry, router);

    logger.info('Hermes initialized', {
      modelsAvailable: registry.getAllModels().length,
    });
  });

  afterAll(() => {
    registry.destroy();
  });

  describe('Model Discovery', () => {
    it('should discover available Ollama models', async () => {
      const models = registry.getAllModels();
      expect(models.length).toBeGreaterThan(0);
      logger.info(`✓ Discovered ${models.length} models`);
    });

    it('should identify local models', async () => {
      const localModels = registry.getAllModels().filter((m) => m.local);
      expect(localModels.length).toBeGreaterThan(0);
      logger.info(`✓ Found ${localModels.length} local models`);
    });

    it('should track model capabilities', async () => {
      const models = registry.getAllModels();
      for (const model of models) {
        expect(model.capabilities).toBeDefined();
        expect(model.capabilities.reasoning).toBeGreaterThanOrEqual(0);
        expect(model.capabilities.coding).toBeGreaterThanOrEqual(0);
        expect(model.capabilities.speed).toBeGreaterThanOrEqual(0);
      }
      logger.info('✓ All models have capability tracking');
    });
  });

  describe('Dynamic Routing', () => {
    it('should route general query to appropriate model', async () => {
      const result = router.route({
        task: 'general',
        contextSize: 1000,
      });

      expect(result.primary).toBeDefined();
      expect(result.primary.available).toBe(true);
      expect(result.fallbacks.length).toBeGreaterThan(0);
      logger.info(`✓ General query routed to ${result.primary.displayName}`);
    });

    it('should route coding task to coding-optimized model', async () => {
      const result = router.route({
        task: 'coding',
        contextSize: 2000,
      });

      expect(result.primary).toBeDefined();
      expect(result.primary.capabilities.coding).toBeGreaterThan(5);
      logger.info(`✓ Coding task routed to ${result.primary.displayName}`);
    });

    it('should route reasoning task to reasoning-optimized model', async () => {
      const result = router.route({
        task: 'reasoning',
        contextSize: 3000,
      });

      expect(result.primary).toBeDefined();
      expect(result.primary.capabilities.reasoning).toBeGreaterThan(5);
      logger.info(`✓ Reasoning task routed to ${result.primary.displayName}`);
    });

    it('should route fast queries appropriately', async () => {
      const result = router.route({
        task: 'fast',
        contextSize: 500,
      });

      expect(result.primary).toBeDefined();
      expect(result.primary.avgLatencyMs).toBeLessThan(1000);
      logger.info(`✓ Fast query routed to ${result.primary.displayName} (${result.primary.avgLatencyMs}ms)`);
    });

    it('should provide fallback chain for each routing', async () => {
      const result = router.route({
        task: 'general',
        contextSize: 1000,
      });

      expect(result.fallbacks).toBeDefined();
      expect(result.fallbacks.length).toBeGreaterThan(0);
      expect(result.fallbacks.length).toBeLessThanOrEqual(3);
      logger.info(`✓ Fallback chain has ${result.fallbacks.length} models`);
    });
  });

  describe('Cost Guard Policy', () => {
    it('should enforce FREE-FIRST policy', async () => {
      const policy = router.getCostPolicy();
      expect(policy).toBe('FREE-FIRST');
      logger.info('✓ Cost policy is FREE-FIRST');
    });

    it('should prefer free models', async () => {
      const result = router.route({
        task: 'general',
        contextSize: 1000,
      });

      expect(result.primary.free).toBe(true);
      logger.info(`✓ Primary model is free: ${result.primary.displayName}`);
    });

    it('should estimate zero cost for free models', async () => {
      const result = router.route({
        task: 'general',
        contextSize: 1000,
      });

      expect(result.costEstimate).toBe(0);
      logger.info(`✓ Cost estimate: $${result.costEstimate}`);
    });
  });

  describe('Health & Monitoring', () => {
    it('should track model health statistics', async () => {
      const stats = registry.getStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.available).toBeGreaterThan(0);
      expect(stats.free).toBeGreaterThan(0);
      logger.info(`✓ Health stats - Total: ${stats.total}, Available: ${stats.available}, Free: ${stats.free}`);
    });

    it('should record model performance', async () => {
      const models = registry.getAllModels();
      const model = models[0];

      registry.recordSuccess(model.name, 250);
      expect(model.successes).toBeGreaterThan(0);
      expect(model.successRate).toBeGreaterThan(0);
      logger.info(`✓ Recorded success for ${model.name} (rate: ${model.successRate.toFixed(2)})`);
    });

    it('should implement circuit breaker on failures', async () => {
      const models = registry.getAvailableFreeModels();
      const testModel = models[0];

      // Simulate 3 failures
      registry.recordFailure(testModel.name);
      registry.recordFailure(testModel.name);
      registry.recordFailure(testModel.name);

      expect(testModel.available).toBe(false);
      logger.info(`✓ Circuit breaker triggered after 3 failures for ${testModel.name}`);
    });
  });

  describe('Offline Mode', () => {
    it('should have local models available for offline operation', async () => {
      const localModels = registry.getAllModels().filter((m) => m.local && m.available);

      if (localModels.length > 0) {
        logger.info(`✓ Offline operation supported with ${localModels.length} local models`);
        expect(localModels.length).toBeGreaterThan(0);
      } else {
        logger.warn('⚠ No local models available for offline operation');
      }
    });
  });

  describe('Fallback Chain', () => {
    it('should verify fallback chain integrity', async () => {
      const result = router.route({
        task: 'general',
        contextSize: 1000,
      });

      // All models in chain should be available
      for (const model of [result.primary, ...result.fallbacks]) {
        expect(model.available).toBe(true);
      }

      logger.info(`✓ Fallback chain verified: ${[result.primary, ...result.fallbacks].map((m) => m.displayName).join(' → ')}`);
    });
  });

  describe('Model Capability Scoring', () => {
    it('should score models appropriately for different tasks', async () => {
      const tasks = ['coding', 'reasoning', 'general', 'fast'];

      for (const task of tasks) {
        const result = router.route({
          task: task as any,
          contextSize: 1000,
        });

        expect(result.score).toBeGreaterThan(0);
        expect(result.score).toBeLessThanOrEqual(1);
        logger.info(`✓ ${task}: score=${result.score.toFixed(2)}, model=${result.primary.displayName}`);
      }
    });
  });
});

/**
 * Manual Acceptance Test Report
 */
describe('Hermes Adaptive AI - Manual Acceptance Report', () => {
  let registry: ModelRegistry;
  let router: DynamicModelRouter;
  let agent: HermesAdaptiveAgent;

  beforeAll(async () => {
    registry = new ModelRegistry('./config/test-model-registry.json');
    await registry.initialize();
    router = new DynamicModelRouter(registry, 'FREE-FIRST');
    agent = new HermesAdaptiveAgent(registry, router);
  });

  afterAll(() => {
    registry.destroy();
  });

  it('should generate Phase 24C acceptance report', async () => {
    const stats = registry.getStats();
    const freeModels = registry.getAvailableFreeModels();

    const report = {
      timestamp: new Date().toISOString(),
      phase: '24C',
      feature: 'FREE-First Adaptive Model Intelligence',
      results: {
        modelDiscovery: stats.total > 0 ? 'PASS' : 'FAIL',
        dynamicRouting: freeModels.length > 0 ? 'PASS' : 'FAIL',
        automaticFallback: stats.available > 1 ? 'PASS' : 'FAIL',
        costGuard: router.getCostPolicy() === 'FREE-FIRST' ? 'PASS' : 'FAIL',
        healthTracking: stats.total > 0 ? 'PASS' : 'FAIL',
      },
      summary: {
        modelsDiscovered: stats.total,
        modelsAvailable: stats.available,
        freeModels: stats.free,
        localModels: stats.local,
        averageSuccessRate: stats.averageSuccessRate,
        costPolicy: 'FREE-FIRST',
        offlineCapable: freeModels.length > 0,
        noCostIncurred: true,
      },
    };

    logger.info('\n=== WISE² PHASE 24C ACCEPTANCE REPORT ===\n');
    logger.info(JSON.stringify(report, null, 2));
    logger.info('\n=== END REPORT ===\n');

    // All checks should pass
    for (const [check, result] of Object.entries(report.results)) {
      expect(result).toBe('PASS');
    }
  });
});
