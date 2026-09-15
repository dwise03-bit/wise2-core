import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { HvacTroubleshooterService } from './hvac-troubleshooter.service';

@WebSocketGateway({
  namespace: '/ws/hvac',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3005',
    ],
    credentials: true,
  },
})
export class HvacTroubleshooterGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger: Logger = new Logger('HvacTroubleshooterGateway');
  private deviceConnections: Map<string, Set<string>> = new Map(); // deviceId -> socket IDs

  constructor(private readonly service: HvacTroubleshooterService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove device connections
    for (const [deviceId, sockets] of this.deviceConnections) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.deviceConnections.delete(deviceId);
          this.logger.log(`Device ${deviceId} no longer has active connections`);
        }
      }
    }
  }

  @SubscribeMessage('subscribe-device')
  handleSubscribeDevice(client: Socket, deviceId: string) {
    this.logger.log(`Client ${client.id} subscribing to device ${deviceId}`);

    if (!this.deviceConnections.has(deviceId)) {
      this.deviceConnections.set(deviceId, new Set());
    }
    this.deviceConnections.get(deviceId).add(client.id);

    // Join room for this device
    client.join(`device:${deviceId}`);
    client.emit('subscribed', { deviceId, success: true });
  }

  @SubscribeMessage('unsubscribe-device')
  handleUnsubscribeDevice(client: Socket, deviceId: string) {
    this.logger.log(`Client ${client.id} unsubscribing from device ${deviceId}`);
    const sockets = this.deviceConnections.get(deviceId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.deviceConnections.delete(deviceId);
      }
    }
    client.leave(`device:${deviceId}`);
    client.emit('unsubscribed', { deviceId, success: true });
  }

  @SubscribeMessage('reading')
  async handleReading(client: Socket, data: any) {
    const { deviceId, temperatureF, humidityPercent, highSidePressurePsi } = data;

    this.logger.log(`Received reading from device ${deviceId}`);

    try {
      // Save to database
      const reading = await this.service.createReading(data);

      // Broadcast to all subscribed clients for this device
      this.server.to(`device:${deviceId}`).emit('reading-update', {
        deviceId,
        reading,
        receivedAt: new Date(),
      });

      // Acknowledge to sender
      client.emit('reading-saved', { success: true, readingId: reading.id });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error saving reading: ${msg}`);
      client.emit('reading-error', { error: msg });
    }
  }

  @SubscribeMessage('device-status')
  async handleDeviceStatus(client: Socket, data: any) {
    const { deviceId, isOnline, wifiStrength, batteryLevel } = data;

    try {
      const updated = await this.service.updateDeviceStatus(deviceId, {
        isOnline,
        wifiStrength,
        batteryLevel,
        lastSyncAt: new Date(),
      });

      // Broadcast status update
      this.server?.to(`device:${deviceId}`).emit('device-status-update', {
        deviceId,
        status: updated,
      });

      client.emit('device-status-saved', { success: true });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating device status: ${msg}`);
      client.emit('device-status-error', { error: msg });
    }
  }

  @SubscribeMessage('sync-request')
  async handleSyncRequest(client: Socket, data: any) {
    const { deviceId, readingIds } = data;

    try {
      await this.service.markReadingsSynced(deviceId, readingIds);

      this.server.to(`device:${deviceId}`).emit('sync-complete', {
        deviceId,
        count: readingIds.length,
      });

      client.emit('sync-success', { readingIds });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error syncing readings: ${msg}`);
      client.emit('sync-error', { error: msg });
    }
  }

  // Public method for API to broadcast readings
  broadcastReading(deviceId: string, reading: any) {
    this.server?.to(`device:${deviceId}`).emit('reading-update', {
      deviceId,
      reading,
      receivedAt: new Date(),
    });
  }

  // Public method for API to broadcast device status
  broadcastDeviceStatus(deviceId: string, status: any) {
    this.server.to(`device:${deviceId}`).emit('device-status-update', {
      deviceId,
      status,
    });
  }
}
