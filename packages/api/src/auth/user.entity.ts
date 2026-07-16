import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Session } from './session.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { EmailVerificationToken } from './email-verification-token.entity';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

@Entity('users')
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  password_hash!: string;

  @Column({ nullable: true, type: 'varchar' })
  firstName?: string;

  @Column({ nullable: true, type: 'varchar' })
  lastName?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ default: false })
  email_verified!: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  last_login_at?: Date;

  @Column({ nullable: true, type: 'timestamp' })
  password_changed_at?: Date;

  @Column({ nullable: true, type: 'varchar' })
  emailVerificationToken?: string;

  @Column({ nullable: true, type: 'varchar' })
  passwordResetToken?: string;

  @Column({ nullable: true, type: 'timestamp' })
  passwordResetExpires?: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions?: Session[];

  @OneToMany(() => PasswordResetToken, (token) => token.user, { cascade: true })
  passwordResetTokens?: PasswordResetToken[];

  @OneToMany(() => EmailVerificationToken, (token) => token.user, { cascade: true })
  emailVerificationTokens?: EmailVerificationToken[];
}
