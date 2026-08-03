import { APIManager } from './api-manager';
/**
 * API Status & Integration Controller
 * Provides visibility into all configured API services and their health
 * No secrets exposed in any endpoint
 */
export declare class APIStatusController {
    private apiManager;
    constructor(apiManager: APIManager);
    /**
     * GET /api/v1/system/apis/health
     * Overall health status of all API integrations
     */
    getHealthStatus(): Promise<any>;
    /**
     * GET /api/v1/system/apis/inventory
     * Complete inventory of all registered APIs
     */
    getInventory(): any;
    /**
     * GET /api/v1/system/apis/by-category/:category
     * List services by category
     */
    getByCategory(category: string): any;
    /**
     * GET /api/v1/system/apis/:service
     * Get details for a specific service (no secrets)
     */
    getService(service: string): any;
    /**
     * GET /api/v1/system/apis
     * List all available services
     */
    getAllServices(): any;
}
//# sourceMappingURL=api-status.controller.d.ts.map