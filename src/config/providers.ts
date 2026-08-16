/**
 * Integration Provider Registry
 * Centralized configuration for all supported providers
 */

import { ProviderRegistry, AuthenticationType, IntegrationCategory } from '../types/integrations';

export const PROVIDERS: Record<string, ProviderRegistry> = {
  // ===== GOOGLE =====
  google: {
    id: 'google',
    name: 'Google',
    category: IntegrationCategory.PRODUCTIVITY,
    authType: AuthenticationType.OAUTH2,
    icon: '🔍',
    description: 'Google Workspace and consumer services',
    capabilities: [
      {
        id: 'sign_in',
        name: 'Google Sign-In',
        description: 'Sign in or link your Google account',
        scopes: ['openid', 'email', 'profile'],
        icon: '🔐',
        enabled: true,
      },
      {
        id: 'gmail',
        name: 'Gmail',
        description: 'Read, draft, and send emails',
        scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.compose'],
        icon: '📧',
        enabled: true,
      },
      {
        id: 'calendar',
        name: 'Google Calendar',
        description: 'Manage your calendar and check availability',
        scopes: ['https://www.googleapis.com/auth/calendar'],
        icon: '📅',
        enabled: true,
      },
      {
        id: 'drive',
        name: 'Google Drive',
        description: 'Access and manage files in Drive',
        scopes: ['https://www.googleapis.com/auth/drive.appdata', 'https://www.googleapis.com/auth/drive.file'],
        icon: '☁️',
        enabled: true,
      },
      {
        id: 'contacts',
        name: 'Google Contacts',
        description: 'Search and read contacts',
        scopes: ['https://www.googleapis.com/auth/contacts.readonly'],
        icon: '👥',
        enabled: true,
      },
      {
        id: 'youtube',
        name: 'YouTube',
        description: 'Manage YouTube channel and live streams',
        scopes: [
          'https://www.googleapis.com/auth/youtube.readonly',
          'https://www.googleapis.com/auth/youtube.force-ssl',
        ],
        icon: '▶️',
        enabled: true,
      },
      {
        id: 'youtube_live',
        name: 'YouTube Live',
        description: 'Stream live on YouTube',
        scopes: ['https://www.googleapis.com/auth/youtube'],
        icon: '📹',
        enabled: true,
      },
    ],
    oauth: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.APP_URL}/api/v1/integrations/google/callback`,
      scopes: ['openid', 'email', 'profile'],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      revokeUrl: 'https://oauth2.googleapis.com/revoke',
    },
    docs: 'https://developers.google.com/identity/protocols/oauth2',
  },

  // ===== KICK =====
  kick: {
    id: 'kick',
    name: 'Kick',
    category: IntegrationCategory.STREAMING,
    authType: [AuthenticationType.OAUTH2, AuthenticationType.RTMP],
    icon: '🎮',
    description: 'Kick live streaming platform',
    capabilities: [
      {
        id: 'channel',
        name: 'Channel Access',
        description: 'Connect your Kick channel',
        scopes: ['channel:read', 'channel:manage'],
        icon: '📺',
        enabled: true,
      },
      {
        id: 'stream_metadata',
        name: 'Stream Metadata',
        description: 'Configure stream title, category, and tags',
        scopes: ['stream:metadata'],
        icon: '⚙️',
        enabled: true,
      },
      {
        id: 'live_status',
        name: 'Live Status',
        description: 'Monitor stream status and health',
        scopes: ['stream:status'],
        icon: '📊',
        enabled: true,
      },
      {
        id: 'rtmp_streaming',
        name: 'RTMP Streaming',
        description: 'Stream via RTMP protocol',
        scopes: [],
        icon: '🔌',
        enabled: true,
      },
    ],
    oauth: {
      clientId: process.env.KICK_CLIENT_ID || '',
      clientSecret: process.env.KICK_CLIENT_SECRET,
      redirectUri: `${process.env.APP_URL}/api/v1/integrations/kick/callback`,
      scopes: ['channel:read', 'channel:manage', 'stream:metadata', 'stream:status'],
      authorizationUrl: 'https://kick.com/oauth/authorize',
      tokenUrl: 'https://kick.com/oauth/token',
      revokeUrl: 'https://kick.com/oauth/revoke',
    },
    docs: 'https://docs.kick.com/api',
  },

  // ===== DISCORD =====
  discord: {
    id: 'discord',
    name: 'Discord',
    category: IntegrationCategory.COMMUNITY,
    authType: [AuthenticationType.OAUTH2, AuthenticationType.BOT_TOKEN],
    icon: '💬',
    description: 'Discord server and bot integration',
    capabilities: [
      {
        id: 'server_selection',
        name: 'Server Selection',
        description: 'Select Discord server to integrate',
        scopes: ['identify', 'guilds'],
        icon: '🏢',
        enabled: true,
      },
      {
        id: 'channel_selection',
        name: 'Channel Selection',
        description: 'Configure announcements and notifications',
        scopes: ['channels:read', 'messages:write'],
        icon: '💬',
        enabled: true,
      },
      {
        id: 'announcements',
        name: 'Live Announcements',
        description: 'Post "Going Live" notifications',
        scopes: ['messages:write'],
        icon: '📢',
        enabled: true,
      },
      {
        id: 'webhooks',
        name: 'Webhooks',
        description: 'Receive stream notifications',
        scopes: ['webhooks:manage'],
        icon: '🔗',
        enabled: true,
      },
      {
        id: 'bot_actions',
        name: 'Bot Actions',
        description: 'Bot commands and automations',
        scopes: ['bot'],
        icon: '🤖',
        enabled: true,
      },
      {
        id: 'live_notifications',
        name: 'Live Notifications',
        description: 'Real-time stream status updates',
        scopes: ['messages:write'],
        icon: '🔔',
        enabled: true,
      },
    ],
    oauth: {
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      redirectUri: `${process.env.APP_URL}/api/v1/integrations/discord/callback`,
      scopes: ['identify', 'email', 'guilds', 'bot'],
      authorizationUrl: 'https://discord.com/api/oauth2/authorize',
      tokenUrl: 'https://discord.com/api/oauth2/token',
      revokeUrl: 'https://discord.com/api/oauth2/token/revoke',
    },
    docs: 'https://discord.com/developers/docs',
  },

  // ===== YOUTUBE (standalone, though also under Google) =====
  youtube: {
    id: 'youtube',
    name: 'YouTube Live',
    category: IntegrationCategory.STREAMING,
    authType: AuthenticationType.OAUTH2,
    icon: '▶️',
    description: 'YouTube Live streaming',
    capabilities: [
      {
        id: 'channel',
        name: 'Channel Access',
        description: 'Access your YouTube channel',
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
        icon: '📺',
        enabled: true,
      },
      {
        id: 'live_broadcast',
        name: 'Live Broadcast',
        description: 'Create and manage live broadcasts',
        scopes: ['https://www.googleapis.com/auth/youtube'],
        icon: '📹',
        enabled: true,
      },
      {
        id: 'stream_status',
        name: 'Stream Status',
        description: 'Monitor stream health and metrics',
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
        icon: '📊',
        enabled: true,
      },
    ],
    oauth: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: `${process.env.APP_URL}/api/v1/integrations/youtube/callback`,
      scopes: ['https://www.googleapis.com/auth/youtube'],
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      revokeUrl: 'https://oauth2.googleapis.com/revoke',
    },
    docs: 'https://developers.google.com/youtube/v3/docs',
  },
};

/**
 * Get provider by ID
 */
export function getProvider(providerId: string): ProviderRegistry | null {
  return PROVIDERS[providerId] || null;
}

/**
 * Get all providers
 */
export function getAllProviders(): ProviderRegistry[] {
  return Object.values(PROVIDERS);
}

/**
 * Get providers by category
 */
export function getProvidersByCategory(category: IntegrationCategory): ProviderRegistry[] {
  return Object.values(PROVIDERS).filter((p) => p.category === category);
}

/**
 * Get streaming providers (Kick, YouTube, custom RTMP/SRT)
 */
export function getStreamingProviders(): ProviderRegistry[] {
  return getProvidersByCategory(IntegrationCategory.STREAMING);
}

/**
 * Get community providers (Discord)
 */
export function getCommunityProviders(): ProviderRegistry[] {
  return getProvidersByCategory(IntegrationCategory.COMMUNITY);
}

/**
 * Get productivity providers (Google, etc)
 */
export function getProductivityProviders(): ProviderRegistry[] {
  return getProvidersByCategory(IntegrationCategory.PRODUCTIVITY);
}
