import { Injectable, Logger } from '@nestjs/common';
import { GoogleMapsService } from '../maps/google-maps.service';

interface ToolRequest {
  name: string;
  args: Record<string, any>;
  tenantId: string;
  userId?: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Unified Tools Service
 * Provides all available tools for AI agents to use:
 * - Maps (routing, geocoding, ETA)
 * - CRM (leads, customers, deals)
 * - Phone (call tracking, contact)
 * - Calendar (scheduling, booking)
 * - Hermes (knowledge, recommendations)
 */
@Injectable()
export class ToolsService {
  private readonly logger = new Logger('ToolsService');

  constructor(private mapsService: GoogleMapsService) {}

  /**
   * Get list of available tools for the AI
   */
  getAvailableTools(): Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }> {
    return [
      // Maps Tools
      {
        name: 'get_directions',
        description: 'Get turn-by-turn directions between two locations',
        parameters: {
          origin: { type: 'string', description: 'Address or "lat,lng"' },
          destination: { type: 'string', description: 'Address or "lat,lng"' },
          mode: { type: 'string', enum: ['driving', 'walking', 'bicycling', 'transit'] },
        },
      },
      {
        name: 'calculate_distance',
        description: 'Calculate distance and time between locations',
        parameters: {
          from: { type: 'string' },
          to: { type: 'string' },
        },
      },
      {
        name: 'geocode_address',
        description: 'Convert address to latitude/longitude',
        parameters: {
          address: { type: 'string' },
        },
      },
      {
        name: 'find_nearby_places',
        description: 'Find nearby places of a certain type (hospital, gas_station, etc.)',
        parameters: {
          location: { type: 'string' },
          type: { type: 'string' },
          radius: { type: 'number', description: 'Search radius in meters (default 5000)' },
        },
      },
      {
        name: 'optimize_route',
        description: 'Optimize route for multiple stops (TSP)',
        parameters: {
          origin: { type: 'string' },
          stops: { type: 'array', items: { type: 'string' } },
          return_to_origin: { type: 'boolean' },
        },
      },

      // CRM Tools
      {
        name: 'identify_customer',
        description: 'Look up customer by phone number',
        parameters: {
          phone: { type: 'string', description: 'E.164 format' },
        },
      },
      {
        name: 'create_lead',
        description: 'Create a new lead from inbound call',
        parameters: {
          phone: { type: 'string' },
          service_type: { type: 'string' },
          urgency: { type: 'string', enum: ['FLEXIBLE', 'MODERATE', 'URGENT', 'EMERGENCY'] },
          summary: { type: 'string' },
        },
      },
      {
        name: 'update_lead_status',
        description: 'Update lead status or add notes',
        parameters: {
          lead_id: { type: 'string' },
          status: { type: 'string' },
          notes: { type: 'string' },
        },
      },
      {
        name: 'create_deal',
        description: 'Create deal from lead',
        parameters: {
          lead_id: { type: 'string' },
          value: { type: 'number' },
          service_type: { type: 'string' },
        },
      },

      // Calendar/Scheduling Tools
      {
        name: 'check_availability',
        description: 'Check technician or service availability',
        parameters: {
          service_type: { type: 'string' },
          date: { type: 'string', description: 'YYYY-MM-DD' },
        },
      },
      {
        name: 'create_appointment',
        description: 'Schedule appointment or job',
        parameters: {
          customer_id: { type: 'string' },
          service_type: { type: 'string' },
          date_time: { type: 'string' },
          duration_minutes: { type: 'number' },
        },
      },
      {
        name: 'dispatch_technician',
        description: 'Dispatch technician to location',
        parameters: {
          job_id: { type: 'string' },
          technician_id: { type: 'string' },
          location: { type: 'string' },
        },
      },

      // Phone Tools
      {
        name: 'transfer_call',
        description: 'Transfer to another agent or department',
        parameters: {
          call_id: { type: 'string' },
          destination: { type: 'string', description: 'Phone number or agent name' },
        },
      },
      {
        name: 'record_call_note',
        description: 'Add note to call record',
        parameters: {
          call_id: { type: 'string' },
          note: { type: 'string' },
        },
      },
    ];
  }

