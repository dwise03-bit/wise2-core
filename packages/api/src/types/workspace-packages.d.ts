declare module '@wise2/ai-phone' {
  export class GoogleVoiceProvider {
    constructor(config: Record<string, unknown>);
    incomingCall(
      callId: string,
      from: string,
      to: string,
      googleCallId: string,
    ): Promise<unknown>;
    acceptCall(callId: string): Promise<void>;
    rejectCall(callId: string): Promise<void>;
    startMediaStream(callId: string, wsUrl: string): Promise<void>;
    endCall(callId: string): Promise<void>;
    getRecording(callId: string): Promise<{ url: string } | null>;
    getTranscript(
      callId: string,
    ): Promise<{ transcriptId: string } | null>;
  }

  export class CallSessionManager {
    createSession(
      callId: string,
      tenantId: string,
      tools: unknown[],
    ): { sessionId: string };
    getSummary(
      sessionId: string,
    ): { messageCount: number; toolsUsed?: unknown[] } | null;
  }
}

declare module '@wise2/db' {
  export { PrismaClient } from '@prisma/client';
  export const prisma: import('@prisma/client').PrismaClient;
}
