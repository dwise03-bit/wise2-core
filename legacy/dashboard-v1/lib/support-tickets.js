// dashboard/lib/support-tickets.js
const pg = require("pg");

class SupportTickets {
  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  }

  async createTicket(customerEmail, subject, description) {
    return await this.pool.query(
      `INSERT INTO support_tickets (customer_email, subject, description, status)
       VALUES ($1, $2, $3, 'open')
       RETURNING id, created_at`,
      [customerEmail, subject, description]
    );
  }

  async getTicket(ticketId) {
    return await this.pool.query(
      "SELECT * FROM support_tickets WHERE id = $1",
      [ticketId]
    );
  }

  async updateTicketStatus(ticketId, status, agentNotes = null) {
    return await this.pool.query(
      "UPDATE support_tickets SET status = $1, agent_notes = $2, updated_at = NOW() WHERE id = $3",
      [status, agentNotes, ticketId]
    );
  }

  async listOpenTickets(limit = 50) {
    return await this.pool.query(
      "SELECT id, customer_email, subject, created_at FROM support_tickets WHERE status = 'open' ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
  }
}

module.exports = SupportTickets;
