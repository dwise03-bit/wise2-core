/**
 * Signal Mapper - Converts RTL-SDR signal data to geographic coordinates
 * Based on frequency classification and historical patterns
 */

import { SIGNAL_CLASSIFICATIONS, WATCH_ZONES, SIGNAL_STRENGTH_LEVELS, GREENSBORO_CENTER } from './google-maps-config';

export interface SignalLocation {
  id: string;
  frequency: number;
  signalStrength: number; // dB
  latitude: number;
  longitude: number;
  classification: string;
  color: string;
  markerIcon: string;
  size: number;
  opacity: number;
  detectedAt: Date;
  label: string;
}

export interface IncidentMarker {
  id: string;
  headline: string;
  latitude: number;
  longitude: number;
  icon: string;
  color: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threatLevel: string;
  category: string;
  timestamp: Date;
  description?: string;
}

export interface ZoneMarker {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number;
  color: string;
  threatLevel: string;
}

/**
 * Classify frequency and return signal type
 */
export function classifyFrequency(frequency: number): {
  type: string;
  color: string;
  icon: string;
  priority: string;
} {
  if (frequency >= 461.0 && frequency <= 461.3) {
    return {
      type: 'POLICE',
      color: SIGNAL_CLASSIFICATIONS.POLICE.color,
      icon: SIGNAL_CLASSIFICATIONS.POLICE.markerIcon,
      priority: SIGNAL_CLASSIFICATIONS.POLICE.priority,
    };
  }

  if (frequency >= 463.0 && frequency <= 464.0) {
    return {
      type: 'FIRE_EMS',
      color: SIGNAL_CLASSIFICATIONS.FIRE_EMS.color,
      icon: SIGNAL_CLASSIFICATIONS.FIRE_EMS.markerIcon,
      priority: SIGNAL_CLASSIFICATIONS.FIRE_EMS.priority,
    };
  }

  if (frequency >= 410 && frequency <= 480) {
    return {
      type: 'PUBLIC_SAFETY',
      color: SIGNAL_CLASSIFICATIONS.PUBLIC_SAFETY.color,
      icon: SIGNAL_CLASSIFICATIONS.PUBLIC_SAFETY.markerIcon,
      priority: SIGNAL_CLASSIFICATIONS.PUBLIC_SAFETY.priority,
    };
  }

  if ((frequency >= 824 && frequency <= 894) || (frequency >= 1850 && frequency <= 1990)) {
    return {
      type: 'CELLULAR',
      color: SIGNAL_CLASSIFICATIONS.CELLULAR.color,
      icon: SIGNAL_CLASSIFICATIONS.CELLULAR.markerIcon,
      priority: SIGNAL_CLASSIFICATIONS.CELLULAR.priority,
    };
  }

  if (frequency >= 88 && frequency <= 108) {
    return {
      type: 'FM_RADIO',
      color: SIGNAL_CLASSIFICATIONS.FM_RADIO.color,
      icon: SIGNAL_CLASSIFICATIONS.FM_RADIO.markerIcon,
      priority: SIGNAL_CLASSIFICATIONS.FM_RADIO.priority,
    };
  }

  return {
    type: 'CIVILIAN',
    color: SIGNAL_CLASSIFICATIONS.CIVILIAN.color,
    icon: SIGNAL_CLASSIFICATIONS.CIVILIAN.markerIcon,
    priority: SIGNAL_CLASSIFICATIONS.CIVILIAN.priority,
  };
}

/**
 * Map signal strength to visual properties
 */
export function getSignalStrengthProperties(signalStrengthDb: number) {
  for (const [, level] of Object.entries(SIGNAL_STRENGTH_LEVELS)) {
    if (signalStrengthDb >= level.threshold) {
      return level;
    }
  }
  return SIGNAL_STRENGTH_LEVELS.VERY_WEAK;
}

/**
 * Convert RTL-SDR signal to geographic coordinate
 * Uses frequency classification to estimate location within Greensboro
 */
