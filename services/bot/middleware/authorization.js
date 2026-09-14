/**
 * WISE² Discord Authorization Middleware
 * Implements RBAC, rate limiting, and access control
 */

const crypto = require('crypto');

// WISE² Discord Roles
const WISE2_ROLES = {
  OWNER: 'owner',           // Daniel Wise
  ADMIN: 'admin',          // Administrative access
  DEVELOPER: 'developer',   // Development access
  SALES: 'sales',          // Sales operations
  FIELD_TECH: 'field-tech', // Field technicians
  SUPPORT: 'support',      // Customer support
  CLIENT: 'client',        // Customers
  AI_AGENT: 'ai-agent',    // Automated agents
};

// Command permission matrix
const COMMAND_PERMISSIONS = {
  // System commands
  '/status': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER],
  '/health': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER],
  '/services': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER],
  '/uptime': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER],
  '/logs': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER],

  // Deployment commands (require approval)
  '/deploy': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN],
  '/rollback': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN],
  '/restart': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN],

  // CRM commands
  '/lead': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.SALES],
  '/customer': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.SALES, WISE2_ROLES.SUPPORT],
  '/leads': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.SALES],
  '/claim-lead': [WISE2_ROLES.SALES],

  // AI commands
  '/ask-wise2': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER, WISE2_ROLES.AI_AGENT],
  '/agent': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.DEVELOPER, WISE2_ROLES.AI_AGENT],

  // HVAC commands
  '/dispatch': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.FIELD_TECH],
  '/workorder': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.FIELD_TECH],

  // Phone commands
  '/calls': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN, WISE2_ROLES.SUPPORT],

  // Security audit
  '/audit': [WISE2_ROLES.OWNER, WISE2_ROLES.ADMIN],
};

// Rate limiting configuration
const RATE_LIMITS = {
  default: { max: 5, window: 60000 }, // 5 commands per minute
  deployment: { max: 2, window: 60000 }, // 2 deploys per minute
  expensive: { max: 1, window: 60000 }, // 1 expensive operation per minute
};

const rateLimitStore = new Map();

/**
 * Get user's WISE² role(s)
 * @param {Object} interaction - Discord interaction
 * @param {Object} client - Discord client for guild access
 * @returns {Promise<Array>} User's WISE² roles
 */
async function getUserRoles(interaction, client) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  // Owner check - hardcoded for Daniel Wise
  const OWNER_ID = process.env.DISCORD_OWNER_ID || '274485978819584000';
  if (userId === OWNER_ID) {
    return [WISE2_ROLES.OWNER];
  }

  try {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    const roles = [];

    // Check Discord roles against WISE² role mapping
    const roleMap = {
      'WISE² Admin': WISE2_ROLES.ADMIN,
      'Developer': WISE2_ROLES.DEVELOPER,
      'Sales': WISE2_ROLES.SALES,
      'Field Tech': WISE2_ROLES.FIELD_TECH,
      'Support': WISE2_ROLES.SUPPORT,
      'Client': WISE2_ROLES.CLIENT,
      'AI Agent': WISE2_ROLES.AI_AGENT,
    };

    for (const discordRole of member.roles.cache.values()) {
      if (roleMap[discordRole.name]) {
        roles.push(roleMap[discordRole.name]);
      }
    }

    // Default to support if no specific role
    if (roles.length === 0) {
      roles.push(WISE2_ROLES.SUPPORT);
    }

    return roles;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [WISE2_ROLES.CLIENT]; // Safe default
  }
}

/**
 * Check if user has required permission for a command
 * @param {string} commandName - Name of the command
 * @param {Array} userRoles - User's WISE² roles
 * @returns {boolean} True if authorized
 */
function checkCommandPermission(commandName, userRoles) {
  const requiredRoles = COMMAND_PERMISSIONS[commandName];
  if (!requiredRoles) {
    return true;
  }

  return userRoles.some(role => requiredRoles.includes(role));
}

/**
 * Check rate limit for a user/command
 * @param {string} userId - Discord user ID
 * @param {string} commandName - Command name
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
 */
function checkRateLimit(userId, commandName) {
  const limitConfig = RATE_LIMITS[getCommandLimitCategory(commandName)] || RATE_LIMITS.default;
  const key = `${userId}:${commandName}`;
  const now = Date.now();

  let userLimit = rateLimitStore.get(key);

  if (!userLimit || now > userLimit.resetAt) {
    userLimit = {
      count: 0,
      resetAt: now + limitConfig.window,
    };
  }

  userLimit.count++;
  rateLimitStore.set(key, userLimit);

  return {
    allowed: userLimit.count <= limitConfig.max,
    remaining: Math.max(0, limitConfig.max - userLimit.count),
    resetAt: userLimit.resetAt,
  };
}

/**
 * Determine rate limit category for a command
 * @param {string} commandName - Command name
 * @returns {string} Limit category key
 */
function getCommandLimitCategory(commandName) {
  if (commandName.includes('deploy') || commandName.includes('rollback') || commandName.includes('restart')) {
    return 'deployment';
  }
  if (commandName.includes('search') || commandName.includes('brain')) {
    return 'expensive';
  }
  return 'default';
}

/**
 * Authorization middleware for command execution
 * @param {Object} interaction - Discord interaction
 * @param {Object} client - Discord client
 * @param {string} commandName - Command name being executed
 * @returns {Promise<Object>} Authorization result
 */
async function authorizeCommand(interaction, client, commandName) {
  const executionId = generateExecutionId();

  try {
    // Get user roles
    const userRoles = await getUserRoles(interaction, client);

    // Check permission
    if (!checkCommandPermission(commandName, userRoles)) {
      return {
        authorized: false,
        message: `❌ You don't have permission to use \`${commandName}\`. Required roles: ${COMMAND_PERMISSIONS[commandName]?.join(', ') || 'None specified'}`,
        roles: userRoles,
        executionId,
      };
    }

    // Check rate limit
    const rateLimitStatus = checkRateLimit(interaction.user.id, commandName);
    if (!rateLimitStatus.allowed) {
      const resetIn = Math.ceil((rateLimitStatus.resetAt - Date.now()) / 1000);
      return {
        authorized: false,
        message: `⏳ Rate limit exceeded. Try again in ${resetIn} seconds.`,
        roles: userRoles,
        executionId,
      };
    }

    return {
      authorized: true,
      message: 'authorized',
      roles: userRoles,
      executionId,
      rateLimitRemaining: rateLimitStatus.remaining,
    };
  } catch (error) {
    console.error('Authorization error:', error);
    return {
      authorized: false,
      message: `⚠️ Authorization check failed: ${error.message}`,
      executionId,
    };
  }
}

/**
 * Generate unique execution ID for audit trail
 * @returns {string} Unique execution ID
 */
function generateExecutionId() {
  return `exec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

module.exports = {
  authorizeCommand,
  getUserRoles,
  checkCommandPermission,
  checkRateLimit,
  generateExecutionId,
  WISE2_ROLES,
  COMMAND_PERMISSIONS,
  RATE_LIMITS,
};
