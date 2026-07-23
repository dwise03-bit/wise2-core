import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';

export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
}

/**
 * OAuth Credentials Entity
 * Stores OAuth tokens for third-party integrations
 * Used by Google Calendar, Google Drive, and other OAuth-based services
 */
@Entity('oauth_credentials')
@Index(['user_id', 'provider'], { unique: true })
@Index(['provider'])
@Index(['expires_at'])
export class OAuthCredentials {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  user_id!: string;

  @Column({
    type: 'enum',
    enum: OAuthProvider,
  })
  provider!: OAuthProvider;

  @Column({
    type: 'text',
    comment: 'OAuth access token for API access',
  })
  access_token!: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'OAuth refresh token for token renewal',
  })
  refresh_token?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Token type (usually Bearer)',
  })
  token_type?: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Space-separated OAuth scopes granted',
  })
  scopes?: string;

  @Column({
    type: 'timestamp',
    comment: 'When the access token expires',
  })
  expires_at!: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'OAuth provider account ID/sub',
  })
  provider_account_id?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Name of the connected account (e.g., email)',
  })
  account_name?: string;

  @Column({
    type: 'boolean',
    default: true,
    comment: 'Whether this credential is active/valid',
  })
  is_active!: boolean;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'When the credential was last used',
  })
  last_used_at?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: 'Error message if credential became invalid',
  })
  error_message?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.oauthCredentials, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
