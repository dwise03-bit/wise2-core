import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { StreamingService, StreamSession } from './streaming.service';

@Controller('api/streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Post('start')
  async startStream(
    @Body()
    body: {
      sessionId: string;
      title: string;
      description: string;
      destinations?: string[];
    }
  ): Promise<StreamSession> {
    return this.streamingService.startStream(
      body.sessionId,
      body.title,
      body.description,
      body.destinations
    );
  }

  @Post('end/:sessionId')
  async endStream(@Param('sessionId') sessionId: string): Promise<StreamSession | null> {
    return this.streamingService.endStream(sessionId);
  }

  @Get('status/:sessionId')
  async getStatus(@Param('sessionId') sessionId: string): Promise<StreamSession | null> {
    return this.streamingService.getStreamStatus(sessionId);
  }

  @Get('viewers/:sessionId')
  async getViewers(@Param('sessionId') sessionId: string): Promise<{ count: number }> {
    const count = await this.streamingService.getViewerCount(sessionId);
    return { count };
  }

  @Post('viewers/:sessionId/increment')
  async incrementViewers(@Param('sessionId') sessionId: string): Promise<{ count: number }> {
    const count = await this.streamingService.incrementViewers(sessionId);
    return { count };
  }

  @Post('viewers/:sessionId/decrement')
  async decrementViewers(@Param('sessionId') sessionId: string): Promise<{ count: number }> {
    const count = await this.streamingService.decrementViewers(sessionId);
    return { count };
  }

  @Patch('viewers/:sessionId')
  async updateViewers(
    @Param('sessionId') sessionId: string,
    @Body() body: { count: number }
  ): Promise<{ success: boolean }> {
    await this.streamingService.updateViewerCount(sessionId, body.count);
    return { success: true };
  }

  @Get('live')
  async getLiveSessions(): Promise<StreamSession[]> {
    return this.streamingService.getLiveSessions();
  }

  @Get('all')
  async getAllSessions(): Promise<StreamSession[]> {
    return this.streamingService.getAllSessions();
  }
}
