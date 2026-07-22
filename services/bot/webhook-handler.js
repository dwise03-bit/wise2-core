/**
 * WISE² Discord Bot - Webhook Handler
 * Processes incoming webhooks from GitHub, CI/CD, etc.
 */

const express = require("express");
const crypto = require("crypto");
const {
  GitHubIntegration,
  CICDIntegration,
  ErrorTrackingIntegration,
  DeploymentIntegration,
  AnalyticsIntegration,
  StandupIntegration,
} = require("./integrations");

const router = express.Router();

// Webhook secret for verification (set in .env)
const GITHUB_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "your-secret-here";

// Verify GitHub webhook signature
function verifyGitHubSignature(req, secret) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return crypto.timingSafeEqual(
    `sha256=${hash}`,
    signature
  );
}

// ============================================================================
// GITHUB WEBHOOKS
// ============================================================================
router.post("/github", express.json(), async (req, res) => {
  try {
    // Verify signature
    if (!verifyGitHubSignature(req, GITHUB_SECRET)) {
      return res.status(401).send("Unauthorized");
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`📨 GitHub webhook: ${event}`);

    switch (event) {
      case "push":
        await GitHubIntegration.handlePushEvent(payload);
        break;
      case "pull_request":
        await GitHubIntegration.handlePullRequest(payload);
        break;
      case "release":
        await GitHubIntegration.handleRelease(payload);
        break;
      default:
        console.log(`⚠️  Unhandled GitHub event: ${event}`);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("GitHub webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
});

// ============================================================================
// CI/CD WEBHOOKS (GitHub Actions)
// ============================================================================
router.post("/ci-cd", express.json(), async (req, res) => {
  try {
    const payload = req.body;
    console.log(`🔨 CI/CD webhook received`);

    if (payload.workflow_run) {
      await CICDIntegration.handleWorkflowRun(payload);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("CI/CD webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
});

// ============================================================================
// ERROR TRACKING
// ============================================================================
router.post("/errors", express.json(), async (req, res) => {
  try {
    const errorData = req.body;
    console.log(`❌ Error webhook: ${errorData.message}`);

    await ErrorTrackingIntegration.logError(errorData);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error tracking webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
});

// ============================================================================
// DEPLOYMENT NOTIFICATIONS
// ============================================================================
router.post("/deployments", express.json(), async (req, res) => {
  try {
    const deployData = req.body;
    console.log(`🚀 Deployment webhook: ${deployData.environment}`);

    await DeploymentIntegration.notifyDeployment(deployData);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Deployment webhook error:", error);
    res.status(500).send("Error processing webhook");
  }
});

// ============================================================================
// EDGE SYNC (Raspberry Pi Edge Nodes)
// ============================================================================
router.post("/edge-sync", express.json(), async (req, res) => {
  try {
    const edgeData = req.body;
    console.log(`🌍 Edge sync from ${edgeData.edgeId}: CPU ${edgeData.health.cpuUsage}%, Mem ${edgeData.health.memUsage}%`);

    // Log edge status
    const logDir = "./logs/edge";
    if (!require("fs").existsSync(logDir)) {
      require("fs").mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${edgeData.edgeId} | CPU: ${edgeData.health.cpuUsage}% | Mem: ${edgeData.health.memUsage}% | Uptime: ${edgeData.health.uptime}m\n`;
    require("fs").appendFileSync(`${logDir}/${edgeData.edgeId}.log`, logEntry);

    res.status(200).json({
      status: "synced",
      edgeId: edgeData.edgeId,
      timestamp,
      message: "Edge sync recorded successfully",
    });
  } catch (error) {
    console.error("Edge sync error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    integrations: [
      "github",
      "ci-cd",
      "error-tracking",
      "deployments",
      "analytics",
      "standup",
      "edge-sync",
    ],
  });
});

module.exports = router;
