import express, { Request, Response } from 'express';
import { TailscaleClient } from './tailscale.client';
import { CodexRemoteService } from './codex.service';
import { AIService } from '@wise2/ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize services
const tailscale = new TailscaleClient({
  apiKey: process.env.TAILSCALE_API_KEY || '',
  machineName: process.env.TAILSCALE_MACHINE_NAME || 'wise2-mac',
});

const aiService = new AIService({
  provider: 'chatgpt',
  apiKey: process.env.OPENAI_API_KEY || '',
});

const codexRemote = new CodexRemoteService(aiService);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'tailscale-codex-remote',
    timestamp: new Date().toISOString(),
    tailscale: {
      connected: tailscale.isConnected(),
      machineIP: tailscale.getMachineIP(),
    },
  });
});

// Tailscale status endpoint
app.get('/tailscale/status', async (req: Request, res: Response) => {
  try {
    const status = await tailscale.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get Tailscale status' });
  }
});

// Code completion via Codex/ChatGPT
app.post('/codex/complete', async (req: Request, res: Response) => {
  try {
    const { code, language, prompt } = req.body;

    if (!code || !language) {
      res.status(400).json({ error: 'Missing code or language' });
      return;
    }

    const completion = await codexRemote.completeCode({
      code,
      language,
      context: prompt,
    });

    res.json(completion);
  } catch (error) {
    res.status(500).json({ error: 'Code completion failed' });
  }
});

// Code generation
app.post('/codex/generate', async (req: Request, res: Response) => {
  try {
    const { description, language, style } = req.body;

    if (!description || !language) {
      res.status(400).json({ error: 'Missing description or language' });
      return;
    }

    const generated = await codexRemote.generateCode({
      description,
      language,
      style: style || 'functional',
    });

    res.json(generated);
  } catch (error) {
    res.status(500).json({ error: 'Code generation failed' });
  }
});

// Code explanation
app.post('/codex/explain', async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      res.status(400).json({ error: 'Missing code or language' });
      return;
    }

    const explanation = await codexRemote.explainCode({
      code,
      language,
    });

    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: 'Code explanation failed' });
  }
});

// Connect to Tailscale
app.post('/tailscale/connect', async (req: Request, res: Response) => {
  try {
    await tailscale.connect();
    res.json({
      status: 'connected',
      machineIP: tailscale.getMachineIP(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to Tailscale' });
  }
});

const PORT = process.env.PORT || 3009;

app.listen(PORT, async () => {
  console.log(`🚀 Tailscale Codex Remote Service running on port ${PORT}`);

  try {
    await tailscale.connect();
    console.log(`✅ Tailscale connected: ${tailscale.getMachineIP()}`);
  } catch (error) {
    console.error('⚠️ Tailscale connection failed:', error);
  }
});

export { TailscaleClient, CodexRemoteService };
