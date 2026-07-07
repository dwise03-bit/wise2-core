// Orchestrator Agent
// Coordinates all monitoring agents, detects anomalies, generates recommendations
require('dotenv').config();
const { logCycle, getLatestCycle, getCycleHistory } = require('./db-utils');

const PerformanceMonitor = require('./performance-monitor');
const EngagementAnalyzer = require('./engagement-analyzer');
const ChatAnalyst = require('./chat-analyst');
const QualityMonitor = require('./quality-monitor');
const BusinessMetrics = require('./business-metrics');
const PM2HealthMonitor = require('./pm2-health-monitor');
const YouTubeBotMonitor = require('./youtube-bot-monitor');
const DropshippingBotMonitor = require('./dropshipping-bot-monitor');
const SocialMediaBotMonitor = require('./social-media-bot-monitor');

class Orchestrator {
  constructor() {
    this.name = 'Orchestrator';
    this.cycleNumber = 0;
    this.agents = {
      performance: new PerformanceMonitor(),
      engagement: new EngagementAnalyzer(),
      chat: new ChatAnalyst(),
      quality: new QualityMonitor(),
      business: new BusinessMetrics(),
      pm2Health: new PM2HealthMonitor(),
      youtubeBots: new YouTubeBotMonitor(),
      dropshippingBots: new DropshippingBotMonitor(),
      socialMediaBots: new SocialMediaBotMonitor()
    };
  }

  async runCycle() {
    this.cycleNumber++;
    const startTime = Date.now();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${this.name}] CYCLE #${this.cycleNumber} STARTED - ${new Date().toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // Step 1: Run all agents in parallel (T+0 to T+3)
      console.log(`[${this.name}] Step 1: Running 9 agents in parallel...`);
      const reports = await Promise.all([
        this.agents.performance.report(),
        this.agents.engagement.report(),
        this.agents.chat.report(),
        this.agents.quality.report(),
        this.agents.business.report(),
        this.agents.pm2Health.report(),
        this.agents.youtubeBots.report(),
        this.agents.dropshippingBots.report(),
        this.agents.socialMediaBots.report()
      ]);

      // Step 2: Aggregate reports (T+3 to T+3:30)
      console.log(`\n[${this.name}] Step 2: Aggregating reports...`);
      const aggregated = this.aggregateReports(reports);

      // Step 3: Detect anomalies (T+3:30 to T+4)
      console.log(`[${this.name}] Step 3: Detecting anomalies...`);
      const anomalies = await this.detectAnomalies(aggregated);

      // Step 4: Generate recommendations (T+4 to T+4:30)
      console.log(`[${this.name}] Step 4: Generating recommendations...`);
      const recommendations = this.generateRecommendations(anomalies);

      // Step 5: Send Discord alert (T+4:30)
      console.log(`[${this.name}] Step 5: Sending Discord alert...`);
      await this.sendDiscordAlert(aggregated, anomalies, recommendations);

      // Step 6: Log cycle (T+5)
      console.log(`[${this.name}] Step 6: Logging cycle to database...`);
      const duration = Math.round((Date.now() - startTime) / 1000);
      await logCycle({
        cycleNumber: this.cycleNumber,
        timestamp: new Date(),
        duration,
        performance: aggregated.performance,
        engagement: aggregated.engagement,
        chat: aggregated.chat,
        quality: aggregated.quality,
        business: aggregated.business,
        anomalies,
        recommendations,
        status: 'COMPLETE'
      });

      console.log(`\n[${this.name}] ✅ CYCLE #${this.cycleNumber} COMPLETE in ${duration}s`);
      console.log(`[${this.name}] Anomalies: ${anomalies.length} | Recommendations: ${recommendations.length}`);
      console.log(`${'='.repeat(60)}\n`);

