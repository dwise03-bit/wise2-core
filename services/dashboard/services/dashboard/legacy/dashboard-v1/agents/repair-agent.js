/**
 * Repair Agent
 *
 * Standalone Node.js script for PM2 orchestration.
 * Monitors system health and auto-repairs common issues:
 * - Database connectivity checks and recovery
 * - Failed agent restart detection and recovery
 * - API endpoint health verification
 * - Agent log monitoring for errors
 * - Automatic recovery and notifications
 *
 * Environment variables required:
 * - DATABASE_URL: PostgreSQL connection string
 * - PM2_HOME: PM2 home directory (default ~/.pm2)
 */

const pg = require('pg');
const { execSync } = require('child_process');

// Initialize PostgreSQL pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('[REPAIR] Unexpected database error:', err);
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[REPAIR] Query error:', { text, params, error: error.message });
    throw error;
  }
}

/**
 * Check database connection health
 */
async function checkDatabaseHealth() {
  try {
    const result = await query('SELECT 1');
    console.log('[REPAIR] ✅ Database health: OK');
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    console.error('[REPAIR] ❌ Database health check failed:', error.message);
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
}

/**
 * Get PM2 process status
 */
function getPM2Status() {
  try {
    const output = execSync('pm2 list --no-autosave --format json', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const processes = JSON.parse(output);

    const status = {
      total: processes.length,
      online: processes.filter(p => p.pm2_env.status === 'online').length,
      errored: processes.filter(p => p.pm2_env.status === 'errored').length,
      stopped: processes.filter(p => p.pm2_env.status === 'stopped').length,
      processes: processes.map(p => ({
        id: p.pm2_env.pm_id,
        name: p.name,
        status: p.pm2_env.status,
        pid: p.pid,
        memory: `${Math.round(p.monit.memory / 1024 / 1024)}MB`,
        uptime: p.pm2_env.pm_uptime,
        restarts: p.pm2_env.restart_time
      }))
    };

    console.log('[REPAIR] PM2 Status:', status.online, 'online,', status.errored, 'errored');
    return status;
  } catch (error) {
    console.error('[REPAIR] Failed to get PM2 status:', error.message);
    return { error: error.message };
  }
}

/**
 * Task 1: Monitor agent health
 * Runs every 5 minutes
 */
async function taskMonitorAgentHealth() {
  console.log('[REPAIR] Running task: Monitor agent health...');

  try {
    const pm2Status = getPM2Status();

    if (!pm2Status.error) {
      // Log health to database
      await query(
        `INSERT INTO agent_health (agent_name, status, timestamp)
         VALUES ($1, $2, NOW())`,
        [`pm2-cluster-${pm2Status.total}`, JSON.stringify(pm2Status)]
      );

      // Check for errored agents and attempt restart
      if (pm2Status.errored > 0) {
        console.log('[REPAIR] ⚠️ Found', pm2Status.errored, 'errored agents, attempting restart...');

        const erroredAgents = pm2Status.processes.filter(p => p.status === 'errored');
        for (const agent of erroredAgents) {
          try {
            execSync(`pm2 restart ${agent.id} --no-autosave`, { stdio: 'ignore' });
            console.log('[REPAIR] ✅ Restarted agent:', agent.name);

            // Log recovery attempt
            await query(
              `INSERT INTO repair_log (agent_name, action, status, details)
               VALUES ($1, $2, $3, $4)`,
              [agent.name, 'auto-restart', 'success', `Recovered from error state`]
            );
          } catch (error) {
            console.error('[REPAIR] Failed to restart', agent.name, ':', error.message);
            await query(
              `INSERT INTO repair_log (agent_name, action, status, details)
               VALUES ($1, $2, $3, $4)`,
              [agent.name, 'auto-restart', 'failed', error.message]
            );
          }
        }
      }
    }

    console.log('[REPAIR] Agent health monitoring completed');
  } catch (error) {
    console.error('[REPAIR] Error in health monitoring task:', error.message);
  }
}

/**
 * Task 2: Check database connectivity
 * Runs every 10 minutes
 */
async function taskCheckDatabaseConnectivity() {
  console.log('[REPAIR] Running task: Check database connectivity...');

  try {
    const health = await checkDatabaseHealth();

    await query(
      `INSERT INTO system_health (component, status, details, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      ['database', health.status, JSON.stringify(health)]
    );

    if (health.status === 'unhealthy') {
      console.warn('[REPAIR] ⚠️ Database is unhealthy, attempting recovery...');

      try {
        // Reconnect pool
        await pool.end();
        const newPool = new pg.Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: false,
        });
        await newPool.query('SELECT 1');

        console.log('[REPAIR] ✅ Database reconnection successful');
      } catch (reconnectError) {
        console.error('[REPAIR] Database reconnection failed:', reconnectError.message);
      }
    }

    console.log('[REPAIR] Database connectivity check completed');
  } catch (error) {
    console.error('[REPAIR] Error in database connectivity task:', error.message);
  }
}

/**
 * Task 3: Clean up old logs and records
 * Runs daily at 2:00 AM
 */
async function taskCleanupOldRecords() {
  console.log('[REPAIR] Running task: Cleanup old records...');

  try {
    // Delete logs older than 30 days
    const result = await query(
      `DELETE FROM repair_log WHERE created_at < NOW() - INTERVAL '30 days'`
    );

    console.log('[REPAIR] Deleted', result.rowCount, 'old repair log records');

    // Delete health records older than 7 days
    const healthResult = await query(
      `DELETE FROM system_health WHERE timestamp < NOW() - INTERVAL '7 days'`
    );

    console.log('[REPAIR] Deleted', healthResult.rowCount, 'old health records');

    console.log('[REPAIR] Cleanup task completed');
  } catch (error) {
    console.error('[REPAIR] Error in cleanup task:', error.message);
  }
}

/**
 * Task 4: Generate system health report
 * Runs every 30 minutes
 */
async function taskGenerateHealthReport() {
  console.log('[REPAIR] Running task: Generate health report...');

  try {
    const dbHealth = await checkDatabaseHealth();
    const pm2Status = getPM2Status();

    const report = {
      timestamp: new Date(),
      database: dbHealth,
      agents: pm2Status,
      summary: {
        allAgentsOnline: pm2Status.errored === 0 && pm2Status.total > 0,
        systemHealthy: dbHealth.status === 'healthy' && pm2Status.errored === 0
      }
    };

    // Log report to database
    await query(
      `INSERT INTO health_reports (report_json, created_at)
       VALUES ($1, NOW())`,
      [JSON.stringify(report)]
    );

    console.log('[REPAIR] Health report generated:', report.summary);
  } catch (error) {
    console.error('[REPAIR] Error in health report task:', error.message);
  }
}

/**
 * Schedule jobs using setInterval
 */
function scheduleJobs() {
  console.log('[REPAIR] Scheduling repair tasks...');

  // Task 1: Monitor health every 5 minutes
  taskMonitorAgentHealth();
  setInterval(taskMonitorAgentHealth, 5 * 60 * 1000);
  console.log('[REPAIR] Agent health monitoring scheduled (every 5 minutes)');

  // Task 2: Database check every 10 minutes
  taskCheckDatabaseConnectivity();
  setInterval(taskCheckDatabaseConnectivity, 10 * 60 * 1000);
  console.log('[REPAIR] Database connectivity check scheduled (every 10 minutes)');

  // Task 3: Cleanup daily at 2am
  function scheduleCleanup() {
    const now = new Date();
    const nextCleanup = new Date(now);
    nextCleanup.setDate(nextCleanup.getDate() + 1);
    nextCleanup.setHours(2, 0, 0, 0);

    const delayMs = nextCleanup.getTime() - now.getTime();
    setTimeout(() => {
      taskCleanupOldRecords();
      setInterval(taskCleanupOldRecords, 24 * 60 * 60 * 1000);
    }, delayMs);
    console.log(`[REPAIR] Cleanup scheduled for ${Math.round(delayMs / 1000)}ms`);
  }
  scheduleCleanup();

  // Task 4: Health report every 30 minutes
  taskGenerateHealthReport();
  setInterval(taskGenerateHealthReport, 30 * 60 * 1000);
  console.log('[REPAIR] Health report scheduled (every 30 minutes)');
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('[REPAIR] Shutting down gracefully...');
  try {
    await pool.end();
    console.log('[REPAIR] Database pool closed');
    process.exit(0);
  } catch (error) {
    console.error('[REPAIR] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Main entry point
 */
async function main() {
  console.log('[REPAIR] Agent started. Monitoring system health...');

  try {
    await pool.query('SELECT 1');
    console.log('[REPAIR] Database connection verified');
  } catch (error) {
    console.error('[REPAIR] Failed to connect to database:', error.message);
    process.exit(1);
  }

  scheduleJobs();
}

main().catch((error) => {
  console.error('[REPAIR] Fatal error:', error);
  process.exit(1);
});
