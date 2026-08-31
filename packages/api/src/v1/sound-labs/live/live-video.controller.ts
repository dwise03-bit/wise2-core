import { Controller, Post, Get, Body, Param, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { AgoraVideoService } from './agora-video.service';
import { LiveSessionService } from './live-session.service';
import { LiveRoomsService } from './live-rooms.service';

/**
 * Live Video Streaming Controller (Phase 2.2)
 * Handles video token generation and streaming endpoints
 */

@Controller('v1/sound-labs/live/video')
export class LiveVideoController {
  constructor(
    private videoService: AgoraVideoService,
    private sessionService: LiveSessionService,
    private roomsService: LiveRoomsService
  ) {}

  /**
   * POST /video/token
   * Generate video token for joining a live room
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  async getVideoToken(
    @Body() dto: { roomId: string; role?: 'broadcaster' | 'viewer' },
    @Headers('authorization') authHeader: string
  ) {
    // Validate session
    const session = await this.sessionService.validateToken(authHeader);

    // Verify room exists
    const room = await this.roomsService.getRoom(dto.roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Generate token based on role
    const role = dto.role || 'viewer';
    const channelName = room.slug; // Use room slug as Agora channel name

    try {
      if (role === 'broadcaster') {
        // Only room creator can broadcast
        if (room.creatorId !== session.userId) {
          return { success: false, error: 'Only room creator can broadcast' };
        }
        const token = this.videoService.generateBroadcasterToken(channelName, session.userId);
        return { success: true, data: token };
      } else {
        // Viewers can watch
        const token = this.videoService.generateViewerToken(channelName, session.userId);
        return { success: true, data: token };
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, error: msg };
    }
  }

  /**
   * GET /video/config
   * Get Agora client configuration
   */
  @Get('config')
  getConfig() {
    return {
      success: true,
      data: this.videoService.getClientConfig(),
    };
  }

  /**
   * POST /video/rooms/:roomId/start-broadcast
   * Start broadcasting (room creator only)
   */
  @Post('rooms/:roomId/start-broadcast')
  async startBroadcast(
    @Param('roomId') roomId: string,
    @Headers('authorization') authHeader: string
  ) {
    const session = await this.sessionService.validateToken(authHeader);
    const room = await this.roomsService.getRoom(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.creatorId !== session.userId) {
      return { success: false, error: 'Only room creator can start broadcast' };
    }

    // Generate broadcaster token
    const token = this.videoService.generateBroadcasterToken(room.slug, session.userId);

    // Update room status to 'live'
    const updated = await this.roomsService.updateRoom(roomId, {
      status: 'live',
      startedAt: new Date(),
    });

    return {
      success: true,
      data: {
        room: updated,
        videoToken: token,
      },
    };
  }

  /**
   * POST /video/rooms/:roomId/stop-broadcast
   * Stop broadcasting (room creator only)
   */
  @Post('rooms/:roomId/stop-broadcast')
  async stopBroadcast(
    @Param('roomId') roomId: string,
    @Headers('authorization') authHeader: string
  ) {
    const session = await this.sessionService.validateToken(authHeader);
    const room = await this.roomsService.getRoom(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.creatorId !== session.userId) {
      return { success: false, error: 'Only room creator can stop broadcast' };
    }

    // Update room status to 'ended'
    const updated = await this.roomsService.updateRoom(roomId, {
      status: 'ended',
      endedAt: new Date(),
    });

    return {
      success: true,
      data: updated,
    };
  }

  /**
   * GET /video/rooms/:roomId/stats
   * Get live room viewer stats (broadcast only)
   */
  @Get('rooms/:roomId/stats')
  async getRoomStats(@Param('roomId') roomId: string) {
    const room = await this.roomsService.getRoom(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Get member count
    const members = await this.roomsService.getRoomMembers(roomId);
    const viewers = members.filter((m) => m.role === 'viewer').length;
    const speakers = members.filter((m) => m.role !== 'viewer').length;

    return {
      success: true,
      data: {
        roomId,
        status: room.status,
        viewerCount: viewers,
        speakerCount: speakers,
        totalCount: members.length,
        startedAt: room.startedAt,
        maxConcurrentViewers: room.maxConcurrentViewers,
      },
    };
  }
}
