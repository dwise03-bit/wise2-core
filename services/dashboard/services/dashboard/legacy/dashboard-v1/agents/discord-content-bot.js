/**
 * Discord Content Submission Bot
 * Allows users to submit content via Discord that gets added to the pipeline
 * Commands: /submit, /pending, /approve, /reject, /stats
 */

const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pg = require('pg');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/wisedefense',
  ssl: false,
});

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;
const APPROVAL_CHANNEL_ID = process.env.DISCORD_APPROVAL_CHANNEL_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const botState = {
  isReady: false,
  submissionsReceived: 0,
  errors: [],
};

/**
 * Submit new content/article
 */
async function submitContent(title, content, source, url, userId, userName) {
  try {
    const result = await pool.query(
      `INSERT INTO news_articles (title, content, source_name, source_url, is_processed)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id`,
      [title, content, `Discord - ${userName}`, url || `discord://submission/${userId}`]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error('[DISCORD-BOT] Error submitting content:', error.message);
    return null;
  }
}

/**
 * Get pending submissions
 */
async function getPendingSubmissions() {
  try {
    const result = await pool.query(
      `SELECT id, title, content, source_name, created_at
       FROM news_articles
       WHERE is_processed = false
       AND source_name LIKE 'Discord%'
       ORDER BY created_at DESC
       LIMIT 10`
    );
    return result.rows;
  } catch (error) {
    console.error('[DISCORD-BOT] Error fetching pending:', error.message);
    return [];
  }
}

/**
 * Get statistics
 */
async function getStats() {
  try {
    const result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM news_articles WHERE source_name LIKE 'Discord%') as discord_submissions,
        (SELECT COUNT(*) FROM news_articles WHERE is_processed = false AND source_name LIKE 'Discord%') as pending,
        (SELECT COUNT(*) FROM youtube_videos) as youtube_videos,
        (SELECT COUNT(*) FROM social_posts_generated WHERE status = 'posted') as posts_published`
    );
    return result.rows[0];
  } catch (error) {
    console.error('[DISCORD-BOT] Error fetching stats:', error.message);
    return null;
  }
}

/**
 * Register slash commands
 */
async function registerCommands() {
  try {
    const commands = [
      new SlashCommandBuilder()
        .setName('submit')
        .setDescription('Submit new content to the platform')
        .addStringOption((option) =>
          option
            .setName('title')
            .setDescription('Article title')
            .setRequired(true)
            .setMaxLength(300)
        )
        .addStringOption((option) =>
          option
            .setName('content')
            .setDescription('Article content/summary')
            .setRequired(true)
            .setMaxLength(2000)
        )
        .addStringOption((option) =>
          option
            .setName('source')
            .setDescription('Where did you find this?')
            .setRequired(false)
            .setMaxLength(100)
        )
        .addStringOption((option) =>
          option
            .setName('url')
            .setDescription('Link to original content')
            .setRequired(false)
        ),

      new SlashCommandBuilder()
        .setName('pending')
        .setDescription('View pending submissions awaiting approval'),

      new SlashCommandBuilder()
        .setName('approve')
        .setDescription('Approve a submission for social media')
        .addIntegerOption((option) =>
          option
            .setName('article_id')
            .setDescription('Article ID to approve')
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName('reject')
        .setDescription('Reject a submission')
        .addIntegerOption((option) =>
          option
            .setName('article_id')
            .setDescription('Article ID to reject')
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View platform statistics'),
    ];

    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
      await guild.commands.set(commands);
      console.log('[DISCORD-BOT] Slash commands registered to guild:', guild.name);
    } else {
      console.error('[DISCORD-BOT] Guild not found:', GUILD_ID);
    }
  } catch (error) {
    console.error('[DISCORD-BOT] Error registering commands:', error.message);
  }
}

client.on('ready', async () => {
  console.log('[DISCORD-BOT] Bot logged in as', client.user.tag);
  botState.isReady = true;

  await registerCommands();
  console.log('[DISCORD-BOT] Ready to receive submissions');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const userId = interaction.user.id;
  const userName = interaction.user.username;

  try {
    if (command === 'submit') {
      await interaction.deferReply({ ephemeral: true });

      const title = interaction.options.getString('title');
      const content = interaction.options.getString('content');
      const source = interaction.options.getString('source') || 'Discord User';
      const url = interaction.options.getString('url');

      const articleId = await submitContent(title, content, source, url, userId, userName);

      if (articleId) {
        const embed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle('✅ Content Submitted Successfully')
          .addFields(
            { name: 'Article ID', value: `${articleId}`, inline: true },
            { name: 'Status', value: 'Pending Approval', inline: true },
            { name: 'Title', value: title },
            { name: 'Content', value: content.substring(0, 200) + '...' }
          )
          .setFooter({ text: 'Your submission is now in the approval queue' });

        await interaction.editReply({ embeds: [embed] });

        // Post to approval channel
        if (APPROVAL_CHANNEL_ID) {
          const channel = client.channels.cache.get(APPROVAL_CHANNEL_ID);
          if (channel) {
            const approvalEmbed = new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('📋 New Discord Submission')
              .addFields(
                { name: 'Submitted By', value: userName, inline: true },
                { name: 'Article ID', value: `${articleId}`, inline: true },
                { name: 'Title', value: title },
                { name: 'Content', value: content.substring(0, 300) + '...' },
                {
                  name: 'Source',
                  value: source,
                  inline: true,
                },
                {
                  name: 'Actions',
                  value: `/approve ${articleId} or /reject ${articleId}`,
                  inline: false,
                }
              );

            await channel.send({ embeds: [approvalEmbed] });
          }
        }

        botState.submissionsReceived++;
      } else {
        await interaction.editReply({
          content: '❌ Error submitting content. Please try again.',
        });
      }
    } else if (command === 'pending') {
      await interaction.deferReply({ ephemeral: true });

      const pending = await getPendingSubmissions();

      if (pending.length === 0) {
        await interaction.editReply({ content: '✨ No pending submissions' });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`📋 Pending Submissions (${pending.length})`)
        .setDescription(
          pending
            .map(
              (p) =>
                `**[${p.id}]** ${p.title}\n_${new Date(p.created_at).toLocaleDateString()}_`
            )
            .join('\n\n')
        );

      await interaction.editReply({ embeds: [embed] });
    } else if (command === 'approve') {
      await interaction.deferReply({ ephemeral: true });

      const articleId = interaction.options.getInteger('article_id');

      // Mark as processed
      await pool.query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);

      // Create high-priority review
      await pool.query(
        `INSERT INTO content_reviews (article_id, relevance_score, sentiment, priority_level, recommended_for_social)
         VALUES ($1, 0.9, 'positive', 'high', true)
         ON CONFLICT (article_id) DO UPDATE SET priority_level = 'high', recommended_for_social = true`,
        [articleId]
      );

      const embed = new EmbedBuilder()
        .setColor('#00AA00')
        .setTitle('✅ Article Approved')
        .addFields({ name: 'Article ID', value: `${articleId}`, inline: true })
        .setDescription('This article has been approved for social media posting!');

      await interaction.editReply({ embeds: [embed] });
    } else if (command === 'reject') {
      await interaction.deferReply({ ephemeral: true });

      const articleId = interaction.options.getInteger('article_id');

      await pool.query('UPDATE news_articles SET is_processed = true WHERE id = $1', [articleId]);

      const embed = new EmbedBuilder()
        .setColor('#DD0000')
        .setTitle('❌ Article Rejected')
        .addFields({ name: 'Article ID', value: `${articleId}`, inline: true })
        .setDescription('This article has been rejected.');

      await interaction.editReply({ embeds: [embed] });
    } else if (command === 'stats') {
      await interaction.deferReply({ ephemeral: true });

      const stats = await getStats();

      if (stats) {
        const embed = new EmbedBuilder()
          .setColor('#9900FF')
          .setTitle('📊 Platform Statistics')
          .addFields(
            { name: 'Discord Submissions', value: `${stats.discord_submissions}`, inline: true },
            { name: 'Pending Approval', value: `${stats.pending}`, inline: true },
            { name: 'YouTube Videos', value: `${stats.youtube_videos}`, inline: true },
            { name: 'Posts Published', value: `${stats.posts_published}`, inline: true }
          );

        await interaction.editReply({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('[DISCORD-BOT] Command error:', error.message);
    botState.errors.push(error.message);

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: '❌ An error occurred processing your command.' });
    } else {
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true });
    }
  }
});

client.on('error', (error) => {
  console.error('[DISCORD-BOT] Client error:', error);
  botState.errors.push(error.message);
});

// Login
client.login(DISCORD_TOKEN);

// Log status periodically
setInterval(() => {
  console.log('[DISCORD-BOT] Status:', {
    ready: botState.isReady,
    submissions: botState.submissionsReceived,
    errors: botState.errors.length,
  });
}, 3600000); // Every hour
