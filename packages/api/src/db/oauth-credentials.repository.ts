import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OAuthCredentials, OAuthProvider } from './oauth-credentials.entity';

/**
 * OAuth Credentials Repository
 * Handles database operations for storing and retrieving OAuth credentials
 */
@Injectable()
export class OAuthCredentialsRepository extends Repository<OAuthCredentials> {
  constructor(private readonly dataSource: DataSource) {
    super(OAuthCredentials, dataSource.createEntityManager());
  }

  /**
   * Create or update OAuth credentials for a user
   */
  async upsertCredentials(
    userId: string,
    provider: OAuthProvider,
    data: {
      accessToken: string;
      refreshToken?: string;
      tokenType?: string;
      scopes?: string;
      expiresAt: Date;
      providerAccountId?: string;
      accountName?: string;
    }
  ): Promise<OAuthCredentials> {
    const existing = await this.findOne({
      where: {
        user_id: userId,
        provider,
      },
    });

    if (existing) {
      // Update existing credentials
      existing.access_token = data.accessToken;
      existing.refresh_token = data.refreshToken || existing.refresh_token;
      existing.token_type = data.tokenType || existing.token_type;
      existing.scopes = data.scopes || existing.scopes;
      existing.expires_at = data.expiresAt;
      existing.provider_account_id = data.providerAccountId || existing.provider_account_id;
      existing.account_name = data.accountName || existing.account_name;
      existing.is_active = true;
      existing.error_message = null;

      return this.save(existing);
    }

    // Create new credentials
    const newCredentials = this.create({
      user_id: userId,
      provider,
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
      token_type: data.tokenType,
      scopes: data.scopes,
      expires_at: data.expiresAt,
      provider_account_id: data.providerAccountId,
      account_name: data.accountName,
      is_active: true,
    });

    return this.save(newCredentials);
  }

  /**
   * Get credentials for a user and provider
   */
  async getCredentials(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthCredentials | null> {
    return this.findOne({
      where: {
        user_id: userId,
        provider,
      },
    });
  }

  /**
   * Check if user has connected a provider
   */
  async isConnected(userId: string, provider: OAuthProvider): Promise<boolean> {
    const credential = await this.findOne({
      where: {
        user_id: userId,
        provider,
        is_active: true,
      },
    });

    return !!credential;
  }

  /**
   * Get all connected providers for a user
   */
  async getConnectedProviders(userId: string): Promise<OAuthProvider[]> {
    const credentials = await this.find({
      where: {
        user_id: userId,
        is_active: true,
      },
    });

    return credentials.map((c) => c.provider);
  }

  /**
   * Update token when refreshed
   */
  async updateToken(
    userId: string,
    provider: OAuthProvider,
    data: {
      accessToken: string;
      refreshToken?: string;
      expiresAt: Date;
      scopes?: string;
    }
  ): Promise<OAuthCredentials | null> {
    const credential = await this.findOne({
      where: {
        user_id: userId,
        provider,
      },
    });

    if (!credential) {
      return null;
    }

    credential.access_token = data.accessToken;
    if (data.refreshToken) {
      credential.refresh_token = data.refreshToken;
    }
    credential.expires_at = data.expiresAt;
    if (data.scopes) {
      credential.scopes = data.scopes;
    }
    credential.last_used_at = new Date();
    credential.error_message = null;

    return this.save(credential);
  }

  /**
   * Mark credential as failed
   */
  async markAsFailed(
    userId: string,
    provider: OAuthProvider,
    errorMessage: string
  ): Promise<void> {
    await this.update(
      {
        user_id: userId,
        provider,
      },
      {
        is_active: false,
        error_message: errorMessage,
        updated_at: new Date(),
      }
    );
  }

  /**
   * Mark credential as used (update last_used_at)
   */
  async markAsUsed(userId: string, provider: OAuthProvider): Promise<void> {
    await this.update(
      {
        user_id: userId,
        provider,
      },
      {
        last_used_at: new Date(),
      }
    );
  }

  /**
   * Disconnect provider (soft delete by marking inactive)
   */
  async disconnect(userId: string, provider: OAuthProvider): Promise<boolean> {
    const result = await this.update(
      {
        user_id: userId,
        provider,
      },
      {
        is_active: false,
        updated_at: new Date(),
      }
    );

    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Get credentials that are expired
   */
  async getExpiredCredentials(provider?: OAuthProvider): Promise<OAuthCredentials[]> {
    const query = this.createQueryBuilder('oc')
      .where('oc.expires_at < NOW()')
      .andWhere('oc.is_active = true');

    if (provider) {
      query.andWhere('oc.provider = :provider', { provider });
    }

    return query.getMany();
  }

  /**
   * Get credentials that need refresh (expiring soon)
   */
  async getExpiringSoonCredentials(
    provider?: OAuthProvider,
    minutesBefore: number = 60
  ): Promise<OAuthCredentials[]> {
    const thresholdDate = new Date();
    thresholdDate.setMinutes(thresholdDate.getMinutes() + minutesBefore);

    const query = this.createQueryBuilder('oc')
      .where('oc.expires_at < :thresholdDate', { thresholdDate })
      .andWhere('oc.expires_at > NOW()')
      .andWhere('oc.is_active = true')
      .andWhere('oc.refresh_token IS NOT NULL');

    if (provider) {
      query.andWhere('oc.provider = :provider', { provider });
    }

    return query.getMany();
  }

  /**
   * Delete all credentials for a user
   */
  async deleteAllForUser(userId: string): Promise<number> {
    const result = await this.delete({
      user_id: userId,
    });

    return result.affected || 0;
  }

  /**
   * Get credentials with associated user
   */
  async getWithUser(userId: string, provider: OAuthProvider) {
    return this.findOne({
      where: {
        user_id: userId,
        provider,
      },
      relations: ['user'],
    });
  }
}
