'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';

const creativeCommand = new SlashCommandBuilder()
  .setName('create')
  .setDescription('WISE² Creative Studio')
  .addSubcommand((sub) =>
    sub.setName('image')
      .setDescription('Generate AI image')
      .addStringOption((opt) =>
        opt.setName('prompt').setDescription('Image description').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('style').setDescription('Art style').addChoices(
          { name: 'Photorealistic', value: 'photorealistic' },
          { name: 'Digital Art', value: 'digital_art' },
          { name: '3D Render', value: '3d_render' },
          { name: 'Illustration', value: 'illustration' },
          { name: 'Comic', value: 'comic' },
          { name: 'Oil Painting', value: 'oil_painting' }
        )
      )
      .addStringOption((opt) =>
        opt.setName('size').setDescription('Image size').addChoices(
          { name: '512x512', value: '512' },
          { name: '768x768', value: '768' },
          { name: '1024x1024', value: '1024' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('video')
      .setDescription('Generate AI video')
      .addStringOption((opt) =>
        opt.setName('brief').setDescription('Video brief/script').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('type').setDescription('Video type').addChoices(
          { name: 'Explainer', value: 'explainer' },
          { name: 'Ad', value: 'ad' },
          { name: 'Product Demo', value: 'product_demo' },
          { name: 'Story', value: 'story' },
          { name: 'Tutorial', value: 'tutorial' }
        )
      )
      .addStringOption((opt) =>
        opt.setName('duration').setDescription('Video duration').addChoices(
          { name: '15 seconds', value: '15' },
          { name: '30 seconds', value: '30' },
          { name: '60 seconds', value: '60' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('mix')
      .setDescription('AI audio mixing')
      .addStringOption((opt) =>
        opt.setName('project').setDescription('Project name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('preset').setDescription('Mixing preset').addChoices(
          { name: 'Podcast', value: 'podcast' },
          { name: 'Music Track', value: 'music' },
          { name: 'Voice Over', value: 'voiceover' },
          { name: 'Ambient', value: 'ambient' },
          { name: 'Balanced', value: 'balanced' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('voice')
      .setDescription('Generate AI voice/TTS')
      .addStringOption((opt) =>
        opt.setName('text').setDescription('Text to convert to speech').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('voice').setDescription('Voice type').addChoices(
          { name: 'Professional Male', value: 'pro_male' },
          { name: 'Professional Female', value: 'pro_female' },
          { name: 'Casual Male', value: 'casual_male' },
          { name: 'Casual Female', value: 'casual_female' },
          { name: 'Narrator', value: 'narrator' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('edit')
      .setDescription('Edit existing media')
      .addStringOption((opt) =>
        opt.setName('media_id').setDescription('Media ID to edit').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('instruction').setDescription('What to change/improve').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('batch')
      .setDescription('Batch create multiple variations')
      .addStringOption((opt) =>
        opt.setName('brief').setDescription('Base brief/description').setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt.setName('quantity').setDescription('Number of variations (1-10)').setMinValue(1).setMaxValue(10)
      )
      .addStringOption((opt) =>
        opt.setName('type').setDescription('Content type').addChoices(
          { name: 'Images', value: 'images' },
          { name: 'Videos', value: 'videos' },
          { name: 'Social Posts', value: 'posts' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('status')
      .setDescription('Check generation status')
      .addStringOption((opt) =>
        opt.setName('job_id').setDescription('Job ID to check').setRequired(true)
      )
  );

async function handleCreativeCommand(interaction, jwtToken) {
  await interaction.deferReply();

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'image':
        return handleImageGeneration(interaction, jwtToken);
      case 'video':
        return handleVideoGeneration(interaction, jwtToken);
      case 'mix':
        return handleAudioMixing(interaction, jwtToken);
      case 'voice':
        return handleVoiceGeneration(interaction, jwtToken);
      case 'edit':
        return handleMediaEdit(interaction, jwtToken);
      case 'batch':
        return handleBatchGeneration(interaction, jwtToken);
      case 'status':
        return handleJobStatus(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[creative-studio] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleImageGeneration(interaction, jwtToken) {
  const prompt = interaction.options.getString('prompt');
  const style = interaction.options.getString('style') || 'digital_art';
  const size = interaction.options.getString('size') || '1024';

  await interaction.editReply('🎨 Generating image... (this may take 1-3 minutes)');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/image/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ prompt, style, size }),
      timeout: 300000,
    });

    if (!res.ok) throw new Error(`Image generation failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xff9d00)
      .setTitle('🖼️ Image Generated')
      .setImage(data.imageUrl)
      .addFields([
        { name: 'Prompt', value: prompt },
        { name: 'Style', value: style },
        { name: 'Size', value: `${size}x${size}` },
      ])
      .setFooter({ text: `Job ID: ${data.jobId}` })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Download')
          .setURL(data.downloadUrl || '#')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Regenerate')
          .setCustomId(`regen_image_${data.jobId}`)
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleVideoGeneration(interaction, jwtToken) {
  const brief = interaction.options.getString('brief');
  const type = interaction.options.getString('type') || 'explainer';
  const duration = interaction.options.getString('duration') || '30';

  await interaction.editReply('🎬 Generating video... (this may take 5-15 minutes)\n⏳ You will be notified when complete.');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ brief, type, duration, discordUserId: interaction.user.id }),
      timeout: 600000,
    });

    if (!res.ok) throw new Error(`Video generation failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('🎥 Video Generation Started')
      .addFields([
        { name: 'Type', value: type },
        { name: 'Duration', value: `${duration} seconds` },
        { name: 'Status', value: 'Processing' },
        { name: 'Job ID', value: data.jobId },
        { name: 'Estimated Time', value: `${Math.ceil(duration / 30 * 10)} minutes` },
      ])
      .setDescription('You will receive a notification in Discord when the video is ready.')
      .setFooter({ text: 'Creative Studio' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleAudioMixing(interaction, jwtToken) {
  const project = interaction.options.getString('project');
  const preset = interaction.options.getString('preset') || 'balanced';

  await interaction.editReply('🎚️ Applying mixing preset... (1-2 minutes)');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/audio/mix`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ project, preset }),
      timeout: 180000,
    });

    if (!res.ok) throw new Error(`Audio mixing failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('🎵 Audio Mix Complete')
      .addFields([
        { name: 'Project', value: project },
        { name: 'Preset', value: preset },
        { name: 'Status', value: 'Ready' },
        { name: 'Loudness (LUFS)', value: data.loudness || '-14' },
      ])
      .setFooter({ text: 'Sound Lab' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Listen')
          .setURL(data.previewUrl || '#')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Export')
          .setCustomId(`export_mix_${data.jobId}`)
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleVoiceGeneration(interaction, jwtToken) {
  const text = interaction.options.getString('text');
  const voice = interaction.options.getString('voice') || 'pro_female';

  await interaction.editReply('🎤 Generating voice... (30-60 seconds)');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/voice/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ text, voice }),
      timeout: 120000,
    });

    if (!res.ok) throw new Error(`Voice generation failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle('🗣️ Voice Generated')
      .addFields([
        { name: 'Voice', value: voice },
        { name: 'Duration', value: data.duration || 'N/A' },
        { name: 'Text Length', value: String(text.length) },
      ])
      .setDescription(`\`\`\`${text}\`\`\``)
      .setFooter({ text: 'TTS Engine' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Play')
          .setURL(data.audioUrl || '#')
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Download')
          .setURL(data.downloadUrl || '#')
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleMediaEdit(interaction, jwtToken) {
  const mediaId = interaction.options.getString('media_id');
  const instruction = interaction.options.getString('instruction');

  await interaction.editReply('✏️ Processing edit instruction... (2-5 minutes)');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/media/edit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ mediaId, instruction }),
      timeout: 300000,
    });

    if (!res.ok) throw new Error(`Media edit failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('✨ Edit Complete')
      .addFields([
        { name: 'Original ID', value: mediaId },
        { name: 'New Version', value: data.newMediaId },
        { name: 'Status', value: 'Ready' },
      ])
      .setFooter({ text: 'Edit ID: ' + data.editId })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('View')
          .setCustomId(`view_media_${data.newMediaId}`)
          .setStyle(ButtonStyle.Secondary)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleBatchGeneration(interaction, jwtToken) {
  const brief = interaction.options.getString('brief');
  const quantity = interaction.options.getInteger('quantity') || 5;
  const type = interaction.options.getString('type') || 'images';

  await interaction.editReply(`🔄 Generating ${quantity} variations... (ETA: ${quantity * 2} minutes)\n📢 Updates will be sent to this channel.`);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ brief, quantity, type, discordUserId: interaction.user.id }),
      timeout: 900000,
    });

    if (!res.ok) throw new Error(`Batch generation failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xff9d00)
      .setTitle('📦 Batch Generation Started')
      .addFields([
        { name: 'Type', value: type },
        { name: 'Quantity', value: String(quantity) },
        { name: 'Batch ID', value: data.batchId },
        { name: 'Status', value: 'Processing 1/' + quantity },
      ])
      .setFooter({ text: 'You will be notified as each item completes' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleJobStatus(interaction, jwtToken) {
  const jobId = interaction.options.getString('job_id');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/creative/job/${jobId}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Job fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(data.status === 'completed' ? 0x00ff7f : 0xff9d00)
      .setTitle('📊 Generation Status')
      .addFields([
        { name: 'Job ID', value: jobId },
        { name: 'Status', value: data.status },
        { name: 'Progress', value: `${data.progress || 0}%` },
        { name: 'Type', value: data.type || 'Unknown' },
        { name: 'Created', value: new Date(data.createdAt).toLocaleString() },
      ])
      .setFooter({ text: 'Creative Studio' })
      .setTimestamp();

    if (data.resultUrl) {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('View Result')
            .setURL(data.resultUrl)
            .setStyle(ButtonStyle.Link)
        );
      return interaction.editReply({ embeds: [embed], components: [row] });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  creativeCommand,
  handleCreativeCommand,
};
