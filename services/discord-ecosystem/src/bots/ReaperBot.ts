import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { BotFramework } from '../BotFramework';
import { BotConfig } from '../types';
import { HttpReaperAdapter, MockReaperAdapter, StudioService, StudioStatus } from '../studio/contracts';

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
    this.registerCommand({ data: studio, execute: this.executeStudio.bind(this) });
  }

  private async executeStudio(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: false });
    const action = interaction.options.getSubcommand();
    if (action === 'record' && !this.isStudioMember(interaction)) throw new Error('You need the Studio Admin, Engineer, or Producer role to record.');
    switch (action) {
      case 'status': return interaction.editReply({ embeds: [this.statusEmbed(await this.studio.status())] }).then(() => undefined);
      case 'project': { const project = await this.studio.project(); return interaction.editReply(`**Project:** ${project?.name ?? 'None'}\n**Path:** ${project?.path ?? 'Unavailable'}`).then(() => undefined); }
      case 'play': case 'stop': case 'pause': case 'record': { const status = await this.studio.transport(action); return interaction.editReply(`✅ REAPER transport: **${status.recording ? 'RECORDING' : status.transport.toUpperCase()}**`).then(() => undefined); }
      case 'marker': { const marker = await this.studio.marker(interaction.options.getString('name', true)); return interaction.editReply(`📍 Marker **${marker.name}** added at ${marker.positionSeconds.toFixed(2)}s.`).then(() => undefined); }
      case 'tracks': { const tracks = await this.studio.tracks(); return interaction.editReply(tracks.map(track => `${track.id}. ${track.name} — ${track.muted ? 'MUTED' : 'ON'}${track.solo ? ' · SOLO' : ''}${track.armed ? ' · ARMED' : ''} · vol ${track.volume.toFixed(1)} dB · pan ${track.pan.toFixed(2)}`).join('\n') || 'No tracks found.').then(() => undefined); }
      case 'mute': case 'unmute': case 'solo': case 'arm': { const track = await this.studio.setTrack(interaction.options.getInteger('track', true), action); return interaction.editReply(`✅ Track **${track.id} ${track.name}** updated.`).then(() => undefined); }
      case 'render': { const artifact = await this.studio.render({ format: (interaction.options.getString('format') ?? 'mp3') as 'mp3' | 'wav', kind: (interaction.options.getString('kind') ?? 'preview') as 'preview' | 'master' }); return interaction.editReply(`🎧 Render complete: **${artifact.filename}**`).then(() => undefined); }
      default: throw new Error('Unsupported studio command');
    }
  }

  private isStudioMember(interaction: ChatInputCommandInteraction): boolean {
    if (!interaction.inGuild()) return false;
    const names = (process.env.WISE2_STUDIO_ROLES ?? 'Studio Admin,Engineer,Producer').split(',').map(name => name.trim());
    const member = interaction.member;
    return !Array.isArray(member) && names.some(name => (member as GuildMember).roles.cache.some(role => role.name === name));
  }

  private statusEmbed(status: StudioStatus) {
    return this.createEmbed({ title: `🎚️ WISE² Studio — ${status.reaper.toUpperCase()}`, fields: [
      { name: 'Bridge', value: status.bridge.toUpperCase(), inline: true }, { name: 'Transport', value: status.recording ? 'RECORDING' : status.transport.toUpperCase(), inline: true },
      { name: 'Project', value: status.project?.name ?? 'None', inline: true }, { name: 'Tempo', value: `${status.tempo} BPM · ${status.timeSignature}`, inline: true },
      { name: 'Position', value: `${status.positionSeconds.toFixed(2)}s`, inline: true }, { name: 'Tracks / Markers', value: `${status.trackCount} / ${status.markerCount}`, inline: true },
    ] });
  }
}
