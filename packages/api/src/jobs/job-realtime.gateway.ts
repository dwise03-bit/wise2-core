import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'jobs',
  cors: { origin: '*' },
})
@Injectable()
export class JobRealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(JobRealtimeGateway.name);
  private jobSubscriptions: Map<string, Set<string>> = new Map(); // jobId -> socketIds
  private socketJobMap: Map<string, string> = new Map(); // socketId -> jobId

  handleConnection(socket: Socket, ...args: any[]) {
    this.logger.debug(`Socket ${socket.id} connected`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.debug(`Socket ${socket.id} disconnected`);
    const jobId = this.socketJobMap.get(socket.id);
    if (jobId) {
      const subscribers = this.jobSubscriptions.get(jobId);
      if (subscribers) {
        subscribers.delete(socket.id);
      }
      this.socketJobMap.delete(socket.id);
    }
  }

  /**
   * Subscribe to job updates
   * Client sends: { jobId: 'job-123' }
   */
  @SubscribeMessage('subscribe-job')
  handleSubscribeJob(socket: Socket, data: { jobId: string }) {
    const { jobId } = data;
    this.logger.debug(`Socket ${socket.id} subscribing to job ${jobId}`);

    // Track subscription
    if (!this.jobSubscriptions.has(jobId)) {
      this.jobSubscriptions.set(jobId, new Set());
    }
    this.jobSubscriptions.get(jobId)!.add(socket.id);
    this.socketJobMap.set(socket.id, jobId);

    // Join socket to room
    socket.join(`job:${jobId}`);

    // Send confirmation
    socket.emit('subscription-confirmed', {
      jobId,
      timestamp: new Date(),
      message: `Subscribed to job ${jobId}`,
    });
  }

  /**
   * Unsubscribe from job updates
   */
  @SubscribeMessage('unsubscribe-job')
  handleUnsubscribeJob(socket: Socket, data: { jobId: string }) {
    const { jobId } = data;
    this.logger.debug(`Socket ${socket.id} unsubscribing from job ${jobId}`);

    const subscribers = this.jobSubscriptions.get(jobId);
    if (subscribers) {
      subscribers.delete(socket.id);
    }
    this.socketJobMap.delete(socket.id);

    socket.leave(`job:${jobId}`);
    socket.emit('unsubscription-confirmed', { jobId });
  }

  // Public methods to broadcast events

  /**
   * Broadcast capture upload to supervisors
   */
  broadcastCapture(jobId: string, captureData: any): void {
    this.server.to(`job:${jobId}`).emit('capture-uploaded', {
      jobId,
      capture: captureData,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast job status update
   */
  broadcastJobStatus(jobId: string, status: any): void {
    this.server.to(`job:${jobId}`).emit('job-status-updated', {
      jobId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast technician presence update
   */
  broadcastPresence(jobId: string, presence: any): void {
    this.server.to(`job:${jobId}`).emit('technician-presence', {
      jobId,
      presence,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast device linked to job
   */
  broadcastDeviceLink(jobId: string, deviceId: string, technicianId: string): void {
    this.server.to(`job:${jobId}`).emit('device-linked', {
      jobId,
      deviceId,
      technicianId,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast diagnostics completion
   */
  broadcastDiagnosticsComplete(jobId: string, diagnostics: any): void {
    this.server.to(`job:${jobId}`).emit('diagnostics-complete', {
      jobId,
      diagnostics,
      timestamp: new Date(),
    });
  }

  /**
   * Get active subscribers for job
   */
  getJobSubscribers(jobId: string): number {
    const subscribers = this.jobSubscriptions.get(jobId);
    return subscribers ? subscribers.size : 0;
  }
}
