import express, { Request, Response } from 'express';
import { execSync } from 'child_process';

const app = express();
app.use(express.json());

// Simple intelligent router
function route(prompt: string, priority = 'speed') {
  const len = prompt.length;
  const isCode = /def |function |const |=>|{|}/i.test(prompt);
  const isComplex = /explain|analyze|theory|algorithm/i.test(prompt);

  if (isCode) return { gpu: 'local', model: 'wise2-coder-m4', reason: 'Code detected' };
  if (priority === 'quality') return { gpu: 'local', model: 'wise2-m4', reason: 'Quality priority' };
  if (len < 100) return { gpu: 'vps', model: 'mistral:latest', reason: 'Short query → VPS speed' };
  return { gpu: 'local', model: 'wise2-m4', reason: 'Long query → M4 quality' };
}

// POST /query - Execute with routing
app.post('/query', async (req: Request, res: Response) => {
  try {
    const { prompt, priority } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const start = Date.now();
    const decision = route(prompt, priority);

    try {
      const result = execSync(`wise-ai ${decision.gpu} "${prompt.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024,
      });
      res.json({
        result: result.trim(),
        decision,
        elapsedTime: (Date.now() - start) / 1000,
      });
    } catch (e) {
      res.json({ result: `Error: ${e}`, decision, elapsedTime: (Date.now() - start) / 1000 });
    }
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET /status - Health check
app.get('/status', (req: Request, res: Response) => {
  try {
    const status = execSync('wise-ai status', { encoding: 'utf-8' });
    res.json({ status });
  } catch (e) {
    res.status(500).json({ error: 'System unavailable' });
  }
});

// GET /models - List all models
app.get('/models', (req: Request, res: Response) => {
  try {
    const models = execSync('wise-ai models', { encoding: 'utf-8' });
    res.json({ models });
  } catch (e) {
    res.status(500).json({ error: 'Could not fetch models' });
  }
});

// POST /route - Preview routing
app.post('/route', (req: Request, res: Response) => {
  const { prompt, priority } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  const decision = route(prompt, priority);
  res.json({ decision });
});

const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`🤖 WISE² AI Backend running on port ${PORT}`);
});
