/**
 * PM2 Ecosystem Config - WISE² Edge Hub
 *
 * Defines processes managed by PM2 on the Raspberry Pi.
 * Deploy with: pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'wise2-edge-registry',
      script: 'dist/device-registry.js',
      cwd: '/home/dwise/wise2-edge/app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        MQTT_URL: 'mqtt://127.0.0.1:1883',
        LOG_LEVEL: 'info',
      },
      error_file: 'logs/registry-error.log',
      out_file: 'logs/registry-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      kill_timeout: 5000,
    },
    {
      name: 'wise2-edge-health',
      script: 'dist/health-api.js',
      cwd: '/home/dwise/wise2-edge/app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        MQTT_URL: 'mqtt://127.0.0.1:1883',
        HEALTH_PORT: 4900,
        LOG_LEVEL: 'info',
      },
      error_file: 'logs/health-error.log',
      out_file: 'logs/health-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      kill_timeout: 5000,
    },
    {
      name: 'wise2-edge-voice',
      script: 'dist/voice-api.js',
      cwd: '/home/dwise/wise2-edge/app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        MQTT_URL: 'mqtt://127.0.0.1:1883',
        VOICE_PORT: 4901,
        HERMES_URL: 'http://127.0.0.1:3012',
        OLLAMA_URL: 'http://127.0.0.1:11434',
        LOG_LEVEL: 'info',
      },
      error_file: 'logs/voice-error.log',
      out_file: 'logs/voice-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      kill_timeout: 5000,
    },
    {
      name: 'wise2-edge-support',
      script: 'dist/support-api.js',
      cwd: '/home/dwise/wise2-edge/app',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        MQTT_URL: 'mqtt://127.0.0.1:1883',
        SUPPORT_PORT: 4902,
        LOG_LEVEL: 'info',
      },
      error_file: 'logs/support-error.log',
      out_file: 'logs/support-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      kill_timeout: 5000,
    },
  ],

  deploy: {
    production: {
      user: 'dwise',
      host: 'wisepi.tail44396d.ts.net',
      ref: 'origin/main',
      repo: 'git@github.com:dwise/wise2-core.git',
      path: '/home/dwise/wise2-edge',
      'post-deploy':
        'npm install && npm run build && pm2 start ecosystem.config.js --env production',
      'pre-deploy-local': 'echo "Deploying to Pi..."',
    },
  },
};
