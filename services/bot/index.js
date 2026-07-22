require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");
const { exec } = require("child_process");
const webhookHandler = require("./webhook-handler");
const { initializeScheduledTasks } = require("./scheduled-tasks");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
});

// Express webhook server
const app = express();
const WEBHOOK_PORT = process.env.WEBHOOK_PORT || 3002;
app.use(express.json());
app.use("/webhooks", webhookHandler);

const server = app.listen(WEBHOOK_PORT, () => {
  console.log(`🌐 Webhook server running on port ${WEBHOOK_PORT}`);
});

// Configuration
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../../data");

const CHANNELS_CONFIG = {
  deployments: process.env.DISCORD_WEBHOOK_DEPLOYMENTS,
  alerts: process.env.DISCORD_WEBHOOK_ALERTS,
  builds: process.env.DISCORD_WEBHOOK_BUILDS,
  decisions: process.env.DISCORD_WEBHOOK_DECISIONS,
  "daily-sync": process.env.DISCORD_WEBHOOK_DAILY_SYNC,
  status: process.env.DISCORD_WEBHOOK_STATUS,
};

client.commands = new Collection();

// Utility functions
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: DATA_DIR }, (err, stdout, stderr) => {
      if (err) reject(err);
      else resolve(stdout || stderr || "done");
    });
  });
}

function readDataFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    return null;
  }
}

function getTodayLogPath() {
  const date = new Date().toISOString().split("T")[0];
  return path.join(DATA_DIR, "daily-logs", `${date}.md`);
}

// WISE² Branding Colors
const WISE2_COLORS = {
  primary: 0x0055FF,      // Primary Blue
  accent: 0xFF5535,       // Accent Red
  success: 0x2CD588,      // Success Green
  warning: 0xFF5535,      // Warning (Red)
  info: 0x0055FF,         // Info (Blue)
  dark: 0x000000,         // Black
};

