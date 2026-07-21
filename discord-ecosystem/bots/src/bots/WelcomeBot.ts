import { BotBase } from '../BotBase.js';
import { ChannelType, EmbedBuilder } from 'discord.js';
import pino from 'pino';

const logger = pino();

export class WelcomeBot extends BotBase {
  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'WelcomeBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'welcome',
      description: 'Show welcome message',
      usage: '!welcome',
      execute: async (args, context) => {
        await this.sendWelcomeMessage(context.message);
      },
    });

    this.registerCommand({
      name: 'rules',
      description: 'Display server rules',
      usage: '!rules',
      execute: async (args, context) => {
        await this.sendRules(context.message);
      },
    });

    this.registerCommand({
      name: 'getstarted',
      description: 'Show getting started guide',
      usage: '!getstarted',
      execute: async (args, context) => {
        await this.sendGettingStarted(context.message);
      },
    });

    this.setupJoinHandler();
  }

  private setupJoinHandler(): void {
    this.client.on('guildMemberAdd', async (member) => {
      logger.info(`New member joined: ${member.user.tag}`);

      // Assign member role
      try {
        const guild = member.guild;
        const memberRole = guild.roles.cache.find((r) => r.name === '@Member');
        if (memberRole) {
          await member.roles.add(memberRole);
          logger.info(`Assigned @Member role to ${member.user.tag}`);
        }
      } catch (error) {
        logger.error(`Failed to assign role: ${error}`);
      }

      // Send welcome DM
      await this.sendWelcomeDM(member);

      // Announce in introductions
      const guild = member.guild;
      const introChannel = guild.channels.cache.find(
        (ch) => ch.name === 'introductions' && ch.type === ChannelType.GuildText,
      );

      if (introChannel) {
        const embed = new EmbedBuilder()
          .setColor(0x39ff14)
          .setTitle('🎉 New Member Joined!')
          .setDescription(`Welcome ${member.user}!`)
          .setThumbnail(member.user.displayAvatarURL())
          .addFields({
            name: 'Member Count',
            value: `${guild.memberCount}`,
            inline: true,
          });

        await (introChannel as any).send({ embeds: [embed] });
      }
    });
  }

  private async sendWelcomeDM(member: any): Promise<void> {
    try {
      const embed = new EmbedBuilder()
        .setColor(0x39ff14)
        .setTitle('🎉 Welcome to WISE²!')
        .setDescription(`Hi ${member.user.username}! 👋`)
        .addFields(
          {
            name: '📋 Server Rules',
            value: '• Be respectful and professional\n• Use threads for long discussions\n• Search before asking\n• Respect channel purposes',
          },
          {
            name: '🚀 Key Channels',
            value: '• #announcements → Important updates\n• #general → Day-to-day chat\n• #introductions → Say hello!\n• #resources → Learning materials',
          },
          {
            name: '🤖 Meet Our Bots',
            value: 'Type `!help` in #bot-commands to see all commands',
          },
          {
            name: '❓ Need Help?',
            value: '• Check #faqs\n• Ask in #general\n• @-mention a Lead',
          },
        )
        .setFooter({ text: 'Welcome to the WISE² team!' });

      await member.send({ embeds: [embed] });
      logger.info(`Sent welcome DM to ${member.user.tag}`);
    } catch (error) {
      logger.error(`Failed to send welcome DM: ${error}`);
    }
  }

  private async sendWelcomeMessage(message: any): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('🎉 Welcome to WISE²!')
      .setDescription('The Organized Chaos Command Center')
      .addFields(
        {
          name: '🏢 What is WISE²?',
          value: 'Enterprise AI Operating System combining military-grade precision with creative brilliance',
        },
        {
          name: '📍 Get Started',
          value: 'Type `!getstarted` for onboarding guide',
        },
        {
          name: '📋 Read the Rules',
          value: 'Type `!rules` to see server guidelines',
        },
      );

    await message.reply({ embeds: [embed] });
  }

  private async sendRules(message: any): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('📋 Server Rules')
      .addFields(
        {
          name: '1️⃣ Be Respectful',
          value: 'Treat all members with respect and professionalism',
        },
        {
          name: '2️⃣ Use Threads',
          value: 'Keep long discussions in threads to avoid clutter',
        },
        {
          name: '3️⃣ Search First',
          value: 'Check #faqs and existing messages before asking',
        },
        {
          name: '4️⃣ Respect Channels',
          value: 'Use channels for their intended purpose',
        },
        {
          name: '5️⃣ No Spam',
          value: 'Avoid excessive messaging, @mentions, or links',
        },
        {
          name: '6️⃣ Professional',
          value: 'Keep content work-appropriate',
        },
      );

    await message.reply({ embeds: [embed] });
  }

  private async sendGettingStarted(message: any): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('🚀 Getting Started Guide')
      .addFields(
        {
          name: '📍 Step 1: Read the Rules',
          value: 'Type `!rules` to understand community guidelines',
        },
        {
          name: '💼 Step 2: Explore Channels',
          value: 'Check out #general, #announcements, and category channels',
        },
        {
          name: '🤖 Step 3: Learn the Bots',
          value: 'Type `!help` in #bot-commands for bot documentation',
        },
        {
          name: '👥 Step 4: Introduce Yourself',
          value: 'Post in #introductions to say hi!',
        },
        {
          name: '📚 Step 5: Find Resources',
          value: 'Check #resources and #wiki for documentation',
        },
        {
          name: '❓ Step 6: Ask Questions',
          value: 'Use #general or @-mention a Lead if you need help',
        },
      )
      .setFooter({ text: 'Welcome aboard! 🎉' });

    await message.reply({ embeds: [embed] });
  }
}

// Start bot if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new WelcomeBot();
  bot.connect();
}

export default WelcomeBot;
