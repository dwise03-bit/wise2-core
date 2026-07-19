import { IsString, IsNumber, IsBoolean, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for track edits sent over WebSocket
 * Validates track editing operations for real-time sync
 */
export class TrackEditDto {
  @ApiProperty({
    description: 'ID of the track being edited',
    example: 'track-123',
  })
  @IsString()
  trackId: string;

  @ApiProperty({
    description: 'Field name being edited',
    enum: ['volume', 'pan', 'name', 'muted'],
    example: 'volume',
  })
  @IsString()
  field: 'volume' | 'pan' | 'name' | 'muted';

  @ApiProperty({
    description: 'New value for the field',
    example: 0.8,
  })
  value: any;

  @ApiProperty({
    description: 'Timestamp when the edit was made (milliseconds since epoch)',
    example: 1689000000000,
  })
  @IsNumber()
  timestamp: number;

  @ApiProperty({
    description: 'Optional conflict resolution strategy',
    enum: ['last-write-wins', 'first-write-wins', 'custom'],
    example: 'last-write-wins',
    required: false,
  })
  @IsOptional()
  @IsString()
  conflictResolution?: 'last-write-wins' | 'first-write-wins' | 'custom';
}
