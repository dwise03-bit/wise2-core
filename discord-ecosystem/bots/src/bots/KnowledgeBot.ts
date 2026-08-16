import { BotBase } from '../BotBase.js';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import pino from 'pino';

const logger = pino();

export class KnowledgeBot extends BotBase {
  private vaultAPI = process.env.VAULT_API || 'http://localhost:3002';

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'KnowledgeBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'search',
      description: 'Search vault',
      usage: '!search <query>',
      execute: async (args, context) => {
        const query = args.join(' ');
        if (!query) {
          await context.message.reply('❌ Usage: `!search <query>`');
          return;
        }
        await this.search(query, context.message);
      },
    });

    this.registerCommand({
      name: 'wiki',
      description: 'Look up wiki',
      usage: '!wiki <topic>',
      execute: async (args, context) => {
        const topic = args.join(' ');
        if (!topic) {
          await context.message.reply('❌ Usage: `!wiki <topic>`');
          return;
        }
        await this.searchWiki(topic, context.message);
      },
    });

    this.registerCommand({
      name: 'docs',
      description: 'Fetch documentation',
      usage: '!docs <doc>',
      execute: async (args, context) => {
        const doc = args.join(' ');
        if (!doc) {
          await context.message.reply('❌ Usage: `!docs <document>`');
          return;
        }
        await this.fetchDocs(doc, context.message);
      },
    });

    this.registerCommand({
      name: 'faq',
      description: 'Show FAQ',
      usage: '!faq <question>',
      execute: async (args, context) => {
        const question = args.join(' ');
        if (!question) {
          await context.message.reply('❌ Usage: `!faq <question>`');
          return;
        }
        await this.searchFAQ(question, context.message);
      },
    });
  }

  private async search(query: string, message: any): Promise<void> {
    try {
      const response = await axios.get(`${this.vaultAPI}/api/search`, {
        params: { q: query, limit: 5 },
      });

      const results = response.data.results || [];

      if (results.length === 0) {
        await message.reply(
          `📚 No results found for "${query}". Try another search term.`,
        );
        return;
      }

      const fields = results.slice(0, 5).map((result: any) => ({
        name: `📄 ${result.title} (${result.folder})`,
        value: `${result.content.substring(0, 100)}...`,
        inline: false,
      }));

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`📚 Search Results for "${query}"`)
        .addFields(...fields)
        .setFooter({ text: `Found ${results.length} results` });

      await message.reply({ embeds: [embed] });
      logger.info(`Knowledge search: ${query} (${results.length} results)`);
    } catch (error) {
      await message.reply(`❌ Search failed: ${error}`);
      logger.error(`Knowledge search error: ${error}`);
    }
  }

  private async searchWiki(topic: string, message: any): Promise<void> {
    try {
      const response = await axios.get(`${this.vaultAPI}/api/search`, {
        params: { q: topic, limit: 3 },
      });

      const results = response.data.results || [];
      const wikiResults = results.filter((r: any) => r.folder === 'DOCUMENTATION');

      if (wikiResults.length === 0) {
        await message.reply(`📖 No wiki entries found for "${topic}"`);
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(0x39ff14)
        .setTitle(`📖 Wiki: ${topic}`)
        .setDescription(wikiResults[0].content.substring(0, 200) + '...');

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Wiki search failed: ${error}`);
    }
  }

  private async fetchDocs(doc: string, message: any): Promise<void> {
    try {
      const response = await axios.get(`${this.vaultAPI}/api/search`, {
        params: { q: doc, limit: 1 },
      });

      const results = response.data.results || [];

      if (results.length === 0) {
        await message.reply(`📖 No documentation found for "${doc}"`);
        return;
      }

      const result = results[0];
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(result.title)
        .setDescription(result.content.substring(0, 500))
        .setFooter({ text: `Folder: ${result.folder}` });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Docs fetch failed: ${error}`);
    }
  }

  private async searchFAQ(question: string, message: any): Promise<void> {
    try {
      const response = await axios.get(`${this.vaultAPI}/api/search`, {
        params: { q: question, limit: 1 },
      });

      const results = response.data.results || [];

      if (results.length === 0) {
        await message.reply(
          `❓ No FAQ entries found. Try asking in #general or @-mention a Lead.`,
        );
        return;
      }

      const result = results[0];
      const embed = new EmbedBuilder()
        .setColor(0x00cc00)
        .setTitle(`❓ ${result.title}`)
        .setDescription(result.content)
        .setFooter({ text: 'Found in FAQs' });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ FAQ search failed: ${error}`);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new KnowledgeBot();
  bot.connect();
}

export default KnowledgeBot;
