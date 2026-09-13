import { Body, Controller, Headers, HttpCode, HttpStatus, UnauthorizedException, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeadsService } from '../revenue-os/leads/leads.service';
import { FollowUpsService } from '../revenue-os/follow-ups/follow-ups.service';
import { EstimatesService } from '../revenue-os/estimates/estimates.service';

@Controller('assistant/tools')
export class AssistantWriteController {
  constructor(private config: ConfigService, private leads: LeadsService, private followUps: FollowUpsService, private estimates: EstimatesService) {}
  @Post('write')
  @HttpCode(HttpStatus.OK)
  async write(@Headers('x-wise2-tool-secret') secret: string | undefined, @Body() body: any) {
    if (secret !== this.config.get<string>('WISE2_ASSISTANT_TOOL_SECRET')) throw new UnauthorizedException();
    const tenantId = this.config.get<string>('WISE2_DEFAULT_TENANT_ID');
    if (!tenantId) throw new Error('No default tenant configured');
    if (body.operation === 'create_lead') return { success: true, data: await this.leads.create(tenantId, body.data) };
    if (body.operation === 'create_follow_up') return { success: true, data: await this.followUps.create(tenantId, { ...body.data, dueAt: new Date(body.data.dueAt) }) };
    if (body.operation === 'create_estimate') return { success: true, data: await this.estimates.create(tenantId, { ...body.data, followUpAt: body.data.followUpAt ? new Date(body.data.followUpAt) : undefined }) };
    return { success: false, error: 'unsupported operation' };
  }
}
