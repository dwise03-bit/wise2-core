/**
 * WISE² Discord Intent-to-Slash Command Mapper
 * Maps WISE² IMP intents to Discord slash commands
 */

import { DiscordCommandConfig, IntentCategory } from './types';

/**
 * Map intent categories to slash command groups
 */
export const intentToCommandMap: Record<IntentCategory, DiscordCommandConfig> = {
  query: {
    name: 'ask',
    description: 'Query WISE² for information',
    options: [
      {
        name: 'question',
        description: 'What do you want to know?',
        type: 'string',
        required: true,
      },
      {
        name: 'context',
        description: 'Additional context',
        type: 'string',
        required: false,
      },
    ],
  },

  command: {
    name: 'do',
    description: 'Execute a command in WISE²',
    options: [
      {
        name: 'action',
        description: 'What action to perform',
        type: 'string',
        required: true,
      },
      {
        name: 'parameters',
        description: 'Action parameters',
        type: 'string',
        required: false,
      },
    ],
  },

  management: {
    name: 'manage',
    description: 'Manage WISE² resources',
    options: [
      {
        name: 'resource',
        description: 'What to manage (users, services, config)',
        type: 'string',
        required: true,
      },
      {
        name: 'operation',
        description: 'Operation (create, update, delete, list)',
        type: 'string',
        required: true,
      },
    ],
  },

  automation: {
    name: 'automate',
    description: 'Set up automation workflows',
    options: [
      {
        name: 'trigger',
        description: 'What triggers this automation',
        type: 'string',
        required: true,
      },
      {
        name: 'action',
        description: 'What happens when triggered',
        type: 'string',
        required: true,
      },
    ],
  },

  integration: {
    name: 'connect',
    description: 'Integrate external services',
    options: [
      {
        name: 'service',
        description: 'Service to connect (slack, github, api)',
        type: 'string',
        required: true,
      },
      {
        name: 'config',
        description: 'Configuration details',
        type: 'string',
        required: false,
      },
    ],
  },

  alert: {
    name: 'alert',
    description: 'Set up monitoring and alerts',
    options: [
      {
        name: 'target',
        description: 'What to monitor',
        type: 'string',
        required: true,
      },
      {
        name: 'threshold',
        description: 'Alert threshold',
        type: 'string',
        required: false,
      },
    ],
  },

  status: {
    name: 'status',
    description: 'Check WISE² status and health',
    options: [
      {
        name: 'service',
        description: 'Which service to check (all, imp, hermes, discord)',
        type: 'string',
        required: false,
      },
    ],
  },

  unknown: {
    name: 'intent',
    description: 'Submit a task or query to WISE² IMP',
    options: [
      {
        name: 'description',
        description: 'What do you want WISE² to do?',
        type: 'string',
        required: true,
      },
    ],
  },
};

/**
 * Map specific intent phrases to Discord command suggestions
 */
export const phraseToCommandMap: Record<string, string> = {
  // Query intents
  'what is': 'ask',
  'how do i': 'ask',
  'tell me': 'ask',
  'list': 'ask',
  'get': 'ask',
  'show': 'ask',
  'find': 'ask',

  // Command intents
  'create': 'do',
  'send': 'do',
  'run': 'do',
  'start': 'do',
  'execute': 'do',
  'deploy': 'do',
  'publish': 'do',

  // Management intents
  'add user': 'manage',
  'remove user': 'manage',
  'update config': 'manage',
  'delete': 'manage',
  'configure': 'manage',
  'set': 'manage',

  // Automation intents
  'when': 'automate',
  'schedule': 'automate',
  'trigger': 'automate',
  'watch': 'automate',

  // Integration intents
  'connect': 'connect',
  'integrate': 'connect',
  'sync': 'connect',
  'link': 'connect',

  // Alert intents
  'alert': 'alert',
  'notify': 'alert',
  'monitor': 'alert',
  'warn': 'alert',

  // Status intents
  'status': 'status',
  'health': 'status',
  'up': 'status',
  'check': 'status',
};

/**
 * Detect intent category from natural language input
 */
export function detectIntentCategory(input: string): IntentCategory {
  const lowerInput = input.toLowerCase();

  // Check phrase matches
  for (const [phrase, category] of Object.entries(phraseToCommandMap)) {
    if (lowerInput.includes(phrase)) {
      return category as IntentCategory;
    }
  }

  // Pattern matching for common structures
  if (lowerInput.match(/^(who|what|when|where|why|how)/)) return 'query';
  if (lowerInput.match(/^(can you|could you|would you|please)/)) return 'command';
  if (lowerInput.match(/create|add|remove|delete|update/)) return 'management';
  if (lowerInput.match(/when |every |on |if /)) return 'automation';
  if (lowerInput.match(/connect|integrate|sync|link/)) return 'integration';
  if (lowerInput.match(/alert|notify|warn|notify me/)) return 'alert';
  if (lowerInput.match(/status|health|up|down|check/)) return 'status';

  return 'unknown';
}

