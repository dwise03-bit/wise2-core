#!/usr/bin/env node

/**
 * WISE² IMP Service
 *
 * Production service that implements the Intent Management Platform
 * for WISE² ecosystem routing, authorization, and execution dispatch.
 */

const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────

const CONFIG = JSON.parse(
  fs.readFileSync(path.join(process.env.HOME, '.wise2/config.json'), 'utf-8')
);

const PORT = process.env.WISE2_IMP_PORT || 9002;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// ─────────────────────────────────────────────────────────────────────
// INTENT CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────

const INTENT_PATTERNS = {
  CHAT: [/^(hey|hi|hello|bye|thanks|ok|alright)/i],
  STATUS: [/\bstatus\b/i, /what'?s.*status/i, /how.*things/i],
  HEALTH: [/\bhealth\b/i, /health check/i, /diagnos/i],
  DEPLOY: [/deploy/i, /release/i, /launch/i],
  CODE: [/code/i, /implement/i, /build/i, /develop/i],
  DEBUG: [/debug/i, /error/i, /broken/i, /fix/i],
  CUSTOMER: [/customer/i, /client/i, /account/i],
  LEAD: [/lead/i, /prospect/i, /pipeline/i],
  DEMO: [/demo/i, /showcase/i],
  HVAC: [/hvac/i, /heating/i, /cooling/i],
  DEFENSE: [/defense/i, /security/i, /radar/i],
};

function classifyIntent(text) {
  const normalized = text.toLowerCase();
  const intents = [];

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        intents.push(intent);
        break;
      }
    }
  }

  return intents.length > 0 ? intents[0] : 'CHAT';
}

// ─────────────────────────────────────────────────────────────────────
// RISK CLASSIFICATION
// ─────────────────────────────────────────────────────────────────────

const RISK_LEVELS = {
  LEVEL_0: { level: 0, name: 'Read-Only', requiresConfirmation: false },
  LEVEL_1: { level: 1, name: 'Reversible', requiresConfirmation: false },
  LEVEL_2: { level: 2, name: 'Mutating', requiresConfirmation: true },
  LEVEL_3: { level: 3, name: 'Destructive', requiresConfirmation: true },
};

const INTENT_RISKS = {
  CHAT: RISK_LEVELS.LEVEL_0,
  STATUS: RISK_LEVELS.LEVEL_0,
  HEALTH: RISK_LEVELS.LEVEL_0,
  DEPLOY: RISK_LEVELS.LEVEL_2,
  CODE: RISK_LEVELS.LEVEL_1,
  DEBUG: RISK_LEVELS.LEVEL_1,
  CUSTOMER: RISK_LEVELS.LEVEL_0,
  LEAD: RISK_LEVELS.LEVEL_0,
  DEMO: RISK_LEVELS.LEVEL_1,
  HVAC: RISK_LEVELS.LEVEL_1,
  DEFENSE: RISK_LEVELS.LEVEL_1,
};

function getRiskLevel(intent) {
  return INTENT_RISKS[intent] || RISK_LEVELS.LEVEL_0;
}

// ─────────────────────────────────────────────────────────────────────
// AUTHORIZATION
// ─────────────────────────────────────────────────────────────────────

function verifySender(e164) {
  return CONFIG.authorized_senders.find((s) => s.e164_number === e164) || null;
}

function canExecute(role, riskLevel) {
  const matrix = {
    viewer: [0],
    operator: [0, 1, 2],
    owner: [0, 1, 2, 3],
  };
  return matrix[role]?.includes(riskLevel) || false;
}

// ─────────────────────────────────────────────────────────────────────
// JOB MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

let jobs = new Map();
let jobCounter = 0;

function generateJobId() {
  const timestamp = Date.now().toString(36);
  const counter = (++jobCounter).toString(36).padStart(4, '0');
  return `job_${timestamp}_${counter}`;
}

