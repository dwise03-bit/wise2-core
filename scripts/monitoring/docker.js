#!/usr/bin/env node

/**
 * Docker Container Monitoring Script
 * Collects metrics: container status, CPU/memory usage, network I/O
 */

const { execSync } = require('child_process');

class DockerMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      type: 'docker',
    };
  }

  /**
   * Execute docker command safely
   */
  dockerCommand(command) {
    try {
      return execSync(`docker ${command}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
        .trim();
    } catch (error) {
      console.error(`Docker command failed: ${command}`, error.message);
      return null;
    }
  }

  /**
   * Get list of running containers
   */
  getRunningContainers() {
    try {
      const output = this.dockerCommand('ps --format "{{.Names}}"');
      return output ? output.split('\n').filter((name) => name.trim()) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get container stats
   */
  getContainerStats() {
    try {
      const output = this.dockerCommand(
        'stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"',
      );
      if (!output) return [];

      const lines = output.split('\n').slice(1); // Skip header
      return lines
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split('\t');
          return {
            container: parts[0],
            cpu: parts[1],
            memory: parts[2],
            network: parts[3],
          };
        });
    } catch {
      return [];
    }
  }

  /**
   * Get overall Docker daemon info
   */
  getDaemonInfo() {
    try {
      const output = this.dockerCommand('info --format "json"');
      return JSON.parse(output || '{}');
    } catch {
      return null;
    }
  }

  /**
   * Get container status (running/stopped)
   */
  getContainerStatus() {
    try {
      const running = this.dockerCommand('ps -q | wc -l');
      const total = this.dockerCommand('ps -a -q | wc -l');

      return {
        running: parseInt(running || '0', 10),
        stopped: parseInt(total || '0', 10) - parseInt(running || '0', 10),
        total: parseInt(total || '0', 10),
      };
    } catch {
      return { running: 0, stopped: 0, total: 0 };
    }
  }

  /**
   * Get image information
   */
  getImageInfo() {
    try {
      const output = this.dockerCommand('images --format "{{.Repository}}:{{.Tag}}\t{{.Size}}"');
      if (!output) return [];

      return output
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const [image, size] = line.split('\t');
          return { image, size };
        });
    } catch {
      return [];
    }
  }

  /**
   * Check if Docker is accessible
   */
  isDockerAvailable() {
    try {
      this.dockerCommand('--version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Collect all metrics
   */
  collect() {
    if (!this.isDockerAvailable()) {
      return {
        ...this.metrics,
        available: false,
        error: 'Docker daemon not accessible',
      };
    }

    return {
      ...this.metrics,
      available: true,
      status: this.getContainerStatus(),
      containers: this.getRunningContainers(),
      stats: this.getContainerStats(),
      images: this.getImageInfo(),
      daemon: this.getDaemonInfo(),
    };
  }
}

// Main execution
if (require.main === module) {
  const monitor = new DockerMonitor();
  const metrics = monitor.collect();
  console.log(JSON.stringify(metrics, null, 2));
}

module.exports = { DockerMonitor };
