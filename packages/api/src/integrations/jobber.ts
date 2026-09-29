/**
 * Jobber API Client
 * Authenticated sync for customers, jobs, estimates, invoices, payments
 * Docs: https://api.staging.getjobber.com/graphql
 */

interface JobberConfig {
  apiUrl: string;
  accountId: string;
  accessToken: string;
}

interface JobberCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addresses: Array<{
    id: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
  }>;
}

interface JobberJob {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  assignedTo?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedRevenue?: number;
}

interface JobberEstimate {
  id: string;
  jobId?: string;
  customerId: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';
  total: number;
  validUntil?: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface JobberInvoice {
  id: string;
  customerId: string;
  jobId?: string;
  number: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  amountPaid: number;
  dueDate: string;
  issuedDate: string;
}

interface JobberPayment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
  paidAt: string;
}

export class JobberClient {
  private config: JobberConfig;
  private headers: Record<string, string>;

  constructor(config: JobberConfig) {
    this.config = config;
    this.headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.accessToken}`,
    };
  }

  private async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.config.apiUrl}/graphql`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      throw new Error(`Jobber API error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { errors?: any; data?: T };
    if (data.errors) {
      throw new Error(`Jobber GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    return data.data as T;
  }

  async listCustomers(limit = 100, after?: string): Promise<{
    edges: Array<{ node: JobberCustomer; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor?: string };
  }> {
    const query = `
      query ListCustomers($limit: Int!, $after: String) {
        customers(first: $limit, after: $after) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              addresses {
                id
                addressLine1
                addressLine2
                city
                province
                postalCode
                countryCode
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    return this.query(query, { limit, after });
  }

  async getCustomer(id: string): Promise<JobberCustomer> {
    const query = `
      query GetCustomer($id: ID!) {
        customer(id: $id) {
          id
          firstName
          lastName
          email
          phone
          addresses {
            id
            addressLine1
            addressLine2
            city
            province
            postalCode
            countryCode
          }
        }
      }
    `;
    const result = await this.query<{ customer: JobberCustomer }>(query, { id });
    return result.customer;
  }

  async listJobs(limit = 100, after?: string): Promise<{
    edges: Array<{ node: JobberJob; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor?: string };
  }> {
    const query = `
      query ListJobs($limit: Int!, $after: String) {
        jobs(first: $limit, after: $after) {
          edges {
            node {
              id
              customerId
              title
              description
              status
              startDate
              endDate
              assignedTo {
                id
                name
              }
              location {
                latitude
                longitude
                address
              }
              estimatedRevenue
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    return this.query(query, { limit, after });
  }

  async listEstimates(limit = 100, after?: string): Promise<{
    edges: Array<{ node: JobberEstimate; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor?: string };
  }> {
    const query = `
      query ListEstimates($limit: Int!, $after: String) {
        estimates(first: $limit, after: $after) {
          edges {
            node {
              id
              jobId
              customerId
              status
              total
              validUntil
              lineItems {
                id
                description
                quantity
                unitPrice
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    return this.query(query, { limit, after });
  }

  async listInvoices(limit = 100, after?: string): Promise<{
    edges: Array<{ node: JobberInvoice; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor?: string };
  }> {
    const query = `
      query ListInvoices($limit: Int!, $after: String) {
        invoices(first: $limit, after: $after) {
          edges {
            node {
              id
              customerId
              jobId
              number
              status
              total
              amountPaid
              dueDate
              issuedDate
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    return this.query(query, { limit, after });
  }

  async listPayments(limit = 100, after?: string): Promise<{
    edges: Array<{ node: JobberPayment; cursor: string }>;
    pageInfo: { hasNextPage: boolean; endCursor?: string };
  }> {
    const query = `
      query ListPayments($limit: Int!, $after: String) {
        payments(first: $limit, after: $after) {
          edges {
            node {
              id
              invoiceId
              customerId
              amount
              method
              paidAt
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    return this.query(query, { limit, after });
  }

  /**
   * Full sync: pull all data from Jobber and return in WISE² format
   */
  async fullSync(): Promise<{
    customers: JobberCustomer[];
    jobs: JobberJob[];
    estimates: JobberEstimate[];
    invoices: JobberInvoice[];
    payments: JobberPayment[];
    syncedAt: string;
  }> {
    const [customers, jobs, estimates, invoices, payments] = await Promise.all([
      this.paginateAll((after) => this.listCustomers(100, after)),
      this.paginateAll((after) => this.listJobs(100, after)),
      this.paginateAll((after) => this.listEstimates(100, after)),
      this.paginateAll((after) => this.listInvoices(100, after)),
      this.paginateAll((after) => this.listPayments(100, after)),
    ]);

    return {
      customers: customers.map((c) => c.node),
      jobs: jobs.map((j) => j.node),
      estimates: estimates.map((e) => e.node),
      invoices: invoices.map((i) => i.node),
      payments: payments.map((p) => p.node),
      syncedAt: new Date().toISOString(),
    };
  }

  private async paginateAll<T>(
    fetcher: (after?: string) => Promise<{
      edges: Array<{ node: T; cursor: string }>;
      pageInfo: { hasNextPage: boolean; endCursor?: string };
    }>,
  ): Promise<Array<{ node: T; cursor: string }>> {
    const all: Array<{ node: T; cursor: string }> = [];
    let after: string | undefined;

    while (true) {
      const page = await fetcher(after);
      all.push(...page.edges);
      if (!page.pageInfo.hasNextPage) break;
      after = page.pageInfo.endCursor;
    }

    return all;
  }
}

export type { JobberConfig, JobberCustomer, JobberJob, JobberEstimate, JobberInvoice, JobberPayment };
