/**
 * Discord Server Manager
 * Channel setup, roles, moderation, community features
 */

import { Client, GuildManager, ChannelType, PermissionFlagsBits } from 'discord.js';

// ========================
// CHANNEL CONFIGURATION
// ========================

export const channelConfig = {
  categories: {
    trading: {
      name: '📊 TRADING',
      channels: [
        { name: 'alerts', type: ChannelType.GuildText, topic: 'Real-time price alerts and signals' },
        { name: 'signals', type: ChannelType.GuildText, topic: 'Active trading signals and analysis' },
        { name: 'positions', type: ChannelType.GuildText, topic: 'Open positions and portfolio updates' },
        { name: 'trades', type: ChannelType.GuildText, topic: 'Trade execution logs and journal' }
      ]
    },
    analysis: {
      name: '📈 ANALYSIS',
      channels: [
        { name: 'bitcoin', type: ChannelType.GuildText, topic: 'BTC analysis and discussions' },
        { name: 'ethereum', type: ChannelType.GuildText, topic: 'ETH analysis and discussions' },
        { name: 'altcoins', type: ChannelType.GuildText, topic: 'Alt coin analysis' },
        { name: 'technical-analysis', type: ChannelType.GuildText, topic: 'Pattern and indicator analysis' }
      ]
    },
    community: {
      name: '👥 COMMUNITY',
      channels: [
        { name: 'announcements', type: ChannelType.GuildAnnouncement, topic: 'Official announcements' },
        { name: 'general', type: ChannelType.GuildText, topic: 'General discussion' },
        { name: 'introductions', type: ChannelType.GuildText, topic: 'New member introductions' },
        { name: 'leaderboard', type: ChannelType.GuildText, topic: 'Top traders and performance' },
        { name: 'achievements', type: ChannelType.GuildText, topic: 'Member achievements and badges' }
      ]
    },
    voice: {
      name: '🎙️ VOICE',
      channels: [
        { name: 'trading-room', type: ChannelType.GuildVoice, bitrate: 128000 },
        { name: 'analysis-room', type: ChannelType.GuildVoice, bitrate: 128000 },
        { name: 'lounge', type: ChannelType.GuildVoice, bitrate: 64000 }
      ]
    },
    resources: {
      name: '📚 RESOURCES',
      channels: [
        { name: 'guides', type: ChannelType.GuildText, topic: 'Trading guides and tutorials' },
        { name: 'api-docs', type: ChannelType.GuildText, topic: 'API documentation' },
        { name: 'roadmap', type: ChannelType.GuildText, topic: 'Feature roadmap and updates' },
        { name: 'faq', type: ChannelType.GuildText, topic: 'Frequently asked questions' }
      ]
    }
  }
};

// ========================
// ROLE CONFIGURATION
// ========================

export const roleConfig = [
  {
    name: '🤖 Bot Admin',
    color: '#00D9FF',
    permissions: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.MuteMembers],
    hoist: true
  },
  {
    name: '💎 Elite Traders',
    color: '#FFD700',
    hoist: true
  },
  {
    name: '📈 Top Performers',
    color: '#00FF7F',
    hoist: true
  },
  {
    name: '🔔 Alert Subscriber',
    color: '#FF6B6B',
    hoist: false
  },
  {
    name: '📊 Analyst',
    color: '#4169E1',
    hoist: false
  },
  {
    name: '👥 Community Member',
    color: '#808080',
    hoist: false
  },
  {
    name: '🆕 Unverified',
    color: '#A9A9A9',
    hoist: false
  }
];

// ========================
// MODERATION RULES
// ========================

export const moderationRules = {
  spam: {
    maxMessagesPerMinute: 5,
    action: 'warn',
    consequences: ['First: Warn', 'Second: Mute 10 min', 'Third: Kick']
  },
  profanity: {
    enabled: true,
    action: 'delete',
    consequences: ['First: Delete + Warn', 'Second: Mute 30 min', 'Third: Kick']
  },
  externalLinks: {
    allowedDomains: ['discord.gg', 'twitter.com', 'reddit.com'],
    action: 'delete',
    requireRole: 'Community Member'
  },
  automoderation: {
    enabled: true,
    keyword_filter: true,
    raid_protection: true,
    spam_protection: true
  }
};

