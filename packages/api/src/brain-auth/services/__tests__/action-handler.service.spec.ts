import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ActionHandlerService } from '../action-handler.service';
import { WorkflowActionType, WorkflowExecutionContext } from '../../types/workflow.types';

describe('ActionHandlerService - Extensibility & Type Safety', () => {
  let service: ActionHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionHandlerService],
    }).compile();

    service = module.get<ActionHandlerService>(ActionHandlerService);
  });

  describe('Handler Registry', () => {
    it('should initialize with default handlers', () => {
      // Test by attempting to get each handler without errors
      const actionTypes = [
        WorkflowActionType.SEND_EMAIL,
        WorkflowActionType.CREATE_ENTRY,
        WorkflowActionType.UPDATE_METRICS,
        WorkflowActionType.NOTIFY_USER,
        WorkflowActionType.LOG_EVENT,
        WorkflowActionType.WEBHOOK,
        WorkflowActionType.CONDITIONAL,
        WorkflowActionType.DELAY,
      ];

      actionTypes.forEach((type) => {
        const handler = service.getHandler(type);
        expect(handler).toBeDefined();
        expect(handler.execute).toBeDefined();
      });
    });

    it('should throw for unknown handler', () => {
      expect(() => service.getHandler('unknown_type')).toThrow(BadRequestException);
    });

    it('should allow registering custom handlers', async () => {
      const customHandler = {
        execute: jest.fn().mockResolvedValue({ type: 'custom', data: 'test' }),
      };

      service.registerHandler(WorkflowActionType.SEND_EMAIL, customHandler);

      const handler = service.getHandler(WorkflowActionType.SEND_EMAIL);
      const result = await handler.execute({}, {
        triggerData: {},
        results: {},
        variables: {},
      });

      expect(customHandler.execute).toHaveBeenCalled();
      expect(result.type).toBe('custom');
    });
  });

  describe('Action Handlers - Send Email', () => {
    it('should handle send_email action', async () => {
      const handler = service.getHandler(WorkflowActionType.SEND_EMAIL);
      const config = {
        to: 'user@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('email_sent');
      expect(result.to).toBe('user@example.com');
      expect(result.subject).toBe('Test Subject');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Action Handlers - Create Entry', () => {
    it('should handle create_entry action', async () => {
      const handler = service.getHandler(WorkflowActionType.CREATE_ENTRY);
      const config = {
        title: 'New Entry',
        content: 'Entry content',
        type: 'note',
        tags: ['urgent'],
      };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('entry_created');
      expect(result.title).toBe('New Entry');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Action Handlers - Update Metrics', () => {
    it('should handle update_metrics action', async () => {
      const handler = service.getHandler(WorkflowActionType.UPDATE_METRICS);
      const config = {
        metricType: 'revenue',
        value: 1000,
        operation: 'increment',
      };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('metrics_updated');
      expect(result.metricType).toBe('revenue');
      expect(result.value).toBe(1000);
    });
  });

  describe('Action Handlers - Notify User', () => {
    it('should handle notify_user action', async () => {
      const handler = service.getHandler(WorkflowActionType.NOTIFY_USER);
      const config = {
        userId: 'user123',
        message: 'You have a new notification',
        channel: 'email',
      };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('user_notified');
      expect(result.userId).toBe('user123');
      expect(result.message).toBe('You have a new notification');
    });
  });

  describe('Action Handlers - Log Event', () => {
    it('should handle log_event action', async () => {
      const handler = service.getHandler(WorkflowActionType.LOG_EVENT);
      const config = {
        event: 'user_signup',
        properties: { userId: '123', email: 'user@example.com' },
      };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('event_logged');
      expect(result.event).toBe('user_signup');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('Action Handlers - Webhook', () => {
    it('should handle webhook action', async () => {
      const handler = service.getHandler(WorkflowActionType.WEBHOOK);
      const config = {
        url: 'https://example.com/webhook',
        method: 'POST',
        headers: { Authorization: 'Bearer token' },
        body: { key: 'value' },
      };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('webhook_called');
      expect(result.url).toBe('https://example.com/webhook');
      expect(result.method).toBe('POST');
    });
  });

  describe('Action Handlers - Conditional', () => {
    it('should evaluate true condition', async () => {
      const handler = service.getHandler(WorkflowActionType.CONDITIONAL);
      const config = {
        condition: {
          field: 'triggerData.status',
          operator: 'eq',
          value: 'active',
        },
      };
      const context: WorkflowExecutionContext = {
        triggerData: { status: 'active' },
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('condition_evaluated');
      expect(result.result).toBe(true);
    });

    it('should evaluate false condition', async () => {
      const handler = service.getHandler(WorkflowActionType.CONDITIONAL);
      const config = {
        condition: {
          field: 'triggerData.status',
          operator: 'eq',
          value: 'inactive',
        },
      };
      const context: WorkflowExecutionContext = {
        triggerData: { status: 'active' },
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);

      expect(result.type).toBe('condition_evaluated');
      expect(result.result).toBe(false);
    });

    it('should support multiple operators', async () => {
      const handler = service.getHandler(WorkflowActionType.CONDITIONAL);

      const testCases = [
        { operator: 'gt', value: 5, data: 10, expected: true },
        { operator: 'lt', value: 10, data: 5, expected: true },
        { operator: 'gte', value: 5, data: 5, expected: true },
        { operator: 'lte', value: 5, data: 5, expected: true },
        { operator: 'neq', value: 5, data: 10, expected: true },
        { operator: 'contains', value: 'test', data: 'this is a test', expected: true },
        { operator: 'in', value: [1, 2, 3], data: 2, expected: true },
      ];

      for (const testCase of testCases) {
        const config = {
          condition: {
            field: 'triggerData.value',
            operator: testCase.operator,
            value: testCase.value,
          },
        };
        const context: WorkflowExecutionContext = {
          triggerData: { value: testCase.data },
          results: {},
          variables: {},
        };

        const result = await handler.execute(config, context);
        expect(result.result).toBe(testCase.expected);
      }
    });
  });

  describe('Action Handlers - Delay', () => {
    it('should delay execution', async () => {
      const handler = service.getHandler(WorkflowActionType.DELAY);
      const config = { delayMs: 50 };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const startTime = Date.now();
      const result = await handler.execute(config, context);
      const duration = Date.now() - startTime;

      expect(result.type).toBe('delay_completed');
      expect(duration).toBeGreaterThanOrEqual(40); // Allow some variance
      expect(result.delayMs).toBe(50);
    });

    it('should use default delay', async () => {
      const handler = service.getHandler(WorkflowActionType.DELAY);
      const config = {}; // No delayMs
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const startTime = Date.now();
      const result = await handler.execute(config, context);
      const duration = Date.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(900); // Default 1000ms
    });
  });

  describe('Condition Evaluation - Edge Cases', () => {
    it('should handle nested field paths', async () => {
      const handler = service.getHandler(WorkflowActionType.CONDITIONAL);
      const config = {
        condition: {
          field: 'triggerData.user.role',
          operator: 'eq',
          value: 'admin',
        },
      };
      const context: WorkflowExecutionContext = {
        triggerData: { user: { role: 'admin' } },
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);
      expect(result.result).toBe(true);
    });

    it('should handle missing fields gracefully', async () => {
      const handler = service.getHandler(WorkflowActionType.CONDITIONAL);
      const config = {
        condition: {
          field: 'triggerData.nonexistent',
          operator: 'eq',
          value: 'value',
        },
      };
      const context: WorkflowExecutionContext = {
        triggerData: { other: 'field' },
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);
      expect(result.result).toBe(false);
    });

    it('should handle null/undefined conditions', async () => {
      const handler = service.getHandler(WorkflowActionType.CONDITIONAL);
      const config = { condition: null };
      const context: WorkflowExecutionContext = {
        triggerData: {},
        results: {},
        variables: {},
      };

      const result = await handler.execute(config, context);
      expect(result.result).toBe(true); // Default when no condition
    });
  });

  describe('Type Safety', () => {
    it('should enforce action type enum', () => {
      // This test verifies that only valid action types are accepted
      const validTypes = Object.values(WorkflowActionType);
      expect(validTypes.length).toBeGreaterThan(0);

      validTypes.forEach((type) => {
        expect(() => service.getHandler(type)).not.toThrow();
      });
    });
  });

  describe('Handler Execution Context', () => {
    it('should pass complete execution context to handlers', async () => {
      const mockHandler = {
        execute: jest.fn().mockResolvedValue({ type: 'test', success: true }),
      };

      service.registerHandler(WorkflowActionType.SEND_EMAIL, mockHandler);

      const config = { to: 'test@example.com' };
      const triggerData = { source: 'event' };
      const previousResults = new Map([['action1', { output: 'data' }]]);
      const context: WorkflowExecutionContext = {
        triggerData,
        results: Object.fromEntries(previousResults),
        variables: {},
      };

      await service.executeHandler(WorkflowActionType.SEND_EMAIL, config, context);

      expect(mockHandler.execute).toHaveBeenCalledWith(config, context);
    });
  });
});
