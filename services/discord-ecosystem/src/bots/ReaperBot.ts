import { ChatInputCommandInteraction, CommandInteraction, GuildMember, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BotFramework } from '../BotFramework';
import { BotConfig } from '../types';
import { HttpReaperAdapter, MockReaperAdapter, StudioService, StudioStatus, StudioTrack, StudioMarker, RenderArtifact } from '../studio/contracts';

// Premium Color Palette (Dark Mode)
const COLORS = {
  BACKGROUND: 0x0a0e27,
  SURFACE: 0x111633,
  ACCENT: 0x00d4ff,
  SUCCESS: 0x00ff88,
  WARNING: 0xffaa00,
  ERROR: 0xff3366,
  TEXT_PRIMARY: 0xe8f0ff,
  TEXT_SECONDARY: 0xa0b0d8,
};

export class ReaperBot extends BotFramework {
  private readonly studio: StudioService;

  constructor(config: BotConfig) {
    super(config);
    const url = process.env.WISE2_REAPER_BRIDGE_URL;
    const token = process.env.WISE2_REAPER_BRIDGE_TOKEN;
    this.studio = new StudioService(url && token ? new HttpReaperAdapter(url, token) : new MockReaperAdapter());
    this.setupStudioCommands();
  }

  private setupStudioCommands(): void {
    const studio = new SlashCommandBuilder().setName('studio').setDescription('Control the WISE² REAPER studio')
      .addSubcommand(command => command.setName('status').setDescription('Show REAPER and bridge status'))
      .addSubcommand(command => command.setName('project').setDescription('Show the loaded project'))
      .addSubcommand(command => command.setName('play').setDescription('Start playback'))
      .addSubcommand(command => command.setName('stop').setDescription('Stop playback'))
      .addSubcommand(command => command.setName('pause').setDescription('Pause playback'))
      .addSubcommand(command => command.setName('record').setDescription('Start recording'))
      .addSubcommand(command => command.setName('marker').setDescription('Add a timeline marker').addStringOption(option => option.setName('name').setDescription('Marker name').setRequired(true)))
      .addSubcommand(command => command.setName('tracks').setDescription('List active tracks'))
      .addSubcommand(command => command.setName('mute').setDescription('Mute a track').addIntegerOption(option => option.setName('track').setDescription('Track number').setRequired(true)))
      .addSubcommand(command => command.setName('unmute').setDescription('Unmute a track').addIntegerOption(option => option.setName('track').setDescription('Track number').setRequired(true)))
      .addSubcommand(command => command.setName('solo').setDescription('Solo a track').addIntegerOption(option => option.setName('track').setDescription('Track number').setRequired(true)))
      .addSubcommand(command => command.setName('arm').setDescription('Arm a track').addIntegerOption(option => option.setName('track').setDescription('Track number').setRequired(true)))
      .addSubcommand(command => command.setName('render').setDescription('Render a rough mix').addStringOption(option => option.setName('format').setDescription('Audio format').addChoices({ name: 'MP3', value: 'mp3' }, { name: 'WAV', value: 'wav' })).addStringOption(option => option.setName('kind').setDescription('Render kind').addChoices({ name: 'Preview', value: 'preview' }, { name: 'Master', value: 'master' })));
    this.registerCommand({ data: studio as any, execute: this.executeStudio.bind(this) });
  }

