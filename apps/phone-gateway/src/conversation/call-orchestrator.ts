/**
 * Call Orchestrator
 * Real-time orchestration of STT → LLM → TTS with interruption handling
 */

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { logger } from '../logger';
import { STTService } from '../services/stt.service';
import { LLMService } from '../services/llm.service';
import { TTSService } from '../services/tts.service';
import { CRMClient, CRMCustomer } from '../crm/crm-client';

export interface CallState {
  callId: string;
  channelId: string;
  callerId: string;
  startTime: Date;
  status:
    | 'greeting'
    | 'listening'
    | 'transcribing'
    | 'thinking'
    | 'speaking'
    | 'interrupted'
    | 'transferred'
    | 'ended';
  conversationTurns: ConversationTurn[];
  currentTTSPlaybackId?: string;
  isAudioPlaying: boolean;
  interruptionDetected: boolean;
}

export interface ConversationTurn {
  id: string;
  role: 'caller' | 'agent';
  text: string;
  timestamp: Date;
  transcriptionConfidence?: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

export class CallOrchestrator extends EventEmitter {
  private callState: Map<string, CallState> = new Map();
  private stt: STTService;
  private llm: LLMService;
  private tts: TTSService;
  private crm: CRMClient;
  private callContext: Map<string, { customer?: CRMCustomer; leadId?: string }> =
    new Map();

  constructor(
    stt: STTService,
    llm: LLMService,
    tts: TTSService,
    crm: CRMClient,
  ) {
    super();
    this.stt = stt;
    this.llm = llm;
    this.tts = tts;
    this.crm = crm;
  }

  /**
   * Start a new call session and lookup customer
   */
  async initializeCall(
    channelId: string,
    callerId: string,
    context?: Record<string, any>
  ): Promise<CallState> {
    const callId = uuid();
    const state: CallState = {
      callId,
      channelId,
      callerId,
      startTime: new Date(),
      status: 'greeting',
      conversationTurns: [],
      isAudioPlaying: false,
      interruptionDetected: false,
    };

    this.callState.set(callId, state);
    logger.info(`Call initialized: ${callId} on ${channelId} from ${callerId}`);

    // Lookup or create customer
    try {
      let customer = await this.crm.lookupCustomer(callerId);
      if (!customer) {
        logger.info(`Customer not found for ${callerId}, will create on first intent`);
      }
      this.callContext.set(callId, { customer: customer || undefined });
    } catch (error: any) {
      logger.error(`Failed to lookup customer: ${error.message}`);
    }

    this.emit('call-initialized', { callId, callerId, context });
    return state;
  }

  /**
   * Play greeting and prompt for input
   */
  async playGreeting(
    callId: string,
    greetingText: string
  ): Promise<void> {
    const state = this.callState.get(callId);
    if (!state) throw new Error(`Call ${callId} not found`);

    state.status = 'greeting';
    state.isAudioPlaying = true;

    try {
      // Synthesize greeting
      const audio = await this.tts.synthesize(greetingText, {
        voice: 'daniel',
        speed: 1.0,
      });

      logger.info(`Greeting synthesized for ${callId}, sending to Asterisk`);

      // In real implementation, would send to Asterisk for playback
      // this.asterisk.playAudio(state.channelId, audio.url);

      // Add to conversation
      state.conversationTurns.push({
        id: uuid(),
        role: 'agent',
        text: greetingText,
        timestamp: new Date(),
      });

      state.isAudioPlaying = false;
      state.status = 'listening';

      this.emit('greeting-played', { callId });
    } catch (error) {
      logger.error(`Failed to play greeting for ${callId}:`, error);
      state.isAudioPlaying = false;
      throw error;
    }
  }

