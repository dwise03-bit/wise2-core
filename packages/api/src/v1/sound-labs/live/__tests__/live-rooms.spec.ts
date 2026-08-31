import { Test, TestingModule } from '@nestjs/testing';
import { LiveRoomsService } from '../live-rooms.service';
import { LiveSessionService } from '../live-session.service';
import { VersionStackService } from '../version-stack.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('Live Rooms Service', () => {
  let service: LiveRoomsService;
  let prisma: PrismaService;

  const mockUserId = 'user-123';
  const mockRoomData = {
    id: 'room-1',
    name: 'Test Room',
    slug: 'test-room',
    creatorId: mockUserId,
    status: 'draft',
    maxConcurrentViewers: 10000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveRoomsService,
        {
          provide: PrismaService,
          useValue: {
            liveRoom: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            liveRoomMember: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            liveChatMessage: {
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
            audienceSuggestion: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            livePoll: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            livePollOption: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            livePollVote: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LiveRoomsService>(LiveRoomsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Create Room', () => {
    it('should create a new live room', async () => {
      const dto = { name: 'Test Room', slug: 'test-room' };

      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.liveRoom.create as jest.Mock).mockResolvedValue(mockRoomData);
      (prisma.liveRoomMember.create as jest.Mock).mockResolvedValue({
        id: 'member-1',
        roomId: mockRoomData.id,
        userId: mockUserId,
        role: 'creator',
        permissions: 31,
      });

      const result = await service.createRoom(mockUserId, dto);

      expect(result).toEqual(mockRoomData);
      expect(prisma.liveRoom.create).toHaveBeenCalled();
      expect(prisma.liveRoomMember.create).toHaveBeenCalled();
    });

    it('should reject duplicate slug', async () => {
      const dto = { name: 'Test Room', slug: 'test-room' };

      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(mockRoomData);

      await expect(service.createRoom(mockUserId, dto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('Join Room', () => {
    it('should add user to room as viewer', async () => {
      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(mockRoomData);
      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.liveRoomMember.create as jest.Mock).mockResolvedValue({
        id: 'member-2',
        roomId: mockRoomData.id,
        userId: 'user-456',
        role: 'viewer',
        permissions: 6, // can_chat | can_suggest
      });

      const result = await service.joinRoom(mockRoomData.id, 'user-456', {});

      expect(result.role).toBe('viewer');
      expect(prisma.liveRoomMember.create).toHaveBeenCalled();
    });

    it('should reject if already a member', async () => {
      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(mockRoomData);
      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue({
        roomId: mockRoomData.id,
        userId: 'user-456',
        leftAt: null,
      });

      await expect(
        service.joinRoom(mockRoomData.id, 'user-456', {})
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Start/End Live', () => {
    it('should start live stream (creator only)', async () => {
      const liveData = { ...mockRoomData, status: 'live', startedAt: new Date() };

      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(mockRoomData);
      (prisma.liveRoom.update as jest.Mock).mockResolvedValue(liveData);

      const result = await service.startLive(mockRoomData.id, mockUserId);

      expect(result.status).toBe('live');
      expect(prisma.liveRoom.update).toHaveBeenCalled();
    });

    it('should reject start if not creator', async () => {
      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(mockRoomData);

      await expect(
        service.startLive(mockRoomData.id, 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Chat Messages', () => {
    it('should send chat message', async () => {
      const mockMember = {
        roomId: mockRoomData.id,
        userId: mockUserId,
        permissions: 6, // can_chat
        leftAt: null,
      };

      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.liveChatMessage.create as jest.Mock).mockResolvedValue({
        id: 'msg-1',
        roomId: mockRoomData.id,
        userId: mockUserId,
        message: 'Hello!',
        createdAt: new Date(),
      });

      const result = await service.sendChatMessage(
        mockRoomData.id,
        mockUserId,
        'Hello!'
      );

      expect(result.message).toBe('Hello!');
      expect(prisma.liveChatMessage.create).toHaveBeenCalled();
    });

    it('should reject message if no permission', async () => {
      const mockMember = {
        roomId: mockRoomData.id,
        userId: mockUserId,
        permissions: 0, // no permissions
        leftAt: null,
      };

      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue(mockMember);

      await expect(
        service.sendChatMessage(mockRoomData.id, mockUserId, 'Hello!')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject message if not a member', async () => {
      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.sendChatMessage(mockRoomData.id, mockUserId, 'Hello!')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate message length', async () => {
      const mockMember = {
        roomId: mockRoomData.id,
        userId: mockUserId,
        permissions: 6,
        leftAt: null,
      };

      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue(mockMember);

      await expect(
        service.sendChatMessage(mockRoomData.id, mockUserId, '')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Suggestions', () => {
    it('should submit suggestion', async () => {
      const mockMember = {
        roomId: mockRoomData.id,
        userId: mockUserId,
        permissions: 6, // can_suggest
        leftAt: null,
      };

      (prisma.liveRoomMember.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.audienceSuggestion.create as jest.Mock).mockResolvedValue({
        id: 'sug-1',
        roomId: mockRoomData.id,
        userId: mockUserId,
        suggestion: 'Play a song',
        votes: 0,
        createdAt: new Date(),
      });

      const result = await service.submitSuggestion(
        mockRoomData.id,
        mockUserId,
        { suggestion: 'Play a song' }
      );

      expect(result.suggestion).toBe('Play a song');
      expect(prisma.audienceSuggestion.create).toHaveBeenCalled();
    });

    it('should vote on suggestion', async () => {
      (prisma.audienceSuggestion.findUnique as jest.Mock).mockResolvedValue({
        id: 'sug-1',
        votes: 1,
      });
      (prisma.audienceSuggestion.update as jest.Mock).mockResolvedValue({
        id: 'sug-1',
        votes: 2,
      });

      const result = await service.voteSuggestion('sug-1');

      expect(result.votes).toBe(2);
      expect(prisma.audienceSuggestion.update).toHaveBeenCalled();
    });
  });

  describe('Polls', () => {
    it('should create poll (creator only)', async () => {
      (prisma.liveRoom.findUnique as jest.Mock).mockResolvedValue(mockRoomData);
      (prisma.livePoll.create as jest.Mock).mockResolvedValue({
        id: 'poll-1',
        roomId: mockRoomData.id,
        question: 'What song next?',
        expiresAt: new Date(Date.now() + 30000),
        options: [
          { id: 'opt-1', text: 'Song A' },
          { id: 'opt-2', text: 'Song B' },
        ],
      });

      const result = await service.createPoll(mockRoomData.id, mockUserId, {
        question: 'What song next?',
        options: ['Song A', 'Song B'],
        durationSeconds: 30,
      });

      expect(result.question).toBe('What song next?');
      expect(result.options).toHaveLength(2);
      expect(prisma.livePoll.create).toHaveBeenCalled();
    });
  });
});