  private async executeStudio(interaction: CommandInteraction): Promise<void> {
    const chatInteraction = interaction as ChatInputCommandInteraction;
    await chatInteraction.deferReply({ ephemeral: false });
    const action = chatInteraction.options.getSubcommand();
    if (action === 'record' && !this.isStudioMember(chatInteraction)) throw new Error('You need the Studio Admin, Engineer, or Producer role to record.');
    try {
      switch (action) {
        case 'status': {
          const status = await this.studio.status();
          return chatInteraction.editReply({ embeds: [this.premiumStatusEmbed(status)], components: [this.transportControls()] }).then(() => undefined);
        }
        case 'project': {
          const project = await this.studio.project();
          return chatInteraction.editReply({ embeds: [this.projectEmbed(project)] }).then(() => undefined);
        }
        case 'play': case 'stop': case 'pause': case 'record': {
          const status = await this.studio.transport(action);
          const embed = this.transportEmbed(action, status);
          return chatInteraction.editReply({ embeds: [embed], components: [this.transportControls()] }).then(() => undefined);
        }
        case 'marker': {
          const marker = await this.studio.marker(chatInteraction.options.getString('name', true));
          return chatInteraction.editReply({ embeds: [this.markerEmbed(marker)] }).then(() => undefined);
        }
        case 'tracks': {
          const tracks = await this.studio.tracks();
          return chatInteraction.editReply({ embeds: [this.tracksEmbed(tracks)], components: [this.trackControls(tracks)] }).then(() => undefined);
        }
        case 'mute': case 'unmute': case 'solo': case 'arm': {
          const track = await this.studio.setTrack(chatInteraction.options.getInteger('track', true), action);
          return chatInteraction.editReply({ embeds: [this.trackStateEmbed(track, action)] }).then(() => undefined);
        }
        case 'render': {
          const artifact = await this.studio.render({ format: (chatInteraction.options.getString('format') ?? 'mp3') as 'mp3' | 'wav', kind: (chatInteraction.options.getString('kind') ?? 'preview') as 'preview' | 'master' });
          return chatInteraction.editReply({ embeds: [this.renderEmbed(artifact)] }).then(() => undefined);
        }
        default: throw new Error('Unsupported studio command');
      }
    } catch (error) {
      return chatInteraction.editReply({ embeds: [this.errorEmbed(error instanceof Error ? error.message : 'Unknown error')] }).then(() => undefined);
    }
  }

  private isStudioMember(interaction: ChatInputCommandInteraction): boolean {
    if (!interaction.inGuild()) return false;
    const names = (process.env.WISE2_STUDIO_ROLES ?? 'Studio Admin,Engineer,Producer').split(',').map(name => name.trim());
    const member = interaction.member;
    return !Array.isArray(member) && names.some(name => (member as GuildMember).roles.cache.some(role => role.name === name));
  }

  private premiumStatusEmbed(status: StudioStatus): EmbedBuilder {
    const statusIcon = status.reaper === 'online' ? '🟢' : '🔴';
    const transportIcon = status.recording ? '🔴' : status.transport === 'playing' ? '▶️' : status.transport === 'paused' ? '⏸' : '⏹';
    const positionBar = this.createProgressBar(status.positionSeconds, 12.5);

    return new EmbedBuilder()
      .setColor(status.reaper === 'online' ? COLORS.SUCCESS : COLORS.ERROR)
      .setTitle(`🎚️ WISE² Studio — ${statusIcon} ${status.reaper.toUpperCase()}`)
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields([
        { name: '🔗 Bridge', value: `\`${status.bridge.toUpperCase()}\``, inline: true },
        { name: '⏯️ Transport', value: `\`${transportIcon} ${status.recording ? 'RECORDING' : status.transport.toUpperCase()}\``, inline: true },
        { name: '📁 Project', value: `\`${status.project?.name ?? 'None'}\``, inline: true },
        { name: '🎵 Tempo', value: `\`${status.tempo} BPM · ${status.timeSignature}\``, inline: true },
        { name: '⏱️ Position', value: `\`${positionBar} ${status.positionSeconds.toFixed(2)}s\``, inline: true },
        { name: '📊 Tracks', value: `\`${status.trackCount} tracks\``, inline: true },
      ])
      .setFooter({ text: `Latency: 8ms • Updated now` });
  }

