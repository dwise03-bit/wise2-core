export interface FieldpieceReading {
  timestamp: number;
  temperature?: number;
  pressure?: number;
  voltage?: number;
  humidity?: number;
  amps?: number;
}

export interface JobContext {
  jobId: string;
  customerName: string;
  address: string;
  equipmentType: string;
  equipmentModel?: string;
  serviceType: 'maintenance' | 'repair' | 'emergency' | 'installation';
  startTime: number;
  symptoms?: string[];
  previousRepairs?: string[];
}

export interface TechnicianContext {
  techId: string;
  name: string;
  experience: 'junior' | 'senior' | 'lead';
  specialties?: string[];
  currentTemp?: number; // Ambient temp at job site
}

export interface SessionContext {
  sessionId: string;
  jobContext?: JobContext;
  technicianContext?: TechnicianContext;
  fieldpieceReadings: FieldpieceReading[];
  diagnosis?: string;
  recommendedParts?: string[];
  estimatedTime?: number;
  lastActivityTime: number;
}

export class ContextManager {
  private sessions: Map<string, SessionContext> = new Map();
  private equipmentDatabase: Map<string, any> = new Map();

  constructor() {
    this.initializeEquipmentDatabase();
  }

  private initializeEquipmentDatabase(): void {
    // Common HVAC equipment reference data
    this.equipmentDatabase.set('carrier-25hpe', {
      model: 'Carrier 25HPE',
      type: 'heat pump',
      refrigerant: 'R410A',
      nominal_capacity: 25000, // BTU
      common_issues: ['low_refrigerant', 'low_voltage', 'compressor_noise'],
    });
    this.equipmentDatabase.set('lennox-xp21', {
      model: 'Lennox XP21',
      type: 'air conditioner',
      refrigerant: 'R410A',
      nominal_capacity: 21000,
      common_issues: ['frozen_coil', 'capacitor_failure', 'airflow_restriction'],
    });
  }

  createSession(
    sessionId: string,
    jobContext: JobContext,
    techContext: TechnicianContext
  ): SessionContext {
    const context: SessionContext = {
      sessionId,
      jobContext,
      technicianContext: techContext,
      fieldpieceReadings: [],
      lastActivityTime: Date.now(),
    };
    this.sessions.set(sessionId, context);
    return context;
  }

  updateFieldpieceReading(sessionId: string, reading: FieldpieceReading): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.fieldpieceReadings.push(reading);
    session.lastActivityTime = Date.now();

    // Keep only last 100 readings (real-time trend data)
    if (session.fieldpieceReadings.length > 100) {
      session.fieldpieceReadings = session.fieldpieceReadings.slice(-100);
    }
  }

  setDiagnosis(sessionId: string, diagnosis: string, parts?: string[]): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.diagnosis = diagnosis;
      if (parts) session.recommendedParts = parts;
      session.lastActivityTime = Date.now();
    }
  }

  setEstimatedTime(sessionId: string, minutes: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.estimatedTime = minutes;
      session.lastActivityTime = Date.now();
    }
  }

  getContext(sessionId: string): SessionContext | undefined {
    return this.sessions.get(sessionId);
  }

  getEquipmentInfo(equipmentKey: string): any {
    return this.equipmentDatabase.get(equipmentKey);
  }

  analyzeTrends(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session || session.fieldpieceReadings.length < 2) return null;

    const readings = session.fieldpieceReadings;
    const temps = readings.map(r => r.temperature).filter(t => t !== undefined) as number[];
    const pressures = readings.map(r => r.pressure).filter(p => p !== undefined) as number[];

    return {
      tempTrend: temps.length > 1 ? temps[temps.length - 1] - temps[0] : 0,
      avgTemp: temps.length > 0 ? temps.reduce((a, b) => a + b) / temps.length : null,
      pressureTrend: pressures.length > 1 ? pressures[pressures.length - 1] - pressures[0] : 0,
      avgPressure: pressures.length > 0 ? pressures.reduce((a, b) => a + b) / pressures.length : null,
      readingCount: readings.length,
    };
  }

  closeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  getAllSessions(): SessionContext[] {
    return Array.from(this.sessions.values());
  }
}
