/**
 * Chat Overlay Type Definitions
 * Centralized types for the OBSChatOverlay component system
 */

/**
 * Supported streaming platforms
 */
export type ChatPlatform = 'twitch' | 'youtube' | 'facebook' | 'custom';

/**
 * Alert event types
 */
export type AlertType = 'follow' | 'subscribe' | 'donate' | 'raid';

/**
 * Chat message corner positions
 */
export type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Chat message structure
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  /** Username of the sender */
  username: string;
  /** Message content text */
  message: string;
  /** When the message was sent */
  timestamp: Date;
  /** Which platform the message came from */
  platform: ChatPlatform;
  /** Whether sender is a moderator */
  isModerator?: boolean;
  /** Whether sender is the stream host */
  isHost?: boolean;
  /** Whether sender is a subscriber */
  isSubscriber?: boolean;
  /** Custom color for username */
  color?: string;
  /** Avatar image URL */
  avatarUrl?: string;
}

/**
 * Chat alert/notification structure
 */
export interface ChatAlert {
  /** Unique alert ID */
  id: string;
  /** Type of alert event */
  type: AlertType;
  /** Username triggering the alert */
  username: string;
  /** Alert message/description */
  message: string;
  /** When the alert occurred */
  timestamp: Date;
  /** Additional data specific to alert type */
  metadata?: Record<string, any>;
}

/**
 * Platform-specific credentials
 */
export interface PlatformCredentials {
  /** API key for the platform */
  apiKey?: string;
  /** Channel or page ID */
  channelId?: string;
  /** OAuth token for authentication */
  oauthToken?: string;
  /** Additional platform-specific config */
  [key: string]: any;
}

/**
 * Complete chat overlay configuration
 */
export interface ChatOverlayConfig {
  /** Which platforms to connect to */
  platforms: ChatPlatform[];
  /** Platform credentials for each service */
  credentials: Record<ChatPlatform, PlatformCredentials>;
  /** Overlay corner position */
  position: CornerPosition;
  /** Font size in pixels (10-18) */
  fontSize: number;
  /** Background opacity percentage (0-100) */
  backgroundOpacity: number;
  /** Maximum messages to display (5-50) */
  maxMessages: number;
  /** Show follower/subscriber/raid alerts */
  showAlerts: boolean;
  /** How long alerts display in seconds */
  alertDuration: number;
  /** Support emoji in messages */
  enableEmojis: boolean;
  /** Highlight @mentions */
  enableMentions: boolean;
  /** Filter spam and promotional content */
  filterSpam: boolean;
}

/**
 * Default configuration factory
 */
export const createDefaultChatConfig = (
  overrides?: Partial<ChatOverlayConfig>
): ChatOverlayConfig => ({
  platforms: ['twitch'],
  credentials: {
    twitch: { apiKey: '', channelId: '' },
    youtube: { apiKey: '', channelId: '' },
    facebook: { apiKey: '', channelId: '' },
    custom: { webhookUrl: '' },
  },
  position: 'bottom-right',
  fontSize: 14,
  backgroundOpacity: 85,
  maxMessages: 30,
  showAlerts: true,
  alertDuration: 3,
  enableEmojis: true,
  enableMentions: true,
  filterSpam: true,
  ...overrides,
});

/**
 * Position label mapping
 */
export const POSITION_LABELS: Record<CornerPosition, string> = {
  'top-left': 'Top Left',
  'top-right': 'Top Right',
  'bottom-left': 'Bottom Left',
  'bottom-right': 'Bottom Right',
};

/**
 * Platform label mapping
 */
export const PLATFORM_LABELS: Record<ChatPlatform, string> = {
  twitch: 'Twitch',
  youtube: 'YouTube',
  facebook: 'Facebook',
  custom: 'Custom',
};

/**
 * Alert type label mapping
 */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  follow: 'Follow',
  subscribe: 'Subscribe',
  donate: 'Donate',
  raid: 'Raid',
};
