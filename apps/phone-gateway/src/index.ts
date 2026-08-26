/**
 * WISE² Phone Gateway
 * Real-time AI phone orchestration service
 */

import express, { Express, Request, Response } from 'express';
import expressWs from 'express-ws';
import dotenv from 'dotenv';
import { logger } from './logger';
import AsteriskARIClient from './asterisk/ari-client';
import CallOrchestrator from './conversation/call-orchestrator';
import STTService from './services/stt.service';
import LLMService from './services/llm.service';
import TTSService from './services/tts.service';
import {
  getTwilioClient,
  createTwilioWebhookValidator,
  handleInboundSms,
  handleInboundCall as handleTwilioInboundCall,
  handleCallStatus,
  handleRecordingComplete,
  handleTranscriptionComplete,
  getSmsHistory,
  getCallHistory,
} from './providers/twilio';

// Load environment variables
dotenv.config();

const app: Express = express();
const wsApp = expressWs(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Services
const stt = new STTService(process.env.WHISPER_URL);
const llm = new LLMService(
  process.env.HERMES_ENDPOINT,
  process.env.HERMES_CHAT_MODEL
);
const tts = new TTSService(
  process.env.PIPER_URL || 'http://localhost:8080/api/tts'
);

// Call orchestrator
const orchestrator = new CallOrchestrator(stt, llm, tts);

// Asterisk ARI (optional - would be initialized when connecting to real PBX)
let asterisk: AsteriskARIClient | null = null;

// Twilio client (optional - parallel provider)
let twilioClient: ReturnType<typeof getTwilioClient> | null = null;

/**
 * Initialize Twilio client (optional parallel provider)
 */
async function initializeTwilio() {
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      twilioClient = getTwilioClient();
      logger.info('Twilio client initialized');
    } else {
      logger.info('Twilio not configured - Asterisk will handle voice/SMS');
    }
  } catch (error) {
    logger.warn('Twilio initialization failed - falling back to Asterisk:', error);
  }
}

/**
 * Initialize Asterisk connection
 */
async function initializeAsterisk() {
  try {
    if (process.env.ASTERISK_ARI_ENDPOINT) {
      asterisk = new AsteriskARIClient({
        baseUrl: process.env.ASTERISK_ARI_ENDPOINT || 'http://localhost:8088/ari',
        username: process.env.ASTERISK_USERNAME || 'wise2_gateway',
        password: process.env.ASTERISK_PASSWORD || 'wise2_password',
      });

      await asterisk.connect();
      logger.info('Asterisk ARI connected');

      // Wire up inbound call events
      asterisk.on('inbound-call', async (event) => {
        logger.info(`Inbound call from ${event.callerId}`);
        await handleInboundCall(event.channelId, event.callerId);
      });

      asterisk.on('channel-hangup', async (event) => {
        const call = orchestrator.getCallState(
          findCallByChannelId(event.channelId)
        );
        if (call) {
          await orchestrator.endCall(call.callId, 'channel-hangup');
        }
      });
    }
  } catch (error) {
    logger.warn('Asterisk ARI not available, running in local mode:', error);
  }
}

/**
 * Find call ID by channel ID (helper)
 */
function findCallByChannelId(channelId: string): string {
  for (const call of orchestrator.getActiveCalls()) {
    if (call.channelId === channelId) {
      return call.callId;
    }
  }
  return '';
}

/**
 * Handle inbound call
 */
async function handleInboundCall(channelId: string, callerId: string) {
  try {
    // Initialize call session
    const callState = orchestrator.initializeCall(channelId, callerId);

    // Answer the call
    if (asterisk) {
      await asterisk.answerCall(channelId);
    }

    // Play greeting
    const greeting = `Hey, you reached WISE² HVAC Solutions. I'm Daniel's AI assistant. Tell me what's going on.`;
    await orchestrator.playGreeting(callState.callId, greeting);

    // TODO: Start listening for caller speech via audio streaming
  } catch (error) {
    logger.error(`Failed to handle inbound call ${channelId}:`, error);

    if (asterisk) {
      await asterisk.hangupCall(channelId);
    }
  }
}

// ============================
// REST API ENDPOINTS
// ============================

// ============================
// TWILIO WEBHOOK ROUTES
// ============================

// Twilio webhook validator middleware (if Twilio is configured)
const twilioValidator = process.env.TWILIO_AUTH_TOKEN
  ? createTwilioWebhookValidator(process.env.TWILIO_AUTH_TOKEN)
  : null;

/**
 * Twilio inbound SMS webhook
 */
app.post('/twilio/inbound-sms', twilioValidator || ((req, res, next) => next()), handleInboundSms);

/**
 * Twilio inbound voice webhook
 */
app.post('/twilio/inbound-call', twilioValidator || ((req, res, next) => next()), handleTwilioInboundCall);

/**
 * Twilio call status callback
 */
app.post('/twilio/call-status', twilioValidator || ((req, res, next) => next()), handleCallStatus);

/**
 * Twilio recording complete callback
 */
app.post('/twilio/recording-complete', twilioValidator || ((req, res, next) => next()), handleRecordingComplete);

/**
 * Twilio transcription complete callback
 */
app.post('/twilio/transcription', twilioValidator || ((req, res, next) => next()), handleTranscriptionComplete);

/**
 * Get Twilio SMS history
 */
