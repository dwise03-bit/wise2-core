import { CallSessionManager } from './call-session';
import { CRMMock } from './crm-mock';
import { SchedulerMock } from './scheduler-mock';
import { ToolRegistry } from './tool-registry';
import { VoiceOrchestrator } from './voice-orchestrator';
import { VoiceModelMock } from './voice-model-mock';
import { v4 as uuid } from 'uuid';

interface ScriptedConversation {
  name: string;
  description: string;
  scenario: string[];
  expectedOutcome: string;
}

const TEST_CONVERSATIONS: ScriptedConversation[] = [
  {
    name: 'new_customer_booking',
    description: 'New customer calls and books an appointment',
    scenario: [
      'Hi, I need to schedule a service appointment',
      'Yes, I need general consultation',
      'Can you check what times you have available next week?',
      'Thursday at 9 AM sounds good',
      'Yes, that works for me',
    ],
    expectedOutcome: 'booking_created',
  },
  {
    name: 'existing_customer_quick_call',
    description: 'Existing customer calls with a quick question',
    scenario: [
      "Hi, I'm calling about my existing appointment",
      'Yes, I have an account with you',
      'Can you tell me about your cancellation policy?',
      'I might need to cancel my Friday appointment',
      "Thanks, I'll let you know by tomorrow",
    ],
    expectedOutcome: 'no_action',
  },
  {
    name: 'customer_transfer_request',
    description: 'Customer requests transfer to human agent',
    scenario: [
      'Hi, I need to speak with someone about a billing issue',
      'This is related to my last invoice',
      'I think there might be an error on my account',
      'Can I please speak to an agent?',
    ],
    expectedOutcome: 'transfer_to_agent',
  },
];

export class TestHarness {
  private sessionManager: CallSessionManager;
  private crm: CRMMock;
  private scheduler: SchedulerMock;
  private toolRegistry: ToolRegistry;
  private orchestrator: VoiceOrchestrator;

  constructor() {
    this.crm = new CRMMock();
    this.scheduler = new SchedulerMock();
    this.sessionManager = new CallSessionManager();
    this.toolRegistry = new ToolRegistry(this.crm, this.scheduler);

    const voiceModel = new VoiceModelMock();
    this.orchestrator = new VoiceOrchestrator(voiceModel, this.sessionManager, this.toolRegistry);
  }

  async runConversation(conv: ScriptedConversation): Promise<ConversationResult> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test: ${conv.name}`);
    console.log(`Description: ${conv.description}`);
    console.log(`Expected: ${conv.expectedOutcome}`);
    console.log(`${'='.repeat(60)}`);

    const callId = uuid();
    const session = this.sessionManager.createSession(callId, 'default-tenant', this.toolRegistry.getTools());

    const exchanges = [];

    for (const userMessage of conv.scenario) {
      console.log(`\nUser: ${userMessage}`);

      try {
        const { response, shouldTransfer } = await this.orchestrator.handleConversationTurn(
          session.sessionId,
          userMessage
        );

        console.log(`AI: ${response}`);
        console.log(`Transfer: ${shouldTransfer}`);

        exchanges.push({
          user: userMessage,
          ai: response,
          transfer: shouldTransfer,
        });

        if (shouldTransfer) {
          console.log('\n[Transfer initiated, ending conversation]');
          break;
        }
      } catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        return {
          conversationName: conv.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now(),
        };
      }
    }

    this.sessionManager.endSession(session.sessionId, 'completed');
    const summary = this.sessionManager.getSummary(session.sessionId);

    console.log(`\nSession Summary:`);
    console.log(`- Messages: ${(summary as any)?.transcript?.length || 0}`);
    console.log(`- CRM Stats:`, this.crm.getStats());

    return {
      conversationName: conv.name,
      success: true,
      exchanges,
      summary: summary || undefined,
      duration: Date.now(),
    };
  }

  async runAllTests(): Promise<void> {
    console.log('\nWise2 AI Phone Test Harness');
    console.log('============================\n');

    const results = [];

    for (const conversation of TEST_CONVERSATIONS) {
      const result = await this.runConversation(conversation);
      results.push(result);
    }

    console.log(`\n\n${'='.repeat(60)}`);
    console.log('Test Results Summary');
    console.log(`${'='.repeat(60)}`);

    let passed = 0;
    let failed = 0;

    for (const result of results) {
      const status = result.success ? '✓ PASS' : '✗ FAIL';
      console.log(`${status} - ${result.conversationName}`);
      if (result.success) {
        passed++;
      } else {
        failed++;
        console.log(`  Error: ${result.error}`);
      }
    }

    console.log(`\nTotal: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  }
}

interface ConversationResult {
  conversationName: string;
  success: boolean;
  error?: string;
  exchanges?: Array<{ user: string; ai: string; transfer: boolean }>;
  summary?: Record<string, unknown>;
  duration: number;
}

// Run tests if this file is executed directly
if (require.main === module) {
  const harness = new TestHarness();
  harness.runAllTests().catch(console.error);
}
