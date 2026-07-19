import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationService } from '../collaboration.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

/**
 * Collaboration Service Unit Tests
 * Tests all core business logic and permissions
 */
describe('CollaborationService', () => {
  let service: CollaborationService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockProjectId = 'proj-123';
  const mockUserId = 'user-123';
  const mockOwnerId = 'user-owner';
  const mockCollaboratorId = 'collab-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationService,
        {
          provide: PrismaService,
          useValue: {
            soundLabsProject: {
              findUnique: jest.fn(),
            },
            projectCollaborator: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            projectComment: {
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
            projectInvite: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            activityLog: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            versionHistory: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
            userPresence: {
              upsert: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CollaborationService>(CollaborationService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('Permission Checking', () => {
    it('should grant OWNER all permissions', async () => {
      jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.soundLabsProject, 'findUnique').mockResolvedValueOnce({
        id: mockProjectId,
        userId: mockUserId, // User is owner
      } as any);

      const result = await service.hasPermission(mockProjectId, mockUserId, 'edit_track');
      expect(result).toBe(true);

      const result2 = await service.hasPermission(mockProjectId, mockUserId, 'delete_project');
      expect(result2).toBe(true);
    });

    it('should grant EDITOR limited permissions', async () => {
      jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValueOnce({
        id: mockCollaboratorId,
        projectId: mockProjectId,
        userId: mockUserId,
        role: 'EDITOR',
        permissions: ['edit_track', 'edit_mixer'],
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        status: 'active',
      } as any);

      const result = await service.hasPermission(mockProjectId, mockUserId, 'edit_track');
      expect(result).toBe(true);

      // EDITOR cannot manage collaborators
      const result2 = await service.hasPermission(
        mockProjectId,
        mockUserId,
        'manage_collaborators',
      );
      expect(result2).toBe(false);
    });

    it('should deny VIEWER all editing permissions', async () => {
      jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValueOnce({
        id: mockCollaboratorId,
        projectId: mockProjectId,
        userId: mockUserId,
        role: 'VIEWER',
        permissions: [],
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        status: 'active',
      } as any);

      const result = await service.hasPermission(mockProjectId, mockUserId, 'edit_track');
      expect(result).toBe(false);

      const result2 = await service.hasPermission(mockProjectId, mockUserId, 'delete_project');
      expect(result2).toBe(false);
    });

    it('should throw if project does not exist', async () => {
      jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.soundLabsProject, 'findUnique').mockResolvedValueOnce(null);

      await expect(
        service.hasPermission(mockProjectId, mockUserId, 'edit_track'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Comments', () => {
    it('should create a comment', async () => {
      const commentData = {
        id: 'comment-123',
        projectId: mockProjectId,
        userId: mockUserId,
        content: 'Test comment',
        timestamp: null,
        trackId: null,
        threadId: null,
        mentions: [],
        reactions: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        resolved: false,
      };

      jest.spyOn(prisma.projectComment, 'create').mockResolvedValueOnce({
        ...commentData,
        user: { id: mockUserId, email: 'test@example.com', name: 'Test User' },
      } as any);

      jest.spyOn(prisma.activityLog, 'create').mockResolvedValueOnce({} as any);

      const result = await service.createComment(mockProjectId, mockUserId, {
        content: 'Test comment',
      });

      expect(result).toEqual(expect.objectContaining({ content: 'Test comment' }));
      expect(prisma.projectComment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ projectId: mockProjectId, userId: mockUserId }),
        include: expect.any(Object),
      });
    });

    it('should fetch comments for a project', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          projectId: mockProjectId,
          userId: mockUserId,
          content: 'Comment 1',
        },
        {
          id: 'comment-2',
          projectId: mockProjectId,
          userId: mockUserId,
          content: 'Comment 2',
        },
      ];

      jest.spyOn(prisma.projectComment, 'findMany').mockResolvedValueOnce(mockComments as any);

      const result = await service.getComments(mockProjectId);
      expect(result).toHaveLength(2);
      expect(result[0].content).toBe('Comment 1');
    });
  });

  describe('Invitations', () => {
    it('should create an invitation', async () => {
      jest.spyOn(prisma.soundLabsProject, 'findUnique').mockResolvedValueOnce({
        id: mockProjectId,
        userId: mockOwnerId,
      } as any);

      jest.spyOn(prisma.projectCollaborator, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.projectInvite, 'create').mockResolvedValueOnce({
        id: 'invite-123',
        projectId: mockProjectId,
        invitedEmail: 'new@example.com',
        token: 'token-123',
        role: 'EDITOR',
        expiresAt: null,
      } as any);

      // Mock the permission check
      jest.spyOn(service, 'hasPermission').mockResolvedValueOnce(true);

      const result = await service.inviteCollaborator(mockProjectId, mockOwnerId, {
        invitedEmail: 'new@example.com',
        role: 'EDITOR',
      });

      expect(result).toEqual(expect.objectContaining({ invitedEmail: 'new@example.com' }));
    });

    it('should reject invitation if user lacks permission', async () => {
      jest.spyOn(service, 'hasPermission').mockResolvedValueOnce(false);
      jest.spyOn(prisma.soundLabsProject, 'findUnique').mockResolvedValueOnce({
        id: mockProjectId,
      } as any);

      await expect(
        service.inviteCollaborator(mockProjectId, mockUserId, {
          invitedEmail: 'new@example.com',
          role: 'EDITOR',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Versions', () => {
    it('should create a version snapshot', async () => {
      const snapshot = { tracks: [], mixer: {} };

      jest.spyOn(prisma.versionHistory, 'create').mockResolvedValueOnce({
        id: 'version-123',
        projectId: mockProjectId,
        userId: mockUserId,
        snapshot,
        label: 'Final Mix v1',
        changeLog: 'Added drums',
      } as any);

      jest.spyOn(prisma.activityLog, 'create').mockResolvedValueOnce({} as any);

      const result = await service.createVersionSnapshot(
        mockProjectId,
        mockUserId,
        snapshot,
        'Final Mix v1',
        'Added drums',
      );

      expect(result.label).toBe('Final Mix v1');
      expect(result.snapshot).toEqual(snapshot);
    });

    it('should fetch version history', async () => {
      const mockVersions = [
        { id: 'v1', projectId: mockProjectId, userId: mockUserId, snapshot: {} },
        { id: 'v2', projectId: mockProjectId, userId: mockUserId, snapshot: {} },
      ];

      jest.spyOn(prisma.versionHistory, 'findMany').mockResolvedValueOnce(mockVersions as any);

      const result = await service.getVersionHistory(mockProjectId);
      expect(result).toHaveLength(2);
    });
  });

  describe('Presence Tracking', () => {
    it('should update user presence', async () => {
      jest.spyOn(prisma.userPresence, 'upsert').mockResolvedValueOnce({
        projectId: mockProjectId,
        userId: mockUserId,
        status: 'online',
      } as any);

      const result = await service.updatePresence(mockProjectId, mockUserId, {
        status: 'online',
        userName: 'Test User',
        userEmail: 'test@example.com',
      });

      expect(result.status).toBe('online');
    });

    it('should fetch active users', async () => {
      const mockUsers = [
        {
          userId: 'user-1',
          status: 'online',
          user: { name: 'User 1', email: 'user1@example.com' },
        },
        {
          userId: 'user-2',
          status: 'away',
          user: { name: 'User 2', email: 'user2@example.com' },
        },
      ];

      jest.spyOn(prisma.userPresence, 'findMany').mockResolvedValueOnce(mockUsers as any);

      const result = await service.getActiveUsers(mockProjectId);
      expect(result).toHaveLength(2);
      expect(result[0].userName).toBe('User 1');
    });
  });

  describe('Activity Logging', () => {
    it('should log activity', async () => {
      jest.spyOn(prisma.activityLog, 'create').mockResolvedValueOnce({} as any);

      await service.logActivity(mockProjectId, mockUserId, 'track_added' as any, {
        trackId: 'track-1',
      });

      expect(prisma.activityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: mockProjectId,
            userId: mockUserId,
          }),
        }),
      );
    });

    it('should fetch activity history', async () => {
      const mockActivities = [
        { id: 'a1', projectId: mockProjectId, userId: mockUserId, action: 'track_added' },
      ];

      jest.spyOn(prisma.activityLog, 'findMany').mockResolvedValueOnce(mockActivities as any);

      const result = await service.getActivityHistory(mockProjectId);
      expect(result).toHaveLength(1);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow edits within rate limit', () => {
      const result1 = service.checkRateLimit(mockUserId, mockProjectId, 'track-1');
      expect(result1).toBe(true);

      const result2 = service.checkRateLimit(mockUserId, mockProjectId, 'track-1');
      expect(result2).toBe(true);
    });

    it('should deny edits exceeding rate limit', () => {
      // Fill the rate limit window
      for (let i = 0; i < 10; i++) {
        service.checkRateLimit(mockUserId, mockProjectId, 'track-1');
      }

      // Next request should be denied
      const result = service.checkRateLimit(mockUserId, mockProjectId, 'track-1');
      expect(result).toBe(false);
    });
  });

  describe('Health Status', () => {
    it('should return health status', () => {
      const status = service.getHealthStatus();
      expect(status).toHaveProperty('presenceTracked');
      expect(status).toHaveProperty('rateLimitEntries');
      expect(status).toHaveProperty('timestamp');
    });
  });
});
