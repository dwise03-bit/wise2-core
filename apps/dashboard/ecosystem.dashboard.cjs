module.exports = {
  apps: [{
    name: 'wise2-dashboard',
    script: './start-dashboard.sh',
    cwd: '/home/dwise/wise2-core/apps/dashboard',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
  }]
};
