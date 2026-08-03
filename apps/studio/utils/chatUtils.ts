/**
 * Chat utility functions
 */

import { EmoteData, ChatMessage, ChatAlert, UserType, AlertType } from '../components/LiveStudio/types/chat';

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp as relative time (e.g., "2m ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 1) return 'now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

/**
 * Parse message with emotes and render with custom emote component
 */
export function parseMessageWithEmotes(
  message: string,
  emotes: EmoteData[],
  options?: {
    renderEmote?: (emote: EmoteData) => React.ReactNode;
  }
): React.ReactNode[] {
  if (emotes.length === 0) return [message];

  // Sort emotes by start index (descending) to replace from end to beginning
  const sortedEmotes = [...emotes].sort((a, b) => b.startIndex - a.startIndex);

  let result: (string | React.ReactNode)[] = [message];

  sortedEmotes.forEach((emote) => {
    result = result.flatMap((part) => {
      if (typeof part !== 'string') return part;

      const before = part.substring(0, emote.startIndex);
      const emotePart = part.substring(emote.startIndex, emote.endIndex + 1);
      const after = part.substring(emote.endIndex + 1);

      const rendered = options?.renderEmote?.(emote) || emotePart;

      return before ? [before, rendered, after] : [rendered, after];
    });
  });

  return result.filter((part) => part !== '');
}

/**
 * Detect emotes in a message and extract them
 */
export function detectEmotes(
  message: string,
  platform: 'twitch' | 'youtube' | 'facebook' | 'mock' = 'mock',
  emotePatterns?: Array<{ pattern: RegExp; url: (match: string) => string }>
): EmoteData[] {
  const emotes: EmoteData[] = [];

  if (!emotePatterns) {
    return emotes;
  }

  const words = message.split(' ');
  let charIndex = 0;

  words.forEach((word) => {
    const startIndex = charIndex;
    const endIndex = charIndex + word.length - 1;

    emotePatterns.forEach(({ pattern, url }) => {
      if (pattern.test(word)) {
        emotes.push({
          id: `${word}-${startIndex}`,
          name: word,
          url: url(word),
          platform,
          startIndex,
          endIndex,
        });
      }
    });

    charIndex = endIndex + 2; // +2 for space and next word
  });

  return emotes;
}

/**
 * Extract @mentions from message
 */
export function extractMentions(message: string): string[] {
  const mentions = message.match(/@[\w]+/g) || [];
  return mentions.map((m) => m.substring(1)); // Remove @
}

/**
 * Extract URLs from message
 */
export function extractUrls(message: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return message.match(urlRegex) || [];
}

/**
 * Sanitize message for display (basic XSS prevention)
 */
export function sanitizeMessage(message: string): string {
  const div = document.createElement('div');
  div.textContent = message;
  return div.innerHTML;
}

/**
 * Calculate message visibility (for filtering by type/user)
 */
export function isMessageVisible(
  message: any,
  filters?: {
    showModerator?: boolean;
    showSubscriber?: boolean;
    showRegular?: boolean;
    hideKeywords?: string[];
  }
): boolean {
  if (!filters) return true;

  // Filter by user type
  if (message.userType === 'moderator' && filters.showModerator === false) {
    return false;
  }
  if (message.userType === 'subscriber' && filters.showSubscriber === false) {
    return false;
  }
  if (message.userType === 'regular' && filters.showRegular === false) {
    return false;
  }

  // Filter by keywords
  if (filters.hideKeywords?.length) {
    const messageLower = message.message.toLowerCase();
    return !filters.hideKeywords.some((keyword) =>
      messageLower.includes(keyword.toLowerCase())
    );
  }

  return true;
}

/**
 * Generate mock chat message for testing
 */
export function generateMockMessage(overrides?: Partial<ChatMessage>): ChatMessage {
  const names = [
    'StreamLover',
    'CoolCat99',
    'NeonPixel',
    'EchoMind',
    'ProGamer',
    'ChatVibes',
    'CinemaFan',
  ];
  const messages = [
    'This stream is amazing!',
    'Love the content!',
    'First message :)',
    'Great setup!',
    'Thanks for streaming!',
    'This is so cool',
    'More content like this please!',
  ];

  const userTypes: UserType[] = ['regular', 'subscriber', 'moderator'];

  return {
    id: generateId(),
    userName: names[Math.floor(Math.random() * names.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: new Date(),
    platform: 'mock',
    userType: userTypes[Math.floor(Math.random() * userTypes.length)],
    userAvatar: `https://i.pravatar.cc/40?u=${Math.random()}`,
    isModerator: false,
    isSubscriber: false,
    ...overrides,
  };
}

/**
 * Generate mock alert for testing
 */
export function generateMockAlert(overrides?: Partial<ChatAlert>): ChatAlert {
  const names = ['StreamViewer123', 'CoolUser', 'HappyFan'];
  const alertTypes: AlertType[] = ['subscribe', 'follow', 'tip'];

  const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];

  return {
    id: generateId(),
    type,
    userName: names[Math.floor(Math.random() * names.length)],
    userAvatar: `https://i.pravatar.cc/80?u=${Math.random()}`,
    message: 'Great stream!',
    amount: type === 'tip' ? Math.floor(Math.random() * 50) + 5 : undefined,
    currency: type === 'tip' ? 'USD' : undefined,
    timestamp: new Date(),
    platform: 'mock',
    duration: 5000,
    ...overrides,
  };
}
