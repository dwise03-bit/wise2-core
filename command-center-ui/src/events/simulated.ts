import type { AgentEvent } from '../types/events';
import type { EventSource } from './adapter';

/**
 * Deterministic-ish mock stream. Emits a plausible Hermes-driven flow:
 *   command -> Hermes -> Planner -> Claude Agent -> GitHub (tool)
 *                                            -> QA -> Approval -> Deploy
 *
 * Used in development so animation feel can be tuned without the real
 * Hermes gateway. A WebSocketEventSource with the same shape drops in later.
 */
export class SimulatedEventSource implements EventSource {
  readonly kind = 'simulated' as const;
  private handle: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  connect(onEvent: (event: AgentEvent) => void): void {
    this.stopped = false;
    const schedule = (delay: number, factory: () => AgentEvent) => {
      this.handle = setTimeout(() => {
        if (this.stopped) return;
        onEvent(factory());
      }, delay);
    };

    const now = () => Date.now();
    let executionId = 'exec-1';

    const run = (startAt: number) => {
      let t = startAt;
      const tick = (gap: number, factory: () => AgentEvent) => {
        t += gap;
        schedule(t, factory);
      };
      executionId = `exec-${Math.floor(now() / 1000)}`;

      tick(0, () => ({
        event_id: `${executionId}-start`,
        timestamp: now(),
        event_type: 'execution.start',
        execution_id: executionId,
        source_node: 'hermes',
        message: 'Build Client Alpha a landing page.',
      }));
      tick(400, () => ({
        event_id: `${executionId}-hermes-think`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'hermes',
        status: 'THINKING',
      }));
      tick(900, () => ({
        event_id: `${executionId}-hermes-planner`,
        timestamp: now(),
        event_type: 'packet.send',
        source_node: 'hermes',
        target_node: 'planner',
        packet_kind: 'TASK',
        execution_id: executionId,
      }));
      tick(600, () => ({
        event_id: `${executionId}-planner-think`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'planner',
        status: 'EXECUTING',
      }));
      tick(1100, () => ({
        event_id: `${executionId}-planner-claude`,
        timestamp: now(),
        event_type: 'packet.send',
        source_node: 'planner',
        target_node: 'claude',
        packet_kind: 'TASK',
        execution_id: executionId,
      }));
      tick(500, () => ({
        event_id: `${executionId}-claude-think`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'claude',
        status: 'EXECUTING',
      }));
      tick(900, () => ({
        event_id: `${executionId}-claude-github`,
        timestamp: now(),
        event_type: 'packet.send',
        source_node: 'claude',
        target_node: 'github',
        packet_kind: 'TOOL_CALL',
        execution_id: executionId,
      }));
      tick(700, () => ({
        event_id: `${executionId}-github-result`,
        timestamp: now(),
        event_type: 'packet.send',
        source_node: 'github',
        target_node: 'claude',
        packet_kind: 'RESULT',
        execution_id: executionId,
      }));
      tick(800, () => ({
        event_id: `${executionId}-claude-qa`,
        timestamp: now(),
        event_type: 'packet.send',
        source_node: 'claude',
        target_node: 'qa',
        packet_kind: 'TASK',
        execution_id: executionId,
      }));
      tick(600, () => ({
        event_id: `${executionId}-qa-think`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'qa',
        status: 'EXECUTING',
      }));
      tick(1000, () => ({
        event_id: `${executionId}-qa-approval`,
        timestamp: now(),
        event_type: 'approval.request',
        source_node: 'qa',
        target_node: 'approval',
        packet_kind: 'APPROVAL',
        execution_id: executionId,
      }));
      tick(300, () => ({
        event_id: `${executionId}-approval-pending`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'approval',
        status: 'APPROVAL',
      }));
      tick(1800, () => ({
        event_id: `${executionId}-approval-ok`,
        timestamp: now(),
        event_type: 'approval.resolve',
        source_node: 'approval',
        target_node: 'deploy',
        packet_kind: 'APPROVAL',
        execution_id: executionId,
        metadata: { outcome: 'approved' },
      }));
      tick(500, () => ({
        event_id: `${executionId}-deploy-exec`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'deploy',
        status: 'EXECUTING',
      }));
      tick(1200, () => ({
        event_id: `${executionId}-deploy-done`,
        timestamp: now(),
        event_type: 'execution.complete',
        source_node: 'deploy',
        execution_id: executionId,
        metadata: { duration_ms: t },
      }));
      tick(400, () => ({
        event_id: `${executionId}-reset`,
        timestamp: now(),
        event_type: 'node.status',
        source_node: 'hermes',
        status: 'ONLINE',
      }));

      this.handle = setTimeout(() => {
        if (!this.stopped) run(0);
      }, t + 1500);
    };

    run(400);
  }

  disconnect(): void {
    this.stopped = true;
    if (this.handle) clearTimeout(this.handle);
    this.handle = null;
  }
}
