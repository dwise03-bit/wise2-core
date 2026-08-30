import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CherryCountService } from './cherry-count.service';
import { CherryCountAiService, CherryAiInsightType } from './cherry-count-ai.service';
import { CherryCountPhoneService } from './cherry-count-phone.service';
import { CherryCountSeedService } from './cherry-count-seed.service';
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
  UpdatePhoneConfigInput,
} from './cherry-count.types';

@ApiTags('Cherry Count')
@Controller('v1/cherry-count')
export class CherryCountPublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'cherry-count', timestamp: new Date().toISOString() };
  }

  @Get('workspaces')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async workspaces(@Request() req: { user: { id: string } }) {
    const memberships = await this.prisma.tenantMembership.findMany({
      where: {
        userId: req.user.id,
        tenant: { state: 'ACTIVE', vertical: 'retail_popup' },
      },
      include: {
        tenant: { select: { id: true, name: true, slug: true, vertical: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((membership) => ({
      tenantId: membership.tenantId,
      role: membership.role,
      tenant: membership.tenant,
    }));
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
    private readonly phone: CherryCountPhoneService,
    private readonly seed: CherryCountSeedService,
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

  @Get('phone')
  phoneDashboard(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    return this.phone.getDashboard(tenant.tenantId);
  }

  @Patch('phone')
  updatePhone(
    @CherryCountTenant() tenant: CherryCountRequestTenant,
    @Body() body: UpdatePhoneConfigInput,
  ) {
    return this.phone.updateConfig(tenant.tenantId, tenant.role, body);
  }

  @Post('seed')
  seedDemo(@CherryCountTenant() tenant: CherryCountRequestTenant) {
    this.seed.assertOwner(tenant.role);
    return this.seed.seedDemo(tenant.tenantId);
  }
}
