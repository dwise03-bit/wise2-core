/**
 * WISE² Enterprise API Manager
 * Centralized management, validation, and health checking for all external APIs
 * No secrets logged. All credentials masked in output.
 */
import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface APICredential {
    name: string;
    category: string;
    envVariable: string;
    required: boolean;
    status: 'active' | 'template' | 'missing';
    validated: boolean;
    lastChecked?: Date;
    error?: string;
}
export interface APIServiceConfig {
    name: string;
    category: string;
    description: string;
    credentials: APICredential[];
    healthCheckUrl?: string;
    connectionUrl?: string;
    documentation?: string;
}
export declare class APIManager implements OnModuleInit {
    private configService;
    private readonly logger;
    private apiRegistry;
    private credentials;
    constructor(configService: ConfigService);
    /**
     * Initialize API manager and register all known services
     */
    onModuleInit(): Promise<void>;
    /**
     * Register all known API services and their credentials
     */
    private registerAllServices;
    /**
     * Register a service in the API registry
     */
    private registerService;
    /**
     * Validate all registered credentials
     */
    private validateAllCredentials;
    /**
     * Generate API inventory report
     */
    private generateInventory;
    /**
     * Get service configuration by key
     */
    getService(key: string): APIServiceConfig | undefined;
    /**
     * List all services by category
     */
    getServicesByCategory(category: string): APIServiceConfig[];
    /**
     * Get all services
     */
    getAllServices(): APIServiceConfig[];
    /**
     * Get credential status (masked, never returns actual value)
     */
    getCredentialStatus(envVariable: string): {
        found: boolean;
        required: boolean;
        name?: undefined;
        status?: undefined;
        lastChecked?: undefined;
        error?: undefined;
    } | {
        name: string;
        found: boolean;
        required: boolean;
        status: "active" | "missing" | "template";
        lastChecked: Date | undefined;
        error: string | undefined;
    };
    /**
     * Health check for all services
     */
    healthCheck(): Promise<{
        timestamp: string;
        services: {
            name: string;
            status: string;
            credentialsConfigured: number;
            credentialsRequired: number;
        }[];
    }>;
    /**
     * Generate integration map (no secrets)
     */
    getIntegrationMap(): {
        summary: {
            total_services: number;
            categories: number;
            last_validated: string;
        };
        services: {
            id: string | undefined;
            name: string;
            category: string;
            description: string;
            status: string;
            credentials_count: number;
            documentation: string | undefined;
        }[];
    };
}
//# sourceMappingURL=api-manager.d.ts.map