/**
 * WISE² Edge Hub - Support API
 *
 * HTTP endpoints for remote diagnostics and troubleshooting:
 * - POST /support/bundle — Generate support bundle
 * - GET  /support/bundles — List available bundles
 * - GET  /support/bundle/{id} — Download bundle
 * - POST /support/bundle/{id}/delete — Remove bundle
 * - GET  /support/diagnostics — Quick diagnostics
 */

import express from 'express';
import { RemoteSupport } from './remote-support';
import { DeviceRegistry } from './device-registry';

export class SupportAPI {
  private app = express();

  constructor(
    private remoteSupport: RemoteSupport,
    private registry: DeviceRegistry,
    private port: number = 4902
  ) {
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Generate new support bundle
    this.app.post('/support/bundle', async (req, res) => {
      try {
        const includeSecrets = req.query.include_secrets === 'true';
        const bundle = await this.remoteSupport.generateBundle(includeSecrets);

        res.json({
          success: true,
          bundle: {
            id: bundle.path.split('/').pop(),
            timestamp: new Date(bundle.timestamp).toISOString(),
            size: `${(bundle.size / 1024).toFixed(2)} KB`,
            redacted: bundle.redacted,
            summary: bundle.summary,
          },
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Bundle generation failed' });
      }
    });

    // List bundles
    this.app.get('/support/bundles', (req, res) => {
      try {
        const bundles = this.remoteSupport.listBundles();

        res.json({
          total: bundles.length,
          bundles: bundles.map(b => ({
            id: b.path.split('/').pop(),
            timestamp: new Date(b.timestamp).toISOString(),
            size: `${(b.size / 1024).toFixed(2)} KB`,
            redacted: b.redacted,
          })),
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'List failed' });
      }
    });

    // Download bundle
    this.app.get('/support/bundle/:id', async (req, res) => {
      try {
        const bundles = this.remoteSupport.listBundles();
        const bundle = bundles.find(b => b.path.includes(req.params.id));

        if (!bundle) {
          return res.status(404).json({ error: 'Bundle not found' });
        }

        const buffer = await this.remoteSupport.exportBundle(bundle.path);
        res.setHeader('Content-Type', 'application/gzip');
        res.setHeader('Content-Disposition', `attachment; filename="${req.params.id}.tar.gz"`);
        res.send(buffer);
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Download failed' });
      }
    });

    // Delete bundle
    this.app.post('/support/bundle/:id/delete', (req, res) => {
      try {
        const bundles = this.remoteSupport.listBundles();
        const bundle = bundles.find(b => b.path.includes(req.params.id));

        if (!bundle) {
          return res.status(404).json({ error: 'Bundle not found' });
        }

        const success = this.remoteSupport.deleteBundle(bundle.path);
        res.json({ success });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Delete failed' });
      }
    });

    // Quick diagnostics (no bundle generation)
    this.app.get('/support/diagnostics', async (req, res) => {
      try {
        const devices = this.registry.getAllDevices();
        const onlineCount = devices.filter(d => d.isOnline).length;

        res.json({
          timestamp: Date.now(),
          devices: {
            total: devices.length,
            online: onlineCount,
            devices: devices.map(d => ({
              id: d.deviceId,
              type: d.deviceType,
              status: d.isOnline ? 'online' : 'offline',
              lastSeen: new Date(d.lastSeen).toISOString(),
            })),
          },
          services: {
            registry: 'running',
            health: 'running',
            voice: 'running',
            support: 'running',
          },
        });
      } catch (err) {
        res.status(500).json({ error: err instanceof Error ? err.message : 'Diagnostics failed' });
      }
    });

    // Quick health check
    this.app.get('/support/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime(),
      });
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, '127.0.0.1', () => {
        console.log(`[Support API] Listening on http://127.0.0.1:${this.port}`);
        resolve();
      });
    });
  }
}

export async function createSupportAPI(
  remoteSupport: RemoteSupport,
  registry: DeviceRegistry
): Promise<SupportAPI> {
  const api = new SupportAPI(remoteSupport, registry);
  await api.start();
  return api;
}
