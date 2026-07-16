import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

/**
 * EmailVerificationToken entity stores tokens used for email verification.
 * Tokens are one-time use and expire after 24 hours.
 */
@Entity('email_verification_tokens')
@Index(['userId'])
@Index(['token_hash'], { unique: true })
export class EmailVerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', unique: true })
  token_hash!: string;

  @Column({ type: 'timestamp' })
  expires_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_at?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.emailVerificationTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
