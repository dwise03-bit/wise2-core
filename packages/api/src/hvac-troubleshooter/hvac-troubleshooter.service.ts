import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service'; // DISABLED: hVACDevice model not in schema

@Injectable()
export class HvacTroubleshooterService {
  constructor() {}

  // ===== DEVICE MANAGEMENT =====

  async registerDevice(data: {
    deviceId: string;
    name: string;
    technicianId?: string;
    firmwareVersion?: string;
  }) {
    // Stub implementation - model not in Prisma schema
    return { id: 'stub', ...data, status: 'IDLE', healthStatus: 'HEALTHY' };
  }

  async getDevice(deviceId: string) {
    // Stub implementation
    return { deviceId, readings: [] };
  }

  async updateDeviceStatus(deviceId: string, updates: any) {
    // Stub implementation
    return { deviceId, ...updates, updatedAt: new Date() };
  }

  async syncDeviceOnline(deviceId: string, wifiStrength?: number) {
    return this.updateDeviceStatus(deviceId, {
      isOnline: true,
      lastSyncAt: new Date(),
      wifiStrength,
    });
  }

  async markDeviceOffline(deviceId: string) {
    return this.updateDeviceStatus(deviceId, {
      isOnline: false,
      status: 'OFFLINE',
    });
  }

  // ===== READINGS =====

  async createReading(data: {
    deviceId: string;
    temperatureF: number;
    humidityPercent: number;
    highSidePressurePsi: number;
    lowSidePressurePsi?: number;
    differentialPressureH2o?: number;
    supplyCelsiusF?: number;
    returnCelsiusF?: number;
    voltage?: number;
    amperage?: number;
    signalStrength?: number;
    batteryLevel?: number;
    notes?: string;
  }) {
    // Stub implementation
    return { id: 'stub', ...data, synced: false, syncedToWise2: false };
  }

  async getReadings(deviceId: string, limit = 100, offset = 0) {
    // Stub implementation
    return [];
  }

  async getReadingsForJob(jobId: string, limit = 100) {
    // Stub implementation
    return [];
  }

  async getLatestReading(deviceId: string) {
    // Stub implementation
    return null;
  }

  async markReadingsSynced(deviceId: string, readingIds: string[]) {
    // Stub implementation
    return { count: readingIds.length };
  }

  async markReadingsWise2Synced(readingIds: string[]) {
    // Stub implementation
    return { count: readingIds.length };
  }

  // ===== DEVICE HEALTH ASSESSMENT =====

  assessHealth(reading: any): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    const { temperatureF, highSidePressurePsi, lowSidePressurePsi } = reading;

    // Critical conditions
    if (temperatureF > 130 || temperatureF < 32) return 'CRITICAL';
    if (highSidePressurePsi > 500 || highSidePressurePsi < 50) return 'CRITICAL';
    if (lowSidePressurePsi && lowSidePressurePsi > 200) return 'CRITICAL';

    // Warning conditions
    if (temperatureF > 120 || temperatureF < 40) return 'WARNING';
    if (highSidePressurePsi > 450 || highSidePressurePsi < 100) return 'WARNING';
    if (lowSidePressurePsi && lowSidePressurePsi > 150) return 'WARNING';

    return 'HEALTHY';
  }

  async updateHealthStatus(deviceId: string, reading: any) {
    const health = this.assessHealth(reading);
    return this.updateDeviceStatus(deviceId, { healthStatus: health });
  }

  // ===== DATA EXPORT =====

  async exportReadingsToCSV(
    deviceId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<string> {
    // Stub implementation - return CSV headers only
    const readings: any[] = [];
    if (readings.length === 0) return 'timestamp,temp_f,humidity_pct,high_psi,low_psi,diff_h2o\n';

    const headers =
      'timestamp,temp_f,humidity_pct,high_psi,low_psi,diff_h2o,voltage,amperage,signal,battery,notes';
    const rows = readings.map((r) =>
      [
        r.createdAt.toISOString(),
        r.temperatureF,
        r.humidityPercent,
        r.highSidePressurePsi,
        r.lowSidePressurePsi || '',
        r.differentialPressureH2o || '',
        r.voltage || '',
        r.amperage || '',
        r.signalStrength || '',
        r.batteryLevel || '',
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(','),
    );

    return [headers, ...rows].join('\n');
  }

  // ===== CALIBRATION =====

  async startCalibration(deviceId: string, notes?: string) {
    return this.updateDeviceStatus(deviceId, {
      calibrationMode: true,
      status: 'CALIBRATING',
      calibrationNotes: notes,
    });
  }

  async completeCalibration(deviceId: string) {
    return this.updateDeviceStatus(deviceId, {
      calibrationMode: false,
      status: 'IDLE',
      lastCalibratedAt: new Date(),
    });
  }
}