  /**
   * Execute a tool request
   */
  async executeTool(request: ToolRequest): Promise<ToolResult> {
    try {
      const { name, args, tenantId } = request;

      this.logger.log(`Executing tool: ${name}`, { tenantId });

      switch (name) {
        // Maps Tools
        case 'get_directions':
          return {
            success: true,
            data: await this.mapsService.getDirections(args.origin, args.destination, {
              mode: args.mode || 'driving',
            }),
          };

        case 'calculate_distance':
          return {
            success: true,
            data: await this.mapsService.calculateETA(args.from, args.to),
          };

        case 'geocode_address':
          return {
            success: true,
            data: await this.mapsService.geocodeAddress(args.address),
          };

        case 'find_nearby_places':
          return {
            success: true,
            data: await this.mapsService.findNearbyPlaces(args.location, args.type, args.radius || 5000),
          };

        case 'optimize_route':
          return {
            success: true,
            data: await this.mapsService.optimizeRoute(args.origin, args.stops, args.return_to_origin !== false),
          };

        // CRM Tools
        case 'identify_customer':
          return await this.identifyCustomer(args.phone, tenantId);

        case 'create_lead':
          return await this.createLead(
            {
              phone: args.phone,
              service_type: args.service_type,
              urgency: args.urgency,
              summary: args.summary,
            },
            tenantId
          );

        case 'update_lead_status':
          return await this.updateLeadStatus(
            {
              lead_id: args.lead_id,
              status: args.status,
              notes: args.notes,
            },
            tenantId
          );

        case 'create_deal':
          return await this.createDeal(
            {
              lead_id: args.lead_id,
              value: args.value,
              service_type: args.service_type,
            },
            tenantId
          );

        // Calendar Tools
        case 'check_availability':
          return await this.checkAvailability(
            {
              service_type: args.service_type,
              date: args.date,
            },
            tenantId
          );

        case 'create_appointment':
          return await this.createAppointment(
            {
              customer_id: args.customer_id,
              service_type: args.service_type,
              date_time: args.date_time,
              duration_minutes: args.duration_minutes,
            },
            tenantId
          );

        case 'dispatch_technician':
          return await this.dispatchTechnician(
            {
              job_id: args.job_id,
              technician_id: args.technician_id,
              location: args.location,
            },
            tenantId
          );

        // Phone Tools
        case 'transfer_call':
          return await this.transferCall(
            {
              call_id: args.call_id,
              destination: args.destination,
            },
            tenantId
          );

        case 'record_call_note':
          return await this.recordCallNote(
            {
              call_id: args.call_id,
              note: args.note,
            },
            tenantId
          );

        default:
          return {
            success: false,
            error: `Unknown tool: ${name}`,
          };
      }
    } catch (error) {
      this.logger.error(`Tool execution failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // CRM Operations (stubs - integrate with actual services)
  private async identifyCustomer(phone: string, tenantId: string): Promise<ToolResult> {
    // TODO: Query RevenueCustomer by phone in tenant context
    return {
      success: true,
      data: {
        id: 'cust_123',
        name: 'John Smith',
        phone,
        last_service: '2024-01-15',
      },
    };
  }

  private async createLead(
    data: { phone: string; service_type: string; urgency: string; summary: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Create Lead in Prisma
    return {
      success: true,
      data: {
        id: 'lead_123',
        source: 'inbound_call',
        ...data,
      },
    };
  }

  private async updateLeadStatus(
    data: { lead_id: string; status: string; notes: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Update Lead status in Prisma
    return {
      success: true,
      data: { updated: true },
    };
  }

  private async createDeal(
    data: { lead_id: string; value: number; service_type: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Create Deal in Prisma with tenantId
    return {
      success: true,
      data: {
        id: 'deal_123',
        ...data,
        stage: 'DISCOVERY',
      },
    };
  }

  private async checkAvailability(
    data: { service_type: string; date: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Check ServiceJob availability
    return {
      success: true,
      data: {
        available_slots: ['09:00', '10:00', '13:00', '14:00'],
      },
    };
  }

  private async createAppointment(
    data: { customer_id: string; service_type: string; date_time: string; duration_minutes: number },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Create ServiceJob in Prisma
    return {
      success: true,
      data: {
        id: 'job_123',
        scheduled_start: data.date_time,
        status: 'SCHEDULED',
      },
    };
  }

  private async dispatchTechnician(
    data: { job_id: string; technician_id: string; location: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Update ServiceJob and create dispatch event
    return {
      success: true,
      data: {
        dispatch_confirmed: true,
        eta_minutes: 12,
      },
    };
  }

  private async transferCall(
    data: { call_id: string; destination: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Call Telnyx transferCall API
    return {
      success: true,
      data: {
        transferred: true,
        call_id: data.call_id,
      },
    };
  }

  private async recordCallNote(
    data: { call_id: string; note: string },
    tenantId: string
  ): Promise<ToolResult> {
    // TODO: Update Call record with note
    return {
      success: true,
      data: {
        note_recorded: true,
      },
    };
  }
}
