/**
 * Jobber integration types
 * Extends Express Request with Jobber config
 */

declare global {
  namespace Express {
    interface Request {
      jobber?: {
        accountId: string;
        accessToken: string;
      };
    }
  }
}

export interface JobberSyncLog {
  id: string;
  accountId: string;
  startedAt: Date;
  completedAt: Date;
  success: boolean;
  error?: string;
  counts: {
    customers: number;
    jobs: number;
    estimates: number;
    invoices: number;
    payments: number;
  };
  duration: number;
}

export interface JobberIntegrationConfig {
  accountId: string;
  accessToken: string;
  syncIntervalMinutes: number;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  enabled: boolean;
}

export interface JobberSyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncAt: Date;
  totalCustomersSync: number;
  totalJobsSync: number;
}
