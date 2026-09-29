import { Injectable, Logger } from '@nestjs/common';
import {
  CallSessionManager,
  SchedulerMock,
  ToolRegistry,
  VoiceOrchestrator,
  createVoiceModel,
} from '@wise2/ai-phone';
import { PrismaService } from '../prisma/prisma.service';
import { TenantCrmAdapter } from './ai-phone-crm.adapter';
import { AiPhoneConfigDto } from './ai-phone.types';

@Injectable()
export class AiPhoneRuntimeService {
  private readonly logger = new Logger(AiPhoneRuntimeService.name);
  readonly sessions = new CallSessionManager();
  private readonly scheduler = new SchedulerMock();
  private readonly voiceModel = createVoiceModel();

  constructor(private readonly prisma: PrismaService) {
    this.logger.log(`AI Phone voice model: ${this.voiceModel.name}`);
  }

  orchestratorFor(tenantId: string, config: AiPhoneConfigDto): VoiceOrchestrator {
    const crm = new TenantCrmAdapter(this.prisma, tenantId);
    const tools = new ToolRegistry(crm, this.scheduler);
    return new VoiceOrchestrator(this.voiceModel, this.sessions, tools, {
      systemPrompt: this.buildPrompt(config),
    });
  }

  private buildPrompt(config: AiPhoneConfigDto): string {
    return `You are ${config.aiPersona}, the WISE² AI Phone receptionist.
Use this greeting on the first turn if the caller has not been greeted yet:
"${config.greeting}"

Your job on a live phone call:
1. Identify existing customers with identify_customer when you have a phone number
2. Understand why they called
3. Create a lead with create_lead when this is a new opportunity
4. Check availability and book when they want an appointment
5. Record consent before follow-up SMS or email
6. Transfer with request_transfer for emergencies, billing disputes, or when they ask for a person

Keep spoken replies under three sentences. Be calm, clear, and specific.`;
  }
}
