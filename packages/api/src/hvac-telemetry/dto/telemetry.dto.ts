import {
  IsArray,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Shallow transport validation for `POST /v1/hvac/telemetry`. Deep validation of
 * each reading (units, finite numbers, no string coercion) is delegated to
 * `parsePocketNodeTelemetry` from `@wise2/hvac-contracts` so the contract has a
 * single source of truth.
 */
export class IngestTelemetryDto {
  @IsInt()
  @IsPositive()
  schemaVersion!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  nodeId!: string;

  @IsISO8601()
  capturedAt!: string;

  @IsArray()
  readings!: unknown[];
}
