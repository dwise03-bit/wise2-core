import { BadRequestException, Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CjaysService } from './cjays.service';
import { CjaysTenant } from './cjays-tenant.decorator';
import { CjaysRequestTenant, CjaysTenantGuard } from './cjays-tenant.guard';
import { CjaysSyncInput } from './cjays.types';
import { CjaysAiService, CjaysAiTask } from './cjays-ai.service';
import { CjaysGoogleService } from './cjays-google.service';

@ApiTags('CJAYS Auto Recon')
@ApiBearerAuth()
@Controller('v1/cjays')
@UseGuards(JwtAuthGuard, CjaysTenantGuard)
export class CjaysController {
  constructor(private readonly cjays: CjaysService,private readonly ai:CjaysAiService,private readonly google:CjaysGoogleService) {}

  @Get('bootstrap')
  bootstrap(@CjaysTenant() tenant: CjaysRequestTenant) { return this.cjays.bootstrap(tenant.tenantId); }

  @Post('sync')
  sync(@CjaysTenant() tenant: CjaysRequestTenant, @Request() request: any, @Body() body: CjaysSyncInput) { return this.cjays.sync(tenant.tenantId, request.user.id, tenant.role, body); }

  @Post('ai/jobs/:jobId/assist')
  assist(@CjaysTenant() tenant:CjaysRequestTenant,@Param('jobId')jobId:string,@Body()body:{task:CjaysAiTask}){const allowed:CjaysAiTask[]=['summary','follow_up','checklist','quality_review'];if(!allowed.includes(body.task))throw new BadRequestException('Unsupported CJAYS AI task');return this.ai.assist(tenant.tenantId,jobId,body.task);}

  @Get('google/status')
  googleStatus(@Request()request:any){return this.google.status(request.user.id);}

  @Get('google/authorize')
  googleAuthorize(@Request()request:any,@CjaysTenant()tenant:CjaysRequestTenant){return this.google.authorize(request.user.id,tenant.tenantId);}

  @Post('google/calendar')
  googleCalendar(@Request()request:any,@Body()body:{approved:boolean;title:string;description?:string;startTime:string;endTime:string;timezone?:string}){return this.google.calendar(request.user.id,body);}

  @Post('google/drive')
  googleDrive(@Request()request:any,@Body()body:{approved:boolean;name:string;content:string}){return this.google.drive(request.user.id,body);}

  @Post('google/gmail')
  googleGmail(@Request()request:any,@Body()body:{approved:boolean;to:string;subject:string;body:string}){return this.google.gmail(request.user.id,body);}
}

@ApiTags('CJAYS Google Workspace')
@Controller('v1/cjays/google')
export class CjaysGoogleCallbackController {
  constructor(private readonly google:CjaysGoogleService){}
  @Get('callback')
  callback(@Query('code')code:string,@Query('state')state:string,@Query('error')error?:string){if(error)throw new BadRequestException(`Google authorization declined: ${error}`);if(!code||!state)throw new BadRequestException('Missing Google authorization response');return this.google.callback(code,state);}
}
