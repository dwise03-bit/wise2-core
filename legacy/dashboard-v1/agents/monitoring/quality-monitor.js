// Quality Monitor Agent
// Monitors: AI response quality, user satisfaction, knowledge gaps
const { query } = require('./db-utils');

class QualityMonitor {
  constructor() {
    this.name = 'Quality Monitor';
  }

  async getResponseQualityScore() {
    try {
      // Calculate quality based on: response length, relevance, escalation follow-up
      const result = await query(`
        SELECT
          COUNT(*) as total_responses,
          COUNT(CASE WHEN LENGTH(content) > 50 AND LENGTH(content) < 2000 THEN 1 END) as good_length,
          COUNT(CASE WHEN status = 'escalated' THEN 1 END) as escalated_after
        FROM conversation_messages
        WHERE sender = 'assistant'
          AND created_at > NOW() - INTERVAL '24 hours'
          AND content NOT LIKE '%error%'
          AND content NOT LIKE '%failed%'
      `);

      const row = result.rows[0];
      if (row.total_responses === 0) return 85;

      // Score based on:
      // - 70% of responses have good length
      // - 90% are not escalated after
      const lengthScore = (row.good_length / row.total_responses) * 100;
      const noEscalationScore = ((row.total_responses - row.escalated_after) / row.total_responses) * 100;
      const qualityScore = (lengthScore * 0.4 + noEscalationScore * 0.6);

      return Math.round(qualityScore);
    } catch (error) {
      console.error(`[${this.name}] Quality score calculation failed:`, error.message);
      return 0;
    }
  }

  async getUserSatisfaction() {
    try {
      // User satisfaction based on:
      // - Escalation rate (lower = happier)
      // - Sentiment in follow-up messages
      // - Button clicks for positive actions (not escalate)
      const result = await query(`
        SELECT
          COUNT(*) as total_interactions,
          COUNT(CASE WHEN status != 'escalated' THEN 1 END) as positive_interactions,
          COUNT(CASE WHEN frustration_score < 0.5 THEN 1 END) as calm_users
        FROM conversations
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const row = result.rows[0];
      if (row.total_interactions === 0) return 85;

      const satisfactionScore = (row.calm_users / row.total_interactions) * 100;
      return Math.round(satisfactionScore);
    } catch (error) {
      console.error(`[${this.name}] Satisfaction calculation failed:`, error.message);
      return 0;
    }
  }

  async detectKnowledgeGaps() {
    try {
      // Find questions that lead to escalation
      // (indicates AI couldn't answer them)
      const result = await query(`
        SELECT
          substring(content, 1, 80) as gap_topic,
          COUNT(*) as escalation_count
        FROM conversation_messages
        WHERE sender = 'user'
          AND created_at > NOW() - INTERVAL '7 days'
          AND conversation_id IN (
            SELECT conversation_id FROM conversations WHERE status = 'escalated'
          )
        GROUP BY substring(content, 1, 80)
        ORDER BY escalation_count DESC
        LIMIT 10
      `);

      return result.rows.map(row => ({
        topic: row.gap_topic,
        escalationCount: row.escalation_count,
        escalationRate: 100 // These all escalated
      }));
    } catch (error) {
      console.error(`[${this.name}] Knowledge gaps detection failed:`, error.message);
      return [];
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const qualityScore = await this.getResponseQualityScore();
    const satisfaction = await this.getUserSatisfaction();
    const knowledgeGaps = await this.detectKnowledgeGaps();

    const report = {
      name: this.name,
      timestamp: new Date(),
      score: qualityScore,
      satisfaction: satisfaction,
      knowledgeGaps,
      status: qualityScore > 80 ? 'HEALTHY' : 'WARNING'
    };

    console.log(`[${this.name}] Report complete:`, {
      quality: report.score + '/100',
      satisfaction: report.satisfaction + '%',
      gaps: report.knowledgeGaps.length
    });

    return report;
  }
}

module.exports = QualityMonitor;
