import { FollowUpType, FollowUpStatus } from '@prisma/client';

export interface CreateFollowUpDto {
  followUpType: FollowUpType;
  relatedEntityType: string;
  relatedEntityId: string;
  assignedTo?: string;
  message?: string;
  priority?: number;
  dueAt: Date;
}

export interface UpdateFollowUpDto {
  followUpType?: FollowUpType;
  assignedTo?: string;
  message?: string;
  priority?: number;
  dueAt?: Date;
  status?: FollowUpStatus;
  completedAt?: Date;
}

export interface ListFollowUpsFilter {
  status?: FollowUpStatus;
  assignedTo?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  limit?: number;
  offset?: number;
}
