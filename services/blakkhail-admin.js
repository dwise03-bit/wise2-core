const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ADMIN_PORT = process.env.BLAKKHAIL_ADMIN_PORT || 3011;
const ADMIN_DATA_FILE = '/tmp/blakkhail-admin.json';
const SESSIONS_FILE = '/tmp/blakkhail-sessions.json';

// Initialize admin account
function initializeAdmin() {
  if (!fs.existsSync(ADMIN_DATA_FILE)) {
    const adminHash = crypto.createHash('sha256').update('Piffcity').digest('hex');
    const adminData = {
      email: 'blakkhail@gmail.com',
      passwordHash: adminHash,
      role: 'owner',
      id: crypto.randomBytes(16).toString('hex')
    };
    fs.writeFileSync(ADMIN_DATA_FILE, JSON.stringify(adminData, null, 2));
  }
  
  if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify({ sessions: [] }, null, 2));
  }
}

// Generate session token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Verify token
function verifyToken(token) {
  try {
    const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    const session = sessions.sessions.find(s => s.token === token);
    
    if (!session) return null;
    if (Date.now() > session.expiresAt) return null;
    
    return session;
  } catch (err) {
    return null;
  }
}

// Parse JSON body
async function parseJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', service: 'blakkhail-admin' }));
    return;
  }

  // Login
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await parseJson(req);
      const adminData = JSON.parse(fs.readFileSync(ADMIN_DATA_FILE, 'utf8'));
      
      const passwordHash = crypto.createHash('sha256').update(body.password).digest('hex');
      
      if (body.email === adminData.email && passwordHash === adminData.passwordHash) {
        const token = generateToken();
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        
        const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
        sessions.sessions.push({
          token,
          email: adminData.email,
          userId: adminData.id,
          createdAt: Date.now(),
          expiresAt
        });
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          token,
          user: { email: adminData.email, id: adminData.id, role: adminData.role }
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ success: false, error: 'Invalid credentials' }));
      }
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Verify token
  if (req.url === '/api/auth/verify' && req.method === 'POST') {
    try {
      const body = await parseJson(req);
      const session = verifyToken(body.token);
      
      if (session) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_DATA_FILE, 'utf8'));
        res.writeHead(200);
        res.end(JSON.stringify({
          valid: true,
          user: {
            email: adminData.email,
            id: adminData.id,
            role: adminData.role,
            status: 'ACTIVE'
          }
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ valid: false }));
      }
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Logout
  if (req.url === '/api/auth/logout' && req.method === 'POST') {
    try {
      const body = await parseJson(req);
      const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      sessions.sessions = sessions.sessions.filter(s => s.token !== body.token);
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
      
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Initialize and start
initializeAdmin();
server.listen(ADMIN_PORT, '127.0.0.1', () => {
  console.log(`Blakkhail Admin Service running on port ${ADMIN_PORT}`);
  console.log(`Admin: blakkhail@gmail.com / Piffcity`);
});
