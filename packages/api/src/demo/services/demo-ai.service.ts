import { Injectable, Logger } from '@nestjs/common';
import { DemoEnvironment } from '@prisma/client';

/**
 * DemoAIService (Phase 7)
 *
 * Integrates WISE² IMP (AI assistant) with demo environment.
 * Provides context-aware answers about the business and WISE² features.
 */
@Injectable()
export class DemoAIService {
  private readonly logger = new Logger('Demo/AIService');

  constructor() {}

  /**
   * Get AI context for demo environment
   * Returns structured context for AI to answer questions about the business
   */
  getAIContext(demoEnv: DemoEnvironment, demoData: Record<string, unknown>) {
    return {
      businessName: demoEnv.businessName,
      industry: demoEnv.industry,
      demoData,
      capabilities: [
        'Answer questions about the business',
        'Explain WISE² features',
        'Show feature demonstrations',
        'Navigate to relevant screens',
        'Explain the current workflow',
      ],
    };
  }

  /**
   * Parse user question and determine demo action
   * Used to guide AI assistant responses
   */
  parseQuestion(question: string): {
    intent: string;
    topic: string;
    actionType: string;
  } {
    const lowerQ = question.toLowerCase();

    // Detect intents
    if (lowerQ.includes('missed') || lowerQ.includes('call')) {
      return {
        intent: 'demo_scenario',
        topic: 'missed_calls',
        actionType: 'run_scenario_missed_call',
      };
    }

    if (lowerQ.includes('payment') || lowerQ.includes('charge')) {
      return {
        intent: 'feature_explanation',
        topic: 'payments',
        actionType: 'explain_feature_payments',
      };
    }

    if (lowerQ.includes('automat') || lowerQ.includes('workflow')) {
      return {
        intent: 'feature_explanation',
        topic: 'automation',
        actionType: 'explain_feature_automation',
      };
    }

    if (lowerQ.includes('lead') || lowerQ.includes('customer')) {
      return {
        intent: 'demo_scenario',
        topic: 'leads',
        actionType: 'run_scenario_new_lead',
      };
    }

    // Default
    return {
      intent: 'general_question',
      topic: 'general',
      actionType: 'respond_generally',
    };
  }

  /**
   * Generate AI response for demo context
   * In production, this hooks into WISE² IMP
   */
  async generateResponse(
    question: string,
    context: Record<string, unknown>,
  ): Promise<{
    response: string;
    suggestedAction?: string;
    suggestedScenario?: string;
  }> {
    const parsed = this.parseQuestion(question);

    this.logger.log(`AI question: ${question} → intent: ${parsed.intent}`);

    // Template responses (in production, use WISE² IMP LLM)
    const responses: Record<string, string> = {
      run_scenario_missed_call: `Great question! Let me show you exactly how WISE² handles missed calls. I'll run a demo scenario where a customer calls while you're busy. You'll see: the call is logged, the voicemail is transcribed automatically, the customer gets a follow-up SMS immediately, and we generate an estimate. Ready?`,

      explain_feature_payments: `WISE² handles payments automatically and securely. When a customer approves an estimate, we can accept payment directly—no more chasing invoices. Payments are processed through Stripe, sent securely, and immediately recorded in your accounting.`,

      explain_feature_automation: `This is where WISE² saves you the most time. Every customer interaction triggers automated workflows: lead capture, scoring, follow-ups, estimates, scheduling, payment collection, and review requests. All happen while you focus on the work itself.`,

      run_scenario_new_lead: `Perfect—let me show you. I'll simulate a customer finding you online and requesting a service. Watch what happens: they fill out your form, WISE² captures the lead, scores it, the AI responds to them, and a follow-up SMS goes out. All in seconds, while you're with another customer.`,

      respond_generally: `I'm here to help you understand how WISE² would operate your business. You can ask me about specific scenarios ("What happens with missed calls?"), features ("How do payments work?"), or numbers ("What's my revenue projection?").`,
    };

    return {
      response: responses[parsed.actionType] || responses.respond_generally,
      suggestedAction: parsed.intent === 'demo_scenario' ? 'run_scenario' : undefined,
      suggestedScenario: parsed.actionType.includes('_') ? parsed.actionType.split('_')[2] : undefined,
    };
  }

  /**
   * Get suggested questions for demo context
   */
  getSuggestedQuestions(industry: string): string[] {
    const baseQuestions = [
      'What happens when someone misses my call?',
      'How do payments work?',
      'How does WISE² automate my follow-ups?',
      'Can I see a demo of a new lead arriving?',
    ];

    const industryQuestions: Record<string, string[]> = {
      hvac: [
        'How does seasonal demand affect my business on WISE²?',
        'Can WISE² handle emergency service calls?',
        'How do maintenance plans work?',
      ],
      plumbing: [
        'How does WISE² manage emergency plumbing calls?',
        'Can I offer service plans?',
      ],
    };

    return [...baseQuestions, ...(industryQuestions[industry] || [])];
  }
}