app.get('/twilio/sms-history', (req: Request, res: Response) => {
  const linkedJob = req.query.linkedJob as string;
  const history = getSmsHistory({ linkedJob });
  res.json({ sms: history });
});

/**
 * Get Twilio call history
 */
app.get('/twilio/call-history', (req: Request, res: Response) => {
  const linkedJob = req.query.linkedJob as string;
  const history = getCallHistory({ linkedJob });
  res.json({ calls: history });
});

// ============================
// REST API ENDPOINTS
// ============================

/**
 * Health check endpoint
 */
app.get('/health', async (req: Request, res: Response) => {
  const sttOk = await stt.health();
  const llmOk = await llm.health();
  const ttsOk = await tts.health();
  const asteriskOk = asterisk ? await asterisk.health() : null;

  res.json({
    status: sttOk && llmOk && ttsOk ? 'healthy' : 'degraded',
    services: {
      stt: sttOk ? 'online' : 'offline',
      llm: llmOk ? 'online' : 'offline',
      tts: ttsOk ? 'online' : 'offline',
      asterisk: asteriskOk === null ? 'not_configured' : asteriskOk ? 'online' : 'offline',
    },
    uptime: process.uptime(),
  });
});

/**
 * Get active calls
 */
app.get('/calls', (req: Request, res: Response) => {
  const calls = orchestrator.getActiveCalls();
  res.json({
    activeCallCount: calls.length,
    calls: calls.map((c) => ({
      callId: c.callId,
      channelId: c.channelId,
      callerId: c.callerId,
      status: c.status,
      duration: Math.floor((Date.now() - c.startTime.getTime()) / 1000),
    })),
  });
});

/**
 * Get call details
 */
app.get('/calls/:callId', (req: Request, res: Response) => {
  const call = orchestrator.getCallState(req.params.callId);

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  res.json({
    callId: call.callId,
    channelId: call.channelId,
    callerId: call.callerId,
    status: call.status,
    duration: Math.floor((Date.now() - call.startTime.getTime()) / 1000),
    turns: call.conversationTurns.length,
    transcript: call.conversationTurns.map((t) => ({
      role: t.role,
      text: t.text,
      timestamp: t.timestamp,
    })),
  });
});

/**
 * Simulate inbound call (for testing without Asterisk)
 */
app.post('/test/inbound-call', async (req: Request, res: Response) => {
  const { callerId = '+1234567890', script = [] } = req.body;

  try {
    const callState = orchestrator.initializeCall('test-channel', callerId);

    // Play greeting
    const greeting = `Hey, you reached WISE² HVAC Solutions. I'm Daniel's AI assistant. Tell me what's going on.`;
    await orchestrator.playGreeting(callState.callId, greeting);

    // Simulate caller messages
    for (const message of script) {
      // Capture speech
      const transcribed = await orchestrator.captureSpeech(
        callState.callId,
        Buffer.from(message), // Mock: treat string as buffer
        true
      );

      // Generate response
      const response = await orchestrator.generateResponse(callState.callId);

      // Speak response
      await orchestrator.speakResponse(callState.callId, response.text);

      // Execute any tool calls
      if (response.toolCalls.length > 0) {
        await orchestrator.executeToolCalls(callState.callId, response.toolCalls);
      }
    }

    // End call
    const summary = await orchestrator.endCall(callState.callId, 'test-complete');

    res.json({
      callId: callState.callId,
      summary,
      duration: Math.floor(
        (Date.now() - callState.startTime.getTime()) / 1000
      ),
    });
  } catch (error) {
    logger.error('Test call failed:', error);
    res.status(500).json({ error: String(error) });
  }
});

/**
 * WebSocket for real-time call events
 */
wsApp.app.ws('/ws/calls', (ws, req) => {
  logger.info('WebSocket client connected');

  // Send active calls on connect
  const calls = orchestrator.getActiveCalls();
  ws.send(
    JSON.stringify({
      event: 'active-calls',
      data: calls,
    })
  );

  // Listen for orchestrator events
  const handleCallInitialized = (data: any) => {
    ws.send(JSON.stringify({ event: 'call-initialized', data }));
  };

  const handleResponseGenerated = (data: any) => {
    ws.send(JSON.stringify({ event: 'response-generated', data }));
  };

  const handleCallEnded = (data: any) => {
    ws.send(JSON.stringify({ event: 'call-ended', data }));
  };

  orchestrator.on('call-initialized', handleCallInitialized);
  orchestrator.on('response-generated', handleResponseGenerated);
  orchestrator.on('call-ended', handleCallEnded);

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
    orchestrator.off('call-initialized', handleCallInitialized);
    orchestrator.off('response-generated', handleResponseGenerated);
    orchestrator.off('call-ended', handleCallEnded);
  });
});

// ============================
// STARTUP
// ============================

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    // Initialize communication providers
    await initializeTwilio();
    await initializeAsterisk();

    // Start server
    app.listen(PORT, () => {
      logger.info(`WISE² Phone Gateway running on port ${PORT}`);
      logger.info('Communication providers: ' + (twilioClient ? 'Twilio + ' : '') + (asterisk ? 'Asterisk' : 'Local mode'));
      logger.info('Ready for calls');
    });

    // Periodic audio cleanup
    setInterval(() => {
      tts.cleanup(24).catch((err) => logger.error('Cleanup error:', err));
    }, 60 * 60 * 1000); // Every hour
  } catch (error) {
    logger.error('Startup failed:', error);
    process.exit(1);
  }
}

start();

export default app;
