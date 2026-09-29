import { CallSessionManager } from './call-session';
import { TwilioProvider } from './twilio-provider';
import { OpenAIRealtimeProvider } from './openai-realtime-provider';
import { VoiceOrchestrator } from './voice-orchestrator';
import { ToolRegistry } from './tool-registry';
import { MediaStreamHandler } from './media-stream-handler';
import { CallRecordingService } from './call-recording-service';
import { CRMMock } from './crm-mock';
import { SchedulerMock } from './scheduler-mock';
import { v4 as uuid } from 'uuid';

export class Phase2Orchestrator {
  private sessionManager: CallSessionManager;
  private twilio: TwilioProvider;
  private openai: OpenAIRealtimeProvider;
  private orchestrator: VoiceOrchestrator;
  private toolRegistry: ToolRegistry;
  private mediaStreams = new Map<string, MediaStreamHandler>();
  private recordingService: CallRecordingService;
  private crm: CRMMock;
  private scheduler: SchedulerMock;

  constructor(twilioKey: string, openaiKey: string) {
    // Initialize all providers
    this.crm = new CRMMock();
    this.scheduler = new SchedulerMock();
    this.sessionManager = new CallSessionManager();
    this.toolRegistry = new ToolRegistry(this.crm, this.scheduler);

    this.twilio = new TwilioProvider({
      accountSid: 'ACxxx',
      authToken: twilioKey,
      phoneNumber: '+1-555-WISE-PHONE',
    });

    this.openai = new OpenAIRealtimeProvider({
      apiKey: openaiKey,
      model: 'gpt-4-realtime-preview-20241217',
      temperature: 0.7,
    });

    this.orchestrator = new VoiceOrchestrator(this.openai, this.sessionManager, this.toolRegistry);
    this.recordingService = new CallRecordingService();
  }

  async handleIncomingCall(from: string, callId: string): Promise<string> {
    console.log(`📞 Incoming call from ${from} (${callId})`);

    // Register call with Twilio
    const callInfo = await this.twilio.incomingCall(
      callId,
      from,
      '+1-555-WISE-PHONE'
    );

    // Accept call
    await this.twilio.acceptCall(callId);

    // Create session
    const session = this.sessionManager.createSession(
      callId,
      'default-tenant',
      this.toolRegistry.getTools()
    );

    // Start recording
    const recording = await this.recordingService.startRecording(
      callId,
      session.sessionId
    );

    // Start media stream (WebSocket connection for real-time audio)
    const wsUrl = `wss://media.twilio.com/stream/${session.sessionId}`;
    const mediaStream = new MediaStreamHandler({
      sessionId: session.sessionId,
      callId,
      sampleRate: 16000,
      encoding: 'linear16',
    });

    try {
      await mediaStream.connect(wsUrl);
      this.mediaStreams.set(session.sessionId, mediaStream);
    } catch (error) {
      console.error(`Failed to connect media stream: ${error}`);
    }

    // Generate initial greeting
    const greeting = await this.orchestrator.handleConversationTurn(
      session.sessionId,
      '[SYSTEM: Call started]'
    );

    console.log(`🤖 AI: ${greeting.response}`);

    return session.sessionId;
  }

  async processAudio(sessionId: string, audioBuffer: Buffer): Promise<string> {
    try {
      // Transcribe audio using OpenAI Whisper
      const transcript = await this.openai.transcribe(audioBuffer);
      console.log(`👤 Customer: ${transcript}`);

      // Process through conversation
      const response = await this.orchestrator.handleConversationTurn(
        sessionId,
        transcript
      );

      // Synthesize response to speech
      const audioResponse = await this.openai.synthesize(response.response);

      // Send audio back through media stream
      const mediaStream = this.mediaStreams.get(sessionId);
      if (mediaStream) {
        mediaStream.sendAudio(audioResponse);
      }

      // Check if transfer needed
      if (response.shouldTransfer) {
        await this.transferCall(sessionId, '+1-555-AGENT-LINE');
      }

      return response.response;
    } catch (error) {
      console.error(`Error processing audio: ${error}`);
      throw error;
    }
  }

  async transferCall(sessionId: string, destination: string): Promise<void> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    console.log(`📞 Transferring call ${session.callId} to ${destination}`);

    await this.twilio.transferCall(session.callId, destination);
    this.sessionManager.updateContext(sessionId, {
      requiresTransfer: false,
    });
  }

  async endCall(sessionId: string): Promise<{ summary: any; recording: any }> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    console.log(`🏁 Ending call ${session.callId}`);

    // End call
    await this.twilio.endCall(session.callId);
    this.sessionManager.endSession(sessionId, 'completed');

    // Stop recording
    const mediaStream = this.mediaStreams.get(sessionId);
    if (mediaStream) {
      mediaStream.disconnect();
      this.mediaStreams.delete(sessionId);
    }

    // Get recordings
    const recordings = await this.recordingService.listRecordings(session.callId);
    let recordingSummary = null;

    if (recordings.length > 0) {
      const recording = recordings[0];
      await this.recordingService.stopRecording(recording.id);
      recordingSummary = await this.recordingService.getRecording(recording.id);
    }

    // Get session summary
    const summary = this.sessionManager.getSummary(sessionId);

    return {
      summary,
      recording: recordingSummary,
    };
  }

  getStats() {
    return {
      activeSessions: this.sessionManager.getAllSessions().length,
      activeMediaStreams: this.mediaStreams.size,
      recordings: this.recordingService.getStats(),
      crm: this.crm.getStats(),
    };
  }
}
