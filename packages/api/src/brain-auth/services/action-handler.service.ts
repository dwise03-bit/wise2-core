import { Injectable, BadRequestException } from '@nestjs/common';
import { WorkflowActionType, WorkflowExecutionContext } from '../types/workflow.types';
import { IActionHandler } from '../interfaces/action-handler.interface';

@Injectable()
export class ActionHandlerService {
  private handlers: Map<WorkflowActionType, IActionHandler> = new Map();

  constructor() {
    this.registerDefaultHandlers();
  }

  /**
   * Register default handlers
   */
  private registerDefaultHandlers(): void {
    // Default implementations
    this.handlers.set(WorkflowActionType.SEND_EMAIL, {
      execute: async (config: any, context: WorkflowExecutionContext) => ({
        type: 'email_sent',
        to: config.to,
        subject: config.subject,
        timestamp: new Date(),
      }),
    });

    this.handlers.set(WorkflowActionType.CREATE_ENTRY, {
      execute: async (config: any, context: WorkflowExecutionContext) => ({
        type: 'entry_created',
        title: config.title,
        timestamp: new Date(),
      }),
    });

    this.handlers.set(WorkflowActionType.UPDATE_METRICS, {
      execute: async (config: any, context: WorkflowExecutionContext) => ({
        type: 'metrics_updated',
        metricType: config.metricType,
        value: config.value,
        timestamp: new Date(),
      }),
    });

    this.handlers.set(WorkflowActionType.NOTIFY_USER, {
      execute: async (config: any, context: WorkflowExecutionContext) => ({
        type: 'user_notified',
        userId: config.userId,
        message: config.message,
        timestamp: new Date(),
      }),
    });

    this.handlers.set(WorkflowActionType.LOG_EVENT, {
      execute: async (config: any, context: WorkflowExecutionContext) => ({
        type: 'event_logged',
        event: config.event,
        timestamp: new Date(),
      }),
    });

    this.handlers.set(WorkflowActionType.WEBHOOK, {
      execute: async (config: any, context: WorkflowExecutionContext) => ({
        type: 'webhook_called',
        url: config.url,
        method: config.method || 'POST',
        timestamp: new Date(),
      }),
    });

    this.handlers.set(WorkflowActionType.CONDITIONAL, {
      execute: async (config: any, context: WorkflowExecutionContext) => {
        const condition = config.condition;
        const conditionMet = this.evaluateCondition(condition, context);
        return {
          type: 'condition_evaluated',
          condition,
          result: conditionMet,
          timestamp: new Date(),
        };
      },
    });

    this.handlers.set(WorkflowActionType.DELAY, {
      execute: async (config: any, context: WorkflowExecutionContext) => {
        const delayMs = config.delayMs || 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return {
          type: 'delay_completed',
          delayMs,
          timestamp: new Date(),
        };
      },
    });
  }

  /**
   * Get handler by action type
   */
  getHandler(actionType: string): IActionHandler {
    const handler = this.handlers.get(actionType as WorkflowActionType);
    if (!handler) {
      throw new BadRequestException(`Unknown action type: ${actionType}`);
    }
    return handler;
  }

  /**
   * Register custom handler
   */
  registerHandler(actionType: WorkflowActionType, handler: IActionHandler): void {
    this.handlers.set(actionType, handler);
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: any, context: WorkflowExecutionContext): boolean {
    if (!condition) return true;
    if (condition.field && condition.operator && condition.value !== undefined) {
      const fieldValue = this.getNestedValue(context, condition.field);
      return this.compareValues(fieldValue, condition.operator, condition.value);
    }
    return true;
  }

  /**
   * Get nested value from context
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * Compare values
   */
  private compareValues(a: any, op: string, b: any): boolean {
    switch (op) {
      case 'eq':
        return a === b;
      case 'neq':
        return a !== b;
      case 'gt':
        return a > b;
      case 'gte':
        return a >= b;
      case 'lt':
        return a < b;
      case 'lte':
        return a <= b;
      case 'contains':
        return String(a).includes(String(b));
      case 'in':
        return Array.isArray(b) && b.includes(a);
      default:
        return true;
    }
  }
}
