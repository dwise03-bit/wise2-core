module.exports = {
  apps: [
    {
      name: 'wise-hvac-demo',
      script: './start-production.sh',
      cwd: __dirname,
      env: {
        PORT: '3024',
        HOSTNAME: '127.0.0.1',
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
