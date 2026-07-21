import pino from 'pino';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { EdgeRuntime, EdgeRuntimeConfig } from './EdgeRuntime';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const ENVIRONMENT = (process.env.NODE_ENV as
  | 'production'
  | 'development'
  | 'testing') || 'production';
const NODE_ID = process.env.NODE_ID || 'edge-node-1';
const CLOUD_URL = process.env.CLOUD_URL || 'https://api.wise2.cloud';
const API_KEY = process.env.API_KEY || '';
const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH || '/data/wise2-edge.db';
const MODEL_PATH = process.env.MODEL_PATH || '/models';
const VOICE_MODEL = process.env.VOICE_MODEL || 'mistral';
const WIREGUARD_CONFIG_PATH =
  process.env.WIREGUARD_CONFIG_PATH || '/etc/wireguard/wise2.conf';

let runtime: EdgeRuntime | null = null;
let app: Express | null = null;

async function initializeRuntime(): Promise<void> {
  const config: EdgeRuntimeConfig = {
    nodeId: NODE_ID,
    cloudUrl: CLOUD_URL,
    apiKey: API_KEY,
    localDbPath: LOCAL_DB_PATH,
    modelPath: MODEL_PATH,
    voiceModel: VOICE_MODEL,
    wireguardConfigPath: WIREGUARD_CONFIG_PATH,
    offlineMode: process.env.OFFLINE_MODE === 'true',
    port: parseInt(PORT as string, 10),
    environment: ENVIRONMENT,
  };

  runtime = new EdgeRuntime(config);
  await runtime.initialize();
}

function setupWebServer(): void {
  if (!runtime) throw new Error('Runtime not initialized');

  app = express();

  // Middleware
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    const status = runtime!.getStatus();
    res.json(status);
  });

  // Status endpoint
  app.get('/status', (req: Request, res: Response) => {
    const status = runtime!.getStatus();
    res.json(status);
  });

  // Commands endpoint
  app.post('/commands', async (req: Request, res: Response) => {
    try {
      const { command } = req.body;
      if (!command) {
        return res.status(400).json({ error: 'Command is required' });
      }

      const agent = runtime!.getAgent();
      const result = await agent.processCommand(command);
      res.json(result);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Voice control endpoint
  app.post('/voice/speak', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const voice = runtime!.getVoice();
      await voice.speak(text);
      res.json({ success: true, text });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // GPIO control endpoint
  app.post('/gpio/:pin', async (req: Request, res: Response) => {
    try {
      const { pin } = req.params;
      const { mode, value } = req.body;

      const hardware = runtime!.getHardware();
      await hardware.setGPIO(parseInt(pin, 10), mode, value);

      res.json({ success: true, pin, mode, value });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Automation triggers endpoint
  app.get('/automations/triggers', (req: Request, res: Response) => {
    try {
      const automation = runtime!.getAutomation();
      const triggers = automation.getTriggers();
      res.json(triggers);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/automations/triggers', async (req: Request, res: Response) => {
    try {
      const { name, type, config, actions, enabled } = req.body;

      const automation = runtime!.getAutomation();
      const triggerId = await automation.createTrigger({
        id: '',
        name,
        type,
        config,
        actions: actions || [],
        enabled: enabled !== false,
      });

      res.json({ triggerId });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Health metrics endpoint
  app.get('/health/metrics', (req: Request, res: Response) => {
    try {
      const health = runtime!.getHealth();
      const metrics = health.getMetrics();
      res.json(metrics);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Health report endpoint
  app.get('/health/report', async (req: Request, res: Response) => {
    try {
      const health = runtime!.getHealth();
      const report = await health.generateHealthReport();
      res.type('text/plain').send(report);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Sync endpoint
  app.post('/sync', async (req: Request, res: Response) => {
    try {
      const sync = runtime!.getSync();
      await sync.sync();
      res.json({ success: true });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Camera endpoint
  app.post('/camera/capture', async (req: Request, res: Response) => {
    try {
      const hardware = runtime!.getHardware();
      const image = await hardware.captureImage();
      res.type('image/jpeg').send(image);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`WISE² Edge Appliance API listening on port ${PORT}`);
  });
}

async function gracefulShutdown(): Promise<void> {
  console.log('Starting graceful shutdown...');

  try {
    if (runtime) {
      await runtime.shutdown();
    }

    if (app) {
      // Stop Express server if needed
    }

    console.log('Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  try {
    console.log('Starting WISE² Edge Appliance Runtime...');
    console.log(`Environment: ${ENVIRONMENT}`);
    console.log(`Node ID: ${NODE_ID}`);

    // Initialize runtime
    await initializeRuntime();

    // Setup web server
    setupWebServer();

    // Setup signal handlers for graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    console.log('WISE² Edge Appliance Runtime started successfully');
  } catch (error) {
    console.error('Fatal error starting runtime:', error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