  /**
   * Capture and transcribe caller speech
   */
  async captureSpeech(
    callId: string,
    audioBuffer: Buffer,
    endpointDetected: boolean = true
  ): Promise<string> {
    const state = this.callState.get(callId);
    if (!state) throw new Error(`Call ${callId} not found`);

    state.status = 'transcribing';

    try {
      // Cancel any ongoing TTS playback
      if (state.isAudioPlaying) {
        state.interruptionDetected = true;
        logger.info(`Interruption detected on ${callId}, stopping TTS`);
        this.emit('interruption-detected', { callId });
      }

      // Transcribe audio
      const result = await this.stt.transcribe(audioBuffer, {
        language: 'en-US',
      });

      state.interruptionDetected = false;

      // Add to conversation
      state.conversationTurns.push({
        id: uuid(),
        role: 'caller',
        text: result.text,
        timestamp: new Date(),
        transcriptionConfidence: result.confidence,
      });

      logger.info(
        `Transcribed (${callId}): "${result.text}" [${result.confidence}]`
      );

      this.emit('speech-captured', {
        callId,
        text: result.text,
        confidence: result.confidence,
      });

      return result.text;
    } catch (error) {
      logger.error(`Transcription failed for ${callId}:`, error);
      throw error;
    }
  }

  /**
   * Generate AI response
   */
  async generateResponse(
    callId: string,
    context?: Record<string, any>
  ): Promise<{
    text: string;
    toolCalls: ToolCall[];
    sentiment: string;
  }> {
    const state = this.callState.get(callId);
    if (!state) throw new Error(`Call ${callId} not found`);

    state.status = 'thinking';

    try {
      // Build conversation context
      const messages = state.conversationTurns.map((turn) => ({
        role: turn.role === 'caller' ? 'user' : 'assistant',
        content: turn.text,
      }));

      // Get LLM response
      const response = await this.llm.generate({
        messages,
        systemPrompt: this.buildSystemPrompt(context),
        maxTokens: 500,
        temperature: 0.7,
      });

      // Parse response and tool calls
      const toolCalls: ToolCall[] = response.toolCalls || [];
      for (const tc of toolCalls) {
        tc.status = 'pending';
      }

      // Add to conversation
      const turn: ConversationTurn = {
        id: uuid(),
        role: 'agent',
        text: response.text,
        timestamp: new Date(),
        toolCalls,
      };

      state.conversationTurns.push(turn);

      logger.info(`LLM response (${callId}): "${response.text}"`);

      this.emit('response-generated', {
        callId,
        text: response.text,
        toolCalls,
      });

      return {
        text: response.text,
        toolCalls,
        sentiment: response.sentiment || 'neutral',
      };
    } catch (error) {
      logger.error(`LLM generation failed for ${callId}:`, error);
      throw error;
    }
  }

  /**
   * Synthesize and speak response
   */
  async speakResponse(
    callId: string,
    text: string,
    onInterruption?: () => void
  ): Promise<void> {
    const state = this.callState.get(callId);
    if (!state) throw new Error(`Call ${callId} not found`);

    state.status = 'speaking';
    state.isAudioPlaying = true;
    state.interruptionDetected = false;

    try {
      // Synthesize response
      const audio = await this.tts.synthesize(text, {
        voice: 'daniel',
        speed: 1.0,
        streaming: true, // Stream audio chunks for faster feedback
      });

      logger.info(`Synthesizing response (${callId}): "${text}"`);

      // In real implementation, stream audio to Asterisk
      // for await (const chunk of audio.stream) {
      //   this.asterisk.sendAudioChunk(state.channelId, chunk);
      //   if (state.interruptionDetected) {
      //     logger.info(`Speaking interrupted on ${callId}`);
      //     onInterruption?.();
      //     break;
      //   }
      // }

      state.isAudioPlaying = false;
      state.status = 'listening';

      this.emit('response-spoken', { callId });
    } catch (error) {
      logger.error(`Failed to speak response for ${callId}:`, error);
      state.isAudioPlaying = false;
      throw error;
    }
  }