export function signalToLocation(
  signal: any,
  signalId: string,
): SignalLocation {
  const classification = classifyFrequency(signal.frequency);
  const strengthProps = getSignalStrengthProperties(signal.signal_strength);

  // Determine zone based on frequency and signal strength
  const zone = determineZoneByFrequency(signal.frequency);

  // Add randomness within zone (±0.01 degrees ≈ 1km)
  const latOffset = (Math.random() - 0.5) * 0.02;
  const lngOffset = (Math.random() - 0.5) * 0.02;

  return {
    id: signalId,
    frequency: signal.frequency,
    signalStrength: signal.signal_strength,
    latitude: zone.center.lat + latOffset,
    longitude: zone.center.lng + lngOffset,
    classification: classification.type,
    color: classification.color,
    markerIcon: classification.icon,
    size: strengthProps.size,
    opacity: strengthProps.opacity,
    detectedAt: new Date(signal.detected_at || Date.now()),
    label: `${signal.frequency.toFixed(2)} MHz (${classification.type})`,
  };
}

/**
 * Determine watch zone by frequency characteristics
 */
export function determineZoneByFrequency(frequency: number): {
  id: string;
  center: { lat: number; lng: number };
} {
  // Police frequencies - concentrate in downtown
  if (frequency >= 461.0 && frequency <= 461.3) {
    return WATCH_ZONES[0]; // Downtown
  }

  // Fire/EMS - distributed across zones
  if (frequency >= 463.0 && frequency <= 464.0) {
    const randomZone = Math.floor(Math.random() * 4);
    return WATCH_ZONES[randomZone] || WATCH_ZONES[0];
  }

  // Public safety - wider distribution
  if (frequency >= 410 && frequency <= 480) {
    return WATCH_ZONES[Math.floor(Math.random() * WATCH_ZONES.length)];
  }

  // Cellular - everywhere
  if ((frequency >= 824 && frequency <= 894) || (frequency >= 1850 && frequency <= 1990)) {
    return {
      id: 'cellular-distributed',
      center: GREENSBORO_CENTER,
    };
  }

  // Default - Greensboro center
  return {
    id: 'center',
    center: GREENSBORO_CENTER,
  };
}

/**
 * Convert incident data to marker
 */
export function incidentToMarker(incident: any): IncidentMarker {
  const typeKey = (incident.category || 'OTHER').toUpperCase();
  const typeConfig = INCIDENT_TYPES[typeKey as keyof typeof INCIDENT_TYPES] || INCIDENT_TYPES.OTHER;

  return {
    id: incident.id,
    headline: incident.headline,
    latitude: incident.latitude || GREENSBORO_CENTER.lat,
    longitude: incident.longitude || GREENSBORO_CENTER.lng,
    icon: typeConfig.icon,
    color: typeConfig.color,
    priority: typeConfig.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    threatLevel: incident.threat_level || 'LOW',
    category: incident.category || 'OTHER',
    timestamp: new Date(incident.received_timestamp || Date.now()),
    description: incident.description,
  };
}

// Import at bottom to avoid circular dependency
import { INCIDENT_TYPES } from './google-maps-config';

/**
 * Build historical trail for a signal (last N minutes)
 */
export function buildSignalTrail(
  signal: any,
  historyPoints: any[],
): Array<{ lat: number; lng: number; time: Date }> {
  const trail: Array<{ lat: number; lng: number; time: Date }> = [];

  for (const point of historyPoints) {
    const location = signalToLocation(point, point.id);
    trail.push({
      lat: location.latitude,
      lng: location.longitude,
      time: location.detectedAt,
    });
  }

  return trail.sort((a, b) => a.time.getTime() - b.time.getTime());
}

/**
 * Filter signals by frequency band
 */
