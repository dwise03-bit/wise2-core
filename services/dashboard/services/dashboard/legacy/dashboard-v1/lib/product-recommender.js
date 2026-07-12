// dashboard/lib/product-recommender.js
const pg = require("pg");
const http = require("http");

class ProductRecommender {
  constructor() {
    this.pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
  }

  async getRecommendations(articleContent, articleId, limit = 3) {
    try {
      // Get all products
      const productsResult = await this.pool.query(
        "SELECT id, name, category, related_topics FROM products"
      );

      const products = productsResult.rows;
      if (products.length === 0) return [];

      // Use Ollama to score relevance
      const scores = await this.scoreProductsAgainstArticle(articleContent, products);

      // Insert recommendations
      for (const { productId, relevance } of scores.slice(0, limit)) {
        try {
          await this.pool.query(
            `INSERT INTO product_recommendations (article_id, product_id, relevance_score)
             VALUES ($1, $2, $3)
             ON CONFLICT (article_id, product_id) DO UPDATE SET relevance_score = $3`,
            [articleId, productId, relevance]
          );
        } catch (e) {
          console.error(`[RECOMMENDER] Failed to save recommendation: ${e.message}`);
        }
      }

      return scores.slice(0, limit);
    } catch (error) {
      console.error("[RECOMMENDER] Error:", error.message);
      return [];
    }
  }

  async scoreProductsAgainstArticle(content, products) {
    const productList = products.map(p => `- ${p.name} (Topics: ${p.related_topics.join(", ")})`).join("\n");

    const prompt = `Score how relevant each product is to this article (0-100).

Article summary (first 500 chars):
${content.substring(0, 500)}

Products:
${productList}

Respond with ONLY valid JSON (one line, no markdown):
{
  "scores": [
    {"name": "Product Name", "relevance": <0-100>},
    ...
  ]
}`;

    try {
      const response = await this.callOllama(prompt);
      const data = JSON.parse(response);

      return data.scores.map(s => ({
        productId: products.find(p => p.name === s.name)?.id,
        relevance: s.relevance,
      })).filter(s => s.productId);
    } catch (error) {
      console.error("[RECOMMENDER] Ollama error:", error.message);
      return [];
    }
  }

  async callOllama(prompt) {
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
              reject(new Error("Invalid Ollama response"));
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

module.exports = ProductRecommender;
