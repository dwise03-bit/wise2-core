import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  FOUNDER = 'FOUNDER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

@Entity('User')
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, type: 'text' })
  email!: string;

  @Column({ name: 'passwordHash', type: 'text' })
  password_hash!: string;

  @Column({ nullable: true, type: 'text' })
  name?: string;

  get firstName(): string | undefined {
    return this.name?.split(' ')[0];
  }

  get lastName(): string | undefined {
    const parts = this.name?.split(' ');
    return parts && parts.length > 1 ? parts.slice(1).join(' ') : undefined;
  }

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @Column({ name: 'createdAt' })
  created_at!: Date;

  @Column({ name: 'updatedAt' })
  updated_at!: Date;
}
