// DEPRECATED: Use PrismaAuthService instead
// This file is kept for backward compatibility only and should not be used directly
import { Injectable } from '@nestjs/common';
import { PrismaAuthService } from './prisma-auth.service';

@Injectable()
export class AuthService {
  constructor(private prismaAuthService: PrismaAuthService) {}

  async signup(email: string, password: string, firstName?: string, lastName?: string) {
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
    return this.prismaAuthService.signup(email, password, fullName);
  }

  async login(email: string, password: string) {
    return this.prismaAuthService.login(email, password);
  }

  async getCurrentUser(userId: string) {
    return this.prismaAuthService.getCurrentUser(userId);
  }

  async refreshAccessToken(token: string) {
    return this.prismaAuthService.refreshToken(token);
  }

  async logout() {
    return this.prismaAuthService.logout();
  }

  async verifyEmail(token: string) {
    return this.prismaAuthService.verifyEmail(token);
  }

  async requestPasswordReset(email: string) {
    return this.prismaAuthService.requestPasswordReset(email);
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    return this.prismaAuthService.confirmPasswordReset(token, newPassword);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.prismaAuthService.changePassword(userId, currentPassword, newPassword);
  }

  getGoogleAuthUrl() {
    return this.prismaAuthService.getGoogleAuthUrl();
  }

  async handleGoogleCallback(code: string, redirectUri?: string) {
    return this.prismaAuthService.handleGoogleCallback(code, redirectUri);
  }

  async loginWithGoogle(idToken: string) {
    return this.prismaAuthService.loginWithGoogle(idToken);
  }

  async exchangeGoogleCode(code: string, redirectUri: string) {
    return this.prismaAuthService.exchangeGoogleCode(code, redirectUri);
  }

  async exchangeDiscordCode(code: string, redirectUri: string) {
    return this.prismaAuthService.exchangeDiscordCode(code, redirectUri);
  }
}
