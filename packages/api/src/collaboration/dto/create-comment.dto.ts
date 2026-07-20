import { IsString, IsOptional, IsArray, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new comment
 * Validates request body for POST /projects/:id/comments
 */
export class CreateCommentDto {
  @ApiProperty({
    description: 'The comment text content',
    example: 'This section needs more bass',
    maxLength: 2000,
  })
  @IsString()
  @MaxLength(2000)
  content!: string;

  @ApiProperty({
    description: 'Optional timestamp in seconds for audio timeline comments',
    example: 45.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  timestamp?: number;

  @ApiProperty({
    description: 'Optional track ID this comment is associated with',
    example: 'track-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  trackId?: string;

  @ApiProperty({
    description: 'Optional thread ID for nested comments',
    example: 'comment-456',
    required: false,
  })
  @IsOptional()
  @IsString()
  threadId?: string;

  @ApiProperty({
    description: 'Array of user IDs to mention in the comment',
    example: ['user-123', 'user-456'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}
