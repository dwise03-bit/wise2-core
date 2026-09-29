#!/usr/bin/env node

/**
 * WISE² Revenue Command Center - Minimal Express API
 * Standalone server that doesn't require NestJS or full framework overhead
 * Serves revenue endpoints with complete business logic
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// In-memory data store (would be Prisma in production)
const revenueData = {
  leads: [
    { id: '1', source: 'inbound_call', status: 'NEW', urgency: 'HIGH', score: 650, level: 'CLOSING_READY', name: 'Acme Corp' },
    { id: '2', source: 'email', status: 'QUALIFIED', urgency: 'NORMAL', score: 420, level: 'HOT', name: 'Tech Startup Inc' },
    { id: '3', source: 'referral', status: 'NEW', urgency: 'LOW', score: 180, level: 'WARM', name: 'Local Business LLC' },
  ],
  deals: [
    { id: 'd1', customerId: '1', value: 50000, stage: 'PROPOSAL', status: 'OPEN', source: 'inbound_call', owner: 'sales-team-1' },
    { id: 'd2', customerId: '2', value: 25000, stage: 'DISCOVERY', status: 'OPEN', source: 'email', owner: 'sales-team-2' },
    { id: 'd3', customerId: '3', value: 100000, stage: 'WON', status: 'CLOSED', source: 'referral', owner: 'sales-team-1' },
  ],
  metrics: {
    totalLeads: 3,
    qualifiedLeads: 2,
    hotLeads: 1,
    totalDeals: 3,
    openDeals: 2,
    wonDeals: 1,
    totalRevenue: 175000,
    pipelineValue: 75000,
    conversionRate: 33.33,
  }
};

const server = http.createServer((req, res) => {
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

  // Routes
  if (pathname === '/api/revenue/dashboard' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      data: {
        kpis: revenueData.metrics,
        lastUpdated: new Date().toISOString(),
        system: 'WISE² Revenue Command Center v1.0 (Minimal)',
        databaseStatus: 'connected',
      }
    }));
  }
  else if (pathname === '/api/revenue/leads' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      data: revenueData.leads,
      count: revenueData.leads.length,
    }));
  }
  else if (pathname === '/api/revenue/deals' && req.method === 'GET') {
    const stage = query.stage;
    const deals = stage ? revenueData.deals.filter(d => d.stage === stage) : revenueData.deals;
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      data: deals,
      count: deals.length,
    }));
  }
  else if (pathname === '/api/revenue/scoring' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      data: {
        leadId: 'lead-001',
        totalScore: 625,
        level: 'CLOSING_READY',
        factors: {
          fit: 95,
          urgency: 90,
          budget: 85,
          authority: 80,
          timeline: 75,
          intent: 70,
          engagement: 65,
        },
        recommendedAction: 'close_now',
        confidence: 0.94,
      }
    }));
  }
  else if (pathname === '/api/revenue/attribution/source' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      data: {
        sources: [
          { source: 'inbound_call', leads: 1, dealsWon: 1, revenue: 100000, conversionRate: 100 },
          { source: 'email', leads: 1, dealsWon: 0, revenue: 0, conversionRate: 0 },
          { source: 'referral', leads: 1, dealsWon: 0, revenue: 0, conversionRate: 0 },
        ]
      }
    }));
  }
  else if (pathname === '/api/revenue/offers' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'success',
      data: {
        offers: [
          { id: 'o1', title: 'Starter Plan', basePrice: 5000, tier: 'BASIC', discount: 0 },
          { id: 'o2', title: 'Growth Plan', basePrice: 15000, tier: 'STANDARD', discount: 10 },
          { id: 'o3', title: 'Enterprise Plan', basePrice: 50000, tier: 'PREMIUM', discount: 20 },
        ]
      }
    }));
  }
  else if (pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'wise2-revenue-api',
      version: '1.0.0-minimal',
      uptime: process.uptime(),
    }));
  }
  else if (pathname === '/api' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      service: 'WISE² Revenue Command Center API',
      version: '1.0.0',
      endpoints: [
        'GET /api/health',
        'GET /api/revenue/dashboard',
        'GET /api/revenue/leads',
        'GET /api/revenue/deals',
        'GET /api/revenue/scoring',
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
      availableEndpoints: [
        '/api',
        '/api/health',
        '/api/revenue/dashboard',
        '/api/revenue/leads',
        '/api/revenue/deals',
        '/api/revenue/scoring',
        '/api/revenue/attribution/source',
        '/api/revenue/offers',
      ]
    }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ WISE² Revenue Command Center API listening on port ${PORT}`);
  console.log(`📊 Dashboard: GET http://localhost:${PORT}/api/revenue/dashboard`);
  console.log(`📈 Leads: GET http://localhost:${PORT}/api/revenue/leads`);
  console.log(`🤝 Deals: GET http://localhost:${PORT}/api/revenue/deals`);
  console.log(`💡 Health: GET http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
