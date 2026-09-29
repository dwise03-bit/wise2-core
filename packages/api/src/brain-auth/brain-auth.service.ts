import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class BrainAuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, workspaceName } = registerDto;

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Create workspace
    const workspaceSlug = workspaceName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const existingWorkspace = await this.workspaceModel.findOne({ slug: workspaceSlug });
    if (existingWorkspace) {
      throw new ConflictException('Workspace name already taken');
    }

    const workspace = await this.workspaceModel.create({
      name: workspaceName,
      slug: workspaceSlug,
      owner: new Types.ObjectId(),
      industry: 'default',
      settings: {
        aiProvider: 'claude',
        emailCategorization: true,
        automationEnabled: true,
      },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user as admin of the new workspace
    const user = await this.userModel.create({
      email,
      passwordHash,
      firstName,
      lastName,
      workspaceId: workspace._id,
      role: 'admin',
      customPermissions: [],
      lastLogin: new Date(),
    });

    // Update workspace owner
    workspace.owner = user._id;
    await workspace.save();

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      workspace: this.sanitizeWorkspace(workspace),
      accessToken,
      refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const workspace = await this.workspaceModel.findById(user.workspaceId);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      workspace: this.sanitizeWorkspace(workspace),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    // Verify refresh token exists and is valid
    const storedToken = await this.refreshTokenModel.findOne({
      token: refreshToken,
      status: 'active',
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findById(storedToken.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Revoke old token
    storedToken.status = 'revoked';
    storedToken.revokedAt = new Date();
    await storedToken.save();

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    const storedToken = await this.refreshTokenModel.findOne({ token: refreshToken });
    if (storedToken) {
      storedToken.status = 'revoked';
      storedToken.revokedAt = new Date();
      await storedToken.save();
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  async getUserById(userId: string) {
    return this.userModel.findById(userId);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const rolePermissions = this.getRolePermissions(user.role);
    return [...rolePermissions, ...user.customPermissions];
  }

  private async generateTokens(user: UserDocument) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId.toString(),
      permissions: await this.getUserPermissions(user._id.toString()),
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      algorithm: 'HS256',
    });

    // Generate refresh token
    const refreshTokenValue = this.jwtService.sign(payload, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenModel.create({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt,
      status: 'active',
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private getRolePermissions(role: string): string[] {
    const permissionMap = {
      admin: [
        'read_documents',
        'write_documents',
        'delete_documents',
        'share_documents',
        'create_workflows',
        'execute_workflows',
        'manage_workflows',
        'delete_workflows',
        'create_decisions',
        'approve_decisions',
        'archive_decisions',
        'read_customers',
        'write_customers',
        'manage_customers',
        'manage_users',
        'manage_workspace',
        'view_audit_logs',
      ],
      manager: [
        'read_documents',
        'write_documents',
        'create_workflows',
        'execute_workflows',
        'approve_decisions',
        'read_customers',
        'write_customers',
      ],
      team_member: [
        'read_documents',
        'write_documents',
        'execute_workflows',
        'read_customers',
      ],
      viewer: ['read_documents', 'read_customers'],
    };

    return permissionMap[role] || [];
  }

  private sanitizeUser(user: any) {
    const { passwordHash, googleOAuth, ...sanitized } = user.toObject?.() || user;
    return sanitized;
  }

  private sanitizeWorkspace(workspace: any) {
    return workspace?.toObject?.() || workspace;
  }
}
