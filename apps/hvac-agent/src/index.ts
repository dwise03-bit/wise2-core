import express, { Request, Response } from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import dotenv from 'dotenv';
import { AgentController } from './controllers/agent-controller';
import { VoiceProcessor } from './voice/voice-processor';
import { AIEngine } from './ai/ai-engine';
import { ContextManager } from './context/context-manager';

dotenv.config();

const app = express();
const appWithWs = expressWs(app).app;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize services
const aiEngine = new AIEngine();
const contextManager = new ContextManager();
const voiceProcessor = new VoiceProcessor();
const agentController = new AgentController(aiEngine, contextManager, voiceProcessor);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'hvac-agent', version: '1.0.0' });
});

// REST API endpoints
app.post('/api/v1/agent/text', async (req: Request, res: Response) => {
  try {
    const { message, jobId, fieldpieceData, sessionId } = req.body;
    const response = await agentController.handleTextMessage(
      message,
      jobId,
      fieldpieceData,
      sessionId
    );
    res.json(response);
  } catch (error) {
    console.error('Text message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// WebSocket for real-time voice + chat
(appWithWs as any).ws('/api/v1/agent/voice', (ws: any, req: Request) => {
  const sessionId = req.query.sessionId as string;
  agentController.handleVoiceSession(ws, sessionId);
});

// Start server
const PORT = process.env.PORT || 3016;
app.listen(PORT, () => {
  console.log(`🤖 HVAC Agent running on port ${PORT}`);
  console.log(`🎙️  Voice WebSocket: ws://localhost:${PORT}/api/v1/agent/voice`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/v1/agent/text`);
});