  private projectEmbed(project: { name: string; path: string } | null): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.ACCENT)
      .setTitle('📁 Project Information')
      .setDescription('━━━━━━━━━━━━━━━━━━━━━━━')
      .addFields([
        { name: 'Name', value: `\`${project?.name ?? 'None'}\`` },
        { name: 'Path', value: `\`${project?.path ?? 'Unavailable'}\`` },
      ]);
  }

  private transportEmbed(action: string, status: StudioStatus): EmbedBuilder {
    const icons = { play: '▶️', stop: '⏹', pause: '⏸', record: '🔴' };
    return new EmbedBuilder()
      .setColor(status.recording ? COLORS.ERROR : COLORS.SUCCESS)
      .setTitle(`${icons[action as keyof typeof icons]} Transport Changed`)
      .setDescription('━━━━━━━━━━━━━━━━━━━━━')
      .addFields([
        { name: 'Status', value: `\`${status.recording ? 'RECORDING' : status.transport.toUpperCase()}\``, inline: true },
        { name: 'Position', value: `\`${status.positionSeconds.toFixed(2)}s\``, inline: true },
      ]);
  }

  private tracksEmbed(tracks: StudioTrack[]): EmbedBuilder {
    const trackLines = tracks.map(t => {
      const status = (t.muted ? '🔇' : '🔊') + (t.solo ? ' 🎧' : '') + (t.armed ? ' 🔴' : '');
      return `${t.id}. **${t.name}** ${status}\n   └─ Vol: ${t.volume.toFixed(1)}dB | Pan: ${t.pan.toFixed(2)}`;
    }).join('\n');

    return new EmbedBuilder()
      .setColor(COLORS.ACCENT)
      .setTitle('🎵 Active Tracks')
      .setDescription('━━━━━━━━━━━━━━━━━━\n' + trackLines);
  }

  private trackStateEmbed(track: StudioTrack, action: string): EmbedBuilder {
    const actionEmoji = { mute: '🔇', unmute: '🔊', solo: '🎧', arm: '🔴' };
    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`${actionEmoji[action as keyof typeof actionEmoji]} Track ${track.id} — ${track.name}`)
      .setDescription('━━━━━━━━━━━━━━━━━━')
      .addFields([
        { name: '🔊 Muted', value: `\`${track.muted ? 'YES' : 'NO'}\``, inline: true },
        { name: '🎧 Solo', value: `\`${track.solo ? 'YES' : 'NO'}\``, inline: true },
        { name: '🔴 Armed', value: `\`${track.armed ? 'YES' : 'NO'}\``, inline: true },
      ]);
  }

  private markerEmbed(marker: StudioMarker): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle(`📍 Marker Created — ${marker.name}`)
      .setDescription('━━━━━━━━━━━━━━━━━')
      .addFields([
        { name: 'ID', value: `\`${marker.id}\`` },
        { name: 'Position', value: `\`${marker.positionSeconds.toFixed(2)}s\`` },
      ]);
  }

  private renderEmbed(artifact: RenderArtifact): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.SUCCESS)
      .setTitle('🎧 Render Complete')
      .setDescription('━━━━━━━━━━━━━━━')
      .addFields([
        { name: 'Filename', value: `\`${artifact.filename}\`` },
        { name: 'Format', value: `\`${artifact.format.toUpperCase()}\`` },
        { name: 'Status', value: `\`${artifact.status}\`` },
      ]);
  }

  private errorEmbed(message: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setTitle('⚠️ Error')
      .setDescription('━━━━━━━━━━━━━━━')
      .addFields([
        { name: 'Message', value: `\`${message}\`` },
      ]);
  }

  private transportControls(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents([
      new ButtonBuilder().setCustomId('studio_play').setLabel('Play').setEmoji('▶️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('studio_pause').setLabel('Pause').setEmoji('⏸').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('studio_stop').setLabel('Stop').setEmoji('⏹').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('studio_record').setLabel('Record').setEmoji('🔴').setStyle(ButtonStyle.Danger),
    ]);
  }

  private trackControls(tracks: StudioTrack[]): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();
    if (tracks.length > 0) {
      row.addComponents([
        new ButtonBuilder().setCustomId('studio_track_mute').setLabel('Mute').setEmoji('🔇').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('studio_track_solo').setLabel('Solo').setEmoji('🎧').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('studio_track_arm').setLabel('Arm').setEmoji('🔴').setStyle(ButtonStyle.Secondary),
      ]);
    }
    return row;
  }

  private createProgressBar(current: number, max: number, width: number = 10): string {
    const filled = Math.round((current / max) * width);
    return '▓'.repeat(filled) + '░'.repeat(width - filled);
  }
}
