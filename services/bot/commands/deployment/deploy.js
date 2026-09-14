/**
 * /deploy command
 * Deploy to staging or production with approval workflow
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { logAudit, CATEGORY, SEVERITY } = require('../../middleware/audit');
const { generateExecutionId } = require('../../middleware/authorization');

const data = new SlashCommandBuilder()
  .setName('deploy')
  .setDescription('Deploy to staging or production')
  .addStringOption(option =>
    option
      .setName('environment')
      .setDescription('Target environment')
      .setRequired(true)
      .setChoices(
        { name: 'Staging', value: 'staging' },
        { name: 'Production', value: 'production' },
      )
  )
  .addStringOption(option =>
    option
      .setName('branch')
      .setDescription('Git branch to deploy (default: main)')
  )
  .addStringOption(option =>
    option
      .setName('service')
      .setDescription('Specific service to deploy (default: all)')
      .setChoices(
        { name: 'API', value: 'api' },
        { name: 'Dashboard', value: 'dashboard' },
        { name: 'Bot', value: 'bot' },
        { name: 'Worker', value: 'worker' },
      )
  );

// Store pending deployments for approval
const pendingDeployments = new Map();

async function execute(interaction) {
  const environment = interaction.options.getString('environment');
  const branch = interaction.options.getString('branch') || 'main';
  const service = interaction.options.getString('service') || 'all';
  const executionId = generateExecutionId();

  // Production deployments require owner/admin approval
  const requiresApproval = environment === 'production';

  if (requiresApproval) {
    // Create approval request
    await requestDeploymentApproval(interaction, {
      executionId,
      environment,
      branch,
      service,
    });
  } else {
    // Staging deployments auto-proceed
    await executeDeployment(interaction, {
      executionId,
      environment,
      branch,
      service,
    });
  }

  // Log the deployment request
  await logAudit({
    category: CATEGORY.DEPLOYMENT,
    severity: SEVERITY.NOTICE,
    executionId,
    userId: interaction.user.id,
    username: interaction.user.username,
    command: '/deploy',
    args: { environment, branch, service },
    target: `${environment}/${service}`,
    result: requiresApproval ? 'WAITING_APPROVAL' : 'INITIATED',
    requiresApproval,
  });
}

/**
 * Request deployment approval
 * @param {Object} interaction - Discord interaction
 * @param {Object} options - Deployment options
 */
async function requestDeploymentApproval(interaction, options) {
  const { executionId, environment, branch, service } = options;

  const embed = new EmbedBuilder()
    .setColor(0xff9900)
    .setTitle('⚠️ WISE² PRODUCTION DEPLOYMENT REQUEST')
    .setDescription(
      `A deployment to **${environment}** has been requested and requires approval.`
    )
    .addFields(
      { name: 'Environment', value: environment.toUpperCase(), inline: true },
      { name: 'Service', value: service.toUpperCase(), inline: true },
      { name: 'Branch', value: branch, inline: true },
      { name: 'Requested By', value: interaction.user.tag, inline: true },
      { name: 'Execution ID', value: executionId.substring(0, 20) + '...', inline: false },
      {
        name: 'Current Health',
        value: 'Use `/status` to check system health before approving',
        inline: false,
      }
    )
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`deploy_approve:${executionId}`)
      .setLabel('✅ Approve')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`deploy_deny:${executionId}`)
      .setLabel('❌ Deny')
      .setStyle(ButtonStyle.Danger),
  );

  // Store the pending deployment
  pendingDeployments.set(executionId, {
    environment,
    branch,
    service,
    requesterUserId: interaction.user.id,
    requesterName: interaction.user.username,
    timestamp: Date.now(),
    interactionToken: interaction.token,
  });

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: false, // Public so team can see
  });
}

/**
 * Execute deployment
 * @param {Object} interaction - Discord interaction
 * @param {Object} options - Deployment options
 */
async function executeDeployment(interaction, options) {
  const { executionId, environment, branch, service } = options;
  const startTime = Date.now();

  await interaction.deferReply();

  try {
    // Simulate deployment process
    const deployEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🚀 Deployment in Progress')
      .setDescription(`Deploying ${service} to ${environment}...`)
      .addFields(
        { name: 'Service', value: service, inline: true },
        { name: 'Environment', value: environment, inline: true },
        { name: 'Branch', value: branch, inline: true },
        { name: 'Status', value: '⏳ Initializing...', inline: false },
      )
      .setFooter({ text: `Execution ID: ${executionId}` });

    await interaction.editReply({ embeds: [deployEmbed] });

    // TODO: Call actual deployment service
    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 2000));

    const duration = Date.now() - startTime;

    const successEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('✅ Deployment Successful')
      .setDescription(`${service} deployed to ${environment}`)
      .addFields(
        { name: 'Service', value: service, inline: true },
        { name: 'Environment', value: environment, inline: true },
        { name: 'Branch', value: branch, inline: true },
        { name: 'Duration', value: `${duration}ms`, inline: true },
      )
      .setFooter({ text: `Execution ID: ${executionId}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [successEmbed] });

    // Log success
    await logAudit({
      category: CATEGORY.DEPLOYMENT,
      severity: SEVERITY.NOTICE,
      executionId,
      userId: interaction.user.id,
      username: interaction.user.username,
      command: '/deploy',
      target: `${environment}/${service}`,
      result: 'SUCCESS',
      duration,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Deployment Failed')
      .setDescription(`Failed to deploy ${service} to ${environment}`)
      .addFields(
        { name: 'Error', value: error.message, inline: false },
        { name: 'Duration', value: `${duration}ms`, inline: true },
      )
      .setFooter({ text: `Execution ID: ${executionId}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });

    // Log failure
    await logAudit({
      category: CATEGORY.DEPLOYMENT,
      severity: SEVERITY.CRITICAL,
      executionId,
      userId: interaction.user.id,
      username: interaction.user.username,
      command: '/deploy',
      target: `${environment}/service`,
      result: 'FAILED',
      error: error.message,
      duration,
    });
  }
}

module.exports = {
  data,
  execute,
  executeDeployment,
  requestDeploymentApproval,
  pendingDeployments,
};
