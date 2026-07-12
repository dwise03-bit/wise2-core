const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const pg = require("pg");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", async () => {
  console.log("[DISCORD-REVIEWER] Bot logged in as", client.user.tag);

  const commands = [
    new SlashCommandBuilder()
      .setName("pending_videos")
      .setDescription("View pending videos for review"),

    new SlashCommandBuilder()
      .setName("approve_video")
      .setDescription("Approve a video for upload")
      .addIntegerOption((o) =>
        o
          .setName("video_id")
          .setDescription("Video ID to approve")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("reject_video")
      .setDescription("Reject a video")
      .addIntegerOption((o) =>
        o
          .setName("video_id")
          .setDescription("Video ID to reject")
          .setRequired(true)
      ),

    new SlashCommandBuilder()
      .setName("video_stats")
      .setDescription("View video generation statistics"),
  ];

  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
  if (guild) {
    await guild.commands.set(commands);
    console.log("[DISCORD-REVIEWER] Commands registered");
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === "pending_videos") {
      await interaction.deferReply({ ephemeral: true });

      const result = await pool.query(
        "SELECT id, article_id, title, created_at FROM youtube_videos WHERE status = $1 ORDER BY created_at DESC LIMIT 10",
        ["pending"]
      );

      if (result.rows.length === 0) {
        await interaction.editReply("✨ No pending videos!");
        return;
      }

      const embed = new EmbedBuilder()
        .setColor("#FF9900")
        .setTitle("📹 Pending Videos for Review")
        .setDescription(`${result.rows.length} videos waiting`)
        .addFields(
          result.rows.map((v) => ({
            name: `Video #${v.id} - Article #${v.article_id}`,
            value: `${v.title.substring(0, 50)}...\n_Created: ${new Date(v.created_at).toLocaleDateString()}_`,
          }))
        )
        .setFooter({
          text: "Use /approve_video or /reject_video to manage",
        });

      await interaction.editReply({ embeds: [embed] });
    } 
    
    else if (interaction.commandName === "approve_video") {
      await interaction.deferReply({ ephemeral: true });

      const videoId = interaction.options.getInteger("video_id");

      const videoCheck = await pool.query(
        "SELECT title FROM youtube_videos WHERE id = $1",
        [videoId]
      );

      if (videoCheck.rows.length === 0) {
        await interaction.editReply("❌ Video not found");
        return;
      }

      await pool.query(
        "UPDATE youtube_videos SET status = $1 WHERE id = $2",
        ["approved", videoId]
      );

      const embed = new EmbedBuilder()
        .setColor("#00AA00")
        .setTitle("✅ Video Approved")
        .setDescription(`Video #${videoId} approved for upload`)
        .addFields({
          name: "Title",
          value: videoCheck.rows[0].title.substring(0, 100),
        })
        .setFooter({ text: "Will be uploaded in next processing cycle" });

      await interaction.editReply({ embeds: [embed] });
    } 
    
    else if (interaction.commandName === "reject_video") {
      await interaction.deferReply({ ephemeral: true });

      const videoId = interaction.options.getInteger("video_id");

      const videoCheck = await pool.query(
        "SELECT title FROM youtube_videos WHERE id = $1",
        [videoId]
      );

      if (videoCheck.rows.length === 0) {
        await interaction.editReply("❌ Video not found");
        return;
      }

      await pool.query(
        "UPDATE youtube_videos SET status = $1 WHERE id = $2",
        ["rejected", videoId]
      );

      const embed = new EmbedBuilder()
        .setColor("#DD0000")
        .setTitle("❌ Video Rejected")
        .setDescription(`Video #${videoId} rejected`)
        .addFields({
          name: "Title",
          value: videoCheck.rows[0].title.substring(0, 100),
        });

      await interaction.editReply({ embeds: [embed] });
    } 
    
    else if (interaction.commandName === "video_stats") {
      await interaction.deferReply({ ephemeral: true });

      const stats = await pool.query(
        "SELECT status, COUNT(*) as count FROM youtube_videos GROUP BY status"
      );

      const embed = new EmbedBuilder()
        .setColor("#0099FF")
        .setTitle("📊 Video Generation Statistics")
        .addFields(
          stats.rows.map((s) => ({
            name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
            value: `${s.count} videos`,
            inline: true,
          }))
        );

      await interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error("[DISCORD-REVIEWER] Error:", error.message);
    await interaction.editReply("❌ Error processing command");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

process.on("SIGTERM", () => {
  console.log("[DISCORD-REVIEWER] Shutting down");
  pool.end();
  process.exit(0);
});
