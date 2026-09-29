/**
 * Discord Command: Generate Campaign Images
 * Asks Hermes to orchestrate PIFF CITY image generation
 */

import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import generationService from '../../services/hermes-image-generation';

export const data = new SlashCommandBuilder()
  .setName('generate-campaign')
  .setDescription('Generate PIFF CITY campaign images with Hermes optimization')
  .addStringOption((option) =>
    option
      .setName('campaign')
      .setDescription('Campaign type (hero, split, workforce, grid, cta)')
      .setRequired(true)
      .addChoices(
        { name: 'Hero Announcement', value: 'hero-announcement' },
        { name: 'Split Identity', value: 'split-identity' },
        { name: 'Digital Workforce', value: 'workforce' },
        { name: 'Capabilities Grid', value: 'grid' },
        { name: 'Call to Action', value: 'cta' }
      )
  )
  .addStringOption((option) =>
    option
      .setName('style')
      .setDescription('Optional style override (e.g., "dark cyberpunk")')
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  const campaign = interaction.options.getString('campaign', true);
  const style = interaction.options.getString('style') || 'cinematic luxury';
  const userId = interaction.user.id;

  // Defer reply (generation takes 3-4 minutes)
  await interaction.deferReply();

  try {
    // Start generation with Hermes
    const result = await generationService.generateCampaign({
      campaign,
      style,
      userId,
    });

    if (!result.success) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Generation Failed')
        .setDescription(result.hermesInsights || 'Unknown error during generation')
        .setTimestamp();

      return await interaction.editReply({ embeds: [errorEmbed] });
    }

    // Build response embed
    const successEmbed = new EmbedBuilder()
      .setColor('#00d4ff')
      .setTitle('🎬 Campaign Generated Successfully!')
      .setDescription(
        `**Campaign**: ${campaign}\n**Model**: SDXL 1.0 (GPU)\n**Images**: ${result.images.length} posts\n**Generated**: ${result.metadata.timestamp}`
      )
      .addFields(
        {
          name: '🧠 Hermes Insights',
          value: result.hermesInsights?.substring(0, 1024) || 'No insights',
        },
        {
          name: '📸 Output Files',
          value:
            result.images.map((img) => `\`${img}\``).join('\n') ||
            'No files generated',
        },
        {
          name: '💾 Next Steps',
          value:
            '1. Download images from `instagram_posts/`\n2. Import to Figma for final polish\n3. Schedule via Meta Business Suite',
        }
      )
      .setFooter({
        text: 'PIFF CITY × WISE² Image Generation powered by Hermes',
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });

    // Send images to channel if available
    if (result.images.length > 0) {
      const channel = await interaction.client.channels.fetch(
        interaction.channelId
      );
      if (channel && channel.isTextBased()) {
        const imageEmbed = new EmbedBuilder()
          .setColor('#39ff14')
          .setTitle('📷 Generated Campaign Images')
          .setDescription(
            `\`\`\`\n${result.images.map((img, i) => `${i + 1}. ${img}`).join('\n')}\n\`\`\``
          )
          .setFooter({ text: 'Download and use in Figma' });

        await channel.send({ embeds: [imageEmbed] });
      }
    }
  } catch (error) {
    console.error('Command error:', error);

    const errorEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('⚠️ Generation Error')
      .setDescription(
        `Failed to generate campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}
