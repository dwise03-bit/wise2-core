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
import { Injectable } from '@nestjs/common';
import { RayBanService } from './rayban.service';

@WebSocketGateway({
  namespace: 'rayban',
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class RayBanGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private deviceConnections: Map<string, Socket[]> = new Map();
  private userConnections: Map<string, Socket[]> = new Map();

  constructor(private rayBanService: RayBanService) {}

  handleConnection(socket: Socket) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    const userId = this.extractUserIdFromToken(token);
    const deviceId = socket.handshake.query.deviceId as string;

    if (userId) {
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, []);
      }
      this.userConnections.get(userId)!.push(socket);
      socket.data.userId = userId;
    }

    if (deviceId) {
      if (!this.deviceConnections.has(deviceId)) {
        this.deviceConnections.set(deviceId, []);
      }
      this.deviceConnections.get(deviceId)!.push(socket);
      socket.data.deviceId = deviceId;

      // Notify the user's dashboard when the socket is authenticated.
      if (userId) {
        this.broadcastToUser(userId, 'device:connected', {
          deviceId,
          timestamp: new Date(),
        });
      }
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = socket.data.userId;
    const deviceId = socket.data.deviceId;

    if (userId) {
      const connections = this.userConnections.get(userId);
      if (connections) {
        const index = connections.indexOf(socket);
        if (index > -1) {
          connections.splice(index, 1);
        }
      }
    }

    if (deviceId) {
      const connections = this.deviceConnections.get(deviceId);
      if (connections) {
        const index = connections.indexOf(socket);
        if (index > -1) {
          connections.splice(index, 1);
        }
      }

      // Notify dashboard of device disconnection
      this.broadcastToUser(userId, 'device:disconnected', {
        deviceId,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('capture:create')
  async handleCaptureCreate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const { deviceId, type, notes } = data;

    const capture = await this.rayBanService.createCapture(
      deviceId,
      type,
      Buffer.from(data.data, 'base64')
    );

    // Broadcast to all dashboard users watching this device
    this.broadcastToDevice(deviceId, 'capture:created', {
      capture,
      timestamp: new Date(),
    });

    return { success: true, captureId: capture.id };
  }

  @SubscribeMessage('capture:sync')
  async handleCaptureSync(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const { captureId, status } = data;

    const capture = await this.rayBanService.updateCaptureStatus(
      captureId,
      status
    );

    // Broadcast sync event to device
    this.broadcastToDevice(socket.data.deviceId, 'capture:synced', {
      captureId,
      status,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('device:status')
  async handleDeviceStatus(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const { deviceId, status, battery, location } = data;

    const device = await this.rayBanService.updateDeviceStatus(
      deviceId,
      status,
      battery,
      location
    );

    // Broadcast device status to all dashboard users
    this.broadcastToDevice(deviceId, 'device:status_updated', {
      device,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('command:send')
  async handleCommand(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const { deviceId, command, parameters } = data;

    const result = await this.rayBanService.sendCommand(
      deviceId,
      command,
      parameters
    );

    // Send command to device
    this.broadcastToDevice(deviceId, 'command:execute', {
      command,
      parameters,
      timestamp: new Date(),
    });

    return { success: true, commandId: result.id };
  }

  @SubscribeMessage('dashboard:subscribe')
  async handleDashboardSubscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const { deviceIds } = data;

    socket.data.watchingDevices = deviceIds || [];

    // Send current state
    const devices = await this.rayBanService.listDevices(socket.data.userId);
    return {
      success: true,
      devices,
      timestamp: new Date(),
    };
  }

  @SubscribeMessage('analytics:record')
  async handleAnalytics(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any
  ) {
    const { deviceId, metric, value } = data;

    await this.rayBanService.recordAnalytics(deviceId, metric, value);

    return { success: true };
  }

  // Helper methods
  private broadcastToDevice(deviceId: string, event: string, data: any) {
    const connections = this.deviceConnections.get(deviceId);
    if (connections) {
      connections.forEach(socket => {
        socket.emit(event, data);
      });
    }
  }

  private broadcastToUser(userId: string, event: string, data: any) {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.forEach(socket => {
        socket.emit(event, data);
      });
    }
  }

  broadcastToAllDashboards(event: string, data: any) {
    this.server.emit(event, data);
  }

  private extractUserIdFromToken(token: string): string | null {
    // Simple token extraction - in production, use proper JWT verification
    try {
      if (!token) return null;

      const bearerToken = token.startsWith('Bearer ')
        ? token.slice(7)
        : token;

      // Decode JWT payload (without verification for now)
      const parts = bearerToken.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );

      return payload.sub || payload.userId;
    } catch {
      return null;
    }
  }
}
