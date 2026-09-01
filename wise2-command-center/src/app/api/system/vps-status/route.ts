import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    let dockerStatus = { healthy: 0, total: 0 };
    let traefik = 'Offline';
    let postgresql = 'Offline';
    let redis = 'Offline';
    let wise2net = 'Offline';

    try {
      // Get Docker containers from VPS
      const { stdout: dockerOutput } = await execAsync(
        'ssh dwise@173.208.147.165 "docker ps --format \'{{.Names}}\'" 2>/dev/null',
        { timeout: 5000, shell: '/bin/bash' }
      );

      if (dockerOutput && dockerOutput.trim().length > 0) {
        const containers = dockerOutput.trim().split('\n').filter((line) => line.trim().length > 0);

        // Count running containers (healthy)
        const healthyCount = containers.length;

        // Expected services
        const expectedServices = 8;

        dockerStatus = {
          healthy: Math.min(healthyCount, expectedServices),
          total: expectedServices,
        };

        // If we got container output, services are likely online
        if (healthyCount > 0) {
          traefik = 'Online';
          postgresql = 'Online';
          redis = 'Online';
          wise2net = 'Online';
        }
      }
    } catch (error) {
      console.error('Failed to fetch VPS status:', error);
      // Services remain offline on error
    }

    return NextResponse.json({
      docker: dockerStatus,
      traefik,
      postgresql,
      redis,
      wise2net,
    });
  } catch (error) {
    console.error('Error in VPS status endpoint:', error);
    return NextResponse.json(
      {
        docker: { healthy: 0, total: 0 },
        traefik: 'Offline',
        postgresql: 'Offline',
        redis: 'Offline',
        wise2net: 'Offline',
      },
      { status: 200 }
    );
  }
}
