import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    let gpu = 'OFFLINE';
    let cuda = 'Offline';
    let ollamaModels = 'Offline';

    try {
      // Check if nvidia-smi is available (NVIDIA GPU)
      await execAsync('which nvidia-smi', { timeout: 1000 });
      gpu = 'READY';
      cuda = 'Ready';
    } catch (error) {
      // No NVIDIA GPU or nvidia-smi not available
      // Check for Apple Metal (M1/M4 Macs)
      try {
        const { stdout } = await execAsync('sysctl -n machdep.cpu.brand_string 2>/dev/null || echo ""', {
          timeout: 1000,
        });
        if (stdout.includes('Apple') || stdout.includes('M1') || stdout.includes('M4')) {
          gpu = 'READY';
          cuda = 'Ready';
        }
      } catch (e) {
        // Not an Apple Silicon Mac either
      }
    }

    // Check if Ollama has models loaded
    try {
      const { stdout } = await execAsync('curl -s http://localhost:11434/api/tags 2>/dev/null | grep -c "name" || echo "0"', {
        timeout: 2000,
      });
      const modelCount = parseInt(stdout.trim()) || 0;
      ollamaModels = modelCount > 0 ? 'Ready' : 'Offline';
    } catch (error) {
      ollamaModels = 'Offline';
    }

    return NextResponse.json({
      gpu,
      cuda,
      ollamaModels,
    });
  } catch (error) {
    console.error('Error fetching GPU status:', error);
    return NextResponse.json(
      {
        gpu: 'OFFLINE',
        cuda: 'Offline',
        ollamaModels: 'Offline',
      },
      { status: 200 }
    );
  }
}
