import { query, insert } from '../packages/api/src/db/connection';
import { hashPassword } from '../packages/api/src/services/auth.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Database Seeder
 * Populates the database with realistic mock data for development/testing
 */

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clear existing data (development only)
    console.log('Clearing existing data...');
    await query('TRUNCATE TABLE customers, opportunities, projects, tasks, invoices, users CASCADE');

    // ========================================================================
    // USERS
    // ========================================================================
    console.log('Creating users...');
    const adminUser = await insert('users', {
      email: 'admin@wise2.net',
      name: 'Admin User',
      password_hash: hashPassword('password123'),
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
    });

    const demoUser = await insert('users', {
      email: 'demo@wise2.net',
      name: 'Demo User',
      password_hash: hashPassword('password123'),
      role: 'user',
      permissions: ['read', 'write'],
    });

    // ========================================================================
    // CUSTOMERS
    // ========================================================================
    console.log('Creating customers...');
    const customersData = [
      {
        name: 'Acme HVAC Inc',
        email: 'contact@acmehvac.com',
        industry: 'HVAC',
        employees: 12,
        annual_revenue: 450000,
        mrr: 5000,
        status: 'active',
        created_by: adminUser.id,
      },
      {
        name: 'The Golden Fork Restaurant',
        email: 'hello@goldenfork.com',
        industry: 'Food & Beverage',
        employees: 8,
        annual_revenue: 380000,
        mrr: 3500,
        status: 'active',
        created_by: adminUser.id,
      },
      {
        name: 'Sterling Law Group',
        email: 'info@sterlinglaw.com',
        industry: 'Legal',
        employees: 25,
        annual_revenue: 850000,
        mrr: 8000,
        status: 'active',
        created_by: adminUser.id,
      },
      {
        name: 'Downtown Medical',
        email: 'admin@downtownmed.com',
        industry: 'Healthcare',
        employees: 18,
        annual_revenue: 620000,
        mrr: 6500,
        status: 'active',
        created_by: adminUser.id,
      },
      {
        name: 'BuildRight Construction',
        email: 'sales@buildright.com',
        industry: 'Construction',
        employees: 35,
        annual_revenue: 1200000,
        mrr: 4200,
        status: 'active',
        created_by: adminUser.id,
      },
    ];

    const customers = [];
    for (const customerData of customersData) {
      const customer = await insert('customers', customerData);
      customers.push(customer);
    }

    // ========================================================================
    // OPPORTUNITIES
    // ========================================================================
    console.log('Creating sales opportunities...');
    const opportunities = [
      {
        customer_id: customers[0].id,
        title: 'Enterprise License Inquiry',
        stage: 'prospect',
        value: 50000,
        probability: 0.2,
        expected_close_date: '2026-08-15',
        owner_id: demoUser.id,
        ai_score: 0.45,
      },
      {
        customer_id: customers[1].id,
        title: 'Website Redesign RFQ',
        stage: 'prospect',
        value: 35000,
        probability: 0.3,
        expected_close_date: '2026-08-30',
        owner_id: demoUser.id,
        ai_score: 0.52,
      },
      {
        customer_id: customers[2].id,
        title: 'CRM System Demo',
        stage: 'qualified',
        value: 75000,
        probability: 0.5,
        expected_close_date: '2026-09-15',
        owner_id: demoUser.id,
        ai_score: 0.68,
      },
      {
        customer_id: customers[3].id,
        title: 'API Integration Project',
        stage: 'qualified',
        value: 45000,
        probability: 0.55,
        expected_close_date: '2026-09-10',
        owner_id: demoUser.id,
        ai_score: 0.71,
      },
      {
        customer_id: customers[2].id,
        title: 'Annual Support Contract',
        stage: 'proposal',
        value: 120000,
        probability: 0.75,
        expected_close_date: '2026-08-20',
        owner_id: demoUser.id,
        ai_score: 0.85,
      },
      {
        customer_id: customers[3].id,
        title: 'Custom Development',
        stage: 'proposal',
        value: 95000,
        probability: 0.7,
        expected_close_date: '2026-08-25',
        owner_id: demoUser.id,
        ai_score: 0.79,
      },
      {
        customer_id: customers[1].id,
        title: 'Volume Discount Request',
        stage: 'negotiation',
        value: 60000,
        probability: 0.85,
        expected_close_date: '2026-08-10',
        owner_id: demoUser.id,
        ai_score: 0.92,
      },
      {
        customer_id: customers[0].id,
        title: 'Dashboard Implementation',
        stage: 'closed-won',
        value: 85000,
        probability: 1.0,
        actual_close_date: '2026-07-15',
        owner_id: demoUser.id,
        ai_score: 1.0,
      },
      {
        customer_id: customers[4].id,
        title: 'Mobile App Development',
        stage: 'closed-won',
        value: 120000,
        probability: 1.0,
        actual_close_date: '2026-07-10',
        owner_id: demoUser.id,
        ai_score: 1.0,
      },
    ];

    for (const oppData of opportunities) {
      await insert('opportunities', oppData);
    }

    // ========================================================================
    // PROJECTS
    // ========================================================================
    console.log('Creating projects...');
    const projects = [
      {
        customer_id: customers[0].id,
        name: 'Website Redesign',
        description: 'Complete website redesign and modernization',
        status: 'active',
        start_date: '2026-06-01',
        end_date: '2026-08-15',
        budget: 50000,
        spent: 38000,
        progress_percent: 75,
        owner_id: demoUser.id,
      },
      {
        customer_id: customers[2].id,
        name: 'CRM Implementation',
        description: 'Full CRM system implementation and training',
        status: 'active',
        start_date: '2026-06-15',
        end_date: '2026-10-01',
        budget: 85000,
        spent: 38000,
        progress_percent: 45,
        owner_id: demoUser.id,
      },
      {
        customer_id: customers[1].id,
        name: 'Mobile App Development',
        description: 'Native iOS and Android app development',
        status: 'active',
        start_date: '2026-07-01',
        end_date: '2026-11-30',
        budget: 120000,
        spent: 36000,
        progress_percent: 30,
        owner_id: demoUser.id,
      },
    ];

    for (const projectData of projects) {
      await insert('projects', projectData);
    }

    // ========================================================================
    // INVOICES
    // ========================================================================
    console.log('Creating invoices...');
    const invoices = [
      {
        invoice_number: 'INV-2026-001',
        customer_id: customers[0].id,
        amount: 5000,
        tax: 500,
        total: 5500,
        status: 'paid',
        issued_date: '2026-07-01',
        due_date: '2026-08-01',
        paid_date: '2026-07-20',
        currency: 'USD',
      },
      {
        invoice_number: 'INV-2026-002',
        customer_id: customers[2].id,
        amount: 8000,
        tax: 800,
        total: 8800,
        status: 'paid',
        issued_date: '2026-07-05',
        due_date: '2026-08-05',
        paid_date: '2026-07-22',
        currency: 'USD',
      },
      {
        invoice_number: 'INV-2026-003',
        customer_id: customers[3].id,
        amount: 6500,
        tax: 650,
        total: 7150,
        status: 'sent',
        issued_date: '2026-07-10',
        due_date: '2026-08-10',
        currency: 'USD',
      },
      {
        invoice_number: 'INV-2026-004',
        customer_id: customers[4].id,
        amount: 4200,
        tax: 420,
        total: 4620,
        status: 'overdue',
        issued_date: '2026-06-15',
        due_date: '2026-07-15',
        currency: 'USD',
      },
      {
        invoice_number: 'INV-2026-005',
        customer_id: customers[1].id,
        amount: 3500,
        tax: 350,
        total: 3850,
        status: 'draft',
        issued_date: '2026-07-20',
        due_date: '2026-08-20',
        currency: 'USD',
      },
    ];

    for (const invoiceData of invoices) {
      await insert('invoices', invoiceData);
    }

    // ========================================================================
    // METRICS (seed initial data)
    // ========================================================================
    console.log('Creating initial metrics...');
    for (let i = 0; i < 10; i++) {
      await insert('metrics', {
        metric_type: 'revenue',
        metric_key: 'mrr',
        value: 27200 + i * 100,
        tags: JSON.stringify({ date: new Date(Date.now() - i * 86400000).toISOString() }),
      });
    }

    console.log('\n✅ Database seeding complete!\n');
    console.log('🔐 Demo User Credentials:');
    console.log('   Email: demo@wise2.net');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