/**
 * Convert natural language to Discord slash command
 */
export function inputToSlashCommand(input: string): {
  command: string;
  args: string[];
} {
  const category = detectIntentCategory(input);
  const config = intentToCommandMap[category];

  // For the generic 'intent' command, preserve full input
  if (category === 'unknown') {
    return {
      command: 'intent',
      args: [input],
    };
  }

  // Extract arguments based on category
  const args: string[] = [];

  // First argument is the core action/question
  const stripped = input.toLowerCase();
  for (const [phrase] of Object.entries(phraseToCommandMap)) {
    if (stripped.includes(phrase)) {
      args.push(input.replace(new RegExp(phrase, 'i'), '').trim());
      break;
    }
  }

  if (args.length === 0) {
    args.push(input);
  }

  return {
    command: config.name,
    args,
  };
}

/**
 * Build Discord command from intent result
 */
export function resultToDiscordEmbed(result: any) {
  return {
    title: result.intent || 'Operation',
    color: result.status === 'success' ? '#00FF14' : '#FF0000',
    description: result.message || result.description || 'No result',
    fields: Object.entries(result.data || {})
      .slice(0, 5)
      .map(([key, value]) => ({
        name: key,
        value: String(value).slice(0, 100),
        inline: true,
      })),
    footer: { text: `Status: ${result.status || 'pending'}` },
  };
}

/**
 * Risk level to Discord color mapping
 */
export const riskLevelToColor: Record<number, string> = {
  0: '#00FF14', // Green - read-only
  1: '#FFB700', // Orange - reversible
  2: '#FF6B00', // Red-orange - mutating
  3: '#FF0000', // Red - destructive
};

/**
 * Risk level to action prompt
 */
export const riskLevelPrompt: Record<number, string> = {
  0: '✓ This is a read-only operation.',
  1: '⚠️ This operation is reversible. Proceed?',
  2: '⚠️⚠️ This will modify data. Confirm to proceed.',
  3: '🛑 DESTRUCTIVE: This cannot be undone. Type your confirmation token to proceed.',
};

/**
 * Format confirmation dialog for Discord
 */
export function formatConfirmationDialog(
  intent: string,
  riskLevel: number,
  confirmationId: string
): {
  title: string;
  description: string;
  color: string;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
} {
  return {
    title: `⚠️ Confirmation Required`,
    description: `${riskLevelPrompt[riskLevel]}\n\nIntent: **${intent}**`,
    color: riskLevelToColor[riskLevel],
    fields: [
      {
        name: 'Confirmation ID',
        value: `\`${confirmationId}\``,
        inline: false,
      },
      {
        name: 'Risk Level',
        value: `${riskLevel + 1}/4`,
        inline: true,
      },
      {
        name: 'Action',
        value: 'Use the buttons below or respond in thread',
        inline: true,
      },
    ],
  };
}

/**
 * Help command response
 */
export function generateHelpText(): string {
  return `
# WISE² Discord Bot Commands

## Available Slash Commands

### /ask
Query WISE² for information
\`\`\`
/ask question:"What is my account balance?" context:"optional"
\`\`\`

### /do
Execute a command in WISE²
\`\`\`
/do action:"send email" parameters:"to: user@example.com"
\`\`\`

### /manage
Manage WISE² resources (users, services, config)
\`\`\`
/manage resource:"users" operation:"list"
\`\`\`

### /automate
Set up automation workflows
\`\`\`
/automate trigger:"daily at 9am" action:"send summary"
\`\`\`

### /connect
Integrate external services
\`\`\`
/connect service:"slack" config:"webhook_url"
\`\`\`

### /alert
Set up monitoring and alerts
\`\`\`
/alert target:"cpu usage" threshold:"80%"
\`\`\`

### /status
Check WISE² service status
\`\`\`
/status service:"all"
\`\`\`

### /intent (generic)
Submit any task to WISE² IMP
\`\`\`
/intent description:"Do anything here"
\`\`\`

## Prefix Commands (Fallback)

\`\`\`
!wise2 intent "your task here"
!wise2 status
\`\`\`

## Risk Levels & Confirmations

- **Level 0 (Green)**: Read-only operations
- **Level 1 (Orange)**: Reversible operations
- **Level 2 (Red-Orange)**: Mutating operations
- **Level 3 (Red)**: Destructive operations

Use the ✓ Approve or ✗ Deny buttons to confirm.
`;
}
