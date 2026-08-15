// dashboard/api/recommendations.js
const express = require("express");
const pg = require("pg");
const ProductRecommender = require("../lib/product-recommender");

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
const recommender = new ProductRecommender();

router.post("/recommendations", async (req, res) => {
  const { articleId } = req.body;

  if (!articleId) {
    return res.status(400).json({ error: "articleId required" });
  }

  try {
    const article = await pool.query("SELECT content FROM news_articles WHERE id = $1", [articleId]);
    if (article.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const recommendations = await recommender.getRecommendations(article.rows[0].content, articleId);
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/recommendations/:articleId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pr.id, pr.product_id, pr.relevance_score, p.name, p.price
       FROM product_recommendations pr
       JOIN products p ON pr.product_id = p.id
       WHERE pr.article_id = $1
       ORDER BY pr.relevance_score DESC`,
      [req.params.articleId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/recommendations/:id/click", async (req, res) => {
  try {
    await pool.query("UPDATE product_recommendations SET was_clicked = true WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