// ========================
// ACHIEVEMENT SYSTEM
// ========================

export const achievements = [
  { name: '🎯 First Trade', description: 'Open your first position' },
  { name: '🔥 Hot Streak', description: 'Win 5 trades in a row' },
  { name: '💰 Profit Master', description: 'Reach 100% return' },
  { name: '⚡ Speed Trader', description: 'Execute 50 trades in a day' },
  { name: '🏆 Top Performer', description: 'Rank in top 10 traders' },
  { name: '🎓 Analyst', description: 'Make 100 analysis posts' },
  { name: '👥 Community Helper', description: 'Help 20 community members' },
  { name: '🚀 All-Star', description: 'Achieve 5 other badges' }
];

// ========================
// WELCOME SYSTEM
// ========================

export function createWelcomeMessage(memberName: string) {
  return `
🎉 **Welcome to WISE² Trading Community, ${memberName}!**

📋 **Quick Setup:**
1. Select your roles in <#roles>
2. Read the #announcements for updates
3. Check #faq for common questions
4. Join a voice channel to trade

🚀 **Get Started:**
\`!help\` - View all available commands
\`!analyze BTC\` - Analyze Bitcoin
\`!portfolio\` - Check your positions

💡 **Community Tips:**
- Share your trades in #trades channel
- Ask questions in #general
- Celebrate wins in #achievements
- Help others succeed

Need help? React with ❓ and a moderator will assist!
`;
}

// ========================
// AUTOMATIC UPDATES
// ========================

export const autoUpdates = {
  priceTickerUpdate: {
    interval: 300000, // 5 minutes
    channels: ['trading', 'alerts'],
    symbols: ['BTC', 'ETH', 'SOL', 'XRP']
  },
  leaderboardUpdate: {
    interval: 3600000, // 1 hour
    channels: ['leaderboard'],
    topN: 10
  },
  dailyReport: {
    time: '09:00 UTC',
    channels: ['announcements'],
    metrics: ['top-traders', 'market-summary', 'alerts-triggered']
  },
  weeklyReport: {
    day: 'Sunday',
    time: '20:00 UTC',
    channels: ['announcements'],
    metrics: ['performance', 'achievements', 'community-stats']
  }
};

// ========================
// CUSTOM EVENTS
// ========================

export const customEvents = {
  tradingTournament: {
    enabled: true,
    duration: '7 days',
    prizePool: 'Recognition + Badges',
    resetDay: 'Monday'
  },
  weeklyChallenge: {
    enabled: true,
    theme: 'Rotates weekly',
    rewards: 'Achievement badges',
    announcement: 'Monday 9 AM UTC'
  },
  liveStreamEvents: {
    enabled: true,
    frequency: 'Weekly',
    platforms: ['YouTube', 'Discord'],
    topics: ['Market Analysis', 'Trading Tips', 'Q&A']
  }
};

// ========================
// WEBHOOK INTEGRATIONS
// ========================

export const webhookConfig = {
  priceAlerts: {
    enabled: true,
    sendTo: 'alerts',
    format: 'Embed'
  },
  tradeNotifications: {
    enabled: true,
    sendTo: 'trades',
    format: 'Rich notification'
  },
  newsFeeds: {
    enabled: true,
    sendTo: 'announcements',
    sources: ['CoinTelegraph', 'Crypto News', 'Market Updates']
  },
  performanceUpdates: {
    enabled: true,
    sendTo: 'leaderboard',
    frequency: 'Hourly'
  }
};

// ========================
// VERIFICATION SYSTEM
// ========================

export const verificationConfig = {
  required: true,
  methods: ['Email', 'Phone', 'Discord'],
  requiredForTrading: true,
  requiredForAlerts: true
};

export default {
  channelConfig,
  roleConfig,
  moderationRules,
  achievements,
  createWelcomeMessage,
  autoUpdates,
  customEvents,
  webhookConfig,
  verificationConfig
};
