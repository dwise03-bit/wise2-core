'use strict';

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3011', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wise2-brain';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:latest';
const DB_NAME = 'wise2-brain';
const COLLECTION = 'knowledge_entries';

// ── App ──────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));

// ── MongoDB ───────────────────────────────────────────────────────────────────
let db = null;
let mongoConnected = false;

async function connectMongo() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    // Ensure text index for search
    await db.collection(COLLECTION).createIndex(
      { title: 'text', content: 'text', tags: 'text' },
      { name: 'knowledge_text_idx', weights: { title: 3, tags: 2, content: 1 } }
    );
    mongoConnected = true;
    console.log(`[brain] MongoDB connected: ${DB_NAME}`);
  } catch (err) {
    console.error('[brain] MongoDB connection failed:', err.message);
    mongoConnected = false;
    // Retry after 10s
    setTimeout(connectMongo, 10000);
  }
}

// ── Ollama health ─────────────────────────────────────────────────────────────
let ollamaAvailable = false;

async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(3000) });
    ollamaAvailable = res.ok;
  } catch {
    ollamaAvailable = false;
  }
}

setInterval(checkOllama, 30000);

// ── JWT Auth middleware ────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Helper: call Ollama ────────────────────────────────────────────────────────
async function callOllama(prompt, system = '') {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

// ────────────────────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────────────────────

// Public health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'wise2-second-brain',
    version: '1.0.0',
    mongo: mongoConnected ? 'connected' : 'disconnected',
    ollama: ollamaAvailable ? 'connected' : 'disconnected',
    model: OLLAMA_MODEL,
    timestamp: new Date().toISOString(),
  });
});

// ── Command Center compatibility endpoints ────────────────────────────────────
app.get('/api/v1/brain-auth/status', requireAuth, async (req, res) => {
  let knowledgeCount = 0;
  if (mongoConnected) {
    try { knowledgeCount = await db.collection(COLLECTION).countDocuments(); } catch {}
  }
  res.json({
    authenticated: true,
    online: true,
    knowledgeCount,
    mongo: mongoConnected,
    ollama: ollamaAvailable,
  });
});

app.get('/api/v1/brain-auth/knowledge/graph/stats', requireAuth, async (req, res) => {
  let nodes = 0;
  if (mongoConnected) {
    try { nodes = await db.collection(COLLECTION).countDocuments(); } catch {}
  }
  res.json({ nodes, edges: 0 });
});

app.get('/api/v1/brain-auth/chat/health', requireAuth, async (req, res) => {
  await checkOllama();
  if (ollamaAvailable) {
    res.json({ status: 'connected', provider: 'ollama', model: OLLAMA_MODEL });
  } else {
    res.status(503).json({ status: 'unavailable', provider: 'ollama' });
  }
});

// ── Knowledge CRUD ─────────────────────────────────────────────────────────────

// Create knowledge
app.post('/api/brain/knowledge', requireAuth, async (req, res) => {
  if (!mongoConnected) return res.status(503).json({ error: 'Database unavailable' });
  const { title, content, tags = [], business = 'wise2', type = 'knowledge' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });

  const entry = {
    title,
    content,
    tags: Array.isArray(tags) ? tags : [],
    business,
    type,
    createdBy: req.user.sub || req.user.id || 'unknown',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const result = await db.collection(COLLECTION).insertOne(entry);
    res.status(201).json({ success: true, id: result.insertedId, entry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to store knowledge', detail: err.message });
  }
});

// List knowledge
app.get('/api/brain/knowledge', requireAuth, async (req, res) => {
  if (!mongoConnected) return res.status(503).json({ error: 'Database unavailable' });
  const limit = Math.min(parseInt(req.query.limit || '50'), 200);
  const business = req.query.business;
  const filter = business ? { business } : {};
  try {
    const entries = await db.collection(COLLECTION).find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
    const total = await db.collection(COLLECTION).countDocuments(filter);
    res.json({ total, entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list knowledge', detail: err.message });
  }
});

// Search knowledge (text search)
app.get('/api/brain/knowledge/search', requireAuth, async (req, res) => {
  if (!mongoConnected) return res.status(503).json({ error: 'Database unavailable' });
  const q = req.query.q;
  const limit = Math.min(parseInt(req.query.limit || '20'), 100);
  if (!q) return res.status(400).json({ error: 'q parameter required' });

  try {
    const results = await db.collection(COLLECTION)
      .find(
        { $text: { $search: q } },
        { projection: { score: { $meta: 'textScore' }, title: 1, content: 1, tags: 1, business: 1, createdAt: 1 } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .toArray();
    res.json({ query: q, results: results.length, entries: results });
  } catch (err) {
    // Fallback: regex search if text index not ready
    try {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const results = await db.collection(COLLECTION)
        .find({ $or: [{ title: regex }, { content: regex }, { tags: regex }] })
        .limit(limit)
        .toArray();
      res.json({ query: q, results: results.length, entries: results });
    } catch (e2) {
      res.status(500).json({ error: 'Search failed', detail: e2.message });
    }
  }
});

// Delete knowledge
app.delete('/api/brain/knowledge/:id', requireAuth, async (req, res) => {
  if (!mongoConnected) return res.status(503).json({ error: 'Database unavailable' });
  try {
    const result = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed', detail: err.message });
  }
});

// ── RAG Chat ───────────────────────────────────────────────────────────────────
app.post('/api/brain/chat', requireAuth, async (req, res) => {
  const { message, business } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  if (!ollamaAvailable) {
    return res.status(503).json({ error: 'AI provider unavailable', provider: 'ollama' });
  }

  // Retrieve relevant knowledge
  let context = '';
  let sources = [];
  if (mongoConnected) {
    try {
      const filter = business ? { business } : {};
      const textFilter = { $text: { $search: message }, ...filter };
      let results = await db.collection(COLLECTION)
        .find(textFilter, { projection: { score: { $meta: 'textScore' }, title: 1, content: 1, business: 1 } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(5)
        .toArray();

      if (results.length === 0) {
        // Fallback: regex on the first significant word
        const word = message.split(/\s+/).find(w => w.length > 3) || message.slice(0, 20);
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        results = await db.collection(COLLECTION)
          .find({ $or: [{ title: regex }, { content: regex }], ...filter })
          .limit(5)
          .toArray();
      }

      sources = results.map(r => ({ id: r._id, title: r.title, business: r.business }));
      if (results.length > 0) {
        context = results.map(r => `[${r.title}]\n${r.content}`).join('\n\n---\n\n');
      }
    } catch { /* proceed without context */ }
  }

  const systemPrompt = `You are the WISE² Second Brain — an AI assistant for business intelligence.
You help users understand their business data, projects, and knowledge base.
${context ? `\nRelevant knowledge from the knowledge base:\n\n${context}\n\nUse this context to provide accurate, grounded answers.` : 'No specific knowledge found for this query. Answer from general knowledge.'}
Be concise, direct, and business-focused.`;

  try {
    const response = await callOllama(message, systemPrompt);
    res.json({
      response,
      model: OLLAMA_MODEL,
      sources,
      contextUsed: sources.length > 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'AI request failed', detail: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
(async () => {
  await connectMongo();
  await checkOllama();

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[brain] WISE² Second Brain API running on 127.0.0.1:${PORT}`);
    console.log(`[brain] MongoDB: ${mongoConnected ? 'connected' : 'pending'}`);
    console.log(`[brain] Ollama: ${ollamaAvailable ? 'connected' : 'unavailable'} (${OLLAMA_MODEL})`);
  });
})();
