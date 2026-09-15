import express from 'express';
import { execSync } from 'child_process';
import { WISERouter } from './router';

const app = express();
const router = new WISERouter();

app.use(express.json());

interface QueryRequest {
  prompt: string;
  priority?: 'speed' | 'quality' | 'cost';
  verbose?: boolean;
}

interface QueryResponse {
  result: string;
  decision: {
    gpu: string;
    model: string;
    reason: string;
    estimatedTime: number;
    cost: { api: number; hardware: number; total: number };
  };
  elapsedTime: number;
  tokensGenerated?: number;
}

// POST /query — Execute query with intelligent routing
app.post('/query', async (req: express.Request, res: express.Response) => {
  try {
    const { prompt, priority, verbose } = req.body as QueryRequest;

    if (!prompt) {
      return res.status(400).json({ error: 'prompt required' });
    }

    const start = Date.now();

    // Route decision
    const decision = router.route(prompt, priority);
    const cost = router.estimateCost(decision);

    if (verbose) {
      console.log(`[ROUTER] GPU: ${decision.gpu}, Model: ${decision.model}`);
      console.log(`[REASON] ${decision.reason}`);
    }

    // Execute query
    let result: string;
    try {
      const cmd = `wise-ai ${decision.gpu} "${prompt.replace(/"/g, '\\"')}"`;
      result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    } catch (e) {
      result = `Error: ${e instanceof Error ? e.message : 'Unknown error'}`;
    }

    const elapsedTime = (Date.now() - start) / 1000;

    res.json({
      result: result.trim(),
      decision: {
        gpu: decision.gpu,
        model: decision.model,
        reason: decision.reason,
        estimatedTime: decision.estimatedTime,
        cost,
      },
      elapsedTime,
    } as QueryResponse);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /batch — Execute multiple queries in parallel
app.post('/batch', async (req: express.Request, res: express.Response) => {
  try {
    const { prompts, priority } = req.body;

    if (!Array.isArray(prompts)) {
      return res.status(400).json({ error: 'prompts must be array' });
    }

    const results = await Promise.all(
      prompts.map(async (prompt) => {
        try {
          const response = await new Promise<QueryResponse>((resolve, reject) => {
            // Simulate POST to /query
            const decision = router.route(prompt, priority);
            const cost = router.estimateCost(decision);
            const start = Date.now();

            try {
              const cmd = `wise-ai ${decision.gpu} "${prompt.replace(/"/g, '\\"')}"`;
              const result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
              const elapsedTime = (Date.now() - start) / 1000;

              resolve({
                result: result.trim(),
                decision: {
                  gpu: decision.gpu,
                  model: decision.model,
                  reason: decision.reason,
                  estimatedTime: decision.estimatedTime,
                  cost,
                },
                elapsedTime,
              });
            } catch (e) {
              reject(e);
            }
          });
          return response;
        } catch (e) {
          return {
            result: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
            decision: { gpu: 'unknown', model: 'unknown', reason: 'error', estimatedTime: 0, cost: { api: 0, hardware: 0, total: 0 } },
            elapsedTime: 0,
          };
        }
      }),
    );

    res.json({ results, totalTime: results.reduce((sum, r) => sum + r.elapsedTime, 0) });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// GET /status — System health
app.get('/status', (req: express.Request, res: express.Response) => {
  try {
    const status = execSync('wise-ai status', { encoding: 'utf-8' });
    res.json({ status });
  } catch (e) {
    res.status(500).json({ error: 'System unavailable' });
  }
});

// GET /models — List all models
app.get('/models', (req: express.Request, res: express.Response) => {
  try {
    const models = execSync('wise-ai models', { encoding: 'utf-8' });
    res.json({ models });
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch models' });
  }
});

// POST /route — Preview routing decision
app.post('/route', (req: express.Request, res: express.Response) => {
  try {
    const { prompt, priority } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const decision = router.route(prompt, priority);
    const cost = router.estimateCost(decision);

    res.json({ decision, cost });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /pull — Add model to GPU
app.post('/pull', (req: express.Request, res: express.Response) => {
  try {
    const { model, target = 'local' } = req.body;
    if (!model) return res.status(400).json({ error: 'model required' });

    const cmd = `wise-ai pull ${model} ${target}`;
    const result = execSync(cmd, { encoding: 'utf-8' });

    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`🤖 WISE² AI Assistant running on port ${PORT}`);
  console.log(`   POST   /query    — Execute with smart routing`);
  console.log(`   POST   /batch    — Execute multiple queries`);
  console.log(`   GET    /status   — System health`);
  console.log(`   GET    /models   — List models`);
  console.log(`   POST   /route    — Preview routing`);
  console.log(`   POST   /pull     — Add model`);
});
