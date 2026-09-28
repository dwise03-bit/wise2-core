// System Status Service - Fetch real operational metrics

export interface SystemStatus {
  wise2Core: {
    ollama: 'Ready' | 'Offline' | 'Loading' | 'Unknown';
    hermes: 'Ready' | 'Offline' | 'Loading' | 'Unknown';
    codex: 'Ready' | 'Offline' | 'Loading' | 'Unknown';
    modelCount: number;
  };
  vpsOps: {
    docker: { healthy: number; total: number; status: 'Ready' | 'Offline' | 'Loading' | 'Unknown' };
    traefik: 'Online' | 'Offline' | 'Loading' | 'Unknown';
    postgresql: 'Online' | 'Offline' | 'Loading' | 'Unknown';
    redis: 'Online' | 'Offline' | 'Loading' | 'Unknown';
    wise2net: 'Online' | 'Offline' | 'Loading' | 'Unknown';
  };
  gpuAi: {
    gpu: 'READY' | 'OFFLINE' | 'LOADING' | 'UNKNOWN';
    cuda: 'Ready' | 'Offline' | 'Loading' | 'Unknown';
    ollamaModels: 'Ready' | 'Offline' | 'Loading' | 'Unknown';
    claudeCode: 'Ready' | 'Offline' | 'Loading' | 'Unknown';
  };
  access: {
    tailscale: 'Connected' | 'Disconnected' | 'Loading' | 'Unknown';
    user: string;
    accessLevel: string;
    creditMode: 'Active' | 'Inactive';
  };
}

// Fetch Ollama status and model count
async function fetchOllamaStatus(): Promise<{ status: string; count: number }> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return { status: 'Offline', count: 0 };

    const data = await response.json();
    const modelCount = data.models?.length || 0;
    return {
      status: modelCount > 0 ? 'Ready' : 'Offline',
      count: modelCount,
    };
  } catch {
    return { status: 'Offline', count: 0 };
  }
}

// Fetch Codex remote status
async function fetchCodexStatus(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('http://localhost:8080/api/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return 'Offline';

    const data = await response.json();
    return data.status === 'healthy' ? 'Ready' : 'Offline';
  } catch {
    return 'Offline';
  }
}

// Fetch VPS status via API endpoint (will create this)
async function fetchVpsStatus(): Promise<{
  docker: { healthy: number; total: number };
  traefik: string;
  postgresql: string;
  redis: string;
  wise2net: string;
}> {
  try {
    const response = await fetch('/api/system/vps-status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return {
        docker: { healthy: 0, total: 0 },
        traefik: 'Offline',
        postgresql: 'Offline',
        redis: 'Offline',
        wise2net: 'Offline',
      };
    }

    return await response.json();
  } catch {
    return {
      docker: { healthy: 0, total: 0 },
      traefik: 'Offline',
      postgresql: 'Offline',
      redis: 'Offline',
      wise2net: 'Offline',
    };
  }
}

// Fetch GPU/CUDA status via API endpoint
async function fetchGpuStatus(): Promise<{
  gpu: string;
  cuda: string;
  ollamaModels: string;
}> {
  try {
    const response = await fetch('/api/system/gpu-status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return { gpu: 'OFFLINE', cuda: 'Offline', ollamaModels: 'Offline' };
    }

    return await response.json();
  } catch {
    return { gpu: 'OFFLINE', cuda: 'Offline', ollamaModels: 'Offline' };
  }
}

// Fetch Tailscale status via API endpoint
async function fetchTailscaleStatus(): Promise<string> {
  try {
    const response = await fetch('/api/system/tailscale-status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return 'Disconnected';

    const data = await response.json();
    return data.status || 'Unknown';
  } catch {
    return 'Disconnected';
  }
}

// Main function to fetch all system status
export async function fetchSystemStatus(): Promise<SystemStatus> {
  const [ollamaData, vpsData, gpuData, tailscaleStatus, codexStatus] = await Promise.all([
    fetchOllamaStatus(),
    fetchVpsStatus(),
    fetchGpuStatus(),
    fetchTailscaleStatus(),
    fetchCodexStatus(),
  ]);

  return {
    wise2Core: {
      ollama: (ollamaData.status as 'Ready' | 'Offline' | 'Loading' | 'Unknown') || 'Unknown',
      hermes: 'Ready', // Will connect to actual service
      codex: (codexStatus as 'Ready' | 'Offline' | 'Loading' | 'Unknown') || 'Unknown',
      modelCount: ollamaData.count,
    },
    vpsOps: {
      docker: {
        healthy: vpsData.docker.healthy,
        total: vpsData.docker.total,
        status:
          vpsData.docker.healthy === vpsData.docker.total && vpsData.docker.total > 0
            ? 'Ready'
            : 'Offline',
      },
      traefik: (vpsData.traefik as 'Online' | 'Offline' | 'Loading' | 'Unknown') || 'Offline',
      postgresql: (vpsData.postgresql as 'Online' | 'Offline' | 'Loading' | 'Unknown') || 'Offline',
      redis: (vpsData.redis as 'Online' | 'Offline' | 'Loading' | 'Unknown') || 'Offline',
      wise2net: (vpsData.wise2net as 'Online' | 'Offline' | 'Loading' | 'Unknown') || 'Offline',
    },
    gpuAi: {
      gpu: (gpuData.gpu as 'READY' | 'OFFLINE' | 'LOADING' | 'UNKNOWN') || 'OFFLINE',
      cuda: (gpuData.cuda as 'Ready' | 'Offline' | 'Loading' | 'Unknown') || 'Offline',
      ollamaModels: (gpuData.ollamaModels as 'Ready' | 'Offline' | 'Loading' | 'Unknown') || 'Offline',
      claudeCode: 'Ready', // Will connect to actual service
    },
    access: {
      tailscale: (tailscaleStatus as 'Connected' | 'Disconnected' | 'Loading' | 'Unknown') || 'Unknown',
      user: 'DANIEL',
      accessLevel: 'OWNER CONTROL',
      creditMode: 'Active',
    },
  };
}
