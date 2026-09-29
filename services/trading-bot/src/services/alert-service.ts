import { PrismaClient } from '@prisma/client';
import { PriceDataService } from './price-data-service';

export interface AlertConfig {
  symbol: string;
  priceLevel: number;
  alertType: 'ABOVE' | 'BELOW';
  description?: string;
}

/**
 * AlertService: Manage trading alerts (price-level based)
 */
export class AlertService {
  private prisma: PrismaClient;
  private priceDataService: PriceDataService;

  constructor(prisma: PrismaClient, priceDataService: PriceDataService) {
    this.prisma = prisma;
    this.priceDataService = priceDataService;
  }

  /**
   * Create a price alert for an account
   */
  async createAlert(
    accountId: string,
    symbol: string,
    priceLevel: number,
    alertType: 'ABOVE' | 'BELOW',
    description?: string
  ) {
    try {
      const alert = await this.prisma.alert.create({
        data: {
          accountId,
          symbol,
          priceLevel,
          alertType,
          description: description || `Alert when ${symbol} goes ${alertType.toLowerCase()} $${priceLevel}`,
          status: 'ACTIVE',
        },
      });

      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  /**
   * Create multiple alerts at Fibonacci levels (for autotrack)
   */
  async createFibonacciAlerts(
    accountId: string,
    symbol: string,
    currentPrice: number,
    supportLevel: number,
    resistanceLevel: number
  ) {
    const fibs = [0.236, 0.382, 0.5, 0.618, 0.786];
    const range = resistanceLevel - supportLevel;
    const alerts = [];

    for (const fib of fibs) {
      const price = supportLevel + range * fib;
      try {
        const alert = await this.createAlert(
          accountId,
          symbol,
          price,
          price > currentPrice ? 'ABOVE' : 'BELOW',
          `Fib ${(fib * 100).toFixed(1)}% level`
        );
        alerts.push(alert);
      } catch (error) {
        console.error(`Error creating Fib alert at ${fib}:`, error);
      }
    }

    return alerts;
  }

  /**
   * Get active alerts for an account
   */
  async getActiveAlerts(accountId: string) {
    return this.prisma.alert.findMany({
      where: {
        accountId,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get triggered alerts
   */
  async getTriggeredAlerts(accountId: string, limit: number = 10) {
    return this.prisma.alert.findMany({
      where: {
        accountId,
        status: 'TRIGGERED',
      },
      orderBy: { triggeredAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: { status: 'DISMISSED' },
    });
  }

  /**
   * Check all alerts and return those that triggered
   */
  async checkAllAlerts(): Promise<any[]> {
    const activeAlerts = await this.prisma.alert.findMany({
      where: { status: 'ACTIVE' },
    });

    const triggered = [];

    for (const alert of activeAlerts) {
      try {
        const price = await this.priceDataService.getCurrentPrice(alert.symbol);

        let didTrigger = false;
        if (alert.alertType === 'ABOVE' && price >= alert.priceLevel) {
          didTrigger = true;
        } else if (alert.alertType === 'BELOW' && price <= alert.priceLevel) {
          didTrigger = true;
        }

        if (didTrigger) {
          await this.prisma.alert.update({
            where: { id: alert.id },
            data: { status: 'TRIGGERED', triggeredAt: new Date() },
          });

          triggered.push({
            ...alert,
            currentPrice: price,
            triggeredAt: new Date(),
          });
        }
      } catch (error) {
        console.error(`Error checking alert ${alert.id}:`, error);
      }
    }

    return triggered;
  }

  /**
   * Get alert statistics for an account
   */
  async getAlertStats(accountId: string) {
    const active = await this.prisma.alert.count({
      where: { accountId, status: 'ACTIVE' },
    });

    const triggered = await this.prisma.alert.count({
      where: { accountId, status: 'TRIGGERED' },
    });

    const dismissed = await this.prisma.alert.count({
      where: { accountId, status: 'DISMISSED' },
    });

    return { active, triggered, dismissed };
  }
}
