import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { Session } from './session.entity';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

/**
 * Integration tests for the complete authentication flow
 * including login, logout, and session revocation
 */
describe('Auth Integration - Login and Logout Flow', () => {
  let app: INestApplication;
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let sessionsRepository: Repository<Session>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUsersRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockSessionsRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: mockSessionsRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    sessionsRepository = module.get<Repository<Session>>(getRepositoryToken(Session));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Complete Authentication Flow', () => {
    it('should handle login -> use token -> logout -> reject token flow', async () => {
      // Setup
      const userId = 'user-123';
      const email = 'test@example.com';
      const password = 'password123';
      const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
      const refreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh';

      const mockUser = {
        id: userId,
        email,
        firstName: 'John',
        lastName: 'Doe',
        password_hash: 'hashed_password',
        emailVerified: true,
      };

      const mockSession = {
        id: 'session-123',
        userId,
        tokenHash: 'token_hash_123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revokedAt: null,
        isRevoked: jest.fn().mockReturnValue(false),
        isActive: jest.fn().mockReturnValue(true),
        revoke: jest.fn(),
      };

      // Mock login
      (usersRepository.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(accessToken)
        .mockReturnValueOnce(refreshToken);
      (sessionsRepository.create as jest.Mock).mockReturnValueOnce(mockSession);
      (sessionsRepository.save as jest.Mock).mockResolvedValueOnce(mockSession);

      // Step 1: User logs in
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true); // Password matches
      const loginResult = await authService.login({ email, password });

      expect(loginResult).toHaveProperty('tokens');
      expect(loginResult.tokens.accessToken).toBe(accessToken);
      expect(loginResult.tokens.refreshToken).toBe(refreshToken);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { email } });

      // Verify session was created
      expect(sessionsRepository.save).toHaveBeenCalled();

      // Step 2: Verify token is valid (session active)
      (sessionsRepository.findOne as jest.Mock).mockResolvedValueOnce(mockSession);
      const sessionValid = await authService.validateSession(userId, accessToken);
      expect(sessionValid).toBe(true);

      // Step 3: User logs out
      const revokedSession = { ...mockSession, revokedAt: new Date() };
      (sessionsRepository.findOne as jest.Mock).mockResolvedValueOnce(revokedSession);
      (sessionsRepository.save as jest.Mock).mockResolvedValueOnce(revokedSession);

      const logoutResult = await authService.logout(userId, accessToken);
      expect(logoutResult.message).toBe('Logged out successfully');
      expect(logoutResult.revokedSessions).toBeGreaterThanOrEqual(0);

      // Step 4: Verify token is now invalid (session revoked)
      const revokedSessionForValidation = {
        ...revokedSession,
        isRevoked: jest.fn().mockReturnValue(true),
        isActive: jest.fn().mockReturnValue(false),
      };
      (sessionsRepository.findOne as jest.Mock).mockResolvedValueOnce(revokedSessionForValidation);

      const sessionInvalid = await authService.validateSession(userId, accessToken);
      // Should be false because session is revoked
      expect(sessionInvalid).toBe(false);
    });

    it('should handle multiple users logging in and out simultaneously', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';
      const accessToken1 = 'token1';
      const accessToken2 = 'token2';

      // Setup mock sessions
      const session1 = {
        id: 'session-1',
        userId: user1Id,
        tokenHash: 'hash1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revokedAt: null,
        isRevoked: jest.fn().mockReturnValue(false),
        isActive: jest.fn().mockReturnValue(true),
        revoke: jest.fn(),
      };

      const session2 = {
        id: 'session-2',
        userId: user2Id,
        tokenHash: 'hash2',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        revokedAt: null,
        isRevoked: jest.fn().mockReturnValue(false),
        isActive: jest.fn().mockReturnValue(true),
        revoke: jest.fn(),
      };

      // Mock session lookups
      (sessionsRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(session1) // Validate user1
        .mockResolvedValueOnce(session2) // Validate user2
        .mockResolvedValueOnce(session1) // Logout user1
        .mockResolvedValueOnce(session2); // Logout user2

      (sessionsRepository.save as jest.Mock)
        .mockResolvedValueOnce(session1)
        .mockResolvedValueOnce(session2);

      // Both users validate sessions
      const valid1 = await authService.validateSession(user1Id, accessToken1);
      const valid2 = await authService.validateSession(user2Id, accessToken2);
      expect(valid1).toBe(true);
      expect(valid2).toBe(true);

      // Both users log out
      const logout1 = await authService.logout(user1Id, accessToken1);
      const logout2 = await authService.logout(user2Id, accessToken2);

      expect(logout1.message).toBe('Logged out successfully');
      expect(logout2.message).toBe('Logged out successfully');
    });

    it('should prevent token reuse after logout', async () => {
      const userId = 'user-123';
      const accessToken = 'token-xyz';

      // After logout, session is revoked
      const revokedSessionInstance = new Session();
      revokedSessionInstance.userId = userId;
      revokedSessionInstance.tokenHash = 'token_hash_123';
      revokedSessionInstance.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      revokedSessionInstance.revokedAt = new Date();

      // Simulate token validation after logout
      (sessionsRepository.findOne as jest.Mock).mockResolvedValueOnce(revokedSessionInstance);

      const isValid = await authService.validateSession(userId, accessToken);

      // Session is revoked, so validation should return false
      expect(isValid).toBe(false);
      expect(revokedSessionInstance.isRevoked()).toBe(true);
    });
  });

  describe('Session Lifecycle', () => {
    it('should track session creation and revocation timestamps', async () => {
      const userId = 'user-123';
      const accessToken = 'token-123';

      const session = new Session();
      session.id = 'session-123';
      session.userId = userId;
      session.tokenHash = 'hash-123';
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      session.revokedAt = null;
      session.createdAt = new Date();

      // Initially active
      expect(session.isRevoked()).toBe(false);
      expect(session.isActive()).toBe(true);

      // Revoke session
      session.revoke();
      expect(session.revokedAt).not.toBeNull();
      expect(session.isRevoked()).toBe(true);
      expect(session.isActive()).toBe(false);
    });

    it('should properly expire sessions after expiration time', async () => {
      const userId = 'user-123';
      const pastDate = new Date(Date.now() - 1000); // 1 second ago

      const expiredSession = new Session();
      expiredSession.userId = userId;
      expiredSession.tokenHash = 'hash-123';
      expiredSession.expiresAt = pastDate;
      expiredSession.revokedAt = null;

      // Session is expired even if not revoked
      expect(expiredSession.isExpired()).toBe(true);
      expect(expiredSession.isActive()).toBe(false);
    });

    it('should handle revocation of all user sessions', async () => {
      const userId = 'user-123';

      const sessions = [
        {
          id: 'session-1',
          userId,
          tokenHash: 'hash-1',
          revokedAt: null,
          isRevoked: jest.fn().mockReturnValue(false),
          revoke: jest.fn(),
        },
        {
          id: 'session-2',
          userId,
          tokenHash: 'hash-2',
          revokedAt: null,
          isRevoked: jest.fn().mockReturnValue(false),
          revoke: jest.fn(),
        },
        {
          id: 'session-3',
          userId,
          tokenHash: 'hash-3',
          revokedAt: null,
          isRevoked: jest.fn().mockReturnValue(false),
          revoke: jest.fn(),
        },
      ];

      // Mock finding all user sessions
      (sessionsRepository.find as jest.Mock).mockResolvedValueOnce(sessions);
      (sessionsRepository.save as jest.Mock)
        .mockResolvedValueOnce(sessions[0])
        .mockResolvedValueOnce(sessions[1])
        .mockResolvedValueOnce(sessions[2]);

      // Logout without specific token (revoke all)
      const result = await authService.logout(userId);

      expect(result.message).toBe('Logged out successfully');
      expect(result.revokedSessions).toBe(3);
      expect(sessionsRepository.find).toHaveBeenCalledWith({ where: { userId } });
    });
  });

  describe('Error Scenarios', () => {
    it('should gracefully handle logout when session not found', async () => {
      const userId = 'user-123';
      const accessToken = 'invalid-token';

      // Mock session not found
      (sessionsRepository.findOne as jest.Mock).mockResolvedValueOnce(null);

      const result = await authService.logout(userId, accessToken);

      expect(result.message).toBe('Logged out successfully');
      expect(result.revokedSessions).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      const userId = 'user-123';
      const accessToken = 'token-123';

      // Mock database error
      (sessionsRepository.findOne as jest.Mock).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const result = await authService.logout(userId, accessToken);

      // Should still return success message (graceful degradation)
      expect(result.message).toBe('Logged out successfully');
      expect(result.revokedSessions).toBe(0);
    });

    it('should handle missing user ID gracefully', async () => {
      const result = await authService.logout(undefined, 'some-token');

      expect(result.message).toBe('Logged out successfully');
      expect(result.revokedSessions).toBe(0);
    });
  });
});
