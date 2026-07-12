/**
 * Discord Leaderboard Command
 * Shows top 10 members by points and streaks
 */

const { EmbedBuilder } = require('discord.js');
const pg = require('pg');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

module.exports = {
  name: 'leaderboard',
  description: 'Show top 10 members by points',

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const result = await pool.query(
        `SELECT member_id, total_points, streak_current
         FROM member_progress
         ORDER BY total_points DESC
         LIMIT 10`
      );

      if (result.rows.length === 0) {
        return await interaction.editReply('No members on leaderboard yet.');
      }

      let leaderboardText = '';
      result.rows.forEach((row, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        leaderboardText += `${medal} <@${row.member_id}> - ${row.total_points} pts 🔥 Streak: ${row.streak_current}\n`;
      });

      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle('🏆 Leaderboard')
        .setDescription(leaderboardText)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[LEADERBOARD] Error:', error);
      await interaction.editReply('Error fetching leaderboard.');
    }
  },
};
