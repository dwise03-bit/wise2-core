require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { exec } = require("child_process");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const ADMIN_ID = process.env.ADMIN_ID;

function run(message, cmd) {
  exec(cmd, (err, stdout, stderr) => {
    if (err) return message.reply("❌ Error");
    message.reply("```" + (stdout || stderr || "done").slice(0, 1800) + "```");
  });
}

client.on("messageCreate", (message) => {
  console.log(`[MSG] from=${message.author.id} content=${message.content}`);
  if (message.author.bot) return;
  if (message.author.id !== ADMIN_ID) {
    console.log(`[MSG] ignored — not admin (expected ${ADMIN_ID})`);
    return;
  }

  const args = message.content.trim().split(" ");
  const cmd = args[0];

  if (cmd === "!status") return run(message, "docker ps --format 'table {{.Names}}\t{{.Status}}'");
  if (cmd === "!update") return run(message, "wd update");
  if (cmd === "!restart") return run(message, "docker compose restart");
  if (cmd === "!logs") return run(message, `docker compose logs --tail=25 ${args[1] || ""}`);

  // Hermes website builder command
  if (cmd === "!website") {
    const subcommand = args[1];
    const wsServer = process.env.WISE2_API || "http://localhost:3000";

    if (!subcommand) {
      return message.reply(
        "🏗️ **Hermes Website Builder**\n" +
        "```\n" +
        "!website status     - Check builder service status\n" +
        "!website jobs       - List recent website build jobs\n" +
        "!website help       - Full Hermes documentation\n" +
        "!website api        - API endpoint info\n" +
        "```"
      );
    }

    if (subcommand === "status") {
      return run(message, `curl -s ${wsServer}/api/v1/hermes/status | jq . || echo "Hermes service unavailable"`);
    }

    if (subcommand === "jobs") {
      return run(message, `curl -s ${wsServer}/api/v1/hermes/jobs | jq . || echo "No jobs found"`);
    }

    if (subcommand === "help") {
      return message.reply(
        "🏗️ **Hermes Website Builder**\n\n" +
        "Automates website creation from design to deployment.\n\n" +
        "**Features:**\n" +
        "• Design → HTML/CSS conversion\n" +
        "• Full multi-page site generation\n" +
        "• Component library scaffolding\n" +
        "• Deployment automation\n" +
        "• Asset optimization\n\n" +
        `**Web Interface:** ${wsServer}/hermes\n` +
        `**API Docs:** ${wsServer}/api/v1/hermes/docs\n\n` +
        "**Commands:** `!website status` `!website jobs` `!website api`"
      );
    }

    if (subcommand === "api") {
      return message.reply(
        "🔌 **Hermes API**\n\n" +
        `Base: \`${wsServer}/api/v1/hermes\`\n\n` +
        "**Endpoints:**\n" +
        "```\n" +
        "POST   /design-to-code    - Convert design to HTML/CSS\n" +
        "POST   /site-generator    - Build full website from spec\n" +
        "POST   /component         - Generate single component\n" +
        "POST   /deploy            - Deploy to hosting\n" +
        "GET    /jobs              - List build jobs\n" +
        "GET    /jobs/:id          - Get job details\n" +
        "GET    /status            - Service status\n" +
        "```\n" +
        `Full docs: ${wsServer}/api/v1/hermes/docs`
      );
    }
  }

  message.reply("Commands: !status !update !restart !logs !website");
});

client.once("ready", () => {
  console.log(`LOGIN SUCCESS: ${client.user.tag} | ADMIN_ID=${ADMIN_ID}`);
  console.log(`Guilds: ${client.guilds.cache.map(g => `${g.name}(${g.id})`).join(', ')}`);
  // Send startup ping to first text channel the bot can see
  const guild = client.guilds.cache.first();
  if (guild) {
    const channel = guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('SendMessages'));
    if (channel) {
      channel.send('✅ Admin bot online. Commands: `!status` `!logs [service]` `!restart`').catch(console.error);
      console.log(`Sent startup ping to #${channel.name}`);
    } else {
      console.log('No writable channel found');
    }
  } else {
    console.log('Bot is in NO guilds');
  }
});

client.login(process.env.BOT_TOKEN).catch(console.error);
