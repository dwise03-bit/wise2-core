'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');
const K10Client = require('../../k10-api/k10-client');

const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';
const k10 = new K10Client({
  baseURL: process.env.K10_API_URL || 'http://192.168.1.100:5000',
  fetch,
});

const edgeCommand = new SlashCommandBuilder()
  .setName('edge')
  .setDescription('WISE² Edge Devices & Hardware Control')
  .addSubcommand((sub) =>
    sub.setName('network')
      .setDescription('View edge device network')
  )
  .addSubcommand((sub) =>
    sub.setName('pi')
      .setDescription('Raspberry Pi operations')
      .addStringOption((opt) =>
        opt.setName('device').setDescription('Pi device name (e.g., wisepi, wisepi-2)').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action to perform').addChoices(
          { name: 'Status', value: 'status' },
          { name: 'Restart', value: 'restart' },
          { name: 'Reboot', value: 'reboot' },
          { name: 'Logs', value: 'logs' },
          { name: 'Update', value: 'update' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('byte')
      .setDescription('WISE² BYTE device control')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Status', value: 'status' },
          { name: 'Demo Mode', value: 'demo' },
          { name: 'Battery', value: 'battery' },
          { name: 'Animation', value: 'animation' },
          { name: 'Factory Reset', value: 'reset' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('k10')
      .setDescription('UNIHIKER K10 device control')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Status', value: 'status' },
          { name: 'Display Test', value: 'display_test' },
          { name: 'WiFi', value: 'wifi' },
          { name: 'Microphone Test', value: 'mic_test' },
          { name: 'Sync Dashboard', value: 'sync' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('stream')
      .setDescription('WISE² Live streaming control')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Status', value: 'status' },
          { name: 'Start', value: 'start' },
          { name: 'Stop', value: 'stop' },
          { name: 'Cameras', value: 'cameras' },
          { name: 'Settings', value: 'settings' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('monitor')
      .setDescription('Real-time device monitoring')
      .addStringOption((opt) =>
        opt.setName('metric').setDescription('Metric to monitor').addChoices(
          { name: 'CPU Usage', value: 'cpu' },
          { name: 'Memory', value: 'memory' },
          { name: 'Temperature', value: 'temp' },
          { name: 'Network', value: 'network' },
          { name: 'Disk', value: 'disk' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('deploy')
      .setDescription('Deploy firmware to edge device')
      .addStringOption((opt) =>
        opt.setName('device_type').setDescription('Device type').addChoices(
          { name: 'Raspberry Pi', value: 'pi' },
          { name: 'BYTE', value: 'byte' },
          { name: 'K10', value: 'k10' }
        ).setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('version').setDescription('Firmware version (latest or specific)').setRequired(true)
      )
  );

async function handleEdgeCommand(interaction, jwtToken) {
  await interaction.deferReply();

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'network':
        return handleDeviceNetwork(interaction, jwtToken);
      case 'pi':
        return handlePiControl(interaction, jwtToken);
      case 'byte':
        return handleByteControl(interaction, jwtToken);
      case 'k10':
        return handleK10Control(interaction, jwtToken);
      case 'stream':
        return handleStreamControl(interaction, jwtToken);
      case 'monitor':
        return handleMonitoring(interaction, jwtToken);
      case 'deploy':
        return handleFirmwareDeploy(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[edge-control] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleDeviceNetwork(interaction, jwtToken) {
  try {
    const res = await fetch(`${COMMAND_CENTER}/api/edge/devices`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Device fetch failed: ${res.status}`);
    const data = await res.json();

    const deviceList = (data.devices || [])
      .map((d) => `• **${d.name}** — ${d.type} | ${d.status} | IP: ${d.ip}`)
      .join('\n') || 'No devices online';

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('🌐 Edge Device Network')
      .setDescription(deviceList)
      .addFields([
        { name: 'Online Devices', value: String(data.onlineCount || 0), inline: true },
        { name: 'Total Devices', value: String(data.totalCount || 0), inline: true },
        { name: 'Network Status', value: data.networkStatus || 'Healthy' },
      ])
      .setFooter({ text: 'Real-time device status' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handlePiControl(interaction, jwtToken) {
  const device = interaction.options.getString('device');
  const action = interaction.options.getString('action') || 'status';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/edge/pi/${device}/${action}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 30000,
    });

    if (!res.ok) throw new Error(`Pi control failed: ${res.status}`);
    const data = await res.json();

    let embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`🍓 Raspberry Pi: ${device}`)
      .addFields([
        { name: 'Action', value: action },
        { name: 'Status', value: data.status || 'OK' },
      ]);

    if (data.metrics) {
      embed.addFields([
        { name: 'CPU', value: `${data.metrics.cpu}%`, inline: true },
        { name: 'Memory', value: `${data.metrics.memory}%`, inline: true },
        { name: 'Temp', value: `${data.metrics.temp}°C`, inline: true },
      ]);
    }

    if (data.logs) {
      embed.addFields({ name: 'Recent Logs', value: data.logs.slice(0, 500) });
    }

    embed.setFooter({ text: 'Edge Control' }).setTimestamp();
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleByteControl(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'status';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/edge/byte/${action}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 30000,
    });

    if (!res.ok) throw new Error(`BYTE control failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle('🤖 WISE² BYTE')
      .addFields([
        { name: 'Action', value: action },
        { name: 'Status', value: data.status || 'OK' },
        { name: 'Battery', value: `${data.battery || 0}%`, inline: true },
        { name: 'Connected', value: data.connected ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Display', value: data.displayState || 'Active', inline: true },
      ])
      .setFooter({ text: 'Lil BYTE Device' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleK10Control(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'status';

  try {
    let data;

    switch (action) {
      case 'status': {
        data = await k10.getDeviceInfo();
        const embed = new EmbedBuilder()
          .setColor(data.online ? 0x00ff7f : 0xff0000)
          .setTitle('📱 UNIHIKER K10')
          .addFields([
            { name: 'Status', value: data.online ? '🟢 Online' : '🔴 Offline', inline: true },
            { name: 'Firmware', value: data.firmware || 'unknown', inline: true },
            { name: 'Display', value: data.display || 'unknown', inline: true },
          ]);

        if (data.metrics) {
          embed.addFields([
            { name: 'CPU', value: `${data.metrics.cpu || 0}%`, inline: true },
            { name: 'Memory', value: `${data.metrics.memory || 0}%`, inline: true },
            { name: 'Temp', value: `${data.metrics.temperature || 0}°C`, inline: true },
          ]);
        }

        if (data.wifi) {
          embed.addFields({
            name: 'WiFi',
            value: `${data.wifi.connected ? '✅' : '❌'} ${data.wifi.ssid || 'Not connected'}`,
          });
        }

        embed.setFooter({ text: 'K10 Device Status' }).setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      case 'display_test': {
        data = await k10.testDisplay('color_bars');
        const embed = new EmbedBuilder()
          .setColor(0x00ff7f)
          .setTitle('📱 K10 Display Test')
          .addFields([
            { name: 'Test', value: data.success ? '✅ Started' : '❌ Failed' },
            { name: 'Pattern', value: 'Color Bars' },
          ])
          .setDescription(data.success ? 'Display test pattern running — color bars cycling' : `Error: ${data.error}`)
          .setFooter({ text: 'K10 Display' })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      case 'wifi': {
        data = await k10.getWiFi();
        const embed = new EmbedBuilder()
          .setColor(data.connected ? 0x00ff7f : 0xff9d00)
          .setTitle('📡 K10 WiFi Status')
          .addFields([
            { name: 'Connected', value: data.connected ? '✅ Yes' : '❌ No', inline: true },
            { name: 'SSID', value: data.ssid || 'N/A', inline: true },
            { name: 'Signal', value: `${data.signal || 0}%`, inline: true },
            { name: 'IP Address', value: data.ip || 'N/A' },
          ])
          .setFooter({ text: 'K10 Network' })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      case 'mic_test': {
        data = await k10.testMicrophone(3);
        const embed = new EmbedBuilder()
          .setColor(0x00ff7f)
          .setTitle('🎤 K10 Microphone Test')
          .addFields([
            { name: 'Test', value: data.success ? '✅ Started' : '❌ Failed' },
            { name: 'Duration', value: '3 seconds' },
          ])
          .setDescription(data.success ? 'Microphone recording started — listening for 3 seconds' : `Error: ${data.error}`)
          .setFooter({ text: 'K10 Audio I/O' })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      case 'sync': {
        data = await k10.sync({ timestamp: Date.now(), source: 'discord' });
        const embed = new EmbedBuilder()
          .setColor(data.success ? 0x00ff7f : 0xff9d00)
          .setTitle('🔄 K10 Dashboard Sync')
          .addFields([
            { name: 'Sync', value: data.success ? '✅ Complete' : '⚠️  Partial' },
            { name: 'Timestamp', value: new Date().toLocaleString() },
          ])
          .setDescription(data.success ? 'K10 dashboard synchronized with Discord' : `Status: ${data.error}`)
          .setFooter({ text: 'K10 Sync' })
          .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
      }

      default:
        return interaction.editReply('Unknown K10 action');
    }
  } catch (error) {
    console.error('[edge-control] K10 error:', error);
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ K10 Error')
      .setDescription(error.message)
      .setFooter({ text: 'K10 Device Control' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  }
}

async function handleStreamControl(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'status';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/edge/stream/${action}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 30000,
    });

    if (!res.ok) throw new Error(`Stream control failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xff9d00)
      .setTitle('📹 WISE² Live Stream')
      .addFields([
        { name: 'Status', value: data.status || 'Offline' },
        { name: 'Viewers', value: String(data.viewerCount || 0), inline: true },
        { name: 'Bitrate', value: data.bitrate || 'N/A', inline: true },
      ])
      .setFooter({ text: 'Live Streaming Control' })
      .setTimestamp();

    if (data.streamUrl) {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('Watch Live')
            .setURL(data.streamUrl)
            .setStyle(ButtonStyle.Link)
        );
      return interaction.editReply({ embeds: [embed], components: [row] });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleMonitoring(interaction, jwtToken) {
  const metric = interaction.options.getString('metric') || 'cpu';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/edge/monitor/${metric}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Monitoring fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`📊 Network Monitoring — ${metric.toUpperCase()}`)
      .addFields((data.devices || []).map((d) => ({
        name: d.name,
        value: `${d.value} | Peak: ${d.peak} | Avg: ${d.avg}`,
        inline: true,
      })))
      .setFooter({ text: 'Real-time metrics' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleFirmwareDeploy(interaction, jwtToken) {
  const deviceType = interaction.options.getString('device_type');
  const version = interaction.options.getString('version');

  await interaction.editReply(`🚀 Deploying firmware to ${deviceType}...\n⏳ This may take 5-10 minutes`);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/edge/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ deviceType, version }),
      timeout: 600000,
    });

    if (!res.ok) throw new Error(`Deployment failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('✅ Firmware Deployment Complete')
      .addFields([
        { name: 'Device Type', value: deviceType },
        { name: 'Version', value: version },
        { name: 'Status', value: 'Deployed' },
        { name: 'Devices Updated', value: String(data.devicesUpdated || 0) },
      ])
      .setFooter({ text: 'Edge Control' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  edgeCommand,
  handleEdgeCommand,
};
