import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { google } from 'googleapis';

@Injectable()
export class PrismaAuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        email: user.email,
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
      message: 'Account created. Verify your email.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private issueAuthTokens(user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  }) {
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  async loginWithGoogle(idToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new UnauthorizedException('Google sign-in is not configured');
    }

    const oauthClient = new google.auth.OAuth2(clientId);
    const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new UnauthorizedException('Invalid Google identity');
    }

    const generatedPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const user = await this.prisma.user.upsert({
      where: { email: payload.email },
      update: { name: payload.name || undefined },
      create: {
        email: payload.email,
        name: payload.name || payload.email,
        passwordHash: generatedPasswordHash,
        role: 'CUSTOMER',
      },
    });

    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: payload.sub,
        },
      },
      update: { userId: user.id, id_token: idToken },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: payload.sub,
        id_token: idToken,
      },
    });

    return this.issueAuthTokens(user);
  }

  async exchangeGoogleCode(code: string, redirectUri: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Google sign-in is not configured');
    }

    const oauthClient = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    let tokens;
    try {
      ({ tokens } = await oauthClient.getToken(code));
    } catch (error) {
      throw new UnauthorizedException('Google token exchange failed');
    }

    if (!tokens.id_token) {
      throw new UnauthorizedException('Google did not return an ID token');
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    const providerAccountId = payload?.sub;

    const auth = await this.loginWithGoogle(tokens.id_token);

    if (providerAccountId) {
      await this.prisma.account.updateMany({
        where: {
          provider: 'google',
          providerAccountId,
        },
        data: {
          access_token: tokens.access_token || undefined,
          refresh_token: tokens.refresh_token || undefined,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : undefined,
          id_token: tokens.id_token,
        },
      });
    }

    return auth;
  }

  async exchangeDiscordCode(code: string, redirectUri: string) {
    const clientId = process.env.DISCORD_OAUTH_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
    const clientSecret =
      process.env.DISCORD_OAUTH_CLIENT_SECRET || process.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('Discord sign-in is not configured');
    }

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Discord token exchange failed');
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    if (!accessToken) {
      throw new UnauthorizedException('Discord did not return an access token');
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new UnauthorizedException('Failed to fetch Discord profile');
    }

    const profile = (await userResponse.json()) as {
      id: string | number;
      email?: string;
      username?: string;
      global_name?: string;
    };
    const providerAccountId = String(profile.id);
    const email =
      typeof profile.email === 'string' && profile.email.length > 0
        ? profile.email
        : `discord-${providerAccountId}@users.wise2.net`;
    const displayName =
      profile.global_name ||
      profile.username ||
      `Discord User ${providerAccountId}`;

    const generatedPasswordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name: displayName },
      create: {
        email,
        name: displayName,
        passwordHash: generatedPasswordHash,
        role: 'CUSTOMER',
      },
    });

    await this.prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'discord',
          providerAccountId,
        },
      },
      update: {
        userId: user.id,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
        token_type: 'Bearer',
        scope: 'identify email guilds',
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'discord',
        providerAccountId,
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
        token_type: 'Bearer',
        scope: 'identify email guilds',
      },
    });

    return this.issueAuthTokens(user);
  }

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.verificationToken.delete({
      where: { token },
    });

    return { message: 'Email verified' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newAccessToken = this.jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        { expiresIn: '15m' },
      );

      return { accessToken: newAccessToken, expiresIn: 900 };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout() {
    return { message: 'Logged out' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    return { message: 'If email exists, a reset link has been sent' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.passwordResetToken.delete({
      where: { token },
    });

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  getGoogleAuthUrl() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri =
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'https://api.wise2.net'}/api/v1/auth/google/callback`;

    if (!clientId) {
      throw new UnauthorizedException('Google sign-in is not configured');
    }

    const oauthClient = new google.auth.OAuth2(clientId, undefined, redirectUri);
    const url = oauthClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
    });

    return { url };
  }

  async handleGoogleCallback(code: string, redirectUri?: string) {
    const callbackUri =
      redirectUri ||
      process.env.GOOGLE_CALLBACK_URL ||
      `${process.env.API_BASE_URL || 'https://api.wise2.net'}/api/v1/auth/google/callback`;

    return this.exchangeGoogleCode(code, callbackUri);
  }
}
