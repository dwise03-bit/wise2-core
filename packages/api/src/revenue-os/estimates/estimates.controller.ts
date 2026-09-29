import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { EstimateStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { EstimatesService } from './estimates.service';
import { CreateEstimateDto, UpdateEstimateDto } from './dto/estimate.dto';

@Controller('revenue-os/estimates')
@UseGuards(JwtAuthGuard, TenantGuard)
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Query('status') status?: EstimateStatus,
    @Query('customerId') customerId?: string,
    @Query('leadId') leadId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tenantId = requireTenantId(req);
    return this.estimatesService.findAll(tenantId, {
      status,
      customerId,
      leadId,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('pipeline-summary')
  pipelineSummary(@Req() req: Request) {
    return this.estimatesService.pipelineSummary(requireTenantId(req));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.estimatesService.findOne(requireTenantId(req), id);
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateEstimateDto) {
    return this.estimatesService.create(requireTenantId(req), body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() body: UpdateEstimateDto) {
    return this.estimatesService.update(requireTenantId(req), id, body);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.estimatesService.remove(requireTenantId(req), id);
  }
}

function requireTenantId(req: Request): string {
  const tenantId = req.tenant_id;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
