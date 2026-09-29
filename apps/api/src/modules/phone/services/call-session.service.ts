/**
 * Call Session Manager
 * Orchestrates call lifecycle, integrates with STT/TTS, manages conversation
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@shared/services/prisma.service';
import { ITelephonyProvider } from '../providers/telephony.provider';
import { CallStatus as PrismaCallStatus } from '@prisma/client';

export interface CallSession {
  callSid: string;
  customerId?: string;
  propertyId?: string;
  status: PrismaCallStatus;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  transcript?: string;
  summary?: any;
  metadata?: Record<string, any>;
}

export interface ConversationTurn {
  role: 'customer' | 'agent';
  text: string;
  timestamp: Date;
  audioUrl?: string;
}

@Injectable()
export class CallSessionService {
  private readonly logger = new Logger(CallSessionService.name);
  private readonly sessions = new Map<string, CallSession>();
  private readonly conversations = new Map<string, ConversationTurn[]>();

  constructor(
    private prisma: PrismaService,
    @Inject('TELEPHONY_PROVIDER') private provider: ITelephonyProvider,
  ) {}

  /**
   * Start a new call session
   */
  async startSession(callSid: string, metadata: Record<string, any> = {}): Promise<CallSession> {
    const session: CallSession = {
      callSid,
      status: 'INITIATED',
      startedAt: new Date(),
      metadata,
    };

    this.sessions.set(callSid, session);
    this.conversations.set(callSid, []);

    this.logger.log(`Session started: ${callSid}`);

    return session;
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    callSid: string,
    status: PrismaCallStatus
  ): Promise<CallSession> {
    const session = this.sessions.get(callSid);
    if (!session) {
      throw new Error(`Session not found: ${callSid}`);
    }

    session.status = status;
    this.sessions.set(callSid, session);

    this.logger.log(`Session updated: ${callSid} → ${status}`);

    return session;
  }

  /**
   * Add conversation turn (customer or agent message)
   */
  async addConversationTurn(
    callSid: string,
    role: 'customer' | 'agent',
    text: string,
    audioUrl?: string
  ): Promise<ConversationTurn> {
    const conversation = this.conversations.get(callSid) || [];

    const turn: ConversationTurn = {
      role,
      text,
      timestamp: new Date(),
      audioUrl,
    };

    conversation.push(turn);
    this.conversations.set(callSid, conversation);

    this.logger.log(`Turn added to ${callSid} [${role}]: ${text.substring(0, 50)}...`);

    return turn;
  }

  /**
   * Get conversation transcript
   */
  getConversation(callSid: string): ConversationTurn[] {
    return this.conversations.get(callSid) || [];
  }

  /**
   * Get conversation as text
   */
  getTranscript(callSid: string): string {
    const conversation = this.conversations.get(callSid) || [];
    return conversation
      .map((turn) => `${turn.role.toUpperCase()}: ${turn.text}`)
      .join('\n');
  }

  /**
   * End session and save to database
   */
  async endSession(callSid: string): Promise<CallSession> {
    const session = this.sessions.get(callSid);
    if (!session) {
      throw new Error(`Session not found: ${callSid}`);
    }

    session.endedAt = new Date();
    session.durationSeconds = Math.round(
      (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
    );
    session.transcript = this.getTranscript(callSid);

    // Save to database
    const call = await this.prisma.call.create({
      data: {
        callSid,
        inboundNumber: session.metadata?.inboundNumber || '',
        callerNumber: session.metadata?.callerNumber || '',
        status: 'DISCONNECTED',
        direction: session.metadata?.isInbound ? 'INBOUND' : 'OUTBOUND',
        startedAt: session.startedAt,
        answeredAt: session.metadata?.answeredAt,
        endedAt: session.endedAt,
        durationSeconds: session.durationSeconds,
        customerId: session.customerId,
        propertyId: session.propertyId,
        disposition: session.metadata?.disposition || 'UNKNOWN',
      },
    });

    // Save transcript if exists
    if (session.transcript) {
      await this.prisma.callTranscript.create({
        data: {
          callId: call.id,
          status: 'COMPLETED',
          language: 'en-US',
          segments: {
            create: this.conversations.get(callSid)?.map((turn) => ({
              speaker: turn.role,
              text: turn.text,
              startMs: 0, // TODO: Calculate actual timing from audio
              endMs: 1000,
              confidence: 0.95,
            })) || [],
          },
        },
        include: { segments: true },
      });
    }

    this.logger.log(
      `Session ended: ${callSid} (${session.durationSeconds}s, ${this.conversations.get(callSid)?.length || 0} turns)`
    );

    // Cleanup
    this.sessions.delete(callSid);
    this.conversations.delete(callSid);

    return session;
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): CallSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get session
   */
  getSession(callSid: string): CallSession | undefined {
    return this.sessions.get(callSid);
  }

  /**
   * Customer identified (link to customer record)
   */
  async identifyCustomer(callSid: string, customerId: string): Promise<void> {
    const session = this.sessions.get(callSid);
    if (!session) throw new Error(`Session not found: ${callSid}`);

    session.customerId = customerId;
    this.sessions.set(callSid, session);

    this.logger.log(`Customer identified: ${callSid} → ${customerId}`);
  }

  /**
   * Property identified (link to property)
   */
  async identifyProperty(callSid: string, propertyId: string): Promise<void> {
    const session = this.sessions.get(callSid);
    if (!session) throw new Error(`Session not found: ${callSid}`);

    session.propertyId = propertyId;
    this.sessions.set(callSid, session);

    this.logger.log(`Property identified: ${callSid} → ${propertyId}`);
  }

  /**
   * Store conversation summary (AI-generated)
   */
  async summarizeConversation(callSid: string, summary: any): Promise<void> {
    const session = this.sessions.get(callSid);
    if (!session) throw new Error(`Session not found: ${callSid}`);

    session.summary = summary;
    this.sessions.set(callSid, session);

    this.logger.log(`Conversation summarized: ${callSid}`);
  }

  /**
   * Get conversation context for AI
   */
  async getConversationContext(callSid: string): Promise<string> {
    const session = this.sessions.get(callSid);
    if (!session) throw new Error(`Session not found: ${callSid}`);

    let context = `Call Session: ${callSid}\n`;
    context += `Duration: ${session.durationSeconds || 'ongoing'}s\n`;
    context += `Status: ${session.status}\n`;

    if (session.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: session.customerId },
      });
      if (customer) {
        context += `\nCustomer: ${customer.contactName} (${customer.email})\n`;
        context += `Business: ${customer.businessName}\n`;
      }
    }

    if (session.propertyId) {
      const property = await this.prisma.hVACProperty.findUnique({
        where: { id: session.propertyId },
        include: { equipment: true },
      });
      if (property) {
        context += `\nProperty: ${property.address}, ${property.city}, ${property.state}\n`;
        context += `Heating: ${property.heatingType}\n`;
        context += `Cooling: ${property.coolingType}\n`;
        if (property.equipment.length > 0) {
          context += `Equipment:\n`;
          property.equipment.forEach((eq) => {
            context += `  - ${eq.equipmentType}: ${eq.manufacturer} ${eq.model}\n`;
          });
        }
      }
    }

    context += `\nConversation:\n${this.getTranscript(callSid)}\n`;

    return context;
  }
}
