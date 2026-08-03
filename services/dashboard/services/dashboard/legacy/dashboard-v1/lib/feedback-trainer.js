// dashboard/lib/feedback-trainer.js
const pg = require("pg");

class FeedbackTrainer {
  constructor(pool) {
    this.pool = pool;
  }

  async recordDecision(scoreId, decision, notes = "", changesMade = {}, oldScores = {}, newScores = {}) {
    return await this.pool.query(
      `INSERT INTO human_feedback (score_id, decision, notes, changes_made, old_scores, new_scores)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [scoreId, decision, notes, JSON.stringify(changesMade), JSON.stringify(oldScores), JSON.stringify(newScores)]
    );
  }

  async getMonthlyPatterns(months = 1) {
    return await this.pool.query(
      `SELECT
        COUNT(*) as total_decisions,
        SUM(CASE WHEN decision = 'approve' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN decision = 'reject' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN decision = 'modify' THEN 1 ELSE 0 END) as modified,
        AVG(CAST((new_scores->>'averageScore')::INT AS FLOAT)) as avg_final_score
       FROM human_feedback
       WHERE created_at > NOW() - INTERVAL '${months} months'`
    );
  }

  async getOverrideRate() {
    return await this.pool.query(
      `SELECT
        COUNT(*) as total_decisions,
        SUM(CASE WHEN old_scores != new_scores THEN 1 ELSE 0 END) as overrides,
        ROUND(100.0 * SUM(CASE WHEN old_scores != new_scores THEN 1 ELSE 0 END) / COUNT(*), 2) as override_percent
       FROM human_feedback`
    );
  }
}

module.exports = FeedbackTrainer;
