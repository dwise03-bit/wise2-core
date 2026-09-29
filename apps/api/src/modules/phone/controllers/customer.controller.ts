/**
 * Customer & Lead Management API Controller
 * Endpoints for customer identification and lead creation
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@shared/services/prisma.service';
import { CallSessionService } from '../services/call-session.service';
import {
  IdentifyCustomerDto,
  IdentifyPropertyDto,
  CreateLeadDto,
  CustomerContextResponse,
  LeadResponse,
} from '../dto/customer.dto';

@Controller('api/v1/phone/customers')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name);

  constructor(
    private prisma: PrismaService,
    private callSession: CallSessionService,
  ) {}

  /**
   * Identify customer by caller number
   */
  @Post('identify-by-phone')
  @HttpCode(HttpStatus.OK)
  async identifyByPhone(
    @Body() dto: IdentifyCustomerDto
  ): Promise<{ customer?: CustomerContextResponse; isNew: boolean; callSid: string }> {
    try {
      const session = this.callSession.getSession(dto.callSid);
      if (!session) {
        throw new Error(`Session not found: ${dto.callSid}`);
      }

      // Search by phone number
      const phoneNumber = dto.callerNumber || session.metadata?.callerNumber;

      let customer = await this.prisma.customer.findFirst({
        where: { phone: phoneNumber },
        include: {
          hvacProperties: {
            include: { equipment: true },
          },
        },
      });

      if (customer) {
        // Link to session
        await this.callSession.identifyCustomer(dto.callSid, customer.id);

        return {
          customer: this.formatCustomerResponse(customer),
          isNew: false,
          callSid: dto.callSid,
        };
      }

      return { isNew: true, callSid: dto.callSid };
    } catch (error) {
      this.logger.error(`Customer identification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Identify customer by ID
   */
  @Post('identify')
  @HttpCode(HttpStatus.OK)
  async identifyCustomer(
    @Body() dto: IdentifyCustomerDto
  ): Promise<{ customer: CustomerContextResponse }> {
    try {
      if (!dto.customerId) {
        throw new Error('customerId required');
      }

      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
        include: {
          hvacProperties: {
            include: { equipment: true },
          },
        },
      });

      if (!customer) {
        throw new Error(`Customer not found: ${dto.customerId}`);
      }

      // Link to session
      await this.callSession.identifyCustomer(dto.callSid, customer.id);

      return {
        customer: this.formatCustomerResponse(customer),
      };
    } catch (error) {
      this.logger.error(`Customer fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Identify property for this call
   */
  @Post(':customerId/properties/:propertyId/select')
  @HttpCode(HttpStatus.OK)
  async identifyProperty(
    @Param('customerId') customerId: string,
    @Param('propertyId') propertyId: string,
    @Body() dto: IdentifyPropertyDto
  ): Promise<{ success: boolean; propertyId: string }> {
    try {
      // Verify property belongs to customer
      const property = await this.prisma.hVACProperty.findFirst({
        where: {
          id: propertyId,
          customerId,
        },
      });

      if (!property) {
        throw new Error(`Property not found for this customer`);
      }

      // Link to session
      await this.callSession.identifyProperty(dto.callSid, propertyId);

      return { success: true, propertyId };
    } catch (error) {
      this.logger.error(`Property identification failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get customer context (profile, properties, history)
   */
  @Get(':customerId/context')
  async getCustomerContext(
    @Param('customerId') customerId: string
  ): Promise<{ context: CustomerContextResponse }> {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          hvacProperties: {
            include: {
              equipment: true,
              workOrders: {
                where: { status: { in: ['CREATED', 'ASSIGNED', 'IN_PROGRESS'] } },
                take: 5,
              },
              appointments: {
                where: { scheduledAt: { gte: new Date() } },
                take: 5,
              },
            },
          },
          calls: {
            orderBy: { startedAt: 'desc' },
            take: 5,
          },
        },
      });

      if (!customer) {
        throw new Error(`Customer not found: ${customerId}`);
      }

      return { context: this.formatCustomerResponse(customer) };
    } catch (error) {
      this.logger.error(`Context fetch failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new lead from call
   */
  @Post('leads/create')
  @HttpCode(HttpStatus.CREATED)
  async createLead(@Body() dto: CreateLeadDto): Promise<LeadResponse> {
    try {
      this.logger.log(`Creating lead from call ${dto.callSid}: ${dto.contactName}`);

      // Check if customer exists
      let customer = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });

      // Create or update customer
      if (customer) {
        customer = await this.prisma.customer.update({
          where: { id: customer.id },
          data: {
            contactName: dto.contactName,
            phone: dto.phone || customer.phone,
          },
        });
      } else {
        customer = await this.prisma.customer.create({
          data: {
            email: dto.email,
            contactName: dto.contactName,
            phone: dto.phone || '',
            businessName: dto.contactName,
            status: 'ACTIVE',
          },
        });
      }

      // Create property if address provided
      let propertyId: string | undefined;
      if (dto.address && dto.city && dto.state) {
        const property = await this.prisma.hVACProperty.create({
          data: {
            customerId: customer.id,
            address: dto.address,
            city: dto.city,
            state: dto.state,
            zipCode: dto.zipCode || '',
            propertyType: 'residential',
          },
        });
        propertyId = property.id;
      }

      // Create work order if issue provided
      if (dto.issue) {
        const workOrder = await this.prisma.workOrder.create({
          data: {
            workOrderNumber: `WO-${Date.now()}`,
            customerId: customer.id,
            propertyId: propertyId || '',
            description: dto.issue,
            serviceType: this.inferServiceType(dto.issue),
            urgency: (dto.urgency as any) || 'ROUTINE',
            sourceType: 'PHONE',
            sourceCallId: dto.callSid,
          },
        });

        this.logger.log(`Work order created: ${workOrder.workOrderNumber}`);
      }

      // Link to session
      await this.callSession.identifyCustomer(dto.callSid, customer.id);

      return {
        id: customer.id,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone || undefined,
        address: dto.address,
        status: 'NEW',
        source: 'PHONE',
        callSid: dto.callSid,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Lead creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get recent leads
   */
  @Get('leads/recent')
  async getRecentLeads(): Promise<{ leads: LeadResponse[] }> {
    try {
      const customers = await this.prisma.customer.findMany({
        where: {
          calls: {
            some: {
              direction: 'INBOUND',
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      });

      const leads: LeadResponse[] = customers.map((c) => ({
        id: c.id,
        contactName: c.contactName,
        email: c.email,
        phone: c.phone || undefined,
        status: c.status,
        source: 'PHONE',
        callSid: 'N/A',
        createdAt: c.createdAt.toISOString(),
      }));

      return { leads };
    } catch (error) {
      this.logger.error(`Recent leads fetch failed: ${error.message}`);
      throw error;
    }
  }

  // Private helpers

  private formatCustomerResponse(customer: any): CustomerContextResponse {
    return {
      id: customer.id,
      contactName: customer.contactName,
      email: customer.email,
      phone: customer.phone || undefined,
      businessName: customer.businessName,
      properties: customer.hvacProperties?.map((p: any) => ({
        id: p.id,
        address: p.address,
        heatingType: p.heatingType || undefined,
        coolingType: p.coolingType || undefined,
        equipment: p.equipment?.map((e: any) => ({
          id: e.id,
          type: e.equipmentType,
          manufacturer: e.manufacturer,
          model: e.model,
        })),
      })),
      recentCalls: customer.calls?.map((c: any) => ({
        date: c.startedAt.toISOString(),
        duration: c.durationSeconds || 0,
        summary: c.summary || 'N/A',
      })),
      activeWorkOrders: customer.workOrders?.map((w: any) => ({
        id: w.id,
        status: w.status,
        address: 'N/A',
      })),
    };
  }

  private inferServiceType(issue: string): string {
    const lower = issue.toLowerCase();
    if (lower.includes('cool') || lower.includes('ac')) return 'cooling';
    if (lower.includes('heat')) return 'heating';
    if (lower.includes('electric') || lower.includes('power')) return 'electrical';
    if (lower.includes('maintain')) return 'maintenance';
    return 'other';
  }
}
