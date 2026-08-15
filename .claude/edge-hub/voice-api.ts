/**
 * WISE² Edge Hub - Voice API
 *
 * HTTP endpoints for voice processing:
 * - POST /voice/request — Process voice request (mic → TTS output)
 * - GET  /voice/test — Test voice capture and playback
 * - GET  /voice/status — Current voice/audio status
 * - GET  /voice/diagnostics — Detailed audio diagnostics
 */

import express from 'express';
import { VoiceCoordinator, VoiceRequest, VoiceResponse } from './voice-coordinator';
import { BluetoothManager } from './bluetooth-manager';
import { DeviceRegistry } from './device-registry';

export class VoiceAPI {
  private app = express();

  constructor(
    private voiceCoordinator: VoiceCoordinator,
    private bluetoothManager: BluetoothManager,
    private registry: DeviceRegistry,
    private port: number = 4901
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Parse JSON request bodies
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Process voice request
    this.app.post('/voice/request', async (req, res) => {
      try {
        const { deviceId, context, timeout } = req.body;

        if (!deviceId) {
          return res.status(400).json({ error: 'deviceId required' });
        }

        const request: VoiceRequest = {
          deviceId,
          context,
          timeout: timeout || 30000,
        };

        const response = await this.voiceCoordinator.processVoiceRequest(request);
        res.json(response);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Test voice capture/playback
    this.app.get('/voice/test', async (req, res) => {
      try {
        const result = await this.voiceCoordinator.testVoice();
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Voice status
    this.app.get('/voice/status', async (req, res) => {
      try {
        const btStatus = await this.bluetoothManager.getDeviceInfo();
        const btDiags = await this.bluetoothManager.getDiagnostics();

        res.json({
          bluetooth: btStatus,
          diagnostics: btDiags,
          connected: btStatus?.connected || false,
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Audio diagnostics
    this.app.get('/voice/diagnostics', async (req, res) => {
      try {
        const audioInfo = await this.voiceCoordinator.getAudioDiagnostics();
        const btInfo = await this.bluetoothManager.getDiagnostics();

        res.json({
          audio: audioInfo,
          bluetooth: btInfo,
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Trigger Bluetooth reconnection
    this.app.post('/voice/reconnect', async (req, res) => {
      try {
        const success = await this.bluetoothManager.connect();
        res.json({ success });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Disconnect Bluetooth
    this.app.post('/voice/disconnect', async (req, res) => {
      try {
        await this.bluetoothManager.disconnect();
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });

    // Get device-specific voice status
    this.app.get('/voice/devices/:deviceId', async (req, res) => {
      try {
        const device = this.registry.getDevice(req.params.deviceId);

        if (!device) {
          return res.status(404).json({ error: 'Device not found' });
        }

        res.json({
          device,
          voiceCapable: device.lastHeartbeat?.features?.includes('audio') || false,
          lastHeartbeat: device.lastHeartbeat,
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, '127.0.0.1', () => {
        console.log(`[Voice API] Listening on http://127.0.0.1:${this.port}`);
        resolve();
      });
    });
  }
}

// Standalone server
if (require.main === module) {
  import('./device-registry')
    .then(async (registryMod) => {
      import('./voice-coordinator').then(async (coordMod) => {
        import('./bluetooth-manager').then(async (btMod) => {
          const registry = await registryMod.createRegistry();
          const btManager = await btMod.createBluetoothManager();
          const coordinator = await coordMod.createVoiceCoordinator(btManager);

          const api = new VoiceAPI(coordinator, btManager, registry);
          await api.start();

          // Connect Bluetooth at startup
          console.log('[Voice API] Connecting to E09 speaker...');
          btManager.connect().catch((err) => {
            console.warn('[Voice API] Bluetooth connection failed (will retry):', err);
          });

          // Graceful shutdown
          process.on('SIGTERM', async () => {
            console.log('[Voice API] Shutting down...');
            await btManager.disconnect();
            await registry.disconnect();
            process.exit(0);
          });
        });
      });
    })
    .catch((err) => {
      console.error('[Voice API] Failed to start:', err);
      process.exit(1);
    });
}

export async function createVoiceAPI(
  voiceCoordinator: VoiceCoordinator,
  bluetoothManager: BluetoothManager,
  registry: DeviceRegistry
): Promise<VoiceAPI> {
  const api = new VoiceAPI(voiceCoordinator, bluetoothManager, registry);
  await api.start();
  return api;
}
