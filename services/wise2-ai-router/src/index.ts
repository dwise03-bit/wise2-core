/**
 * WISE² AI Router - Main Express App
 * Credit Saver Engine: LOCAL-first AI with budget enforcement
 */

import express from 'express';
import pinoHttp from 'pino-http';
import { Pool } from 'pg';
import { OllamaProvider } from './providers/ollama';
import { BudgetEngine } from './budget/engine';
import { TelemetryLogger } from './telemetry/logger';
import { AIRouter } from './router';
import { HealthChecker } from './health/checks';
import { initializeSchema } from './telemetry/schema';
import { validateRequest, validateApiKey } from './middleware/validation';
import { errorHandler } from './middleware/error-handler';
import { DEFAULT_THRESHOLDS, DEFAULT_DAILY_BUDGET_USD } from './budget/thresholds';

const app = express();
const port = parseInt(process.env.ROUTER_PORT || '3100', 10);
const logLevel = process.env.LOG_LEVEL || 'info';

// Logging
app.use(pinoHttp({ level: logLevel }));

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Initialize components
let router: AIRouter;
let healthChecker: HealthChecker;
const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.ROUTER_DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Initialize on startup
async function initialize() {
  try {
    console.log('🚀 Starting WISE² AI Router...');

    // Initialize database
    console.log('📊 Initializing telemetry schema...');
    await initializeSchema(dbPool);

    // Setup providers
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    const modelPriority = (process.env.OLLAMA_MODEL_PRIORITY || '').split(',').filter(Boolean);
    const ollama = new OllamaProvider(ollamaUrl, modelPriority);

    console.log(`🤖 Ollama configured at ${ollamaUrl}`);

    // Setup budget engine
    const budget = new BudgetEngine({
      dailyBudget: parseFloat(process.env.DAILY_BUDGET_USD || String(DEFAULT_DAILY_BUDGET_USD)),
      warnPct: parseInt(process.env.BUDGET_WARN_PCT || String(DEFAULT_THRESHOLDS.WARN_PCT)),
      compressPct: parseInt(process.env.BUDGET_COMPRESS_PCT || String(DEFAULT_THRESHOLDS.COMPRESS_PCT)),
      restrictPct: parseInt(process.env.BUDGET_RESTRICT_PCT || String(DEFAULT_THRESHOLDS.RESTRICT_PCT)),
      brakePct: parseInt(process.env.BUDGET_BRAKE_PCT || String(DEFAULT_THRESHOLDS.BRAKE_PCT)),
    });

    console.log(`💰 Budget: $${budget.getStatus().daily_budget}/day`);

    // Setup telemetry
    const telemetry = new TelemetryLogger(
      dbPool,
      process.env.TELEMETRY_ENABLED !== 'false',
      process.env.TELEMETRY_REDACTION !== 'false'
    );

    console.log('📝 Telemetry configured');

    // Setup router
    router = new AIRouter(ollama, budget, telemetry);
    healthChecker = new HealthChecker(ollama, dbPool);

    console.log('✅ Router initialized');

    // Verify Ollama connectivity
    const ollamaHealthy = await ollama.isHealthy();
    if (!ollamaHealthy) {
      console.warn('⚠️ Ollama is not responding - local inference will fail');
    } else {
      console.log('✅ Ollama is healthy');
    }
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Health endpoints (no auth required)
app.get('/health', async (_req, res) => {
  const health = await healthChecker.check();
  res.status(health.ok ? 200 : 503).json(health);
});

app.get('/ready', async (_req, res) => {
  const readiness = await healthChecker.ready();
  res.status(readiness.ready ? 200 : 503).json(readiness);
});

// Metrics endpoint (Prometheus format)
app.get('/metrics', (_req, res) => {
  const budgetStatus = router['budget'].getStatus();

  const metrics = `
# HELP ai_router_budget_used_pct Daily budget usage percentage
# TYPE ai_router_budget_used_pct gauge
ai_router_budget_used_pct ${budgetStatus.used_pct}

# HELP ai_router_budget_remaining Remaining daily budget in USD
# TYPE ai_router_budget_remaining gauge
ai_router_budget_remaining ${budgetStatus.remaining}
`;

  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(metrics);
});

// Router endpoints (require auth)
app.post('/api/generate', validateApiKey, validateRequest, async (req, res, next) => {
  try {
    const response = await router.route(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

app.get('/api/models', validateApiKey, async (_req, res, next) => {
  try {
    const ollama = router['ollama'] as OllamaProvider;
    const models = await ollama.listModels();
    res.json({ models });
  } catch (error) {
    next(error);
  }
});

app.get('/api/status', validateApiKey, (_req, res) => {
  const budgetStatus = router['budget'].getStatus();
  res.json(budgetStatus);
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start() {
  await initialize();

  app.listen(port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  WISE² AI Router - Credit Saver Engine                   ║
║  Running on port ${port}                                      │
║                                                          ║
║  Routes:                                                │
║    POST   /api/generate      - Generate AI response     │
║    GET    /api/models        - List available models    │
║    GET    /api/status        - Budget status            │
║    GET    /health            - Health check             │
║    GET    /ready             - Readiness probe          │
║    GET    /metrics           - Prometheus metrics       │
╚══════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await dbPool.end();
  process.exit(0);
});

start().catch(console.error);

export default app;
