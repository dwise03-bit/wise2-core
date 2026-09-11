#!/usr/bin/env node

/**
 * WISE² Revenue Command Center - Production API
 * Connects to PostgreSQL via direct connection pool
 */

const http = require('http');
const url = require('url');
const { Client } = require('pg');

const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const clients = [];
const maxClients = 5;

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

// Routes handler
async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // CORS headers
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
      // Get comprehensive dashboard metrics
      const result = await client.query(`
        SELECT
          COUNT(DISTINCT l.id) as total_leads,
          COUNT(DISTINCT CASE WHEN l.status IN ('QUALIFIED', 'HOT') THEN l.id END) as qualified_leads,
          COUNT(DISTINCT CASE WHEN l.status = 'HOT' THEN l.id END) as hot_leads,
          COUNT(DISTINCT d.id) as total_deals,
          COUNT(DISTINCT CASE WHEN d.status = 'OPEN' THEN d.id END) as open_deals,
          COUNT(DISTINCT CASE WHEN d.stage = 'WON' THEN d.id END) as won_deals,
          COALESCE(SUM(CASE WHEN d.stage = 'WON' THEN d.value ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN d.status = 'OPEN' THEN d.value ELSE 0 END), 0) as pipeline_value
        FROM "Lead" l
        LEFT JOIN "Deal" d ON l.id = d.id
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
            qualifiedLeads: parseInt(metrics.qualified_leads) || 0,
            hotLeads: parseInt(metrics.hot_leads) || 0,
            totalDeals: totalDeals,
            openDeals: parseInt(metrics.open_deals) || 0,
            wonDeals: wonDeals,
            totalRevenue: parseInt(metrics.total_revenue) || 0,
            pipelineValue: parseInt(metrics.pipeline_value) || 0,
            conversionRate: parseFloat(conversionRate),
          },
          lastUpdated: new Date().toISOString(),
          system: 'WISE² Revenue Command Center v1.0 (Production)',
          databaseStatus: 'connected',
        }
      }));
    }
    else if (pathname === '/api/revenue/leads' && req.method === 'GET') {
      const limit = query.limit || 50;
      const result = await client.query(`
        SELECT id, source, status, urgency, summary, "createdAt" as created_at
        FROM "Lead"
        LIMIT $1
      `, [limit]);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: result.rows,
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/revenue/deals' && req.method === 'GET') {
      const stage = query.stage;
      let query_str = `
        SELECT id, value, stage, status, source, "createdAt" as created_at
        FROM "Deal"
      `;
      const params = [];

      if (stage) {
        query_str += ` WHERE stage = $1`;
        params.push(stage);
      }

      query_str += ` LIMIT 50`;

      const result = await client.query(query_str, params);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: result.rows,
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/revenue/attribution/source' && req.method === 'GET') {
      const result = await client.query(`
        SELECT
          source,
          COUNT(*) as leads,
          COUNT(DISTINCT CASE WHEN d.stage = 'WON' THEN d.id END) as deals_won,
          COALESCE(SUM(CASE WHEN d.stage = 'WON' THEN d.value ELSE 0 END), 0) as revenue
        FROM "Lead" l
        LEFT JOIN "Deal" d ON l.id = d.id
        GROUP BY source
        ORDER BY revenue DESC
      `);

      const sources = result.rows.map(row => ({
        source: row.source || 'unknown',
        leads: parseInt(row.leads) || 0,
        dealsWon: parseInt(row.deals_won) || 0,
        revenue: parseInt(row.revenue) || 0,
        conversionRate: parseInt(row.leads) > 0 ? ((parseInt(row.deals_won) / parseInt(row.leads)) * 100).toFixed(2) : 0,
      }));

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: { sources },
      }));
    }
    else if (pathname === '/api/revenue/offers' && req.method === 'GET') {
      const result = await client.query(`
        SELECT id, title, "basePrice" as base_price, tier, discount
        FROM "Offer"
        LIMIT 20
      `);

      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'success',
        data: { offers: result.rows },
        count: result.rows.length,
      }));
    }
    else if (pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'wise2-revenue-api',
        version: '1.0.0-production',
        database: 'connected',
        uptime: process.uptime(),
      }));
    }
    else if (pathname === '/api' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        service: 'WISE² Revenue Command Center API',
        version: '1.0.0-production',
        database: 'wise2_prod (PostgreSQL)',
        endpoints: [
          'GET /api/health',
          'GET /api/revenue/dashboard',
          'GET /api/revenue/leads',
          'GET /api/revenue/deals',
          'GET /api/revenue/attribution/source',
          'GET /api/revenue/offers',
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
  console.log(`✅ WISE² Revenue Command Center API (Production) listening on port ${PORT}`);
  console.log(`📊 Connected to: wise2_prod PostgreSQL database`);
  console.log(`📊 Dashboard: GET http://localhost:${PORT}/api/revenue/dashboard`);
  console.log(`📈 Leads: GET http://localhost:${PORT}/api/revenue/leads`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close();
  process.exit(0);
});