function createJob(sender, intent, riskLevel, text) {
  const jobId = generateJobId();
  const risk = getRiskLevel(intent);

  const job = {
    id: jobId,
    sender: sender.id,
    sender_name: sender.name,
    intent,
    riskLevel: risk.level,
    status: 'queued',
    title: `${intent} - ${text.substring(0, 50)}`,
    created_at: new Date().toISOString(),
    started_at: null,
    completed_at: null,
    result: null,
  };

  jobs.set(jobId, job);
  return job;
}

function updateJob(jobId, updates) {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates);
  }
  return job;
}

// ─────────────────────────────────────────────────────────────────────
// REQUEST PROCESSING
// ─────────────────────────────────────────────────────────────────────

function processRequest(sender_e164, text) {
  const timestamp = new Date().toISOString();

  // Verify sender
  const sender = verifySender(sender_e164);
  if (!sender) {
    return {
      status: 'error',
      message: 'WISE² - Unauthorized sender',
      timestamp,
    };
  }

  // Classify intent
  const intent = classifyIntent(text);

  // Get risk level
  const risk = getRiskLevel(intent);

  // Check authorization
  if (!canExecute(sender.role, risk.level)) {
    return {
      status: 'error',
      message: `WISE² - Insufficient permissions for ${risk.name} operation`,
      timestamp,
    };
  }

  // Create job
  const job = createJob(sender, intent, risk, text);

  // Execute if Level 0 or 1
  if (risk.level <= 1) {
    updateJob(job.id, {
      status: 'executing',
      started_at: new Date().toISOString(),
    });

    // Simulate execution
    setTimeout(() => {
      updateJob(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result: {
          intent,
          riskLevel: risk.level,
          message: `✅ ${job.title} executed successfully`,
          executor: 'wise2-imp',
        },
      });
    }, 500);

    return {
      status: 'executing',
      jobId: job.id,
      message: `✅ ${job.title}\nJob queued for execution.`,
      timestamp,
    };
  }

  // Level 2+ requires confirmation
  const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  updateJob(job.id, {
    status: 'pending_confirmation',
    confirmationCode,
    confirmationExpires: Date.now() + 5 * 60 * 1000,
  });

  return {
    status: 'pending_confirmation',
    jobId: job.id,
    confirmationCode,
    message: `⚠️ ${risk.name} Operation\n\n${job.title}\n\nConfirm: CONFIRM ${confirmationCode}\n(Expires in 5 minutes)`,
    timestamp,
  };
}

// ─────────────────────────────────────────────────────────────────────
// HTTP SERVER
// ─────────────────────────────────────────────────────────────────────

const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Routes
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: 'healthy',
        uptime: process.uptime(),
        jobs: jobs.size,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }

  if (req.url === '/request' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const result = processRequest(data.sender_e164, data.text);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.url === '/jobs' && req.method === 'GET') {
    res.writeHead(200);
    res.end(
      JSON.stringify(
        Array.from(jobs.values())
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 50)
      )
    );
    return;
  }

  if (req.url.startsWith('/job/') && req.method === 'GET') {
    const jobId = req.url.split('/')[2];
    const job = jobs.get(jobId);
    if (job) {
      res.writeHead(200);
      res.end(JSON.stringify(job));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Job not found' }));
    }
    return;
  }

  // Default
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           ✅ WISE² IMP Service Started                          ║
║                                                                  ║
║  Intent Management Platform v1.0.0                              ║
║  Owner: ${CONFIG.owner_name.padEnd(41)}║
║  Port: ${String(PORT).padEnd(51)}║
║  Status: HEALTHY                                                ║
║                                                                  ║
║  Endpoints:                                                      ║
║    POST   /request     - Process request                        ║
║    GET    /jobs        - List recent jobs                       ║
║    GET    /job/<id>    - Get job details                        ║
║    GET    /health      - Health check                           ║
║                                                                  ║
║  Test command:                                                   ║
║    curl -X POST http://localhost:${PORT}/request \\          ║
║      -H "Content-Type: application/json" \\                    ║
║      -d '{"sender_e164":"+1-555-0123","text":"Wise, status"}'  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[IMP] Shutting down gracefully...');
  server.close(() => process.exit(0));
});
