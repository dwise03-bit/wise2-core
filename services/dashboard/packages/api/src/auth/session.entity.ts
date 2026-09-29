import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('sessions')
@Index(['userId', 'revokedAt'])
@Index(['tokenHash'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ unique: true })
  tokenHash!: string;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true, type: 'timestamp' })
  revokedAt?: Date | null;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ type: 'jsonb', default: '{}' })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  isRevoked(): boolean {
    return this.revokedAt != null;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isActive(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  revoke(): void {
    this.revokedAt = new Date();
  }
}
