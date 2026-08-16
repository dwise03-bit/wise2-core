// dashboard/api/checkout.js
const express = require("express");
const pg = require("pg");
const stripeHandler = require("../lib/stripe-handler");

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });

router.post("/checkout", async (req, res) => {
  const { items, customerEmail } = req.body;

  if (!items || !customerEmail) {
    return res.status(400).json({ error: "items and customerEmail required" });
  }

  try {
    const session = await stripeHandler.createCheckoutSession(items, customerEmail);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/checkout/confirm", async (req, res) => {
  const { sessionId, customerAddress } = req.body;

  if (!sessionId || !customerAddress) {
    return res.status(400).json({ error: "sessionId and customerAddress required" });
  }

  try {
    const session = await stripeHandler.retrieveSession(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    const items = JSON.parse(session.metadata.items);
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderResult = await pool.query(
      `INSERT INTO orders (customer_email, customer_address, items, total_price, status)
       VALUES ($1, $2, $3, $4, 'processing')
       RETURNING id, created_at`,
      [session.customer_email, customerAddress, JSON.stringify(items), totalPrice]
    );

    res.json({ orderId: orderResult.rows[0].id, status: "processing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
