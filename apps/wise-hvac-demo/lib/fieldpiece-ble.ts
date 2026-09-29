import { BleClient, type ScanResult } from '@capacitor-community/bluetooth-le';
import { isFieldTechNative } from './native-google-signin.ts';
import type { Measurement, ToolCard, ToolRole } from './measurements.ts';

export interface FieldpieceDiscoveredProbe {
  deviceId: string;
  name: string;
  role: ToolRole;
  assignedRole: string;
  rssi?: number;
  battery: number | null;
  measurementKey: string;
  unit: string;
  lastValue: number | null;
  lastSeen: number;
}

// Fieldpiece probe prefixes & common BLE identifiers
// JL3PR (Pressure), JL3PC (Pipe Clamp), JL3RH (Psychrometer), SC480/SC680 (Clamp Meter), SM480V (Sman)
export function identifyFieldpieceRole(name: string): {
  role: ToolRole;
  type: string;
  assignedRole: string;
  measurementKey: string;
  unit: string;
} {
  const upper = (name || '').toUpperCase();

  if (upper.includes('JL3PR') || upper.includes('PRESS') || upper.includes('LOW')) {
    if (upper.includes('HIGH') || upper.includes('RED')) {
      return {
        role: 'high_side_pressure',
        type: 'Pressure probe',
        assignedRole: 'High Side (Liquid)',
        measurementKey: 'liquid_pressure',
        unit: 'PSIG',
      };
    }
    return {
      role: 'low_side_pressure',
      type: 'Pressure probe',
      assignedRole: 'Low Side (Suction)',
      measurementKey: 'suction_pressure',
      unit: 'PSIG',
    };
  }

  if (upper.includes('JL3PC') || upper.includes('PIPE') || upper.includes('CLAMP') || upper.includes('TEMP')) {
    if (upper.includes('LIQ') || upper.includes('HIGH') || upper.includes('RED')) {
      return {
        role: 'liquid_line_temp',
        type: 'Pipe clamp',
        assignedRole: 'Liquid Line Temp',
        measurementKey: 'liquid_line_temp',
        unit: '°F',
      };
    }
    return {
      role: 'suction_line_temp',
      type: 'Pipe clamp',
      assignedRole: 'Suction Line Temp',
      measurementKey: 'suction_line_temp',
      unit: '°F',
    };
  }

  if (upper.includes('JL3RH') || upper.includes('PSYCH') || upper.includes('HUMID')) {
    if (upper.includes('SUP') || upper.includes('OUT')) {
      return {
        role: 'supply_psychrometer',
        type: 'Psychrometer',
        assignedRole: 'Supply Psychrometer',
        measurementKey: 'supply_db',
        unit: '°F',
      };
    }
    return {
      role: 'return_psychrometer',
      type: 'Psychrometer',
      assignedRole: 'Return Psychrometer',
      measurementKey: 'return_db',
      unit: '°F',
    };
  }

  if (upper.includes('SC4') || upper.includes('SC6') || upper.includes('METER') || upper.includes('AMP')) {
    return {
      role: 'multimeter',
      type: 'Multimeter',
      assignedRole: 'Electrical / Amps',
      measurementKey: 'amperage',
      unit: 'AAC',
    };
  }

  if (upper.includes('SM4') || upper.includes('SMAN') || upper.includes('MANOMETER')) {
    return {
      role: 'static_pressure',
      type: 'Manometer',
      assignedRole: 'Static Pressure',
      measurementKey: 'tesp',
      unit: 'in. wc',
    };
  }

  return {
    role: 'low_side_pressure',
    type: 'Smart Tool',
    assignedRole: name || 'Bluetooth Sensor',
    measurementKey: 'suction_pressure',
    unit: 'PSIG',
  };
}

let bleInitialized = false;

export async function initBle(): Promise<boolean> {
  if (!isFieldTechNative()) return false;
  if (bleInitialized) return true;
  try {
    await BleClient.initialize();
    bleInitialized = true;
    return true;
  } catch (err) {
    console.warn('BLE init error:', err);
    return false;
  }
}

export async function scanForFieldpieceTools(
  onProbeDiscovered: (probe: FieldpieceDiscoveredProbe) => void,
  timeoutMs = 10000,
): Promise<{ success: boolean; message: string }> {
  if (!isFieldTechNative()) {
    return { success: false, message: 'Bluetooth LE requires running in the native iOS app.' };
  }

  const ok = await initBle();
  if (!ok) {
    return { success: false, message: 'Could not initialize Bluetooth on device. Check permissions.' };
  }

  try {
    await BleClient.requestLEScan(
      {
        allowDuplicates: true,
      },
      (result: ScanResult) => {
        const name = result.device.name || result.localName || '';
        if (!name && !result.device.deviceId) return;

        // Parse payload or manufacturer data if present
        let parsedValue: number | null = null;
        if (result.manufacturerData) {
          const keys = Object.keys(result.manufacturerData);
          if (keys.length > 0) {
            const dataView = result.manufacturerData[Number(keys[0])];
            if (dataView && dataView.byteLength >= 2) {
              // Extract standard 16-bit float / integer telemetry
              parsedValue = Number((dataView.getInt16(0, true) / 10).toFixed(1));
            }
          }
        }

        const identified = identifyFieldpieceRole(name);
        onProbeDiscovered({
          deviceId: result.device.deviceId,
          name: name || `Fieldpiece (${result.device.deviceId.slice(0, 5)})`,
          role: identified.role,
          assignedRole: identified.assignedRole,
          rssi: result.rssi,
          battery: 95,
          measurementKey: identified.measurementKey,
          unit: identified.unit,
          lastValue: parsedValue,
          lastSeen: Date.now(),
        });
      },
    );

    setTimeout(async () => {
      try {
        await BleClient.stopLEScan();
      } catch {
        /* ignore */
      }
    }, timeoutMs);

    return { success: true, message: 'Scanning for Fieldpiece Bluetooth probes…' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Bluetooth scan failed: ${msg}` };
  }
}

export async function stopBleScan(): Promise<void> {
  if (!isFieldTechNative()) return;
  try {
    await BleClient.stopLEScan();
  } catch {
    /* ignore */
  }
}
