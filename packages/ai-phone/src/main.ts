import express, { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { CallSessionManager } from './call-session';
import { CRMMock } from './crm-mock';
import { SchedulerMock } from './scheduler-mock';
import { ToolRegistry } from './tool-registry';
import { VoiceOrchestrator } from './voice-orchestrator';
import { createVoiceModel } from './openai-realtime-provider';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize providers and managers
const crm = new CRMMock();
const scheduler = new SchedulerMock();
const sessionManager = new CallSessionManager();
const toolRegistry = new ToolRegistry(crm, scheduler);
const voiceModel = createVoiceModel();
const orchestrator = new VoiceOrchestrator(voiceModel, sessionManager, toolRegistry);

// Middleware
app.use(express.json());

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    provider: voiceModel.name,
    crm: crm.name,
    scheduler: scheduler.name,
  });
});

// Initialize call session
app.post('/calls/init', async (req: Request, res: Response) => {
  try {
    const { tenantId = 'default-tenant', fromNumber } = req.body;

    const callId = uuid();
    const session = sessionManager.createSession(callId, tenantId, toolRegistry.getTools());

    res.json({
      success: true,
      callId,
      sessionId: session.sessionId,
      message: 'Call session initialized',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Process user message
app.post('/calls/:sessionId/message', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session ${sessionId} not found`,
      });
    }

    const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
      sessionId,
      message
    );

    res.json({
      success: true,
      response,
      shouldTransfer,
      sessionId,
      state: session.state,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get session summary
app.get('/calls/:sessionId/summary', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const summary = sessionManager.getSummary(sessionId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: `Session ${sessionId} not found`,
      });
    }

    res.json({
      success: true,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// End call
app.post('/calls/:sessionId/end', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { disposition = 'completed' } = req.body;

    sessionManager.endSession(sessionId, disposition);
    const summary = sessionManager.getSummary(sessionId);

    res.json({
      success: true,
      message: 'Call ended',
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get CRM stats
app.get('/stats', (req: Request, res: Response) => {
  res.json({
    sessions: sessionManager.getAllSessions().length,
    crm: crm.getStats(),
  });
});

// Test: Scripted conversation
app.post('/test/conversation', async (req: Request, res: Response) => {
  try {
    const { conversation, tenantId = 'default-tenant' } = req.body;

    if (!Array.isArray(conversation)) {
      return res.status(400).json({
        success: false,
        error: 'conversation must be an array of messages',
      });
    }

    // Initialize session
    const callId = uuid();
    const session = sessionManager.createSession(callId, tenantId, toolRegistry.getTools());

    const results = [];

    // Process each message in the conversation
    for (const userMessage of conversation) {
      const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
        session.sessionId,
        userMessage
      );

      results.push({
        userMessage,
        response,
        shouldTransfer,
      });

      if (shouldTransfer) {
        break;
      }
    }

    // End session
    sessionManager.endSession(session.sessionId, 'completed');
    const summary = sessionManager.getSummary(session.sessionId);

    res.json({
      success: true,
      sessionId: session.sessionId,
      conversation: results,
      summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Wise2 AI Phone Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test conversation: POST http://localhost:${PORT}/test/conversation`);
});
