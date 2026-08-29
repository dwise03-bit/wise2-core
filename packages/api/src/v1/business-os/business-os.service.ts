import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ALLOWED_COMMAND_INTENTS,
  BLOCKED_COMMAND_CAPABILITIES,
  AllowedCommandIntent,
  BusinessDashboardDto,
  BusinessOperationDto,
  CommandResultDto,
} from './business-os.types';

@Injectable()
export class BusinessOsService {
  getDashboard(): BusinessDashboardDto {
    return {
      revenueToday: 0,
      revenueMonth: 0,
      hotLeadCount: 0,
      activeJobCount: 0,
      unpaidInvoiceCount: 0,
      criticalAlertCount: 0,
    };
  }

  submitCommand(text: string): BusinessOperationDto<CommandResultDto> {
    const normalized = text.trim().toLowerCase();
    if (!normalized) {
      throw new BadRequestException('Command text is required');
    }

    for (const blocked of BLOCKED_COMMAND_CAPABILITIES) {
      if (normalized.includes(blocked)) {
        throw new BadRequestException(`Blocked capability: ${blocked}`);
      }
    }

    const intent = this.resolveIntent(normalized);
    if (!intent) {
      throw new BadRequestException('Unknown or unsupported command');
    }

    return {
      operationId: `business-os-${Date.now()}`,
      status: 'completed',
      message: 'Command accepted',
      auditEventId: null,
      result: this.buildResult(intent),
    };
  }

  private resolveIntent(text: string): AllowedCommandIntent | null {
    if (text.includes('hot lead') || text === 'show_hot_leads') {
      return 'show_hot_leads';
    }
    if (
      text.includes('business summary') ||
      text.includes('summary') ||
      text === 'show_business_summary'
    ) {
      return 'show_business_summary';
    }
    if (text.includes('health') || text === 'health_check') {
      return 'health_check';
    }

    return ALLOWED_COMMAND_INTENTS.find((intent) => text.includes(intent)) ?? null;
  }

  private buildResult(intent: AllowedCommandIntent): CommandResultDto {
    switch (intent) {
      case 'show_hot_leads':
        return {
          summary: 'Hot leads view is ready. Connect CRM providers for live counts.',
          module: 'crm',
        };
      case 'show_business_summary':
        return {
          summary: 'Business summary is ready with authoritative dashboard metrics.',
          module: 'command',
        };
      case 'health_check':
        return {
          summary: 'Platform health check requested. Use Cloud for named infrastructure actions.',
          module: 'cloud',
        };
      default:
        return { summary: 'Command completed.' };
    }
  }
}
