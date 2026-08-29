import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CherryCountService } from './cherry-count.service';
import { CherryCountAiService, CherryAiInsightType } from './cherry-count-ai.service';
import { CherryCountTenant } from './cherry-count-tenant.decorator';
import { CherryCountRequestTenant, CherryCountTenantGuard } from './cherry-count-tenant.guard';
import {
  AdjustInventoryInput,
  AssignEventInventoryInput,
  CreateContainerInput,
  CreateCustomerInput,
  CreateEventInput,
  CreateProductInput,
  CreateSaleInput,
  UpdatePackingInput,
} from './cherry-count.types';
import { Request } from '@nestjs/common';

@ApiTags('Cherry Count')
@Controller('v1/cherry-count')
export class CherryCountPublicController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'cherry-count', timestamp: new Date().toISOString() };
  }
}

@ApiTags('Cherry Count')
@ApiBearerAuth()
@Controller('v1/cherry-count')
@UseGuards(JwtAuthGuard, CherryCountTenantGuard)
export class CherryCountController {
  constructor(
    private readonly cherryCount: CherryCountService,
    private readonly ai: CherryCountAiService,
  ) {}

  @Get('bootstrap')
  bootstrap(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.bootstrap(tenant.tenantId);
  }

  @Get('products')
  listProducts(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.listProducts(tenant.tenantId);
  }

  @Get('products/:id')
  getProduct(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Param('id') id: string,
  ) {
    return this.cherryCount.getProduct(tenant.tenantId, id);
  }

  @Post('products')
  createProduct(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Body() body: CreateProductInput,
  ) {
    return this.cherryCount.createProduct(tenant.tenantId, tenant.role, body);
  }

  @Post('inventory/adjust')
  adjustInventory(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Request() req: any,
    @Body() body: AdjustInventoryInput,
  ) {
    return this.cherryCount.adjustInventory(tenant.tenantId, req.user.id, tenant.role, body);
  }

  @Get('containers')
  listContainers(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.listContainers(tenant.tenantId);
  }

  @Post('containers')
  createContainer(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Body() body: CreateContainerInput,
  ) {
    return this.cherryCount.createContainer(tenant.tenantId, tenant.role, body);
  }

  @Get('events')
  listEvents(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.listEvents(tenant.tenantId);
  }

  @Post('events')
  createEvent(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Body() body: CreateEventInput,
  ) {
    return this.cherryCount.createEvent(tenant.tenantId, tenant.role, body);
  }

  @Post('events/:id/inventory')
  assignInventory(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Param('id') id: string,
    @Body() body: AssignEventInventoryInput[],
  ) {
    return this.cherryCount.assignEventInventory(tenant.tenantId, id, tenant.role, body);
  }

  @Post('events/:id/pack')
  updatePacking(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Param('id') id: string,
    @Body() body: UpdatePackingInput[],
  ) {
    return this.cherryCount.updatePacking(tenant.tenantId, id, tenant.role, body);
  }

  @Post('events/:id/close')
  closeEvent(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Param('id') id: string,
  ) {
    return this.cherryCount.closeEvent(tenant.tenantId, id, tenant.role);
  }

  @Get('sales')
  listSales(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.listSales(tenant.tenantId);
  }

  @Post('sales')
  createSale(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Request() req: any,
    @Body() body: CreateSaleInput,
  ) {
    return this.cherryCount.createSale(tenant.tenantId, req.user.id, tenant.role, body);
  }

  @Get('customers')
  listCustomers(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.listCustomers(tenant.tenantId);
  }

  @Post('customers')
  createCustomer(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Body() body: CreateCustomerInput,
  ) {
    return this.cherryCount.createCustomer(tenant.tenantId, tenant.role, body);
  }

  @Get('analytics')
  analytics(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.cherryCount.getAnalytics(tenant.tenantId);
  }

  @Post('ai/insights')
  aiInsights(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Body() body: { type: CherryAiInsightType },
  ) {
    return this.ai.getInsights(tenant.tenantId, body.type ?? 'daily');
  }
}
