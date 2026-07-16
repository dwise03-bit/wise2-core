import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from './user.entity';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { EmailService } from '../email/email.service';

/**
 * AuthService handles user authentication, registration, and account management.
 * Works with TokenService and PasswordService for token and password operations.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Register a new user account
   * @param email User email address
   * @param password Plain text password
   * @param firstName Optional first name
   * @param lastName Optional last name
   * @returns User and email verification message
   * @throws ConflictException if email already exists
   * @throws BadRequestException if password is weak
   */
  async signup(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<any> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    // Validate password strength
    this.passwordService.validatePasswordStrength(password);

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(password);

    // Create new user
    const user = this.userRepository.create({
      email,
      password_hash: passwordHash,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      email_verified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Create email verification token
    const { token } = await this.passwordService.createEmailVerificationToken(
      savedUser.id,
    );

    // Send verification email
    await this.emailService.sendVerificationEmail(email, token, savedUser.firstName);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
      },
      message: 'Signup successful. Check your email to verify your account.',
    };
  }

  /**
   * Authenticate user and generate tokens
   * @param email User email address
   * @param password Plain text password
   * @param ipAddress Optional client IP address
   * @param userAgent Optional client user agent
   * @returns Access token, refresh token, and user info
   * @throws UnauthorizedException if email not found or password invalid
   * @throws BadRequestException if email not verified
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    // Find user by email
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate password
    const isPasswordValid = await this.passwordService.validatePassword(
      password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new BadRequestException(
        'Email not verified. Check your email for verification link.',
      );
    }

    // Update last login time
    await this.userRepository.update(user.id, {
      last_login_at: new Date(),
    });

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    const refreshToken = await this.tokenService.generateRefreshToken(
      user.id,
      user.email,
      user.role,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Verify user email using verification token
   * @param token Email verification token
   * @returns Verification success message
   * @throws BadRequestException if token invalid or expired
   * @throws NotFoundException if user not found
   */
  async verifyEmail(token: string): Promise<any> {
    // This is a simplified version - in production you'd hash the token
    // For now, we'll validate it directly through the PasswordService
    const parts = token.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid verification token format');
    }

    const [userId, tokenHash] = parts;

    // Find user
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify email using PasswordService
    await this.passwordService.verifyEmail(userId, tokenHash);

    return {
      message: 'Email verified successfully',
    };
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token from login
   * @returns New access token
   * @throws UnauthorizedException if refresh token invalid or expired
   */
  async refreshAccessToken(refreshToken: string): Promise<any> {
    // Verify refresh token
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);

    // Find user
    const user = await this.userRepository.findOneBy({ id: payload.sub });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate new access token
    const accessToken = this.tokenService.generateAccessToken(
      user.id,
      user.email,
      user.role,
    );

    return {
      accessToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Logout user by revoking all sessions
   * @param userId User ID to logout
   * @returns Logout success message
   */
  async logout(userId: string): Promise<any> {
    await this.tokenService.revokeAllTokens(userId);

    return {
      message: 'Logged out successfully',
    };
  }

  /**
   * Request password reset email
   * @param email User email address
   * @returns Success message (doesn't reveal if email exists)
   */
  async requestPasswordReset(email: string): Promise<any> {
    // Find user by email
    const user = await this.userRepository.findOneBy({ email });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return {
        message: 'If the email is registered, password reset instructions have been sent',
      };
    }

    // Create password reset token
    const { token } = await this.passwordService.createPasswordResetToken(
      user.id,
    );

    // Send reset email
    await this.emailService.sendPasswordReset(email, token, user.firstName);

    return {
      message: 'If the email is registered, password reset instructions have been sent',
    };
  }

  /**
   * Confirm password reset with token
   * @param token Password reset token
   * @param newPassword New password
   * @returns Reset success message
   * @throws BadRequestException if token invalid or password weak
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<any> {
    // Parse token to get userId and tokenHash
    const parts = token.split(':');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid password reset token');
    }

    const [userId, tokenHash] = parts;

    // Validate password strength
    this.passwordService.validatePasswordStrength(newPassword);

    // Reset password using PasswordService
    await this.passwordService.resetPassword(userId, tokenHash, newPassword);

    // Revoke all sessions (force re-login)
    await this.tokenService.revokeAllTokens(userId);

    return {
      message: 'Password reset successfully. Please login with your new password.',
    };
  }

  /**
   * Change password for authenticated user
   * @param userId User ID
   * @param oldPassword Current password
   * @param newPassword New password
   * @returns Password change success message
   * @throws UnauthorizedException if old password invalid
   * @throws BadRequestException if new password weak
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    // Validate password strength
    this.passwordService.validatePasswordStrength(newPassword);

    // Change password using PasswordService
    await this.passwordService.changePassword(userId, oldPassword, newPassword);

    // Revoke all sessions except current one (force re-login on other devices)
    // For now, revoke all and let user re-login
    await this.tokenService.revokeAllTokens(userId);

    return {
      message:
        'Password changed successfully. Please login with your new password.',
    };
  }
}
