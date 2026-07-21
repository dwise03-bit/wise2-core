import { Injectable } from '@nestjs/common';

export interface StreamSession {
  id: string;
  title: string;
  description: string;
  isLive: boolean;
  startedAt: Date;
  endedAt?: Date;
  viewerCount: number;
  destinations: string[];
}

@Injectable()
export class StreamingService {
  private sessions: Map<string, StreamSession> = new Map();
  private viewerCounts: Map<string, number> = new Map();

  constructor() {}

  async startStream(
    sessionId: string,
    title: string,
    description: string,
    destinations: string[] = []
  ): Promise<StreamSession> {
    const session: StreamSession = {
      id: sessionId,
      title,
      description,
      isLive: true,
      startedAt: new Date(),
      viewerCount: 0,
      destinations,
    };

    this.sessions.set(sessionId, session);
    this.viewerCounts.set(sessionId, 0);

    return session;
  }

  async endStream(sessionId: string): Promise<StreamSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.isLive = false;
    session.endedAt = new Date();

    return session;
  }

  async getStreamStatus(sessionId: string): Promise<StreamSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async updateViewerCount(sessionId: string, count: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.viewerCount = count;
      this.viewerCounts.set(sessionId, count);
    }
  }

  async incrementViewers(sessionId: string): Promise<number> {
    const current = this.viewerCounts.get(sessionId) || 0;
    const newCount = current + 1;
    this.viewerCounts.set(sessionId, newCount);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.viewerCount = newCount;
    }

    return newCount;
  }

  async decrementViewers(sessionId: string): Promise<number> {
    const current = Math.max(0, (this.viewerCounts.get(sessionId) || 1) - 1);
    this.viewerCounts.set(sessionId, current);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.viewerCount = current;
    }

    return current;
  }

  async getViewerCount(sessionId: string): Promise<number> {
    return this.viewerCounts.get(sessionId) || 0;
  }

  async getAllSessions(): Promise<StreamSession[]> {
    return Array.from(this.sessions.values());
  }

  async getLiveSessions(): Promise<StreamSession[]> {
    return Array.from(this.sessions.values()).filter((s) => s.isLive);
  }
}
