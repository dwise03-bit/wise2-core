import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Mock user storage (will be replaced with Prisma after launch)
const mockUsers: any[] = [];

@Injectable()
export class AuthService {

  constructor(private readonly jwtService: JwtService) {}

  async signup(email: string, password: string, name?: string) {
    if (mockUsers.find(u => u.email === email)) {
      throw new BadRequestException('Email already registered');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: name || email.split('@')[0],
      passwordHash,
      role: 'CUSTOMER',
    };

    mockUsers.push(user);
    return this.generateTokenResponse(user);
  }

  async login(email: string, password: string) {
    const user = mockUsers.find(u => u.email === email);
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
      subscription: {
        plan: 'STARTER',
        status: 'ACTIVE',
        trial_days_remaining: 30,
      },
      discord: {
        invite_url: 'https://discord.gg/wise2',
        message: 'Join our community for updates and support',
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return mockUsers.find(u => u.id === payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
