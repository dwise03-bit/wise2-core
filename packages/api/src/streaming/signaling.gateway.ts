import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { StreamingService } from './streaming.service';

interface SignalingMessage {
  jobId: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'ping';
  payload?: any;
}

interface SessionContext {
  userId: string;
  jobId: string;
  role: 'technician' | 'supervisor';
  connectedAt: Date;
}

@WebSocketGateway({
  namespace: '/stream',
  cors: {
    origin: ['http://localhost:3005', 'https://dashboard.wise2.net', 'https://wise2.net'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SignalingGateway.name);
  private sessions: Map<string, SessionContext> = new Map();
  private jobSessions: Map<string, Set<string>> = new Map();

  constructor(private readonly streaming: StreamingService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const context = this.sessions.get(client.id);
    if (context) {
      this.logger.log(`Client disconnected: ${client.id} (${context.role} in job ${context.jobId})`);
      this.sessions.delete(client.id);

      const jobSessions = this.jobSessions.get(context.jobId);
      if (jobSessions) {
        jobSessions.delete(client.id);
      }

      // Notify others in the job
      this.server.to(`job:${context.jobId}`).emit('user-left', {
        userId: context.userId,
        role: context.role,
      });
    }
  }

  /**
   * Join a stream session
   * Client sends: { jobId, userId, role: 'technician' | 'supervisor' }
   */
  @SubscribeMessage('join-stream')
  handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string; userId: string; role: 'technician' | 'supervisor' }
  ) {
    const { jobId, userId, role } = data;

    const context: SessionContext = {
      userId,
      jobId,
      role,
      connectedAt: new Date(),
    };

    this.sessions.set(client.id, context);

    if (!this.jobSessions.has(jobId)) {
      this.jobSessions.set(jobId, new Set());
    }
    this.jobSessions.get(jobId)!.add(client.id);

    // Join socket.io room
    client.join(`job:${jobId}`);

    this.logger.log(`User ${userId} (${role}) joined stream in job ${jobId}`);

    // Send acknowledgment
    client.emit('joined-stream', {
      success: true,
      jobId,
      userId,
      role,
      timestamp: new Date().toISOString(),
    });

    // Notify others
    this.server.to(`job:${jobId}`).emit('user-joined', {
      userId,
      role,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Technician sends offer
   * Client sends: { jobId, offer: RTCSessionDescription }
   */
  @SubscribeMessage('send-offer')
  handleSendOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string; offer: any }
  ) {
    const context = this.sessions.get(client.id);
    if (!context || context.role !== 'technician') {
      client.emit('error', 'Only technician can send offer');
      return { success: false };
    }

    const { jobId, offer } = data;

    this.logger.log(`Technician offer for job ${jobId}`);

    // Broadcast to all supervisors in this job
    this.server.to(`job:${jobId}`).emit('offer-received', {
      from: context.userId,
      jobId,
      offer,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Supervisor sends answer
   * Client sends: { jobId, answer: RTCSessionDescription }
   */
  @SubscribeMessage('send-answer')
  handleSendAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string; answer: any }
  ) {
    const context = this.sessions.get(client.id);
    if (!context || context.role !== 'supervisor') {
      client.emit('error', 'Only supervisor can send answer');
      return { success: false };
    }

    const { jobId, answer } = data;

    this.logger.log(`Supervisor answer for job ${jobId}`);

    // Send to technician
    this.server.to(`job:${jobId}`).emit('answer-received', {
      from: context.userId,
      jobId,
      answer,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Send ICE candidate
   * Client sends: { jobId, candidate: RTCIceCandidate }
   */
  @SubscribeMessage('send-ice-candidate')
  handleSendIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string; candidate: any }
  ) {
    const context = this.sessions.get(client.id);
    if (!context) {
      client.emit('error', 'Not in a session');
      return { success: false };
    }

    const { jobId, candidate } = data;

    // Broadcast to all peers in this job
    this.server.to(`job:${jobId}`).emit('ice-candidate-received', {
      from: context.userId,
      jobId,
      candidate,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Heartbeat to keep connection alive
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
    return { success: true };
  }

  /**
   * Get active participants in a stream
   */
  @SubscribeMessage('get-participants')
  handleGetParticipants(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { jobId: string }
  ) {
    const jobId = data.jobId;
    const participants: any[] = [];

    const jobSessions = this.jobSessions.get(jobId);
    if (jobSessions) {
      jobSessions.forEach((socketId) => {
        const ctx = this.sessions.get(socketId);
        if (ctx) {
          participants.push({
            userId: ctx.userId,
            role: ctx.role,
            connectedAt: ctx.connectedAt.toISOString(),
          });
        }
      });
    }

    return {
      success: true,
      jobId,
      participants,
      count: participants.length,
    };
  }

  /**
   * Emit stats update to supervisors
   */
  emitStreamStats(jobId: string, stats: any) {
    this.server.to(`job:${jobId}`).emit('stream-stats', {
      jobId,
      stats,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit annotation update
   */
  emitAnnotation(jobId: string, annotation: any) {
    this.server.to(`job:${jobId}`).emit('annotation-received', {
      jobId,
      annotation,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit recording status change
   */
  emitRecordingStatus(jobId: string, isRecording: boolean) {
    this.server.to(`job:${jobId}`).emit('recording-status', {
      jobId,
      isRecording,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get session count for job
   */
  getJobSessionCount(jobId: string): number {
    return this.jobSessions.get(jobId)?.size ?? 0;
  }
}
