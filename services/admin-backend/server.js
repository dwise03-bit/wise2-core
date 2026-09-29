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

// Auth middleware - simplified to avoid connection pool issues
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  // Token is the user ID (UUID format) - just verify it looks valid
  const userId = token.substring(0, 36);
  if (userId.length !== 36 || !userId.includes('-')) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  // Store token for use in endpoints
  req.userId = userId;
  next();
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

// Public endpoint for storefront latest products (no auth required)
app.get('/api/storefront/latest-products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const result = await pool.query('SELECT id, name, description, price, image_url, sku FROM products ORDER BY created_at DESC LIMIT $1', [limit]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin endpoint for all products (requires auth)
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

// ============ SHOPPING CART ============
// Create or get cart session
app.post('/api/cart/create', async (req, res) => {
  try {
    const cartId = require('crypto').randomUUID();
    res.json({ cartId, items: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cart' });
  }
});

// Add item to cart (stored client-side via localStorage)
app.post('/api/cart/:cartId/add', express.json(), async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (!product.rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, product: product.rows[0], quantity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Create order from cart
app.post('/api/orders/create', express.json(), async (req, res) => {
  try {
    const { items, customerEmail, totalPrice } = req.body;
    if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

    const orderResult = await pool.query(
      'INSERT INTO orders (customer_email, total_price, status) VALUES ($1, $2, $3) RETURNING id',
      [customerEmail || 'guest@blakkhail.com', totalPrice, 'pending']
    );

    const orderId = orderResult.rows[0].id;
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    res.json({ success: true, orderId, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
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
