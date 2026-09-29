module.exports = {
  apps: [
    {
      name: "wise2-bot",
      script: "index.js",
      cwd: "./services/bot",
      env: {
        NODE_ENV: "production"
      },
      env_production: {
        NODE_ENV: "production"
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/bot-error.log",
      out_file: "./logs/bot-out.log",
      watch: false,
      ignore_watch: ["node_modules", "logs", ".env"]
    }
  ]
};
