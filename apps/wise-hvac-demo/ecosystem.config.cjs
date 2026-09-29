module.exports = {
  apps: [
    {
      name: 'wise-hvac-demo',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3024',
      cwd: __dirname,
      env: {
        PORT: '3024',
        NODE_ENV: 'production',
        NEXT_PUBLIC_HVAC_URL: 'https://hvac.wise2.net',
        WISE_HVAC_DEMO_MODE: 'false',
        NEXT_PUBLIC_DEMO_MODE: 'false',
        WISE2_API_URL: 'https://wise2.net/api',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
    },
  ],
};
