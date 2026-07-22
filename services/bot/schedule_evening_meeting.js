require("dotenv").config();
const cron = require("node-cron");
const { WebhookClient, EmbedBuilder } = require("discord.js");

async function sendMeetingBlast() {
  try {
    const webhook = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_STATUS });

    const embed = new EmbedBuilder()
      .setColor(0x0055ff)
      .setTitle("📅 EVENING MEETING REMINDER")
      .setDescription("WISE² Team Sync - Starting Soon!")
      .addFields(
        { name: "⏰ Time", value: "8:45 PM", inline: true },
        { name: "📍 Channel", value: "#general", inline: true },
        { name: "📋 Agenda", value: "Evening standup: daily recap, blockers, planning", inline: false },
        { name: "⚡ Action Required", value: "Join now!", inline: false }
      )
      .setFooter({ text: "WISE² Calendar Integration" })
      .setTimestamp();

    await webhook.send({
      content: "🚨 @everyone - Team meeting in 5 minutes!",
      embeds: [embed]
    });

    console.log("✅ Meeting blast sent at 8:45 PM");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Schedule for 8:45 PM every day (20:45 in 24-hour format)
cron.schedule("45 20 * * *", sendMeetingBlast);
console.log("⏰ Meeting reminder scheduled for 8:45 PM daily");

// Keep process running
process.on("SIGINT", () => {
  console.log("Scheduler stopped");
  process.exit(0);
});
