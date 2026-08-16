import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkflowExecutionDocument = Document & WorkflowExecution;

export interface ActionExecution {
  actionId: string;
  actionType: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  retryCount: number;
}

@Schema({ timestamps: true })
export class WorkflowExecution {
  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  workflowTemplateId!: Types.ObjectId;

  @Prop({ required: true })
  workflowName!: string;

  @Prop({ default: 'pending' })
  status!: 'pending' | 'running' | 'success' | 'failed' | 'partial' | 'cancelled';

  @Prop()
  triggeredBy?: string; // trigger type or user

  @Prop({ type: Types.ObjectId })
  triggeredByUserId?: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  triggerData?: Record<string, any>;

  @Prop({ type: [Object], default: [] })
  actionExecutions!: ActionExecution[];

  @Prop()
  startedAt!: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  durationMs?: number;

  @Prop({ default: 0 })
  successCount!: number;

  @Prop({ default: 0 })
  failureCount!: number;

  @Prop({ default: 0 })
  skippedCount!: number;

  @Prop()
  error?: {
    message: string;
    code: string;
    actionId?: string;
    details?: Record<string, any>;
  };

  @Prop({ type: Object, default: {} })
  context?: Record<string, any>;

  @Prop({ type: Object, default: {} })
  output?: Record<string, any>;

  @Prop({ default: 0 })
  retryCount!: number;

  @Prop()
  nextRetryAt?: Date;

  @Prop({ default: false })
  isManualRun!: boolean;

  @Prop({ type: Types.ObjectId })
  initiatedBy?: Types.ObjectId; // user who manually triggered

  @Prop({ type: Object, default: {} })
  metrics?: {
    totalActions: number;
    parallelActions: number;
    criticalPath: number; // longest chain duration
    efficiency: number; // 0-100 score
  };

  @Prop({ type: [String], default: [] })
  logs!: string[];
}

export const WorkflowExecutionSchema = SchemaFactory.createForClass(WorkflowExecution);

// Indexes
WorkflowExecutionSchema.index({ workspaceId: 1, status: 1 });
WorkflowExecutionSchema.index({ workflowTemplateId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ status: 1, startedAt: -1 });
WorkflowExecutionSchema.index({ triggeredByUserId: 1, createdAt: -1 });
WorkflowExecutionSchema.index({ workspaceId: 1, completedAt: -1 });
WorkflowExecutionSchema.index({ nextRetryAt: 1 });
