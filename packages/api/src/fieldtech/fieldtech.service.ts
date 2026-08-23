import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, EquipmentDto, ReadingDto, ReportDto, UpdateJobDto } from './dto/fieldtech.dto';

function toEpoch(date: Date): number {
  return date.getTime();
}

@Injectable()
export class FieldtechService {
  constructor(private prisma: PrismaService) {}

  // --- Jobs ---

  private jobToDto(job: any) {
    return {
      id: job.id,
      customerName: job.customerName,
      customerPhone: job.customerPhone,
      address: job.address,
      appointmentAtEpochMillis: toEpoch(job.appointmentAt),
      technicianId: job.technicianId,
      complaint: job.complaint,
      equipmentId: job.equipmentId,
      status: job.status,
      priority: job.priority,
      notes: job.notes,
      createdAtEpochMillis: toEpoch(job.createdAt),
      updatedAtEpochMillis: toEpoch(job.updatedAt),
    };
  }

  async getJobs(technicianId: string) {
    const jobs = await this.prisma.fieldTechJob.findMany({
      where: { technicianId },
      orderBy: { appointmentAt: 'asc' },
    });
    return jobs.map((j) => this.jobToDto(j));
  }

  async getTodaysJobs(technicianId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const jobs = await this.prisma.fieldTechJob.findMany({
      where: { technicianId, appointmentAt: { gte: start, lte: end } },
      orderBy: { appointmentAt: 'asc' },
    });
    return jobs.map((j) => this.jobToDto(j));
  }

  async getJob(id: string) {
    const job = await this.prisma.fieldTechJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return this.jobToDto(job);
  }

  async createJob(technicianId: string, dto: CreateJobDto) {
    const job = await this.prisma.fieldTechJob.create({
      data: {
        technicianId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        address: dto.address,
        appointmentAt: new Date(dto.appointmentAtEpochMillis),
        complaint: dto.complaint,
        equipmentId: dto.equipmentId,
        priority: (dto.priority as any) || 'NORMAL',
      },
    });
    return this.jobToDto(job);
  }

  async updateJob(id: string, dto: UpdateJobDto) {
    const job = await this.prisma.fieldTechJob.update({
      where: { id },
      data: {
        status: dto.status as any,
        notes: dto.notes,
        equipmentId: dto.equipmentId,
      },
    });
    return this.jobToDto(job);
  }

  // --- Equipment ---

  private equipmentToDto(equipment: any) {
    return {
      id: equipment.id,
      customerName: equipment.customerName,
      manufacturer: equipment.manufacturer,
      equipmentType: equipment.equipmentType,
      model: equipment.model,
      serial: equipment.serial,
      refrigerant: equipment.refrigerant,
      voltage: equipment.voltage,
      phase: equipment.phase,
      tonnage: equipment.tonnage,
      installationDateEpochMillis: equipment.installationDate ? toEpoch(equipment.installationDate) : null,
      location: equipment.location,
      filterSize: equipment.filterSize,
      technicianNotes: equipment.technicianNotes,
    };
  }

  async getEquipment(id: string) {
    const equipment = await this.prisma.fieldTechEquipment.findUnique({ where: { id } });
    if (!equipment) throw new NotFoundException('Equipment not found');
    return this.equipmentToDto(equipment);
  }

  async createEquipment(dto: EquipmentDto) {
    const equipment = await this.prisma.fieldTechEquipment.create({
      data: {
        customerName: dto.customerName,
        manufacturer: dto.manufacturer,
        equipmentType: dto.equipmentType,
        model: dto.model,
        serial: dto.serial,
        refrigerant: dto.refrigerant,
        voltage: dto.voltage,
        phase: dto.phase,
        tonnage: dto.tonnage,
        installationDate: dto.installationDateEpochMillis ? new Date(dto.installationDateEpochMillis) : null,
        location: dto.location,
        filterSize: dto.filterSize,
        technicianNotes: dto.technicianNotes || '',
      },
    });
    return this.equipmentToDto(equipment);
  }

  async getServiceHistory(equipmentId: string) {
    const history = await this.prisma.fieldTechServiceHistory.findMany({
      where: { equipmentId },
      orderBy: { date: 'desc' },
    });
    return history.map((h) => ({
      id: h.id,
      equipmentId: h.equipmentId,
      jobId: h.jobId,
      dateEpochMillis: toEpoch(h.date),
      summary: h.summary,
      technicianName: h.technicianName,
    }));
  }

  // --- Readings ---