  /**
   * Execute tool calls from LLM response
   */
  async executeToolCalls(
    callId: string,
    toolCalls: ToolCall[]
  ): Promise<void> {
    const state = this.callState.get(callId);
    if (!state) throw new Error(`Call ${callId} not found`);

    for (const tc of toolCalls) {
      try {
        tc.status = 'executing';

        logger.info(`Executing tool (${callId}): ${tc.name}(${JSON.stringify(tc.args)})`);

        // Execute tool based on name
        let result: any;
        switch (tc.name) {
          case 'create_lead':
            result = await this.executeTool_CreateLead(tc.args);
            break;
          case 'schedule_appointment':
            result = await this.executeTool_ScheduleAppointment(tc.args);
            break;
          case 'create_work_order':
            result = await this.executeTool_CreateWorkOrder(tc.args);
            break;
          case 'transfer_to_human':
            result = await this.executeTool_TransferToHuman(
              callId,
              tc.args
            );
            break;
          default:
            logger.warn(
              `Unknown tool: ${tc.name}, would need handler implementation`
            );
            result = { error: 'Unknown tool' };
        }

        tc.result = result;
        tc.status = 'completed';

        this.emit('tool-executed', {
          callId,
          toolName: tc.name,
          result,
        });
      } catch (error) {
        tc.status = 'failed';
        tc.result = { error: String(error) };

        this.emit('tool-failed', {
          callId,
          toolName: tc.name,
          error,
        });

        logger.error(`Tool execution failed (${tc.name}):`, error);
      }
    }
  }

  /**
   * End call and generate summary
   */
  async endCall(callId: string, reason: string = 'caller-hangup'): Promise<any> {
    const state = this.callState.get(callId);
    if (!state) throw new Error(`Call ${callId} not found`);

    state.status = 'ended';
    const duration = Math.floor(
      (new Date().getTime() - state.startTime.getTime()) / 1000
    );

    try {
      // Generate conversation summary
      const summary = await this.generateSummary(callId);

      logger.info(`Call ended (${callId}): ${duration}s, reason: ${reason}`);

      this.emit('call-ended', {
        callId,
        duration,
        reason,
        summary,
      });

      // Clean up
      this.callState.delete(callId);

      return { callId, duration, summary };
    } catch (error) {
      logger.error(`Failed to end call ${callId}:`, error);
      throw error;
    }
  }

