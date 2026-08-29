module.exports = {
  apps: [
    {
      name: 'wise-hvac-demo',
      script: 'pnpm',
      args: 'run dev',
      cwd: __dirname,
      env: {
        PORT: '3024',
        NODE_ENV: 'development',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
