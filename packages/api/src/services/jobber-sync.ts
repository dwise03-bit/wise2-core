/**
 * Jobber Sync Service
 * Runs periodically to pull fresh data from Jobber and sync to local DB
 */

import { JobberClient, type JobberPayment, type JobberInvoice, type JobberEstimate, type JobberJob, type JobberCustomer } from '../integrations/jobber';

interface SyncResult {
  success: boolean;
  syncedAt: string;
  counts: {
    customers: number;
    jobs: number;
    estimates: number;
    invoices: number;
    payments: number;
  };
  duration: number;
  error?: string;
}

/**
 * Map Jobber customer to WISE² customer
 */
function mapJobberCustomer(jb: JobberCustomer) {
  return {
    id: jb.id,
    name: `${jb.firstName} ${jb.lastName}`.trim(),
    email: jb.email,
    phone: jb.phone,
    addresses: jb.addresses,
    // Additional fields can be added as needed
  };
}

/**
 * Map Jobber job to WISE² job
 */
function mapJobberJob(jb: JobberJob) {
  return {
    id: jb.id,
    customerId: jb.customerId,
    title: jb.title,
    description: jb.description || '',
    status: jb.status,
    startDate: new Date(jb.startDate),
    endDate: jb.endDate ? new Date(jb.endDate) : null,
    assignedTo: jb.assignedTo || [],
    location: jb.location,
    estimatedRevenue: jb.estimatedRevenue || 0,
  };
}

/**
 * Map Jobber estimate to WISE² estimate
 */
function mapJobberEstimate(jb: JobberEstimate) {
  return {
    id: jb.id,
    jobId: jb.jobId,
    customerId: jb.customerId,
    status: jb.status,
    total: jb.total,
    validUntil: jb.validUntil ? new Date(jb.validUntil) : null,
    lineItems: jb.lineItems,
  };
}

/**
 * Map Jobber invoice to WISE² invoice
 */
function mapJobberInvoice(jb: JobberInvoice) {
  return {
    id: jb.id,
    customerId: jb.customerId,
    jobId: jb.jobId,
    number: jb.number,
    status: jb.status,
    total: jb.total,
    amountPaid: jb.amountPaid,
    amountDue: jb.total - jb.amountPaid,
    dueDate: new Date(jb.dueDate),
    issuedDate: new Date(jb.issuedDate),
  };
}

/**
 * Map Jobber payment to WISE² payment
 */
function mapJobberPayment(jb: JobberPayment) {
  return {
    id: jb.id,
    invoiceId: jb.invoiceId,
    customerId: jb.customerId,
    amount: jb.amount,
    method: jb.method,
    paidAt: new Date(jb.paidAt),
  };
}

export class JobberSyncService {
  private client: JobberClient;
  private accountId: string;

  constructor(accountId: string, accessToken: string) {
    this.accountId = accountId;
    this.client = new JobberClient({
      apiUrl: 'https://api.getjobber.com',
      accountId,
      accessToken,
    });
  }

  /**
   * Full sync: fetch all Jobber data and sync to DB
   * In production, this would call your database sync methods
   */
  async sync(db: any): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      const data = await this.client.fullSync();

      // Map to WISE² schema
      const mapped = {
        customers: data.customers.map(mapJobberCustomer),
        jobs: data.jobs.map(mapJobberJob),
        estimates: data.estimates.map(mapJobberEstimate),
        invoices: data.invoices.map(mapJobberInvoice),
        payments: data.payments.map(mapJobberPayment),
      };

      // Sync to database (pseudo-code — implement with your DB)
      // await Promise.all([
      //   db.customer.sync(mapped.customers),
      //   db.job.sync(mapped.jobs),
      //   db.estimate.sync(mapped.estimates),
      //   db.invoice.sync(mapped.invoices),
      //   db.payment.sync(mapped.payments),
      // ]);

      const duration = Date.now() - startTime;

      return {
        success: true,
        syncedAt: new Date().toISOString(),
        counts: {
          customers: mapped.customers.length,
          jobs: mapped.jobs.length,
          estimates: mapped.estimates.length,
          invoices: mapped.invoices.length,
          payments: mapped.payments.length,
        },
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        syncedAt: new Date().toISOString(),
        counts: { customers: 0, jobs: 0, estimates: 0, invoices: 0, payments: 0 },
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Incremental sync: fetch only recent changes (last N hours)
   */
  async incrementalSync(db: any, hoursBack = 24): Promise<SyncResult> {
    // Jobber GraphQL supports filtering by updatedAt
    // This is a placeholder for future incremental sync logic
    return this.sync(db);
  }
}

/**
 * Background job: run sync every 15 minutes
 * Integrate with your job queue (Bull, Agenda, etc.)
 */
export async function setupJobberSyncWorker(
  accountId: string,
  accessToken: string,
  db: any,
  intervalMinutes = 15,
) {
  const service = new JobberSyncService(accountId, accessToken);

  const run = async () => {
    console.log(`[Jobber] Syncing data for account ${accountId}...`);
    const result = await service.sync(db);
    console.log(
      `[Jobber] Sync ${result.success ? 'succeeded' : 'failed'} in ${result.duration}ms`,
      result.counts,
    );
    if (result.error) console.error(`[Jobber] Error: ${result.error}`);
  };

  // Initial sync
  await run();

  // Schedule recurring sync
  setInterval(run, intervalMinutes * 60 * 1000);

  console.log(`[Jobber] Sync worker running every ${intervalMinutes} minutes`);
}

export type { SyncResult };
