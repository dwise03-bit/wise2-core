/**
 * WISE² Companion Mode WebSocket Handler
 * 
 * Manages real-time synchronization between Quest app and web dashboard
 */

import { WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { Redis } from 'ioredis';

interface User {
  id: string;
  accountId: string;
  role: 'technician' | 'supervisor' | 'admin';
}

export class CompanionWebSocketHandler {
  private redis: Redis;
  private jwtSecret: string;

  constructor(redis: Redis, jwtSecret: string = process.env.JWT_SECRET || 'secret') {
    this.redis = redis;
    this.jwtSecret = jwtSecret;
  }

  private extractUser(req: any): User | null {
    try {
      const token = req.url?.split('token=')[1]?.split('&')[0] || 
                   req.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) return null;
      const payload = jwt.verify(token, this.jwtSecret) as any;
      return {
        id: payload.sub,
        accountId: payload.account_id,
        role: payload.role || 'technician'
      };
    } catch (e) {
      return null;
    }
  }

  handleConnection(ws: WebSocket, req: any): void {
    const user = this.extractUser(req);

    if (!user) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const sessionId = `session_${Date.now()}`;

    // Subscribe to work order channel
    const workOrderChannel = `workorders:${user.accountId}`;
    this.redis.subscribe(workOrderChannel);

    // Subscribe to supervisor channel if needed
    if (user.role === 'supervisor' || user.role === 'admin') {
      this.redis.subscribe(`supervisor:${user.accountId}`);
    }

    // Handle incoming messages
    ws.on('message', (data: string) => {
      const message = JSON.parse(data);
      this.handleMessage(user, sessionId, message);
    });

    ws.on('close', () => {
      this.redis.unsubscribe(workOrderChannel);
    });

    ws.send(JSON.stringify({
      type: 'CONNECTED',
      sessionId,
      timestamp: Date.now()
    }));
  }

  private async handleMessage(user: User, sessionId: string, message: any): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case 'MEASUREMENT_READING':
        await this.handleMeasurement(user, sessionId, payload);
        break;
      case 'VOICE_NOTE':
        await this.handleVoiceNote(user, payload);
        break;
      case 'WORK_SESSION_START':
        await this.handleSessionStart(user, payload);
        break;
      case 'WORK_SESSION_END':
        await this.handleSessionEnd(user, payload);
        break;
    }
  }

  private async handleMeasurement(user: User, sessionId: string, reading: any): Promise<void> {
    const key = `measurement:${sessionId}:latest`;
    await this.redis.setex(key, 3600, JSON.stringify(reading));

    // Broadcast to supervisors
    const supervisorChannel = `measurements:${user.accountId}`;
    await this.redis.publish(supervisorChannel, JSON.stringify({
      type: 'MEASUREMENT_READING',
      userId: user.id,
      sessionId,
      payload: reading,
      timestamp: Date.now()
    }));
  }

  private async handleVoiceNote(user: User, note: any): Promise<void> {
    const noteId = `note_${Date.now()}`;
    const metadata = {
      id: noteId,
      userId: user.id,
      duration: note.duration,
      createdAt: Date.now(),
      status: 'pending'
    };
    await this.redis.setex(`voicenote:${noteId}`, 86400, JSON.stringify(metadata));
  }

  private async handleSessionStart(user: User, payload: any): Promise<void> {
    const sessionData = {
      workOrderId: payload.workOrderId,
      technicianId: user.id,
      accountId: user.accountId,
      startedAt: Date.now(),
      status: 'active'
    };
    await this.redis.publish(`supervisor:${user.accountId}`, JSON.stringify({
      type: 'WORK_SESSION_STARTED',
      session: sessionData,
      timestamp: Date.now()
    }));
  }

  private async handleSessionEnd(user: User, payload: any): Promise<void> {
    await this.redis.publish(`supervisor:${user.accountId}`, JSON.stringify({
      type: 'WORK_SESSION_ENDED',
      sessionId: payload.sessionId,
      timestamp: Date.now()
    }));
  }
}
