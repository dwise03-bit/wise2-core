import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Redirect,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GoogleOAuthService } from '../services/google-oauth.service';
import { JwtGuard } from '../guards/jwt.guard';

@Controller('api/brain/auth/google')
export class GoogleOAuthController {
  constructor(private readonly googleOAuthService: GoogleOAuthService) {}

  /**
   * Start Google OAuth consent flow
   * Requires authenticated user
   */
  @Get('authorize')
  @UseGuards(JwtGuard)
  authorize(@Request() req, @Query('scopes') scopes?: string) {
    const userId = req.user.sub;
    const scopeArray = scopes ? scopes.split(',') : [];

    const authUrl = this.googleOAuthService.getAuthorizationUrl(userId, scopeArray);

    return {
      message: 'Redirect to Google OAuth consent screen',
      authUrl,
    };
  }

  /**
   * Google OAuth callback
   * Called by Google after user grants permissions
   */
  @Get('callback')
  @HttpCode(HttpStatus.OK)
  async callback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    if (error) {
      throw new BadRequestException(`Google OAuth error: ${error}`);
    }

    if (!code || !state) {
      throw new BadRequestException('Missing code or state parameter');
    }

    try {
      const tokenData = await this.googleOAuthService.exchangeCodeForTokens(
        code,
        state,
      );

      await this.googleOAuthService.storeGoogleTokens(tokenData.userId, {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        scopes: tokenData.scopes,
      });

      return {
        success: true,
        message: 'Google OAuth connected successfully',
        userId: tokenData.userId,
        scopes: tokenData.scopes,
        expiresAt: tokenData.expiresAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to process OAuth callback: ${message}`);
    }
  }

  /**
   * Check if user has connected Google OAuth
   */
  @Get('status')
  @UseGuards(JwtGuard)
  async getOAuthStatus(@Request() req) {
    const userId = req.user.sub;

    const accessToken = await this.googleOAuthService.getDecryptedAccessToken(
      userId,
    );

    return {
      connected: !!accessToken,
      userId,
    };
  }

  /**
   * Manually refresh Google access token
   */
  @Get('refresh')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req) {
    const userId = req.user.sub;

    const success = await this.googleOAuthService.refreshGoogleAccessToken(userId);

    return {
      success,
      message: success
        ? 'Google access token refreshed'
        : 'Failed to refresh token',
    };
  }
}
