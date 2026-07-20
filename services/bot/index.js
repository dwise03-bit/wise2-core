require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");
const { exec } = require("child_process");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
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

// Command Definitions
const commands = {
  status: {
    data: {
      name: "status",
      description: "Show system health status (git, docker, recent deploys)",
    },
    async execute(interaction) {
      const embed = {
        color: 0x00aa00,
        title: "🔍 System Status",
        fields: [],
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
  process.exit(0);
});
