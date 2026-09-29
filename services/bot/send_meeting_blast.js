require("dotenv").config();
const { WebhookClient, EmbedBuilder } = require("discord.js");

async function sendMeetingBlast() {
  try {
    const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_STATUS });

    const embed = new EmbedBuilder()
      .setColor(0x0055ff)
      .setTitle("📅 MEETING REMINDER")
      .setDescription("WISE² Daily Standup - Starting Soon!")
      .addFields(
        { name: "⏰ Time", value: "8:45 AM", inline: true },
        { name: "📍 Channel", value: "#general", inline: true },
        { name: "📋 Agenda", value: "Daily sync: progress, blockers, next steps", inline: false },
        { name: "⚡ Action Required", value: "Join now!", inline: false }
      )
      .setFooter({ text: "WISE² Calendar Integration" })
      .setTimestamp();

    await webhook.send({
      content: "🚨 @everyone - Meeting reminder!",
      embeds: [embed]
    });

    console.log("✅ Meeting blast sent to #status");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

sendMeetingBlast();
