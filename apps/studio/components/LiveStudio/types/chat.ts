/**
 * Chat Overlay Type Definitions
 * Centralized types for multi-platform chat integration
 */

/**
 * Supported streaming platforms
 */
export type ChatPlatform = 'twitch' | 'youtube' | 'facebook' | 'mock';

/**
 * Connection status states
 */
export type ChatConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error' | 'reconnecting';

/**
 * User role/badge types
 */
export type UserType = 'regular' | 'moderator' | 'broadcaster' | 'subscriber' | 'vip';

/**
 * Alert event types
 */
export type AlertType = 'follow' | 'subscribe' | 'giftsub' | 'raid' | 'tip' | 'milestone';

/**
 * Chat message corner positions
 */
export type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/**
 * Chat message size presets
 */
export type MessageSizePreset = 'small' | 'medium' | 'large';

/**
 * Chat message structure (unified across platforms)
 */
export interface ChatMessage {
  /** Unique message ID */
  id: string;
  /** Username of the sender */
  userName: string;
  /** Message content text */
  message: string;
  /** When the message was sent */
  timestamp: Date;
  /** Which platform the message came from */
  platform: ChatPlatform;
  /** User type/badges */
  userType?: UserType;
  /** Whether sender is a moderator */
  isModerator?: boolean;
  /** Whether sender is the broadcaster */
  isBroadcaster?: boolean;
  /** Whether sender is a subscriber */
  isSubscriber?: boolean;
  /** Subscriber tier (1, 2, 3) */
  subscriberTier?: number;
  /** Custom color for username (Twitch: hex color) */
  userColor?: string;
  /** Avatar image URL */
  userAvatar?: string;
  /** Emotes in the message (platform-specific IDs) */
  emotes?: EmoteData[];
  /** Whether message is deleted */
  isDeleted?: boolean;
  /** Reply/thread parent message ID */
  replyToId?: string;
}

/**
 * Emote data for rendering
 */
export interface EmoteData {
  id: string;
  name: string;
  url: string;
  platform: ChatPlatform;
  type?: 'twitch' | 'bttv' | '7tv';
  startIndex: number;
  endIndex: number;
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
  userName: string;
  /** Alert message/description */
  message?: string;
  /** User avatar URL */
  userAvatar?: string;
  /** When the alert occurred */
  timestamp: Date;
  /** Which platform the alert came from */
  platform: ChatPlatform;
  /** Duration to display alert (ms) */
  duration: number;
  /** Amount for tips/donations */
  amount?: number;
  /** Currency code (USD, EUR, etc) */
  currency?: string;
  /** Viewer count for raids */
  viewerCount?: number;
  /** Number of gifts (for gift subscriptions) */
  giftCount?: number;
  /** Subscriber tier */
  subscriberTier?: number;
  /** Additional alert-specific data */
  metadata?: Record<string, any>;
}

/**
 * Platform-specific credentials
 */
export interface PlatformCredentials {
  /** Platform type */
  platform: ChatPlatform;
  /** API key/access token for the platform */
  accessToken?: string;
  /** Channel or page ID */
  channelId?: string;
  /** Channel name (Twitch) */
  channelName?: string;
  /** OAuth token for authentication */
  oauthToken?: string;
  /** Webhook URL for webhooks */
  webhookUrl?: string;
  /** Additional platform-specific config */
  [key: string]: any;
}

/**
 * Complete chat overlay configuration
 */
export interface ChatOverlayConfig {
  /** Position on screen */
  position: CornerPosition;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Background opacity (0-1) */
  opacity: number;
  /** Font size in pixels */
  fontSize: number;
  /** Show usernames */
  showUsernames: boolean;
  /** Show timestamps */
  showTimestamps: boolean;
  /** Show emotes */
  showEmotes: boolean;
  /** Maximum messages to display */
  messageLimit: number;
  /** Auto-scroll to latest message */
  autoScroll: boolean;
  /** Sound effects enabled */
  soundEnabled: boolean;
  /** Alert animations enabled */
  alertAnimations: boolean;
}

/**
 * Multi-platform chat state
 */
export interface MultichatState {
  /** Messages from all platforms */
  messages: ChatMessage[];
  /** Alerts from all platforms */
  alerts: ChatAlert[];
  /** Connection status per platform */
  connectionStatus: Record<ChatPlatform, ChatConnectionStatus>;
  /** Active platforms */
  activePlatforms: ChatPlatform[];
  /** Last update timestamp */
  lastUpdate: Date;
}

/**
 * Default configuration factory
 */
export const createDefaultChatConfig = (): ChatOverlayConfig => ({
  position: 'bottom-right',
  width: 350,
  height: 400,
  opacity: 0.9,
  fontSize: 14,
  showUsernames: true,
  showTimestamps: true,
  showEmotes: true,
  messageLimit: 50,
  autoScroll: true,
  soundEnabled: false,
  alertAnimations: true,
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
  mock: 'Mock',
};

/**
 * Alert type label mapping
 */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  follow: 'New Follower',
  subscribe: 'New Subscriber',
  giftsub: 'Gift Subscription',
  raid: 'Raid',
  tip: 'Tip/Donation',
  milestone: 'Milestone',
};

/**
 * User type styling
 */
export const USER_TYPE_STYLES: Record<UserType, { badge: string; color: string }> = {
  regular: { badge: '●', color: 'text-white' },
  moderator: { badge: '⚡', color: 'text-green-400' },
  broadcaster: { badge: '🎙', color: 'text-gold-400' },
  subscriber: { badge: '⭐', color: 'text-purple-400' },
  vip: { badge: '♦', color: 'text-pink-400' },
};

/**
 * Size preset dimensions
 */
export const SIZE_PRESETS: Record<MessageSizePreset, { width: number; height: number }> = {
  small: { width: 280, height: 300 },
  medium: { width: 350, height: 400 },
  large: { width: 450, height: 550 },
};