      return { success: true, duration, anomalies, recommendations };
    } catch (error) {
      console.error(`\n[${this.name}] ❌ CYCLE #${this.cycleNumber} FAILED:`, error.message);
      console.error(error.stack);
      return { success: false, error: error.message };
    }
  }

  aggregateReports(reports) {
    const aggregated = {
      timestamp: new Date(),
      performance: reports[0],
      engagement: reports[1],
      chat: reports[2],
      quality: reports[3],
      business: reports[4],
      pm2Health: reports[5],
      youtubeBots: reports[6],
      dropshippingBots: reports[7],
      socialMediaBots: reports[8]
    };

    console.log(`[${this.name}] Aggregated reports from all 9 agents`);
    return aggregated;
  }

  async detectAnomalies(aggregated) {
    const anomalies = [];
    const history = await getCycleHistory(7);
    const baseline = history[0] || {};

    // Safely access nested properties
    const engagement = aggregated.engagement || {};
    const conversionFunnel = engagement.conversionFunnel || { conversionRate: 0, visitors: 0 };

    // Performance anomalies
    if (aggregated.performance.uptime < 99.0) {
      anomalies.push({
        agent: 'performance',
        metric: 'uptime',
        current: aggregated.performance.uptime,
        baseline: baseline.uptime_percentage || 99.9,
        severity: aggregated.performance.uptime < 99.5 ? 'WARNING' : 'INFO',
        change: -((99.9 - aggregated.performance.uptime).toFixed(2))
      });
    }

    if (aggregated.performance.latencies.p99 > 1000) {
      anomalies.push({
        agent: 'performance',
        metric: 'api_latency_p99',
        current: aggregated.performance.latencies.p99,
        baseline: baseline.api_latency_p99 || 500,
        severity: 'WARNING',
        change: aggregated.performance.latencies.p99 - (baseline.api_latency_p99 || 500)
      });
    }

    // Engagement anomalies
    if (engagement.bounceRate > 30) {
      anomalies.push({
        agent: 'engagement',
        metric: 'bounce_rate',
        current: aggregated.engagement.bounceRate,
        baseline: baseline.chat_bounce_rate || 15,
        severity: 'WARNING'
      });
    }

    if (conversionFunnel.conversionRate < 3) {
      anomalies.push({
        agent: 'engagement',
        metric: 'conversion_rate',
        current: conversionFunnel.conversionRate,
        baseline: baseline.conversion_rate || 4.0,
        severity: 'WARNING'
      });
    }

    // Chat anomalies
    if (aggregated.chat.escalationRate > 15) {
      anomalies.push({
        agent: 'chat',
        metric: 'escalation_rate',
        current: aggregated.chat.escalationRate,
        baseline: baseline.escalation_rate || 9.4,
        severity: aggregated.chat.escalationRate > 25 ? 'CRITICAL' : 'WARNING',
        change: aggregated.chat.escalationRate - (baseline.escalation_rate || 9.4)
      });
    }

    if (aggregated.chat.sentiment.negativePercentage > 25) {
      anomalies.push({
        agent: 'chat',
        metric: 'negative_sentiment',
        current: aggregated.chat.sentiment.negativePercentage,
        baseline: baseline.negative_sentiment_pct || 15,
        severity: 'WARNING'
      });
    }

    // Quality anomalies
    if (aggregated.quality.score < 80) {
      anomalies.push({
        agent: 'quality',
        metric: 'response_quality',
        current: aggregated.quality.score,
        baseline: baseline.response_quality_score || 87,
        severity: aggregated.quality.score < 70 ? 'CRITICAL' : 'WARNING',
        change: aggregated.quality.score - (baseline.response_quality_score || 87)
      });
    }

    // Business anomalies
    if (aggregated.business.churnRate > 5) {
      anomalies.push({
        agent: 'business',
        metric: 'churn_rate',
        current: aggregated.business.churnRate,
        baseline: baseline.churn_rate || 2.8,
        severity: 'WARNING'
      });
    }

    if (aggregated.business.revenue.mrrChange < -10) {
      anomalies.push({
        agent: 'business',
        metric: 'mrr_change',
        current: aggregated.business.revenue.mrrChange,
        baseline: 0,
        severity: 'WARNING'
      });
    }

    // PM2 Health anomalies
    const pm2 = aggregated.pm2Health || {};
    if (pm2.offlineProcesses > 0) {
      anomalies.push({
        agent: 'pm2Health',
        metric: 'offline_processes',
        current: pm2.offlineProcesses,
        baseline: 0,
        severity: 'CRITICAL',
        details: pm2.downProcesses?.map(p => p.name).join(', ') || 'unknown'
      });
    }

    if ((pm2.highMemoryProcesses || []).length > 0) {
      anomalies.push({
        agent: 'pm2Health',
        metric: 'high_memory_usage',
        current: pm2.highMemoryProcesses.length,
        baseline: 0,
        severity: 'WARNING',
        details: pm2.highMemoryProcesses?.map(p => p.name).join(', ') || 'unknown'
      });
    }

    // YouTube Bot anomalies
    const youtube = aggregated.youtubeBots || {};
    if (youtube.successRate < 80 && youtube.totalPosts24h > 0) {
      anomalies.push({
        agent: 'youtubeBots',
        metric: 'upload_success_rate',
        current: youtube.successRate,
        baseline: 90,
        severity: youtube.successRate < 70 ? 'CRITICAL' : 'WARNING'
      });
    }

    // Drop Shipping Bot anomalies
    const dropshipping = aggregated.dropshippingBots || {};
    if (dropshipping.orders?.successRate < 90 && dropshipping.orders?.total > 0) {
      anomalies.push({
        agent: 'dropshippingBots',
        metric: 'order_success_rate',
        current: dropshipping.orders.successRate,
        baseline: 95,
        severity: 'WARNING'
      });
    }

    if ((dropshipping.productSync?.syncErrors || 0) > 5) {
      anomalies.push({
        agent: 'dropshippingBots',
        metric: 'product_sync_errors',
        current: dropshipping.productSync.syncErrors,
        baseline: 0,
        severity: 'WARNING'
      });
    }

    // Social Media Bot anomalies
    const social = aggregated.socialMediaBots || {};
    if (social.overallSuccessRate < 80 && social.totalPublished > 0) {
      anomalies.push({
        agent: 'socialMediaBots',
        metric: 'post_success_rate',
        current: social.overallSuccessRate,
        baseline: 90,
        severity: 'WARNING'
      });
    }

    if (social.avgEngagementRate < 5) {
      anomalies.push({
        agent: 'socialMediaBots',
        metric: 'low_engagement',
        current: social.avgEngagementRate,
        baseline: 10,
        severity: 'INFO'
      });
    }

    console.log(`[${this.name}] Detected ${anomalies.length} anomalies`);
    return anomalies;
  }

  generateRecommendations(anomalies) {
    const recommendations = [];
    const impactScores = {};

    for (const anomaly of anomalies) {
      let recommendation = null;

      // Performance recommendations
      if (anomaly.metric === 'api_latency_p99') {
        recommendation = {
          priority: 2,
          action: 'Optimize API endpoints - high latency detected',
          impact: 'High: Improves user experience',
          effort: 'Medium: 4-6 hours',
          type: 'performance'
        };
      }

      // Engagement recommendations
      if (anomaly.metric === 'bounce_rate' && anomaly.current > 30) {
        recommendation = {
          priority: 2,
          action: 'Improve onboarding flow - high bounce rate',
          impact: 'High: Could increase conversions by 5-10%',
          effort: 'Medium: 3-4 hours',
          type: 'engagement'
        };
      }

      if (anomaly.metric === 'conversion_rate' && anomaly.current < 3) {
        recommendation = {
          priority: 1,
          action: 'Add pricing FAQ and quick reply buttons',
          impact: 'Critical: 20%+ revenue impact',
          effort: 'Low: 2 hours',
          type: 'engagement'
        };
      }

      // Chat recommendations
      if (anomaly.metric === 'escalation_rate' && anomaly.current > 12) {
        recommendation = {
          priority: 1,
          action: 'Expand knowledge base - high escalations',
          impact: 'Critical: Reduce support load by 30%',
          effort: 'Low: 3-4 hours',
          type: 'chat'
        };
      }

      if (anomaly.metric === 'negative_sentiment' && anomaly.current > 20) {
        recommendation = {
          priority: 2,
          action: 'Review chat responses - negative sentiment high',
          impact: 'High: Improve user satisfaction',
          effort: 'Medium: 2-3 hours',
          type: 'chat'
        };
      }

      // Quality recommendations
      if (anomaly.metric === 'response_quality' && anomaly.current < 80) {
        recommendation = {
          priority: 2,
          action: 'Improve AI response templates',
          impact: 'High: Quality score could improve by 10-15%',
          effort: 'Medium: 4-6 hours',
          type: 'quality'
        };
      }

      // Business recommendations
      if (anomaly.metric === 'churn_rate' && anomaly.current > 4) {
        recommendation = {
          priority: 1,
          action: 'Launch retention campaign for at-risk users',
          impact: 'Critical: Save 5-10% MRR',
          effort: 'Medium: 3-5 hours',
          type: 'business'
        };
      }

      // Bot health recommendations
      if (anomaly.metric === 'offline_processes') {
        recommendation = {
          priority: 1,
          action: `Restart offline bots: ${anomaly.details}`,
          impact: 'Critical: Restore bot operations',
          effort: 'Low: 5 minutes',
          type: 'bot_health'
        };
      }

      if (anomaly.metric === 'high_memory_usage') {
        recommendation = {
          priority: 2,
          action: `Optimize memory usage for: ${anomaly.details}`,
          impact: 'Medium: Prevent crashes',
          effort: 'Medium: 2-3 hours',
          type: 'bot_health'
        };
      }

      // YouTube bot recommendations
      if (anomaly.metric === 'upload_success_rate' && anomaly.current < 80) {
        recommendation = {
          priority: 1,
          action: 'Debug YouTube upload failures',
          impact: 'High: Restore video uploads',
          effort: 'Medium: 2-4 hours',
          type: 'youtube_bot'
        };
      }

      // Drop shipping recommendations
      if (anomaly.metric === 'order_success_rate' && anomaly.current < 90) {
        recommendation = {
          priority: 1,
          action: 'Investigate order processing failures',
          impact: 'Critical: Restore sales',
          effort: 'Medium: 2-3 hours',
          type: 'dropshipping_bot'
        };
      }

      if (anomaly.metric === 'product_sync_errors') {
        recommendation = {
          priority: 2,
          action: 'Fix product inventory sync errors',
          impact: 'High: Prevent inventory issues',
          effort: 'Medium: 1-2 hours',
          type: 'dropshipping_bot'
        };
      }

      // Social media recommendations
      if (anomaly.metric === 'post_success_rate' && anomaly.current < 80) {
        recommendation = {
          priority: 1,
          action: 'Debug social media posting failures',
          impact: 'High: Restore content distribution',
          effort: 'Medium: 2-3 hours',
          type: 'social_media_bot'
        };
      }

      if (anomaly.metric === 'low_engagement') {
        recommendation = {
          priority: 3,
          action: 'Review content strategy for better engagement',
          impact: 'Medium: Improve reach',
          effort: 'High: 4-6 hours',
          type: 'social_media_bot'
        };
      }

      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by priority
    recommendations.sort((a, b) => a.priority - b.priority);

    console.log(`[${this.name}] Generated ${recommendations.length} recommendations`);
    return recommendations;
  }

  async sendDiscordAlert(aggregated, anomalies, recommendations) {
    const webhook = process.env.DISCORD_MONITORING_WEBHOOK_URL ||
                   process.env.DISCORD_ALERTS_WEBHOOK_URL;

    if (!webhook) {
      console.warn(`[${this.name}] No Discord webhook configured, skipping alert`);
      return;
    }

    // Determine color based on anomalies
    let color = 65280; // Green - healthy
    if (anomalies.length >= 2) color = 16776960; // Yellow - warning
    if (anomalies.some(a => a.severity === 'CRITICAL')) color = 16711680; // Red - critical

    const statusEmoji = color === 65280 ? '✅' : (color === 16776960 ? '⚠️' : '🚨');

    const embed = {
      title: `${statusEmoji} Wise Defense Monitoring Cycle`,
      description: `${anomalies.length} anomalies detected | ${recommendations.length} recommendations`,
      color: color,
      fields: [
        {
          name: '📊 Performance',
          value: `Uptime: ${aggregated.performance.uptime.toFixed(2)}% | API p99: ${aggregated.performance.latencies.p99}ms`,
          inline: true
        },
        {
          name: '💬 Engagement',
          value: `Sessions: ${aggregated.engagement.chatSessions} | Conversion: ${aggregated.engagement.funnel.conversionRate}%`,
          inline: true
        },
        {
          name: '⭐ Quality',
          value: `Score: ${aggregated.quality.score}/100 | Satisfaction: ${aggregated.quality.satisfaction}%`,
          inline: true
        },
        {
          name: '💰 Business',
          value: `MRR: $${Math.round(aggregated.business.revenue.mrr)} | Churn: ${aggregated.business.churnRate}%`,
          inline: true
        },
        {
          name: '⚠️  Anomalies',
          value: anomalies.length > 0
            ? anomalies.slice(0, 3).map(a => `• ${a.metric}: ${a.current} (baseline: ${a.baseline})`).join('\n')
            : 'None - all metrics healthy!',
          inline: false
        },
        {
          name: '🎯 Top Recommendation',
          value: recommendations.length > 0
            ? `${recommendations[0].action} (${recommendations[0].effort})`
            : 'No issues detected',
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'Wise Defense Monitoring System' }
    };

    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
      console.log(`[${this.name}] Discord alert sent`);
    } catch (error) {
      console.error(`[${this.name}] Failed to send Discord alert:`, error.message);
    }
  }
}

module.exports = Orchestrator;
