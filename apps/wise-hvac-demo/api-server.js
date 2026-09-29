const express = require('express');
const app = express();

app.use(express.json());

// Auth endpoints
app.post('/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const accessToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
  const refreshToken = Buffer.from(`refresh:${email}:${Date.now()}`).toString('base64');

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: Buffer.from(email).toString('base64').slice(0, 8),
      email,
      firstName: email.split('@')[0],
      lastName: 'Tech',
      role: 'TECHNICIAN',
    },
  });
});

app.post('/v1/auth/google', (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: 'idToken required' });
  }

  let email = 'tech@wise2.net';
  try {
    const parts = idToken.split('.');
    if (parts.length === 3) {
      const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      email = decoded.email || email;
    }
  } catch (e) {
    // Use default email
  }

  const accessToken = Buffer.from(`${email}:google:${Date.now()}`).toString('base64');
  const refreshToken = Buffer.from(`refresh:google:${email}:${Date.now()}`).toString('base64');

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: Buffer.from(email).toString('base64').slice(0, 8),
      email,
      firstName: email.split('@')[0],
      lastName: 'Tech',
      role: 'TECHNICIAN',
    },
  });
});

app.post('/v1/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const accessToken = Buffer.from(`refreshed:${Date.now()}`).toString('base64');
  res.json({ accessToken, refreshToken });
});

app.post('/v1/auth/logout', (req, res) => {
  res.json({ success: true });
});

// Fieldtech endpoints
app.get('/v1/fieldtech/jobs', (req, res) => {
  res.json([]);
});

app.get('/v1/fieldtech/jobs/today', (req, res) => {
  res.json([]);
});

app.get('/v1/fieldtech/releases/latest', (req, res) => {
  res.json({
    version: '1.0.2',
    versionCode: 3,
    downloadUrl: 'https://wise2.net/wise-hvac-demo/download',
  });
});

const PORT = process.env.API_PORT || 3025;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on port ${PORT}`);
});
