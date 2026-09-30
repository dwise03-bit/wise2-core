import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { TradingBotService } from './services/trading-bot-service';
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

let tradingBotService: TradingBotService;

client.once('ready', async () => {
  console.log(`✅ Bot online as ${client.user?.tag}`);
  console.log(`📍 Initializing services...`);

  // Initialize services
  const priceDataService = new PriceDataService();
  const chartService = new ChartService();

  // Initialize trading bot service
  tradingBotService = new TradingBotService(client, priceDataService, chartService);
  tradingBotService.startPricePolling();

  console.log(`🎉 Trading bot ready!`);
  console.log(`📊 Price polling started`);
  console.log(`💬 Listening for commands...`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Basic response for now
  if (message.content === '!ping') {
    await message.reply('🏓 Pong!');
  }
  if (message.content === '!status') {
    await message.reply('✅ Bot is online and monitoring prices');
  }
});

client.on('error', (error) => {
  console.error('Discord error:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  if (tradingBotService) tradingBotService.destroy();
  await client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);

export { client, tradingBotService, commandHandler, prisma };
