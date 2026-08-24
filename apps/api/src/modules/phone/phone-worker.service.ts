/**
 * Phone Worker Service
 * Orchestrates all background agents (callbacks, campaigns, dispatch)
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CallbackAgent } from './workers/callback.agent';
import { CampaignAgent } from './workers/campaign.agent';
import { DispatchAgent } from './workers/dispatch.agent';

@Injectable()
export class PhoneWorkerService implements OnModuleInit {
  private readonly logger = new Logger(PhoneWorkerService.name);

  constructor(
    private callbackAgent: CallbackAgent,
    private campaignAgent: CampaignAgent,
    private dispatchAgent: DispatchAgent,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Phone Worker Service initialized');

    // All agents are automatically registered via @Cron decorators
    // This just logs that the service is ready

    const jobs = this.schedulerRegistry.getCronJobs();
    this.logger.log(`${jobs.size} scheduled jobs registered`);

    jobs.forEach((job) => {
      this.logger.log(`  - ${job.name}: ${job.lastDate()?.toISOString()}`);
    });
  }

  /**
   * Get worker status
   */
  async getStatus(): Promise<{
    status: string;
    agents: {
      name: string;
      nextRun: string;
      lastRun?: string;
    }[];
  }> {
    const jobs = this.schedulerRegistry.getCronJobs();
    const agents = Array.from(jobs.entries()).map(([name, job]) => ({
      name,
      nextRun: job.nextDate().toISOString(),
      lastRun: job.lastDate()?.toISOString(),
    }));

    return {
      status: 'healthy',
      agents,
    };
  }
}
