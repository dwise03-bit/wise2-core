import {
  IsArray,
  IsBoolean,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const JOB_STATUSES = [
  'SCHEDULED',
  'EN_ROUTE',
  'ARRIVED',
  'DIAGNOSING',
  'REPAIRING',
  'WAITING',
  'COMPLETE',
];
const JOB_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'EMERGENCY'];
const REPORT_STATUSES = ['DRAFT', 'FINALIZED', 'SENT'];

export class CreateJobDto {
  @IsString() @IsNotEmpty() @MaxLength(200) customerName!: string;
  @IsString() @MaxLength(40) customerPhone!: string;
  @IsString() @IsNotEmpty() @MaxLength(400) address!: string;
  @IsNumber() appointmentAtEpochMillis!: number;
  @IsString() @MaxLength(4000) complaint!: string;
  @IsOptional() @IsString() equipmentId?: string;
  @IsOptional() @IsIn(JOB_PRIORITIES) priority?: string;
}

export class UpdateJobDto {
  @IsOptional() @IsIn(JOB_STATUSES) status?: string;
  @IsOptional() @IsString() @MaxLength(8000) notes?: string;
  @IsOptional() @IsString() equipmentId?: string;
}

export class EquipmentDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() customerName!: string;
  @IsString() @IsNotEmpty() manufacturer!: string;
  @IsString() @IsNotEmpty() equipmentType!: string;
  @IsString() @IsNotEmpty() model!: string;
  @IsString() @IsNotEmpty() serial!: string;
  @IsString() @IsNotEmpty() refrigerant!: string;
  @IsString() @IsNotEmpty() voltage!: string;
  @IsString() @IsNotEmpty() phase!: string;
  @IsOptional() @IsNumber() tonnage?: number;
  @IsOptional() @IsNumber() installationDateEpochMillis?: number;
  @IsString() location!: string;
  @IsOptional() @IsString() filterSize?: string;
  @IsOptional() @IsString() technicianNotes?: string;
}

export class ReadingDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() jobId!: string;
  @IsString() sourceDeviceName!: string;
  @IsNumber() capturedAtEpochMillis!: number;

  @IsOptional() @IsNumber() lowSidePsig?: number;
  @IsOptional() @IsNumber() highSidePsig?: number;
  @IsOptional() @IsNumber() suctionSaturationF?: number;
  @IsOptional() @IsNumber() liquidSaturationF?: number;
  @IsOptional() @IsNumber() suctionLineTempF?: number;
  @IsOptional() @IsNumber() liquidLineTempF?: number;
  @IsOptional() @IsNumber() dischargeTempF?: number;
  @IsOptional() @IsNumber() outdoorAmbientF?: number;

  @IsOptional() @IsNumber() voltageL1?: number;
  @IsOptional() @IsNumber() voltageL2?: number;
  @IsOptional() @IsNumber() voltageL3?: number;
  @IsOptional() @IsNumber() currentL1?: number;
  @IsOptional() @IsNumber() currentL2?: number;
  @IsOptional() @IsNumber() currentL3?: number;
  @IsOptional() @IsNumber() frequencyHz?: number;
  @IsOptional() @IsNumber() capacitanceMfd?: number;
  @IsOptional() @IsNumber() resistanceOhms?: number;
  @IsOptional() @IsBoolean() continuityOk?: boolean;

  @IsOptional() @IsNumber() returnTempF?: number;
  @IsOptional() @IsNumber() supplyTempF?: number;
  @IsOptional() @IsNumber() staticPressureInWc?: number;
}

class ReportMaterialDto {
  @IsString() description!: string;
  @IsNumber() quantity!: number;
  @IsString() unit!: string;
}

export class ReportDto {
  @IsString() @IsNotEmpty() jobSummary!: string;
  @IsString() systemInfo!: string;
  @IsString() customerComplaint!: string;
  @IsString() diagnosis!: string;
  @IsArray() @IsString({ each: true }) workPerformed!: string[];
  @IsArray() materials!: ReportMaterialDto[];
  @IsString() recommendations!: string;
  @IsString() technicianNotes!: string;
  @IsOptional() @IsString() customerApprovalName?: string;
  @IsIn(REPORT_STATUSES) status!: string;
}
