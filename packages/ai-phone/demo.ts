/**
 * Demo: Wise2 AI Phone - Simulated conversation example
 *
 * This demonstrates a complete call session with:
 * 1. Session initialization
 * 2. Multi-turn conversation
 * 3. Tool execution (customer lookup, availability check, booking)
 * 4. Session summary
 */

import { CallSessionManager } from './dist/call-session';
import { CRMMock } from './dist/crm-mock';
import { SchedulerMock } from './dist/scheduler-mock';
import { ToolRegistry } from './dist/tool-registry';
import { VoiceOrchestrator } from './dist/voice-orchestrator';
import { VoiceModelMock } from './dist/voice-model-mock';
import { v4 as uuid } from 'uuid';

async function runDemo() {
  console.log('🎙️  Wise2 AI Phone - Demo\n');

  // Initialize providers
  const crm = new CRMMock();
  const scheduler = new SchedulerMock();
  const sessionManager = new CallSessionManager();
  const toolRegistry = new ToolRegistry(crm, scheduler);
  const voiceModel = new VoiceModelMock();
  const orchestrator = new VoiceOrchestrator(voiceModel, sessionManager, toolRegistry);

  // Create a new call session
  const callId = uuid();
  const session = sessionManager.createSession(callId, 'default-tenant', toolRegistry.getTools());

  console.log(`📞 Incoming call: ${callId}`);
  console.log(`📋 Session ID: ${session.sessionId}\n`);

  // Simulate conversation
  const conversation = [
    'Hi, I need to schedule a service appointment',
    'Yes, I need general consultation',
    'Can you check what times you have available next week?',
    'Thursday at 9 AM sounds perfect',
    'Yes, please book that for me',
  ];

  for (const userMessage of conversation) {
    console.log(`👤 Customer: ${userMessage}`);

    try {
      const { response, shouldTransfer } = await orchestrator.handleConversationTurn(
        session.sessionId,
        userMessage
      );

      console.log(`🤖 AI: ${response}`);
      if (shouldTransfer) {
        console.log('   [Transfer to agent initiated]');
        break;
      }
      console.log('');
    } catch (error) {
      console.error(`❌ Error: ${error}`);
      break;
    }
  }

  // End session and get summary
  sessionManager.endSession(session.sessionId, 'completed');
  const summary = sessionManager.getSummary(session.sessionId);

  console.log('\n📊 Session Summary');
  console.log('─'.repeat(60));
  console.log(`Session ID: ${summary?.sessionId}`);
  console.log(`Call ID: ${summary?.callId}`);
  console.log(`State: ${summary?.state}`);
  console.log(`Messages exchanged: ${(summary as any)?.transcript?.length || 0}`);
  console.log(`Duration: ${summary?.duration}ms`);

  console.log('\n📈 CRM Statistics');
  console.log('─'.repeat(60));
  const stats = crm.getStats();
  console.log(`Customers: ${stats.customers}`);
  console.log(`Leads: ${stats.leads}`);
  console.log(`Calls: ${stats.calls}`);
  console.log(`Bookings: ${stats.bookings}`);
  console.log(`Consents: ${stats.consents}`);

  console.log('\n✅ Demo complete!');
}

// Run the demo
runDemo().catch(console.error);
