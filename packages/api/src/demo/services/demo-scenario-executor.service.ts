import { Injectable, Logger } from '@nestjs/common';
import { DemoEventService } from './demo-event.service';
import { DemoRecordService } from './demo-record.service';
import { DemoSessionService } from './demo-session.service';
import { getScenarioByKey } from '../constants/scenarios';

/**
 * DemoScenarioExecutorService
 *
 * Executes demo scenarios by creating events and records in sequence.
 * Orchestrates the "WATCH WISE² WORK" experience.
 *
 * Each scenario is a predefined sequence of:
 * 1. Customer actions (form submission, booking)
 * 2. System automation (lead scoring, AI response)
 * 3. Business outcomes (estimate sent, payment received)
 */
@Injectable()
export class DemoScenarioExecutorService {
  private readonly logger = new Logger('Demo/ScenarioExecutor');

  constructor(
    private eventService: DemoEventService,
    private recordService: DemoRecordService,
    private sessionService: DemoSessionService,
  ) {}

  /**
   * Execute a scenario
   *
   * Creates a sequence of demo events and records that show
   * a complete business workflow (e.g., NEW_LEAD → lead captured → AI response → estimate)
   */
  async executeScenario(input: {
    demoSessionId: string;
    demoEnvironmentId: string;
    scenarioKey: string;
    industry: string;
    automationDelay?: number; // milliseconds between system events
  }): Promise<{
    success: boolean;
    scenarioKey: string;
    eventCount: number;
    recordsCreated: string[];
    message: string;
  }> {
    this.logger.log(
      `Executing scenario ${input.scenarioKey} for session ${input.demoSessionId}`,
    );

    const scenario = getScenarioByKey(input.industry, input.scenarioKey);
    if (!scenario) {
      throw new Error(`Scenario not found: ${input.scenarioKey}`);
    }

    const delay = input.automationDelay || 2000; // 2 seconds between events
    const recordsCreated: string[] = [];
    let eventCount = 0;

    try {
      switch (input.scenarioKey) {
        case 'NEW_LEAD':
          eventCount = await this.executeNewLeadScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        case 'MISSED_CALL':
          eventCount = await this.executeMissedCallScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        case 'WEB_FORM':
          eventCount = await this.executeWebFormScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        case 'QUOTE_REQUEST':
          eventCount = await this.executeQuoteRequestScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        case 'BOOKING':
          eventCount = await this.executeBookingScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        case 'JOB_COMPLETION':
          eventCount = await this.executeJobCompletionScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        case 'REVIEW_REQUEST':
          eventCount = await this.executeReviewRequestScenario(
            input.demoSessionId,
            input.demoEnvironmentId,
            scenario.key,
            delay,
            recordsCreated,
          );
          break;

        default:
          throw new Error(`Unknown scenario: ${input.scenarioKey}`);
      }

      // Update session engagement
      await this.sessionService.recordAction(input.demoSessionId, `scenario_completed_${input.scenarioKey}`);

      this.logger.log(
        `Scenario ${input.scenarioKey} completed: ${eventCount} events, ${recordsCreated.length} records`,
      );

      return {
        success: true,
        scenarioKey: input.scenarioKey,
        eventCount,
        recordsCreated,
        message: `Scenario executed successfully: ${eventCount} events recorded`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Scenario execution failed: ${message}`);

      return {
        success: false,
        scenarioKey: input.scenarioKey,
        eventCount,
        recordsCreated,
        message: `Scenario execution failed: ${message}`,
      };
    }
  }

  /**
   * NEW_LEAD: Customer submits form, system captures and responds
   */
  private async executeNewLeadScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'lead.submitted',
        category: 'customer_action',
        action: 'form_submitted',
        dataSnapshot: { source: 'website' },
      },
      {
        eventType: 'lead.created',
        category: 'system_automation',
        action: 'lead_captured',
        delay,
        dataSnapshot: { status: 'new' },
      },
      {
        eventType: 'lead.matched',
        category: 'system_automation',
        action: 'lead_matched_to_customer',
        delay,
        dataSnapshot: { matchType: 'email_phone' },
      },
      {
        eventType: 'lead.scored',
        category: 'system_automation',
        action: 'lead_score_calculated',
        delay,
        dataSnapshot: { score: Math.floor(Math.random() * 40) + 60 }, // 60-100
      },
      {
        eventType: 'ai.response_generated',
        category: 'system_automation',
        action: 'ai_response_sent',
        delay,
        dataSnapshot: { model: 'wise-imp', responseTime: 1200 },
      },
      {
        eventType: 'sms.sent',
        category: 'system_automation',
        action: 'sms_follow_up',
        delay,
        dataSnapshot: { provider: 'twilio', messageType: 'followup' },
      },
    ];

    records.push('Lead', 'AI Response', 'SMS');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }

  /**
   * MISSED_CALL: Customer calls, gets voicemail, system handles followup
   */
  private async executeMissedCallScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'call.missed',
        category: 'customer_action',
        action: 'incoming_call_missed',
        dataSnapshot: { duration: 0 },
      },
      {
        eventType: 'voicemail.received',
        category: 'system_automation',
        action: 'voicemail_captured',
        delay,
        dataSnapshot: { provider: 'twilio' },
      },
      {
        eventType: 'ai.voicemail_transcribed',
        category: 'system_automation',
        action: 'transcription_completed',
        delay,
        dataSnapshot: { confidence: 0.95 },
      },
      {
        eventType: 'sms.sent',
        category: 'system_automation',
        action: 'customer_contacted',
        delay,
        dataSnapshot: { content: 'We received your call' },
      },
      {
        eventType: 'estimate.generated',
        category: 'system_automation',
        action: 'estimate_created',
        delay,
        dataSnapshot: { amount: Math.floor(Math.random() * 1000) + 300 },
      },
      {
        eventType: 'appointment.offered',
        category: 'system_automation',
        action: 'appointment_options_sent',
        delay,
        dataSnapshot: { slots: 3 },
      },
    ];

    records.push('Voicemail', 'Transcription', 'SMS', 'Estimate');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }

  /**
   * WEB_FORM: Customer fills form, system processes and records
   */
  private async executeWebFormScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'form.submitted',
        category: 'customer_action',
        action: 'contact_form_filled',
      },
      {
        eventType: 'lead.created',
        category: 'system_automation',
        action: 'lead_imported',
        delay,
        dataSnapshot: { source: 'website_form' },
      },
      {
        eventType: 'contact.verified',
        category: 'system_automation',
        action: 'phone_email_validated',
        delay,
        dataSnapshot: { valid: true },
      },
      {
        eventType: 'crm.record_created',
        category: 'system_automation',
        action: 'crm_entry_added',
        delay,
        dataSnapshot: { stage: 'new' },
      },
      {
        eventType: 'workflow.triggered',
        category: 'system_automation',
        action: 'automation_started',
        delay,
        dataSnapshot: { workflow: 'followup_sequence' },
      },
      {
        eventType: 'email.sent',
        category: 'system_automation',
        action: 'confirmation_email',
        delay,
        dataSnapshot: { template: 'form_confirmation' },
      },
    ];

    records.push('Lead', 'CRM Record', 'Workflow', 'Email');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }

  /**
   * QUOTE_REQUEST: Customer requests quote, system generates and sends
   */
  private async executeQuoteRequestScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'estimate.requested',
        category: 'customer_action',
        action: 'quote_requested',
      },
      {
        eventType: 'estimate.created',
        category: 'system_automation',
        action: 'quote_generated',
        delay,
        dataSnapshot: { amount: Math.floor(Math.random() * 1500) + 300 },
      },
      {
        eventType: 'estimate.sent',
        category: 'system_automation',
        action: 'quote_delivered',
        delay,
        dataSnapshot: { channel: 'email' },
      },
      {
        eventType: 'estimate.viewed',
        category: 'customer_action',
        action: 'customer_opened_estimate',
        delay: delay * 3,
        dataSnapshot: { viewTime: Math.random() * 600 },
      },
      {
        eventType: 'estimate.accepted',
        category: 'customer_action',
        action: 'customer_approved',
        delay: delay * 2,
        dataSnapshot: { acceptanceTime: new Date() },
      },
      {
        eventType: 'payment.initiated',
        category: 'system_automation',
        action: 'payment_requested',
        delay,
        dataSnapshot: { method: 'card', processor: 'stripe' },
      },
      {
        eventType: 'appointment.scheduled',
        category: 'system_automation',
        action: 'job_scheduled',
        delay,
        dataSnapshot: { date: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      },
    ];

    records.push('Estimate', 'Payment', 'Appointment');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }

  /**
   * BOOKING: Customer books appointment directly
   */
  private async executeBookingScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'appointment.created',
        category: 'customer_action',
        action: 'customer_booked',
      },
      {
        eventType: 'confirmation.sent',
        category: 'system_automation',
        action: 'booking_confirmed',
        delay,
        dataSnapshot: { channel: 'email_sms' },
      },
      {
        eventType: 'technician.assigned',
        category: 'system_automation',
        action: 'dispatch_assigned',
        delay,
        dataSnapshot: { assignmentType: 'closest_available' },
      },
      {
        eventType: 'reminder.scheduled',
        category: 'system_automation',
        action: 'reminder_queued',
        delay,
        dataSnapshot: { reminderTime: new Date(Date.now() + 23 * 60 * 60 * 1000) },
      },
      {
        eventType: 'job.created',
        category: 'system_automation',
        action: 'work_order_generated',
        delay,
        dataSnapshot: { status: 'scheduled' },
      },
    ];

    records.push('Appointment', 'Technician Assignment', 'Work Order');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }

  /**
   * JOB_COMPLETION: Work done, payment processed, review requested
   */
  private async executeJobCompletionScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'job.marked_complete',
        category: 'system_automation',
        action: 'work_completed',
      },
      {
        eventType: 'invoice.generated',
        category: 'system_automation',
        action: 'invoice_created',
        delay,
        dataSnapshot: { amount: Math.floor(Math.random() * 1000) + 400 },
      },
      {
        eventType: 'payment.processed',
        category: 'system_automation',
        action: 'charge_completed',
        delay,
        dataSnapshot: { method: 'card', processor: 'stripe', status: 'success' },
      },
      {
        eventType: 'review.requested',
        category: 'system_automation',
        action: 'review_prompt_sent',
        delay,
        dataSnapshot: { platform: 'google_yelp' },
      },
      {
        eventType: 'customer.retention_workflow_triggered',
        category: 'system_automation',
        action: 'upsell_initiated',
        delay,
        dataSnapshot: { workflow: 'maintenance_plan' },
      },
    ];

    records.push('Invoice', 'Payment', 'Review Request');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }

  /**
   * REVIEW_REQUEST: Customer leaves review, you get referrals
   */
  private async executeReviewRequestScenario(
    sessionId: string,
    demoEnvId: string,
    scenarioKey: string,
    delay: number,
    records: string[],
  ): Promise<number> {
    const events = [
      {
        eventType: 'review.created',
        category: 'customer_action',
        action: 'review_posted',
        dataSnapshot: { rating: Math.floor(Math.random() * 2) + 4, source: 'google' }, // 4-5 stars
      },
      {
        eventType: 'review.posted_to_platforms',
        category: 'system_automation',
        action: 'review_syndicated',
        delay,
        dataSnapshot: { platforms: ['google', 'yelp', 'facebook'] },
      },
      {
        eventType: 'lead.attributed_to_review',
        category: 'system_automation',
        action: 'referral_tracked',
        delay: delay * 5,
        dataSnapshot: { sourceAttribution: 'review' },
      },
      {
        eventType: 'customer.marked_as_repeat',
        category: 'system_automation',
        action: 'customer_segmented',
        delay,
        dataSnapshot: { segment: 'loyal_customer' },
      },
    ];

    records.push('Review', 'Attribution', 'Referral Lead');
    const createdEvents = await this.eventService.recordEventSequence(
      sessionId,
      demoEnvId,
      scenarioKey,
      events,
    );

    return createdEvents.length;
  }
}
