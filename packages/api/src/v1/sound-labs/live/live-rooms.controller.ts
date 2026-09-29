import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { LiveRoomsService } from './live-rooms.service';
import { LiveSessionService } from './live-session.service';
import { LiveSessionMiddleware } from './live-session.middleware';
import {
  CreateLiveRoomDto,
  JoinLiveRoomDto,
  SendChatMessageDto,
  CreatePollDto,
  VotePollDto,
  SubmitSuggestionDto,
} from './dto';

/**
 * Live Rooms REST Controller
 * All endpoints require JWT authentication via LiveSessionMiddleware
 */

@Controller('v1/sound-labs/live')
export class LiveRoomsController {
  constructor(
    private roomsService: LiveRoomsService,
    private sessionService: LiveSessionService
  ) {}

  /**
   * POST /v1/sound-labs/live/rooms
   * Create a new live room (authenticated user becomes creator)
   */
  @Post('rooms')
  async createRoom(@Req() req: Request & { liveSession?: any }, @Body() dto: CreateLiveRoomDto) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.createRoom(session.userId, dto);
  }

  /**
   * GET /v1/sound-labs/live/rooms/:id
   * Get room details with member list
   */
  @Get('rooms/:id')
  async getRoom(@Param('id') roomId: string) {
    return this.roomsService.getRoom(roomId);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/join
   * Join a live room
   */
  @Post('rooms/:id/join')
  async joinRoom(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any },
    @Body() dto: JoinLiveRoomDto
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.joinRoom(roomId, session.userId, dto);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/leave
   * Leave a room
   */
  @Post('rooms/:id/leave')
  async leaveRoom(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any }
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    await this.roomsService.leaveRoom(roomId, session.userId);
    return { success: true };
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/start
   * Start streaming (creator only)
   */
  @Post('rooms/:id/start')
  async startLive(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any }
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.startLive(roomId, session.userId);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/end
   * End streaming (creator only)
   */
  @Post('rooms/:id/end')
  async endLive(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any }
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.endLive(roomId, session.userId);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/chat
   * Send chat message
   */
  @Post('rooms/:id/chat')
  async sendChatMessage(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any },
    @Body() dto: SendChatMessageDto
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.sendChatMessage(roomId, session.userId, dto.message);
  }

  /**
   * GET /v1/sound-labs/live/rooms/:id/chat?limit=50
   * Get chat history
   */
  @Get('rooms/:id/chat')
  async getChatHistory(
    @Param('id') roomId: string,
    @Query('limit') limit: string = '50'
  ) {
    const parsedLimit = Math.min(parseInt(limit, 10) || 50, 500);
    return this.roomsService.getChatHistory(roomId, parsedLimit);
  }

  /**
   * DELETE /v1/sound-labs/live/rooms/:id/chat/:msgId
   * Delete chat message (moderator or owner)
   */
  @Delete('rooms/:id/chat/:msgId')
  async deleteChatMessage(
    @Param('id') roomId: string,
    @Param('msgId') msgId: string,
    @Req() req: Request & { liveSession?: any }
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    await this.roomsService.deleteChatMessage(msgId, session.userId, false);
    return { success: true };
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/polls
   * Create a poll (creator/cohost only)
   */
  @Post('rooms/:id/polls')
  async createPoll(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any },
    @Body() dto: CreatePollDto
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.createPoll(roomId, session.userId, dto);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/polls/:pollId/vote
   * Vote on a poll
   */
  @Post('rooms/:id/polls/:pollId/vote')
  async votePoll(
    @Param('id') roomId: string,
    @Param('pollId') pollId: string,
    @Req() req: Request & { liveSession?: any },
    @Body() dto: VotePollDto
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.votePoll(dto.optionId, session.userId);
  }

  /**
   * GET /v1/sound-labs/live/rooms/:id/polls
   * Get active polls for a room
   */
  @Get('rooms/:id/polls')
  async getActivePolls(@Param('id') roomId: string) {
    return this.roomsService.getActivePolls(roomId);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/suggestions
   * Submit an audience suggestion
   */
  @Post('rooms/:id/suggestions')
  async submitSuggestion(
    @Param('id') roomId: string,
    @Req() req: Request & { liveSession?: any },
    @Body() dto: SubmitSuggestionDto
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.submitSuggestion(roomId, session.userId, dto);
  }

  /**
   * GET /v1/sound-labs/live/rooms/:id/suggestions?orderBy=votes
   * Get suggestions (sorted by votes or date)
   */
  @Get('rooms/:id/suggestions')
  async getSuggestions(
    @Param('id') roomId: string,
    @Query('orderBy') orderBy: 'newest' | 'votes' = 'votes'
  ) {
    return this.roomsService.getSuggestions(roomId, orderBy);
  }

  /**
   * POST /v1/sound-labs/live/rooms/:id/suggestions/:sugId/vote
   * Vote up a suggestion
   */
  @Post('rooms/:id/suggestions/:sugId/vote')
  async voteSuggestion(
    @Param('id') roomId: string,
    @Param('sugId') sugId: string,
    @Req() req: Request & { liveSession?: any }
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    return this.roomsService.voteSuggestion(sugId);
  }

  /**
   * DELETE /v1/sound-labs/live/rooms/:id/suggestions/:sugId
   * Delete suggestion (moderator or owner)
   */
  @Delete('rooms/:id/suggestions/:sugId')
  async deleteSuggestion(
    @Param('id') roomId: string,
    @Param('sugId') sugId: string,
    @Req() req: Request & { liveSession?: any }
  ) {
    const session = (req as any).liveSession;
    if (!session) {
      throw new BadRequestException('Live session required');
    }

    await this.roomsService.deleteSuggestion(sugId, session.userId, false);
    return { success: true };
  }
}
