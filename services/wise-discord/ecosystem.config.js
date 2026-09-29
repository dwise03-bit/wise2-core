module.exports = {
  apps: [{
    name: 'wise2-discord',
    script: 'bot.js',
    cwd: '/home/dwise/wise2-core/services/wise-discord',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '128M',
    env: {
      NODE_ENV: 'production',
      BRAIN_API_URL: 'http://127.0.0.1:3011/api',
      COMMAND_CENTER_URL: 'http://127.0.0.1:3004',
    },
  }],
};
