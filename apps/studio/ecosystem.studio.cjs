module.exports = {
  apps: [{
    name: 'wise2-studio',
    script: 'node',
    args: '.next/standalone/apps/studio/server.js',
    cwd: '/home/dwise/wise2-core/apps/studio',
    env: {
      PORT: '3001',
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '800M',
  }]
};
