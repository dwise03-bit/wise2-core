module.exports = {
  apps: [{
    name: 'wise2-website',
    script: 'npm',
    args: 'start',
    cwd: '/Users/danielwise/Projects/wise2-core/apps/website',
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
