module.exports = {
  apps: [{
    name: 'wise2-second-brain',
    script: 'server.js',
    cwd: __dirname,
    env: {
      PORT: 3012,
      OLLAMA_MODEL: 'qwen2.5-coder:7b',
      MONGODB_URI: process.env.MONGODB_URI || 'mongodb://admin:admin-dev-password@127.0.0.1:27017/wise2-brain?authSource=admin',
      COMMAND_CENTER_URL: 'http://127.0.0.1:3002',
      JWT_SECRET: process.env.JWT_SECRET,
    },
  }],
};
