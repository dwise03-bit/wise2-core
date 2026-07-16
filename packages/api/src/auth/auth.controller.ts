import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/index';
import { LoginDto } from './dto/index';
import { VerifyEmailDto } from './dto/index';
import { RefreshTokenDto } from './dto/index';
import { PasswordResetRequestDto } from './dto/index';
import { PasswordResetConfirmDto } from './dto/index';
import { ChangePasswordDto } from './dto/index';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Registration Endpoint
   * Creates a new user account and sends email verification link
   * Rate limited: 5 requests per 15 minutes
   */
  @Post('signup')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or password too weak',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already registered',
  })
  async signup(@Body() dto: SignupDto): Promise<any> {
    return await this.authService.signup(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
    );
  }

  /**
   * User Login Endpoint
   * Authenticates user and returns access and refresh tokens
   * Rate limited: 10 requests per 15 minutes
   */
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate user and get tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            role: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
        },
        expiresIn: { type: 'number', description: 'Token expiry in seconds' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: 400,
    description: 'Email not verified',
  })
  async login(
    @Body() dto: LoginDto,
    @Request() req: any,
  ): Promise<any> {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    return await this.authService.login(
      dto.email,
      dto.password,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Email Verification Endpoint
   * Validates email verification token and marks email as verified
   */
  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<any> {
    return await this.authService.verifyEmail(dto.token);
  }

  /**
   * Token Refresh Endpoint
   * Generates new access token using valid refresh token
   */
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access token generated',
    schema: {
      properties: {
        accessToken: { type: 'string' },
        expiresIn: { type: 'number', description: 'Token expiry in seconds' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<any> {
    return await this.authService.refreshAccessToken(dto.refreshToken);
  }

  /**
   * Logout Endpoint
   * Revokes all sessions for the authenticated user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke all sessions' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing authentication token',
  })
  async logout(@Request() req: any): Promise<any> {
    return await this.authService.logout(req.user.id);
  }

  /**
   * Password Reset Request Endpoint
   * Sends password reset email to user
   * Rate limited: 3 requests per 15 minutes
   * Returns same response regardless of email existence (security)
   */
  @Post('password-reset')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email registered)',
  })
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
  ): Promise<any> {
    return await this.authService.requestPasswordReset(dto.email);
  }

  /**
   * Password Reset Confirmation Endpoint
   * Validates reset token and updates password
   * Rate limited: 5 requests per 15 minutes
   */
  @Post('password-reset/confirm')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm password reset with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token or password too weak',
  })
  async confirmPasswordReset(
    @Body() dto: PasswordResetConfirmDto,
  ): Promise<any> {
    return await this.authService.confirmPasswordReset(
      dto.token,
      dto.newPassword,
    );
  }

  /**
   * Change Password Endpoint
   * Changes password for authenticated user
   * Requires current password for validation
   * Rate limited: 5 requests per 15 minutes
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid authentication token or old password',
  })
  @ApiResponse({
    status: 400,
    description: 'New password is weak or same as old password',
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Request() req: any,
  ): Promise<any> {
    return await this.authService.changePassword(
      req.user.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }
}
