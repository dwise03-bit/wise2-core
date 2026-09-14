/**
 * WISE² Discord Command Center Integration
 * Wires together all middleware and command infrastructure
 */

const { REST, Routes } = require('discord.js');
const { loadCommands, getAllCommands } = require('../commands');
const { authorizeCommand } = require('./authorization');
const { logAudit, CATEGORY, SEVERITY } = require('./audit');

/**
 * Initialize command center infrastructure
 * @param {Object} client - Discord.js client
 * @returns {Promise<void>}
 */
async function initializeCommandCenter(client) {
  console.log('🔧 Initializing WISE² Discord Command Center...');

  // Load all commands
  console.log('📦 Loading commands...');
  const commands = loadCommands();
  logCommandsLoaded(commands);

  // Register commands with Discord
  console.log('📋 Registering commands with Discord...');
  await registerCommands(client, commands);

  // Set up interaction handlers
  console.log('⚙️ Setting up interaction handlers...');
  setupInteractionHandlers(client, commands);

  console.log('✅ WISE² Discord Command Center initialized!');
}

/**
 * Log loaded commands by category
 * @param {Object} commands - Commands object organized by category
 */
function logCommandsLoaded(commands) {
  for (const category in commands) {
    const count = Object.keys(commands[category]).length;
    if (count > 0) {
      console.log(
        `  ${category}: ${count} command(s)`
      );
    }
  }
}

/**
 * Register all commands with Discord API
 * @param {Object} client - Discord.js client
 * @param {Object} commands - Commands object
 */
async function registerCommands(client, commands) {
  const allCommands = getAllCommands();

  if (allCommands.length === 0) {
    console.warn('⚠️ No commands to register');
    return;
  }

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

    const commandData = allCommands.map(cmd => cmd.data.toJSON());

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commandData }
    );

    console.log(`✅ Registered ${commandData.length} slash commands`);
  } catch (error) {
    console.error('❌ Failed to register commands:', error.message);
    throw error;
  }
}

/**
 * Set up interaction event handlers
 * @param {Object} client - Discord.js client
 * @param {Object} commands - Commands object
 */
function setupInteractionHandlers(client, commands) {
  client.on('interactionCreate', async (interaction) => {
    // Handle slash commands
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction, commands);
    }

    // Handle button interactions
    if (interaction.isButton()) {
      await handleButtonInteraction(client, interaction);
    }
  });
}

/**
 * Handle slash command execution
 * @param {Object} client - Discord.js client
 * @param {Object} interaction - Discord interaction
 * @param {Object} commands - Commands object
 */
async function handleSlashCommand(client, interaction, commands) {
  const commandName = interaction.commandName;
  const startTime = Date.now();

  try {
    // Find command
    let command = null;
    for (const category in commands) {
      if (commands[category][commandName]) {
        command = commands[category][commandName];
        break;
      }
    }

    if (!command) {
      return interaction.reply({
        content: `❌ Command \`/${commandName}\` not found`,
        ephemeral: true,
      });
    }

    // Authorize
    const authResult = await authorizeCommand(interaction, client, `/${commandName}`);
    if (!authResult.authorized) {
      await logAudit({
        category: CATEGORY.AUTH,
        severity: SEVERITY.WARNING,
        executionId: authResult.executionId,
        userId: interaction.user.id,
        username: interaction.user.username,
        command: commandName,
        target: 'command',
        result: 'FAILED',
        error: authResult.message,
        roles: authResult.roles,
      });

      return interaction.reply({
        content: authResult.message,
        ephemeral: true,
      });
    }

    // Execute command
    console.log(
      `🔄 [${authResult.executionId}] Executing /${commandName} by ${interaction.user.username}`
    );

    await command.execute(interaction);

    const duration = Date.now() - startTime;

    // Log execution
    await logAudit({
      category: CATEGORY.COMMAND,
      severity: SEVERITY.NOTICE,
      executionId: authResult.executionId,
      userId: interaction.user.id,
      username: interaction.user.username,
      command: commandName,
      target: 'command',
      result: 'SUCCESS',
      duration,
      roles: authResult.roles,
    });
  } catch (error) {
    console.error(`❌ Error executing command /${commandName}:`, error);

    const errorResponse = {
      content: `❌ Failed to execute command: ${error.message}`,
      ephemeral: true,
    };

    if (interaction.replied) {
      await interaction.editReply(errorResponse).catch(() => {});
    } else if (interaction.deferred) {
      await interaction.editReply(errorResponse).catch(() => {});
    } else {
      await interaction.reply(errorResponse).catch(() => {});
    }

    // Log error
    await logAudit({
      category: CATEGORY.COMMAND,
      severity: SEVERITY.CRITICAL,
      userId: interaction.user.id,
      username: interaction.user.username,
      command: commandName,
      target: 'command',
      result: 'FAILED',
      error: error.message,
      roles: [],
    });
  }
}

/**
 * Handle button interactions
 * @param {Object} client - Discord.js client
 * @param {Object} interaction - Discord button interaction
 */
async function handleButtonInteraction(client, interaction) {
  const customId = interaction.customId;

  // Handle deployment approvals
  if (customId.startsWith('deploy_approve:') || customId.startsWith('deploy_deny:')) {
    const [action, executionId] = customId.split(':');

    const isApproval = action === 'deploy_approve';
    const emoji = isApproval ? '✅' : '❌';
    const message = isApproval ? 'approved' : 'denied';

    await interaction.reply({
      content: `${emoji} Deployment ${message} by ${interaction.user.username}`,
      ephemeral: false,
    });

    // Log approval
    await logAudit({
      category: CATEGORY.DEPLOYMENT,
      severity: SEVERITY.NOTICE,
      executionId,
      userId: interaction.user.id,
      username: interaction.user.username,
      command: isApproval ? 'deploy_approve' : 'deploy_deny',
      target: 'deployment',
      result: 'SUCCESS',
      approved: isApproval,
      approvedBy: interaction.user.username,
    });
  }
}

module.exports = {
  initializeCommandCenter,
  registerCommands,
  setupInteractionHandlers,
  handleSlashCommand,
  handleButtonInteraction,
};
