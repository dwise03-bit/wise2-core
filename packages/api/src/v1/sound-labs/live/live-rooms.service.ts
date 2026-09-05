import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateLiveRoomDto, JoinLiveRoomDto, CreatePollDto, SubmitSuggestionDto } from './dto';

/**
 * Live Rooms Service
 * Handles creation, management, and queries for live rooms and related data
 */

enum LiveRoomRole {
  CREATOR = 'creator',
  COHOST = 'cohost',
  GUEST = 'guest',
  VIEWER = 'viewer',
}

enum Permission {
  CAN_SPEAK = 0x01,
  CAN_CHAT = 0x02,
  CAN_SUGGEST = 0x04,
  CAN_MODERATE = 0x08,
  CAN_INVITE = 0x10,
}

@Injectable()
export class LiveRoomsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate URL-friendly slug from room name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 50) + '-' + Date.now().toString(36); // Add timestamp for uniqueness
  }

  /**
   * Create a new live room
   * Creator is automatically added as a member with full permissions
   */
  async createRoom(userId: string, dto: CreateLiveRoomDto): Promise<any> {
    // Generate slug from name if not provided
    const slug = dto.slug || this.generateSlug(dto.name);

    // Validate slug uniqueness
    const existing = await this.prisma.liveRoom.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new BadRequestException('Slug already in use');
    }

    // Create room
    const room = await this.prisma.liveRoom.create({
      data: {
        name: dto.name,
        slug,
        creatorId: userId,
        maxConcurrentViewers: dto.maxConcurrentViewers || 10000,
      },
    });

    // Add creator as member with all permissions
    await this.prisma.liveRoomMember.create({
      data: {
        roomId: room.id,
        userId,
        role: LiveRoomRole.CREATOR,
        permissions:
          Permission.CAN_SPEAK |
          Permission.CAN_CHAT |
          Permission.CAN_SUGGEST |
          Permission.CAN_MODERATE |
          Permission.CAN_INVITE,
      },
    });

    return room;
  }

  /**
   * Get room details with members
   */
  async getRoom(roomId: string): Promise<any> {
    const room = await this.prisma.liveRoom.findUnique({
      where: { id: roomId },
      include: {
        members: true,
        _count: {
          select: { members: true, chatMessages: true },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  /**
   * Join a live room
   * Returns the membership record with assigned permissions
   */
  async joinRoom(roomId: string, userId: string, dto: JoinLiveRoomDto): Promise<any> {
    const room = await this.prisma.liveRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if already a member
    const existing = await this.prisma.liveRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (existing && !existing.leftAt) {
      throw new BadRequestException('Already a member of this room');
    }

    // Assign role and permissions based on request
    const role = dto.roleRequest || 'viewer';
    const permissions = this.getPermissionsForRole(role);

    const member = await this.prisma.liveRoomMember.create({
      data: {
        roomId,
        userId,
        role,
        permissions,
      },
    });

    return member;
  }

  /**
   * Leave a room
   */
  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const member = await this.prisma.liveRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!member) {
      throw new NotFoundException('Not a member of this room');
    }

    // Mark left time
    await this.prisma.liveRoomMember.update({
      where: { id: member.id },
      data: { leftAt: new Date() },
    });
  }

  /**
   * Start streaming (creator only)
   */
  async startLive(roomId: string, userId: string): Promise<any> {
    const room = await this.prisma.liveRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only creator can start streaming');
    }

    return this.prisma.liveRoom.update({
      where: { id: roomId },
      data: {
        status: 'live',
        startedAt: new Date(),
      },
    });
  }

  /**
   * End streaming (creator only)
   */
  async endLive(roomId: string, userId: string): Promise<any> {
    const room = await this.prisma.liveRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only creator can end streaming');
    }

    return this.prisma.liveRoom.update({
      where: { id: roomId },
      data: {
        status: 'ended',
        endedAt: new Date(),
      },
    });
  }

  /**
   * Send chat message
   */
  async sendChatMessage(roomId: string, userId: string, message: string): Promise<any> {
    // Validate user is member
    const member = await this.prisma.liveRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!member || member.leftAt) {
      throw new ForbiddenException('Not a member of this room');
    }

    // Check permission
    if (!(member.permissions & Permission.CAN_CHAT)) {
      throw new ForbiddenException('No permission to chat');
    }

    // Validate message
    if (!message || message.length === 0 || message.length > 500) {
      throw new BadRequestException('Message must be 1-500 characters');
    }

    return this.prisma.liveChatMessage.create({
      data: {
        roomId,
        userId,
        message,
      },
    });
  }

  /**
   * Get chat history
   */
  async getChatHistory(roomId: string, limit: number = 50): Promise<any> {
    return this.prisma.liveChatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Delete chat message (moderator or owner)
   */
  async deleteChatMessage(msgId: string, userId: string, isModerator: boolean): Promise<void> {
    const msg = await this.prisma.liveChatMessage.findUnique({
      where: { id: msgId },
    });

    if (!msg) {
      throw new NotFoundException('Message not found');
    }

    if (msg.userId !== userId && !isModerator) {
      throw new ForbiddenException('Cannot delete this message');
    }

    await this.prisma.liveChatMessage.delete({
      where: { id: msgId },
    });
  }

  /**
   * Create a poll
   */
  async createPoll(roomId: string, userId: string, dto: CreatePollDto): Promise<any> {
    const room = await this.prisma.liveRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Check if creator/cohost (TODO: implement role check)
    if (room.creatorId !== userId) {
      throw new ForbiddenException('Only creator can create polls');
    }

    const expiresAt = new Date(
      Date.now() + (dto.durationSeconds || 30) * 1000
    );

    const poll = await this.prisma.livePoll.create({
      data: {
        roomId,
        question: dto.question,
        expiresAt,
        options: {
          create: dto.options.map((text) => ({ text })),
        },
      },
      include: { options: true },
    });

    return poll;
  }

  /**
   * Vote on a poll
   */
  async votePoll(optionId: string, userId: string): Promise<any> {
    const option = await this.prisma.livePollOption.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      throw new NotFoundException('Option not found');
    }

    // Check if already voted
    const existing = await this.prisma.livePollVote.findUnique({
      where: { optionId_userId: { optionId, userId } },
    });

    if (existing) {
      throw new BadRequestException('Already voted on this option');
    }

    // Record vote
    await this.prisma.livePollVote.create({
      data: {
        optionId,
        userId,
      },
    });

    // Increment vote count
    return this.prisma.livePollOption.update({
      where: { id: optionId },
      data: { votes: { increment: 1 } },
    });
  }

  /**
   * Get active polls for a room
   */
  async getActivePolls(roomId: string): Promise<any> {
    const now = new Date();
    return this.prisma.livePoll.findMany({
      where: {
        roomId,
        expiresAt: { gt: now },
      },
      include: {
        options: {
          include: { _count: { select: { pollVotes: true } } },
        },
      },
    });
  }

  /**
   * Submit audience suggestion
   */
  async submitSuggestion(roomId: string, userId: string, dto: SubmitSuggestionDto): Promise<any> {
    // Validate user is member
    const member = await this.prisma.liveRoomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });

    if (!member || member.leftAt) {
      throw new ForbiddenException('Not a member of this room');
    }

    // Check permission
    if (!(member.permissions & Permission.CAN_SUGGEST)) {
      throw new ForbiddenException('No permission to suggest');
    }

    if (!dto.suggestion || dto.suggestion.length === 0 || dto.suggestion.length > 200) {
      throw new BadRequestException('Suggestion must be 1-200 characters');
    }

    return this.prisma.audienceSuggestion.create({
      data: {
        roomId,
        userId,
        suggestion: dto.suggestion,
      },
    });
  }

  /**
   * Get audience suggestions
   */
  async getSuggestions(roomId: string, orderBy: 'newest' | 'votes' = 'votes'): Promise<any> {
    const orderByField = orderBy === 'votes' ? 'votes' : 'createdAt';

    return this.prisma.audienceSuggestion.findMany({
      where: { roomId },
      orderBy: { [orderByField]: 'desc' },
      take: 100,
    });
  }

  /**
   * Vote on suggestion
   */
  async voteSuggestion(suggestionId: string): Promise<any> {
    const suggestion = await this.prisma.audienceSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    return this.prisma.audienceSuggestion.update({
      where: { id: suggestionId },
      data: { votes: { increment: 1 } },
    });
  }

  /**
   * Delete suggestion (moderator or owner)
   */
  async deleteSuggestion(suggestionId: string, userId: string, isModerator: boolean): Promise<void> {
    const suggestion = await this.prisma.audienceSuggestion.findUnique({
      where: { id: suggestionId },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    if (suggestion.userId !== userId && !isModerator) {
      throw new ForbiddenException('Cannot delete this suggestion');
    }

    await this.prisma.audienceSuggestion.delete({
      where: { id: suggestionId },
    });
  }

  /**
   * Update room (Phase 2.2 - Video)
   */
  async updateRoom(roomId: string, data: any): Promise<any> {
    return await this.prisma.liveRoom.update({
      where: { id: roomId },
      data,
      include: {
        creator: { select: { id: true, email: true, name: true } },
        members: { include: { user: { select: { id: true, email: true, name: true } } } },
      },
    });
  }

  /**
   * Get room members (Phase 2.2 - Video)
   */
  async getRoomMembers(roomId: string): Promise<any[]> {
    return await this.prisma.liveRoomMember.findMany({
      where: { roomId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  /**
   * Get permissions bitmap for a role
   */
  private getPermissionsForRole(role: LiveRoomRole | string): number {
    switch (role) {
      case LiveRoomRole.CREATOR:
        return (
          Permission.CAN_SPEAK |
          Permission.CAN_CHAT |
          Permission.CAN_SUGGEST |
          Permission.CAN_MODERATE |
          Permission.CAN_INVITE
        );
      case LiveRoomRole.COHOST:
        return (
          Permission.CAN_SPEAK |
          Permission.CAN_CHAT |
          Permission.CAN_SUGGEST |
          Permission.CAN_MODERATE
        );
      case LiveRoomRole.GUEST:
        return Permission.CAN_SPEAK | Permission.CAN_CHAT | Permission.CAN_SUGGEST;
      case LiveRoomRole.VIEWER:
      default:
        return Permission.CAN_CHAT | Permission.CAN_SUGGEST;
    }
  }
}
