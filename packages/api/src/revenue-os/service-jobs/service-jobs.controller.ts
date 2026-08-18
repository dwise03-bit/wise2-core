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
import { ServiceJobStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { ServiceJobsService } from './service-jobs.service';
import { CreateServiceJobDto, UpdateServiceJobDto } from './dto/service-job.dto';

@Controller('revenue-os/service-jobs')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ServiceJobsController {
  constructor(private readonly serviceJobsService: ServiceJobsService) {}

  @Get()
  findAll(
    @Req() req: Request,
    @Query('status') status?: ServiceJobStatus,
    @Query('customerId') customerId?: string,
    @Query('leadId') leadId?: string,
    @Query('technician') technician?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tenantId = requireTenantId(req);
    return this.serviceJobsService.findAll(tenantId, {
      status,
      customerId,
      leadId,
      technician,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('today-jobs')
  getTodaysJobs(@Req() req: Request) {
    return this.serviceJobsService.getTodaysJobs(requireTenantId(req));
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.serviceJobsService.findOne(requireTenantId(req), id);
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateServiceJobDto) {
    return this.serviceJobsService.create(requireTenantId(req), body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() body: UpdateServiceJobDto) {
    return this.serviceJobsService.update(requireTenantId(req), id, body);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.serviceJobsService.remove(requireTenantId(req), id);
  }
}

function requireTenantId(req: Request): string {
  const tenantId = req.tenant_id;
  if (!tenantId) {
    throw new Error('Missing tenant_id on request');
  }
  return tenantId;
}