  private readingToDto(reading: any) {
    return {
      id: reading.id,
      jobId: reading.jobId,
      sourceDeviceName: reading.sourceDeviceName,
      capturedAtEpochMillis: toEpoch(reading.capturedAt),
      lowSidePsig: reading.lowSidePsig,
      highSidePsig: reading.highSidePsig,
      suctionSaturationF: reading.suctionSaturationF,
      liquidSaturationF: reading.liquidSaturationF,
      suctionLineTempF: reading.suctionLineTempF,
      liquidLineTempF: reading.liquidLineTempF,
      dischargeTempF: reading.dischargeTempF,
      outdoorAmbientF: reading.outdoorAmbientF,
      voltageL1: reading.voltageL1,
      voltageL2: reading.voltageL2,
      voltageL3: reading.voltageL3,
      currentL1: reading.currentL1,
      currentL2: reading.currentL2,
      currentL3: reading.currentL3,
      frequencyHz: reading.frequencyHz,
      capacitanceMfd: reading.capacitanceMfd,
      resistanceOhms: reading.resistanceOhms,
      continuityOk: reading.continuityOk,
      returnTempF: reading.returnTempF,
      supplyTempF: reading.supplyTempF,
      staticPressureInWc: reading.staticPressureInWc,
    };
  }

  async getReadings(jobId: string) {
    const readings = await this.prisma.fieldTechReading.findMany({
      where: { jobId },
      orderBy: { capturedAt: 'desc' },
    });
    return readings.map((r) => this.readingToDto(r));
  }

  async submitReading(dto: ReadingDto) {
    const reading = await this.prisma.fieldTechReading.create({
      data: {
        jobId: dto.jobId,
        sourceDeviceName: dto.sourceDeviceName,
        capturedAt: new Date(dto.capturedAtEpochMillis),
        lowSidePsig: dto.lowSidePsig,
        highSidePsig: dto.highSidePsig,
        suctionSaturationF: dto.suctionSaturationF,
        liquidSaturationF: dto.liquidSaturationF,
        suctionLineTempF: dto.suctionLineTempF,
        liquidLineTempF: dto.liquidLineTempF,
        dischargeTempF: dto.dischargeTempF,
        outdoorAmbientF: dto.outdoorAmbientF,
        voltageL1: dto.voltageL1,
        voltageL2: dto.voltageL2,
        voltageL3: dto.voltageL3,
        currentL1: dto.currentL1,
        currentL2: dto.currentL2,
        currentL3: dto.currentL3,
        frequencyHz: dto.frequencyHz,
        capacitanceMfd: dto.capacitanceMfd,
        resistanceOhms: dto.resistanceOhms,
        continuityOk: dto.continuityOk,
        returnTempF: dto.returnTempF,
        supplyTempF: dto.supplyTempF,
        staticPressureInWc: dto.staticPressureInWc,
      },
    });
    return this.readingToDto(reading);
  }

  // --- Reports ---

  private reportToDto(report: any) {
    return {
      jobId: report.jobId,
      jobSummary: report.jobSummary,
      systemInfo: report.systemInfo,
      customerComplaint: report.customerComplaint,
      diagnosis: report.diagnosis,
      workPerformed: report.workPerformed,
      materials: report.materials,
      recommendations: report.recommendations,
      technicianNotes: report.technicianNotes,
      customerApprovalName: report.customerApprovalName,
      status: report.status,
      updatedAtEpochMillis: toEpoch(report.updatedAt),
    };
  }

  async getReport(jobId: string) {
    const report = await this.prisma.fieldTechReport.findUnique({ where: { jobId } });
    if (!report) throw new NotFoundException('Report not found');
    return this.reportToDto(report);
  }

  async saveReport(jobId: string, dto: ReportDto) {
    const report = await this.prisma.fieldTechReport.upsert({
      where: { jobId },
      create: {
        jobId,
        jobSummary: dto.jobSummary,
        systemInfo: dto.systemInfo,
        customerComplaint: dto.customerComplaint,
        diagnosis: dto.diagnosis,
        workPerformed: dto.workPerformed,
        materials: dto.materials as any,
        recommendations: dto.recommendations,
        technicianNotes: dto.technicianNotes,
        customerApprovalName: dto.customerApprovalName,
        status: dto.status as any,
      },
      update: {
        jobSummary: dto.jobSummary,
        systemInfo: dto.systemInfo,
        customerComplaint: dto.customerComplaint,
        diagnosis: dto.diagnosis,
        workPerformed: dto.workPerformed,
        materials: dto.materials as any,
        recommendations: dto.recommendations,
        technicianNotes: dto.technicianNotes,
        customerApprovalName: dto.customerApprovalName,
        status: dto.status as any,
      },
    });
    return this.reportToDto(report);
  }

  async finalizeReport(jobId: string) {
    const report = await this.prisma.fieldTechReport.update({
      where: { jobId },
      data: { status: 'FINALIZED' },
    });
    return this.reportToDto(report);
  }

  // --- Releases ---

  async getLatestRelease() {
    const release = await this.prisma.fieldTechRelease.findFirst({
      orderBy: { versionCode: 'desc' },
    });
    if (!release) throw new NotFoundException('No release published yet');
    return {
      versionCode: release.versionCode,
      versionName: release.versionName,
      apkUrl: release.apkUrl,
      sha256: release.sha256,
      required: release.required,
      releaseNotes: release.releaseNotes,
    };
  }
}
