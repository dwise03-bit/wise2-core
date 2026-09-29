"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIStatusController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_manager_1 = require("./api-manager");
/**
 * API Status & Integration Controller
 * Provides visibility into all configured API services and their health
 * No secrets exposed in any endpoint
 */
let APIStatusController = class APIStatusController {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }
    /**
     * GET /api/v1/system/apis/health
     * Overall health status of all API integrations
     */
    async getHealthStatus() {
        return await this.apiManager.healthCheck();
    }
    /**
     * GET /api/v1/system/apis/inventory
     * Complete inventory of all registered APIs
     */
    getInventory() {
        return this.apiManager.getIntegrationMap();
    }
    /**
     * GET /api/v1/system/apis/by-category/:category
     * List services by category
     */
    getByCategory(category) {
        return {
            category,
            services: this.apiManager.getServicesByCategory(category),
        };
    }
    /**
     * GET /api/v1/system/apis/:service
     * Get details for a specific service (no secrets)
     */
    getService(service) {
        const config = this.apiManager.getService(service);
        if (!config) {
            return { error: `Service '${service}' not found` };
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
        };
    }
    /**
     * GET /api/v1/system/apis
     * List all available services
     */
    getAllServices() {
        return {
            total: this.apiManager.getAllServices().length,
            services: this.apiManager.getAllServices().map((s) => ({
                name: s.name,
                category: s.category,
                description: s.description,
            })),
        };
    }
};
exports.APIStatusController = APIStatusController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], APIStatusController.prototype, "getHealthStatus", null);
__decorate([
    (0, common_1.Get)('inventory'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], APIStatusController.prototype, "getInventory", null);
__decorate([
    (0, common_1.Get)('by-category/:category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], APIStatusController.prototype, "getByCategory", null);
__decorate([
    (0, common_1.Get)(':service'),
    __param(0, (0, common_1.Param)('service')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], APIStatusController.prototype, "getService", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], APIStatusController.prototype, "getAllServices", null);
exports.APIStatusController = APIStatusController = __decorate([
    (0, swagger_1.ApiTags)('system'),
    (0, common_1.Controller)('v1/system/apis'),
    __metadata("design:paramtypes", [api_manager_1.APIManager])
], APIStatusController);
//# sourceMappingURL=api-status.controller.js.map