/**
 * Emote parsing utilities for Twitch, BTTV, and 7TV emotes
 */

import { EmoteData } from '../components/LiveStudio/types/chat';

/**
 * Twitch emote configuration
 */
export interface TwitchEmoteConfig {
  emoteId: string;
  emoteSet: string;
}

/**
 * BTTV emote
 */
export interface BttvEmote {
  id: string;
  code: string;
  imageType: string;
  animatedImageType?: string;
}

/**
 * 7TV emote
 */
export interface SevenTVEmote {
  id: string;
  name: string;
  url: string;
  width: number[];
  height: number[];
}

/**
 * Parse Twitch emotes from message
 * Expects emote data like: "123456:0-5,12-15"
 */
export function parseTwitchEmotes(
  message: string,
  emoteData?: string
): EmoteData[] {
  if (!emoteData) return [];

  const emotes: EmoteData[] = [];
  const emotePairs = emoteData.split('/');

  emotePairs.forEach((pair) => {
    const [emoteId, positions] = pair.split(':');
    const positionRanges = positions.split(',');

    positionRanges.forEach((range) => {
      const [start, end] = range.split('-').map(Number);
      const emoteName = message.substring(start, end + 1);

      emotes.push({
        id: `twitch-${emoteId}-${start}`,
        name: emoteName,
        url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/static/light/1.0`,
        type: 'twitch',
        startIndex: start,
        endIndex: end,
      });
    });
  });

  return emotes;
}

/**
 * Detect BTTV emotes in message
 */
export function detectBttvEmotes(
  message: string,
  bttvEmotes: BttvEmote[]
): EmoteData[] {
  const emotes: EmoteData[] = [];
  const words = message.split(' ');

  let charIndex = 0;
  words.forEach((word) => {
    const startIndex = charIndex;
    const endIndex = charIndex + word.length - 1;

    const matchedEmote = bttvEmotes.find((e) => e.code === word);
    if (matchedEmote) {
      emotes.push({
        id: `bttv-${matchedEmote.id}`,
        name: matchedEmote.code,
        url: `https://cdn.betterttv.net/emote/${matchedEmote.id}/1x`,
        type: 'bttv',
        startIndex,
        endIndex,
      });
    }

    charIndex = endIndex + 2; // +2 for space
  });

  return emotes;
}

/**
 * Detect 7TV emotes in message
 */
export function detect7TVEmotes(
  message: string,
  sevenTVEmotes: SevenTVEmote[]
): EmoteData[] {
  const emotes: EmoteData[] = [];
  const words = message.split(' ');

  let charIndex = 0;
  words.forEach((word) => {
    const startIndex = charIndex;
    const endIndex = charIndex + word.length - 1;

    const matchedEmote = sevenTVEmotes.find((e) => e.name === word);
    if (matchedEmote) {
      emotes.push({
        id: `7tv-${matchedEmote.id}`,
        name: matchedEmote.name,
        url: matchedEmote.url,
        type: '7tv',
        startIndex,
        endIndex,
      });
    }

    charIndex = endIndex + 2; // +2 for space
  });

  return emotes;
}

/**
 * Combine all emote types
 */
export function parseAllEmotes(
  message: string,
  options?: {
    twitchEmoteData?: string;
    bttvEmotes?: BttvEmote[];
    sevenTVEmotes?: SevenTVEmote[];
  }
): EmoteData[] {
  const allEmotes: EmoteData[] = [];

  if (options?.twitchEmoteData) {
    allEmotes.push(...parseTwitchEmotes(message, options.twitchEmoteData));
  }

  if (options?.bttvEmotes) {
    allEmotes.push(...detectBttvEmotes(message, options.bttvEmotes));
  }

  if (options?.sevenTVEmotes) {
    allEmotes.push(...detect7TVEmotes(message, options.sevenTVEmotes));
  }

  return allEmotes;
}

/**
 * Fetch BTTV global emotes
 */
export async function fetchBttvGlobalEmotes(): Promise<BttvEmote[]> {
  try {
    const response = await fetch('https://api.betterttv.net/cached/emotes/global');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch BTTV emotes:', error);
    return [];
  }
}

/**
 * Fetch BTTV channel emotes
 */
export async function fetchBttvChannelEmotes(channelId: string): Promise<BttvEmote[]> {
  try {
    const response = await fetch(`https://api.betterttv.net/cached/users/twitch/${channelId}`);
    const data = await response.json();
    return [...(data.channelEmotes || []), ...(data.sharedEmotes || [])];
  } catch (error) {
    console.error('Failed to fetch channel BTTV emotes:', error);
    return [];
  }
}

/**
 * Fetch 7TV global emotes
 */
export async function fetchSevenTVGlobalEmotes(): Promise<SevenTVEmote[]> {
  try {
    const response = await fetch('https://api.7tv.app/v2/emotes/global');
    const data = await response.json();
    return data.emotes || [];
  } catch (error) {
    console.error('Failed to fetch 7TV emotes:', error);
    return [];
  }
}

/**
 * Fetch 7TV channel emotes
 */
export async function fetchSevenTVChannelEmotes(channelId: string): Promise<SevenTVEmote[]> {
  try {
    const response = await fetch(`https://api.7tv.app/v2/users/${channelId}/emotes`);
    const data = await response.json();
    return data.emotes || [];
  } catch (error) {
    console.error('Failed to fetch channel 7TV emotes:', error);
    return [];
  }
}

/**
 * Check if an emote URL is animated
 */
export function isAnimatedEmote(emote: EmoteData): boolean {
  return emote.url.includes('.gif') || emote.url.includes('animated');
}

/**
 * Get emote URL with size parameter
 */
export function getEmoteUrl(emote: EmoteData, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizeMap = { small: '1x', medium: '2x', large: '3x' };

  if (emote.type === 'twitch') {
    return emote.url.replace('/1.0', `/${sizeMap[size]}`);
  }

  if (emote.type === 'bttv') {
    return emote.url.replace('/1x', `/${sizeMap[size]}`);
  }

  // 7TV already includes sizing info
  return emote.url;
}
