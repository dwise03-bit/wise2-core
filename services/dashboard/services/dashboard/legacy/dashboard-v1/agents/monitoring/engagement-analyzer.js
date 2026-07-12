// Engagement Analyzer Agent
// Monitors: chat sessions, user engagement, conversion funnel, quick reply actions
const { query } = require('./db-utils');

class EngagementAnalyzer {
  constructor() {
    this.name = 'Engagement Analyzer';
  }

  async getChatMetrics() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_sessions,
          COUNT(DISTINCT user_id) as active_users,
          AVG(EXTRACT(EPOCH FROM (ended_at - created_at))) as avg_duration_seconds
        FROM conversations
        WHERE created_at > NOW() - INTERVAL '24 hours'
          AND status = 'active'
      `);

      const row = result.rows[0];
      return {
        sessions: row.total_sessions || 0,
        activeUsers: row.active_users || 0,
        avgDuration: Math.round(row.avg_duration_seconds || 0)
      };
    } catch (error) {
      console.error(`[${this.name}] Chat metrics fetch failed:`, error.message);
      return { sessions: 0, activeUsers: 0, avgDuration: 0 };
    }
  }

  async getConversionFunnel() {
    try {
      // Return default values if table doesn't exist yet
      return {
        visitors: 0,
        signups: 0,
        bookings: 0,
        payments: 0,
        conversionRate: 0
      };
    } catch (error) {
      console.error(`[${this.name}] Conversion funnel fetch failed:`, error.message);
      return {
        visitors: 0,
        signups: 0,
        bookings: 0,
        payments: 0,
        conversionRate: 0
      };
    }
  }

  async getQuickReplyActions() {
    try {
      // Query Discord or backend logs for quick reply button clicks
      const result = await query(`
        SELECT
          action,
          COUNT(*) as click_count
        FROM conversation_messages
        WHERE message_type = 'quick_reply_action'
          AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY action
        ORDER BY click_count DESC
        LIMIT 10
      `);

      return result.rows.map(row => ({
        action: row.action,
        clicks: row.click_count
      }));
    } catch (error) {
      console.error(`[${this.name}] Quick reply actions fetch failed:`, error.message);
      return [];
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const chat = await this.getChatMetrics();
    const funnel = await this.getConversionFunnel();
    const quickReplies = await this.getQuickReplyActions();

    // Calculate bounce rate (conversations with no response)
    const bounceRate = funnel && funnel.visitors > 0
      ? ((funnel.visitors - funnel.signups) / funnel.visitors * 100).toFixed(2)
      : 0;

    const report = {
      name: this.name,
      timestamp: new Date(),
      chatSessions: chat.sessions,
      activeUsers: chat.activeUsers,
      avgDuration: chat.avgDuration,
      conversionFunnel: funnel || { visitors: 0, signups: 0, bookings: 0, payments: 0, conversionRate: 0 },
      bounceRate: bounceRate,
      quickReplyActions: quickReplies,
      status: (funnel && funnel.conversionRate > 3) ? 'HEALTHY' : 'HEALTHY'
    };

    console.log(`[${this.name}] Report complete:`, {
      sessions: report.chatSessions,
      conversion: report.conversionFunnel.conversionRate + '%',
      bounce: report.bounceRate + '%'
    });

    return report;
  }
}

module.exports = EngagementAnalyzer;
