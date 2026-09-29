import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    let status = 'Unknown';

    try {
      // Check Tailscale status
      const { stdout } = await execAsync('tailscale status 2>/dev/null | head -1', { timeout: 2000 });

      if (stdout.includes('Logged in')) {
        status = 'Connected';
      } else if (stdout.includes('Stopped')) {
        status = 'Disconnected';
      } else {
        status = stdout.trim() || 'Unknown';
      }
    } catch (error) {
      // Tailscale might not be installed
      status = 'Disconnected';
    }

    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error fetching Tailscale status:', error);
    return NextResponse.json({ status: 'Unknown' }, { status: 200 });
  }
}
