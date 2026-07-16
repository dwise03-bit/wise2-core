import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './user.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { EmailVerificationToken } from './email-verification-token.entity';

/**
 * PasswordService handles password hashing, validation, and reset functionality.
 * Implements bcrypt for secure password storage and cryptographic token generation.
 */
@Injectable()
export class PasswordService {
  private readonly bcryptRounds = 12;
  private readonly tokenExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>,
  ) {}

  /**
   * Hashes a password using bcrypt.
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  /**
   * Validates a plain text password against a bcrypt hash.
   * @param plainPassword Plain text password to validate
   * @param hash Stored bcrypt hash
   * @returns true if password matches, false otherwise
   */
  async validatePassword(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }

  /**
   * Validates password strength requirements:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one digit
   * - At least one special character
   * @param password Password to validate
   * @throws BadRequestException if password doesn't meet requirements
   */
  validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }

    if (!hasDigit) {
      throw new BadRequestException('Password must contain at least one digit');
    }

    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  /**
   * Generates a cryptographically secure random token for password reset.
   * @returns Random token string (base64 encoded)
   */
  generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generates a cryptographically secure random token for email verification.
   * @returns Random token string (base64 encoded)
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a password reset token for a user and stores it in the database.
   * @param userId User ID
   * @returns The reset token and its hash for the email link
   */
  async createPasswordResetToken(userId: string): Promise<{ token: string; hash: string }> {
    const token = this.generateResetToken();
    const hash = this.hashToken(token);

    const expiresAt = new Date(Date.now() + this.tokenExpiry);

    const resetToken = this.passwordResetTokenRepository.create({
      userId,
      token_hash: hash,
      expires_at: expiresAt,
    });

    await this.passwordResetTokenRepository.save(resetToken);

    return { token, hash };
  }

  /**
   * Validates a password reset token.
   * @param userId User ID
   * @param tokenHash Token hash to validate
   * @returns true if token is valid and not expired, false otherwise
   */
  async validateResetToken(userId: string, tokenHash: string): Promise<boolean> {
    const token = await this.passwordResetTokenRepository.findOne({
      where: {
        userId,
        token_hash: tokenHash,
      },
    });

    if (!token) {
      return false;
    }

    // Check if token has expired
    if (token.expires_at < new Date()) {
      return false;
    }

    // Check if token has already been used
    if (token.used_at) {
      return false;
    }

    return true;
  }

  /**
   * Resets a user's password using a valid reset token.
   * @param userId User ID
   * @param tokenHash Reset token hash
   * @param newPassword New password
   * @throws BadRequestException if token is invalid or password doesn't meet requirements
   */
  async resetPassword(userId: string, tokenHash: string, newPassword: string): Promise<void> {
    // Validate new password strength
    this.validatePasswordStrength(newPassword);

    // Validate reset token
    const isValid = await this.validateResetToken(userId, tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // Update user password
    const hashedPassword = await this.hashPassword(newPassword);
    const now = new Date();

    await this.userRepository.update(userId, {
      password_hash: hashedPassword,
      password_changed_at: now,
    });

    // Mark token as used
    await this.passwordResetTokenRepository.update(
      { userId, token_hash: tokenHash },
      { used_at: now },
    );
  }

  /**
   * Changes a user's password by validating the old password first.
   * @param userId User ID
   * @param oldPassword Old password for validation
   * @param newPassword New password
   * @throws BadRequestException if old password is incorrect or new password doesn't meet requirements
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Validate new password strength
    this.validatePasswordStrength(newPassword);

    // Fetch user and validate old password
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordValid = await this.validatePassword(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    // Ensure new password is different from old password
    const isNewPasswordSameAsOld = await this.validatePassword(newPassword, user.password_hash);
    if (isNewPasswordSameAsOld) {
      throw new BadRequestException('New password must be different from old password');
    }

    // Update password
    const hashedPassword = await this.hashPassword(newPassword);
    await this.userRepository.update(userId, {
      password_hash: hashedPassword,
      password_changed_at: new Date(),
    });
  }

  /**
   * Creates an email verification token for a user.
   * @param userId User ID
   * @returns The verification token and its hash
   */
  async createEmailVerificationToken(userId: string): Promise<{ token: string; hash: string }> {
    const token = this.generateVerificationToken();
    const hash = this.hashToken(token);

    const expiresAt = new Date(Date.now() + this.tokenExpiry);

    const verificationToken = this.emailVerificationTokenRepository.create({
      userId,
      token_hash: hash,
      expires_at: expiresAt,
    });

    await this.emailVerificationTokenRepository.save(verificationToken);

    return { token, hash };
  }

  /**
   * Validates an email verification token.
   * @param userId User ID
   * @param tokenHash Token hash to validate
   * @returns true if token is valid and not expired, false otherwise
   */
  async validateEmailVerificationToken(userId: string, tokenHash: string): Promise<boolean> {
    const token = await this.emailVerificationTokenRepository.findOne({
      where: {
        userId,
        token_hash: tokenHash,
      },
    });

    if (!token) {
      return false;
    }

    // Check if token has expired
    if (token.expires_at < new Date()) {
      return false;
    }

    // Check if token has already been used
    if (token.verified_at) {
      return false;
    }

    return true;
  }

  /**
   * Verifies a user's email using a valid verification token.
   * @param userId User ID
   * @param tokenHash Verification token hash
   * @throws BadRequestException if token is invalid
   */
  async verifyEmail(userId: string, tokenHash: string): Promise<void> {
    // Validate verification token
    const isValid = await this.validateEmailVerificationToken(userId, tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired email verification token');
    }

    // Update user email_verified status
    const now = new Date();
    await this.userRepository.update(userId, {
      email_verified: true,
    });

    // Mark token as verified
    await this.emailVerificationTokenRepository.update(
      { userId, token_hash: tokenHash },
      { verified_at: now },
    );
  }

  /**
   * Hashes a token for secure storage in the database.
   * @param token Token to hash
   * @returns SHA256 hash of the token
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
