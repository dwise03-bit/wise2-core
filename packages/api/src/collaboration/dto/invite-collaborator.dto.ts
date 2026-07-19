import { IsEmail, IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for sending project invitations
 * Validates request body for POST /projects/:id/invite
 */
export class InviteCollaboratorDto {
  @ApiProperty({
    description: 'Email address of the person to invite',
    example: 'collaborator@example.com',
  })
  @IsEmail()
  invitedEmail: string;

  @ApiProperty({
    description: 'Role to assign to the collaborator',
    enum: ['EDITOR', 'VIEWER'],
    example: 'EDITOR',
  })
  @IsEnum(['EDITOR', 'VIEWER'])
  role: 'EDITOR' | 'VIEWER';

  @ApiProperty({
    description: 'Optional expiration date for the invite',
    example: '2026-07-26T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiProperty({
    description: 'Optional custom message to include in invite email',
    example: 'Looking forward to collaborating on this project!',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  message?: string;
}
