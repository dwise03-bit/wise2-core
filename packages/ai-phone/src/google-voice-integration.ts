/**
 * Google Voice Integration Example
 *
 * This file demonstrates how to use the GoogleVoiceProvider with the
 * AI Phone orchestration system for handling calls through Google Voice.
 */

import {
  CallSessionManager,
  ToolRegistry,
  VoiceOrchestrator,
  GoogleVoiceProvider,
  OpenAIRealtimeProvider,
  CRMMock,
  SchedulerMock,
  VoiceModelMock,
} from './index';

// Example configuration for Google Voice provider
export interface GoogleVoiceIntegrationConfig {
  googleProjectId: string;
  googleServiceAccountKey: string; // JSON string of service account
  googlePhoneNumber: string; // E.164 format: +1-555-0123
  openaiApiKey: string;
}

/**
 * Initialize Google Voice provider with credentials
 */
export async function initializeGoogleVoiceProvider(config: GoogleVoiceIntegrationConfig) {
  // Parse service account credentials
  const credentials = JSON.parse(config.googleServiceAccountKey);

  const googleVoice = new GoogleVoiceProvider({
    projectId: config.googleProjectId,
    credentials,
    phoneNumber: config.googlePhoneNumber,
  });

  console.log(`✅ Google Voice provider initialized for project: ${config.googleProjectId}`);
  return googleVoice;
}

/**
 * Full integration example: incoming call workflow
 */
export async function handleIncomingGoogleVoiceCall(
  config: GoogleVoiceIntegrationConfig,
  incomingPhoneNumber: string,
  googleCallId: string
) {
  // 1. Initialize providers
  const googleVoice = await initializeGoogleVoiceProvider(config);
  const voiceModel = new VoiceModelMock(); // Use OpenAIRealtimeProvider in production
  const crm = new CRMMock();
  const scheduler = new SchedulerMock();

  // 2. Create session manager and tool registry
  const sessionManager = new CallSessionManager();
  const toolRegistry = new ToolRegistry(crm, scheduler);

  // 3. Create orchestrator
  const orchestrator = new VoiceOrchestrator(voiceModel, sessionManager, toolRegistry);

  // 4. Register incoming call with Google Voice provider
  const callId = `call_${Date.now()}`;
  const callInfo = await googleVoice.incomingCall(
    callId,
    incomingPhoneNumber,
    config.googlePhoneNumber,
    googleCallId
  );

  console.log(`📞 Incoming call from ${callInfo.from} to ${callInfo.to}`);

  // 5. Accept the call
  await googleVoice.acceptCall(callId);
  console.log(`✅ Call accepted: ${callId}`);

  // 6. Start media stream for audio communication
  const wsUrl = `ws://localhost:3001/media/stream/${callId}`;
  await googleVoice.startMediaStream(callId, wsUrl);

  // 7. Create call session
  const session = sessionManager.createSession(callId, 'default-tenant', toolRegistry.getTools());
  console.log(`📝 Session created: ${session.sessionId}`);

  // 8. Simulate conversation
  const userMessage = 'Hi, I need to schedule an appointment';
  console.log(`👤 User: ${userMessage}`);

  const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
    session.sessionId,
    userMessage
  );

  console.log(`🤖 Assistant: ${response}`);

  if (shouldTransfer) {
    // Transfer to human agent
    await googleVoice.transferCall(callId, '+1-555-0789'); // Agent extension
    console.log(`📞 Call transferred to agent`);
  }

  // 9. End call
  await googleVoice.endCall(callId);
  sessionManager.endSession(session.sessionId, 'completed');

  // 10. Get summary
  const summary = sessionManager.getSummary(session.sessionId);
  console.log(`\n📊 Call Summary:`);
  console.log(`   Duration: ${summary.duration}ms`);
  console.log(`   Messages: ${summary.messageCount}`);
  console.log(`   Tools Used: ${summary.toolsUsed.length}`);

  return { callInfo, session, summary };
}

/**
 * Example: Outbound call workflow
 */
export async function initiateOutboundGoogleVoiceCall(
  config: GoogleVoiceIntegrationConfig,
  destinationPhoneNumber: string,
  customerId?: string
) {
  // 1. Initialize provider
  const googleVoice = await initializeGoogleVoiceProvider(config);
  const voiceModel = new VoiceModelMock();
  const crm = new CRMMock();
  const scheduler = new SchedulerMock();

  // 2. Create managers
  const sessionManager = new CallSessionManager();
  const toolRegistry = new ToolRegistry(crm, scheduler);
  const orchestrator = new VoiceOrchestrator(voiceModel, sessionManager, toolRegistry);

  // 3. Initiate outbound call
  const callId = `call_${Date.now()}`;
  const callInfo = await googleVoice.initiateOutboundCall(
    callId,
    config.googlePhoneNumber,
    destinationPhoneNumber
  );

  console.log(`📞 Outbound call initiated to ${destinationPhoneNumber}`);

  // 4. Create session
  const session = sessionManager.createSession(callId, 'default-tenant', toolRegistry.getTools());
  if (customerId) {
    sessionManager.updateContext(session.sessionId, {
      // Set customer context if known
    });
  }

  // 5. Wait for connection and process conversation
  // (In production, this would wait for Google Voice to connect the call)

  return { callInfo, session };
}

/**
 * Example: Post-call processing with recording/transcription
 */
export async function processPostCallData(
  googleVoice: GoogleVoiceProvider,
  callId: string
) {
  // Simulate recording being completed
  const recordingId = `rec_${Date.now()}`;
  googleVoice.recordingStarted(callId, recordingId);

  // Get recording URL
  const recording = await googleVoice.getRecording(callId);
  console.log(`🎙️  Call recording available at: ${recording?.url}`);

  // Simulate transcript being generated
  const transcriptId = `trans_${Date.now()}`;
  googleVoice.transcriptReady(callId, transcriptId);

  // Get transcript
  const transcript = await googleVoice.getTranscript(callId);
  console.log(`📝 Call transcript ID: ${transcript?.transcriptId}`);

  return { recording, transcript };
}

/**
 * Multi-provider setup: Use different providers for different business logic
 */
export async function setupMultiProviderSystem() {
  // In production, you might use:
  // - Google Voice for inbound calls (more reliable for US numbers)
  // - Twilio for outbound calls (better routing options)
  // - Different providers by geography or call type

  const googleVoiceConfig: GoogleVoiceIntegrationConfig = {
    googleProjectId: process.env.GOOGLE_PROJECT_ID!,
    googleServiceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
    googlePhoneNumber: process.env.GOOGLE_PHONE_NUMBER || '+1-555-0123',
    openaiApiKey: process.env.OPENAI_API_KEY!,
  };

  const googleVoice = await initializeGoogleVoiceProvider(googleVoiceConfig);

  console.log(`✅ Multi-provider system ready:`);
  console.log(`   📞 Inbound: ${googleVoice.name}`);
  console.log(`   🚀 Outbound: Twilio (configured separately)`);

  return { googleVoice };
}

// Export for testing and integration
export default {
  initializeGoogleVoiceProvider,
  handleIncomingGoogleVoiceCall,
  initiateOutboundGoogleVoiceCall,
  processPostCallData,
  setupMultiProviderSystem,
};
