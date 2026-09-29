import { Message, EmbedBuilder, User as DiscordUser } from 'discord.js';
import { FollowingService } from '../services/following-service';

/**
 * Social trading commands: follow traders, view followers, community feed
 */
export class SocialCommands {
  constructor(private followingService: FollowingService) {}

  /**
   * !follow <username> - Follow another trader
   */
  async handleFollow(message: Message, args: string[]): Promise<void> {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!follow <username>`\nExample: `!follow john_trader`');
      return;
    }

    const targetUserName = args[0];

    try {
      // In production, resolve Discord username to user ID
      // For now, we'll use a placeholder
      const followingId = targetUserName; // Would resolve from Discord

      const isFollowing = await this.followingService.isFollowing(message.author.id, followingId);
      if (isFollowing) {
        await message.reply(`✅ You're already following **${targetUserName}**`);
        return;
      }

      await this.followingService.followTrader(message.author.id, followingId);

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`✅ Following ${targetUserName}`)
        .setDescription(`You'll now receive notifications when ${targetUserName} opens trades.`)
        .addFields(
          { name: 'Notifications', value: 'Entry & Exit alerts enabled', inline: true },
          { name: 'Auto-Copy', value: 'Disabled (use `!autocopy enable` to enable)', inline: true }
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !unfollow <username> - Unfollow a trader
   */
  async handleUnfollow(message: Message, args: string[]): Promise<void> {
    if (args.length === 0) {
      await message.reply('❌ Usage: `!unfollow <username>`');
      return;
    }

    const targetUserName = args[0];

    try {
      const followingId = targetUserName;
      const success = await this.followingService.unfollowTrader(message.author.id, followingId);

      if (success) {
        await message.reply(`✅ Unfollowed **${targetUserName}**`);
      } else {
        await message.reply(`❌ You're not following **${targetUserName}**`);
      }
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !followers - Show who's following you
   */
  async handleFollowers(message: Message): Promise<void> {
    try {
      const followers = await this.followingService.getFollowers(message.author.id);

      if (followers.length === 0) {
        await message.reply('📊 No one is following you yet');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`👥 Your Followers (${followers.length})`)
        .setDescription(
          followers
            .map(
              (f) =>
                `**${f.userName}** • ${f.totalTrades} trades • ${f.winRate.toFixed(1)}% win rate • ${f.totalPL > 0 ? '+' : ''}$${f.totalPL.toFixed(2)}`
            )
            .join('\n')
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !following - Show who you're following
   */
  async handleFollowing(message: Message): Promise<void> {
    try {
      const following = await this.followingService.getFollowing(message.author.id);

      if (following.length === 0) {
        await message.reply('📊 You\'re not following anyone yet. Use `!follow <username>` to get started');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`👤 Following (${following.length})`)
        .setDescription(
          following
            .map(
              (f) =>
                `**${f.userName}** • ${f.totalTrades} trades • ${f.winRate.toFixed(1)}% win rate • ${f.totalPL > 0 ? '+' : ''}$${f.totalPL.toFixed(2)}`
            )
            .join('\n')
        )
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !community-feed - Show trades from followers
   */
  async handleCommunityFeed(message: Message): Promise<void> {
    try {
      const following = await this.followingService.getFollowing(message.author.id);

      if (following.length === 0) {
        await message.reply('📊 Follow traders to see their trades in your feed. Use `!follow <username>`');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`📰 Community Feed`)
        .setDescription(
          `Tracking ${following.length} traders. Trades appear automatically when they enter positions.`
        )
        .addFields(
          ...following.slice(0, 10).map((f) => ({
            name: f.userName,
            value: `${f.totalTrades} trades • ${f.winRate.toFixed(1)}% WR • ${f.totalPL > 0 ? '+' : ''}$${f.totalPL.toFixed(2)}`,
            inline: true,
          }))
        )
        .setFooter({ text: 'New trades appear in real-time' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }

  /**
   * !autocopy <enable|disable> <username> [riskScale] - Auto-copy trades
   */
  async handleAutoCopy(message: Message, args: string[]): Promise<void> {
    if (args.length < 2) {
      await message.reply(
        '❌ Usage: `!autocopy <enable|disable> <username> [riskScale]`\nExample: `!autocopy enable john_trader 0.5`'
      );
      return;
    }

    const action = args[0].toLowerCase();
    const targetUserName = args[1];
    const riskScale = args[2] ? parseFloat(args[2]) : 1.0;

    if (!['enable', 'disable'].includes(action)) {
      await message.reply('❌ Use `enable` or `disable`');
      return;
    }

    try {
      const followingId = targetUserName;
      const isFollowing = await this.followingService.isFollowing(message.author.id, followingId);

      if (!isFollowing) {
        await message.reply(`❌ You must follow **${targetUserName}** first. Use \`!follow ${targetUserName}\``);
        return;
      }

      if (action === 'enable') {
        await this.followingService.enableAutoCopy(message.author.id, followingId, riskScale);
        await message.reply(
          `✅ Auto-copying trades from **${targetUserName}** at ${(riskScale * 100).toFixed(0)}% risk scale`
        );
      } else {
        await this.followingService.disableAutoCopy(message.author.id, followingId);
        await message.reply(`✅ Stopped auto-copying trades from **${targetUserName}**`);
      }
    } catch (error: any) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }
}
