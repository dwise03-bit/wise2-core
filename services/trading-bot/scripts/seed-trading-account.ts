/**
 * Seed script: Initialize trading account for development
 * Run: npx ts-node scripts/seed-trading-account.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding trading account...');

    // Create or get test user
    const testUser = await prisma.user.upsert({
      where: { email: 'trader@wise2.local' },
      update: {},
      create: {
        email: 'trader@wise2.local',
        name: 'Test Trader',
        passwordHash: 'hashed_password_placeholder',
      },
    });

    console.log(`✅ User ready: ${testUser.email}`);

    // Create trading account
    const tradingAccount = await prisma.tradingAccount.upsert({
      where: { userId: testUser.id },
      update: {},
      create: {
        userId: testUser.id,
        accountName: 'Paper Trading Account',
        accountType: 'PAPER',
        paperEquity: 10000,
        riskPerTrade: 2.0,
        maxDailyLoss: 500,
        maxConsecutiveLosses: 3,
        maxOpenPositions: 5,
        isActive: true,
      },
    });

    console.log(`✅ Trading account created: ${tradingAccount.accountName}`);

    // Create default watchlist
    const defaultSymbols = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'];
    for (const symbol of defaultSymbols) {
      await prisma.watchlist.upsert({
        where: {
          accountId_symbol: {
            accountId: tradingAccount.id,
            symbol,
          },
        },
        update: {},
        create: {
          accountId: tradingAccount.id,
          name: symbol,
          symbol,
          price: 0,
        },
      });
    }

    console.log(`✅ Watchlist seeded with ${defaultSymbols.length} symbols`);

    // Create default strategy
    const strategy = await prisma.strategy.upsert({
      where: {
        accountId_name: {
          accountId: tradingAccount.id,
          name: 'Liquidity Sweep',
        },
      },
      update: {},
      create: {
        accountId: tradingAccount.id,
        name: 'Liquidity Sweep',
        description: 'Trading liquidity sweeps at Fibonacci levels',
        setupType: 'LIQUIDITY_SWEEP',
        minConfidence: 0.75,
        isActive: true,
      },
    });

    console.log(`✅ Strategy created: ${strategy.name}`);

    // Create risk policy
    await prisma.riskPolicy.upsert({
      where: {
        accountId_name: {
          accountId: tradingAccount.id,
          name: 'Daily Loss Limit',
        },
      },
      update: {},
      create: {
        accountId: tradingAccount.id,
        name: 'Daily Loss Limit',
        policyType: 'DAILY_LOSS',
        threshold: 500,
        isActive: true,
      },
    });

    console.log(`✅ Risk policy created`);

    console.log('\n🎉 Seed completed successfully!');
    console.log(`\nAccount Details:`);
    console.log(`  User ID: ${testUser.id}`);
    console.log(`  Account ID: ${tradingAccount.id}`);
    console.log(`  Initial Equity: $${tradingAccount.paperEquity}`);
    console.log(`  Risk per Trade: ${tradingAccount.riskPerTrade}%`);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
