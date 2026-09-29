/**
 * Metrics API Routes
 * Provides endpoints for storing and retrieving system, user, and production metrics
 */

import { Router, Request, Response } from 'express';
import { database } from '../database';
import { logger } from '../logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// System Metrics Endpoint
// ============================================================================

/**
 * POST /api/v1/metrics/system
 * Store system metrics (git, docker, nginx, database)
 */
router.post('/system', async (req: Request, res: Response) => {
  try {
    const {
      git,
      docker,
      nginx,
      database: dbMetrics,
      timestamp,
    } = req.body;

    if (!git && !docker && !nginx && !dbMetrics) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_METRICS',
          message: 'At least one metric type must be provided',
        },
      });
    }

    // Store git metrics
    if (git) {
      try {
        await database.query(
          `INSERT INTO system_metrics (metric_type, git_branch, git_total_commits, git_status, raw_data, collected_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'git',
            git.branch || null,
            git.totalCommits || null,
            typeof git.status === 'string' ? git.status : 'dirty',
            JSON.stringify(git),
            new Date(timestamp || Date.now()),
          ],
        );
      } catch (error) {
        logger.error('Failed to store git metrics', { error });
      }
    }

    // Store docker metrics
    if (docker && docker.available) {
      try {
        await database.query(
          `INSERT INTO system_metrics (metric_type, docker_running_containers, docker_total_containers, raw_data, collected_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            'docker',
            docker.status?.running || null,
            docker.status?.total || null,
            JSON.stringify(docker),
            new Date(timestamp || Date.now()),
          ],
        );
      } catch (error) {
        logger.error('Failed to store docker metrics', { error });
      }
    }

    // Store nginx metrics
    if (nginx && nginx.available) {
      try {
        const accessLog = nginx.accessLog || {};
        await database.query(
          `INSERT INTO system_metrics (metric_type, nginx_available, nginx_requests_count, nginx_error_rate, raw_data, collected_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'nginx',
            true,
            accessLog.total || null,
            typeof accessLog.errorRate === 'number' ? accessLog.errorRate : null,
            JSON.stringify(nginx),
            new Date(timestamp || Date.now()),
          ],
        );
      } catch (error) {
        logger.error('Failed to store nginx metrics', { error });
      }
    }

    // Store database metrics
    if (dbMetrics && dbMetrics.available) {
      try {
        const pool = dbMetrics.connectionPool || {};
        const cache = dbMetrics.cacheHitRatio || {};
        await database.query(
          `INSERT INTO system_metrics (metric_type, database_connections_active, database_connections_idle, database_cache_hit_ratio, raw_data, collected_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'database',
            pool.active_connections || null,
            pool.idle_connections || null,
            cache.cacheHitRatio || null,
            JSON.stringify(dbMetrics),
            new Date(timestamp || Date.now()),
          ],
        );
      } catch (error) {
        logger.error('Failed to store database metrics', { error });
      }
    }

    logger.info('System metrics stored successfully', {
      timestamp,
      types: [git ? 'git' : null, docker ? 'docker' : null, nginx ? 'nginx' : null, dbMetrics ? 'database' : null].filter(Boolean),
    });

    return res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        message: 'Metrics stored successfully',
      },
    });
  } catch (error) {
    logger.error('Failed to store system metrics', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_STORAGE_ERROR',
        message: 'Failed to store metrics',
      },
    });
  }
});

/**
 * GET /api/v1/metrics/system
 * Retrieve latest system metrics
 */
router.get('/system', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const type = (req.query.type as string) || null;

    let query = `
      SELECT * FROM system_metrics
      ${type ? 'WHERE metric_type = $1' : ''}
      ORDER BY collected_at DESC
      LIMIT $${type ? '2' : '1'}
    `;

    const params: any[] = [];
    if (type) params.push(type);
    params.push(limit);

    const result = await database.query(query, params);

    res.json({
      success: true,
      data: {
        metrics: result.rows,
        count: result.rowCount,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve system metrics', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_RETRIEVAL_ERROR',
        message: 'Failed to retrieve metrics',
      },
    });
  }
});

// ============================================================================
// User Events Endpoint
// ============================================================================

/**
 * POST /api/v1/metrics/users/events
 * Track user activity events
 */
