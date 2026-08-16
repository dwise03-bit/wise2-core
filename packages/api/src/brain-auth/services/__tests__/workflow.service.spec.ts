import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { WorkflowService } from '../workflow.service';
import { ActionHandlerService } from '../action-handler.service';
import { WorkflowTemplate } from '../../schemas/workflow-template.schema';
import { WorkflowExecution } from '../../schemas/workflow-execution.schema';
import { Types } from 'mongoose';

describe('WorkflowService - Security & Performance Fixes', () => {
  let service: WorkflowService;
  let actionHandlerService: ActionHandlerService;
  let mockTemplateModel: any;
  let mockExecutionModel: any;

  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockTemplateId = new Types.ObjectId().toString();
  const mockExecutionId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  beforeEach(async () => {
    mockTemplateModel = {
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      aggregate: jest.fn(),
    };

    mockExecutionModel = {
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowService,
        ActionHandlerService,
        {
          provide: getModelToken(WorkflowTemplate.name),
          useValue: mockTemplateModel,
        },
        {
          provide: getModelToken(WorkflowExecution.name),
          useValue: mockExecutionModel,
        },
      ],
    }).compile();

    service = module.get<WorkflowService>(WorkflowService);
    actionHandlerService = module.get<ActionHandlerService>(ActionHandlerService);
  });

  describe('Workspace Validation - SECURITY FIX #1', () => {
    describe('getTemplate', () => {
      it('should retrieve template only if workspace matches', async () => {
        const mockTemplate = {
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          name: 'Test Workflow',
        };

        mockTemplateModel.findOne.mockResolvedValue(mockTemplate);

        const result = await service.getTemplate(mockTemplateId, mockWorkspaceId);

        expect(mockTemplateModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
        });
        expect(result).toEqual(mockTemplate);
      });

      it('should throw NotFoundException when template not in workspace', async () => {
        mockTemplateModel.findOne.mockResolvedValue(null);

        await expect(
          service.getTemplate(mockTemplateId, mockWorkspaceId),
        ).rejects.toThrow(NotFoundException);
      });

      it('should reject template from different workspace', async () => {
        const differentWorkspaceId = new Types.ObjectId().toString();

        mockTemplateModel.findOne.mockResolvedValue(null);

        await expect(
          service.getTemplate(mockTemplateId, differentWorkspaceId),
        ).rejects.toThrow(NotFoundException);

        expect(mockTemplateModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(differentWorkspaceId),
        });
      });
    });

    describe('updateTemplate', () => {
      it('should update only if workspace matches', async () => {
        const mockTemplate = {
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          name: 'Old Name',
          version: 1,
          save: jest.fn().mockResolvedValue({ ...mockTemplate, name: 'New Name' }),
        };

        mockTemplateModel.findOne.mockResolvedValue(mockTemplate);

        const result = await service.updateTemplate(mockTemplateId, mockWorkspaceId, {
          name: 'New Name',
        });

        expect(mockTemplateModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
        });
        expect(result.name).toBe('New Name');
      });

      it('should throw when template not in workspace', async () => {
        mockTemplateModel.findOne.mockResolvedValue(null);

        await expect(
          service.updateTemplate(mockTemplateId, mockWorkspaceId, { name: 'New' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteTemplate', () => {
      it('should archive only if workspace matches', async () => {
        const mockTemplate = { _id: new Types.ObjectId(mockTemplateId) };

        mockTemplateModel.findOneAndUpdate.mockResolvedValue(mockTemplate);

        await service.deleteTemplate(mockTemplateId, mockWorkspaceId);

        expect(mockTemplateModel.findOneAndUpdate).toHaveBeenCalledWith(
          {
            _id: new Types.ObjectId(mockTemplateId),
            workspaceId: new Types.ObjectId(mockWorkspaceId),
          },
          { status: 'archived' },
        );
      });

      it('should throw when template not in workspace', async () => {
        mockTemplateModel.findOneAndUpdate.mockResolvedValue(null);

        await expect(
          service.deleteTemplate(mockTemplateId, mockWorkspaceId),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('getExecution', () => {
      it('should retrieve execution only if workspace matches', async () => {
        const mockExecution = {
          _id: new Types.ObjectId(mockExecutionId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          status: 'success',
        };

        mockExecutionModel.findOne.mockResolvedValue(mockExecution);

        const result = await service.getExecution(mockExecutionId, mockWorkspaceId);

        expect(mockExecutionModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockExecutionId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
        });
        expect(result).toEqual(mockExecution);
      });

      it('should throw when execution not in workspace', async () => {
        mockExecutionModel.findOne.mockResolvedValue(null);

        await expect(
          service.getExecution(mockExecutionId, mockWorkspaceId),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('cancelExecution', () => {
      it('should cancel only if workspace matches', async () => {
        const now = new Date();
        const mockExecution = {
          _id: new Types.ObjectId(mockExecutionId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          status: 'running',
          startedAt: new Date(now.getTime() - 5000),
          save: jest.fn().mockResolvedValue({}),
        };

        mockExecutionModel.findOne.mockResolvedValue(mockExecution);

        await service.cancelExecution(mockExecutionId, mockWorkspaceId);

        expect(mockExecutionModel.findOne).toHaveBeenCalledWith({
          _id: new Types.ObjectId(mockExecutionId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
        });
        expect(mockExecution.status).toBe('cancelled');
      });

      it('should throw when execution not in workspace', async () => {
        mockExecutionModel.findOne.mockResolvedValue(null);

        await expect(
          service.cancelExecution(mockExecutionId, mockWorkspaceId),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw when trying to cancel completed execution', async () => {
        const mockExecution = {
          _id: new Types.ObjectId(mockExecutionId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          status: 'success',
        };

        mockExecutionModel.findOne.mockResolvedValue(mockExecution);

        await expect(
          service.cancelExecution(mockExecutionId, mockWorkspaceId),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Performance Optimization - AGGREGATION FIX', () => {
    describe('getExecutionStats', () => {
      it('should use MongoDB aggregation pipeline', async () => {
        const aggregateMock = {
          exec: jest.fn().mockResolvedValue([
            {
              stats: [
                {
                  total: 100,
                  successful: 85,
                  failed: 10,
                  partial: 5,
                  avgDurationMs: 1500,
                },
              ],
              lastExecution: [{ createdAt: new Date() }],
            },
          ]),
        };

        mockExecutionModel.aggregate.mockReturnValue(aggregateMock);

        const result = await service.getExecutionStats(mockWorkspaceId);

        expect(mockExecutionModel.aggregate).toHaveBeenCalled();
        const pipeline = mockExecutionModel.aggregate.mock.calls[0][0];

        // Verify pipeline structure
        expect(pipeline[0].$match).toBeDefined();
        expect(pipeline[1].$facet).toBeDefined();
        expect(pipeline[1].$facet.stats).toBeDefined();
        expect(pipeline[1].$facet.lastExecution).toBeDefined();

        expect(result.total).toBe(100);
        expect(result.successful).toBe(85);
        expect(result.successRate).toBeCloseTo(85);
      });

      it('should filter by templateId when provided', async () => {
        const templateId = new Types.ObjectId().toString();
        const aggregateMock = {
          exec: jest.fn().mockResolvedValue([
            {
              stats: [{ total: 10, successful: 9, failed: 1, partial: 0 }],
              lastExecution: [],
            },
          ]),
        };

        mockExecutionModel.aggregate.mockReturnValue(aggregateMock);

        await service.getExecutionStats(mockWorkspaceId, templateId);

        const pipeline = mockExecutionModel.aggregate.mock.calls[0][0];
        expect(pipeline[0].$match.workflowTemplateId).toBeDefined();
      });

      it('should handle empty results gracefully', async () => {
        const aggregateMock = {
          exec: jest.fn().mockResolvedValue([]),
        };

        mockExecutionModel.aggregate.mockReturnValue(aggregateMock);

        const result = await service.getExecutionStats(mockWorkspaceId);

        expect(result.total).toBe(0);
        expect(result.successful).toBe(0);
        expect(result.successRate).toBe(0);
      });

      it('should calculate rates correctly', async () => {
        const aggregateMock = {
          exec: jest.fn().mockResolvedValue([
            {
              stats: [
                {
                  total: 200,
                  successful: 150,
                  failed: 40,
                  partial: 10,
                  avgDurationMs: 2500,
                },
              ],
              lastExecution: [{ createdAt: new Date() }],
            },
          ]),
        };

        mockExecutionModel.aggregate.mockReturnValue(aggregateMock);

        const result = await service.getExecutionStats(mockWorkspaceId);

        expect(result.successRate).toBe(75);
        expect(result.failureRate).toBeCloseTo(20);
      });
    });
  });

  describe('Action Handler Registry - EXTENSIBILITY FIX', () => {
    describe('executeAction', () => {
      it('should route to correct handler by type', async () => {
        const mockAction = {
          type: 'send_email',
          config: { to: 'test@example.com', subject: 'Test' },
        };

        const context = {
          triggerData: {},
          results: {},
          variables: {},
        };

        const result = await service.executeAction(mockAction, {}, new Map());

        expect(result.type).toBe('email_sent');
        expect(result.to).toBe('test@example.com');
      });

      it('should throw for unknown action type', async () => {
        const mockAction = {
          type: 'unknown_action_type',
          config: {},
        };

        await expect(
          service.executeAction(mockAction, {}, new Map()),
        ).rejects.toThrow(BadRequestException);
      });

      it('should pass context to handler', async () => {
        const triggerData = { from: 'event@example.com' };
        const previousResults = new Map([['action1', { result: 'value' }]]);

        const mockAction = {
          type: 'delay',
          config: { delayMs: 10 },
        };

        const result = await service.executeAction(mockAction, triggerData, previousResults);

        expect(result.type).toBe('delay_completed');
      });

      it('should handle action config correctly', async () => {
        const mockAction = {
          type: 'log_event',
          config: { event: 'user_signup', properties: { userId: '123' } },
        };

        const result = await service.executeAction(mockAction, {}, new Map());

        expect(result.type).toBe('event_logged');
        expect(result.event).toBe('user_signup');
      });
    });
  });

  describe('Error Handling - ASYNC FIX', () => {
    describe('executeWorkflow', () => {
      it('should create execution with pending status', async () => {
        const mockTemplate = {
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          name: 'Test',
          status: 'active',
          actions: [],
          triggers: [],
        };

        mockTemplateModel.findOne.mockResolvedValue(mockTemplate);
        mockExecutionModel.create = jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(mockExecutionId),
          status: 'pending',
          startedAt: new Date(),
        });

        const result = await service.executeWorkflow(mockTemplateId, mockWorkspaceId);

        expect(result.status).toBe('pending');
      });

      it('should reject inactive templates', async () => {
        const mockTemplate = {
          _id: new Types.ObjectId(mockTemplateId),
          workspaceId: new Types.ObjectId(mockWorkspaceId),
          status: 'paused',
        };

        mockTemplateModel.findOne.mockResolvedValue(mockTemplate);

        await expect(
          service.executeWorkflow(mockTemplateId, mockWorkspaceId),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Integration - Security + Performance', () => {
    it('should enforce workspace isolation during stats query', async () => {
      const workspaceA = new Types.ObjectId().toString();
      const workspaceB = new Types.ObjectId().toString();

      const aggregateMock = {
        exec: jest.fn().mockResolvedValue([
          {
            stats: [{ total: 100, successful: 90, failed: 10, partial: 0 }],
            lastExecution: [],
          },
        ]),
      };

      mockExecutionModel.aggregate.mockReturnValue(aggregateMock);

      await service.getExecutionStats(workspaceA);
      await service.getExecutionStats(workspaceB);

      expect(mockExecutionModel.aggregate).toHaveBeenCalledTimes(2);

      const firstCall = mockExecutionModel.aggregate.mock.calls[0][0];
      const secondCall = mockExecutionModel.aggregate.mock.calls[1][0];

      expect(firstCall[0].$match.workspaceId.toString()).toBe(workspaceA);
      expect(secondCall[0].$match.workspaceId.toString()).toBe(workspaceB);
    });
  });
});
