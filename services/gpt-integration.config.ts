/**
 * WISE² Command Center GPT Integration Configuration
 * Centralizes all GPT integration points across the platform
 */

export const GPT_CONFIG = {
  gpt: {
    id: 'g-6aa6a67f0d9c8191bb664542f87f28b4',
    name: 'WISE² Command Center',
    url: 'https://chatgpt.com/g/g-6aa6a67f0d9c8191bb664542f87f28b4-wise2-command-center',
    description: 'AI-native operations command center for WISE² Genesis systems, business, and automation.',
    access: 'anyone_with_link',
    status: 'active',
  },

  integrations: {
    // API Integration
    api: {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3010',
      endpoints: {
        gptLink: '/command-center/gpt/link',
        gptContext: '/command-center/gpt/context',
        dashboard: '/command-center/dashboard',
      },
    },

    // Dashboard Integration
    dashboard: {
      enabled: true,
      port: 3002,
      url: 'http://localhost:3002',
      productionUrl: 'https://dashboard.wise2.net',
      componentPath: 'apps/dashboard/app/components/gpt',
      features: {
        widget: true,
        sidePanel: true,
        contextMenu: true,
      },
    },

    // Website Integration
    website: {
      enabled: true,
      port: 3001,
      url: 'http://localhost:3001',
      productionUrl: 'https://wise2.net',
      componentPath: 'apps/website/app/components/gpt',
      features: {
        homepage: true,
        navbar: true,
        modal: true,
      },
    },

    // Discord Integration
    discord: {
      enabled: process.env.DISCORD_ENABLED === 'true',
      botToken: process.env.DISCORD_BOT_TOKEN,
      serverId: process.env.DISCORD_SERVER_ID,
      channels: {
        alerts: process.env.DISCORD_ALERTS_CHANNEL,
        general: process.env.DISCORD_GENERAL_CHANNEL,
        commands: process.env.DISCORD_COMMANDS_CHANNEL,
      },
      webhooks: {
        gptResponses: process.env.DISCORD_GPT_WEBHOOK,
        notifications: process.env.DISCORD_NOTIFICATIONS_WEBHOOK,
      },
      features: {
        commandIntegration: true,
        notificationBridge: true,
        asyncExecution: true,
      },
    },

    // Knowledge Base / Hermes Integration
    knowledgeBase: {
      enabled: true,
      baseUrl: process.env.HERMES_BASE_URL || 'http://localhost:3012',
      endpoints: {
        query: '/brain-api/query',
        context: '/brain-api/context',
        update: '/brain-api/update',
      },
      features: {
        contextReferral: true,
        documentLinks: true,
        dynamicContext: true,
      },
    },

    // Slack Integration (future)
    slack: {
      enabled: false,
      botToken: process.env.SLACK_BOT_TOKEN,
      features: {
        slashCommands: false,
        shortcuts: false,
        messages: false,
      },
    },

    // Claude Design Handoff Integration
    claudeDesignHandoff: {
      enabled: true,
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3010',
      endpoints: {
        submitBrief: '/api/design-briefs',
        getBrief: '/api/design-briefs/:briefId',
        listBriefs: '/api/design-briefs',
        updateBrief: '/api/design-briefs/:briefId',
        getPending: '/api/design-briefs/pending',
        getStats: '/api/design-briefs/stats',
      },
      features: {
        submitFromChatGPT: true,
        trackStatus: true,
        claudeUpdates: true,
        feedbackLoop: true,
        assetManagement: true,
      },
      headers: {
        'x-design-handoff': 'chatgpt-plugin',
      },
    },
  },

  // Pre-load data for GPT context
  contextData: {
    dashboardMetrics: true,
    userPermissions: true,
    recentActivity: true,
    systemStatus: true,
    notifications: true,
  },

  // GPT custom instructions
  instructions: `You are the WISE² Command Center GPT.

Your role: Help users manage and optimize their WISE² operations, providing insights from real-time business data.

Available data: Revenue metrics, job management, technician utilization, estimates, accounts receivable, margin analysis, AI recommendations, scheduling, business health indicators.

Capabilities:
- Generate actionable business insights
- Analyze trends and patterns
- Provide operational recommendations
- Guide decision-making with data
- Answer questions about business performance
- Suggest process improvements
- Forecast outcomes based on historical data

Always:
- Reference current data when available
- Link to relevant WISE² documentation
- Suggest next steps and actions
- Maintain operational context awareness`,
};

export default GPT_CONFIG;
