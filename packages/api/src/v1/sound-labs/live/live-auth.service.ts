import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

/**
 * Live Room Authentication Service (Phase 2)
 * Handles user signup, login, profile, and JWT generation
 */

export interface AuthResponse {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    name: string | null;
    accessToken: string;
    expiresIn: number;
  };
  error?: string;
}

@Injectable()
export class LiveAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'live-secret-key';
  private readonly JWT_EXPIRES_IN = '7d';

  constructor(private prisma: PrismaService) {}

  /**
   * Sign up a new user account
   */
  async signup(email: string, password: string, name?: string): Promise<AuthResponse> {
    // Validate input
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use. Try logging in instead.');
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0], // Default to email prefix
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    // Generate JWT
    const accessToken = this.generateJWT(user.id, user.email, user.name);

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        accessToken,
        expiresIn: 604800, // 7 days in seconds
      },
    };
  }

  /**
   * Log in with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Validate input
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT
    const accessToken = this.generateJWT(user.id, user.email, user.name);

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        accessToken,
        expiresIn: 604800, // 7 days in seconds
      },
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Refresh JWT token (optional - can implement if needed)
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // TODO: Implement refresh token logic if needed
    // For now, users can just log in again
    throw new BadRequestException('Refresh token not yet implemented. Please log in again.');
  }

  /**
   * Generate JWT token
   */
  private generateJWT(userId: string, email: string, name: string | null): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 604800; // 7 days

    const token = sign(
      {
        sub: userId,
        id: userId,
        email,
        name: name || email,
        iat: now,
        exp,
      },
      this.JWT_SECRET,
      { algorithm: 'HS256' }
    );

    return token;
  }

  /**
   * Verify JWT token (shared with LiveSessionService)
   */
  verifyJWT(token: string): any {
    try {
      return require('jsonwebtoken').verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
