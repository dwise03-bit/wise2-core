/**
 * Work Order Dispatch Agent
 * Background worker for creating and assigning work orders from phone calls
 * Coordinates with Field Tech to notify technicians
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@shared/services/prisma.service';

@Injectable()
export class DispatchAgent {
  private readonly logger = new Logger(DispatchAgent.name);
  private isRunning = false;

  constructor(private prisma: PrismaService) {}

  /**
   * Check for unassigned work orders every 2 minutes
   */
  @Cron(CronExpression.EVERY_2_MINUTES)
  async assignPendingWorkOrders(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      // Get unassigned work orders
      const unassignedOrders = await this.prisma.workOrder.findMany({
        where: {
          status: 'CREATED',
          technicianId: null,
        },
        include: {
          customer: true,
          property: true,
        },
        take: 10,
      });

      if (unassignedOrders.length === 0) {
        return;
      }

      this.logger.log(`Assigning ${unassignedOrders.length} unassigned work orders`);

      for (const order of unassignedOrders) {
        try {
          await this.assignWorkOrder(order);
        } catch (error) {
          this.logger.error(
            `Work order assignment failed: ${order.id} - ${error.message}`
          );
        }
      }
    } catch (error) {
      this.logger.error(`Dispatch agent error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Assign work order to best-fit technician
   */
  private async assignWorkOrder(order: any): Promise<void> {
    this.logger.log(
      `Assigning work order ${order.workOrderNumber} in ${order.property.zipCode}`
    );

    // Find available technician
    const technician = await this.findBestTechnician(order);

    if (!technician) {
      this.logger.warn(`No available technician for ${order.workOrderNumber}`);
      return;
    }

    // Assign to technician
    await this.prisma.workOrder.update({
      where: { id: order.id },
      data: {
        technicianId: technician.id,
        status: 'ASSIGNED',
      },
    });

    // TODO: Send notification to Field Tech app
    // TODO: Send SMS/call to technician with work order details

    this.logger.log(
      `Work order assigned: ${order.workOrderNumber} → ${technician.firstName} ${technician.lastName}`
    );
  }

  /**
   * Find best-fit technician for work order
   * Prioritizes: matching specialization, availability, proximity
   */
  private async findBestTechnician(order: any): Promise<any> {
    // Get technicians with matching specialization
    const specializations: Record<string, string[]> = {
      cooling: ['cooling', 'ac'],
      heating: ['heating', 'furnace'],
      electrical: ['electrical', 'controls'],
      maintenance: [], // Any technician can do maintenance
    };

    const requiredSpecs = specializations[order.serviceType] || [];

    // Find active technicians
    let technicians = await this.prisma.technician.findMany({
      where: { isActive: true },
      include: {
        workOrders: {
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        },
      },
    });

    // Filter by specialization if needed
    if (requiredSpecs.length > 0) {
      technicians = technicians.filter((t) =>
        t.specialization.some((s: string) =>
          requiredSpecs.includes(s.toLowerCase())
        )
      );
    }

    // Sort by workload (prefer technician with fewer active jobs)
    technicians.sort((a, b) => a.workOrders.length - b.workOrders.length);

    return technicians[0] || null;
  }

  /**
   * Check for completed work orders
   * Triggers follow-up and customer notification
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processCompletedWorkOrders(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      // Get recently completed work orders
      const completedOrders = await this.prisma.workOrder.findMany({
        where: {
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000), // Last 10 minutes
          },
        },
        include: {
          customer: true,
        },
      });

      if (completedOrders.length === 0) {
        return;
      }

      this.logger.log(
        `Processing ${completedOrders.length} completed work orders`
      );

      for (const order of completedOrders) {
        try {
          // TODO: Create customer follow-up task
          // TODO: Schedule post-service survey
          // TODO: Trigger maintenance reminder if applicable

          this.logger.log(`Completed work order processed: ${order.workOrderNumber}`);
        } catch (error) {
          this.logger.error(
            `Follow-up processing failed: ${order.id} - ${error.message}`
          );
        }
      }
    } catch (error) {
      this.logger.error(`Work order processor error: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
