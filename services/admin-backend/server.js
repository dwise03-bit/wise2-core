const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 3014;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wise2_prod',
  user: process.env.DB_USER || 'wise2',
  password: process.env.DB_PASSWORD || 'wise2',
  max: 10,
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'wise2salt').digest('hex');
}

// Auth middleware
async function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const userId = token.substring(0, 36);
    const result = await pool.query('SELECT * FROM users WHERE id = $1 AND role = $2', [userId, 'ADMIN']);
    if (!result.rows[0]) {
      console.error(`Auth failed: User ${userId} not found or not ADMIN`);
      return res.status(403).json({ error: 'Unauthorized' });
    }
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(500).json({ error: 'Auth failed', details: error.message });
  }
}

// ============ ADMIN LOGIN ============
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'ADMIN']);
    const user = result.rows[0];

    if (!user || hashPassword(password) !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = user.id;
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
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============ DASHBOARD ============
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get summary stats
    const orders = await pool.query('SELECT COUNT(*) as total, SUM(total_price) as revenue FROM orders WHERE status = $1', ['completed']);
    const products = await pool.query('SELECT COUNT(*) as total FROM products');
    const customers = await pool.query('SELECT COUNT(*) as total FROM orders GROUP BY customer_email');

    res.json({
      stats: {
        totalOrders: parseInt(orders.rows[0]?.total || 0),
        totalRevenue: parseFloat(orders.rows[0]?.revenue || 0),
        totalProducts: parseInt(products.rows[0]?.total || 0),
        totalCustomers: customers.rows.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Dashboard failed' });
  }
});

// ============ PRODUCT MANAGEMENT ============
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, sku, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, description, price, sku, image_url, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, description, price, sku, image_url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, sku, image_url } = req.body;
    const result = await pool.query(
      'UPDATE products SET name=$1, description=$2, price=$3, sku=$4, image_url=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [name, description, price, sku, image_url, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============ ORDER MANAGEMENT ============
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

app.put('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// ============ ANALYTICS ============
app.get('/api/admin/analytics/sales', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_price) as revenue
      FROM orders
      WHERE status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/admin/analytics/revenue', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        SUM(total_price) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_price) as average_order_value
      FROM orders
      WHERE status = 'completed'
    `);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

app.get('/api/admin/analytics/top-products', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.name,
        p.price,
        COUNT(oi.id) as units_sold,
        SUM(oi.quantity * oi.price) as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name, p.price
      ORDER BY units_sold DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'admin-backend' });
});

app.listen(PORT, () => {
  console.log(`✅ Admin Backend running on port ${PORT}`);
});

process.on('exit', () => pool.end());
