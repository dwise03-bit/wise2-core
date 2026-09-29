const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3013;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wise2_prod',
  user: process.env.DB_USER || 'wise2',
  password: process.env.DB_PASSWORD || 'wise2',
  max: 5,
});

const JWT_SECRET = process.env.JWT_SECRET || 'wise2-auth-gateway-2026';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'wise2salt').digest('hex');
}

// Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Query database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const hash = hashPassword(password);
    if (hash !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Login page
app.get('/auth/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-gateway' });
});

app.listen(PORT, () => {
  console.log(`✅ Auth Gateway running on port ${PORT}`);
});

process.on('exit', () => pool.end());
