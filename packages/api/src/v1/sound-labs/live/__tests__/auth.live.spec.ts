import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LiveSessionService } from '../live-session.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

describe('Live Session Auth Tests', () => {
  let service: LiveSessionService;
  let prismaService: PrismaService;

  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveSessionService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<LiveSessionService>(LiveSessionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('Valid JWT', () => {
    it('should accept valid JWT token', async () => {
      const payload = {
        userId: 'user-123',
        email: 'alice@example.com',
        role: 'user',
        permissions: ['read', 'write'],
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'wise2-api',
      });

      const authHeader = `Bearer ${token}`;
      const context = await service.validateToken(authHeader);

      expect(context).toBeDefined();
      expect(context.userId).toBe('user-123');
      expect(context.email).toBe('alice@example.com');
      expect(context.role).toBe('user');
      expect(context.permissions).toContain('read');
    });
  });

  describe('Expired JWT', () => {
    it('should reject expired JWT', async () => {
      const payload = {
        userId: 'user-123',
        email: 'alice@example.com',
        role: 'user',
        permissions: ['read'],
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '-1h', // Expired 1 hour ago
        issuer: 'wise2-api',
      });

      const authHeader = `Bearer ${token}`;

      await expect(service.validateToken(authHeader)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('Invalid Signature', () => {
    it('should reject JWT with invalid signature', async () => {
      const payload = {
        userId: 'user-123',
        email: 'alice@example.com',
        role: 'user',
        permissions: ['read'],
      };

      // Sign with wrong secret
      const token = jwt.sign(payload, 'wrong-secret', {
        expiresIn: '1h',
        issuer: 'wise2-api',
      });

      const authHeader = `Bearer ${token}`;

      await expect(service.validateToken(authHeader)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('Missing Auth Header', () => {
    it('should reject missing Authorization header', async () => {
      await expect(service.validateToken(undefined)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should reject malformed Authorization header', async () => {
      const authHeader = 'NotBearer some-token';

      await expect(service.validateToken(authHeader)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('Demo/localStorage Identity Rejection', () => {
    it('should reject token with demo email', async () => {
      const payload = {
        userId: 'user-123',
        email: 'demo@example.com', // Demo email
        role: 'user',
        permissions: ['read'],
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'wise2-api',
      });

      const authHeader = `Bearer ${token}`;

      await expect(service.validateToken(authHeader)).rejects.toThrow(
        /demo.*identities/i
      );
    });

    it('should reject token with demo_ userId', async () => {
      const payload = {
        userId: 'demo_user_123',
        email: 'alice@example.com',
        role: 'user',
        permissions: ['read'],
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1h',
        issuer: 'wise2-api',
      });

      const authHeader = `Bearer ${token}`;

      await expect(service.validateToken(authHeader)).rejects.toThrow(
        /demo.*identities/i
      );
    });

    it('should reject token missing standard claims (iat, exp)', async () => {
      // Manually create a token without iat/exp claims
      const payload = {
        userId: 'user-123',
        email: 'alice@example.com',
        role: 'user',
        permissions: ['read'],
      };

      const token = jwt.sign(payload, JWT_SECRET, {
        noTimestamp: true, // Skip iat
      });

      const authHeader = `Bearer ${token}`;

      await expect(service.validateToken(authHeader)).rejects.toThrow(
        /demo.*identities/i
      );
    });
  });

  describe('Session Context from Request', () => {
    it('should extract session from request.user', async () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'alice@example.com',
          role: 'user',
          permissions: ['read'],
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      };

      const context = await service.validateSessionContext(req);

      expect(context.userId).toBe('user-123');
      expect(context.email).toBe('alice@example.com');
    });

    it('should reject request with no user', async () => {
      const req = {};

      await expect(service.validateSessionContext(req)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should reject request with expired token in user', async () => {
      const req = {
        user: {
          id: 'user-123',
          email: 'alice@example.com',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        },
      };

      await expect(service.validateSessionContext(req)).rejects.toThrow(
        /expired/i
      );
    });
  });
});
