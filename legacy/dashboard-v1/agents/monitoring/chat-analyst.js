// Chat Analyst Agent
// Monitors: trending questions, escalation rate, user sentiment
const { query } = require('./db-utils');

class ChatAnalyst {
  constructor() {
    this.name = 'Chat Analyst';
  }

  async getTrendingQuestions() {
    try {
      const result = await query(`
        SELECT
          content as question,
          COUNT(*) as frequency,
          ROUND(AVG(frustration_score)::NUMERIC, 2) as avg_frustration
        FROM conversation_messages
        WHERE sender = 'user'
          AND created_at > NOW() - INTERVAL '24 hours'
          AND LENGTH(content) > 10
        GROUP BY content
        ORDER BY frequency DESC
        LIMIT 20
      `);

      return result.rows.map(row => ({
        question: row.question.substring(0, 100),
        count: row.frequency,
        avgFrustration: row.avg_frustration || 0
      }));
    } catch (error) {
      console.error(`[${this.name}] Trending questions fetch failed:`, error.message);
      return [{ question: 'No data yet', count: 0, avgFrustration: 0 }];
    }
  }

  async getEscalationStats() {
    try {
      const result = await query(`
        SELECT
          COUNT(DISTINCT conversation_id) as total_conversations,
          COUNT(DISTINCT CASE WHEN status = 'escalated' THEN conversation_id END) as escalated_count,
          ROUND(100.0 * COUNT(DISTINCT CASE WHEN status = 'escalated' THEN conversation_id END)
            / NULLIF(COUNT(DISTINCT conversation_id), 0)::NUMERIC, 2) as escalation_rate,
          ROUND(AVG(frustration_score)::NUMERIC, 2) as avg_frustration
        FROM conversation_messages
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `);

      const row = result.rows[0];
      return {
        totalConversations: row.total_conversations || 0,
        escalatedCount: row.escalated_count || 0,
        escalationRate: parseFloat(row.escalation_rate) || 0,
        avgFrustration: parseFloat(row.avg_frustration) || 0
      };
    } catch (error) {
      console.error(`[${this.name}] Escalation stats fetch failed:`, error.message);
      return {
        totalConversations: 0,
        escalatedCount: 0,
        escalationRate: 0,
        avgFrustration: 0
      };
    }
  }

  async analyzeSentiment() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_messages,
          COUNT(CASE WHEN frustration_score >= 0.5 THEN 1 END) as negative_messages,
          COUNT(CASE WHEN frustration_score < 0.3 THEN 1 END) as positive_messages,
          ROUND(100.0 * COUNT(CASE WHEN frustration_score >= 0.5 THEN 1 END)
            / NULLIF(COUNT(*), 0)::NUMERIC, 2) as negative_pct
        FROM conversation_messages
        WHERE sender = 'user'
          AND created_at > NOW() - INTERVAL '24 hours'
      `);

      const row = result.rows[0];
      return {
        totalMessages: row.total_messages || 0,
        negativeSentiment: row.negative_messages || 0,
        positiveSentiment: row.positive_messages || 0,
        negativePercentage: parseFloat(row.negative_pct) || 0
      };
    } catch (error) {
      console.error(`[${this.name}] Sentiment analysis fetch failed:`, error.message);
      return {
        totalMessages: 0,
        negativeSentiment: 0,
        positiveSentiment: 0,
        negativePercentage: 0
      };
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const trendingQuestions = await this.getTrendingQuestions();
    const escalation = await this.getEscalationStats();
    const sentiment = await this.analyzeSentiment();

    const report = {
      name: this.name,
      timestamp: new Date(),
      trendingQuestions,
      escalationRate: escalation.escalationRate,
      escalationCount: escalation.escalatedCount,
      avgFrustration: escalation.avgFrustration,
      sentiment,
      status: escalation.escalationRate > 15 ? 'WARNING' : 'HEALTHY'
    };

    console.log(`[${this.name}] Report complete:`, {
      topQuestion: trendingQuestions[0]?.question?.substring(0, 50),
      escalations: escalation.escalationRate + '%',
      negativeSentiment: sentiment.negativePercentage + '%'
    });

    return report;
  }
}

module.exports = ChatAnalyst;
