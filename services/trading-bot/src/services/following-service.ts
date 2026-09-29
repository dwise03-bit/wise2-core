import { PrismaClient } from '@prisma/client';
import { Client, User as DiscordUser, EmbedBuilder } from 'discord.js';

export interface TraderProfile {
  userId: string;
  userName: string;
  discordId: string;
  totalTrades: number;
  winRate: number;
  totalPL: number;
  followers: number;
  following: number;
}

export interface TradeNotification {
  trader: TraderProfile;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  targetPrice: number;
  stopPrice: number;
  riskReward: number;
  timestamp: Date;
}

/**
 * FollowingService: Manage social trading (following traders, mirroring trades)
 */
export class FollowingService {
  private prisma: PrismaClient;
  private discordClient: Client;

  constructor(prisma: PrismaClient, discordClient: Client) {
    this.prisma = prisma;
    this.discordClient = discordClient;
  }

  /**
   * Follow a trader
   */
  async followTrader(followerId: string, followingId: string, notifyOnEntry: boolean = true): Promise<boolean> {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    try {
      await this.prisma.traderFollower.create({
        data: {
          followerId,
          followingId,
          notifyOnEntry,
          notifyOnExit: notifyOnEntry,
        },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Already following this trader');
      }
      throw error;
    }
  }

  /**
   * Unfollow a trader
   */
  async unfollowTrader(followerId: string, followingId: string): Promise<boolean> {
    const result = await this.prisma.traderFollower.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });
    return result.count > 0;
  }

  /**
   * Get followers list
   */
  async getFollowers(userId: string): Promise<TraderProfile[]> {
    const followers = await this.prisma.traderFollower.findMany({
      where: { followingId: userId },
      include: { follower: true },
    });

    return Promise.all(
      followers.map((f: any) => this.buildTraderProfile(f.follower.id))
    );
  }

  /**
   * Get following list
   */
  async getFollowing(userId: string): Promise<TraderProfile[]> {
    const following = await this.prisma.traderFollower.findMany({
      where: { followerId: userId },
      include: { following: true },
    });

    return Promise.all(
      following.map((f: any) => this.buildTraderProfile(f.following.id))
    );
  }

  /**
   * Build trader profile
   */
  private async buildTraderProfile(userId: string): Promise<TraderProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tradingAccount: {
          include: {
            trades: true,
          },
        },
        followers: true,
        following: true,
      },
    });

    if (!user) throw new Error(`User not found: ${userId}`);

    const trades = user.tradingAccount?.trades || [];
    const closedTrades = trades.filter((t: any) => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter((t: any) => (t.profitLoss || 0) > 0);
    const totalPL = closedTrades.reduce((sum: number, t: any) => sum + (t.profitLoss || 0), 0);

    return {
      userId: user.id,
      userName: user.name || user.email,
      discordId: user.email, // Use email as proxy for Discord ID for now
      totalTrades: closedTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPL,
      followers: user.followers.length,
      following: user.following.length,
    };
  }

  /**
   * Broadcast trade to followers
   */
  async broadcastTrade(
    traderId: string,
    discordUserId: string,
    symbol: string,
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    targetPrice: number,
    stopPrice: number,
    riskReward: number
  ) {
    try {
      const trader = await this.buildTraderProfile(traderId);
      const followers = await this.prisma.traderFollower.findMany({
        where: {
          followingId: traderId,
          notifyOnEntry: true,
        },
        include: { follower: true },
      });

      for (const follower of followers) {
        await this.notifyFollower(
          follower.follower.email,
          trader,
          symbol,
          direction,
          entryPrice,
          targetPrice,
          stopPrice,
          riskReward
        );
      }
    } catch (error) {
      console.error(`Error broadcasting trade for ${traderId}:`, error);
    }
  }

  /**
   * Notify a follower of a trade via Discord DM
   */
  private async notifyFollower(
    followerEmail: string,
    trader: TraderProfile,
    symbol: string,
    direction: 'LONG' | 'SHORT',
    entryPrice: number,
    targetPrice: number,
    stopPrice: number,
    riskReward: number
  ) {
    try {
      // Try to find Discord user by email (this is simplified - in production, map Discord ID properly)
      const users = await this.discordClient.users.fetch(followerEmail).catch(() => null);

      if (!users) {
        console.log(`Could not find Discord user for ${followerEmail}`);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`📢 ${trader.userName} opened a trade!`)
        .setColor(direction === 'LONG' ? 0x00ff00 : 0xff0000)
        .addFields(
          { name: 'Trader', value: trader.userName, inline: true },
          { name: 'Win Rate', value: `${trader.winRate.toFixed(1)}%`, inline: true },
          { name: 'Symbol', value: symbol, inline: true },
          { name: 'Direction', value: `${direction === 'LONG' ? '📈 LONG' : '📉 SHORT'}`, inline: true },
          { name: 'Entry', value: `$${entryPrice.toFixed(2)}`, inline: true },
          { name: 'Target', value: `$${targetPrice.toFixed(2)}`, inline: true },
          { name: 'Stop Loss', value: `$${stopPrice.toFixed(2)}`, inline: true },
          { name: 'R:R', value: `${riskReward.toFixed(2)}:1`, inline: true }
        )
        .setFooter({ text: 'React 👍 to copy this trade' })
        .setTimestamp();

      // This would require user permission to DM, so log instead for now
      console.log(`[Trade Notification] ${followerEmail}: ${trader.userName} ${direction} ${symbol}`);
    } catch (error) {
      console.error(`Error notifying follower ${followerEmail}:`, error);
    }
  }

  /**
   * Check if user follows another
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.traderFollower.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return !!follow;
  }

  /**
   * Enable auto-copy trading
   */
  async enableAutoCopy(followerId: string, followingId: string, riskScale: number = 1.0): Promise<boolean> {
    try {
      await this.prisma.traderFollower.update({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
        data: {
          autoCopyTrades: true,
          riskScaleFactor: riskScale,
        },
      });
      return true;
    } catch (error) {
      console.error('Error enabling auto-copy:', error);
      return false;
    }
  }

  /**
   * Disable auto-copy trading
   */
  async disableAutoCopy(followerId: string, followingId: string): Promise<boolean> {
    try {
      await this.prisma.traderFollower.update({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
        data: {
          autoCopyTrades: false,
        },
      });
      return true;
    } catch (error) {
      console.error('Error disabling auto-copy:', error);
      return false;
    }
  }
}
