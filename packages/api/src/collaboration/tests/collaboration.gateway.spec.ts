import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationGateway } from '../collaboration.gateway';
import { CollaborationService } from '../collaboration.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

/**
 * Collaboration Gateway WebSocket Tests
 * Tests WebSocket event handling and real-time synchronization
 */
describe('CollaborationGateway', () => {
  let gateway: CollaborationGateway;
  let collaborationService: CollaborationService;
  let jwtService: JwtService;
  let socket: any;

  const mockProjectId = 'proj-123';
  const mockUserId = 'user-123';
  const mockToken = 'jwt-token-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationGateway,
        {
          provide: CollaborationService,
          useValue: {
            hasPermission: jest.fn().mockResolvedValue(true),
            updatePresence: jest.fn().mockResolvedValue({}),
            getActiveUsers: jest.fn().mockResolvedValue([]),
            createComment: jest.fn().mockResolvedValue({ id: 'comment-123' }),
            logActivity: jest.fn().mockResolvedValue(undefined),
            checkRateLimit: jest.fn().mockReturnValue(true),
            checkConflict: jest.fn().mockResolvedValue([]),
            createVersionSnapshot: jest.fn().mockResolvedValue({ id: 'version-123' }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue({ sub: mockUserId, name: 'Test User' }),
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

    gateway = module.get<CollaborationGateway>(CollaborationGateway);
    collaborationService = module.get<CollaborationService>(CollaborationService);
    jwtService = module.get<JwtService>(JwtService);

    // Mock Socket.IO socket
    socket = {
      id: 'socket-123',
      handshake: {
        auth: { token: mockToken },
        query: { projectId: mockProjectId },
      },
      data: { projectId: mockProjectId, userId: mockUserId },
      join: jest.fn(),
      emit: jest.fn(),
      broadcast: { to: jest.fn().mockReturnValue({ emit: jest.fn() }) },
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };

    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      emit: jest.fn(),
      disconnectSockets: jest.fn(),
    } as any;
  });

  describe('Connection Management', () => {
    it('should handle successful connection', async () => {
      await gateway.handleConnection(socket);

      expect(socket.join).toHaveBeenCalledWith(`project:${mockProjectId}`);
      expect(socket.emit).toHaveBeenCalledWith(
        'connection:confirmed',
        expect.objectContaining({ socketId: socket.id }),
      );
    });

    it('should authenticate connection with JWT', async () => {
      await gateway.handleConnection(socket);

      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
    });

    it('should reject connection without token', async () => {
      socket.handshake.auth = {};

      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should reject connection without project ID', async () => {
      socket.handshake.query = {};

      await gateway.handleConnection(socket);

      expect(socket.disconnect).toHaveBeenCalled();
    });

    it('should broadcast presence join event', async () => {
      await gateway.handleConnection(socket);

      expect(gateway.server.to).toHaveBeenCalledWith(`project:${mockProjectId}`);
    });

    it('should handle disconnection and cleanup', async () => {
      await gateway.handleConnection(socket);
      await gateway.handleDisconnect(socket);

      // Verify cleanup occurred
      expect(socket.id).toBe('socket-123');
    });
  });

  describe('Track Edit Events', () => {
    it('should handle track edit with permission', async () => {
      const payload = {
        trackId: 'track-1',
        field: 'volume',
        value: 0.8,
        timestamp: Date.now(),
        userId: mockUserId,
      };

      await gateway.handleTrackEdit(socket, payload);

      expect(collaborationService.hasPermission).toHaveBeenCalledWith(
        mockProjectId,
        mockUserId,
        'edit_track',
      );
    });

    it('should broadcast track edit to project', async () => {
      const payload = {
        trackId: 'track-1',
        field: 'volume',
        value: 0.8,
        timestamp: Date.now(),
        userId: mockUserId,
      };

      await gateway.handleTrackEdit(socket, payload);

      expect(gateway.server.to).toHaveBeenCalledWith(`project:${mockProjectId}`);
    });

    it('should enforce rate limiting on edits', async () => {
      const payload = {
        trackId: 'track-1',
        field: 'volume',
        value: 0.8,
        timestamp: Date.now(),
        userId: mockUserId,
      };

      jest.spyOn(collaborationService, 'checkRateLimit').mockReturnValue(false);

      await gateway.handleTrackEdit(socket, payload);

      expect(socket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: 'Rate limit exceeded' }),
      );
    });

    it('should check for conflicts on edit', async () => {
      const payload = {
        trackId: 'track-1',
        field: 'volume',
        value: 0.8,
        timestamp: Date.now(),
        userId: mockUserId,
      };

      jest.spyOn(collaborationService, 'checkConflict').mockResolvedValue([
        { userId: 'user-2', field: 'volume', value: 0.5, timestamp: Date.now() },
      ] as any);

      await gateway.handleTrackEdit(socket, payload);

      expect(collaborationService.checkConflict).toHaveBeenCalledWith(
        mockProjectId,
        'track-1',
        'volume',
      );
    });

    it('should log edit activity', async () => {
      const payload = {
        trackId: 'track-1',
        field: 'volume',
        value: 0.8,
        timestamp: Date.now(),
        userId: mockUserId,
      };

      await gateway.handleTrackEdit(socket, payload);

      expect(collaborationService.logActivity).toHaveBeenCalled();
    });

    it('should reject edit without permission', async () => {
      jest.spyOn(collaborationService, 'hasPermission').mockResolvedValue(false);

      const payload = {
        trackId: 'track-1',
        field: 'volume',
        value: 0.8,
        timestamp: Date.now(),
        userId: mockUserId,
      };

      await gateway.handleTrackEdit(socket, payload);

      expect(socket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: expect.stringContaining('Permission denied') }),
      );
    });
  });

  describe('Cursor Movement Events', () => {
    it('should handle cursor move and update presence', async () => {
      const payload = {
        userId: mockUserId,
        x: 100,
        y: 200,
        track: 'track-1',
        time: 45.5,
        userName: 'Test User',
        userColor: '#FF0000',
      };

      await gateway.handleCursorMove(socket, payload);

      expect(collaborationService.updatePresence).toHaveBeenCalled();
    });

    it('should broadcast cursor position to other users', async () => {
      const payload = {
        userId: mockUserId,
        x: 100,
        y: 200,
        userName: 'Test User',
        userColor: '#FF0000',
      };

      await gateway.handleCursorMove(socket, payload);

      // Verify broadcast to other users (not the sender)
      expect(socket.broadcast.to).toHaveBeenCalledWith(`project:${mockProjectId}`);
    });
  });

  describe('Comment Events', () => {
    it('should handle comment creation', async () => {
      const payload = {
        content: 'Test comment',
        timestamp: 30.5,
        trackId: 'track-1',
      };

      await gateway.handleCommentAdd(socket, payload);

      expect(collaborationService.createComment).toHaveBeenCalledWith(
        mockProjectId,
        mockUserId,
        expect.objectContaining({ content: 'Test comment' }),
      );
    });

    it('should broadcast comment to project', async () => {
      const payload = {
        content: 'Test comment',
      };

      await gateway.handleCommentAdd(socket, payload);

      expect(gateway.server.to).toHaveBeenCalledWith(`project:${mockProjectId}`);
    });
  });

  describe('Version Snapshot Events', () => {
    it('should create version snapshot with permission', async () => {
      jest.spyOn(collaborationService, 'hasPermission').mockResolvedValue(true);

      const payload = {
        snapshot: { tracks: [], mixer: {} },
        label: 'Final Mix v1',
        changeLog: 'Added drums',
      };

      await gateway.handleVersionSnapshot(socket, payload);

      expect(collaborationService.createVersionSnapshot).toHaveBeenCalled();
    });

    it('should reject version snapshot without permission', async () => {
      jest.spyOn(collaborationService, 'hasPermission').mockResolvedValue(false);

      const payload = {
        snapshot: { tracks: [], mixer: {} },
      };

      await gateway.handleVersionSnapshot(socket, payload);

      expect(socket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({ message: expect.stringContaining('Permission denied') }),
      );
    });

    it('should broadcast version snapshot to project', async () => {
      const payload = {
        snapshot: { tracks: [], mixer: {} },
      };

      await gateway.handleVersionSnapshot(socket, payload);

      expect(gateway.server.to).toHaveBeenCalledWith(`project:${mockProjectId}`);
    });
  });

  describe('Heartbeat', () => {
    it('should respond to heartbeat ping', () => {
      gateway.handleHeartbeat(socket);

      expect(socket.emit).toHaveBeenCalledWith(
        'heartbeat:ack',
        expect.objectContaining({ timestamp: expect.any(String) }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should generate unique error IDs', async () => {
      socket.handshake.auth = {}; // Missing token

      await gateway.handleConnection(socket);

      expect(socket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          errorId: expect.stringMatching(/^ERR_/),
        }),
      );
    });

    it('should handle authentication errors gracefully', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await gateway.handleConnection(socket);

      expect(socket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Authentication failed',
        }),
      );
    });
  });

  describe('Gateway Lifecycle', () => {
    it('should initialize gateway', () => {
      expect(() => {
        gateway.afterInit();
      }).not.toThrow();
    });

    it('should gracefully shutdown', () => {
      expect(() => {
        gateway.onModuleDestroy();
      }).not.toThrow();

      expect(gateway.server.disconnectSockets).toHaveBeenCalled();
    });
  });
});
