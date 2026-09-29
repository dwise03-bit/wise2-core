import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execFileAsync = promisify(execFile);

export type IntegrationState =
  | 'ACTIVE'
  | 'DETECTED_NOT_CONFIGURED'
  | 'MISSING_CREDENTIAL'
  | 'MISSING_HARDWARE'
  | 'DISABLED';

export interface WiseDefenseHardwareStatus {
  enabled: boolean;
  meshtastic: { state: IntegrationState; serialPort?: string; detail: string };
  sdr: { state: IntegrationState; deviceType?: string; detail: string };
  cloud: { state: IntegrationState; detail: string };
}

/**
 * Read-only edge hardware detector. It never sends a radio message, opens a
 * transmitter, or guesses device identity from a serial path.
 */
export class WiseDefenseHardware {
  constructor(private readonly environment: NodeJS.ProcessEnv = process.env) {}

  async status(): Promise<WiseDefenseHardwareStatus> {
    const enabled = this.environment.WISE_DEFENSE_GATEWAY_ENABLED === 'true';
    if (!enabled) {
      return {
        enabled: false,
        meshtastic: { state: 'DISABLED', detail: 'Gateway feature flag is disabled.' },
        sdr: { state: 'DISABLED', detail: 'Gateway feature flag is disabled.' },
        cloud: { state: 'DISABLED', detail: 'Gateway feature flag is disabled.' },
      };
    }

    const [meshtastic, sdr] = await Promise.all([this.meshtasticStatus(), this.sdrStatus()]);
    const gatewayId = this.environment.WISE_DEFENSE_GATEWAY_ID;
    const token = this.environment.WISE_DEFENSE_GATEWAY_TOKEN;
    const tenant = this.environment.WISE_DEFENSE_TENANT_ID;
    const cloudConfigured = Boolean(gatewayId && token && tenant && this.environment.WISE_DEFENSE_API_URL);

    return {
      enabled: true,
      meshtastic,
      sdr,
      cloud: cloudConfigured
        ? { state: 'DETECTED_NOT_CONFIGURED', detail: 'Gateway identity is present; cloud activation requires the deployed Wise Defense API and registered gateway.' }
        : { state: 'MISSING_CREDENTIAL', detail: 'Gateway ID, tenant ID, token, or API URL is not configured.' },
    };
  }

  private async meshtasticStatus(): Promise<WiseDefenseHardwareStatus['meshtastic']> {
    const connectionType = this.environment.MESHTASTIC_CONNECTION_TYPE;
    const serialPort = this.environment.MESHTASTIC_SERIAL_PORT;
    if (!connectionType) return { state: 'DETECTED_NOT_CONFIGURED', detail: 'Set MESHTASTIC_CONNECTION_TYPE after attaching the Heltec V3.' };
    if (connectionType === 'serial') {
      if (!serialPort) return { state: 'DETECTED_NOT_CONFIGURED', detail: 'Serial mode selected; MESHTASTIC_SERIAL_PORT is not set.' };
      if (!existsSync(serialPort)) return { state: 'MISSING_HARDWARE', serialPort, detail: 'Configured serial device is not present on this host.' };
      return { state: 'DETECTED_NOT_CONFIGURED', serialPort, detail: 'Serial device detected. Meshtastic traffic remains disabled until gateway enrollment succeeds.' };
    }
    if (connectionType === 'tcp' || connectionType === 'mqtt') {
      return { state: 'DETECTED_NOT_CONFIGURED', detail: `${connectionType.toUpperCase()} selected; endpoint validation waits for real connection settings.` };
    }
    return { state: 'DISABLED', detail: 'Unsupported Meshtastic connection type.' };
  }

  private async sdrStatus(): Promise<WiseDefenseHardwareStatus['sdr']> {
    const deviceType = this.environment.SDR_DEVICE_TYPE;
    if (!deviceType) return { state: 'DETECTED_NOT_CONFIGURED', detail: 'Attach an SDR and set SDR_DEVICE_TYPE to enable receive-only detection.' };
    if (deviceType.toLowerCase() !== 'rtl-sdr') {
      return { state: 'DETECTED_NOT_CONFIGURED', deviceType, detail: 'Configured device type awaits a supported device-specific probe.' };
    }
    try {
      await execFileAsync('rtl_test', ['-t'], { timeout: 8_000, windowsHide: true });
      return { state: 'DETECTED_NOT_CONFIGURED', deviceType, detail: 'RTL-SDR detected. Receive-only capture remains disabled until gateway enrollment succeeds.' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (/No supported devices found|not found|ENOENT/i.test(message)) {
        return { state: 'MISSING_HARDWARE', deviceType, detail: 'No RTL-SDR device detected.' };
      }
      return { state: 'DETECTED_NOT_CONFIGURED', deviceType, detail: 'RTL-SDR probe was inconclusive; verify USB permissions and device attachment.' };
    }
  }
}
