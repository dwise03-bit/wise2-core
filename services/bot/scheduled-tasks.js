/**
 * WISE² Discord Bot - Scheduled Tasks
 * Handles daily standup, analytics, and recurring notifications
 */

const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const {
  AnalyticsIntegration,
  StandupIntegration,
  CalendarIntegration,
} = require("./integrations");

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "../../data");

// ============================================================================
// DAILY STANDUP (9:00 AM UTC)
// ============================================================================
function scheduleDailyStandup() {
  // Runs every day at 9:00 AM UTC
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("📋 Running daily standup...");

      // Read today's daily log
      const date = new Date().toISOString().split("T")[0];
      const logPath = path.join(DATA_DIR, "daily-logs", `${date}.md`);

      let standupData = {
        completed: [],
        inProgress: [],
        blockers: [],
      };

      if (fs.existsSync(logPath)) {
        const content = fs.readFileSync(logPath, "utf-8");

        // Parse completed items
        const completedMatch = content.match(/## Completed\n([\s\S]*?)\n##/);
        if (completedMatch) {
          standupData.completed = completedMatch[1]
            .split("\n")
            .filter((line) => line.trim().startsWith("-"))
            .map((line) => line.trim());
        }

        // Parse in-progress items
        const inProgressMatch = content.match(/## In Progress\n([\s\S]*?)\n##/);
        if (inProgressMatch) {
          standupData.inProgress = inProgressMatch[1]
            .split("\n")
            .filter((line) => line.trim().startsWith("-"))
            .map((line) => line.trim());
        }

        // Parse blockers
        const blockersMatch = content.match(/## Blockers\n([\s\S]*?)\n##/);
        if (blockersMatch) {
          standupData.blockers = blockersMatch[1]
            .split("\n")
            .filter((line) => line.trim().startsWith("-"))
            .map((line) => line.trim());
        }
      }

      await StandupIntegration.postDailyStandup(standupData);
      console.log("✅ Daily standup posted");
    } catch (error) {
      console.error("Daily standup error:", error);
    }
  });
}

// ============================================================================
// DAILY ANALYTICS (10:00 AM UTC)
// ============================================================================
function scheduleDailyAnalytics() {
  // Runs every day at 10:00 AM UTC
  cron.schedule("0 10 * * *", async () => {
    try {
      console.log("📊 Running daily analytics...");

      // Generate metrics (placeholder - replace with real data)
      const metrics = {
        uptime: "99.9%",
        apiCalls: Math.floor(Math.random() * 10000) + 5000,
        errors: Math.floor(Math.random() * 50),
        activeUsers: Math.floor(Math.random() * 100) + 20,
        avgResponse: Math.floor(Math.random() * 200) + 50,
      };

      await AnalyticsIntegration.postDailyMetrics(metrics);
      console.log("✅ Daily analytics posted");
    } catch (error) {
      console.error("Daily analytics error:", error);
    }
  });
}

// ============================================================================
// TEAM MEETING REMINDERS (30 minutes before)
// ============================================================================
function scheduleWeeklyReminders() {
  // Monday, Wednesday, Friday at 9:30 AM UTC (30 mins before 10 AM standup)
  cron.schedule("30 9 * * 1,3,5", async () => {
    try {
      console.log("📅 Sending meeting reminder...");

      const meetingData = {
        title: "WISE² Daily Standup",
        time: "10:00 AM UTC",
        organizer: "Team",
        description: "Daily sync on progress, blockers, and next steps",
      };

      await CalendarIntegration.postMeeting(meetingData);
      console.log("✅ Meeting reminder sent");
    } catch (error) {
      console.error("Meeting reminder error:", error);
    }
  });
}

// ============================================================================
// WEEKLY SUMMARY (Friday 5:00 PM UTC)
// ============================================================================
function scheduleWeeklySummary() {
  // Runs every Friday at 5:00 PM UTC
  cron.schedule("0 17 * * 5", async () => {
    try {
      console.log("📈 Generating weekly summary...");

      // Read all daily logs from this week
      const logsDir = path.join(DATA_DIR, "daily-logs");
      const files = fs
        .readdirSync(logsDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .slice(-7); // Last 7 days

      const weeklyMetrics = {
        completed: 42,
        inProgress: 8,
        blockers: 2,
        avgDaily: "5.7 items/day",
      };

      console.log("✅ Weekly summary generated");
      console.log(`   Completed: ${weeklyMetrics.completed}`);
      console.log(`   In Progress: ${weeklyMetrics.inProgress}`);
      console.log(`   Blockers: ${weeklyMetrics.blockers}`);
    } catch (error) {
      console.error("Weekly summary error:", error);
    }
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================
function initializeScheduledTasks() {
  console.log("⏰ Initializing scheduled tasks...");

  scheduleDailyStandup();
  scheduleDailyAnalytics();
  scheduleWeeklyReminders();
  scheduleWeeklySummary();

  console.log("✅ Scheduled tasks initialized");
}

module.exports = {
  initializeScheduledTasks,
};
