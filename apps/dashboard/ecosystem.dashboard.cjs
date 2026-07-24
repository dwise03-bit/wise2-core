module.exports = {
  apps: [{
    name: 'wise2-dashboard',
    script: 'bash',
    args: '-c "PORT=3004 npm start"',
    cwd: '/home/dwise/wise2-core/apps/dashboard',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',
  }]
};
