import { commandHandlers } from './commands';

export async function handleReady(client: any) {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  console.log(`📍 Serving ${client.guilds.cache.size} guild(s)`);

  // Set bot status
  await client.user.setActivity('/help for commands', { type: 'LISTENING' });
  console.log('🟢 Bot status updated');
}

export async function handleInteraction(interaction: any, db: any) {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const handler = commandHandlers[commandName];

  if (!handler) {
    await interaction.reply({ content: `Unknown command: /${commandName}` });
    return;
  }

  try {
    // Log command usage
    await logCommandUsage(db, {
      guildId: interaction.guildId,
      userId: interaction.user.id,
      username: interaction.user.username,
      command: commandName,
      timestamp: new Date(),
    });

    // Execute handler
    await handler(interaction);

    console.log(`✅ Executed command: /${commandName} by ${interaction.user.username}`);
  } catch (err) {
    console.error(`❌ Error executing /${commandName}:`, err);

    const reply =
      interaction.replied || interaction.deferred
        ? interaction.followUp({ content: '❌ Command failed' })
        : interaction.reply({ content: '❌ Command failed' });

    await reply;
  }
}

export async function handleMessage(message: any, db: any) {
  if (message.author.bot) return;

  try {
    // Log message
    await logMessage(db, {
      guildId: message.guildId,
      channelId: message.channelId,
      userId: message.author.id,
      username: message.author.username,
      content: message.content,
      timestamp: new Date(),
    });

    // Auto-respond to mentions
    if (message.mentions.has(message.client.user.id)) {
      const response = `👋 Hi ${message.author.username}! Use \`/ask\` command to chat with WISE² AI or \`/help\` to see available commands.`;
      await message.reply(response);
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
}

export async function handleGuildCreate(guild: any) {
  console.log(`✅ Joined guild: ${guild.name} (${guild.id})`);
  console.log(`   Members: ${guild.memberCount}`);
  console.log(`   Channels: ${guild.channels.cache.size}`);
}

export async function handleError(err: any) {
  console.error('❌ Discord client error:', err);
}

async function logCommandUsage(db: any, data: any) {
  try {
    if (db) {
      // Store in database for audit trail
      // await db.query('INSERT INTO discord_commands (guild_id, user_id, username, command, timestamp) VALUES (?, ?, ?, ?, ?)', [
      //   data.guildId, data.userId, data.username, data.command, data.timestamp
      // ]);
    }
  } catch (err) {
    console.error('Failed to log command usage:', err);
  }
}

async function logMessage(db: any, data: any) {
  try {
    if (db) {
      // Store in database for audit trail
      // await db.query('INSERT INTO discord_messages (guild_id, channel_id, user_id, username, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)', [
      //   data.guildId, data.channelId, data.userId, data.username, data.content, data.timestamp
      // ]);
    }
  } catch (err) {
    console.error('Failed to log message:', err);
  }
}
