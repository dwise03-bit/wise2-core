import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@wise2/db';

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(private readonly jwtService: JwtService) {}

  async signup(email: string, password: string, name?: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Validate password
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    // Create subscription (30-day free trial)
    await this.prisma.subscription.create({
      data: {
        userId: user.id,
        status: 'ACTIVE',
        plan: 'STARTER',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return this.generateTokenResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateTokenResponse(user);
  }

  private generateTokenResponse(user: any) {
    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '24h' },
    );

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(email: string, password: string) {
    // Mock user lookup
    // const user = await this.usersService.findByEmail(email)
    const user = { id: 'uuid', email, password_hash: 'hashed' };

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  generateTokens(user: any) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: 86400, // 24 hours in seconds
      secret: process.env.JWT_SECRET || 'dev-secret',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: 604800, // 7 days in seconds
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    });

    return { accessToken, refreshToken };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async requestPasswordReset(email: string) {
    // Find user by email
    // const user = await this.usersService.findByEmail(email)
    // if (!user) throw new NotFoundException('User not found')

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { email, type: 'password-reset' },
      { expiresIn: '3600s', secret: process.env.JWT_SECRET || 'dev-secret' }
    );

    // Send email with reset link (mock)
    // await this.emailService.sendPasswordResetEmail(email, resetToken)

    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });

      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset token');
      }

      // Hash and update password in database
      // const passwordHash = await bcrypt.hash(newPassword, 12)
      // await this.usersService.updatePassword(payload.email, passwordHash)

      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
