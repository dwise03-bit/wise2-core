/**
 * Telemetry Logger - Event logging to PostgreSQL
 */

import { Pool } from 'pg';
import { BudgetThreshold } from '../budget/engine';

export interface TelemetryEvent {
  timestamp: Date;
  project_id: string;
  agent_id: string;
  user_id: string;
  task_type: string;

  // Routing
  route_mode: string;
  actual_route: string;
  model: string;
  provider: string;

  // Usage
  input_tokens: number;
  output_tokens: number;
  context_bytes: number;
  latency_ms: number;
  estimated_cost: number;

  // Cache
  cache_hit: boolean;

  // Budget
  budget_pct_at_request: number;
  threshold: BudgetThreshold;

  // Metadata
  privacy_class: string;
  priority: string;

  // Success/failure
  success: boolean;
  error_message?: string;

  // Compliance
  prompt_hash?: string;
  response_summary?: string;
}

export class TelemetryLogger {
  private pool: Pool;
  private enabled: boolean;
  private redaction: boolean;

  constructor(pool: Pool, enabled: boolean = true, redaction: boolean = true) {
    this.pool = pool;
    this.enabled = enabled;
    this.redaction = redaction;
  }

  /**
   * Log a request/response event
   */
  async logEvent(event: TelemetryEvent): Promise<void> {
    if (!this.enabled) return;

    try {
      const query = `
        INSERT INTO ai_router_events (
          timestamp, project_id, agent_id, user_id, task_type,
          route_mode, actual_route, model, provider,
          input_tokens, output_tokens, context_bytes, latency_ms, estimated_cost,
          cache_hit, budget_pct_at_request, threshold, privacy_class, priority,
          success, error_message, prompt_hash, response_summary
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9,
          $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19,
          $20, $21, $22, $23
        )
      `;

      const values = [
        event.timestamp,
        event.project_id,
        event.agent_id,
        event.user_id,
        event.task_type,

        event.route_mode,
        event.actual_route,
        event.model,
        event.provider,

        event.input_tokens,
        event.output_tokens,
        event.context_bytes,
        event.latency_ms,
        event.estimated_cost,

        event.cache_hit,
        event.budget_pct_at_request,
        event.threshold,
        event.privacy_class,
        event.priority,

        event.success,
        event.error_message ? this.sanitizeError(event.error_message) : null,
        event.prompt_hash,
        event.response_summary,
      ];

      await this.pool.query(query, values);
    } catch (error) {
      console.error('Failed to log telemetry event:', error);
      // Don't throw - telemetry failures shouldn't break the router
    }
  }

  /**
   * Get usage statistics for a project
   */
  async getProjectUsage(projectId: string, daysBack: number = 7): Promise<any> {
    try {
      const query = `
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as requests,
          SUM(input_tokens) as total_input_tokens,
          SUM(output_tokens) as total_output_tokens,
          SUM(estimated_cost) as total_cost,
          SUM(CASE WHEN actual_route = 'LOCAL' THEN 1 ELSE 0 END) as local_count,
          SUM(CASE WHEN actual_route = 'CLOUD' THEN 1 ELSE 0 END) as cloud_count
        FROM ai_router_events
        WHERE project_id = $1
          AND timestamp > NOW() - INTERVAL '${daysBack} days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `;

      const result = await this.pool.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get project usage:', error);
      return [];
    }
  }

  /**
   * Get daily budget tracking
   */
  async getDailySpend(projectId: string, date: Date = new Date()): Promise<number> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const query = `
        SELECT SUM(estimated_cost) as total
        FROM ai_router_events
        WHERE project_id = $1
          AND DATE(timestamp) = $2::date
          AND success = true
      `;

      const result = await this.pool.query(query, [projectId, dateStr]);
      return parseFloat(result.rows[0]?.total || '0');
    } catch (error) {
      console.error('Failed to get daily spend:', error);
      return 0;
    }
  }

  /**
   * Cleanup old events (retention policy)
   */
  async cleanupOldEvents(retentionDays: number = 90): Promise<void> {
    if (!this.enabled) return;

    try {
      const query = `
        DELETE FROM ai_router_events
        WHERE timestamp < NOW() - INTERVAL '${retentionDays} days'
      `;
      await this.pool.query(query);
    } catch (error) {
      console.error('Failed to cleanup old events:', error);
    }
  }

  /**
   * Sanitize error messages to remove sensitive data
   */
  private sanitizeError(message: string): string {
    if (!this.redaction) return message;

    // Remove API keys
    message = message.replace(/api[_-]?key[=:\s]+[^\s]+/gi, 'API_KEY_REDACTED');
    message = message.replace(/sk-[a-zA-Z0-9]+/g, 'API_KEY_REDACTED');

    // Remove tokens
    message = message.replace(/token[=:\s]+[^\s]+/gi, 'TOKEN_REDACTED');

    // Remove passwords
    message = message.replace(/password[=:\s]+[^\s]+/gi, 'PASSWORD_REDACTED');

    return message;
  }
}
