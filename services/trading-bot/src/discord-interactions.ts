/**
 * Discord Button & Select Menu Interaction Handlers
 */

import { Interaction, ButtonInteraction, SelectMenuInteraction } from 'discord.js';
import { createPortfolioEmbed, createAlertEmbed, createTradeButtons } from './discord-features';

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  const { customId } = interaction;

  try {
    if (customId === 'trade_buy') {
      await interaction.reply({
        embeds: [createPortfolioEmbed(50000, 1234, 65)],
        components: [createTradeButtons() as any],
        ephemeral: false
      });
    } 
    else if (customId === 'trade_sell') {
      await interaction.reply({
        content: '📉 **Sell Order Placed**\nOrder type: Market Sell\nFilled at current market price.',
        ephemeral: false
      });
    }
    else if (customId === 'trade_close') {
      await interaction.reply({
        content: '❌ **Position Closed**\nP&L: +$234.50\nDuration: 2 hours 15 minutes',
        ephemeral: false
      });
    }
    else if (customId === 'alert_create') {
      await interaction.reply({
        content: '➕ **Create Price Alert**\nUse: `!alert add <symbol> <price> <above|below>`\nExample: `!alert add BTC 50000 above`',
        ephemeral: true
      });
    }
    else if (customId === 'alert_view') {
      await interaction.reply({
        embeds: [createAlertEmbed('BTC', 50000, 'above')],
        ephemeral: false
      });
    }
    else if (customId === 'settings_notifications') {
      await interaction.reply({
        content: '🔔 **Notification Settings**\n✅ Price alerts enabled\n✅ Trade notifications enabled\n✅ Daily reports enabled',
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Button interaction error:', error);
    await interaction.reply({ content: '❌ Error processing interaction', ephemeral: true });
  }
}

export async function handleSelectMenu(interaction: SelectMenuInteraction) {
  try {
    const selected = interaction.values[0];
    
    if (selected === 'view_portfolio') {
      await interaction.reply({
        embeds: [createPortfolioEmbed(50000, 1234, 65)],
        ephemeral: false
      });
    }
    else if (selected === 'create_alert') {
      await interaction.reply({
        content: '➕ Ready to create alert. Use: `!alert add <symbol> <price> <above|below>`',
        ephemeral: true
      });
    }
    else if (selected === 'view_signals') {
      await interaction.reply({
        content: '📊 **Active Trading Signals**\n• BTC: STRONG BUY (94% confidence)\n• ETH: BUY (78% confidence)\n• SOL: NEUTRAL (55% confidence)',
        ephemeral: false
      });
    }
  } catch (error) {
    console.error('Select menu error:', error);
    await interaction.reply({ content: '❌ Error', ephemeral: true });
  }
}

export async function handleInteraction(interaction: Interaction) {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  }
  else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction);
  }
}

export default { handleInteraction, handleButtonInteraction, handleSelectMenu };
