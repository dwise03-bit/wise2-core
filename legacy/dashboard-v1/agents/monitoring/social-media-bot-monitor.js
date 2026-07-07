// Social Media Bot Monitor
// Monitors: TikTok, Telegram, Twitter posts, engagement rates
const { query } = require('./db-utils');

class SocialMediaBotMonitor {
  constructor() {
    this.name = 'Social Media Bot Monitor';
  }

  async getPlatformStats() {
    try {
      const result = await query(`
        SELECT
          platform,
          COUNT(*) as total_posts,
          COUNT(CASE WHEN status = 'published' THEN 1 END) as published,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          ROUND(AVG(engagement), 2) as avg_engagement
        FROM social_posts
        WHERE created_at > NOW() - INTERVAL '24 hours'
        GROUP BY platform
        ORDER BY published DESC
      `);

      return result.rows.map(row => ({
        platform: row.platform || 'unknown',
        totalPosts: row.total_posts,
        published: row.published,
        failed: row.failed,
        successRate: row.total_posts > 0
          ? ((row.published / row.total_posts) * 100).toFixed(1)
          : 0,
        avgEngagement: parseFloat(row.avg_engagement) || 0
      }));
    } catch (error) {
      console.error(`[${this.name}] Platform stats fetch failed:`, error.message);
      return [];
    }
  }

  async getEngagementTrend() {
    try {
      // Get engagement trend over last 7 days
      const result = await query(`
        SELECT
          DATE(created_at) as day,
          ROUND(AVG(engagement), 2) as avg_engagement,
          COUNT(*) as post_count
        FROM social_posts
        WHERE created_at > NOW() - INTERVAL '7 days'
          AND status = 'published'
        GROUP BY DATE(created_at)
        ORDER BY day DESC
        LIMIT 7
      `);

      return result.rows.map(row => ({
        date: row.day,
        avgEngagement: parseFloat(row.avg_engagement),
        posts: row.post_count
      }));
    } catch (error) {
      return [];
    }
  }

  async getTopPerformers() {
    try {
      // Top 3 performing posts
      const result = await query(`
        SELECT
          platform,
          content,
          engagement,
          created_at
        FROM social_posts
        WHERE created_at > NOW() - INTERVAL '7 days'
          AND status = 'published'
        ORDER BY engagement DESC
        LIMIT 5
      `);

      return result.rows.map(row => ({
        platform: row.platform,
        content: row.content.substring(0, 80) + '...',
        engagement: parseFloat(row.engagement),
        posted: new Date(row.created_at).toISOString()
      }));
    } catch (error) {
      return [];
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const platformStats = await this.getPlatformStats();
    const trend = await this.getEngagementTrend();
    const topPosts = await this.getTopPerformers();

    // Calculate overall metrics
    const totalPublished = platformStats.reduce((sum, p) => sum + p.published, 0);
    const totalFailed = platformStats.reduce((sum, p) => sum + p.failed, 0);
    const overallSuccessRate = totalPublished + totalFailed > 0
      ? ((totalPublished / (totalPublished + totalFailed)) * 100).toFixed(1)
      : 0;
    const avgEngagementRate = platformStats.length > 0
      ? (platformStats.reduce((sum, p) => sum + p.avgEngagement, 0) / platformStats.length).toFixed(2)
      : 0;

    const report = {
      name: this.name,
      timestamp: new Date(),
      platformStats: platformStats,
      totalPublished: totalPublished,
      totalFailed: totalFailed,
      overallSuccessRate: parseFloat(overallSuccessRate),
      avgEngagementRate: parseFloat(avgEngagementRate),
      engagementTrend: trend,
      topPerformers: topPosts,
      status: overallSuccessRate >= 85 ? 'HEALTHY' : 'WARNING'
    };

    console.log(`[${this.name}] Report complete:`, {
      platforms: platformStats.map(p => p.platform).join(', '),
      published: report.totalPublished,
      failed: report.totalFailed,
      successRate: report.overallSuccessRate + '%',
      avgEngagement: report.avgEngagementRate
    });

    return report;
  }
}

module.exports = SocialMediaBotMonitor;
