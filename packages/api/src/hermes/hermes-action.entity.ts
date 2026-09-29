import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type HermesMode =
  | 'executive'
  | 'audit'
  | 'sales'
  | 'projects'
  | 'support'
  | 'systems';

export type HermesRisk = 'low' | 'medium' | 'high' | 'critical';

export type HermesActionStatus =
  | 'queued'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

@Entity('hermes_actions')
@Index(['tenantUserId', 'status', 'createdAt'])
@Index(['tenantUserId', 'mode', 'createdAt'])
export class HermesAction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Phase-one tenant boundary. This is always derived from the verified JWT,
   * never accepted from request input. It can be migrated to organization_id
   * once the shared workspace membership tables are made canonical.
   */
  @Column({ name: 'tenant_user_id', type: 'uuid' })
  tenantUserId!: string;

  @Column({ type: 'varchar', length: 32 })
  mode!: HermesMode;

  @Column({ type: 'varchar', length: 80 })
  kind!: string;

  @Column({ type: 'varchar', length: 16 })
  risk!: HermesRisk;

  @Column({ type: 'varchar', length: 32 })
  status!: HermesActionStatus;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  evidence!: Array<Record<string, unknown>>;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  payload!: Record<string, unknown>;

  @Column({ name: 'requires_approval', type: 'boolean', default: false })
  requiresApproval!: boolean;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejectedBy!: string | null;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt!: Date | null;

  @Column({ name: 'decision_note', type: 'text', nullable: true })
  decisionNote!: string | null;

  @Column({ name: 'executed_at', type: 'timestamp', nullable: true })
  executedAt!: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
