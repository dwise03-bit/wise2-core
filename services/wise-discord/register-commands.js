'use strict';

require('dotenv').config({ path: '/home/dwise/wise2-core/.env' });
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { getCommandBuilders } = require('./features');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || process.env.DISCORD_APPLICATION_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('❌ Missing required env vars:');
  console.error('   DISCORD_BOT_TOKEN:', BOT_TOKEN ? '✓' : '✗');
  console.error('   DISCORD_CLIENT_ID:', CLIENT_ID ? '✓' : '✗');
  console.error('   DISCORD_GUILD_ID:', GUILD_ID ? '✓' : '✗');
  process.exit(1);
}

// Original commands
const wiseCommand = new SlashCommandBuilder()
  .setName('wise')
  .setDescription('WISE² operations interface')
  .addSubcommand((sub) => sub.setName('status').setDescription('Full WISE² system status'))
  .addSubcommand((sub) => sub.setName('health').setDescription('Service health check'))
  .addSubcommand((sub) => sub.setName('brain').setDescription('Ask the WISE² Second Brain a question').addStringOption((opt) => opt.setName('question').setDescription('Your question').setRequired(true)))
  .addSubcommand((sub) => sub.setName('devices').setDescription('Edge device network status'))
  .addSubcommand((sub) => sub.setName('device').setDescription('Status of a specific device').addStringOption((opt) => opt.setName('name').setDescription('Device name').setRequired(true)))
  .addSubcommand((sub) => sub.setName('revenue').setDescription('Revenue operations overview'))
  .addSubcommand((sub) => sub.setName('alerts').setDescription('Recent alerts and warnings'))
  .addSubcommand((sub) => sub.setName('help').setDescription('WISE² Discord command reference'));

const contentCommand = new SlashCommandBuilder()
  .setName('content')
  .setDescription('WISE² Faceless Content Studio')
  .addSubcommand((sub) => sub.setName('create').setDescription('Create new content piece'))
  .addSubcommand((sub) => sub.setName('batch').setDescription('Batch create content'))
  .addSubcommand((sub) => sub.setName('ideas').setDescription('Brainstorm content ideas'))
  .addSubcommand((sub) => sub.setName('status').setDescription('View content pipeline status'))
  .addSubcommand((sub) => sub.setName('queue').setDescription('Browse content queue'))
  .addSubcommand((sub) => sub.setName('brand').setDescription('View or update brand settings'))
  .addSubcommand((sub) => sub.setName('rewrite').setDescription('Rewrite or iterate on content'))
  .addSubcommand((sub) => sub.setName('cancel').setDescription('Cancel a content project'));

const opsCommand = new SlashCommandBuilder()
  .setName('ops')
  .setDescription('WISE² direct infrastructure control');

// Combine all commands
const allCommands = [
  wiseCommand.toJSON(),
  contentCommand.toJSON(),
  opsCommand.toJSON(),
  ...getCommandBuilders().map(cmd => cmd.toJSON()),
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  try {
    console.log('📝 Registering commands...');
    const result = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: allCommands,
    });

    const cmdNames = result.map(c => c.name);
    console.log(`✅ Successfully registered ${result.length} commands:`);
    console.log(`   /${cmdNames.join(', /')}`);
    console.log('');
    console.log('🎉 Ready to use! Type "/" in Discord to see all commands.');
  } catch (err) {
    console.error('❌ Failed to register commands:', err.message);
    if (err.status === 401) {
      console.error('   → Check DISCORD_BOT_TOKEN is valid');
    } else if (err.status === 403) {
      console.error('   → Bot may lack "applications.commands" scope');
    }
    process.exit(1);
  }
}

registerCommands();
