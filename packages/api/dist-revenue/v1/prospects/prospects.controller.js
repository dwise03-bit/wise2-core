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
exports.ProspectsController = void 0;
const common_1 = require("@nestjs/common");
const prospects_service_1 = require("./prospects.service");
let ProspectsController = class ProspectsController {
    constructor(prospectsService) {
        this.prospectsService = prospectsService;
    }
    /**
     * POST /v1/prospects
     * Create a new prospect from intake form
     */
    async createProspect(body) {
        return this.prospectsService.createProspect(body);
    }
    /**
     * GET /v1/prospects
     * Get all prospects with optional filtering and search
     * Query params: status, search, sortBy, sortOrder, limit, offset
     */
    async getProspects(status, search, sortBy, sortOrder, limit, offset) {
        return this.prospectsService.getProspects({
            status,
            search,
            sortBy,
            sortOrder,
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
    }
    /**
     * GET /v1/prospects/:id
     * Get a specific prospect
     */
    async getProspect(id) {
        return this.prospectsService.getProspect(id);
    }
    /**
     * PATCH /v1/prospects/:id
     * Update prospect information
     */
    async updateProspect(id, body) {
        return this.prospectsService.updateProspect(id, body);
    }
    /**
     * PATCH /v1/prospects/:id/status
     * Change prospect status (with additional data like lost reason)
     */
    async updateProspectStatus(id, body) {
        return this.prospectsService.updateProspectStatus(id, body.status, { reason: body.reason });
    }
    /**
     * DELETE /v1/prospects/:id
     * Archive/delete a prospect
     */
    async deleteProspect(id) {
        return this.prospectsService.deleteProspect(id);
    }
    /**
     * GET /v1/prospects/stats/pipeline
     * Get pipeline statistics by stage and total opportunity value
     */
    async getPipelineStats() {
        return this.prospectsService.getPipelineStats();
    }
    /**
     * GET /v1/prospects/stats/lead-source
     * Get prospects grouped by lead source
     */
    async getProspectsByLeadSource() {
        return this.prospectsService.getProspectsByLeadSource();
    }
};
exports.ProspectsController = ProspectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "createProspect", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('sortBy')),
    __param(3, (0, common_1.Query)('sortOrder')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "getProspects", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "getProspect", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "updateProspect", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "updateProspectStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "deleteProspect", null);
__decorate([
    (0, common_1.Get)('stats/pipeline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "getPipelineStats", null);
__decorate([
    (0, common_1.Get)('stats/lead-source'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProspectsController.prototype, "getProspectsByLeadSource", null);
exports.ProspectsController = ProspectsController = __decorate([
    (0, common_1.Controller)('v1/prospects'),
    __metadata("design:paramtypes", [prospects_service_1.ProspectsService])
], ProspectsController);
//# sourceMappingURL=prospects.controller.js.map