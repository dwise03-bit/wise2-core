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

  message.reply("Commands: !status !update !restart !logs");
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
