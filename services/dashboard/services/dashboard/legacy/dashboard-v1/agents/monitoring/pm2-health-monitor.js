// PM2 Health Monitor Agent
// Monitors: bot uptime, restart counts, memory usage, CPU usage
const { execSync } = require('child_process');

class PM2HealthMonitor {
  constructor() {
    this.name = 'PM2 Health Monitor';
  }

  async getProcessHealth() {
    try {
      const output = execSync('pm2 jlist 2>/dev/null || echo "[]"', { encoding: 'utf-8' });
      const processes = JSON.parse(output || '[]');

      return processes.map(p => ({
        name: p.name,
        status: p.pm2_env?.status || 'unknown',
        uptime: p.pm2_env?.restart_time ? Math.round((Date.now() - p.pm2_env.restart_time) / 1000) : 0,
        restarts: p.pm2_env?.restart_time ? p.pm2_env.instances?.length || 0 : 0,
        memory: p.monit?.memory || 0,
        cpu: p.monit?.cpu || 0,
        pid: p.pid
      }));
    } catch (error) {
      console.error(`[${this.name}] PM2 health check failed:`, error.message);
      return [];
    }
  }

  async getBottomProcesses() {
    try {
      const processes = await this.getProcessHealth();
      return processes
        .filter(p => p.status !== 'online')
        .sort((a, b) => b.restarts - a.restarts)
        .slice(0, 5);
    } catch (error) {
      return [];
    }
  }

  async getHighMemoryProcesses() {
    try {
      const processes = await this.getProcessHealth();
      const MB = 1024 * 1024;
      return processes
        .filter(p => p.memory > 100 * MB) // > 100MB
        .sort((a, b) => b.memory - a.memory)
        .slice(0, 5);
    } catch (error) {
      return [];
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const allProcesses = await this.getProcessHealth();
    const downProcesses = allProcesses.filter(p => p.status !== 'online');
    const highMemory = await this.getHighMemoryProcesses();

    const report = {
      name: this.name,
      timestamp: new Date(),
      totalProcesses: allProcesses.length,
      onlineProcesses: allProcesses.filter(p => p.status === 'online').length,
      offlineProcesses: downProcesses.length,
      downProcesses: downProcesses.map(p => ({ name: p.name, restarts: p.restarts })),
      highMemoryProcesses: highMemory.map(p => ({
        name: p.name,
        memory: Math.round(p.memory / (1024 * 1024)) + 'MB'
      })),
      status: downProcesses.length === 0 ? 'HEALTHY' : 'WARNING'
    };

    console.log(`[${this.name}] Report complete:`, {
      total: report.totalProcesses,
      online: report.onlineProcesses,
      offline: report.offlineProcesses,
      highMemory: report.highMemoryProcesses.length
    });

    return report;
  }
}

module.exports = PM2HealthMonitor;
