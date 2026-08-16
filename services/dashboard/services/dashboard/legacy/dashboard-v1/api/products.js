// dashboard/api/products.js
const express = require("express");
const pg = require("pg");

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

router.get("/products", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, category, price, sku, images FROM products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/products", async (req, res) => {
  const { name, description, category, price, cost, sku, images, stock_count, is_dropship, supplier_id, related_topics } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "name and price required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, category, price, cost, sku, images, stock_count, is_dropship, supplier_id, related_topics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [name, description, category, price, cost, sku, images || [], stock_count || 0, is_dropship || false, supplier_id, related_topics || []]
    );
    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
