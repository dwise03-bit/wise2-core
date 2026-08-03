import express from 'express';
import { Server } from 'ws';
import { v4 as uuid } from 'uuid';
import pino from 'pino';
import { SyncManager } from './sync/SyncManager.js';
import { VaultStateManager } from './vault/VaultStateManager.js';
import { setupWebSocketHandlers } from './ws/handlers.js';
import { setupAPIRoutes } from './api/routes.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Initialize vault state manager
const vaultManager = new VaultStateManager();

// Initialize sync manager
const syncManager = new SyncManager(vaultManager);

// WebSocket server for real-time sync
const server = app.listen(PORT, () => {
  logger.info(`Second Brain Sync Engine running on port ${PORT}`);
});

const wss = new Server({ server });

wss.on('connection', (ws) => {
  const clientId = uuid();
  logger.info(`Client connected: ${clientId}`);

  setupWebSocketHandlers(ws, clientId, syncManager, vaultManager, logger);
});

// API Routes
setupAPIRoutes(app, vaultManager, syncManager, logger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connectedClients: wss.clients.size,
    documents: vaultManager.getDocumentCount(),
  });
});

export { app, wss, syncManager, vaultManager };
