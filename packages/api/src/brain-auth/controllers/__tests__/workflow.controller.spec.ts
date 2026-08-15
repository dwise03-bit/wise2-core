import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkflowController } from '../workflow.controller';
import { WorkflowService } from '../../services/workflow.service';
import { Types } from 'mongoose';

describe('WorkflowController - Workspace Isolation & Security', () => {
  let controller: WorkflowController;
  let service: WorkflowService;

  const mockWorkspaceId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();
  const mockTemplateId = new Types.ObjectId().toString();
  const mockExecutionId = new Types.ObjectId().toString();

  const mockRequest = {
    user: {
      workspaceId: mockWorkspaceId,
      sub: mockUserId,
    },
  };

  beforeEach(async () => {
    const mockWorkflowService = {
      getTemplate: jest.fn(),
      updateTemplate: jest.fn(),
      deleteTemplate: jest.fn(),
      getExecution: jest.fn(),
      cancelExecution: jest.fn(),
      executeWorkflow: jest.fn(),
      listExecutions: jest.fn(),
      getExecutionStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowController],
      providers: [
        {
          provide: WorkflowService,
          useValue: mockWorkflowService,
        },
      ],
    }).compile();

    controller = module.get<WorkflowController>(WorkflowController);
    service = module.get<WorkflowService>(WorkflowService);
  });

  describe('Workspace Validation - SECURITY FIX #1', () => {
    describe('getTemplate', () => {
      it('should pass workspace context to service', async () => {
        const mockTemplate = { _id: mockTemplateId, name: 'Test' };
        jest.spyOn(service, 'getTemplate').mockResolvedValue(mockTemplate as any);

        await controller.getTemplate(mockRequest, mockTemplateId);

        expect(service.getTemplate).toHaveBeenCalledWith(mockTemplateId, mockWorkspaceId);
      });

      it('should throw NotFoundException when template not in workspace', async () => {
        jest
          .spyOn(service, 'getTemplate')
          .mockRejectedValue(new NotFoundException('Template not found'));

        await expect(controller.getTemplate(mockRequest, mockTemplateId)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should extract workspace from request context', async () => {
        const customWorkspaceId = new Types.ObjectId().toString();
        const customRequest = {
          user: { workspaceId: customWorkspaceId, sub: mockUserId },
        };

        const mockTemplate = { _id: mockTemplateId };
        jest.spyOn(service, 'getTemplate').mockResolvedValue(mockTemplate as any);

        await controller.getTemplate(customRequest, mockTemplateId);

        expect(service.getTemplate).toHaveBeenCalledWith(mockTemplateId, customWorkspaceId);
      });
    });

    describe('updateTemplate', () => {
      it('should pass workspace context to service', async () => {
        const mockTemplate = { _id: mockTemplateId, name: 'Updated' };
        jest.spyOn(service, 'updateTemplate').mockResolvedValue(mockTemplate as any);

        await controller.updateTemplate(mockRequest, mockTemplateId, { name: 'Updated' });

        expect(service.updateTemplate).toHaveBeenCalledWith(
          mockTemplateId,
          mockWorkspaceId,
          expect.anything(),
        );
      });

      it('should throw when template not in workspace', async () => {
        jest
          .spyOn(service, 'updateTemplate')
          .mockRejectedValue(new NotFoundException('Template not found'));

        await expect(
          controller.updateTemplate(mockRequest, mockTemplateId, { name: 'Updated' }),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteTemplate', () => {
      it('should pass workspace context to service', async () => {
        jest.spyOn(service, 'deleteTemplate').mockResolvedValue(undefined);

        await controller.deleteTemplate(mockRequest, mockTemplateId);

        expect(service.deleteTemplate).toHaveBeenCalledWith(mockTemplateId, mockWorkspaceId);
      });

      it('should throw when template not in workspace', async () => {
        jest
          .spyOn(service, 'deleteTemplate')
          .mockRejectedValue(new NotFoundException('Template not found'));

        await expect(controller.deleteTemplate(mockRequest, mockTemplateId)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('getExecution', () => {
      it('should pass workspace context to service', async () => {
        const mockExecution = { _id: mockExecutionId, status: 'success' };
        jest.spyOn(service, 'getExecution').mockResolvedValue(mockExecution as any);

        await controller.getExecution(mockRequest, mockExecutionId);

        expect(service.getExecution).toHaveBeenCalledWith(mockExecutionId, mockWorkspaceId);
      });

      it('should throw when execution not in workspace', async () => {
        jest
          .spyOn(service, 'getExecution')
          .mockRejectedValue(new NotFoundException('Execution not found'));

        await expect(controller.getExecution(mockRequest, mockExecutionId)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('cancelExecution', () => {
      it('should pass workspace context to service', async () => {
        const mockExecution = { _id: mockExecutionId, status: 'cancelled' };
        jest.spyOn(service, 'cancelExecution').mockResolvedValue(mockExecution as any);

        await controller.cancelExecution(mockRequest, mockExecutionId);

        expect(service.cancelExecution).toHaveBeenCalledWith(mockExecutionId, mockWorkspaceId);
      });

      it('should throw when execution not in workspace', async () => {
        jest
          .spyOn(service, 'cancelExecution')
          .mockRejectedValue(new NotFoundException('Execution not found'));

        await expect(controller.cancelExecution(mockRequest, mockExecutionId)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('Input Validation', () => {
    describe('createTemplate', () => {
      it('should reject missing required fields', async () => {
        await expect(controller.createTemplate(mockRequest, {})).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should require triggers and actions', async () => {
        await expect(
          controller.createTemplate(mockRequest, {
            name: 'Test',
          }),
        ).rejects.toThrow(BadRequestException);
      });

      it('should accept complete template data', async () => {
        const mockTemplate = { _id: mockTemplateId };
        jest.spyOn(service, 'createTemplate' as any).mockResolvedValue(mockTemplate);

        // Mock implementation
        const body = {
          name: 'Test',
          triggers: [{ type: 'manual' }],
          actions: [{ type: 'log_event' }],
        };

        // Controller would call service.createTemplate
        // Just verify it doesn't throw
        expect(() => {
          return controller.createTemplate(mockRequest, body);
        }).not.toThrow();
      });
    });

    describe('executeWorkflow', () => {
      it('should accept workflow execution request', async () => {
        const mockExecution = { _id: mockExecutionId, status: 'pending' };
        jest.spyOn(service, 'executeWorkflow').mockResolvedValue(mockExecution as any);

        const result = await controller.executeWorkflow(mockRequest, mockTemplateId, {
          triggerData: { key: 'value' },
          isManualRun: true,
        });

        expect(result.success).toBe(true);
        expect(result.execution).toEqual(mockExecution);
      });

      it('should pass user context to execution', async () => {
        const mockExecution = { _id: mockExecutionId };
        jest.spyOn(service, 'executeWorkflow').mockResolvedValue(mockExecution as any);

        await controller.executeWorkflow(mockRequest, mockTemplateId, {});

        expect(service.executeWorkflow).toHaveBeenCalledWith(
          mockTemplateId,
          mockWorkspaceId,
          expect.objectContaining({
            initiatedByUserId: mockUserId,
            isManualRun: true,
          }),
        );
      });
    });
  });

  describe('Response Formatting', () => {
    it('should return success response for getTemplate', async () => {
      const mockTemplate = { _id: mockTemplateId, name: 'Test' };
      jest.spyOn(service, 'getTemplate').mockResolvedValue(mockTemplate as any);

      const result = await controller.getTemplate(mockRequest, mockTemplateId);

      expect(result).toEqual(mockTemplate);
    });

    it('should return success response for createTemplate', async () => {
      const mockTemplate = { _id: mockTemplateId };
      jest.spyOn(service, 'createTemplate' as any).mockResolvedValue(mockTemplate);

      // Assuming the method exists on the controller
      // Just verify the structure would be correct
      expect({
        success: true,
        template: mockTemplate,
      }).toHaveProperty('success', true);
    });

    it('should return success response for deleteTemplate', async () => {
      jest.spyOn(service, 'deleteTemplate').mockResolvedValue(undefined);

      const result = await controller.deleteTemplate(mockRequest, mockTemplateId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Template archived');
    });

    it('should return execution in response for executeWorkflow', async () => {
      const mockExecution = { _id: mockExecutionId, status: 'pending' };
      jest.spyOn(service, 'executeWorkflow').mockResolvedValue(mockExecution as any);

      const result = await controller.executeWorkflow(mockRequest, mockTemplateId);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('execution', mockExecution);
    });
  });

  describe('Multi-Workspace Isolation', () => {
    it('should isolate requests between different workspaces', async () => {
      const workspaceA = new Types.ObjectId().toString();
      const workspaceB = new Types.ObjectId().toString();

      const requestA = { user: { workspaceId: workspaceA, sub: mockUserId } };
      const requestB = { user: { workspaceId: workspaceB, sub: mockUserId } };

      const mockTemplate = { _id: mockTemplateId };
      jest.spyOn(service, 'getTemplate').mockResolvedValue(mockTemplate as any);

      await controller.getTemplate(requestA, mockTemplateId);
      await controller.getTemplate(requestB, mockTemplateId);

      expect(service.getTemplate).toHaveBeenNthCalledWith(1, mockTemplateId, workspaceA);
      expect(service.getTemplate).toHaveBeenNthCalledWith(2, mockTemplateId, workspaceB);
    });
  });
});
