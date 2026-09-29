const { Readable } = require('stream');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
} = require('@discordjs/voice');

function sirenWav(seconds = 8) {
  const sampleRate = 48000;
  const samples = sampleRate * seconds;
  const data = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const phase = (t % 1.2) / 1.2;
    const frequency = phase < 0.5 ? 880 : 660;
    const value = Math.sin(2 * Math.PI * frequency * t) * 0.9;
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

async function ringCallSiren(client, guildId = process.env.DISCORD_GUILD_ID) {
  const channelId = process.env.DISCORD_CALL_ALERT_VOICE_CHANNEL_ID;
  if (!channelId) throw new Error('DISCORD_CALL_ALERT_VOICE_CHANNEL_ID is not configured');
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isVoiceBased()) throw new Error(`Voice channel not found: ${channelId}`);
  const connection = joinVoiceChannel({ channelId, guildId: guildId || channel.guild.id, adapterCreator: channel.guild.voiceAdapterCreator });
  const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
  player.play(createAudioResource(Readable.from([sirenWav()]), { inputType: StreamType.Arbitrary }));
  connection.subscribe(player);
  player.once(AudioPlayerStatus.Idle, () => connection.destroy());
  setTimeout(() => connection.destroy(), 10000).unref();
}

module.exports = { ringCallSiren };
