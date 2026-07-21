/**
 * Voice Assistant Service
 * REST API and WebSocket server for voice processing
 */

import express, { Express, Request, Response } from 'express';
import http from 'http';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { VoiceProcessor } from './VoiceProcessor';
import { STT } from './STT';
import { TTS } from './TTS';
import { WakeWord } from './WakeWord';

interface VoiceSession {
  id: string;
  userId: string;
  startTime: Date;
  language: string;
  transcript: string[];
  responses: string[];
}

export class VoiceAssistantService {
  private app: Express;
  private server: http.Server;
  private wss: WebSocket.Server;
  private voiceProcessor: VoiceProcessor;
  private sessions: Map<string, VoiceSession> = new Map();
  private wsConnections: Map<string, WebSocket> = new Map();

  constructor(port: number = 3002) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });

    // Initialize voice processor
    this.voiceProcessor = new VoiceProcessor({
      sampleRate: 16000,
      channels: 1,
      encoding: 'LINEAR16',
      enableWakeWord: true,
      wakeWords: ['hey wise', 'okay wise'],
      enableLanguageDetection: true,
      defaultLanguage: 'en',
      maxAudioDuration: 60000,
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();

    this.server.listen(port, () => {
      console.log(`Voice Assistant Service listening on port ${port}`);
    });
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Request logging
    this.app.use((req: Request, _res: Response, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        service: 'voice-assistant',
        uptime: process.uptime(),
      });
    });

    // Status
    this.app.get('/status', (_req: Request, res: Response) => {
      res.json({
        service: 'voice-assistant',
        version: '1.0.0',
        sessions: this.sessions.size,
        connections: this.wsConnections.size,
        supportedLanguages: this.voiceProcessor.getSupportedLanguages(),
      });
    });

    // Transcribe audio (REST endpoint)
    this.app.post('/transcribe', async (req: Request, res: Response) => {
      try {
        const { audio, language = 'en' } = req.body;

        if (!audio) {
          return res.status(400).json({ error: 'Audio data required' });
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio, 'base64');
        const float32Audio = this.bufferToFloat32(audioBuffer);

        // Transcribe
        const processor = new VoiceProcessor({
          sampleRate: 16000,
          channels: 1,
          encoding: 'LINEAR16',
          enableWakeWord: false,
          wakeWords: [],
          enableLanguageDetection: false,
          defaultLanguage: language,
          maxAudioDuration: 60000,
        });

        // Placeholder response - in production would call actual processor
        res.json({
          transcript: 'Sample transcription from audio.',
          language,
          confidence: 0.95,
          duration: float32Audio.length / 16000,
        });
      } catch (error) {
        res.status(500).json({ error: (error as any).message });
      }
    });

    // Synthesize text to speech
    this.app.post('/synthesize', async (req: Request, res: Response) => {
      try {
        const { text, language = 'en' } = req.body;

        if (!text) {
          return res.status(400).json({ error: 'Text required' });
        }

        const tts = new TTS({
          sampleRate: 16000,
          language,
        });

        const audio = await tts.synthesize(text, language);
        const base64Audio = Buffer.from(audio.buffer).toString('base64');

        res.json({
          audio: base64Audio,
          language,
          duration: audio.length / 16000,
        });
      } catch (error) {
        res.status(500).json({ error: (error as any).message });
      }
    });

    // List supported languages
    this.app.get('/languages', (_req: Request, res: Response) => {
      res.json({
        supported: this.voiceProcessor.getSupportedLanguages(),
      });
    });

    // Set language
    this.app.post('/language', (req: Request, res: Response) => {
      try {
        const { language } = req.body;

        if (!language) {
          return res.status(400).json({ error: 'Language required' });
        }

        this.voiceProcessor.setLanguage(language);

        res.json({
          language,
          message: `Language set to ${language}`,
        });
      } catch (error) {
        res.status(500).json({ error: (error as any).message });
      }
    });

    // Get session history
    this.app.get('/sessions/:userId', (req: Request, res: Response) => {
      const { userId } = req.params;
      const sessions = Array.from(this.sessions.values()).filter(
        (s) => s.userId === userId
      );

      res.json({ sessions });
    });

    // Delete session
    this.app.delete('/sessions/:sessionId', (req: Request, res: Response) => {
      const { sessionId } = req.params;
      const deleted = this.sessions.delete(sessionId);

      res.json({
        deleted,
        message: deleted ? `Session ${sessionId} deleted` : 'Session not found',
      });
    });
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = uuidv4();
      this.wsConnections.set(clientId, ws);

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on('message', async (data: string) => {
        try {
          const message = JSON.parse(data);
          await this.handleWebSocketMessage(clientId, message, ws);
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            error: (error as any).message,
          }));
        }
      });

      ws.on('close', () => {
        this.wsConnections.delete(clientId);
        console.log(`WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
        this.wsConnections.delete(clientId);
      });
    });
  }

  private async handleWebSocketMessage(
    clientId: string,
    message: any,
    ws: WebSocket
  ): Promise<void> {
    const { type, data, userId = 'anonymous' } = message;

    switch (type) {
      case 'start-session':
        this.handleStartSession(clientId, userId, ws);
        break;

      case 'audio-chunk':
        await this.handleAudioChunk(clientId, userId, data, ws);
        break;

      case 'stop-session':
        this.handleStopSession(clientId, ws);
        break;

      case 'set-language':
        this.handleSetLanguage(clientId, data, ws);
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${type}`,
        }));
    }
  }

  private handleStartSession(
    clientId: string,
    userId: string,
    ws: WebSocket
  ): void {
    const sessionId = uuidv4();

    const session: VoiceSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      language: 'en',
      transcript: [],
      responses: [],
    };

    this.sessions.set(sessionId, session);

    ws.send(JSON.stringify({
      type: 'session-started',
      sessionId,
      message: 'Ready to receive audio',
    }));
  }

  private async handleAudioChunk(
    clientId: string,
    userId: string,
    audioData: string,
    ws: WebSocket
  ): Promise<void> {
    try {
      // Convert base64 to buffer
      const audioBuffer = Buffer.from(audioData, 'base64');
      const float32Audio = this.bufferToFloat32(audioBuffer);

      // Process audio
      ws.send(JSON.stringify({
        type: 'processing',
        message: 'Processing audio chunk',
      }));

      // Placeholder processing
      ws.send(JSON.stringify({
        type: 'transcript',
        text: 'Sample transcription of audio chunk',
        language: 'en',
        confidence: 0.95,
      }));

      ws.send(JSON.stringify({
        type: 'response',
        text: 'This is a sample response to your audio.',
        audioAvailable: true,
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: (error as any).message,
      }));
    }
  }

  private handleStopSession(clientId: string, ws: WebSocket): void {
    ws.send(JSON.stringify({
      type: 'session-ended',
      message: 'Session closed',
    }));
  }

  private handleSetLanguage(
    clientId: string,
    data: any,
    ws: WebSocket
  ): void {
    const { language } = data;

    if (!language) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Language required',
      }));
      return;
    }

    this.voiceProcessor.setLanguage(language);

    ws.send(JSON.stringify({
      type: 'language-set',
      language,
      message: `Language set to ${language}`,
    }));
  }

  private bufferToFloat32(buffer: Buffer): Float32Array {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const output = new Float32Array(buffer.length / 2);

    for (let i = 0, offset = 0; i < output.length; i++, offset += 2) {
      const s = view.getInt16(offset, true);
      output[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
    }

    return output;
  }
}

// Start service if run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3002', 10);
  new VoiceAssistantService(port);
}

export default VoiceAssistantService;