export function filterSignalsByBand(
  signals: SignalLocation[],
  bandType: string,
): SignalLocation[] {
  return signals.filter((signal) => {
    if (bandType === 'ALL') return true;
    return signal.classification === bandType;
  });
}

/**
 * Filter signals by time range
 */
export function filterSignalsByTimeRange(
  signals: SignalLocation[],
  startTime: Date,
  endTime: Date,
): SignalLocation[] {
  return signals.filter(
    (signal) =>
      signal.detectedAt >= startTime && signal.detectedAt <= endTime,
  );
}

/**
 * Filter incidents by time range and threat level
 */
export function filterIncidentsByTimeRange(
  incidents: IncidentMarker[],
  startTime: Date,
  endTime: Date,
  minThreatLevel?: string,
): IncidentMarker[] {
  return incidents.filter((incident) => {
    const inTimeRange =
      incident.timestamp >= startTime && incident.timestamp <= endTime;

    if (!minThreatLevel) return inTimeRange;

    const threatLevels = ['LOW', 'MEDIUM', 'ELEVATED', 'HIGH', 'CRITICAL'];
    const minIndex = threatLevels.indexOf(minThreatLevel);
    const incidentIndex = threatLevels.indexOf(incident.threatLevel);

    return inTimeRange && incidentIndex >= minIndex;
  });
}

/**
 * Cluster nearby signals for performance
 */
export function clusterSignals(
  signals: SignalLocation[],
  clusterRadius: number = 0.1, // degrees
): Array<{
  center: { lat: number; lng: number };
  count: number;
  signals: SignalLocation[];
  color: string;
  size: number;
}> {
  const clusters: Array<any> = [];

  for (const signal of signals) {
    let foundCluster = false;

    for (const cluster of clusters) {
      const distance = Math.sqrt(
        Math.pow(signal.latitude - cluster.center.lat, 2) +
          Math.pow(signal.longitude - cluster.center.lng, 2),
      );

      if (distance < clusterRadius) {
        cluster.signals.push(signal);
        cluster.count++;
        cluster.center.lat = (cluster.center.lat + signal.latitude) / 2;
        cluster.center.lng = (cluster.center.lng + signal.longitude) / 2;
        foundCluster = true;
        break;
      }
    }

    if (!foundCluster) {
      clusters.push({
        center: { lat: signal.latitude, lng: signal.longitude },
        count: 1,
        signals: [signal],
        color: signal.color,
        size: signal.size + 2,
      });
    }
  }

  return clusters;
}

/**
 * Calculate anomaly score for a signal
 */
export function calculateAnomalyScore(
  signal: SignalLocation,
  historicalAverage: number,
): number {
  const deviation = signal.signalStrength - historicalAverage;
  // Score: 0-100, where >50 is significant anomaly
  return Math.min(100, Math.max(0, 50 + Math.abs(deviation)));
}

/**
 * Determine if signal should trigger alert
 */
export function shouldTriggerAlert(signal: SignalLocation): boolean {
  // Alert on police/fire frequencies with strong signal
  const criticalFreqs = signal.frequency >= 461 && signal.frequency <= 464;
  const strongSignal = signal.signalStrength > -60;

  return criticalFreqs && strongSignal;
}

/**
 * Export map data to GeoJSON format
 */
export function exportToGeoJSON(
  signals: SignalLocation[],
  incidents: IncidentMarker[],
) {
  const features: any[] = [];

  // Add signal points
  for (const signal of signals) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [signal.longitude, signal.latitude],
      },
      properties: {
        type: 'signal',
        frequency: signal.frequency,
        signalStrength: signal.signalStrength,
        classification: signal.classification,
        detectedAt: signal.detectedAt.toISOString(),
      },
    });
  }

  // Add incident points
  for (const incident of incidents) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [incident.longitude, incident.latitude],
      },
      properties: {
        type: 'incident',
        headline: incident.headline,
        category: incident.category,
        threatLevel: incident.threatLevel,
        timestamp: incident.timestamp.toISOString(),
      },
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}
