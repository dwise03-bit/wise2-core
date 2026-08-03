/**
 * Social Media Content Formatter
 * Formats content for different social platforms
 */

import { generateCTA } from './ctaGenerator';
import { generateTwitterHashtags, generateInstagramHashtags, generateLinkedInHashtags } from './hashtagGenerator';

export interface SocialMediaPost {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'telegram' | 'discord';
  content_text: string;
  hashtags: string;
  call_to_action: string;
  character_count: number;
  engagement_tips?: string;
}

/**
 * Format content for Twitter (280 characters)
 */
export function formatForTwitter(
  title: string,
  keyPoint: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  url: string
): SocialMediaPost {
  // Twitter strategy: Headline + key point + link
  let content = title;

  // Add key point if it fits
  if (content.length < 200) {
    content += '\n' + keyPoint;
  }

  // Add link
  if (content.length < 260) {
    content += '\n' + url;
  }

  const hashtags = generateTwitterHashtags(title, keyPoint, sentiment);
  const cta = generateCTA(sentiment, 'news');

  return {
    platform: 'twitter',
    content_text: content,
    hashtags,
    call_to_action: cta.substring(0, 100),
    character_count: (content + ' ' + hashtags).length,
    engagement_tips: 'Keep it punchy. Use specific numbers if available. Ask a question.',
  };
}

/**
 * Format content for Instagram (2200 characters)
 */
export function formatForInstagram(
  title: string,
  content: string,
  sentiment: 'positive' | 'negative' | 'neutral',
  url: string,
  imageCaption?: string
): SocialMediaPost {
  // Instagram strategy: Story + context + CTA + hashtags
  let body = `📰 ${title}\n\n`;

  // Add content excerpt (max 500 chars)
  body += content.substring(0, 500);
  if (content.length > 500) {
    body += '...\n';
  }

  body += `\n\nLink in bio to read more: ${url}`;

  if (imageCaption) {
    body = `${imageCaption}\n\n${body}`;
  }

  const cta = generateCTA(sentiment, 'news');
  const hashtags = generateInstagramHashtags(title, content, sentiment);

  return {
    platform: 'instagram',
    content_text: body,
    hashtags,
    call_to_action: cta,
    character_count: (body + ' ' + hashtags).length,
    engagement_tips:
      'Use emojis strategically. Post during peak hours (9am-5pm). Engage with comments in first hour.',
  };
}

/**
 * Format content for LinkedIn (3000 characters)
 */
export function formatForLinkedIn(
  title: string,
  content: string,
  implications: string[],
  sentiment: 'positive' | 'negative' | 'neutral',
  url: string
): SocialMediaPost {
  // LinkedIn strategy: Professional take + context + implications
  let body = `🔷 ${title}\n\n`;

  body += `${content.substring(0, 300)}...\n\n`;

  body += '**Why this matters:**\n';
  implications.slice(0, 2).forEach((impl) => {
    body += `• ${impl}\n`;
  });

  body += `\n[Read the full analysis →](${url})`;

  const cta = generateCTA(sentiment, 'analysis');
  const hashtags = generateLinkedInHashtags(title, content, sentiment);

  return {
    platform: 'linkedin',
    content_text: body,
    hashtags,
    call_to_action: cta,
    character_count: body.length,
    engagement_tips:
      'Ask for perspectives. Tag relevant organizations. Post during business hours (Tue-Thu 8am-10am).',
  };
}

/**
 * Format content for Telegram (unlimited)
 */
export function formatForTelegram(
  title: string,
  content: string,
  source: string,
  url: string,
  sentiment: 'positive' | 'negative' | 'neutral'
): SocialMediaPost {
  // Telegram strategy: Full story + source + link
  let body = `📰 *${title}*\n\n`;

  body += `${content.substring(0, 400)}\n\n`;

  if (sentiment === 'positive') {
    body += '✅ *Victory for freedom and constitutional rights*\n\n';
  } else if (sentiment === 'negative') {
    body += '⚠️ *Action needed to defend our rights*\n\n';
  }

  body += `📍 Source: ${source}\n`;
  body += `🔗 [Read Full Story](${url})`;

  const cta = generateCTA(sentiment, 'news');
  const hashtags = generateTwitterHashtags(title, content, sentiment);

  return {
    platform: 'telegram',
    content_text: body,
    hashtags,
    call_to_action: cta,
    character_count: body.length,
    engagement_tips: 'Telegram users engage longer. Include full context. Use emoji for clarity.',
  };
}

/**
 * Format content for Discord
 */
export function formatForDiscord(
  title: string,
  content: string,
  keyPoints: string[],
  url: string,
  sentiment: 'positive' | 'negative' | 'neutral'
): SocialMediaPost {
  // Discord strategy: Engaging discussion starter
  let body = `📰 **${title}**\n\n`;

  body += `> ${content.substring(0, 200)}\n\n`;

  body += '**Key Takeaways:**\n';
  keyPoints.slice(0, 3).forEach((point) => {
    body += `• ${point}\n`;
  });

  body += `\n[Full Story](${url})`;

  const cta = generateCTA(sentiment, 'discussion');
  const hashtags = generateTwitterHashtags(title, content, sentiment);

  return {
    platform: 'discord',
    content_text: body,
    hashtags,
    call_to_action: cta,
    character_count: body.length,
    engagement_tips:
      'Discord users value community discussion. Post in relevant channels. React to questions promptly.',
  };
}

/**
 * Generate all platform versions of content
 */
export function generateMultiPlatformContent(
  title: string,
  content: string,
  keyPoints: string[],
  implications: string[],
  sentiment: 'positive' | 'negative' | 'neutral',
  url: string,
  source: string
): Record<string, SocialMediaPost> {
  return {
    twitter: formatForTwitter(title, keyPoints[0] || title, sentiment, url),
    instagram: formatForInstagram(title, content, sentiment, url),
    linkedin: formatForLinkedIn(title, content, implications, sentiment, url),
    telegram: formatForTelegram(title, content, source, url, sentiment),
    discord: formatForDiscord(title, content, keyPoints, url, sentiment),
  };
}
