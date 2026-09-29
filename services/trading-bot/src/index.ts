import { Client, GatewayIntentBits, ChannelType } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { TradingBotService } from './services/trading-bot-service';
import { DiscordCommandHandler } from './handlers/command-handler';
import { ChartService } from './services/chart-service';
import { PriceDataService } from './services/price-data-service';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const prisma = new PrismaClient();

let tradingBotService: TradingBotService;
let commandHandler: DiscordCommandHandler;
let priceDataService: PriceDataService;
let chartService: ChartService;

client.once('ready', async () => {
  console.log(`✅ Bot online as ${client.user?.tag}`);

  // Initialize services
  priceDataService = new PriceDataService();
  chartService = new ChartService();
  tradingBotService = new TradingBotService(client, priceDataService, chartService, prisma);
  commandHandler = new DiscordCommandHandler(tradingBotService, chartService);

  // Start polling for price updates
  tradingBotService.startPricePolling();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Handle commands
  if (message.content.startsWith('!')) {
    try {
      await commandHandler.handle(message);
    } catch (error) {
      console.error('Command error:', error);
      await message.reply('❌ An error occurred processing your command.');
    }
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  tradingBotService.destroy();
  await prisma.$disconnect();
  await client.destroy();
  process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

export { client, tradingBotService, commandHandler, prisma };
