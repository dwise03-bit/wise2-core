#!/usr/bin/env node

/**
 * Setup WISE² Customer Service Channels
 * Creates all support, feedback, and customer service channels
 */

require("dotenv").config();
const { Client, GatewayIntentBits, ChannelType, PermissionFlagsBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const SUPPORT_CHANNELS = [
  {
    name: "💬-support",
    description: "Customer support tickets and inquiries",
    topic: "Open support tickets here",
    position: 0,
  },
  {
    name: "🎫-tickets",
    description: "Support ticket tracking",
    topic: "Active support tickets",
    position: 1,
  },
  {
    name: "❓-faq",
    description: "Frequently asked questions",
    topic: "Common questions and answers",
    position: 2,
  },
  {
    name: "🐛-bug-reports",
    description: "Bug reports and issues",
    topic: "Report bugs and technical issues",
    position: 3,
  },
  {
    name: "💡-feature-requests",
    description: "Feature requests and suggestions",
    topic: "Suggest new features and improvements",
    position: 4,
  },
  {
    name: "📧-contact-us",
    description: "Contact customer service",
    topic: "Get in touch with our team",
    position: 5,
  },
  {
    name: "📚-knowledge-base",
    description: "Documentation and guides",
    topic: "Help articles and documentation",
    position: 6,
  },
  {
    name: "🆘-urgent-support",
    description: "Urgent support requests",
    topic: "Critical issues requiring immediate attention",
    position: 7,
  },
];

async function setupChannels() {
  try {
    await client.login(BOT_TOKEN);

    const guild = await client.guilds.fetch(GUILD_ID);
    console.log(`\n📋 Setting up support channels in "${guild.name}"\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const channelInfo of SUPPORT_CHANNELS) {
      try {
        // Check if channel exists
        const existing = guild.channels.cache.find(
          (c) => c.name === channelInfo.name && c.type === ChannelType.GuildText
        );

        if (existing) {
          console.log(`📌 ${channelInfo.name} - Already exists`);
          skippedCount++;
          continue;
        }

        // Create channel
        const channel = await guild.channels.create({
          name: channelInfo.name,
          description: channelInfo.description,
          type: ChannelType.GuildText,
          topic: channelInfo.topic,
          reason: "WISE² Customer Service Setup",
        });

        console.log(`✅ #${channel.name} - Created`);
        createdCount++;

        // Send welcome message
        const welcomeMessages = {
          "💬-support": `🆘 Welcome to Customer Support!\n\nUse \`/support-ticket\` to create a support ticket or describe your issue here.\n\n📚 Quick links:\n• \`/faq\` - Frequently asked questions\n• \`/customer-help\` - Support options\n• \`/report-bug\` - Report bugs\n• \`/feature-request\` - Suggest features`,
          "🎫-tickets": `🎫 Support Ticket Tracker\n\nAll support tickets are logged here. Track your issue using your ticket ID (e.g., WISE2-ABC123).\n\nResponse times:\n• 🔴 Urgent: <1 hour\n• 🟡 High: <4 hours\n• 🟢 Standard: <24 hours`,
          "❓-faq": `❓ Frequently Asked Questions\n\nUse \`/faq\` to view common questions and answers about WISE².\n\nTopics covered:\n• Getting Started\n• Billing & Pricing\n• Features\n• Account & Security\n• Support`,
          "🐛-bug-reports": `🐛 Bug Reports\n\nUse \`/report-bug\` to report issues you've found.\n\nWhen reporting, please include:\n• Steps to reproduce\n• Browser/device info\n• Screenshots/videos\n• Error messages`,
          "💡-feature-requests": `💡 Feature Requests\n\nUse \`/feature-request\` to suggest improvements or new features.\n\nHelp us prioritize by describing:\n• The problem it solves\n• Who would benefit\n• Urgency level\n• Current workarounds`,
          "📧-contact-us": `📧 Contact Customer Service\n\nReach our team through multiple channels:\n\n🎫 Create Support Ticket - \`/support-ticket\`\n💬 Live Chat - This channel\n📧 Email - support@wise2.net\n🐛 Report Issues - \`/report-bug\`\n💡 Suggest Features - \`/feature-request\``,
          "📚-knowledge-base": `📚 Knowledge Base & Documentation\n\nFind answers to common questions:\n\n📖 [Docs & Guides](https://wise2.net/docs)\n🎬 [Video Tutorials](https://wise2.net/tutorials)\n🔌 [API Reference](https://api.wise2.net/docs)\n📝 [Blog](https://wise2.net/blog)\n\nUse \`/faq\` for quick answers!`,
          "🆘-urgent-support": `🆘 URGENT Support Channel\n\nFor critical issues requiring immediate attention:\n\n⏱️ Response Time: <1 hour\n🔴 Priority: Critical\n\nSituations:\n• Account access issues\n• Billing problems\n• System outages\n• Data loss\n• Security concerns`,
        };

        if (welcomeMessages[channelInfo.name]) {
          await channel.send(welcomeMessages[channelInfo.name]);
        }
      } catch (error) {
        console.error(`❌ ${channelInfo.name} - Error: ${error.message}`);
      }
    }

    console.log(`\n✅ Setup complete!\n`);
    console.log(`📊 Summary:`);
    console.log(`  ✅ Created: ${createdCount}`);
    console.log(`  📌 Skipped: ${skippedCount}`);
    console.log(`  📁 Total: ${SUPPORT_CHANNELS.length}`);
    console.log(`\n💬 Channels ready for customer service!\n`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setupChannels();
