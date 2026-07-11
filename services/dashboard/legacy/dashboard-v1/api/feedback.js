// dashboard/api/feedback.js
const express = require("express");
const pg = require("pg");
const FeedbackTrainer = require("../lib/feedback-trainer");

const router = express.Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: false });
const trainer = new FeedbackTrainer(pool);

router.post("/feedback", async (req, res) => {
  const { scoreId, decision, notes, changesMade, oldScores, newScores } = req.body;

  if (!scoreId || !decision) {
    return res.status(400).json({ error: "scoreId and decision required" });
  }

  try {
    const result = await trainer.recordDecision(scoreId, decision, notes, changesMade, oldScores, newScores);
    res.json({ id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/feedback/patterns", async (req, res) => {
  try {
    const result = await trainer.getMonthlyPatterns();
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/feedback/override-rate", async (req, res) => {
  try {
    const result = await trainer.getOverrideRate();
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
