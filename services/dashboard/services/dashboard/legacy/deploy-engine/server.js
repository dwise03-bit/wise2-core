const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

const ADMIN_KEY = process.env.ADMIN_KEY;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}

app.get('/status', async (req, res) => {
  res.json({ ok: true, service: 'deploy-engine' });
});

app.post('/deploy', async (req, res) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(403).json({ error: 'unauthorized' });
  }

  try {
    const output = await run(`
      cd ~/wise-defense-saas &&
      git pull &&
      docker compose up -d --build
    `);

    res.json({ success: true, output });
  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
});

app.listen(4000, () => {
  console.log('Deploy Engine running on 4000');
});
