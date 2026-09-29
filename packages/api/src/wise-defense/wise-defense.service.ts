import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ThreatLevel, VerificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { withTenant } from '../common/prisma/tenant-isolation';

const threatRank: Record<ThreatLevel, number> = { LOW: 0, ELEVATED: 1, HIGH: 2, CRITICAL: 3 };
const earthMiles = (a: number, b: number, c: number, d: number) => {
  const r = 3958.8; const x = Math.PI / 180; const h = Math.sin((c - a) * x / 2) ** 2 + Math.cos(a * x) * Math.cos(c * x) * Math.sin((d - b) * x / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
};

@Injectable()
export class WiseDefenseService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(tenantId: string) {
    const [incidents, meshNodes, radios, sdr, alerts] = await Promise.all([
      this.prisma.incident.findMany({ where: withTenant(tenantId), orderBy: { receivedTimestamp: 'desc' }, take: 20 }),
      this.prisma.meshNode.findMany({ where: withTenant(tenantId), orderBy: { updatedAt: 'desc' } }),
      this.prisma.radioDevice.findMany({ where: withTenant(tenantId) }),
      this.prisma.sDRDevice.findMany({ where: withTenant(tenantId) }),
      this.prisma.safetyAlert.findMany({ where: withTenant(tenantId, { status: 'OPEN' }), orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);
    return { incidents, meshNodes, radios, sdr, alerts, resiliency: this.resiliency(meshNodes, radios, sdr) };
  }

  async listIncidents(tenantId: string) { return this.prisma.incident.findMany({ where: withTenant(tenantId), orderBy: { receivedTimestamp: 'desc' }, take: 200 }); }
  async createIncident(tenantId: string, input: Record<string, unknown>) {
    if (!input.headline || !input.category || !input.incidentType || !input.provider) throw new BadRequestException('provider, headline, category, and incidentType are required');
    const confidence = this.scoreConfidence(input.verificationStatus as VerificationStatus | undefined, Number(input.corroboratingSources ?? 0));
    const threatLevel = this.scoreThreat(input, confidence);
    const incident = await this.prisma.incident.upsert({
      where: { tenantId_provider_providerIncidentId: { tenantId, provider: String(input.provider), providerIncidentId: String(input.providerIncidentId ?? '') } },
      create: { tenantId, provider: String(input.provider), providerIncidentId: String(input.providerIncidentId ?? ''), headline: String(input.headline), category: String(input.category), incidentType: String(input.incidentType), description: input.description ? String(input.description) : undefined, latitude: typeof input.latitude === 'number' ? input.latitude : undefined, longitude: typeof input.longitude === 'number' ? input.longitude : undefined, approximateLocation: input.approximateLocation ? String(input.approximateLocation) : undefined, verificationStatus: (input.verificationStatus as VerificationStatus) ?? 'UNVERIFIED', confidence, threatLevel, sourceUrl: input.sourceUrl ? String(input.sourceUrl) : undefined, sourceMetadata: input.sourceMetadata as object | undefined },
      update: { headline: String(input.headline), description: input.description ? String(input.description) : undefined, confidence, threatLevel, verificationStatus: (input.verificationStatus as VerificationStatus) ?? 'UNVERIFIED', updatedAt: new Date() },
    });
    await this.matchWatchZones(tenantId, incident);
    return incident;
  }

  async listWatchZones(tenantId: string) { return this.prisma.watchZone.findMany({ where: withTenant(tenantId), orderBy: { createdAt: 'desc' } }); }
  async createWatchZone(tenantId: string, input: any) { if (!input.name || typeof input.latitude !== 'number' || typeof input.longitude !== 'number' || !input.radiusMiles) throw new BadRequestException('name, latitude, longitude, and radiusMiles are required'); return this.prisma.watchZone.create({ data: { tenantId, name: input.name, kind: input.kind ?? 'CUSTOM', latitude: input.latitude, longitude: input.longitude, radiusMiles: input.radiusMiles, categories: input.categories ?? [], minimumThreat: input.minimumThreat ?? 'ELEVATED', enabled: input.enabled ?? true, privateLocation: input.privateLocation ?? true } }); }
  async listMeshNodes(tenantId: string) { return this.prisma.meshNode.findMany({ where: withTenant(tenantId), orderBy: { updatedAt: 'desc' } }); }
  async ingestMeshTelemetry(tenantId: string, input: any) { if (!input.nodeId) throw new BadRequestException('nodeId is required'); const node = await this.prisma.meshNode.upsert({ where: { tenantId_nodeId: { tenantId, nodeId: input.nodeId } }, create: { tenantId, nodeId: input.nodeId, longName: input.longName, shortName: input.shortName, latitude: input.latitude, longitude: input.longitude, batteryLevel: input.batteryLevel, voltage: input.voltage, snr: input.snr, rssi: input.rssi, hopCount: input.hopCount, onlineStatus: 'ONLINE', lastHeard: new Date() }, update: { longName: input.longName, shortName: input.shortName, latitude: input.latitude, longitude: input.longitude, batteryLevel: input.batteryLevel, voltage: input.voltage, snr: input.snr, rssi: input.rssi, hopCount: input.hopCount, onlineStatus: 'ONLINE', lastHeard: new Date() } }); await this.prisma.meshTelemetry.create({ data: { tenantId, meshNodeId: node.id, batteryLevel: input.batteryLevel, voltage: input.voltage, snr: input.snr, rssi: input.rssi, latitude: input.latitude, longitude: input.longitude, payload: input.payload } }); return node; }
  async radio(tenantId: string, service?: string) { const where = service ? withTenant(tenantId, { service }) : withTenant(tenantId); return Promise.all([this.prisma.radioDevice.findMany({ where: withTenant(tenantId) }), this.prisma.radioOperator.findMany({ where: withTenant(tenantId) }), this.prisma.radioChannel.findMany({ where }), this.prisma.repeater.findMany({ where })]); }
  async sdr(tenantId: string) { return Promise.all([this.prisma.sDRDevice.findMany({ where: withTenant(tenantId) }), this.prisma.sDRSignal.findMany({ where: withTenant(tenantId), orderBy: { detectedAt: 'desc' }, take: 100 },)]); }
  async listAlerts(tenantId: string) { return this.prisma.safetyAlert.findMany({ where: withTenant(tenantId), orderBy: { createdAt: 'desc' }, take: 100 }); }
  async family(tenantId: string) { return this.prisma.familyMember.findMany({ where: withTenant(tenantId), orderBy: { lastCheckIn: 'desc' } }); }
  async resiliencyForTenant(tenantId: string) { const [mesh, radio, sdr] = await Promise.all([this.prisma.meshNode.findMany({ where: withTenant(tenantId) }), this.prisma.radioDevice.findMany({ where: withTenant(tenantId) }), this.prisma.sDRDevice.findMany({ where: withTenant(tenantId) })]); return this.resiliency(mesh, radio, sdr); }
  async createLeadEvent(tenantId: string, type: string) { const allowed = new Set(['training_interest','business_assessment_interest','guardian_home_interest','guardian_business_interest','emergency_comms_interest']); if (!allowed.has(type)) throw new BadRequestException('Unsupported safety lead type'); return this.prisma.lead.create({ data: { tenantId, source: 'wise_defense', serviceType: type, summary: `WISE Defense CTA: ${type}` } }); }

  private scoreConfidence(verification: VerificationStatus | undefined, corroborating: number) { return Math.min(100, ({ UNVERIFIED: 20, DEVELOPING: 40, CORROBORATED: 70, OFFICIAL: 95, CLEARED: 100 }[verification ?? 'UNVERIFIED']) + corroborating * 5); }
  private scoreThreat(input: Record<string, unknown>, confidence: number): ThreatLevel { const severe = /shoot|fire|robbery|violent|severe weather/i.test(`${input.category ?? ''} ${input.incidentType ?? ''}`); if (severe && confidence >= 70) return 'HIGH'; if (severe || confidence >= 55) return 'ELEVATED'; return 'LOW'; }
  private async matchWatchZones(tenantId: string, incident: any) { if (incident.latitude == null || incident.longitude == null) return; const zones = await this.prisma.watchZone.findMany({ where: withTenant(tenantId, { enabled: true }) }); for (const zone of zones) { if (threatRank[incident.threatLevel] < threatRank[zone.minimumThreat] || (zone.categories.length && !zone.categories.includes(incident.category))) continue; if (earthMiles(zone.latitude, zone.longitude, incident.latitude, incident.longitude) <= zone.radiusMiles) await this.prisma.safetyAlert.create({ data: { tenantId, type: 'incident.watch_zone_match', title: incident.headline, message: `Incident reported within ${zone.name}. AI-generated analysis — verify critical information through official sources.`, severity: incident.threatLevel, sourceId: incident.id } }); } }
  private resiliency(mesh: any[], radios: any[], sdr: any[]) { const status = (items: any[]) => !items.length ? 'UNKNOWN' : items.some((x) => x.onlineStatus === 'ONLINE' || x.status === 'ONLINE') ? 'ONLINE' : items.some((x) => x.onlineStatus === 'DEGRADED' || x.status === 'DEGRADED') ? 'DEGRADED' : 'OFFLINE'; return { internet: 'UNKNOWN', cellular: 'UNKNOWN', meshtastic: status(mesh), gmrs: status(radios.filter((r) => r.kind === 'GMRS')), hamRadio: status(radios.filter((r) => r.kind === 'HAM')), sdrMonitor: status(sdr) }; }
}
