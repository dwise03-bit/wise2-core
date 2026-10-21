/**
 * WISE² Ultimate Hub - Advanced Monitoring & Metrics
 * Real-time performance tracking, auto-scaling triggers, alerting
 */

const os = require('os');

class HubMonitor {
  constructor() {
    this.metrics = {
      uptime: 0,
      requests: 0,
      errors: 0,
      latency: [],
      connections: 0,
      cpu_usage: 0,
      memory_usage: 0,
      alerts: []
    };
    this.thresholds = {
      cpu_critical: 80,
      memory_critical: 85,
      latency_warning: 1000,
      error_rate: 5
    };
  }

  recordRequest(latency) {
    this.metrics.requests++;
    this.metrics.latency.push(latency);
    if (this.metrics.latency.length > 100) {
      this.metrics.latency.shift();
    }

    if (latency > this.thresholds.latency_warning) {
      this.recordAlert('HIGH_LATENCY', latency);
    }
  }

  recordError() {
    this.metrics.errors++;
    const errorRate = (this.metrics.errors / this.metrics.requests) * 100;
    if (errorRate > this.thresholds.error_rate) {
      this.recordAlert('HIGH_ERROR_RATE', errorRate);
    }
  }

  updateSystemMetrics() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    const cpu = this.getCPUUsage();
    const memory = ((totalMem - freeMem) / totalMem) * 100;

    this.metrics.cpu_usage = cpu;
    this.metrics.memory_usage = memory;

    if (cpu > this.thresholds.cpu_critical) {
      this.recordAlert('CPU_CRITICAL', cpu);
    }
    if (memory > this.thresholds.memory_critical) {
      this.recordAlert('MEMORY_CRITICAL', memory);
    }
  }

  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0, totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    return 100 - ~~(100 * totalIdle / totalTick);
  }

  recordAlert(type, value) {
    this.metrics.alerts.push({
      type,
      value,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type)
    });

    if (this.metrics.alerts.length > 50) {
      this.metrics.alerts.shift();
    }
  }

  getAlertSeverity(type) {
    const severities = {
      'HIGH_LATENCY': 'warning',
      'HIGH_ERROR_RATE': 'warning',
      'CPU_CRITICAL': 'critical',
      'MEMORY_CRITICAL': 'critical'
    };
    return severities[type] || 'info';
  }

  getAverageLatency() {
    if (!this.metrics.latency.length) return 0;
    const sum = this.metrics.latency.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.metrics.latency.length);
  }

  shouldScaleUp() {
    return this.metrics.cpu_usage > 70 ||
           this.metrics.memory_usage > 75 ||
           this.getAverageLatency() > 500;
  }

  getMetrics() {
    return {
      ...this.metrics,
      average_latency: this.getAverageLatency(),
      error_rate: this.metrics.requests > 0 ?
        ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) : 0,
      scale_up_recommended: this.shouldScaleUp(),
      timestamp: new Date().toISOString()
    };
  }

  getHealthScore() {
    let score = 100;

    if (this.metrics.cpu_usage > 70) score -= 20;
    if (this.metrics.memory_usage > 75) score -= 20;
    if (this.getAverageLatency() > 500) score -= 15;
    if ((this.metrics.errors / this.metrics.requests) * 100 > 5) score -= 15;

    return Math.max(0, score);
  }
}

module.exports = HubMonitor;
