/**
 * PM2 Ecosystem Configuration for Metrics Daemon
 * Run with: pm2 start scripts/monitoring/ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'wise2-metrics-daemon',
      script: './scripts/monitoring/metrics-daemon.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        METRICS_INTERVAL: '60',
      },
      env_production: {
        NODE_ENV: 'production',
        METRICS_INTERVAL: '60',
      },
      error_file: './logs/metrics-daemon-error.log',
      out_file: './logs/metrics-daemon-out.log',
      log_file: './logs/metrics-daemon-combined.log',
      time: true,
    },
  ],
};
