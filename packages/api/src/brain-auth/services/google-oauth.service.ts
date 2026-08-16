import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { google } from 'googleapis';
import * as crypto from 'crypto';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class GoogleOAuthService {
  private oauth2Client: any;
  private algorithm = 'aes-256-cbc';

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {
    this.initializeOAuth2Client();
  }

  private initializeOAuth2Client() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUrl = this.configService.get('GOOGLE_REDIRECT_URI') ||
      `${this.configService.get('APP_URL') || 'http://localhost:3000'}/api/brain/auth/google/callback`;

    if (!clientId || !clientSecret) {
      console.warn('Google OAuth not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET missing)');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
  }

  /**
   * Generate Google OAuth consent URL
   */
  getAuthorizationUrl(userId: string, scopes: string[] = []): string {
    if (!this.oauth2Client) {
      throw new BadRequestException('Google OAuth not configured');
    }

    const defaultScopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/drive.readonly',
    ];

    const finalScopes = scopes.length > 0 ? scopes : defaultScopes;

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: finalScopes,
      state: this.encryptState({ userId, timestamp: Date.now() }),
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, state: string) {
    if (!this.oauth2Client) {
      throw new BadRequestException('Google OAuth not configured');
    }

    try {
      const stateData = this.decryptState(state);
      const { tokens } = await this.oauth2Client.getToken(code);

      return {
        userId: stateData.userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expiry_time),
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(`Failed to exchange code for tokens: ${message}`);
    }
  }

  /**
   * Store encrypted Google tokens in user profile
   */
  async storeGoogleTokens(userId: string, tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: Date;
    scopes: string[];
  }) {
    const encryptedAccessToken = this.encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken
      ? this.encryptToken(tokens.refreshToken)
      : null;

    await this.userModel.findByIdAndUpdate(
      new Types.ObjectId(userId),
      {
        googleOAuth: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          expiresAt: tokens.expiresAt,
          scopes: tokens.scopes,
        },
      },
      { new: true },
    );
  }

  /**
   * Get decrypted Google access token for a user
   */
  async getDecryptedAccessToken(userId: string): Promise<string | null> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.googleOAuth?.accessToken) {
      return null;
    }

    try {
      return this.decryptToken(user.googleOAuth.accessToken);
    } catch {
      return null;
    }
  }

  /**
   * Refresh Google access token if expired
   */
  async refreshGoogleAccessToken(userId: string): Promise<boolean> {
    if (!this.oauth2Client) {
      return false;
    }

    const user = await this.userModel.findById(userId);
    if (!user || !user.googleOAuth?.refreshToken) {
      return false;
    }

    try {
      const refreshToken = this.decryptToken(user.googleOAuth.refreshToken);
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      await this.storeGoogleTokens(userId, {
        accessToken: credentials.access_token!,
        refreshToken: refreshToken,
        expiresAt: new Date(credentials.expiry_time || Date.now() + 3600 * 1000),
        scopes: user.googleOAuth.scopes,
      });

      return true;
    } catch (error) {
      console.error('Failed to refresh Google token:', error);
      return false;
    }
  }

  /**
   * Get authenticated Gmail client
   */
  async getGmailClient(userId: string) {
    const accessToken = await this.getDecryptedAccessToken(userId);
    if (!accessToken) {
      throw new UnauthorizedException('Google OAuth token not found');
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return google.gmail({ version: 'v1', auth });
  }

  /**
   * Get authenticated Google Drive client
   */
  async getDriveClient(userId: string) {
    const accessToken = await this.getDecryptedAccessToken(userId);
    if (!accessToken) {
      throw new UnauthorizedException('Google OAuth token not found');
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return google.drive({ version: 'v3', auth });
  }

  /**
   * Encrypt token for storage
   */
  private encryptToken(token: string): string {
    const encryptionKey = this.configService.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(encryptionKey, 'hex'),
      iv,
    );

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt token from storage
   */
  private decryptToken(encryptedToken: string): string {
    const encryptionKey = this.configService.get('ENCRYPTION_KEY');
    if (!encryptionKey) {
      throw new Error('ENCRYPTION_KEY not configured');
    }

    const [ivHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(encryptionKey, 'hex'),
      iv,
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Encrypt state for OAuth flow (prevents CSRF)
   */
  private encryptState(state: Record<string, any>): string {
    return Buffer.from(JSON.stringify(state)).toString('base64');
  }

  /**
   * Decrypt state from OAuth callback
   */
  private decryptState(state: string): Record<string, any> {
    try {
      return JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    } catch {
      throw new BadRequestException('Invalid state parameter');
    }
  }
}
