import { CallSession, CallState, SessionContext, ChatMessage, ToolResult } from './types';
import { v4 as uuid } from 'uuid';

export class CallSessionManager {
  private sessions = new Map<string, CallSession>();
  private callIdIndex = new Map<string, string>();

  createSession(
    callId: string,
    tenantId: string,
    tools: any[]
  ): CallSession {
    const sessionId = uuid();

    const session: CallSession = {
      sessionId,
      callId,
      tenantId,
      state: 'answered',
      startedAt: new Date(),
      transcript: [],
      tools,
      context: {
        intent: undefined,
        isExistingCustomer: false,
        requiresTransfer: false,
        verificationLevel: 'unverified',
        attemptCount: 0,
        silenceCount: 0,
      },
      metadata: {
        provider: 'twilio',
        locale: 'en-US',
        recordingEnabled: false,
      },
    };

    this.sessions.set(sessionId, session);
    this.callIdIndex.set(callId, sessionId);
    return session;
  }

  getSession(sessionId: string): CallSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionByCallId(callId: string): CallSession | undefined {
    const sessionId = this.callIdIndex.get(callId);
    return sessionId ? this.sessions.get(sessionId) : undefined;
  }

  updateState(sessionId: string, newState: CallState): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const validTransitions: Record<CallState, CallState[]> = {
      queued: ['ringing', 'failed'],
      ringing: ['answered', 'failed'],
      'in-progress': ['transferring', 'completed', 'failed'],
      answered: ['in-progress', 'failed'],
      transferring: ['in-progress', 'completed', 'failed'],
      completed: [],
      failed: [],
    };

    if (!validTransitions[session.state].includes(newState)) {
      console.warn(
        `Invalid state transition: ${session.state} -> ${newState}`
      );
      return false;
    }

    session.state = newState;
    return true;
  }

  addMessage(sessionId: string, role: 'user' | 'assistant', content: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.transcript.push({
      role,
      content,
      timestamp: new Date(),
    });
  }

  recordToolCall(sessionId: string, toolName: string, input: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.metadata.lastToolCall = {
      tool: toolName,
      input,
      timestamp: new Date(),
    };
  }

  recordToolResult(
    sessionId: string,
    result: ToolResult
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    if (!session.metadata.toolResults) {
      session.metadata.toolResults = [];
    }
    (session.metadata.toolResults as ToolResult[]).push(result);

    if (!result.success) {
      session.context.attemptCount++;
    }
  }

  updateContext(sessionId: string, updates: Partial<SessionContext>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    Object.assign(session.context, updates);
  }

  shouldTransfer(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    return (
      session.context.requiresTransfer ||
      session.context.attemptCount > 3 ||
      session.context.silenceCount > 2
    );
  }

  endSession(sessionId: string, disposition: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.state = 'completed';
    session.metadata.disposition = disposition;
    session.metadata.endedAt = new Date();
    session.metadata.duration =
      (session.metadata.endedAt as Date).getTime() - session.startedAt.getTime();
  }

  getSummary(sessionId: string): Record<string, unknown> | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId: session.sessionId,
      callId: session.callId,
      state: session.state,
      customerId: session.customerId,
      transcript: session.transcript,
      context: session.context,
      metadata: session.metadata,
      duration: session.metadata.duration,
      disposition: session.metadata.disposition,
    };
  }

  deleteSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) this.callIdIndex.delete(session.callId);
    this.sessions.delete(sessionId);
  }

  getAllSessions(): CallSession[] {
    return Array.from(this.sessions.values());
  }
}
