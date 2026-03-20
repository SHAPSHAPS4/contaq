/**
 * Contraq API Proxy Server
 *
 * Securely proxies frontend AI requests to the Anthropic Claude API.
 * Keeps the API key server-side, adds rate limiting, and scales
 * across CPU cores via the Node.js cluster module.
 */

const cluster = require('node:cluster');
const os = require('node:os');

/* ── Cluster: fork one worker per CPU core ────────────────────────── */
if (cluster.isPrimary) {
  // Initialise KB in primary process (validates files, creates learning dir)
  require('dotenv').config();
  const { initKB } = require('./kb/init');
  initKB();

  const numWorkers = Math.max(2, os.cpus().length);
  console.log(`[Contraq API] Primary process ${process.pid} — forking ${numWorkers} workers`);

  for (let i = 0; i < numWorkers; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.warn(`[Contraq API] Worker ${worker.process.pid} exited (code ${code}) — restarting`);
    cluster.fork();
  });

  return; // primary does nothing else
}

/* ── Worker process ───────────────────────────────────────────────── */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const kbIndex = require('./kb/index');
const { kbInjectionMiddleware } = require('./kb/middleware');

const app = express();

const PORT = parseInt(process.env.PORT || '3001', 10);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

if (!ANTHROPIC_API_KEY) {
  console.error('[Contraq API] FATAL: ANTHROPIC_API_KEY not set in .env');
  process.exit(1);
}

/* ── Middleware ────────────────────────────────────────────────────── */

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// CORS — allow configured origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8000')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: function (origin, cb) {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin ' + origin + ' not allowed'));
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
}));

// Body parser — 50 MB limit for base64-encoded PDFs / images
app.use(express.json({ limit: '50mb' }));

// Rate limiting per IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { type: 'rate_limit', message: 'Too many requests — please wait and try again.' } }
});
app.use('/api/', limiter);

// KB injection — assembles per-endpoint knowledge base and attaches to req.kbPrompt
app.use('/api/', kbInjectionMiddleware);

/* ── Modular routes (new structured API + legacy compatibility) ──── */
app.use('/api/drawings', require('./routes/drawings'));
app.use('/api/specs', require('./routes/specs'));
app.use('/api/takeoff', require('./routes/takeoff'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/kb', require('./routes/kb-admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/validate', require('./routes/validation'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/similarity', require('./routes/similarity'));
app.use('/api/versions', require('./routes/versioning'));
app.use('/api/register', require('./routes/drawing-register'));

/* ── Health check ─────────────────────────────────────────────────── */
/* ── Quote Builder frontend ───────────────────────────────────────── */
const serverPath = require('node:path');
app.get('/quote-builder', (_req, res) => {
  res.sendFile(serverPath.join(__dirname, '../public/quote-builder.html'));
});
app.get('/landing', (_req, res) => {
  res.sendFile(serverPath.join(__dirname, '../landing.html'));
});
app.get('/admin/kb', (_req, res) => {
  res.sendFile(serverPath.join(__dirname, '../admin/kb-dashboard.html'));
});
app.get('/pricing', (_req, res) => {
  res.sendFile(serverPath.join(__dirname, '../public/pricing-panel.html'));
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', worker: process.pid });
});

/* ── Shared proxy logic ───────────────────────────────────────────── */

// Allowed models — prevent abuse via arbitrary model switching
const ALLOWED_MODELS = [
  'claude-sonnet-4-6',
  'claude-sonnet-4-20250514',
  'claude-haiku-4-5-20251001'
];

// Max tokens caps per endpoint (prevent cost runaway)
const ENDPOINT_LIMITS = {
  '/api/journal/analyse': 1500,
  '/api/quote-files/analyse': 1500,
  '/api/quotes/extract': 20000,
  '/api/drawings/extract': 8000,
  '/api/specs/analyse': 8000,
  '/api/takeoff/consolidate': 12000,
  '/api/feedback/process': 10000
};

async function proxyToAnthropic(req, res, endpointPath) {
  try {
    const { model, max_tokens, system, messages } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: { type: 'invalid_request', message: 'messages array is required' } });
    }

    // Validate model
    const safeModel = ALLOWED_MODELS.includes(model) ? model : 'claude-sonnet-4-6';

    // Cap max_tokens per endpoint
    const cap = ENDPOINT_LIMITS[endpointPath] || 2000;
    const safeMaxTokens = Math.min(parseInt(max_tokens, 10) || 1000, cap);

    // Build Anthropic request
    const anthropicBody = {
      model: safeModel,
      max_tokens: safeMaxTokens,
      messages
    };
    if (system) anthropicBody.system = system;

    const anthropicResp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION
      },
      body: JSON.stringify(anthropicBody)
    });

    // Stream the status code and body back
    const body = await anthropicResp.text();
    res.status(anthropicResp.status).set('Content-Type', 'application/json').send(body);

  } catch (err) {
    console.error(`[Contraq API] Proxy error (${endpointPath}):`, err.message);
    res.status(502).json({
      error: { type: 'proxy_error', message: 'Failed to reach AI service. Please try again.' }
    });
  }
}

// Expose proxy function to route modules via app.set
app.set('proxyToAnthropic', proxyToAnthropic);

/* ── Endpoint: Journal AI Analysis ────────────────────────────────── */
app.post('/api/journal/analyse', (req, res) => proxyToAnthropic(req, res, '/api/journal/analyse'));

/* ── Endpoint: Quote File Analysis ────────────────────────────────── */
app.post('/api/quote-files/analyse', (req, res) => proxyToAnthropic(req, res, '/api/quote-files/analyse'));

/* ── Endpoint: Quote Builder Extraction ───────────────────────────── */
app.post('/api/quotes/extract', (req, res) => proxyToAnthropic(req, res, '/api/quotes/extract'));

// All KB-enriched endpoints handled by modular routes:
// routes/drawings.js — Drawing extraction (Stage 1)
// routes/specs.js — Spec analysis (Stage 2)
// routes/takeoff.js — Takeoff consolidation (Stage 3)
// routes/feedback.js — Feedback loop with learning persistence
// routes/learning.js — Learning management (GET/DELETE)

/* ── Knowledge Base metadata endpoint ─────────────────────────────── */
app.get('/api/knowledge-base', (_req, res) => {
  res.json(kbIndex.getMetadata());
});

/* ── 404 catch-all ────────────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: { type: 'not_found', message: 'Endpoint not found' } });
});

/* ── Global error handler ─────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error('[Contraq API] Unhandled error:', err.message);
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: { type: 'cors', message: err.message } });
  }
  res.status(500).json({ error: { type: 'server_error', message: 'Internal server error' } });
});

/* ── Start ────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`[Contraq API] Worker ${process.pid} listening on port ${PORT}`);
});
