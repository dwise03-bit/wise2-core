import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { BrainAuthService } from './brain-auth.service';
import { User } from './schemas/user.schema';
import { Workspace } from './schemas/workspace.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Types } from 'mongoose';

jest.mock('bcrypt');

describe('BrainAuthService', () => {
  let service: BrainAuthService;
  let mockUserModel: any;
  let mockWorkspaceModel: any;
  let mockRefreshTokenModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    mockWorkspaceModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };

    mockRefreshTokenModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(() => 'mock-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrainAuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Workspace.name),
          useValue: mockWorkspaceModel,
        },
        {
          provide: getModelToken(RefreshToken.name),
          useValue: mockRefreshTokenModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<BrainAuthService>(BrainAuthService);
  });

  describe('register', () => {
    it('should register a new user and create workspace', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        workspaceName: 'Test Workspace',
      };

      const workspaceId = new Types.ObjectId();
      const userId = new Types.ObjectId();

      const mockWorkspace = {
        _id: workspaceId,
        name: 'Test Workspace',
        slug: 'test-workspace',
        owner: null,
        save: jest.fn(),
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        firstName: 'John',
        lastName: 'Doe',
        workspaceId: workspaceId,
        role: 'admin',
        customPermissions: [],
        status: 'active',
        toObject: jest.fn(() => ({
          _id: userId,
          email: 'test@example.com',
        })),
      };

      mockUserModel.findOne.mockResolvedValue(null);
      mockWorkspaceModel.findOne.mockResolvedValue(null);
      mockWorkspaceModel.create.mockResolvedValue(mockWorkspace);
      mockUserModel.create.mockResolvedValue(mockUser);
      mockUserModel.findById.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('workspace');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserModel.create).toHaveBeenCalled();
      expect(mockWorkspaceModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        workspaceName: 'Test Workspace',
      };

      mockUserModel.findOne.mockResolvedValue({ email: 'existing@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for weak password', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        workspaceName: 'Test Workspace',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const userId = new Types.ObjectId();
      const workspaceId = new Types.ObjectId();

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'active',
        role: 'team_member',
        customPermissions: [],
        workspaceId,
        save: jest.fn(),
        toObject: jest.fn(() => ({
          _id: userId,
          email: 'test@example.com',
          status: 'active',
        })),
      };

      const mockWorkspace = {
        _id: workspaceId,
        name: 'Test Workspace',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      mockUserModel.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockWorkspaceModel.findById.mockResolvedValue(mockWorkspace);
      mockJwtService.sign.mockReturnValue('mock-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserModel.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        status: 'inactive',
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const userId = new Types.ObjectId();

      const mockStoredToken = {
        _id: new Types.ObjectId(),
        userId,
        token: refreshToken,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        save: jest.fn(),
      };

      const mockUser = {
        _id: userId,
        email: 'test@example.com',
        status: 'active',
        role: 'team_member',
        customPermissions: [],
        workspaceId: new Types.ObjectId(),
      };

      mockRefreshTokenModel.findOne.mockResolvedValue(mockStoredToken);
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('new-mock-token');

      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockStoredToken.status).toBe('revoked');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockRefreshTokenModel.findOne.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserPermissions', () => {
    it('should return admin permissions for admin role', async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        role: 'admin',
        customPermissions: [],
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const permissions = await service.getUserPermissions(userId);

      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain('manage_users');
      expect(permissions).toContain('manage_workspace');
    });

    it('should return manager permissions for manager role', async () => {
      const userId = new Types.ObjectId().toString();
      const mockUser = {
        _id: userId,
        role: 'manager',
        customPermissions: [],
      };

      mockUserModel.findById.mockResolvedValue(mockUser);

      const permissions = await service.getUserPermissions(userId);

      expect(permissions).toContain('create_workflows');
      expect(permissions).not.toContain('manage_users');
    });
  });
});
