#!/usr/bin/env node
/**
 * Blakkhail Admin Backend - Authentication Service
 * Handles owner/admin login and session management
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.BLAKKHAIL_ADMIN_PORT || 3014;
const ADMIN_FILE = '/tmp/blakkhail-admin.json';
const SESSION_FILE = '/tmp/blakkhail-sessions.json';

// Initialize admin accounts
function initializeAdmin() {
  if (!fs.existsSync(ADMIN_FILE)) {
    const adminAccounts = {
      accounts: [
        {
          id: crypto.randomBytes(16).toString('hex'),
          email: 'blakkhail@gmail.com',
          passwordHash: hashPassword('Piffcity'),
          role: 'owner',
          createdAt: new Date().toISOString(),
          active: true
        }
      ]
    };
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(adminAccounts, null, 2));
    console.log('✓ Admin account initialized: blakkhail@gmail.com');
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getAdminAccounts() {
  try {
    return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
  } catch {
    return { accounts: [] };
  }
}

function getSessions() {
  try {
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  } catch {
    return { sessions: [] };
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2));
}

function createSession(email) {
  const sessions = getSessions();
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  sessions.sessions = sessions.sessions || [];
  sessions.sessions.push({
    token,
    email,
    createdAt: new Date().toISOString(),
    expiresAt,
    valid: true
  });

  saveSessions(sessions);
  return { token, expiresAt };
}

function validateSession(token) {
  const sessions = getSessions();
  const session = (sessions.sessions || []).find(s => s.token === token && s.valid);

  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    session.valid = false;
    saveSessions(sessions);
    return null;
  }

  return session;
}

function parseJSON(req, callback) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      callback(JSON.parse(body));
    } catch {
      callback(null);
    }
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'blakkhail-admin' }));
    return;
  }

  // Login endpoint
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    parseJSON(req, (body) => {
      if (!body || !body.email || !body.password) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Email and password required' }));
        return;
      }

      const admin = getAdminAccounts();
      const account = admin.accounts.find(a => a.email === body.email && a.active);

      if (!account || !verifyPassword(body.password, account.passwordHash)) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
        return;
      }

      const session = createSession(body.email);
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        token: session.token,
        expiresAt: session.expiresAt,
        user: {
          email: account.email,
          role: account.role,
          id: account.id
        }
      }));
    });
    return;
  }

  // Verify session
  if (pathname === '/api/auth/verify' && req.method === 'POST') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    const session = validateSession(token);
    if (!session) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Invalid or expired session' }));
      return;
    }

    const admin = getAdminAccounts();
    const account = admin.accounts.find(a => a.email === session.email);

    res.writeHead(200);
    res.end(JSON.stringify({
      valid: true,
      user: {
        email: account.email,
        role: account.role,
        id: account.id
      }
    }));
    return;
  }

  // Logout endpoint
  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    const sessions = getSessions();
    const session = (sessions.sessions || []).find(s => s.token === token);
    if (session) {
      session.valid = false;
      saveSessions(sessions);
    }

    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Get admin info (requires valid session)
  if (pathname === '/api/admin/info' && req.method === 'GET') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    const session = validateSession(token);
    if (!session) {
      res.writeHead(401);
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({
      email: session.email,
      service: 'blakkhail-admin',
      authenticated: true
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Initialize and start
initializeAdmin();
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[BLAKKHAIL-ADMIN] Server listening on http://127.0.0.1:${PORT}`);
  console.log(`[BLAKKHAIL-ADMIN] Owner account ready: blakkhail@gmail.com`);
});
