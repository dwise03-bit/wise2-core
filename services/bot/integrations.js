/**
 * WISE² Discord Bot - Integrations Framework
 * Handles GitHub, CI/CD, Error Tracking, Calendar, Deployments, Analytics, Standup
 */

require("dotenv").config();
const { WebhookClient, EmbedBuilder } = require("discord.js");

const WEBHOOKS = {
  deployments: process.env.DISCORD_WEBHOOK_DEPLOYMENTS,
  alerts: process.env.DISCORD_WEBHOOK_ALERTS,
  builds: process.env.DISCORD_WEBHOOK_BUILDS,
  decisions: process.env.DISCORD_WEBHOOK_DECISIONS,
  dailySync: process.env.DISCORD_WEBHOOK_DAILY_SYNC,
  status: process.env.DISCORD_WEBHOOK_STATUS,
};

// WISE² Colors
const COLORS = {
  success: 0x2cd588,
  error: 0xff5535,
  info: 0x0055ff,
  warning: 0xffa500,
};

// ============================================================================
// GITHUB INTEGRATION
// ============================================================================
class GitHubIntegration {
  static async handlePushEvent(payload) {
    const webhook = new WebhookClient({ url: WEBHOOKS.deployments });

    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle(`📌 ${payload.repository.name} - Push`)
      .addFields(
        { name: "Branch", value: payload.ref.split("/").pop(), inline: true },
        { name: "Commits", value: payload.commits.length.toString(), inline: true },
        { name: "Author", value: payload.pusher.name, inline: true },
        {
          name: "Changes",
          value: payload.commits.map((c) => `• ${c.message}`).join("\n"),
          inline: false,
        }
      )
      .setFooter({ text: "GitHub Integration" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }

  static async handlePullRequest(payload) {
    const webhook = new WebhookClient({ url: WEBHOOKS.deployments });
    const action = payload.action.toUpperCase();
    const color =
      action === "OPENED"
        ? COLORS.success
        : action === "CLOSED"
        ? COLORS.error
        : COLORS.info;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🔀 PR #${payload.pull_request.number} - ${action}`)
      .addFields(
        { name: "Title", value: payload.pull_request.title, inline: false },
        { name: "Author", value: payload.pull_request.user.login, inline: true },
        {
          name: "Changes",
          value: `+${payload.pull_request.additions} -${payload.pull_request.deletions}`,
          inline: true,
        }
      )
      .setFooter({ text: "GitHub Integration" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }

  static async handleRelease(payload) {
    const webhook = new WebhookClient({ url: WEBHOOKS.deployments });

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle(`🚀 Release ${payload.release.tag_name}`)
      .addFields(
        { name: "Version", value: payload.release.tag_name, inline: true },
        { name: "Author", value: payload.release.author.login, inline: true },
        { name: "Notes", value: payload.release.body || "No notes", inline: false }
      )
      .setFooter({ text: "GitHub Integration" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// CI/CD INTEGRATION (GitHub Actions)
// ============================================================================
class CICDIntegration {
  static async handleWorkflowRun(payload) {
    const webhook = new WebhookClient({ url: WEBHOOKS.builds });
    const status = payload.action.toUpperCase();
    const color =
      status === "COMPLETED" && payload.workflow_run.conclusion === "success"
        ? COLORS.success
        : status === "COMPLETED" && payload.workflow_run.conclusion === "failure"
        ? COLORS.error
        : COLORS.info;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🔨 ${payload.workflow.name} - ${status}`)
      .addFields(
        {
          name: "Branch",
          value: payload.workflow_run.head_branch,
          inline: true,
        },
        {
          name: "Conclusion",
          value: payload.workflow_run.conclusion || "in-progress",
          inline: true,
        },
        {
          name: "Duration",
          value: `${Math.round((payload.workflow_run.updated_at - payload.workflow_run.created_at) / 1000)}s`,
          inline: true,
        }
      )
      .setFooter({ text: "CI/CD Integration" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// ERROR TRACKING INTEGRATION
// ============================================================================
class ErrorTrackingIntegration {
  static async logError(errorData) {
    const webhook = new WebhookClient({ url: WEBHOOKS.alerts });

    const embed = new EmbedBuilder()
      .setColor(COLORS.error)
      .setTitle(`❌ Error: ${errorData.message}`)
      .addFields(
        { name: "Service", value: errorData.service || "unknown", inline: true },
        { name: "Level", value: errorData.level || "error", inline: true },
        { name: "Stack", value: `\`\`\`\n${errorData.stack.slice(0, 300)}\n\`\`\``, inline: false }
      )
      .setFooter({ text: "Error Tracking" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// CALENDAR INTEGRATION
// ============================================================================
class CalendarIntegration {
  static async postMeeting(meetingData) {
    const webhook = new WebhookClient({ url: WEBHOOKS.status });

    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle(`📅 ${meetingData.title}`)
      .addFields(
        { name: "Time", value: meetingData.time, inline: true },
        { name: "Organizer", value: meetingData.organizer, inline: true },
        { name: "Description", value: meetingData.description || "No description", inline: false }
      )
      .setFooter({ text: "Calendar Integration" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// DEPLOYMENT NOTIFICATIONS
// ============================================================================
class DeploymentIntegration {
  static async notifyDeployment(deployData) {
    const webhook = new WebhookClient({ url: WEBHOOKS.deployments });

    const embed = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle(`🚀 Deployment: ${deployData.environment}`)
      .addFields(
        { name: "Service", value: deployData.service, inline: true },
        { name: "Version", value: deployData.version, inline: true },
        { name: "Status", value: deployData.status, inline: true },
        { name: "Duration", value: deployData.duration || "N/A", inline: true }
      )
      .setFooter({ text: "Deployment Integration" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// ANALYTICS DASHBOARD
// ============================================================================
class AnalyticsIntegration {
  static async postDailyMetrics(metrics) {
    const webhook = new WebhookClient({ url: WEBHOOKS.status });

    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle("📊 Daily Metrics")
      .addFields(
        { name: "Uptime", value: metrics.uptime, inline: true },
        { name: "API Calls", value: metrics.apiCalls, inline: true },
        { name: "Errors", value: metrics.errors, inline: true },
        { name: "Active Users", value: metrics.activeUsers, inline: true },
        {
          name: "Performance",
          value: `Avg Response: ${metrics.avgResponse}ms`,
          inline: false,
        }
      )
      .setFooter({ text: "Analytics Dashboard" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// AUTOMATED DAILY STANDUP
// ============================================================================
class StandupIntegration {
  static async postDailyStandup(standupData) {
    const webhook = new WebhookClient({ url: WEBHOOKS.dailySync });

    const embed = new EmbedBuilder()
      .setColor(COLORS.info)
      .setTitle("📋 Daily Standup")
      .addFields(
        { name: "Date", value: new Date().toDateString(), inline: false },
        {
          name: "Completed",
          value: standupData.completed.join("\n") || "Nothing completed",
          inline: false,
        },
        {
          name: "In Progress",
          value: standupData.inProgress.join("\n") || "Nothing in progress",
          inline: false,
        },
        {
          name: "Blockers",
          value: standupData.blockers.join("\n") || "No blockers",
          inline: false,
        }
      )
      .setFooter({ text: "Automated Standup" })
      .setTimestamp();

    await webhook.send({ embeds: [embed] });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  GitHubIntegration,
  CICDIntegration,
  ErrorTrackingIntegration,
  CalendarIntegration,
  DeploymentIntegration,
  AnalyticsIntegration,
  StandupIntegration,
};
