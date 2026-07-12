// dashboard/lib/chat-agent.js
const http = require("http");
const pg = require("pg");

class ChatAgent {
  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  }

  async chat(message, customerEmail) {
    const context = await this.buildContext(customerEmail);
    const response = await this.callOllama(message, context);
    return response;
  }

  async buildContext(customerEmail) {
    try {
      const orders = await this.pool.query(
        "SELECT id, status, total_price, tracking_number, created_at FROM orders WHERE customer_email = $1 ORDER BY created_at DESC LIMIT 3",
        [customerEmail]
      );

      const ordersText = orders.rows.length > 0
        ? `Customer orders:\n${orders.rows.map(o => `- Order #${o.id}: ${o.status}, $${o.total_price}, tracking: ${o.tracking_number || "N/A"}`).join("\n")}`
        : "No customer history";

      return ordersText;
    } catch (error) {
      console.error("[CHAT] Context error:", error.message);
      return "Unable to load customer history";
    }
  }

  async callOllama(message, context) {
    const prompt = `You are Wise Defense customer support AI. Answer the customer question helpfully.

${context}

Customer message: "${message}"

Respond in 1-2 friendly sentences. If complex, suggest: "I can escalate this to our team. Would you like me to create a support ticket?"`;

    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        model: process.env.OLLAMA_MODEL || "mistral",
        prompt: prompt,
        stream: false,
      });

      const req = http.request(
        { hostname: "localhost", port: 11434, path: "/api/generate", method: "POST" },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed.response);
            } catch (e) {
              reject(new Error("Invalid response"));
            }
          });
        }
      );

      req.on("error", reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = ChatAgent;
