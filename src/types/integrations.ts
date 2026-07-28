/**
 * Integration System Types
 * Unified authentication and provider management
 */

export enum AuthenticationType {
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  OPENID_CONNECT = 'OPENID_CONNECT',
  BOT_TOKEN = 'BOT_TOKEN',
  WEBHOOK = 'WEBHOOK',
  RTMP = 'RTMP',
  SRT = 'SRT',
  SERVICE_ACCOUNT = 'SERVICE_ACCOUNT',
  CUSTOM_HEADERS = 'CUSTOM_HEADERS',
}

export enum IntegrationCategory {
  PRODUCTIVITY = 'productivity',
  STREAMING = 'streaming',
  COMMUNITY = 'community',
  ANALYTICS = 'analytics',
  STORAGE = 'storage',
  MESSAGING = 'messaging',
}

export enum AuthorizationStatus {
  NOT_CONNECTED = 'not_connected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  AUTHORIZATION_REQUIRED = 'authorization_required',
  PERMISSION_MISSING = 'permission_missing',
  OFFLINE = 'offline',
  ERROR = 'error',
}

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
}

export interface ProviderCapability {
  id: string;
  name: string;
  description: string;
  scopes: string[];
  icon: string;
  enabled: boolean;
}

export interface ProviderRegistry {
  id: string;
  name: string;
  category: IntegrationCategory;
  authType: AuthenticationType | AuthenticationType[];
  icon: string;
  description: string;
  capabilities: ProviderCapability[];
  oauth?: OAuthConfig;
  docs?: string;
}

export interface StoredIntegration {
  id: string;
  userId: string;
  organizationId: string;
  providerId: string;
  authType: AuthenticationType;
  status: AuthorizationStatus;
  externalAccountId?: string;
  externalAccountName?: string;
  externalWorkspaceId?: string;
  externalChannelId?: string;
  oauthScopes?: string[];
  encryptedAccessToken?: string;
  encryptedRefreshToken?: string;
  tokenExpiresAt?: Date;
  tokenType?: string;
  rtmpServer?: string;
  encryptedStreamKey?: string;
  webhookUrl?: string;
  encryptedWebhookSecret?: string;
  lastSyncAt?: Date;
  lastStreamStartedAt?: Date;
  lastStreamEndedAt?: Date;
  providerMetadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthState {
  userId: string;
  organizationId: string;
  providerId: string;
  capabilities?: string[];
  nonce: string;
  timestamp: number;
}

export interface OAuthCallback {
  code: string;
  state: string;
  error?: string;
  errorDescription?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
}

export interface StreamDestination {
  id: string;
  providerId: string;
  name: string;
  enabled: boolean;
  status: AuthorizationStatus;
  lastError?: string;
  metadata?: Record<string, any>;
}

export interface LiveStreamConfig {
  title: string;
  description: string;
  category?: string;
  thumbnail?: string;
  isPublic: boolean;
  matureContent?: boolean;
  tags?: string[];
  destinations: StreamDestination[];
}

export interface DiscordAnnouncement {
  serverId: string;
  channelId: string;
  template: string;
  mentionRoles?: string[];
  includeThumbnail?: boolean;
  includeLink?: boolean;
}

export interface GoogleAuthResponse {
  userId: string;
  email: string;
  name: string;
  profilePicture?: string;
  refreshToken?: string;
  accessToken: string;
}

export interface KickStreamMetadata {
  title: string;
  description: string;
  categoryId?: string;
  tags?: string[];
  isMature?: boolean;
  language?: string;
}

export interface PreflightCheckResult {
  provider: string;
  status: 'ready' | 'action_required' | 'warning' | 'failed';
  message: string;
  action?: string;
}
