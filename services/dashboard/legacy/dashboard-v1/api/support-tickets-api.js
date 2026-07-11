// dashboard/api/support-tickets-api.js
const express = require("express");
const SupportTickets = require("../lib/support-tickets");

const router = express.Router();
const tickets = new SupportTickets();

router.post("/support-tickets", async (req, res) => {
  const { customerEmail, subject, description } = req.body;

  if (!customerEmail || !subject) {
    return res.status(400).json({ error: "customerEmail and subject required" });
  }

  try {
    const result = await tickets.createTicket(customerEmail, subject, description || "");
    res.status(201).json({ id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/support-tickets/:id", async (req, res) => {
  try {
    const result = await tickets.getTicket(req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/support-tickets", async (req, res) => {
  try {
    const result = await tickets.listOpenTickets();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
