module.exports = {
  apps: [{
    name: 'jo-credit-os-demo',
    script: 'proxy-server.js',
    cwd: __dirname,
    env: { 
      PORT: '3000',
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    max_memory_restart: '500M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
  }]
};
