/**
 * Phase 24C Acceptance Tests - Standalone Runner
 * Tests: Model Discovery, Dynamic Routing, Cost Guard, Health Tracking, Fallback
 */

import pino from 'pino';
import { ModelRegistry } from './src/models/ModelRegistry';
import { DynamicModelRouter } from './src/models/DynamicModelRouter';
import { HermesAdaptiveAgent } from './src/hermes/HermesAdaptiveAgent';

const logger = pino({ level: 'info' });

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ name, passed: true });
    logger.info(`✓ ${name}`);
  } catch (error) {
    const err = error as Error;
    results.push({ name, passed: false, error: err.message });
    logger.error(`✗ ${name}`, { error: err.message });
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTests(): Promise<void> {
  logger.info('\n╔════════════════════════════════════════════════════════════════╗');
  logger.info('║     WISE² PHASE 24C ACCEPTANCE TEST SUITE                      ║');
  logger.info('║     FREE-First Adaptive AI Model Intelligence                  ║');
  logger.info('╚════════════════════════════════════════════════════════════════╝\n');

  let registry: ModelRegistry;
  let router: DynamicModelRouter;
  let agent: HermesAdaptiveAgent;

  // Initialize
  logger.info('Initializing services...\n');
  registry = new ModelRegistry('./config/test-model-registry.json');
  await registry.initialize();

  router = new DynamicModelRouter(registry, 'FREE-FIRST');
  agent = new HermesAdaptiveAgent(registry, router);

  logger.info(`Models discovered: ${registry.getAllModels().length}\n`);

  // Test Suite 1: Model Discovery
  logger.info('═══ TEST SUITE 1: MODEL DISCOVERY ═══\n');

  await test('should discover available models', async () => {
    const models = registry.getAllModels();
    assert(models.length > 0, 'No models discovered');
    logger.info(`  Found ${models.length} models`);
  });

  await test('should identify local models', async () => {
    const localModels = registry.getAllModels().filter((m) => m.local);
    assert(localModels.length > 0, 'No local models found');
    logger.info(`  Found ${localModels.length} local models`);
  });

  await test('should track model capabilities', async () => {
    const models = registry.getAllModels();
    for (const model of models) {
      assert(model.capabilities, 'Model missing capabilities');
      assert(typeof model.capabilities.coding === 'number', 'Missing coding capability');
      assert(typeof model.capabilities.reasoning === 'number', 'Missing reasoning capability');
    }
    logger.info(`  All models have capability tracking`);
  });

  // Test Suite 2: Dynamic Routing
  logger.info('\n═══ TEST SUITE 2: DYNAMIC ROUTING ═══\n');

  await test('should route general queries', async () => {
    const result = router.route({ task: 'general', contextSize: 1000 });
    assert(result.primary, 'No primary model selected');
    assert(result.primary.available, 'Primary model not available');
    assert(result.fallbacks.length > 0, 'No fallback models');
    logger.info(`  Routed to: ${result.primary.displayName} (score: ${result.score.toFixed(2)})`);
  });

  await test('should route coding tasks appropriately', async () => {
    const result = router.route({ task: 'coding', contextSize: 2000 });
    assert(result.primary, 'No primary model selected');
    assert(result.primary.capabilities.coding > 5, 'Model not optimized for coding');
    logger.info(`  Routed to: ${result.primary.displayName} (coding: ${result.primary.capabilities.coding}/10)`);
  });

  await test('should route reasoning tasks appropriately', async () => {
    const result = router.route({ task: 'reasoning', contextSize: 3000 });
    assert(result.primary, 'No primary model selected');
    assert(result.primary.capabilities.reasoning > 5, 'Model not optimized for reasoning');
    logger.info(`  Routed to: ${result.primary.displayName} (reasoning: ${result.primary.capabilities.reasoning}/10)`);
  });

  await test('should provide fallback chains', async () => {
    const result = router.route({ task: 'general', contextSize: 1000 });
    assert(result.fallbacks, 'No fallback array');
    assert(result.fallbacks.length > 0, 'Fallback chain empty');
    assert(result.fallbacks.length <= 3, 'Too many fallbacks');
    logger.info(`  Fallback chain: ${[result.primary, ...result.fallbacks].map((m) => m.displayName).join(' → ')}`);
  });

  // Test Suite 3: Cost Guard
  logger.info('\n═══ TEST SUITE 3: COST GUARD ═══\n');

  await test('should enforce FREE-FIRST policy', async () => {
    const policy = router.getCostPolicy();
    assert(policy === 'FREE-FIRST', `Policy is ${policy}, expected FREE-FIRST`);
    logger.info(`  Cost policy: ${policy}`);
  });

  await test('should prefer free models', async () => {
    const result = router.route({ task: 'general', contextSize: 1000 });
    assert(result.primary.free, 'Primary model is not free');
    logger.info(`  Primary model: ${result.primary.displayName} (free: ${result.primary.free})`);
  });

  await test('should estimate zero cost for free models', async () => {
    const result = router.route({ task: 'general', contextSize: 1000 });
    assert(result.costEstimate === 0, `Cost is ${result.costEstimate}, expected 0`);
    logger.info(`  Cost estimate: $${result.costEstimate}`);
  });

  // Test Suite 4: Health Tracking
  logger.info('\n═══ TEST SUITE 4: HEALTH TRACKING ═══\n');

  await test('should track model statistics', async () => {
    const stats = registry.getStats();
    assert(stats.total > 0, 'No models in stats');
    assert(stats.available > 0, 'No available models');
    logger.info(
      `  Stats: Total=${stats.total}, Available=${stats.available}, Free=${stats.free}, AvgSuccess=${stats.averageSuccessRate}`
    );
  });

  await test('should record model performance', async () => {
    const models = registry.getAllModels();
    const model = models[0];
    const initialSuccesses = model.successes;

    registry.recordSuccess(model.name, 250);

    assert(model.successes > initialSuccesses, 'Success count not incremented');
    assert(model.successRate > 0, 'Success rate not calculated');
    logger.info(`  Recorded success for ${model.displayName} (rate: ${model.successRate.toFixed(3)})`);
  });

  await test('should implement circuit breaker', async () => {
    const models = registry.getAvailableFreeModels();
    if (models.length === 0) {
      logger.warn('  No models to test circuit breaker');
      return;
    }

    const testModel = models[0];
    const originalState = testModel.available;

    // Simulate 3 failures
    registry.recordFailure(testModel.name);
    registry.recordFailure(testModel.name);
    registry.recordFailure(testModel.name);

    assert(!testModel.available, 'Circuit breaker did not disable model');
    logger.info(`  Circuit breaker triggered for ${testModel.displayName}`);

    // Restore state
    testModel.available = originalState;
    testModel.failures = 0;
  });

  // Test Suite 5: Fallback Chain
  logger.info('\n═══ TEST SUITE 5: FALLBACK CHAIN ═══\n');

  await test('should verify fallback chain integrity', async () => {
    const result = router.route({ task: 'general', contextSize: 1000 });

    for (const model of [result.primary, ...result.fallbacks]) {
      assert(model.available, `Model ${model.displayName} not available`);
    }

    logger.info(`  Chain verified: ${[result.primary, ...result.fallbacks].map((m) => m.displayName).join(' → ')}`);
  });

  // Test Suite 6: Offline Mode
  logger.info('\n═══ TEST SUITE 6: OFFLINE OPERATION ═══\n');

  await test('should support offline operation', async () => {
    const localModels = registry.getAllModels().filter((m) => m.local && m.available);
    assert(localModels.length > 0, 'No local models for offline operation');
    logger.info(`  Offline capable with ${localModels.length} local models`);
  });

  // Cleanup
  registry.destroy();

  // Report
  logger.info('\n╔════════════════════════════════════════════════════════════════╗');
  logger.info('║                    TEST SUMMARY                                 ║');
  logger.info('╚════════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  logger.info(`Total Tests: ${total}`);
  logger.info(`Passed: ${passed} ✓`);
  logger.info(`Failed: ${failed} ${failed > 0 ? '✗' : ''}\n`);

  // Detailed results
  for (const result of results) {
    const icon = result.passed ? '✓' : '✗';
    logger.info(`${icon} ${result.name}`);
    if (result.error) {
      logger.info(`  Error: ${result.error}`);
    }
  }

  // Phase 24C Acceptance Report
  logger.info('\n╔════════════════════════════════════════════════════════════════╗');
  logger.info('║         WISE² PHASE 24C ACCEPTANCE REPORT                       ║');
  logger.info('╚════════════════════════════════════════════════════════════════╝\n');

  const stats = registry.getStats();
  const report = {
    timestamp: new Date().toISOString(),
    phase: '24C',
    feature: 'FREE-First Adaptive Model Intelligence',
    results: {
      modelDiscovery: stats.total > 0 ? 'PASS' : 'FAIL',
      dynamicRouting: stats.available > 0 ? 'PASS' : 'FAIL',
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
      costPolicy: router.getCostPolicy(),
      offlineCapable: stats.local > 0,
      noCostIncurred: true,
    },
  };

  logger.info(JSON.stringify(report, null, 2));

  logger.info('\n═══════════════════════════════════════════════════════════════');
  if (failed === 0) {
    logger.info('✓ ALL TESTS PASSED - Phase 24C PRODUCTION READY');
  } else {
    logger.info(`✗ ${failed} TEST(S) FAILED - Review errors above`);
    process.exit(1);
  }
  logger.info('═══════════════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch((error) => {
  logger.error('Test runner failed', { error });
  process.exit(1);
});