router.post('/users/events', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      eventType,
      eventCategory,
      action,
      resourceId,
      resourceType,
      durationSeconds,
      status,
      metadata,
      sessionId,
      requestId,
      startedAt,
      completedAt,
    } = req.body;

    if (!userId || !eventType || !eventCategory || !action) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'userId, eventType, eventCategory, and action are required',
        },
      });
    }

    const eventId = uuidv4();

    await database.query(
      `INSERT INTO user_events (
        id, user_id, event_type, event_category, action, status, resource_id, resource_type,
        duration_seconds, metadata, session_id, request_id, started_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        eventId,
        userId,
        eventType,
        eventCategory,
        action,
        status || 'completed',
        resourceId || null,
        resourceType || null,
        durationSeconds || null,
        JSON.stringify(metadata || {}),
        sessionId || null,
        requestId || null,
        startedAt ? new Date(startedAt) : null,
        completedAt ? new Date(completedAt) : null,
      ],
    );

    logger.info('User event tracked', {
      eventId,
      userId,
      eventType,
      eventCategory,
      action,
    });

    return res.json({
      success: true,
      data: {
        eventId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Failed to track user event', { error });
    return res.status(500).json({
      success: false,
      error: {
        code: 'EVENT_TRACKING_ERROR',
        message: 'Failed to track event',
      },
    });
  }
});

/**
 * GET /api/v1/metrics/users
 * Get user activity metrics
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;

    const result = await database.query(
      `SELECT
        DATE(created_at) as day,
        COUNT(DISTINCT user_id) as active_users,
        COUNT(*) as total_events,
        COUNT(DISTINCT session_id) as sessions
      FROM user_events
      WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
      GROUP BY DATE(created_at)
      ORDER BY day DESC`,
      [days],
    );

    res.json({
      success: true,
      data: {
        metrics: result.rows,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve user metrics', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_RETRIEVAL_ERROR',
        message: 'Failed to retrieve metrics',
      },
    });
  }
});

// ============================================================================
// Production Metrics Endpoint
// ============================================================================

/**
 * GET /api/v1/metrics/production
 * Get production metrics by type
 */
router.get('/production', async (req: Request, res: Response) => {
  try {
    const productionType = (req.query.type as string) || null;
    const days = parseInt(req.query.days as string) || 7;

    let query = `
      SELECT
        DATE(completed_at) as day,
        event_category as production_type,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(duration_seconds) as avg_duration_seconds
      FROM user_events
      WHERE completed_at IS NOT NULL
        AND completed_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
        ${productionType ? 'AND event_category = $2' : ''}
      GROUP BY DATE(completed_at), event_category
      ORDER BY day DESC
    `;

    const params: any[] = [days];
    if (productionType) params.push(productionType);

    const result = await database.query(query, params);

    res.json({
      success: true,
      data: {
        metrics: result.rows,
        period: `Last ${days} days`,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve production metrics', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_RETRIEVAL_ERROR',
        message: 'Failed to retrieve metrics',
      },
    });
  }
});

// ============================================================================
// Dashboard Aggregation Endpoint
// ============================================================================

/**
 * GET /api/v1/metrics/dashboard
 * Get all aggregated metrics for dashboard display
 */
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    // Get today's active users
    const activeUsersResult = await database.query(
      `SELECT COUNT(DISTINCT user_id) as active_users
       FROM user_events
       WHERE DATE(created_at) = CURRENT_DATE`,
    );

    // Get this week's productions
    const productionsResult = await database.query(
      `SELECT event_category, COUNT(*) as count
       FROM user_events
       WHERE completed_at IS NOT NULL
         AND DATE(completed_at) >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY event_category`,
    );

    // Get latest system uptime
    const uptimeResult = await database.query(
      `SELECT raw_data -> 'daemon' ->> 'SystemUptime' as uptime
       FROM system_metrics
       WHERE metric_type = 'docker'
       ORDER BY collected_at DESC
       LIMIT 1`,
    );

    // Get latest git deployment
    const deploymentResult = await database.query(
      `SELECT
        (raw_data ->> 'lastCommit')::json ->> 'hash' as commit_hash,
        (raw_data ->> 'lastCommit')::json ->> 'timestamp' as deployment_time,
        raw_data ->> 'branch' as branch
       FROM system_metrics
       WHERE metric_type = 'git'
       ORDER BY collected_at DESC
       LIMIT 1`,
    );

    // Get error summary
    const errorsResult = await database.query(
      `SELECT severity, COUNT(*) as count
       FROM error_metrics
       WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
       GROUP BY severity`,
    );

    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        summary: {
          activeUsersToday: activeUsersResult.rows[0]?.active_users || 0,
          productionsThisWeek: productionsResult.rows.reduce((sum, row) => sum + (row.count || 0), 0),
          systemStatus: uptimeResult.rows[0]?.uptime || 'unknown',
          lastDeployment: deploymentResult.rows[0] || null,
          recentErrors: errorsResult.rows || [],
        },
        productions: productionsResult.rows,
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve dashboard metrics', { error });
    res.status(500).json({
      success: false,
      error: {
        code: 'METRICS_RETRIEVAL_ERROR',
        message: 'Failed to retrieve metrics',
      },
    });
  }
});

export default router;
