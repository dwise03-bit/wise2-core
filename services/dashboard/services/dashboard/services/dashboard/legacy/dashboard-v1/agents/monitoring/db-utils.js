// Database utilities for monitoring agents
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wisedefense',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client', err);
    });
  }
  return pool;
}

async function query(text, params = []) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function logCycle(cycleData) {
  try {
    const result = await query(`
      INSERT INTO monitoring_cycles (
        cycle_number,
        cycle_timestamp,
        cycle_duration_seconds,
        uptime_percentage,
        web_vitals_lcp,
        api_latency_p99,
        chat_sessions,
        conversion_rate,
        escalation_rate,
        response_quality_score,
        user_satisfaction_pct,
        mrr,
        churn_rate,
        anomalies_detected,
        anomalies_data,
        recommendations_count,
        recommendations_data,
        cycle_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      cycleData.cycleNumber,
      cycleData.timestamp,
      cycleData.duration,
      cycleData.performance?.uptime,
      cycleData.performance?.webVitals?.lcp,
      cycleData.performance?.latencies?.p99,
      cycleData.engagement?.chatSessions,
      cycleData.engagement?.conversionRate,
      cycleData.chat?.escalationRate,
      cycleData.quality?.score,
      cycleData.quality?.satisfaction,
      cycleData.business?.mrr,
      cycleData.business?.churnRate,
      cycleData.anomalies?.length || 0,
      JSON.stringify(cycleData.anomalies || []),
      cycleData.recommendations?.length || 0,
      JSON.stringify(cycleData.recommendations || []),
      cycleData.status || 'COMPLETE'
    ]);

    return result.rows[0].id;
  } catch (error) {
    console.error('[DB] Failed to log cycle:', error);
    throw error;
  }
}

async function getLatestCycle() {
  try {
    const result = await query(`
      SELECT * FROM monitoring_cycles
      ORDER BY cycle_timestamp DESC
      LIMIT 1
    `);
    return result.rows[0];
  } catch (error) {
    console.error('[DB] Failed to get latest cycle:', error);
    return null;
  }
}

async function getCycleHistory(days = 7) {
  try {
    const result = await query(`
      SELECT * FROM monitoring_cycles
      WHERE cycle_timestamp > NOW() - INTERVAL '${days} days'
      ORDER BY cycle_timestamp DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('[DB] Failed to get cycle history:', error);
    return [];
  }
}

module.exports = {
  pool: getPool,
  query,
  logCycle,
  getLatestCycle,
  getCycleHistory
};
