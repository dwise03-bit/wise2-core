import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FieldtechService } from './fieldtech.service';
import { CreateJobDto, EquipmentDto, ReadingDto, ReportDto, UpdateJobDto } from './dto/fieldtech.dto';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * WISE² Field Tech Android backend (spec §19). No TenantGuard dependency, unlike
 * revenue-os/service-jobs — see docs/ANDROID_IMPLEMENTATION_AUDIT.md §4 for why this is a
 * dedicated module rather than a reuse of the CRM job model.
 */
@Controller('v1/fieldtech')
@UseGuards(JwtAuthGuard)
export class FieldtechController {
  constructor(private readonly fieldtech: FieldtechService) {}

  @Get('jobs')
  getJobs(@CurrentUser() user: AuthenticatedUser) {
    return this.fieldtech.getJobs(user.id);
  }

  @Get('jobs/today')
  getTodaysJobs(@CurrentUser() user: AuthenticatedUser) {
    return this.fieldtech.getTodaysJobs(user.id);
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    return this.fieldtech.getJob(id);
  }

  @Post('jobs')
  createJob(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateJobDto) {
    return this.fieldtech.createJob(user.id, dto);
  }

  @Patch('jobs/:id')
  updateJob(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.fieldtech.updateJob(id, dto);
  }

  @Get('equipment/:id')
  getEquipment(@Param('id') id: string) {
    return this.fieldtech.getEquipment(id);
  }

  @Post('equipment')
  createEquipment(@Body() dto: EquipmentDto) {
    return this.fieldtech.createEquipment(dto);
  }

  @Get('equipment/:id/history')
  getServiceHistory(@Param('id') id: string) {
    return this.fieldtech.getServiceHistory(id);
  }

  @Get('readings')
  getReadings(@Query('jobId') jobId: string) {
    return this.fieldtech.getReadings(jobId);
  }

  @Post('readings')
  submitReading(@Body() dto: ReadingDto) {
    return this.fieldtech.submitReading(dto);
  }

  @Get('reports/:jobId')
  getReport(@Param('jobId') jobId: string) {
    return this.fieldtech.getReport(jobId);
  }

  @Put('reports/:jobId')
  saveReport(@Param('jobId') jobId: string, @Body() dto: ReportDto) {
    return this.fieldtech.saveReport(jobId, dto);
  }

  @Post('reports/:jobId/finalize')
  finalizeReport(@Param('jobId') jobId: string) {
    return this.fieldtech.finalizeReport(jobId);
  }
}

/** Unauthenticated: the app must be able to check for updates before/without a session. */
@Controller('v1/fieldtech')
export class FieldtechPublicController {
  constructor(private readonly fieldtech: FieldtechService) {}

  @Get('releases/latest')
  getLatestRelease() {
    return this.fieldtech.getLatestRelease();
  }
}
