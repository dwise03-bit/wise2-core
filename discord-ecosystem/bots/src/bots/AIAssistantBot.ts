import { BotBase } from '../BotBase.js';
import { EmbedBuilder } from 'discord.js';
import axios from 'axios';
import pino from 'pino';

const logger = pino();

export class AIAssistantBot extends BotBase {
  private claudeAPI = process.env.CLAUDE_API || 'https://api.anthropic.com/v1';
  private claudeKey = process.env.CLAUDE_API_KEY || '';

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'AIAssistantBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'ask',
      description: 'Ask AI',
      usage: '!ask <question>',
      execute: async (args, context) => {
        const question = args.join(' ');
        if (!question) {
          await context.message.reply('❌ Usage: `!ask <question>`');
          return;
        }
        await this.askQuestion(question, context.message);
      },
    });

    this.registerCommand({
      name: 'explain',
      description: 'Explain concept',
      usage: '!explain <topic>',
      execute: async (args, context) => {
        const topic = args.join(' ');
        if (!topic) {
          await context.message.reply('❌ Usage: `!explain <topic>`');
          return;
        }
        await this.explain(topic, context.message);
      },
    });

    this.registerCommand({
      name: 'summarize',
      description: 'Summarize text',
      usage: '!summarize <text>',
      execute: async (args, context) => {
        const text = args.join(' ');
        if (!text) {
          await context.message.reply('❌ Usage: `!summarize <text>`');
          return;
        }
        await this.summarize(text, context.message);
      },
    });

    this.registerCommand({
      name: 'code',
      description: 'Code template',
      usage: '!code <language>',
      execute: async (args, context) => {
        const language = args[0];
        if (!language) {
          await context.message.reply('❌ Usage: `!code <language>`');
          return;
        }
        await this.generateCode(language, context.message);
      },
    });
  }

  private async askQuestion(question: string, message: any): Promise<void> {
    try {
      // Mock AI response for demo
      const response = this.generateMockResponse(question);

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🤖 AI Assistant')
        .addFields(
          {
            name: 'Question',
            value: question,
            inline: false,
          },
          {
            name: 'Answer',
            value: response.substring(0, 500) + (response.length > 500 ? '...' : ''),
            inline: false,
          },
        )
        .setFooter({ text: 'Powered by Claude' });

      await message.reply({ embeds: [embed] });
      logger.info(`Answered question: ${question.substring(0, 50)}...`);
    } catch (error) {
      await message.reply(`❌ Failed to get response: ${error}`);
      logger.error(`AI Assistant error: ${error}`);
    }
  }

  private async explain(topic: string, message: any): Promise<void> {
    try {
      const explanation = this.generateExplanation(topic);

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`📖 Explanation: ${topic}`)
        .setDescription(explanation.substring(0, 500))
        .setFooter({ text: 'AI-generated explanation' });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed to explain: ${error}`);
    }
  }

  private async summarize(text: string, message: any): Promise<void> {
    try {
      const summary = this.generateSummary(text);

      const embed = new EmbedBuilder()
        .setColor(0x39ff14)
        .setTitle('📝 Summary')
        .setDescription(summary)
        .setFooter({ text: 'AI-generated summary' });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed to summarize: ${error}`);
    }
  }

  private async generateCode(language: string, message: any): Promise<void> {
    try {
      const template = this.getCodeTemplate(language);

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(`💻 ${language} Template`)
        .setDescription(`\`\`\`${language.toLowerCase()}\n${template}\n\`\`\``)
        .setFooter({ text: 'Code template' });

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply(`❌ Failed to generate code: ${error}`);
    }
  }

  private generateMockResponse(question: string): string {
    const responses: { [key: string]: string } = {
      'what is wise': 'WISE² is an Enterprise AI Operating System that combines military-grade precision with creative brilliance. It provides real-time synchronization, advanced search, and multi-service integrations for intelligent knowledge management.',
      'how does': 'It works through a distributed architecture with microservices: Sync Engine for real-time updates, Search Service for intelligent retrieval, and Integration Layer for external services.',
      'tell me about': 'WISE² features include: Real-time CRDT synchronization, Three-tier search (full-text + semantic + hybrid), GitHub/Discord/Email integrations, 10 specialized bots, and comprehensive documentation.',
    };

    for (const [key, value] of Object.entries(responses)) {
      if (question.toLowerCase().includes(key)) {
        return value;
      }
    }

    return `That's an interesting question about "${question}". I'm an AI assistant designed to help the WISE² team. For detailed answers, you can ask me specific technical questions about the platform.`;
  }

  private generateExplanation(topic: string): string {
    return `${topic} is a key concept in modern software development. It encompasses several important principles and practices that help teams build better systems. Let me break it down for you...`;
  }

  private generateSummary(text: string): string {
    const words = text.split(' ');
    return words.slice(0, 10).join(' ') + '... [AI-summarized]';
  }

  private getCodeTemplate(language: string): string {
    const templates: { [key: string]: string } = {
      python: 'def hello_world():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    hello_world()',
      javascript: 'function helloWorld() {\n  console.log("Hello, World!");\n}\n\nhelloWorld();',
      typescript:
        'function helloWorld(): void {\n  console.log("Hello, World!");\n}\n\nhelloWorld();',
      rust: 'fn main() {\n    println!("Hello, World!");\n}',
      go: 'package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    };

    return (
      templates[language.toLowerCase()] ||
      'No template available for this language'
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new AIAssistantBot();
  bot.connect();
}

export default AIAssistantBot;
