import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionType } from '../interfaces/collaboration.types';

/**
 * DTO for updating collaborator permissions
 * Validates request body for PUT /projects/:id/permissions
 */
export class UpdatePermissionsDto {
  @ApiProperty({
    description: 'ID of the collaborator to update',
    example: 'collab-123',
  })
  @IsString()
  collaboratorId!: string;

  @ApiProperty({
    description: 'New role for the collaborator',
    enum: ['OWNER', 'EDITOR', 'VIEWER'],
    example: 'EDITOR',
    required: false,
  })
  @IsOptional()
  @IsEnum(['OWNER', 'EDITOR', 'VIEWER'])
  role?: 'OWNER' | 'EDITOR' | 'VIEWER';

  @ApiProperty({
    description: 'Array of specific permissions to grant',
    example: ['edit_track', 'edit_mixer', 'manage_versions'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: PermissionType[];

  @ApiProperty({
    description: 'Optional reason for the permission change (for audit logging)',
    example: 'Promoting to full editor access',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
