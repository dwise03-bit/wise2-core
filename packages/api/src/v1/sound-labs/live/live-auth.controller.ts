import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { LiveAuthService } from './live-auth.service';
import { LiveSessionService } from './live-session.service';

/**
 * Live Room Authentication Controller (Phase 2)
 * Signup, login, and user profile endpoints
 */

@Controller('v1/sound-labs/live/auth')
export class LiveAuthController {
  constructor(
    private authService: LiveAuthService,
    private sessionService: LiveSessionService
  ) {}

  /**
   * POST /auth/signup
   * Create a new user account for live streaming
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: { email: string; password: string; name?: string }) {
    return await this.authService.signup(dto.email, dto.password, dto.name);
  }

  /**
   * POST /auth/login
   * Authenticate user and return JWT token
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: { email: string; password: string }) {
    return await this.authService.login(dto.email, dto.password);
  }

  /**
   * GET /auth/me
   * Get current user profile (requires JWT)
   */
  @Get('me')
  async getProfile(@Headers('authorization') authHeader: string) {
    const session = await this.sessionService.validateToken(authHeader);
    const user = await this.authService.getUserProfile(session.userId);
    return { success: true, data: user };
  }

  /**
   * POST /auth/refresh
   * Refresh JWT token (if implementation supports it)
   */
  @Post('refresh')
  async refreshToken(@Body() dto: { refreshToken: string }) {
    return await this.authService.refreshToken(dto.refreshToken);
  }
}