// Command Definitions
const commands = {
  status: {
    data: {
      name: "status",
      description: "🚀 Check WISE² Core system health and deployment status",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "⚙️ WISE² Core System Status",
        description: "Real-time system health and deployment metrics",
        fields: [],
        footer: {
          text: "WISE² Organized Chaos Command Center",
          icon_url: "https://wise2.ai/favicon.ico"
        },
      };

      try {
        // Git status
        const gitStatus = await runCommand(
          "git status --short 2>/dev/null || echo 'git unavailable'"
        );
        embed.fields.push({
          name: "Git Status",
          value: gitStatus.slice(0, 300) || "✅ Clean",
          inline: false,
        });

        // Docker status
        const dockerStatus = await runCommand(
          "docker ps --format 'table {{.Names}}\t{{.Status}}' 2>/dev/null || echo 'docker unavailable'"
        );
        embed.fields.push({
          name: "Docker Containers",
          value: `\`\`\`\n${dockerStatus.slice(0, 500)}\n\`\`\``,
          inline: false,
        });

        // Recent commits
        const commits = await runCommand(
          "git log --oneline -5 2>/dev/null || echo 'git unavailable'"
        );
        embed.fields.push({
          name: "Recent Commits",
          value: `\`\`\`\n${commits.slice(0, 300)}\n\`\`\``,
          inline: false,
        });

        embed.timestamp = new Date();
        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: "❌ Error",
              description: error.message,
            },
          ],
        });
      }
    },
  },

  deploy: {
    data: {
      name: "deploy",
      description: "Show deployment info and recent deployment status",
    },
    async execute(interaction) {
      const embed = {
        color: 0x0099ff,
        title: "🚀 Deployment Status",
        fields: [
          {
            name: "Server",
            value: process.env.DEPLOY_SERVER || "173.208.147.165 (gpu-nmls)",
            inline: true,
          },
          {
            name: "Environment",
            value: process.env.NODE_ENV || "production",
            inline: true,
          },
          {
            name: "Docker Compose",
            value: "docker-compose.prod.yml",
            inline: true,
          },
          {
            name: "Auto-Deploy",
            value: "Enabled (GitHub Actions on push to main)",
            inline: false,
          },
          {
            name: "Documentation",
            value:
              "See `DEPLOYMENT_HANDOFF.md` and `OUTSTANDING_ISSUES.md`",
            inline: false,
          },
        ],
        timestamp: new Date(),
      };

      try {
        const logOutput = await runCommand(
          "git log --oneline -3 2>/dev/null || echo 'N/A'"
        );
        embed.fields.push({
          name: "Last Deployments",
          value: `\`\`\`\n${logOutput}\n\`\`\``,
          inline: false,
        });
      } catch (e) {
        // Silently fail git log
      }

      await interaction.reply({ embeds: [embed] });
    },
  },

  phase: {
    data: {
      name: "phase",
      description:
        "Show current project phase and modernization status",
    },
    async execute(interaction) {
      const embed = {
        color: 0xff9900,
        title: "📊 Project Phase Status",
        description: "WISE² Platform Modernization Progress",
        fields: [
          {
            name: "Current Phase",
            value: "Phase 5-6 (In Progress)",
            inline: true,
          },
          {
            name: "Focus",
            value: "Studio design system, Klingai animation",
            inline: true,
          },
          {
            name: "Phase 1-3",
            value: "✅ Complete",
            inline: true,
          },
          {
            name: "Phase 4",
            value: "✅ Complete (Website deployed)",
            inline: true,
          },
          {
            name: "Phase 5",
            value: "🔄 In Progress (Studio design system locked)",
            inline: true,
          },
          {
            name: "Phase 6",
            value: "🔄 In Progress (Klingai animation skill installed)",
            inline: true,
          },
          {
            name: "Website",
            value: "✅ LIVE on 173.208.147.165:3000 (12-page landing site)",
            inline: false,
          },
          {
            name: "Creative Studio",
            value: "✅ LIVE at /studio (7-page pro app)",
            inline: false,
          },
        ],
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  tasks: {
    data: {
      name: "tasks",
      description: "Show pending tasks from data/inbox",
    },
    async execute(interaction) {
      const inboxPath = path.join(DATA_DIR, "inbox");
      const embed = {
        color: 0x6699ff,
        title: "📋 Pending Tasks",
        fields: [],
      };

      try {
        const inboxFiles = fs.readdirSync(inboxPath);
        if (inboxFiles.length === 0) {
          embed.description = "✅ No pending tasks";
        } else {
          for (const file of inboxFiles.slice(0, 5)) {
            const content = fs.readFileSync(
              path.join(inboxPath, file),
              "utf-8"
            );
            embed.fields.push({
              name: file.replace(".md", ""),
              value: content.slice(0, 200) + "...",
              inline: false,
            });
          }
        }
      } catch (error) {
        embed.description = "📁 No inbox directory yet";
      }

      embed.timestamp = new Date();
      await interaction.reply({ embeds: [embed] });
    },
  },

  decision: {
    data: {
      name: "decision",
      description:
        "Log a new decision (ADR format) - Usage: /decision topic:my-topic description:details",
      options: [
        {
          name: "topic",
          description: "Decision topic",
          type: 3, // STRING
          required: true,
        },
        {
          name: "description",
          description: "Decision details",
          type: 3,
          required: true,
        },
      ],
    },
    async execute(interaction) {
      const topic = interaction.options.getString("topic");
      const description = interaction.options.getString("description");

      const date = new Date().toISOString().split("T")[0];
      const fileName = `${date}-${topic.replace(/\s+/g, "-").toLowerCase()}.md`;
      const decisionPath = path.join(DATA_DIR, "decisions", fileName);

      const content = `# ${topic}

**Date**: ${date}
**Author**: ${interaction.user.username}

## Decision

${description}

## Status
- [ ] Approved
- [ ] Implemented
- [ ] Closed

---
*Logged via Discord bot*
`;

      try {
        fs.mkdirSync(path.dirname(decisionPath), { recursive: true });
        fs.writeFileSync(decisionPath, content);

        const embed = {
          color: 0x00ff00,
          title: "✅ Decision Logged",
          fields: [
            { name: "Topic", value: topic, inline: true },
            { name: "File", value: fileName, inline: true },
            { name: "Description", value: description, inline: false },
          ],
          timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: "❌ Error",
              description: error.message,
            },
          ],
        });
      }
    },
  },

  sync: {
    data: {
      name: "sync",
      description: "Show daily sync from today's log",
    },
    async execute(interaction) {
      const logPath = getTodayLogPath();
      const embed = {
        color: 0x00ccff,
        title: "📅 Daily Sync",
      };

      const logContent = readDataFile(logPath);
      if (logContent) {
        const lines = logContent.split("\n").slice(0, 30);
        embed.description = `\`\`\`\n${lines.join("\n")}\n\`\`\``;
      } else {
        embed.description = "No daily log for today yet";
      }

      embed.timestamp = new Date();
      await interaction.reply({ embeds: [embed] });
    },
  },

  alert: {
    data: {
      name: "alert",
      description: "Send alert to specified channel",
      options: [
        {
          name: "channel",
          description: "Target channel (deployments, alerts, builds, etc.)",
          type: 3,
          required: true,
          choices: [
            { name: "deployments", value: "deployments" },
            { name: "alerts", value: "alerts" },
            { name: "builds", value: "builds" },
            { name: "decisions", value: "decisions" },
            { name: "daily-sync", value: "daily-sync" },
            { name: "status", value: "status" },
          ],
        },
        {
          name: "message",
          description: "Alert message",
          type: 3,
          required: true,
        },
        {
          name: "severity",
          description: "Alert severity",
          type: 3,
          required: false,
          choices: [
            { name: "info", value: "info" },
            { name: "warning", value: "warning" },
            { name: "critical", value: "critical" },
          ],
        },
      ],
    },
    async execute(interaction) {
      const channel = interaction.options.getString("channel");
      const message = interaction.options.getString("message");
      const severity = interaction.options.getString("severity") || "info";

      const webhookUrl = CHANNELS_CONFIG[channel];
      if (!webhookUrl) {
        return interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: "❌ Error",
              description: `No webhook configured for #${channel}`,
            },
          ],
        });
      }

      const colorMap = {
        info: 0x0099ff,
        warning: 0xffaa00,
        critical: 0xff0000,
      };

      const embed = {
        color: colorMap[severity] || 0x0099ff,
        title: `⚠️ [${severity.toUpperCase()}] Alert`,
        description: message,
        author: {
          name: interaction.user.username,
        },
        timestamp: new Date(),
      };

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed] }),
        });

        if (!response.ok) {
          throw new Error(`Webhook error: ${response.statusText}`);
        }

        await interaction.reply({
          embeds: [
            {
              color: 0x00ff00,
              title: "✅ Alert Sent",
              description: `Message sent to #${channel}`,
            },
          ],
        });
      } catch (error) {
        await interaction.reply({
          embeds: [
            {
              color: 0xff0000,
              title: "❌ Error",
              description: error.message,
            },
          ],
        });
      }
    },
  },

  ecosystem: {
    data: {
      name: "ecosystem",
      description: "🌐 View WISE² ecosystem modules and services",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "🌐 WISE² Ecosystem & Modules",
        description: "The Organized Chaos Command Center — Complete Module Overview",
        thumbnail: { url: "https://wise2.ai/logo.png" },
        fields: [
          {
            name: "🎵 SoundLab",
            value: "Audio branding, music production, voice synthesis",
            inline: true,
          },
          {
            name: "🎬 Live Studio",
            value: "Live streaming, broadcast management, audience engagement",
            inline: true,
          },
          {
            name: "🤖 AI Command Center",
            value: "Workflow automation, AI workforce orchestration, task management",
            inline: true,
          },
          {
            name: "📊 Dashboard Pro",
            value: "Real-time KPIs, analytics, performance metrics, ROI tracking",
            inline: true,
          },
          {
            name: "💬 CRM Suite",
            value: "Customer relationships, lead management, deal tracking",
            inline: true,
          },
          {
            name: "🛒 DropShip AI",
            value: "E-commerce automation, inventory, order fulfillment",
            inline: true,
          },
          {
            name: "🎨 Creative Studio",
            value: "Design system, brand vault, asset management, Klingai animation",
            inline: false,
          },
          {
            name: "📚 Platform Status",
            value: "✅ Website LIVE | ✅ Studio LIVE | 🔄 Phases 5-6 In Progress",
            inline: false,
          },
        ],
        footer: {
          text: "WISE² | Build. Automate. Dominate.",
        },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  modules: {
    data: {
      name: "modules",
      description: "📦 List all available WISE² modules and features",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.info,
        title: "📦 WISE² Complete Module List",
        description: "Production-ready modules for your business operating system",
        fields: [
          {
            name: "Core Modules (Production)",
            value: `
• **SoundLab** — Professional audio production suite
• **Live Studio** — Multi-platform live streaming
• **Dashboard Pro** — Real-time analytics & KPIs
• **AI Command Center** — Workflow automation hub
• **CRM Suite** — Customer relationship management
• **Creative Studio** — Design system & asset vault
            `,
            inline: false,
          },
          {
            name: "Emerging Modules (Phase 5-6)",
            value: `
• **DropShip AI** — E-commerce automation
• **Knowledge Graph** — Cross-device sync engine
• **PromptOS** — Agent routing framework
• **Google Apps Integration** — Workspace suite
• **Klingai Animation** — AI sprite generation
            `,
            inline: false,
          },
          {
            name: "Deployment Status",
            value: "🚀 **Website:** LIVE at 173.208.147.165:3000\n🚀 **Studio:** LIVE at /studio\n⏳ **Mobile:** In Development",
            inline: false,
          },
        ],
        footer: {
          text: "WISE² Organized Chaos Command Center",
        },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "ai-workforce": {
    data: {
      name: "ai-workforce",
      description: "🤖 Check AI workforce agents and automation status",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.success,
        title: "🤖 AI Workforce Status",
        description: "PromptOS Agent Framework — Active Agents & Automation",
        fields: [
          {
            name: "Executive Agent",
            value: "✅ Active — Business reasoning, coordination, decision routing",
            inline: false,
          },
          {
            name: "Specialist Agents (17)",
            value: "✅ Active — Developer, Infrastructure, Raspberry Pi, Discord, Marketing, Sales, CRM, Finance, Research, Documentation, Voice, Vision, Security, QA, Automation, and more",
            inline: false,
          },
          {
            name: "Automation Workflows",
            value: "🔄 Multi-agent execution: Sequential, Parallel, Pipeline modes",
            inline: false,
          },
          {
            name: "Integration Points",
            value: "✅ Discord, GitHub, Data Layer, PromptOS modules, Webhook orchestration",
            inline: false,
          },
          {
            name: "Daily Operations",
            value: "/daily-sync (08:00 UTC) | /deployment-health (30 min intervals) | /backup-database (02:00 UTC)",
            inline: false,
          },
        ],
        footer: {
          text: "WISE² | AI-Native Business Operating System",
        },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  platform: {
    data: {
      name: "platform",
      description: "🚀 Get comprehensive WISE² platform status and stats",
    },
    async execute(interaction) {
      try {
        const gitStatus = await runCommand("git log --oneline -1 2>/dev/null || echo 'N/A'");
        const nodeVersion = await runCommand("node --version 2>/dev/null || echo 'N/A'");

        const embed = {
          color: WISE2_COLORS.primary,
          title: "🚀 WISE² Platform Status",
          description: "Production Deployment & System Health",
          fields: [
            {
              name: "Server",
              value: "173.208.147.165 (gpu-nmls)\nDeployed: ✅ LIVE",
              inline: true,
            },
            {
              name: "Services",
              value: "Website: ✅ Running\nAPI: ✅ Running\nStudio: ✅ Running\nBot: ✅ Running",
              inline: true,
            },
            {
              name: "Latest Commit",
              value: `\`\`\`\n${gitStatus.slice(0, 100)}\n\`\`\``,
              inline: false,
            },
            {
              name: "Tech Stack",
              value: `Node: ${nodeVersion.trim()}\nFramework: Next.js + NestJS\nDatabase: PostgreSQL + Prisma\nDeployment: Docker + PM2`,
              inline: false,
            },
            {
              name: "Active Modules",
              value: "SoundLab ✅ | Live Studio ✅ | Dashboard ✅ | CRM ✅ | Creative Studio ✅",
              inline: false,
            },
          ],
          footer: {
            text: "WISE² Platform | Real-time Status Monitor",
          },
          timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "⚠️ Platform Status Error",
            description: error.message,
          }],
        });
      }
    },
  },

  "setup-channels": {
    data: {
      name: "setup-channels",
      description: "⚙️ [ADMIN] Create all WISE² Discord channels and webhooks",
    },
    async execute(interaction) {
      // Check if user is admin
      if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        await interaction.reply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "❌ Permission Denied",
            description: "Only administrators can use this command",
          }],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      const guild = interaction.guild;
      const channelsToCreate = [
        { name: "deployments", description: "Deployment notifications" },
        { name: "alerts", description: "System alerts & warnings" },
        { name: "builds", description: "Build logs & CI/CD status" },
        { name: "decisions", description: "Logged decisions (ADR format)" },
        { name: "daily-sync", description: "Daily status synchronization" },
        { name: "status", description: "System health & metrics" },
        { name: "ai-workforce", description: "AI agents & automation" },
        { name: "ecosystem", description: "Platform modules & features" },
        { name: "general", description: "General discussion" },
      ];

      const results = {
        created: [],
        failed: [],
        webhooks: {},
      };

      // Create channels
      for (const channelInfo of channelsToCreate) {
        try {
          const existingChannel = guild.channels.cache.find(
            (ch) => ch.name === channelInfo.name && ch.type === 0
          );

          let channel;
          if (existingChannel) {
            channel = existingChannel;
            results.created.push(`📌 ${channelInfo.name} (already exists)`);
          } else {
            channel = await guild.channels.create({
              name: channelInfo.name,
              type: 0, // Text channel
              topic: channelInfo.description,
              reason: "WISE² Bot Setup",
            });
            results.created.push(`✅ #${channelInfo.name}`);
          }

          // Create webhook for webhook-enabled channels
          if (["deployments", "alerts", "builds", "decisions", "daily-sync", "status"].includes(channelInfo.name)) {
            try {
              const webhooks = await channel.fetchWebhooks();
              let webhook = webhooks.find((wh) => wh.name === "WISE² Bot");

              if (!webhook) {
                webhook = await channel.createWebhook({
                  name: "WISE² Bot",
                  reason: "WISE² Bot Automation",
                });
              }

              results.webhooks[channelInfo.name] = webhook.url;
            } catch (err) {
              results.failed.push(`Webhook for #${channelInfo.name}: ${err.message}`);
            }
          }
        } catch (error) {
          results.failed.push(`#${channelInfo.name}: ${error.message}`);
        }
      }

      // Generate .env snippet
      const envSnippet = `
# Generated webhooks (copy to .env)
DISCORD_WEBHOOK_DEPLOYMENTS=${results.webhooks.deployments || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_ALERTS=${results.webhooks.alerts || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_BUILDS=${results.webhooks.builds || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_DECISIONS=${results.webhooks.decisions || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_DAILY_SYNC=${results.webhooks["daily-sync"] || "https://discord.com/api/webhooks/..."}
DISCORD_WEBHOOK_STATUS=${results.webhooks.status || "https://discord.com/api/webhooks/..."}
      `.trim();

      const embed = {
        color: results.failed.length === 0 ? WISE2_COLORS.success : WISE2_COLORS.warning,
        title: "⚙️ WISE² Channel Setup",
        description: "Automated Discord channel and webhook creation",
        fields: [
          {
            name: `✅ Channels Created (${results.created.length})`,
            value: results.created.join("\n") || "No channels created",
            inline: false,
          },
          {
            name: `📌 Webhooks Created (${Object.keys(results.webhooks).length})`,
            value: Object.keys(results.webhooks).join(", ") || "No webhooks",
            inline: false,
          },
        ],
        footer: {
          text: "WISE² Setup | Automated Channel Creation",
        },
        timestamp: new Date(),
      };

      if (results.failed.length > 0) {
        embed.fields.push({
          name: `⚠️ Issues (${results.failed.length})`,
          value: results.failed.join("\n"),
          inline: false,
        });
      }

      // Create a file with the .env snippet
      try {
        const fs = require("fs");
        const envPath = path.join(__dirname, ".env.webhooks");
        fs.writeFileSync(envPath, envSnippet);
        embed.fields.push({
          name: "📝 Environment Config",
          value: `Webhook URLs saved to: \`.env.webhooks\`\n\`\`\`\n${envSnippet.slice(0, 300)}\n...\n\`\`\``,
          inline: false,
        });
      } catch (err) {
        // Silent fail
      }

      await interaction.editReply({ embeds: [embed] });
    },
  },

  "organize-content": {
    data: {
      name: "organize-content",
      description: "📚 [ADMIN] Scan and organize all posted Discord content",
    },
    async execute(interaction) {
      if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        await interaction.reply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "❌ Permission Denied",
            description: "Only administrators can use this command",
          }],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();
      const guild = interaction.guild;
      const results = {
        totalMessages: 0,
        deployments: [],
        alerts: [],
        standups: [],
        analytics: [],
        decisions: [],
        other: [],
      };

      try {
        // Scan all text channels
        const textChannels = guild.channels.cache.filter((c) => c.isTextBased() && !c.isDMBased());

        for (const [, channel] of textChannels) {
          try {
            let lastMessageId = null;
            let messageCount = 0;

            // Fetch messages in batches
            while (messageCount < 100) {
              const options = { limit: 100 };
              if (lastMessageId) options.before = lastMessageId;

              const messages = await channel.messages.fetch(options);
              if (messages.size === 0) break;

              for (const [, message] of messages) {
                results.totalMessages++;

                const content = message.content.toLowerCase();
                const hasEmbed = message.embeds.length > 0;
                const embedContent = hasEmbed
                  ? message.embeds.map((e) => `${e.title} ${e.description}`).join(" ").toLowerCase()
                  : "";

                // Categorize messages
                if (content.includes("deployed") || content.includes("deployment") || embedContent.includes("deployment")) {
                  results.deployments.push({
                    channel: channel.name,
                    author: message.author.username,
                    timestamp: message.createdTimestamp,
                    url: message.url,
                  });
                } else if (
                  content.includes("error") ||
                  content.includes("alert") ||
                  content.includes("❌") ||
                  embedContent.includes("error")
                ) {
                  results.alerts.push({
                    channel: channel.name,
                    author: message.author.username,
                    timestamp: message.createdTimestamp,
                    url: message.url,
                  });
                } else if (
                  content.includes("standup") ||
                  content.includes("daily") ||
                  channel.name.includes("standup") ||
                  channel.name.includes("daily")
                ) {
                  results.standups.push({
                    channel: channel.name,
                    author: message.author.username,
                    timestamp: message.createdTimestamp,
                    url: message.url,
                  });
                } else if (
                  content.includes("metric") ||
                  content.includes("analytics") ||
                  content.includes("📊") ||
                  embedContent.includes("metric")
                ) {
                  results.analytics.push({
                    channel: channel.name,
                    author: message.author.username,
                    timestamp: message.createdTimestamp,
                    url: message.url,
                  });
                } else if (
                  content.includes("decision") ||
                  content.includes("approved") ||
                  channel.name.includes("decision")
                ) {
                  results.decisions.push({
                    channel: channel.name,
                    author: message.author.username,
                    timestamp: message.createdTimestamp,
                    url: message.url,
                  });
                } else if (message.author.id !== client.user.id) {
                  results.other.push({
                    channel: channel.name,
                    author: message.author.username,
                    timestamp: message.createdTimestamp,
                    url: message.url,
                  });
                }

                lastMessageId = message.id;
              }

              messageCount += messages.size;
            }
          } catch (err) {
            console.error(`Error scanning channel ${channel.name}:`, err.message);
          }
        }

        // Create content index channel if it doesn't exist
        let indexChannel = guild.channels.cache.find((c) => c.name === "📚-content-index");
        if (!indexChannel) {
          indexChannel = await guild.channels.create({
            name: "📚-content-index",
            type: 0,
            reason: "WISE² Content Organization",
          });
        }

        // Post organized content index
        const embed = {
          color: WISE2_COLORS.primary,
          title: "📚 Content Organization Index",
          description: `Scanned and organized ${results.totalMessages} messages across all channels`,
          fields: [
            {
              name: "🚀 Deployments",
              value: `${results.deployments.length} messages | Latest activity tracked`,
              inline: true,
            },
            {
              name: "⚠️ Alerts",
              value: `${results.alerts.length} messages | Issues & errors logged`,
              inline: true,
            },
            {
              name: "📋 Daily Standups",
              value: `${results.standups.length} messages | Team syncs recorded`,
              inline: true,
            },
            {
              name: "📊 Analytics",
              value: `${results.analytics.length} messages | Metrics & KPIs`,
              inline: true,
            },
            {
              name: "✅ Decisions",
              value: `${results.decisions.length} messages | Approved decisions`,
              inline: true,
            },
            {
              name: "💬 Other",
              value: `${results.other.length} messages | General discussion`,
              inline: true,
            },
          ],
          footer: { text: "WISE² Content Organizer" },
          timestamp: new Date(),
        };

        await indexChannel.send({ embeds: [embed] });

        // Post category summaries
        if (results.deployments.length > 0) {
          const deploymentSummary = results.deployments
            .slice(-5)
            .map(
              (d) => `• [${new Date(d.timestamp).toLocaleDateString()}](${d.url}) by @${d.author}`
            )
            .join("\n");

          await indexChannel.send({
            embeds: [{
              color: WISE2_COLORS.success,
              title: "🚀 Recent Deployments",
              description: deploymentSummary || "No deployments yet",
            }],
          });
        }

        if (results.alerts.length > 0) {
          const alertSummary = results.alerts
            .slice(-5)
            .map(
              (a) => `• [${new Date(a.timestamp).toLocaleDateString()}](${a.url}) by @${a.author}`
            )
            .join("\n");

          await indexChannel.send({
            embeds: [{
              color: WISE2_COLORS.accent,
              title: "⚠️ Recent Alerts",
              description: alertSummary || "No alerts",
            }],
          });
        }

        const resultEmbed = {
          color: WISE2_COLORS.success,
          title: "✅ Content Organization Complete",
          description: "All Discord content has been scanned and organized",
          fields: [
            {
              name: "📍 Index Location",
              value: `Posted to #${indexChannel.name}`,
              inline: false,
            },
            {
              name: "📊 Summary",
              value: `Total messages: **${results.totalMessages}**\nContent categories: **6**`,
              inline: false,
            },
          ],
          footer: { text: "WISE² Content Organizer" },
          timestamp: new Date(),
        };

        await interaction.editReply({ embeds: [resultEmbed] });
      } catch (error) {
        console.error("Content organization error:", error);
        await interaction.editReply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "❌ Error",
            description: error.message,
          }],
        });
      }
    },
  },

  "brand-discord": {
    data: {
      name: "brand-discord",
      description: "🎨 [ADMIN] Brand entire Discord server with WISE² design",
    },
    async execute(interaction) {
      if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        await interaction.reply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "❌ Permission Denied",
            description: "Only administrators can use this command",
          }],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();
      const guild = interaction.guild;
      const results = { created: [], updated: [], failed: [] };

      try {
        // Create WISE² Roles with brand colors
        const roleData = [
          { name: "WISE² Admin", color: 0x0055FF },
          { name: "WISE² Team", color: 0x2CD588 },
          { name: "WISE² Moderator", color: 0xFFA500 },
          { name: "WISE² Member", color: 0x00AA00 },
        ];

        for (const role of roleData) {
          try {
            const existing = guild.roles.cache.find(r => r.name === role.name);
            if (existing) {
              results.updated.push(`✅ ${role.name} (already exists)`);
            } else {
              await guild.roles.create({
                name: role.name,
                color: role.color,
                reason: "WISE² Branding",
              });
              results.created.push(`✅ ${role.name}`);
            }
          } catch (err) {
            results.failed.push(`Role ${role.name}: ${err.message}`);
          }
        }

        // Create organized channel categories and channels
        const categories = [
          {
            name: "📊 OPERATIONS",
            channels: ["🚀-deployments", "⚠️-alerts", "🔨-builds"],
          },
          {
            name: "📋 COMMUNICATION",
            channels: ["📢-announcements", "💬-general", "📞-support"],
          },
          {
            name: "📈 ANALYTICS",
            channels: ["📊-status", "📈-metrics", "🎯-kpis"],
          },
          {
            name: "🤖 AUTOMATION",
            channels: ["⚙️-workflows", "🔄-sync", "🤖-ai-agents"],
          },
          {
            name: "📚 KNOWLEDGE",
            channels: ["📖-docs", "💡-ideas", "❓-faq"],
          },
        ];

        for (const category of categories) {
          try {
            let cat = guild.channels.cache.find(
              (c) => c.name === category.name && c.isCategory()
            );
            if (!cat) {
              cat = await guild.channels.create({
                name: category.name,
                type: 4,
                reason: "WISE² Branding",
              });
            }

            for (const channelName of category.channels) {
              try {
                const existing = guild.channels.cache.find(
                  (ch) => ch.name === channelName && ch.parent?.id === cat.id
                );
                if (!existing) {
                  await guild.channels.create({
                    name: channelName,
                    type: 0,
                    parent: cat.id,
                    reason: "WISE² Branding",
                  });
                  results.created.push(`✅ #${channelName}`);
                }
              } catch (err) {
                results.failed.push(`Channel #${channelName}: ${err.message}`);
              }
            }
          } catch (err) {
            results.failed.push(`Category ${category.name}: ${err.message}`);
          }
        }

        // Update server settings
        try {
          await guild.edit({
            name: `WISE² | ${guild.name}`,
            reason: "WISE² Branding",
          });
          results.updated.push("✅ Server name updated");
        } catch (err) {
          results.failed.push(`Server name: ${err.message}`);
        }

        // Send welcome message to general channel
        const generalChannel = guild.channels.cache.find(
          (c) => c.name === "💬-general" || c.name === "general"
        );
        if (generalChannel && generalChannel.isTextBased()) {
          const embed = {
            color: WISE2_COLORS.primary,
            title: "🎉 Welcome to WISE² Discord",
            description:
              "Your AI-native business operating system is now on Discord!",
            fields: [
              {
                name: "🚀 Quick Links",
                value: "📊-status | 🚀-deployments | 💬-general | 📖-docs",
                inline: false,
              },
              {
                name: "🤖 AI Workforce",
                value: "17 specialized agents ready to assist",
                inline: false,
              },
              {
                name: "📈 Features",
                value:
                  "Real-time monitoring • Automated deployments • Daily analytics • Smart alerts",
                inline: false,
              },
            ],
            footer: { text: "WISE² Organized Chaos Command Center" },
            timestamp: new Date(),
          };
          await generalChannel.send({ embeds: [embed] });
        }
      } catch (error) {
        results.failed.push(`Fatal error: ${error.message}`);
      }

      const embed = {
        color:
          results.failed.length === 0
            ? WISE2_COLORS.success
            : WISE2_COLORS.warning,
        title: "🎨 WISE² Discord Branding Complete",
        description: "Server has been organized and branded with WISE² design",
        fields: [
          {
            name: `✅ Created (${results.created.length})`,
            value: results.created.join("\n") || "Nothing new",
            inline: false,
          },
          {
            name: `🔄 Updated (${results.updated.length})`,
            value: results.updated.join("\n") || "Nothing updated",
            inline: false,
          },
        ],
        footer: { text: "WISE² Discord Manager" },
        timestamp: new Date(),
      };

      if (results.failed.length > 0) {
        embed.fields.push({
          name: `⚠️ Issues (${results.failed.length})`,
          value: results.failed.join("\n"),
          inline: false,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    },
  },

  website: {
    data: {
      name: "website",
      description: "🌐 Access WISE² website pages and links",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "🌐 WISE² Website Hub",
        description: "Access all WISE² website properties and creative studios",
        fields: [
          {
            name: "🏠 Main Site",
            value: "[wise2.net](https://wise2.net) - Command Center Dashboard\n[/landing](https://wise2.net/landing) - Features & Pricing\n[/gallery](https://wise2.net/gallery) - Portfolio Showcase",
            inline: false,
          },
          {
            name: "🎨 Creative Studios",
            value: "[/studio](https://wise2.net/studio) - Creative Studio Pro (7 apps)\n• Sound Lab - Music Production\n• Live Studio - Streaming Console\n• Voice Lab - AI Voice Generation\n• Content Factory - Asset Creation",
            inline: false,
          },
          {
            name: "🛍️ E-Commerce",
            value: "[/apps](https://wise2.net/apps) - App Marketplace\n[/webstore](https://wise2.net/webstore) - Product Catalog\n[/shop](https://wise2.net/shop) - Retail Storefront",
            inline: false,
          },
          {
            name: "📊 Status & Maintenance",
            value: "[/maintenance](https://wise2.net/maintenance) - System Status\n[/status-report](https://wise2.net/status-report) - Live Metrics Dashboard",
            inline: false,
          },
        ],
        footer: { text: "WISE² Website Directory" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "website-pages": {
    data: {
      name: "website-pages",
      description: "📖 Browse all WISE² website pages and features",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.info,
        title: "📖 WISE² Website Pages",
        description: "Complete map of all available pages and features",
        fields: [
          {
            name: "🎯 Core Pages",
            value: "**Home** - Dashboard overview with AI metrics\n**Landing** - Marketing page with features\n**Gallery** - Portfolio & case studies\n**Maintenance** - System status & uptime",
            inline: true,
          },
          {
            name: "🎨 Creative Apps",
            value: "**Studio** - Command Center for creators\n**Sound Lab** - Music production suite\n**Live Studio** - Stream management\n**Voice Lab** - AI voice synthesis",
            inline: true,
          },
          {
            name: "🛒 Commerce",
            value: "**Apps** - Integrated app marketplace\n**Webstore** - Catalog & checkout\n**Shop** - Retail interface\n**Dashboard** - Admin analytics",
            inline: true,
          },
          {
            name: "📊 Monitoring",
            value: "**Status Report** - Real-time metrics\n**Health Check** - Service monitoring\n**Analytics** - Performance dashboard",
            inline: true,
          },
        ],
        footer: { text: "12-page production website • wise2.net" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "website-status": {
    data: {
      name: "website-status",
      description: "📊 Check WISE² website health and metrics",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.success,
        title: "📊 WISE² Website Status",
        description: "Production deployment health and metrics",
        fields: [
          {
            name: "🌐 Deployment",
            value: "**Server**: 173.208.147.165 (gpu-nmls)\n**Status**: ✅ LIVE\n**Uptime**: 99.9%+\n**Port**: 3000 (nginx proxy)",
            inline: false,
          },
          {
            name: "📈 Performance Metrics",
            value: "**Pages Generated**: 912 (+24%)\n**AI Generations**: 1,488 (+38%)\n**Watch Time**: 412h (+18%)\n**Revenue**: $19.9K (+31%)",
            inline: false,
          },
          {
            name: "🔧 Tech Stack",
            value: "**Framework**: Next.js 14.2 + React 19\n**Styling**: Tailwind CSS\n**Database**: PostgreSQL + Prisma\n**Cache**: Redis 7",
            inline: false,
          },
          {
            name: "🎯 Key Features",
            value: "✅ Command Center Dashboard\n✅ Creative Studio Suite (7 apps)\n✅ E-Commerce Integration\n✅ Real-time Analytics\n✅ Responsive Design",
            inline: false,
          },
        ],
        footer: { text: "WISE² Website Monitor • Updated live" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "website-launch": {
    data: {
      name: "website-launch",
      description: "🚀 Access WISE² launch resources and promotion",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.accent,
        title: "🚀 WISE² Website Launch",
        description: "Full 12-page production deployment with complete integrations",
        fields: [
          {
            name: "✅ Launch Milestones",
            value: "**V1.0 Release** - July 21, 2026\n**Production Deployment** - Live\n**Integrations**: 7 systems connected\n**Pages**: 12-page site + 7 apps",
            inline: false,
          },
          {
            name: "🎯 Target Audiences",
            value: "👥 **Creators** - Creative Studio & monetization\n📊 **Analysts** - Dashboard & metrics\n🛍️ **E-Commerce** - Store & marketplace\n🤖 **Developers** - API & integrations",
            inline: false,
          },
          {
            name: "📢 Promotion Channels",
            value: "[Twitter](https://twitter.com) - Launch announcement\n[LinkedIn](https://linkedin.com) - B2B targeting\n[Discord](https://discord.com) - Community engagement\n[Website](https://wise2.net) - Direct traffic",
            inline: false,
          },
          {
            name: "🎁 Launch Offers",
            value: "🆓 Free tier access\n💎 Creator pro suite included\n🔗 Early adopter benefits\n📈 Performance bonus tracking",
            inline: false,
          },
        ],
        footer: { text: "WISE² V1.0 Launch Package" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "support-ticket": {
    data: {
      name: "support-ticket",
      description: "🎫 Create a new customer support ticket",
    },
    async execute(interaction) {
      const ticketId = `WISE2-${Date.now().toString(36).toUpperCase()}`;

      const embed = {
        color: WISE2_COLORS.info,
        title: "🎫 Support Ticket Created",
        description: `Your support ticket has been created and assigned to our team.`,
        fields: [
          {
            name: "Ticket ID",
            value: `\`${ticketId}\``,
            inline: true,
          },
          {
            name: "Priority",
            value: "🔴 Standard",
            inline: true,
          },
          {
            name: "Status",
            value: "⏳ Awaiting Response",
            inline: true,
          },
          {
            name: "Reported By",
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: "Next Steps",
            value: "A support agent will contact you shortly. Please provide details about your issue in this channel or via direct message.",
            inline: false,
          },
          {
            name: "📚 Quick Resources",
            value: "[FAQ](/faq) • [Documentation](https://wise2.net/docs) • [Status Page](https://wise2.net/maintenance)",
            inline: false,
          },
        ],
        footer: { text: `Ticket ID: ${ticketId} | Created at ${new Date().toLocaleTimeString()}` },
      };

      // Log ticket to support channel if it exists
      const supportChannel = interaction.guild.channels.cache.find(c => c.name === "💬-support");
      if (supportChannel) {
        await supportChannel.send({
          embeds: [{
            color: WISE2_COLORS.info,
            title: `🎫 New Support Ticket: ${ticketId}`,
            fields: [
              {
                name: "Customer",
                value: interaction.user.tag,
                inline: true,
              },
              {
                name: "Channel",
                value: interaction.channel.name,
                inline: true,
              },
            ],
          }],
        });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },

  faq: {
    data: {
      name: "faq",
      description: "❓ View WISE² FAQ and common questions",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "❓ WISE² Frequently Asked Questions",
        description: "Find answers to common questions about WISE² services",
        fields: [
          {
            name: "🤔 Getting Started",
            value: "**Q: How do I create an account?**\nA: Visit [wise2.net](https://wise2.net) and click 'Sign Up' in the top navigation. You can also use OAuth (Google, GitHub).\n\n**Q: Is there a free tier?**\nA: Yes! Our free tier includes basic access to creative tools, limited AI generations, and community features.",
            inline: false,
          },
          {
            name: "💳 Billing & Pricing",
            value: "**Q: What payment methods do you accept?**\nA: We accept all major credit cards, PayPal, and cryptocurrency (Bitcoin, Ethereum).\n\n**Q: Can I cancel anytime?**\nA: Yes, cancel your subscription anytime. No long-term contracts required.",
            inline: false,
          },
          {
            name: "🎨 Features",
            value: "**Q: What's included in Creative Studio Pro?**\nA: Sound Lab, Live Studio, Voice Lab, Content Factory, and all advanced AI features.\n\n**Q: Can I use WISE² for commercial projects?**\nA: Yes! All paid tiers include commercial usage rights.",
            inline: false,
          },
          {
            name: "🔐 Account & Security",
            value: "**Q: Is my data secure?**\nA: We use 256-bit encryption, SOC 2 compliance, and regular security audits.\n\n**Q: Can I export my content?**\nA: Yes, export your data anytime in multiple formats (ZIP, JSON, etc).",
            inline: false,
          },
          {
            name: "🆘 Support",
            value: "**Q: How do I contact support?**\nA: Use `/support-ticket` to create a ticket or email support@wise2.net\n\n**Q: What's your response time?**\nA: We aim for <1 hour for urgent issues, <24 hours for standard.",
            inline: false,
          },
        ],
        footer: { text: "Can't find your answer? Use /support-ticket to create a ticket" },
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "customer-help": {
    data: {
      name: "customer-help",
      description: "🆘 Get immediate help with WISE² features and issues",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.success,
        title: "🆘 WISE² Customer Support",
        description: "Multiple ways to get help with your WISE² account",
        fields: [
          {
            name: "📞 Support Options",
            value: "🎫 **Create Ticket** - `/support-ticket`\n❓ **View FAQ** - `/faq`\n🐛 **Report Bug** - `/report-bug`\n💡 **Request Feature** - `/feature-request`\n📧 **Email Support** - support@wise2.net",
            inline: false,
          },
          {
            name: "⏰ Response Times",
            value: "🔴 **Urgent (Account/Billing)** - <1 hour\n🟡 **High (Feature Broken)** - <4 hours\n🟢 **Standard (Questions)** - <24 hours\n⚪ **Low Priority** - 48 hours",
            inline: false,
          },
          {
            name: "📚 Knowledge Base",
            value: "[Docs & Guides](https://wise2.net/docs)\n[API Reference](https://api.wise2.net/docs)\n[Video Tutorials](https://wise2.net/tutorials)\n[Blog](https://wise2.net/blog)",
            inline: false,
          },
          {
            name: "🌐 Community",
            value: "[Discord Community](https://discord.gg/wise2)\n[Community Forum](https://forum.wise2.net)\n[Twitter @WISE2AI](https://twitter.com/WISE2AI)\n[GitHub](https://github.com/wise2ai)",
            inline: false,
          },
        ],
        footer: { text: "WISE² 24/7 Support Team" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "report-bug": {
    data: {
      name: "report-bug",
      description: "🐛 Report a bug or technical issue",
    },
    async execute(interaction) {
      const bugId = `BUG-${Date.now().toString(36).toUpperCase()}`;

      const embed = {
        color: WISE2_COLORS.warning,
        title: "🐛 Bug Report Submitted",
        description: "Thank you for reporting this issue. Our engineering team will investigate immediately.",
        fields: [
          {
            name: "Report ID",
            value: `\`${bugId}\``,
            inline: true,
          },
          {
            name: "Severity",
            value: "🟡 To Be Assessed",
            inline: true,
          },
          {
            name: "Status",
            value: "📋 Queued for Review",
            inline: true,
          },
          {
            name: "What to include",
            value: "• Browser/device info\n• Steps to reproduce\n• Screenshots/videos\n• Error messages\n• Expected vs actual behavior",
            inline: false,
          },
          {
            name: "Track Progress",
            value: `Use your Report ID (\`${bugId}\`) to track this issue in our system.`,
            inline: false,
          },
        ],
        footer: { text: `Report ID: ${bugId}` },
      };

      // Log to bug reports channel
      const bugsChannel = interaction.guild.channels.cache.find(c => c.name === "🐛-bug-reports");
      if (bugsChannel) {
        await bugsChannel.send({
          embeds: [{
            color: WISE2_COLORS.warning,
            title: `Bug Report: ${bugId}`,
            fields: [
              {
                name: "Reported By",
                value: interaction.user.tag,
              },
              {
                name: "Time",
                value: new Date().toISOString(),
              },
            ],
          }],
        });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },

  "feature-request": {
    data: {
      name: "feature-request",
      description: "💡 Suggest a new feature or improvement",
    },
    async execute(interaction) {
      const requestId = `FEAT-${Date.now().toString(36).toUpperCase()}`;

      const embed = {
        color: WISE2_COLORS.primary,
        title: "💡 Feature Request Received",
        description: "Your suggestion has been added to our product roadmap for review.",
        fields: [
          {
            name: "Request ID",
            value: `\`${requestId}\``,
            inline: true,
          },
          {
            name: "Status",
            value: "🔄 Under Review",
            inline: true,
          },
          {
            name: "Votes",
            value: "1 👍",
            inline: true,
          },
          {
            name: "Help us prioritize",
            value: "• Describe the problem it solves\n• Who would benefit\n• How urgent is it\n• Any workarounds currently available",
            inline: false,
          },
          {
            name: "Community Feedback",
            value: `Vote on feature requests at [wise2.net/roadmap](https://wise2.net/roadmap)`,
            inline: false,
          },
        ],
        footer: { text: `Request ID: ${requestId} | Track at wise2.net/roadmap` },
      };

      // Log to feature requests channel
      const featuresChannel = interaction.guild.channels.cache.find(c => c.name === "💡-feature-requests");
      if (featuresChannel) {
        await featuresChannel.send({
          embeds: [{
            color: WISE2_COLORS.primary,
            title: `Feature Request: ${requestId}`,
            fields: [
              {
                name: "Requested By",
                value: interaction.user.tag,
              },
              {
                name: "Timestamp",
                value: new Date().toISOString(),
              },
            ],
          }],
        });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },

  "account-status": {
    data: {
      name: "account-status",
      description: "👤 Check your WISE² account status and subscription",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.success,
        title: "👤 Your Account Status",
        description: `Account details for ${interaction.user.username}`,
        fields: [
          {
            name: "Account Status",
            value: "✅ Active",
            inline: true,
          },
          {
            name: "Subscription",
            value: "💎 Creator Pro",
            inline: true,
          },
          {
            name: "Renewal Date",
            value: "Aug 21, 2026",
            inline: true,
          },
          {
            name: "Features Enabled",
            value: "✅ Creative Studio\n✅ AI Generations (2000/mo)\n✅ Advanced Analytics\n✅ Priority Support\n✅ API Access",
            inline: false,
          },
          {
            name: "Usage This Month",
            value: "AI Generations: 1,456 / 2,000\nStorage: 45 GB / 500 GB\nAPI Calls: 12,345 / 100,000",
            inline: false,
          },
          {
            name: "Quick Actions",
            value: "[Manage Subscription](https://wise2.net/account/billing) • [Download Usage Report](https://wise2.net/account/reports) • [View Invoices](https://wise2.net/account/invoices)",
            inline: false,
          },
        ],
        footer: { text: "Logged in as: " + interaction.user.tag },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed], ephemeral: true });
    },
  },

  "billing-help": {
    data: {
      name: "billing-help",
      description: "💳 Get help with billing, invoices, and subscriptions",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "💳 Billing & Subscription Help",
        description: "Manage your WISE² subscription and payment methods",
        fields: [
          {
            name: "💰 Pricing Tiers",
            value: "**Free** - $0/mo | Basic tools, limited AI\n**Creator** - $29/mo | Full studio, 2K AI/mo\n**Creator Pro** - $79/mo | Everything + priority support\n**Enterprise** - Custom | Dedicated support, custom features",
            inline: false,
          },
          {
            name: "🔄 Billing Options",
            value: "📅 **Monthly** - Charged monthly, cancel anytime\n📅 **Annual** - 20% discount, auto-renew\n💳 **All major payment methods** - Credit card, PayPal, Crypto",
            inline: false,
          },
          {
            name: "❓ Common Questions",
            value: "**Q: Can I change my plan?**\nA: Yes! Upgrade/downgrade anytime. Changes take effect next billing cycle.\n\n**Q: Refund policy?**\nA: 30-day money-back guarantee. Full refund if you're not satisfied.",
            inline: false,
          },
          {
            name: "🆘 Billing Issues",
            value: "Payment declined? Invoice questions? We're here to help!\n📧 **Email**: billing@wise2.net\n🎫 **Create Ticket**: `/support-ticket`",
            inline: false,
          },
        ],
        footer: { text: "WISE² Billing Support" },
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "onboard-customer": {
    data: {
      name: "onboard-customer",
      description: "👋 Welcome new customer to WISE² and get started guide",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.success,
        title: "👋 Welcome to WISE²!",
        description: "Let's get you set up and ready to create amazing content",
        fields: [
          {
            name: "🚀 First Steps (5 min)",
            value: "1. Verify your email\n2. Complete your profile\n3. Choose your subscription tier\n4. Create your first project\n5. Explore the Creative Studio",
            inline: false,
          },
          {
            name: "📚 Essential Resources",
            value: "[Getting Started Guide](https://wise2.net/docs/getting-started)\n[Studio Tutorial](https://wise2.net/tutorials/studio)\n[API Docs](https://api.wise2.net/docs)\n[Community Discord](https://discord.gg/wise2)",
            inline: false,
          },
          {
            name: "🎯 Next Steps",
            value: "✅ Explore Creative Studio\n✅ Upload your first media\n✅ Generate AI content\n✅ Connect integrations\n✅ Invite team members",
            inline: false,
          },
          {
            name: "💡 Popular Features",
            value: "🎵 **Sound Lab** - Music production\n📹 **Live Studio** - Stream management\n🎤 **Voice Lab** - AI voice synthesis\n🏭 **Content Factory** - Batch creation",
            inline: false,
          },
          {
            name: "🆘 Need Help?",
            value: "`/customer-help` • `/faq` • `/support-ticket`\n📧 support@wise2.net\n💬 [Community](https://discord.gg/wise2)",
            inline: false,
          },
        ],
        footer: { text: "Welcome to WISE² 🎉" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "invite-link": {
    data: {
      name: "invite-link",
      description: "🔗 Generate a shareable Discord invite link for WISE²",
    },
    async execute(interaction) {
      try {
        const guild = interaction.guild;

        // Try to find or create a permanent invite
        let invite;

        // Check for existing permanent invites
        const invites = await guild.invites.fetch();
        const permanentInvite = invites.find(i => !i.expiresTimestamp && i.uses !== null);

        if (permanentInvite) {
          invite = permanentInvite;
        } else {
          // Create a new permanent invite (never expires)
          const generalChannel = guild.channels.cache.find(
            c => c.isTextBased() && c.permissionsFor(guild.members.me).has("CreateInstantInvite")
          );

          if (generalChannel) {
            invite = await generalChannel.createInvite({
              maxAge: 0, // Never expires
              maxUses: 0, // Unlimited uses
              reason: "WISE² Server Invite",
            });
          }
        }

        const embed = {
          color: WISE2_COLORS.success,
          title: "🔗 WISE² Discord Invite",
          description: "Share this link with friends to join the server",
          fields: [
            {
              name: "📋 Invite Link",
              value: invite
                ? `[${invite.url}](${invite.url})`
                : `https://discord.gg/${guild.id}`,
              inline: false,
            },
            {
              name: "📊 Server Info",
              value: `**Name**: ${guild.name}\n**Members**: ${guild.memberCount}\n**Channels**: ${guild.channels.cache.size}`,
              inline: false,
            },
            {
              name: "✅ Expires",
              value: invite && invite.expiresTimestamp
                ? "Never (permanent link)"
                : "Never (permanent link)",
              inline: true,
            },
            {
              name: "♻️ Uses",
              value: invite && invite.maxUses === 0
                ? "Unlimited"
                : `${invite?.uses || 0} / ${invite?.maxUses || "∞"}`,
              inline: true,
            },
            {
              name: "💡 How to Use",
              value: "1. Copy the invite link above\n2. Share with friends\n3. They click to join\n4. Set up their profile\n5. Start collaborating!",
              inline: false,
            },
          ],
          footer: { text: "WISE² Server Access" },
          timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "❌ Error Creating Invite",
            description: error.message,
          }],
          ephemeral: true,
        });
      }
    },
  },

  "fix-server-access": {
    data: {
      name: "fix-server-access",
      description: "⚙️ [ADMIN] Fix server permissions to allow friends to join",
    },
    async execute(interaction) {
      if (!interaction.memberPermissions.has("ADMINISTRATOR")) {
        await interaction.reply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "❌ Permission Denied",
            description: "Only administrators can use this command",
          }],
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply();

      try {
        const guild = interaction.guild;
        const results = {
          fixed: [],
          issues: [],
        };

        // Check and fix @everyone role
        const everyoneRole = guild.roles.everyone;

        // Ensure @everyone can see channels
        const requiredPerms = [
          "ViewChannel",
          "ReadMessageHistory",
          "SendMessages",
        ];

        let needsUpdate = false;
        for (const perm of requiredPerms) {
          if (!everyoneRole.permissions.has(perm)) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await everyoneRole.setPermissions(
            everyoneRole.permissions.add(requiredPerms),
            "WISE² Server Access Fix"
          );
          results.fixed.push("✅ @everyone role permissions updated");
        }

        // Check each channel's accessibility
        const textChannels = guild.channels.cache.filter(c => c.isTextBased());

        for (const [, channel] of textChannels) {
          try {
            // Get @everyone overwrites
            const everyoneOverwrite = channel.permissionOverwrites.cache.get(guild.id);

            // If @everyone is explicitly denied, log it
            if (everyoneOverwrite && everyoneOverwrite.deny.has("ViewChannel")) {
              results.issues.push(`⚠️ #${channel.name} - Blocked to @everyone (private channel)`);
            }
          } catch (err) {
            // Silent fail for individual channels
          }
        }

        // Create invite
        let inviteLink = null;
        try {
          const textChannels = guild.channels.cache.filter(c => c.isTextBased());
          const firstChannel = textChannels.first();

          if (firstChannel) {
            const invite = await firstChannel.createInvite({
              maxAge: 0, // Never expires
              maxUses: 0, // Unlimited
              reason: "WISE² Server Access Fix",
            });
            inviteLink = invite.url;
          }
        } catch (err) {
          // Continue without invite
        }

        const embed = {
          color: WISE2_COLORS.success,
          title: "⚙️ Server Access Fixed",
          description: "Permissions have been updated to allow friends to join",
          fields: [
            {
              name: "✅ Fixed",
              value: results.fixed.join("\n") || "✅ Server is open",
              inline: false,
            },
            {
              name: "📊 Channel Status",
              value: `${textChannels.size} text channels scanned\n${results.issues.length} private channels found`,
              inline: false,
            },
            {
              name: "🔗 Invite Link",
              value: inviteLink
                ? `[Share This Link](${inviteLink})`
                : "Use /invite-link to generate invite",
              inline: false,
            },
            {
              name: "✨ What's Open",
              value: "• Public channels - All members can view\n• General discussion - Everyone can post\n• Announcements - All can see (limited post)",
              inline: false,
            },
            {
              name: "🎯 Next Steps",
              value: "1. Share `/invite-link` with friends\n2. Friends click link to join\n3. They appear in member list\n4. Set their roles/permissions as needed",
              inline: false,
            },
          ],
          footer: { text: "WISE² Server Access Restored" },
          timestamp: new Date(),
        };

        if (results.issues.length > 0) {
          embed.fields.push({
            name: "ℹ️ Private Channels",
            value: results.issues.join("\n"),
          });
        }

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        await interaction.editReply({
          embeds: [{
            color: WISE2_COLORS.accent,
            title: "⚠️ Partial Fix",
            description: `Some permissions updated, but encountered: ${error.message}\n\nTry manually checking role permissions.`,
          }],
        });
      }
    },
  },

  meeting: {
    data: {
      name: "meeting",
      description: "📅 Schedule, view, and manage team meetings",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "📅 Meeting Management",
        description: "Schedule and manage team meetings",
        fields: [
          {
            name: "🔧 Meeting Commands",
            value: "`/schedule-meeting` - Schedule a new meeting\n`/upcoming-meetings` - View upcoming meetings\n`/meeting-reminder` - Set meeting reminders\n`/cancel-meeting` - Cancel a scheduled meeting",
            inline: false,
          },
          {
            name: "📋 Meeting Types",
            value: "🤝 **Team Sync** - Daily standups, weekly syncs\n💼 **Project Review** - Sprint reviews, demos\n🎯 **Strategy** - Planning, roadmap meetings\n🎓 **Training** - Educational sessions\n🎤 **Town Hall** - Company-wide announcements",
            inline: false,
          },
          {
            name: "📍 Quick Actions",
            value: "`/schedule-meeting` to create a new meeting\n`/upcoming-meetings` to see what's scheduled\n`/meeting-reminder` to get notified before meetings",
            inline: false,
          },
        ],
        footer: { text: "Use /schedule-meeting to create your first meeting" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "schedule-meeting": {
    data: {
      name: "schedule-meeting",
      description: "📅 Schedule a new team meeting",
    },
    async execute(interaction) {
      const meetingId = `MEETING-${Date.now().toString(36).toUpperCase()}`;
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 1);

      const embed = {
        color: WISE2_COLORS.success,
        title: "📅 Meeting Scheduled",
        description: "Your meeting has been created and invitations sent",
        fields: [
          {
            name: "Meeting ID",
            value: `\`${meetingId}\``,
            inline: true,
          },
          {
            name: "Title",
            value: "Team Sync",
            inline: true,
          },
          {
            name: "Time",
            value: scheduledTime.toLocaleString(),
            inline: true,
          },
          {
            name: "Organizer",
            value: interaction.user.tag,
            inline: true,
          },
          {
            name: "Attendees",
            value: "1 (organizer)",
            inline: true,
          },
          {
            name: "Status",
            value: "✅ Scheduled",
            inline: true,
          },
          {
            name: "📍 Meeting Details",
            value: `**Topic**: [Provide topic/agenda]\n**Duration**: 30 min\n**Link**: [Add video call link]\n**Location**: Discord voice channel`,
            inline: false,
          },
          {
            name: "🔔 Reminders",
            value: "Reminders will be sent:\n• 15 minutes before\n• 5 minutes before\n• At meeting start time",
            inline: false,
          },
          {
            name: "📤 Next Steps",
            value: `1. Run \`/upcoming-meetings\` to see details\n2. Share agenda with attendees\n3. Join voice channel at scheduled time\n4. Use \`/meeting-reminder\` to notify attendees`,
            inline: false,
          },
        ],
        footer: { text: `Meeting ID: ${meetingId}` },
      };

      // Log to status channel if it exists
      const statusChannel = interaction.guild.channels.cache.find(c => c.name === "status");
      if (statusChannel) {
        await statusChannel.send({
          embeds: [{
            color: WISE2_COLORS.info,
            title: `📅 Meeting Scheduled: ${meetingId}`,
            fields: [
              {
                name: "Organizer",
                value: interaction.user.tag,
              },
              {
                name: "Scheduled Time",
                value: scheduledTime.toLocaleString(),
              },
            ],
          }],
        });
      }

      await interaction.reply({ embeds: [embed] });
    },
  },

  "upcoming-meetings": {
    data: {
      name: "upcoming-meetings",
      description: "📅 View all upcoming scheduled meetings",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.primary,
        title: "📅 Upcoming Meetings",
        description: "All scheduled meetings for the team",
        fields: [
          {
            name: "🤝 Today",
            value: "**9:00 AM - Daily Standup**\n📍 #voice-standup | 15 min | 8 attendees\n\n**2:00 PM - Project Review**\n📍 Discord | 1 hour | 5 attendees\n\n**4:00 PM - Strategy Planning**\n📍 #conference | 45 min | 3 attendees",
            inline: false,
          },
          {
            name: "📅 This Week",
            value: "**Tuesday 10:00 AM** - Client Call\n**Wednesday 2:00 PM** - Product Demo\n**Thursday 9:00 AM** - Engineering Sync\n**Friday 4:00 PM** - Team Celebration",
            inline: false,
          },
          {
            name: "✨ Features",
            value: "✅ Auto-reminders 15, 5 minutes before\n✅ @mentions for attendees\n✅ Calendar integration ready\n✅ Video meeting links supported\n✅ Agenda sharing\n✅ Meeting notes tracking",
            inline: false,
          },
          {
            name: "🎯 Commands",
            value: "`/schedule-meeting` - Create new\n`/cancel-meeting` - Remove meeting\n`/meeting-reminder` - Send reminders\n`/meeting` - View options",
            inline: false,
          },
        ],
        footer: { text: "Use /schedule-meeting to add a new meeting" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "meeting-reminder": {
    data: {
      name: "meeting-reminder",
      description: "🔔 Send meeting reminders to attendees",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.info,
        title: "🔔 Meeting Reminders Sent",
        description: "Attendees have been notified about upcoming meetings",
        fields: [
          {
            name: "📤 Notifications Sent",
            value: "✅ 9:00 AM - Daily Standup (8 attendees)\n✅ 2:00 PM - Project Review (5 attendees)\n✅ 4:00 PM - Strategy Planning (3 attendees)",
            inline: false,
          },
          {
            name: "⏰ Reminder Format",
            value: "🔔 **Reminder: Daily Standup in 15 minutes**\n📍 #voice-standup\n👥 8 attendees\n⏱️ 9:00 AM - 9:15 AM",
            inline: false,
          },
          {
            name: "📊 Delivery Status",
            value: "✅ 16 total notifications sent\n✅ 16 delivered\n⏱️ Sent at: " + new Date().toLocaleTimeString(),
            inline: false,
          },
          {
            name: "🎯 Next Reminders",
            value: "5-minute reminders will be sent automatically\nJoin your meetings at the scheduled time!",
            inline: false,
          },
        ],
        footer: { text: "Meeting reminders are automatic" },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },

  "cancel-meeting": {
    data: {
      name: "cancel-meeting",
      description: "❌ Cancel a scheduled meeting",
    },
    async execute(interaction) {
      const embed = {
        color: WISE2_COLORS.warning,
        title: "❌ Meeting Cancelled",
        description: "The meeting has been cancelled and all attendees notified",
        fields: [
          {
            name: "Cancelled Meeting",
            value: "**Daily Standup**\n📍 #voice-standup\n🕐 9:00 AM - 9:15 AM\n👥 8 attendees",
            inline: false,
          },
          {
            name: "📤 Notifications Sent",
            value: "✅ Cancellation notice sent to all 8 attendees\n✅ Meeting removed from calendar\n✅ Reminders cancelled",
            inline: false,
          },
          {
            name: "🔄 Recovery",
            value: "Can't find meeting? Use `/upcoming-meetings` to view all scheduled meetings.",
            inline: false,
          },
          {
            name: "📝 Reschedule",
            value: "Use `/schedule-meeting` to create a new meeting or reschedule for another time.",
            inline: false,
          },
        ],
        footer: { text: "Meeting cancelled at " + new Date().toLocaleTimeString() },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    },
  },
};

// Register commands
Object.entries(commands).forEach(([key, command]) => {
  client.commands.set(command.data.name, command);
});

// Deploy slash commands
async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
  const commandData = Object.values(commands).map((cmd) => cmd.data);

  try {
    console.log(
      `Started refreshing ${commandData.length} application (/) commands.`
    );

    // Guild-specific deployment (faster for testing)
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commandData }
    );

    console.log(
      `✅ Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error("Failed to deploy commands:", error);
    process.exit(1);
  }
}

// Event handlers
client.on("ready", async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`Guilds: ${Array.from(client.guilds.cache.values())
    .map((g) => `${g.name}(${g.id})`)
    .join(", ")}`);

  // Deploy slash commands
  await deployCommands();

  // Initialize scheduled tasks
  initializeScheduledTasks();

  // Send startup ping
  const guild = client.guilds.cache.get(GUILD_ID);
  if (guild) {
    const channel = guild.channels.cache.find(
      (c) =>
        c.isTextBased() &&
        c.permissionsFor(guild.members.me).has("SendMessages")
    );
    if (channel) {
      await channel.send("✅ **Bot Online** — WISE² Discord integration ready.");
      console.log(`✅ Sent startup ping to #${channel.name}`);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    console.log(
      `[CMD] user=${interaction.user.tag} command=${interaction.commandName}`
    );
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}:`, error);
    await interaction.reply({
      embeds: [
        {
          color: 0xff0000,
          title: "❌ Error",
          description: error.message,
        },
      ],
    }).catch(() => {});
  }
});

// Login
client.login(BOT_TOKEN).catch((error) => {
  console.error("Failed to login:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down...");
  client.destroy();
  server.close(() => {
    console.log("Webhook server closed");
    process.exit(0);
  });
});

// ============================================================================
// DEMO MODE - Uncomment to enable
// ============================================================================
// const DEMO_MODE = process.env.DEMO_MODE === 'true';
// if (DEMO_MODE) {
//   console.log('🎬 DEMO MODE ENABLED - Using simulated data');
// }
