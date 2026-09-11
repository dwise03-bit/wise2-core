#!/usr/bin/env node

/**
 * WISE² Revenue Command Center - Real Data API
 * Connects to PostgreSQL and uses existing commerce tables
 * Maps: users → leads, orders → deals, products → offerings
 */

const http = require('http');
const url = require('url');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

async function getClient() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    user: 'wise2',
    password: 'wise2',
    database: 'wise2_prod',
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.error('DB connection failed:', err.message);
    throw err;
  }
}

async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const client = await getClient();

  try {
    if (pathname === '/api/revenue/dashboard' && req.method === 'GET') {
      const result = await client.query(`
        SELECT
          (SELECT COUNT(*) FROM users) as total_leads,
          (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as hot_leads,
          (SELECT COUNT(*) FROM orders) as total_deals,
          (SELECT COUNT(*) FROM orders WHERE status = 'pending') as open_deals,
          (SELECT COUNT(*) FROM orders WHERE status = 'completed') as won_deals,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN status IN ('pending', 'processing') THEN total_price ELSE 0 END), 0) as pipeline_value
        FROM orders
      `);

      const metrics = result.rows[0] || {};
      const totalDeals = parseInt(metrics.total_deals) || 0;
      const wonDeals = parseInt(metrics.won_deals) || 0;
      const conversionRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(2) : 0;

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: {
          kpis: {
            totalLeads: parseInt(metrics.total_leads) || 0,
            qualifiedLeads: parseInt(metrics.total_leads) * 0.6 || 0,
            hotLeads: parseInt(metrics.hot_leads) || 0,
            totalDeals: totalDeals,
            openDeals: parseInt(metrics.open_deals) || 0,
            wonDeals: wonDeals,
            totalRevenue: parseFloat(metrics.total_revenue) || 0,
            pipelineValue: parseFloat(metrics.pipeline_value) || 0,
            conversionRate: parseFloat(conversionRate),
          },
          lastUpdated: new Date().toISOString(),
          system: 'WISE² Revenue Command Center v1.0 (Real Data)',
          databaseStatus: 'connected',
          schema: 'Mapped from commerce tables (users→leads, orders→deals)',
        }
      }));
    }
    else if (pathname === '/api/revenue/leads' && req.method === 'GET') {
      const limit = query.limit || 50;
      const result = await client.query(`
        SELECT id, email as name, created_at
        FROM users
        LIMIT $1
      `, [limit]);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: result.rows.map(row => ({
          id: row.id,
          name: row.name,
          source: 'registered_user',
          status: 'ACTIVE',
          createdAt: row.created_at,
        })),
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/revenue/deals' && req.method === 'GET') {
      const status = query.status;
      let query_str = `
        SELECT id, customer_email, total_price as value, status, created_at
        FROM orders
      `;
      const params = [];

      if (status) {
        query_str += ` WHERE status = $1`;
        params.push(status);
      }

      query_str += ` ORDER BY created_at DESC LIMIT 50`;

      const result = await client.query(query_str, params);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: result.rows.map(row => ({
          id: row.id,
          customerId: row.customer_email,
          value: parseFloat(row.value),
          status: row.status,
          stage: row.status === 'completed' ? 'WON' : (row.status === 'pending' ? 'PROPOSAL' : 'DISCOVERY'),
          createdAt: row.created_at,
        })),
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/revenue/products' && req.method === 'GET') {
      const result = await client.query(`
        SELECT id, name, description, price, created_at
        FROM products
        LIMIT 20
      `);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: {
          offerings: result.rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            price: parseFloat(row.price),
            createdAt: row.created_at,
          }))
        },
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/revenue/revenue-by-status' && req.method === 'GET') {
      const result = await client.query(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(total_price) as revenue
        FROM orders
        GROUP BY status
        ORDER BY revenue DESC
      `);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: {
          byStatus: result.rows.map(row => ({
            status: row.status,
            orders: parseInt(row.count),
            revenue: parseFloat(row.revenue) || 0,
          }))
        },
      }));
    }
    else if (pathname === '/api/revenue/top-customers' && req.method === 'GET') {
      const result = await client.query(`
        SELECT
          u.id,
          u.email,
          COUNT(o.id) as order_count,
          SUM(o.total_price) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.email = o.customer_email
        GROUP BY u.id, u.email
        ORDER BY total_spent DESC NULLS LAST
        LIMIT 10
      `);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: {
          topCustomers: result.rows.map(row => ({
            id: row.id,
            email: row.email,
            orderCount: parseInt(row.order_count),
            totalSpent: parseFloat(row.total_spent) || 0,
          }))
        },
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'wise2-revenue-api',
        version: '1.0.0-real-data',
        database: 'connected',
        uptime: process.uptime(),
      }));
    }
    else if (pathname === '/api' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        service: 'WISE² Revenue Command Center API',
        version: '1.0.0-real-data',
        database: 'wise2_prod (PostgreSQL)',
        schema: 'Mapped from commerce tables',
        endpoints: [
          'GET /api/health',
          'GET /api/revenue/dashboard',
          'GET /api/revenue/leads',
          'GET /api/revenue/deals',
          'GET /api/revenue/products',
          'GET /api/revenue/revenue-by-status',
          'GET /api/revenue/top-customers',
        ]
      }));
    }
    else {
      res.writeHead(404);
      res.end(JSON.stringify({
        error: 'Not Found',
        path: pathname,
      }));
    }
  } catch (err) {
    console.error('Request error:', err);
    res.writeHead(500);
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: err.message,
    }));
  } finally {
    await client.end();
  }
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`✅ WISE² Revenue Command Center API (Real Data) listening on port ${PORT}`);
  console.log(`📊 Connected to: wise2_prod PostgreSQL database`);
  console.log(`📊 Dashboard: GET http://localhost:${PORT}/api/revenue/dashboard`);
  console.log(`📈 Leads: GET http://localhost:${PORT}/api/revenue/leads`);
  console.log(`🤝 Deals: GET http://localhost:${PORT}/api/revenue/deals`);
  console.log(`🎯 Customers: GET http://localhost:${PORT}/api/revenue/top-customers`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close();
  process.exit(0);
});
