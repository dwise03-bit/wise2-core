import { ToolDefinition, ToolResult } from './types';
import { CRMProvider, SchedulerProvider } from './types';
import { v4 as uuid } from 'uuid';

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();
  private executors = new Map<string, Function>();

  constructor(
    private crm: CRMProvider,
    private scheduler: SchedulerProvider
  ) {
    this.registerTools();
  }

  private registerTools(): void {
    // Tool: Identify Customer
    this.register('identify_customer', {
      name: 'identify_customer',
      description: 'Identify if caller is an existing customer by phone number',
      inputSchema: {
        type: 'object',
        properties: {
          phone: { type: 'string', description: 'Phone number' },
        },
        required: ['phone'],
      },
    });

    // Tool: Create Lead
    this.register('create_lead', {
      name: 'create_lead',
      description: 'Create a new sales lead from inbound call',
      inputSchema: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'Customer ID' },
          intent: { type: 'string', description: 'Service intent' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: ['customerId', 'intent'],
      },
      requiresConfirmation: false,
    });

    // Tool: Check Availability
    this.register('check_availability', {
      name: 'check_availability',
      description: 'Check available appointment slots',
      inputSchema: {
        type: 'object',
        properties: {
          serviceType: { type: 'string', description: 'Type of service' },
          date: { type: 'string', description: 'Date (ISO format)' },
        },
        required: ['serviceType', 'date'],
      },
    });

    // Tool: Create Booking
    this.register('create_booking', {
      name: 'create_booking',
      description: 'Create a confirmed appointment booking',
      inputSchema: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          serviceType: { type: 'string' },
          startTime: { type: 'string', description: 'ISO datetime' },
          endTime: { type: 'string', description: 'ISO datetime' },
          notes: { type: 'string' },
        },
        required: ['customerId', 'serviceType', 'startTime', 'endTime'],
      },
      requiresConfirmation: true,
    });

    // Tool: Request Transfer
    this.register('request_transfer', {
      name: 'request_transfer',
      description: 'Request transfer to human agent',
      inputSchema: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for transfer' },
        },
        required: ['reason'],
      },
      requiresConfirmation: false,
    });

    // Tool: Record Consent
    this.register('record_consent', {
      name: 'record_consent',
      description: 'Record customer consent for outbound communication',
      inputSchema: {
        type: 'object',
        properties: {
          phone: { type: 'string' },
          channel: { type: 'string', enum: ['voice', 'sms', 'email'] },
          purpose: { type: 'string' },
        },
        required: ['phone', 'channel', 'purpose'],
      },
      requiresConfirmation: false,
    });
  }

  private register(name: string, definition: ToolDefinition): void {
    this.tools.set(name, definition);
  }

  getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async executeTool(
    name: string,
    input: Record<string, unknown>
  ): Promise<ToolResult> {
    const auditId = uuid();

    try {
      let output: unknown;

      switch (name) {
        case 'identify_customer':
          output = await this.crm.lookupCustomer(input.phone as string);
          break;

        case 'create_lead':
          output = await this.crm.createLead({
            customerId: input.customerId as string,
            intent: input.intent as string,
            priority: (input.priority as any) || 'medium',
            source: 'inbound_call',
          });
          break;

        case 'check_availability':
          output = await this.scheduler.getAvailability(
            input.serviceType as string,
            new Date(input.date as string),
            90
          );
          break;

        case 'create_booking':
          output = await this.crm.createBooking({
            customerId: input.customerId as string,
            serviceType: input.serviceType as string,
            startAt: new Date(input.startTime as string),
            endAt: new Date(input.endTime as string),
          });
          break;

        case 'request_transfer':
          // Signal to orchestrator to transfer
          output = {
            status: 'transfer_requested',
            reason: input.reason,
          };
          break;

        case 'record_consent':
          output = await this.crm.recordConsent({
            phone: input.phone as string,
            channel: input.channel as any,
            purpose: input.purpose as string,
            status: 'granted',
          });
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        toolName: name,
        success: true,
        output,
        auditId,
      };
    } catch (error) {
      return {
        toolName: name,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        auditId,
      };
    }
  }
}
