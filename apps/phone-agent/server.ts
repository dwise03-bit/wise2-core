/**
 * WISE² Trading Assistant - Voice Webhook Server
 * Minimal Express server for Telnyx voice webhook integration
 */

import express from 'express';
import { voiceWebhookRoute } from './handler';

const app = express();
const PORT = process.env.VOICE_WEBHOOK_PORT || 3333;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'voice-webhook-handler' });
});

// Voice webhook endpoint
app.post('/voice/webhook', voiceWebhookRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`[Voice Webhook Server] Listening on port ${PORT}`);
  console.log(`Webhook URL: https://173.208.147.165/voice/webhook`);
});

export default app;
