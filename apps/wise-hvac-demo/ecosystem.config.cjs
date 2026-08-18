module.exports = {
  apps: [
    {
      name: 'wise-hvac-demo',
      script: 'node',
      args: 'apps/wise-hvac-demo/server.js',
      cwd: '/home/dwise/wise2-core/apps/wise-hvac-demo/.next/standalone',
      env: {
        PORT: '3024',
        HOSTNAME: '0.0.0.0',
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
