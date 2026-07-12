import { Controller, Get, Param } from '@nestjs/common'
import { APIManager, APIServiceConfig } from './api-manager'

/**
 * API Status & Integration Controller
 * Provides visibility into all configured API services and their health
 * No secrets exposed in any endpoint
 */
@Controller('v1/system/apis')
export class APIStatusController {
  constructor(private apiManager: APIManager) {}

  /**
   * GET /api/v1/system/apis/health
   * Overall health status of all API integrations
   */
  @Get('health')
  async getHealthStatus(): Promise<any> {
    return await this.apiManager.healthCheck()
  }

  /**
   * GET /api/v1/system/apis/inventory
   * Complete inventory of all registered APIs
   */
  @Get('inventory')
  getInventory(): any {
    return this.apiManager.getIntegrationMap()
  }

  /**
   * GET /api/v1/system/apis/by-category/:category
   * List services by category
   */
  @Get('by-category/:category')
  getByCategory(@Param('category') category: string): any {
    return {
      category,
      services: this.apiManager.getServicesByCategory(category),
    }
  }

  /**
   * GET /api/v1/system/apis/:service
   * Get details for a specific service (no secrets)
   */
  @Get(':service')
  getService(@Param('service') service: string): any {
    const config = this.apiManager.getService(service)
    if (!config) {
      return { error: `Service '${service}' not found` }
    }

    return {
      service,
      ...config,
      credentials: config.credentials.map((c) => ({
        name: c.name,
        status: c.status,
        required: c.required,
        validated: c.validated,
      })),
    }
  }

  /**
   * GET /api/v1/system/apis
   * List all available services
   */
  @Get()
  getAllServices(): any {
    return {
      total: this.apiManager.getAllServices().length,
      services: this.apiManager.getAllServices().map((s) => ({
        name: s.name,
        category: s.category,
        description: s.description,
      })),
    }
  }
}
