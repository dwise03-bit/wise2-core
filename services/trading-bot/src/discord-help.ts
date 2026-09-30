import { EmbedBuilder } from 'discord.js';

export const helpPages = [
  new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('📚 Trading Bot Help - Page 1/4')
    .setDescription('Getting Started with WISE² Trading Bot')
    .addFields(
      { name: '🚀 Quick Start', value: '`!analyze BTC` - Start with a quick analysis' },
      { name: '📊 View Portfolio', value: '`!portfolio` - See your positions and P&L' },
      { name: '💼 Manage Alerts', value: '`!alerts` - View and manage price alerts' },
      { name: '🔔 Set Alert', value: '`!alert add BTC 50000 above` - Create price alert' }
    )
    .setFooter({ text: 'Page 1/4 • Use reactions to navigate' }),

  new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('📊 Trading Bot Help - Page 2/4')
    .setDescription('Advanced Analysis Commands')
    .addFields(
      { name: '📈 Full Analysis', value: '`!analyze <symbol>` - Technical analysis with patterns' },
      { name: '🔍 Chart Patterns', value: '`!patterns <symbol>` - Detect H&S, Double Top, Triangles' },
      { name: '📊 Volume Profile', value: '`!volume <symbol>` - Volume analysis & trends' },
      { name: '📍 Levels', value: '`!levels <symbol>` - Support & resistance detection' },
      { name: '📈 Trend Strength', value: '`!trend <symbol>` - ADX trend meter' }
    )
    .setFooter({ text: 'Page 2/4' }),

  new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('🔔 Trading Bot Help - Page 3/4')
    .setDescription('Automation & Notifications')
    .addFields(
      { name: '🤖 Auto-Track', value: '`!autotrack BTC 4h` - Track symbol + Fibonacci alerts' },
      { name: '📅 Schedule Reports', value: '`!schedule enable daily` - Daily market summary' },
      { name: '👥 Follow Traders', value: '`!follow username` - Follow another trader' },
      { name: '📋 Auto-Copy', value: '`!autocopy enable` - Mirror followed traders\' trades' },
      { name: '👀 Community Feed', value: '`!community-feed` - See followed traders\' trades' }
    )
    .setFooter({ text: 'Page 3/4' }),

  new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('⚙️ Trading Bot Help - Page 4/4')
    .setDescription('Settings & Configuration')
    .addFields(
      { name: '🎯 API Access', value: 'GET `/api/trading/portfolio` - Portfolio data' },
      { name: '📊 Dashboard', value: 'GET `/api/trading/positions` - Open positions' },
      { name: '📈 Stats', value: 'GET `/api/trading/stats` - Account statistics' },
      { name: '🔗 Integration', value: 'All endpoints return JSON for app integration' },
      { name: '💬 Support', value: 'React with ❓ for more help in any channel' }
    )
    .setFooter({ text: 'Page 4/4 • All pages available via reactions' })
];

export default helpPages;
