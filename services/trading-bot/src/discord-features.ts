/**
 * Advanced Discord Features for Trading Bot
 * Slash commands, embeds, buttons, and interactive components
 */

import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// ========================
// SLASH COMMANDS
// ========================

export const slashCommands = [
  // Trading Analysis
  new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Full technical analysis of a symbol')
    .addStringOption(option =>
      option.setName('symbol').setDescription('Trading symbol (e.g., BTC, ETH)').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('timeframe').setDescription('Chart timeframe').setRequired(false)
    ),

  // Portfolio Management
  new SlashCommandBuilder()
    .setName('portfolio')
    .setDescription('View your portfolio and positions'),

  // Price Alerts
  new SlashCommandBuilder()
    .setName('alerts')
    .setDescription('Manage price alerts and notifications'),

  // Trade Signals
  new SlashCommandBuilder()
    .setName('signals')
    .setDescription('View active trading signals'),

  // Leaderboard
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View top traders and performance stats'),

  // Settings
  new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Configure bot notifications and preferences'),

  // Help
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help with bot commands')
];

// ========================
// EMBED BUILDERS
// ========================

export function createSignalEmbed(symbol: string, signal: string, confidence: number) {
  return new EmbedBuilder()
    .setColor(signal === 'BUY' ? 0x00FF7F : 0xFF1744)
    .setTitle(`📊 Trading Signal: ${symbol}`)
    .addFields(
      { name: 'Signal', value: signal, inline: true },
      { name: 'Confidence', value: `${confidence}%`, inline: true },
      { name: 'Timestamp', value: new Date().toISOString(), inline: false }
    )
    .setFooter({ text: 'wise2 Sjs trading#4150' });
}

export function createPortfolioEmbed(equity: number, pnl: number, winRate: number) {
  return new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('💼 Portfolio Summary')
    .addFields(
      { name: 'Total Equity', value: `$${equity.toFixed(2)}`, inline: true },
      { name: 'P&L', value: `${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`, inline: true },
      { name: 'Win Rate', value: `${winRate}%`, inline: true },
      { name: 'Last Updated', value: new Date().toLocaleString(), inline: false }
    )
    .setFooter({ text: 'Real-time portfolio data' });
}

export function createAlertEmbed(symbol: string, price: number, type: string) {
  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle(`🚨 Price Alert: ${symbol}`)
    .addFields(
      { name: 'Alert Type', value: type.toUpperCase(), inline: true },
      { name: 'Price Level', value: `$${price}`, inline: true },
      { name: 'Current Price', value: 'Fetching...', inline: true }
    )
    .setFooter({ text: 'Alert triggered at ' + new Date().toLocaleTimeString() });
}

export function createLeaderboardEmbed(traders: Array<{name: string, winRate: number, pnl: number}>) {
  const leaderboard = traders
    .slice(0, 10)
    .map((t, i) => `${i + 1}. ${t.name}: ${t.winRate}% WR | ${t.pnl > 0 ? '+' : ''}$${t.pnl}`)
    .join('\n');

  return new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('🏆 Top Traders Leaderboard')
    .setDescription(leaderboard)
    .setFooter({ text: 'Updated every 5 minutes' });
}

// ========================
// BUTTON COMPONENTS
// ========================

export function createTradeButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('trade_buy')
        .setLabel('📈 Buy')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('trade_sell')
        .setLabel('📉 Sell')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('trade_close')
        .setLabel('❌ Close')
        .setStyle(ButtonStyle.Secondary)
    );
}

export function createAlertButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('alert_create')
        .setLabel('➕ Create Alert')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('alert_view')
        .setLabel('👁️ View All')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('alert_dismiss')
        .setLabel('🗑️ Dismiss')
        .setStyle(ButtonStyle.Danger)
    );
}

export function createSettingsButtons() {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('settings_notifications')
        .setLabel('🔔 Notifications')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('settings_risk')
        .setLabel('⚠️ Risk')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('settings_alerts')
        .setLabel('📊 Alerts')
        .setStyle(ButtonStyle.Secondary)
    );
}

// ========================
// NOTIFICATION TEMPLATES
// ========================

export function createTradeNotification(symbol: string, direction: string, entry: number, quantity: number) {
  return new EmbedBuilder()
    .setColor(direction === 'LONG' ? 0x00FF7F : 0xFF1744)
    .setTitle(`🔔 ${direction} Position Opened`)
    .addFields(
      { name: 'Symbol', value: symbol, inline: true },
      { name: 'Entry Price', value: `$${entry}`, inline: true },
      { name: 'Quantity', value: quantity.toString(), inline: true },
      { name: 'Time', value: new Date().toLocaleTimeString(), inline: false }
    )
    .setFooter({ text: 'Position opened via wise2 Sjs trading' });
}

export function createPriceAlertNotification(symbol: string, currentPrice: number, alertLevel: number) {
  const direction = currentPrice > alertLevel ? '↑ Above' : '↓ Below';
  
  return new EmbedBuilder()
    .setColor(currentPrice > alertLevel ? 0x00FF7F : 0xFF1744)
    .setTitle(`⚡ Price Alert: ${symbol}`)
    .addFields(
      { name: 'Current Price', value: `$${currentPrice}`, inline: true },
      { name: 'Alert Level', value: `$${alertLevel}`, inline: true },
      { name: 'Status', value: `${direction} Alert Level`, inline: false }
    )
    .setFooter({ text: 'Alert triggered by wise2 trading bot' });
}

// ========================
// STATUS MESSAGES
// ========================

export function createStatusEmbed(botStatus: string, tradingStatus: string, alertsActive: number) {
  return new EmbedBuilder()
    .setColor(0x00D9FF)
    .setTitle('✅ System Status')
    .addFields(
      { name: 'Bot Status', value: botStatus, inline: true },
      { name: 'Trading Engine', value: tradingStatus, inline: true },
      { name: 'Active Alerts', value: alertsActive.toString(), inline: true },
      { name: 'Uptime', value: 'Continuous', inline: false }
    )
    .setTimestamp();
}

export default {
  slashCommands,
  createSignalEmbed,
  createPortfolioEmbed,
  createAlertEmbed,
  createLeaderboardEmbed,
  createTradeButtons,
  createAlertButtons,
  createSettingsButtons,
  createTradeNotification,
  createPriceAlertNotification,
  createStatusEmbed
};
