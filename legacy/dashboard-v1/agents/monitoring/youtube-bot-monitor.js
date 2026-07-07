// YouTube Bot Monitor Agent
// Monitors: videos uploaded, failed uploads, upload rate, bot status
const { query } = require('./db-utils');

class YouTubeBotMonitor {
  constructor() {
    this.name = 'YouTube Bot Monitor';
  }

  async getYouTubeStats() {
    try {
      // Get YouTube upload stats from last 24 hours
      const result = await query(`
        SELECT
          COUNT(*) as total_posts,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing
        FROM social_posts
        WHERE platform = 'youtube'
          AND created_at > NOW() - INTERVAL '24 hours'
      `);

      const row = result.rows[0];
      return {
        totalPosts: row.total_posts || 0,
        published: row.published || 0,
        failed: row.failed || 0,
        pending: row.pending || 0,
        processing: row.processing || 0,
        successRate: row.total_posts > 0
          ? ((row.published / row.total_posts) * 100).toFixed(1)
          : 0
      };
    } catch (error) {
      console.error(`[${this.name}] YouTube stats fetch failed:`, error.message);
      return {
        totalPosts: 0,
        published: 0,
        failed: 0,
        pending: 0,
        processing: 0,
        successRate: 0
      };
    }
  }

  async getYouTubeErrors() {
    try {
      const result = await query(`
        SELECT
          error_message,
          COUNT(*) as error_count
        FROM social_posts
        WHERE platform = 'youtube'
          AND status = 'failed'
          AND created_at > NOW() - INTERVAL '24 hours'
        GROUP BY error_message
        ORDER BY error_count DESC
        LIMIT 5
      `);

      return result.rows.map(row => ({
        error: row.error_message || 'Unknown',
        count: row.error_count
      }));
    } catch (error) {
      console.error(`[${this.name}] YouTube errors fetch failed:`, error.message);
      return [];
    }
  }

  async getUploadRate() {
    try {
      // Uploads per hour
      const result = await query(`
        SELECT
          COUNT(*) as uploads_last_hour
        FROM social_posts
        WHERE platform = 'youtube'
          AND created_at > NOW() - INTERVAL '1 hour'
          AND status = 'published'
      `);

      return result.rows[0]?.uploads_last_hour || 0;
    } catch (error) {
      return 0;
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const stats = await this.getYouTubeStats();
    const errors = await this.getYouTubeErrors();
    const uploadRate = await this.getUploadRate();

    const report = {
      name: this.name,
      timestamp: new Date(),
      totalPosts24h: stats.totalPosts,
      published: stats.published,
      failed: stats.failed,
      pending: stats.pending,
      processing: stats.processing,
      successRate: parseFloat(stats.successRate),
      uploadsPerHour: uploadRate,
      recentErrors: errors,
      status: stats.successRate >= 90 ? 'HEALTHY' : stats.successRate >= 70 ? 'WARNING' : 'CRITICAL'
    };

    console.log(`[${this.name}] Report complete:`, {
      published: report.published,
      failed: report.failed,
      successRate: report.successRate + '%',
      uploadsPerHour: report.uploadsPerHour
    });

    return report;
  }
}

module.exports = YouTubeBotMonitor;
