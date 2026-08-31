module.exports = {
  apps: [
    {
      name: "wise2-bot",
      cwd: __dirname,
      script: "index.js",
      autorestart: true,
      max_restarts: 2,
      min_uptime: 60000,
      restart_delay: 300000,
      exp_backoff_restart_delay: 600000,
      env: {
        NODE_ENV: "production",
        COMFYUI_API_URL: process.env.COMFYUI_API_URL || "http://100.68.145.5:8188",
      },
    },
  ],
};
