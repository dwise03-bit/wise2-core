module.exports = {
  apps: [
    {
      name: "wise2-bot",
      cwd: __dirname,
      script: "index.js",
      autorestart: true,
      max_restarts: 5,
      min_uptime: 5000,
      exp_backoff_restart_delay: 10000,
      env: {
        NODE_ENV: "production",
        COMFYUI_API_URL: "http://127.0.0.1:8188",
      },
    },
  ],
};
