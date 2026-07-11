/**
 * WISE² Enterprise API Manager
 * Centralized management, validation, and health checking for all external APIs
 * No secrets logged. All credentials masked in output.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface APICredential {
  name: string
  category: string
  envVariable: string
  required: boolean
  status: 'active' | 'template' | 'missing'
  validated: boolean
  lastChecked?: Date
  error?: string
}

interface APIServiceConfig {
  name: string
  category: string
  description: string
  credentials: APICredential[]
  healthCheckUrl?: string
  connectionUrl?: string
  documentation?: string
}

@Injectable()
export class APIManager implements OnModuleInit {
  private readonly logger = new Logger('APIManager')
  private apiRegistry: Map<string, APIServiceConfig> = new Map()
  private credentials: Map<string, APICredential> = new Map()

  constructor(private configService: ConfigService) {}

  /**
   * Initialize API manager and register all known services
   */
  async onModuleInit() {
    this.registerAllServices()
    await this.validateAllCredentials()
    this.generateInventory()
  }

  /**
   * Register all known API services and their credentials
   */
  private registerAllServices() {
    // AI Services
    this.registerService('claude', {
      name: 'Anthropic Claude API',
      category: 'AI',
      description: 'Advanced language model for intelligent features',
      credentials: [
        {
          name: 'API Key',
          category: 'AI',
          envVariable: 'CLAUDE_API_KEY',
          required: true,
          status: 'active',
          validated: false,
        },
      ],
      healthCheckUrl: 'https://api.anthropic.com/health',
      documentation: 'https://docs.anthropic.com',
    })

    this.registerService('openai', {
      name: 'OpenAI API',
      category: 'AI',
      description: 'Alternative language model (optional)',
      credentials: [
        {
          name: 'API Key',
          category: 'AI',
          envVariable: 'OPENAI_API_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://docs.openai.com',
    })

    this.registerService('ollama', {
      name: 'Ollama Local LLM',
      category: 'AI',
      description: 'Local fallback language model',
      credentials: [
        {
          name: 'API URL',
          category: 'AI',
          envVariable: 'OLLAMA_API_URL',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      connectionUrl: 'http://ollama:11434',
    })

    // Communication Services
    this.registerService('discord', {
      name: 'Discord Bot',
      category: 'Communication',
      description: 'Admin bot for community management and alerts',
      credentials: [
        {
          name: 'Bot Token',
          category: 'Communication',
          envVariable: 'DISCORD_BOT_TOKEN',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Guild ID',
          category: 'Communication',
          envVariable: 'DISCORD_GUILD_ID',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Admin ID',
          category: 'Communication',
          envVariable: 'ADMIN_ID',
          required: true,
          status: 'active',
          validated: false,
        },
      ],
    })

    this.registerService('resend', {
      name: 'Resend Email Service',
      category: 'Communication',
      description: 'Email delivery service',
      credentials: [
        {
          name: 'API Key',
          category: 'Communication',
          envVariable: 'RESEND_API_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://resend.com/docs',
    })

    this.registerService('sendgrid', {
      name: 'SendGrid Email Service',
      category: 'Communication',
      description: 'Alternative email delivery service',
      credentials: [
        {
          name: 'API Key',
          category: 'Communication',
          envVariable: 'SENDGRID_API_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://sendgrid.com/docs',
    })

    // Payment Services
    this.registerService('stripe', {
      name: 'Stripe Payments',
      category: 'Payment',
      description: 'Payment processing and subscription management',
      credentials: [
        {
          name: 'Secret Key',
          category: 'Payment',
          envVariable: 'STRIPE_SECRET_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
        {
          name: 'Publishable Key',
          category: 'Payment',
          envVariable: 'STRIPE_PUBLISHABLE_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
        {
          name: 'Webhook Secret',
          category: 'Payment',
          envVariable: 'STRIPE_WEBHOOK_SECRET',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://stripe.com/docs/api',
    })

    // Developer Services
    this.registerService('github', {
      name: 'GitHub Integration',
      category: 'Developer',
      description: 'GitHub repository and workflow automation',
      credentials: [
        {
          name: 'Personal Access Token',
          category: 'Developer',
          envVariable: 'GITHUB_TOKEN',
          required: false,
          status: 'template',
          validated: false,
        },
        {
          name: 'Repository Owner',
          category: 'Developer',
          envVariable: 'GITHUB_OWNER',
          required: false,
          status: 'active',
          validated: false,
        },
        {
          name: 'Repository Name',
          category: 'Developer',
          envVariable: 'GITHUB_REPO',
          required: false,
          status: 'active',
          validated: false,
        },
      ],
      documentation: 'https://docs.github.com/rest',
    })

    // Media & Streaming Services
    this.registerService('youtube', {
      name: 'YouTube API',
      category: 'Media',
      description: 'Live streaming and video management (Phase 2+)',
      credentials: [
        {
          name: 'API Key',
          category: 'Media',
          envVariable: 'YOUTUBE_API_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://developers.google.com/youtube/v3',
    })

    this.registerService('twitch', {
      name: 'Twitch API',
      category: 'Media',
      description: 'Live streaming integration (Phase 2+)',
      credentials: [
        {
          name: 'Client ID',
          category: 'Media',
          envVariable: 'TWITCH_CLIENT_ID',
          required: false,
          status: 'template',
          validated: false,
        },
        {
          name: 'Client Secret',
          category: 'Media',
          envVariable: 'TWITCH_CLIENT_SECRET',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://dev.twitch.tv/docs/api',
    })

    // Analytics Services
    this.registerService('posthog', {
      name: 'PostHog Analytics',
      category: 'Analytics',
      description: 'User behavior and event tracking (optional)',
      credentials: [
        {
          name: 'Public API Key',
          category: 'Analytics',
          envVariable: 'NEXT_PUBLIC_POSTHOG_KEY',
          required: false,
          status: 'template',
          validated: false,
        },
      ],
      documentation: 'https://posthog.com/docs',
    })

    // Database Services
    this.registerService('postgresql', {
      name: 'PostgreSQL Database',
      category: 'Database',
      description: 'Primary relational database',
      credentials: [
        {
          name: 'Host',
          category: 'Database',
          envVariable: 'DB_HOST',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Port',
          category: 'Database',
          envVariable: 'DB_PORT',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Username',
          category: 'Database',
          envVariable: 'DB_USERNAME',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Password',
          category: 'Database',
          envVariable: 'DB_PASSWORD',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Database Name',
          category: 'Database',
          envVariable: 'DB_NAME',
          required: true,
          status: 'active',
          validated: false,
        },
      ],
      connectionUrl: 'postgresql://',
    })

    this.registerService('redis', {
      name: 'Redis Cache',
      category: 'Database',
      description: 'In-memory cache and message queue',
      credentials: [
        {
          name: 'URL',
          category: 'Database',
          envVariable: 'REDIS_URL',
          required: true,
          status: 'active',
          validated: false,
        },
        {
          name: 'Host',
          category: 'Database',
          envVariable: 'REDIS_HOST',
          required: false,
          status: 'active',
          validated: false,
        },
        {
          name: 'Port',
          category: 'Database',
          envVariable: 'REDIS_PORT',
          required: false,
          status: 'active',
          validated: false,
        },
      ],
    })

    // Monitoring & Logging
    this.registerService('prometheus', {
      name: 'Prometheus Monitoring',
      category: 'Monitoring',
      description: 'Metrics collection and monitoring',
      credentials: [],
      connectionUrl: 'http://prometheus:9090',
    })

    this.registerService('grafana', {
      name: 'Grafana Dashboards',
      category: 'Monitoring',
      description: 'Metrics visualization and alerts',
      credentials: [],
      connectionUrl: 'http://grafana:3000',
      healthCheckUrl: 'http://localhost:3003/api/health',
    })
  }

  /**
   * Register a service in the API registry
   */
  private registerService(key: string, config: APIServiceConfig) {
    this.apiRegistry.set(key, config)
    config.credentials.forEach((cred) => {
      this.credentials.set(cred.envVariable, cred)
    })
  }

  /**
   * Validate all registered credentials
   */
  private async validateAllCredentials() {
    const results = {
      total: this.credentials.size,
      valid: 0,
      missing: 0,
      errors: [] as string[],
    }

    for (const [envVar, credential] of this.credentials) {
      const value = this.configService.get(envVar)

      if (!value) {
        credential.status = credential.required ? 'missing' : 'template'
        results.missing++

        if (credential.required) {
          results.errors.push(
            `⚠️  MISSING REQUIRED: ${credential.name} (${envVar})`
          )
        }
      } else {
        credential.status = 'active'
        credential.validated = true
        credential.lastChecked = new Date()
        results.valid++
      }
    }

    if (results.errors.length > 0) {
      this.logger.warn(
        `\n📋 CONFIGURATION WARNINGS:\n${results.errors.join('\n')}\n`
      )
    }

    this.logger.log(
      `✅ API Validation Complete: ${results.valid}/${results.total} credentials configured`
    )
  }

  /**
   * Generate API inventory report
   */
  private generateInventory() {
    const inventory = {
      timestamp: new Date().toISOString(),
      total_services: this.apiRegistry.size,
      by_category: {} as Record<string, string[]>,
      active: [] as string[],
      template: [] as string[],
      missing: [] as string[],
    }

    for (const [key, service] of this.apiRegistry) {
      const category = service.category

      if (!inventory.by_category[category]) {
        inventory.by_category[category] = []
      }
      inventory.by_category[category].push(service.name)

      // Determine overall status
      const statuses = service.credentials.map((c) => c.status)
      if (statuses.includes('missing')) {
        inventory.missing.push(service.name)
      } else if (statuses.includes('template')) {
        inventory.template.push(service.name)
      } else {
        inventory.active.push(service.name)
      }
    }

    this.logger.log('📊 API INVENTORY SUMMARY')
    this.logger.log(
      `  Active: ${inventory.active.length} | Template: ${inventory.template.length} | Missing: ${inventory.missing.length}`
    )
  }

  /**
   * Get service configuration by key
   */
  getService(key: string): APIServiceConfig | undefined {
    return this.apiRegistry.get(key)
  }

  /**
   * List all services by category
   */
  getServicesByCategory(category: string): APIServiceConfig[] {
    return Array.from(this.apiRegistry.values()).filter(
      (s) => s.category === category
    )
  }

  /**
   * Get all services
   */
  getAllServices(): APIServiceConfig[] {
    return Array.from(this.apiRegistry.values())
  }

  /**
   * Get credential status (masked, never returns actual value)
   */
  getCredentialStatus(envVariable: string) {
    const cred = this.credentials.get(envVariable)
    if (!cred) {
      return { found: false, required: false }
    }

    return {
      name: cred.name,
      found: cred.validated,
      required: cred.required,
      status: cred.status,
      lastChecked: cred.lastChecked,
      error: cred.error,
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    return {
      timestamp: new Date().toISOString(),
      services: Array.from(this.apiRegistry.values()).map((service) => ({
        name: service.name,
        status: service.credentials.every((c) => c.validated)
          ? 'healthy'
          : 'degraded',
        credentialsConfigured: service.credentials.filter(
          (c) => c.validated
        ).length,
        credentialsRequired: service.credentials.filter(
          (c) => c.required
        ).length,
      })),
    }
  }

  /**
   * Generate integration map (no secrets)
   */
  getIntegrationMap() {
    return {
      summary: {
        total_services: this.apiRegistry.size,
        categories: Array.from(
          new Set(this.apiRegistry.values().map((s) => s.category))
        ).length,
        last_validated: new Date().toISOString(),
      },
      services: Array.from(this.apiRegistry.values()).map((service) => ({
        id: Array.from(this.apiRegistry.keys()).find(
          (k) => this.apiRegistry.get(k) === service
        ),
        name: service.name,
        category: service.category,
        description: service.description,
        status: service.credentials.every((c) => c.validated)
          ? 'active'
          : 'inactive',
        credentials_count: service.credentials.length,
        documentation: service.documentation,
      })),
    }
  }
}
