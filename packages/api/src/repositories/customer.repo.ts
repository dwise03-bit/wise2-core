import { getMany, getOne, insert, update, query } from '../db/connection';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  industry?: string;
  website?: string;
  employees?: number;
  annual_revenue?: number;
  mrr: number;
  status: 'active' | 'inactive' | 'prospect';
  ai_profile?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

/**
 * Customer Repository
 * All customer-related database operations
 */

export async function findAllCustomers(limit = 100, offset = 0): Promise<Customer[]> {
  return getMany<Customer>(
    `
    SELECT * FROM customers
    WHERE status = 'active'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  return getOne<Customer>(
    `
    SELECT * FROM customers
    WHERE id = $1
    `,
    [id],
  );
}

export async function findCustomerByEmail(email: string): Promise<Customer | null> {
  return getOne<Customer>(
    `
    SELECT * FROM customers
    WHERE email = $1
    `,
    [email],
  );
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  return insert<Customer>('customers', {
    name: data.name,
    email: data.email,
    phone: data.phone,
    industry: data.industry,
    website: data.website,
    employees: data.employees,
    annual_revenue: data.annual_revenue,
    mrr: data.mrr || 0,
    status: data.status || 'prospect',
    ai_profile: data.ai_profile,
    notes: data.notes,
    tags: JSON.stringify(data.tags || []),
    metadata: JSON.stringify(data.metadata || {}),
    created_by: data.created_by,
  });
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  const updateData: Record<string, any> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.mrr !== undefined) updateData.mrr = data.mrr;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.ai_profile !== undefined) updateData.ai_profile = data.ai_profile;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);

  return update<Customer>('customers', updateData, id);
}

export async function getCustomerStats(): Promise<{
  total: number;
  active: number;
  total_mrr: number;
  average_mrr: number;
}> {
  const result = await getOne<any>(
    `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
      SUM(mrr) as total_mrr,
      AVG(mrr) as average_mrr
    FROM customers
    `,
  );

  return {
    total: parseInt(result?.total || '0'),
    active: parseInt(result?.active || '0'),
    total_mrr: parseFloat(result?.total_mrr || '0'),
    average_mrr: parseFloat(result?.average_mrr || '0'),
  };
}

export async function searchCustomers(searchTerm: string): Promise<Customer[]> {
  return getMany<Customer>(
    `
    SELECT * FROM customers
    WHERE
      name ILIKE $1 OR
      email ILIKE $1 OR
      industry ILIKE $1
    ORDER BY created_at DESC
    LIMIT 20
    `,
    [`%${searchTerm}%`],
  );
}

export async function getCustomerTimeline(customerId: string): Promise<any[]> {
  return getMany(
    `
    SELECT
      'opportunity' as type,
      title as description,
      created_at,
      value
    FROM opportunities
    WHERE customer_id = $1

    UNION ALL

    SELECT
      'invoice' as type,
      CONCAT('Invoice #', invoice_number) as description,
      issued_date as created_at,
      total as value
    FROM invoices
    WHERE customer_id = $1

    UNION ALL

    SELECT
      'project' as type,
      name as description,
      created_at,
      budget as value
    FROM projects
    WHERE customer_id = $1

    ORDER BY created_at DESC
    LIMIT 50
    `,
    [customerId],
  );
}