  /**
   * Generate call summary
   */
  private async generateSummary(callId: string): Promise<string> {
    const state = this.callState.get(callId);
    if (!state) return '';

    const transcript = state.conversationTurns
      .map((t) => `${t.role}: ${t.text}`)
      .join('\n');

    // Use LLM to generate summary
    const summary = await this.llm.generate({
      messages: [
        {
          role: 'system',
          content: 'Summarize this call in 2-3 sentences. Focus on the issue, resolution, and next steps.',
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      maxTokens: 200,
    });

    return summary.text;
  }

  /**
   * Build system prompt for context-aware AI
   */
  private buildSystemPrompt(context?: Record<string, any>): string {
    let prompt = `You are Daniel's AI assistant for WISE² HVAC Solutions.

Your role:
- Listen to customer issues
- Diagnose HVAC problems through conversation
- Create work orders or schedule appointments
- Transfer to human technician when needed

Tone:
- Professional but friendly
- Short, confident answers
- Ask clarifying questions if needed
- Never recommend unsafe repairs

Current context:
- Customer: ${context?.customer?.name || 'Unknown'}
- Location: ${context?.property?.address || 'Unknown'}
- Equipment: ${context?.equipment?.type || 'Unknown'}`;

    return prompt;
  }

  // Tool execution stubs (would connect to CRM/scheduling)

  private async executeTool_CreateLead(args: any): Promise<any> {
    try {
      logger.info(`Tool: Creating lead: ${JSON.stringify(args)}`);
      const callIds = Array.from(this.callState.keys());
      const callId = callIds[callIds.length - 1];
      const context = this.callContext.get(callId);

      const lead = await this.crm.createLead({
        customerId: context?.customer?.id,
        intent: args.intent || 'Inbound phone call',
        sourceCallId: callId,
      });

      if (callId) {
        this.callContext.set(callId, {
          ...context,
          leadId: lead.id,
        });
      }

      return {
        leadId: lead.id,
        status: 'created',
        customerId: context?.customer?.id,
      };
    } catch (error: any) {
      logger.error(`Tool: CreateLead failed: ${error.message}`);
      return { error: error.message, status: 'failed' };
    }
  }

  private async executeTool_ScheduleAppointment(args: any): Promise<any> {
    try {
      logger.info(`Tool: Scheduling appointment: ${JSON.stringify(args)}`);
      const callIds = Array.from(this.callState.keys());
      const callId = callIds[callIds.length - 1];
      const context = this.callContext.get(callId);

      if (!context?.customer?.id) {
        return {
          error: 'Customer not found',
          status: 'failed',
        };
      }

      const startAt = new Date(args.startTime || Date.now());
      const endAt = new Date(startAt.getTime() + (args.duration || 60) * 60000);

      const booking = await this.crm.createBooking({
        customerId: context.customer.id,
        serviceType: args.serviceType || 'hvac-service',
        startAt,
        endAt,
        sourceCallId: callId,
      });

      return {
        appointmentId: booking.id,
        confirmationNumber: booking.confirmationNumber,
        status: 'scheduled',
        startTime: booking.startAt,
        endTime: booking.endAt,
      };
    } catch (error: any) {
      logger.error(`Tool: ScheduleAppointment failed: ${error.message}`);
      return { error: error.message, status: 'failed' };
    }
  }

  private async executeTool_CreateWorkOrder(args: any): Promise<any> {
    try {
      logger.info(`Tool: Creating work order: ${JSON.stringify(args)}`);
      const callIds = Array.from(this.callState.keys());
      const callId = callIds[callIds.length - 1];
      const context = this.callContext.get(callId);

      if (!context?.customer?.id) {
        return {
          error: 'Customer not found',
          status: 'failed',
        };
      }

      const startAt = new Date(args.startTime || Date.now());
      const endAt = new Date(startAt.getTime() + (args.duration || 120) * 60000);

      const booking = await this.crm.createBooking({
        customerId: context.customer.id,
        serviceType: args.serviceType || 'hvac-work-order',
        startAt,
        endAt,
        sourceCallId: callId,
      });

      return {
        workOrderId: booking.id,
        status: 'created',
        customerId: context.customer.id,
      };
    } catch (error: any) {
      logger.error(`Tool: CreateWorkOrder failed: ${error.message}`);
      return { error: error.message, status: 'failed' };
    }
  }

  private async executeTool_TransferToHuman(
    callId: string,
    args: any
  ): Promise<any> {
    logger.info(`Tool: Transferring call ${callId} to human`);
    const state = this.callState.get(callId);
    if (state) {
      state.status = 'transferred';
    }
    return { transferred: true };
  }

  /**
   * Ensure customer exists for call
   */
  async ensureCustomer(
    callId: string,
    phone: string,
    name: string = 'Caller',
  ): Promise<CRMCustomer> {
    const context = this.callContext.get(callId);
    if (context?.customer) {
      return context.customer;
    }

    try {
      logger.info(`Creating customer: ${name} (${phone})`);
      const customer = await this.crm.createCustomer({
        fullName: name,
        phone,
      });
      this.callContext.set(callId, { ...context, customer });
      return customer;
    } catch (error: any) {
      logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get call state
   */
  getCallState(callId: string): CallState | undefined {
    return this.callState.get(callId);
  }

  /**
   * Get all active calls
   */
  getActiveCalls(): CallState[] {
    return Array.from(this.callState.values()).filter(
      (s) => s.status !== 'ended'
    );
  }
}

export default CallOrchestrator;
