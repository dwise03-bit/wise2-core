/**
 * Third-Party Integrations Configuration
 * Centralized configuration for Stripe, Discord, and YouTube
 */

// ============================================
// STRIPE CONFIGURATION
// ============================================
export const STRIPE_CONFIG = {
  publishable_key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  pricing_ids: {
    starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter_test',
    professional: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional_test',
    enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_test',
  },
  isConfigured: () => !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};

// ============================================
// DISCORD CONFIGURATION
// ============================================
export const DISCORD_CONFIG = {
  server_invite: process.env.NEXT_PUBLIC_DISCORD_SERVER_INVITE || 'https://discord.gg/wise2',
  community_link: process.env.NEXT_PUBLIC_DISCORD_COMMUNITY_LINK || 'https://discord.gg/wise2',
  webhook_url: process.env.DISCORD_WEBHOOK_URL || '',
  isConfigured: () => !!process.env.DISCORD_WEBHOOK_URL,
};

// ============================================
// YOUTUBE CONFIGURATION
// ============================================
export const YOUTUBE_CONFIG = {
  channel_id: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '',
  channel_url: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_URL || 'https://www.youtube.com/@wise2channel',
  demo_video_id: process.env.NEXT_PUBLIC_YOUTUBE_DEMO_VIDEO_ID || 'dQw4w9WgXcQ',
  playlist_id: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID || '',
  api_key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '',
  isConfigured: () => !!process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
};

// ============================================
// INTEGRATION HEALTH CHECK
// ============================================

interface IntegrationStatus {
  name: string;
  configured: boolean;
  status: 'ok' | 'missing' | 'partial';
  message?: string;
}

/**
 * Check health of all integrations
 */
export async function checkIntegrations(): Promise<{
  all: IntegrationStatus[];
  healthy: boolean;
  timestamp: string;
}> {
  const checks: IntegrationStatus[] = [];

  // Stripe check
  checks.push({
    name: 'stripe',
    configured: STRIPE_CONFIG.isConfigured(),
    status: STRIPE_CONFIG.isConfigured() ? 'ok' : 'missing',
    message: STRIPE_CONFIG.isConfigured()
      ? 'Stripe configured and ready'
      : 'Stripe publishable key missing',
  });

  // Discord check
  checks.push({
    name: 'discord',
    configured: DISCORD_CONFIG.isConfigured(),
    status: DISCORD_CONFIG.isConfigured() ? 'ok' : 'missing',
    message: DISCORD_CONFIG.isConfigured()
      ? 'Discord webhook configured'
      : 'Discord webhook URL missing',
  });

  // YouTube check
  checks.push({
    name: 'youtube',
    configured: YOUTUBE_CONFIG.isConfigured(),
    status: YOUTUBE_CONFIG.isConfigured() ? 'ok' : 'missing',
    message: YOUTUBE_CONFIG.isConfigured()
      ? 'YouTube channel configured'
      : 'YouTube channel ID missing',
  });

  return {
    all: checks,
    healthy: checks.every(c => c.status === 'ok'),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get integration status for UI display
 */
export function getIntegrationStatus(integration: 'stripe' | 'discord' | 'youtube') {
  switch (integration) {
    case 'stripe':
      return STRIPE_CONFIG.isConfigured();
    case 'discord':
      return DISCORD_CONFIG.isConfigured();
    case 'youtube':
      return YOUTUBE_CONFIG.isConfigured();
  }
}
