import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('v1/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(
    @Body()
    body: {
      businessName: string;
      contactName: string;
      email: string;
      phone?: string;
      website?: string;
      industry?: string;
      notes?: string;
      tags?: string[];
      mrr?: number;
      prospectId?: string;
      userId?: string;
    },
  ) {
    return this.customersService.create(body);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.customersService.findAll({
      status,
      search,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('stats')
  getStats() {
    return this.customersService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      businessName: string;
      contactName: string;
      email: string;
      phone: string;
      website: string;
      industry: string;
      notes: string;
      tags: string[];
      status: string;
      mrr: number;
    }>,
  ) {
    return this.customersService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }

  @Post('convert-from-prospect/:prospectId')
  convertFromProspect(@Param('prospectId') prospectId: string) {
    return this.customersService.convertFromProspect(prospectId);
  }
}
