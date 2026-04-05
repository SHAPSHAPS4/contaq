/**
 * Contraq API Proxy Server
 *
 * Securely proxies frontend AI requests to the Anthropic Claude API.
 * Keeps the API key server-side, adds rate limiting, and scales
 * across CPU cores via the Node.js cluster module.
 */

/* ── Single process mode (production-safe, memory-efficient) ──────── */
// Clustering disabled — Railway/Render handle scaling via replicas instead
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

// Security headers — allow inline scripts/styles/onclick handlers for the frontend
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://cdn.sheetjs.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://api.anthropic.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "data:", "blob:"],
    }
  }
}));

// Gzip compression
app.use(compression());

// CORS — allow configured origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8000')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: function (origin, cb) {
    // Allow requests with no origin (curl, Postman, same-origin in production)
    if (!origin) return cb(null, true);
    // Allow configured origins + any Railway/Vercel deployment URLs
    if (allowedOrigins.includes(origin) || origin.endsWith('.railway.app') || origin.endsWith('.up.railway.app')) return cb(null, true);
    cb(new Error('CORS: origin ' + origin + ' not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Stripe webhook must receive raw body BEFORE express.json() parses it
const billingRoutes = require('./routes/billing');
app.use('/api/billing/webhook', billingRoutes);

// Body parser — 50 MB limit for base64-encoded PDFs / images
app.use(express.json({ limit: '50mb' }));

// Rate limiting per IP
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '60', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { type: 'rate_limit', message: 'Too many requests — please wait and try again.' } }
});
app.use('/api/', limiter);

// KB injection — assembles per-endpoint knowledge base and attaches to req.kbPrompt
app.use('/api/', kbInjectionMiddleware);

/* ── Initialize email service ─────────────────────────────────────── */
const emailService = require('./services/email');
emailService.init();

/* ── Auth, Data & Billing routes (Supabase-backed) ───────────────── */
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const betaRoutes = require('./routes/beta');
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/beta', betaRoutes);
app.use('/api/billing', billingRoutes);  // checkout, portal, status (JSON body routes)

/* ── Modular routes (new structured API + legacy compatibility) ──── */
app.use('/api/pricebook', require('./routes/pricebook-import'));
app.use('/api/clients', require('./routes/client-import'));
app.use('/api/folders', require('./routes/folder-analyse'));
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
app.use('/api/admin/training', require('./routes/training-hub'));
app.use('/api/ai', require('./routes/ai-pipeline'));
app.use('/api/documents', require('./routes/documents-api'));

// CV service health check
app.get('/api/cv/health', async (_req, res) => {
  try {
    const cvClient = require('./services/cv-client');
    const health = await cvClient.healthCheck();
    res.json({ success: true, ...health });
  } catch (e) {
    res.json({ success: false, available: false, error: e.message });
  }
});

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

// ─── Health check (simple) ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', worker: process.pid });
});

// ─── Status page (detailed — for monitoring) ──────────────────────
const _serverStartTime = Date.now();
let _requestCount = 0;
let _errorCount = 0;
app.use((_req, _res, next) => { _requestCount++; next(); });

app.get('/api/status', async (_req, res) => {
  const uptime = Math.round((Date.now() - _serverStartTime) / 1000);
  const status = {
    status: 'operational',
    version: '1.0.0-beta',
    uptime_seconds: uptime,
    uptime_human: Math.floor(uptime/3600) + 'h ' + Math.floor((uptime%3600)/60) + 'm',
    requests_served: _requestCount,
    errors: _errorCount,
    services: {
      api: { status: 'operational' },
      database: { status: 'checking' },
      ai: { status: 'operational', provider: 'Anthropic Claude' }
    },
    timestamp: new Date().toISOString()
  };

  // Check database
  try {
    const { supabaseAdmin } = require('./db/supabase');
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('organizations').select('id').limit(1);
      status.services.database.status = error ? 'degraded' : 'operational';
      if (error) status.services.database.error = error.message;
    } else {
      status.services.database.status = 'not_configured';
    }
  } catch(e) {
    status.services.database.status = 'down';
    status.services.database.error = e.message;
  }

  // Check AI key
  if (!process.env.ANTHROPIC_API_KEY) {
    status.services.ai.status = 'not_configured';
  }

  // Overall status
  const allOp = Object.values(status.services).every(s => s.status === 'operational');
  status.status = allOp ? 'operational' : 'degraded';

  res.json(status);
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
  '/api/feedback/process': 10000,
  '/api/pricebook/import': 16000,
  '/api/clients/import': 16000,
  '/api/folders/analyse': 4000
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

    // Build Anthropic request — use streaming to avoid Cloudflare 524 timeout
    const anthropicBody = {
      model: safeModel,
      max_tokens: safeMaxTokens,
      messages,
      stream: true  // Stream to keep connection alive through Cloudflare
    };
    if (system) anthropicBody.system = system;

    // Log request size for debugging
    const bodySize = JSON.stringify(req.body).length;
    console.log(`[Contraq API] ${endpointPath}: ${bodySize} bytes, model=${safeModel}, max_tokens=${safeMaxTokens}, stream=true`);
    const startTime = Date.now();

    // 3-minute timeout for large PDF extractions
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    // Always include PDF beta header — lightweight and avoids missed detection
    const anthropicResp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-beta': 'pdfs-2024-09-25'
      },
      body: JSON.stringify(anthropicBody),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!anthropicResp.ok) {
      const errorBody = await anthropicResp.text();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`[Contraq API] ${endpointPath}: Anthropic error ${anthropicResp.status} in ${elapsed}s`);
      return res.status(anthropicResp.status).set('Content-Type', 'application/json').send(errorBody);
    }

    // Collect streamed chunks and reconstruct a standard (non-streaming) response
    // This keeps Cloudflare alive (data flowing) while giving the frontend a normal JSON response
    let fullText = '';
    let usage = { input_tokens: 0, output_tokens: 0 };
    let stopReason = 'end_turn';
    let respModel = safeModel;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const reader = anthropicResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);

          if (event.type === 'content_block_delta' && event.delta?.text) {
            fullText += event.delta.text;
            // Send a keepalive comment to prevent Cloudflare timeout
            res.write(': keepalive\n\n');
          }
          if (event.type === 'message_start' && event.message) {
            respModel = event.message.model || respModel;
            if (event.message.usage) usage.input_tokens = event.message.usage.input_tokens;
          }
          if (event.type === 'message_delta') {
            stopReason = event.delta?.stop_reason || stopReason;
            if (event.usage) usage.output_tokens = event.usage.output_tokens;
          }
        } catch {}
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Contraq API] ${endpointPath}: Streamed ${fullText.length} chars in ${elapsed}s (${usage.input_tokens}+${usage.output_tokens} tokens)`);

    // Send the reconstructed complete response as the final SSE event
    const reconstructed = JSON.stringify({
      id: 'msg_proxy_' + Date.now(),
      type: 'message',
      role: 'assistant',
      content: [{ type: 'text', text: fullText }],
      model: respModel,
      stop_reason: stopReason,
      usage
    });
    res.write(`data: ${reconstructed}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    const errMsg = err.name === 'AbortError'
      ? 'AI request timed out (3 min). Try with fewer pages or a smaller document.'
      : 'Failed to reach AI service. Please try again.';
    console.error(`[Contraq API] Proxy error (${endpointPath}):`, err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: { type: 'proxy_error', message: errMsg }
      });
    } else {
      res.end();
    }
  }
}

// Expose proxy function to route modules via app.set
app.set('proxyToAnthropic', proxyToAnthropic);

/* ── Optional auth middleware for AI routes ───────────────────────── */
const { optionalAuth } = require('./middleware/auth');

/* ── Endpoint: Journal AI Analysis ────────────────────────────────── */
app.post('/api/journal/analyse', optionalAuth, async (req, res) => {
  await proxyToAnthropic(req, res, '/api/journal/analyse');
  // Optionally save to database if authenticated
  if (req.orgId) {
    try {
      const { saveExtraction } = require('./db/queries');
      await saveExtraction(req.orgId, {
        stage: 'journal',
        result_json: {},
        tokens_used: 0,
        model: req.body.model || 'claude-sonnet-4-6',
        created_by: req.user?.id
      });
    } catch(e) { console.error('[DB] Failed to save extraction:', e.message); }
  }
});

/* ── Endpoint: Quote File Analysis ────────────────────────────────── */
app.post('/api/quote-files/analyse', optionalAuth, async (req, res) => {
  await proxyToAnthropic(req, res, '/api/quote-files/analyse');
  // Optionally save to database if authenticated
  if (req.orgId) {
    try {
      const { saveExtraction } = require('./db/queries');
      await saveExtraction(req.orgId, {
        stage: 'quote-files',
        result_json: {},
        tokens_used: 0,
        model: req.body.model || 'claude-sonnet-4-6',
        created_by: req.user?.id
      });
    } catch(e) { console.error('[DB] Failed to save extraction:', e.message); }
  }
});

/* ── Endpoint: Quote Builder Extraction ───────────────────────────── */
const AI_QUOTE_LIMITS = { starter: 3, beta: 50, professional: 999999, business: 999999 };

app.post('/api/quotes/extract', optionalAuth, async (req, res) => {
  // Enforce monthly AI extraction cap for authenticated users
  if (req.orgId && req.user?.organizations) {
    const plan = req.user.organizations.plan || 'starter';
    const monthlyLimit = AI_QUOTE_LIMITS[plan] || 3;
    try {
      const { getExtractions } = require('./db/queries');
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);
      const thisMonth = await getExtractions(req.orgId, { since: firstOfMonth.toISOString() });
      const used = (thisMonth || []).length;
      if (used >= monthlyLimit) {
        return res.status(429).json({
          error: { type: 'quota_exceeded', message: `Monthly AI extraction limit reached (${used}/${monthlyLimit}). Resets on the 1st.` }
        });
      }
    } catch(e) {
      console.warn('[Quota] Failed to check extraction count:', e.message);
      // Non-fatal — allow the extraction to proceed
    }
  }

  await proxyToAnthropic(req, res, '/api/quotes/extract');
  // Save extraction to database if authenticated
  if (req.orgId) {
    try {
      const { saveExtraction } = require('./db/queries');
      await saveExtraction(req.orgId, {
        stage: 'quote',
        result_json: {},
        tokens_used: 0,
        model: req.body.model || 'claude-sonnet-4-6',
        created_by: req.user?.id
      });
    } catch(e) { console.error('[DB] Failed to save extraction:', e.message); }
  }
});

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

app.get('/api/trade-readiness', (_req, res) => {
  try {
    const readiness = require('./kb/trade-readiness.json');
    res.json(readiness);
  } catch(e) { res.json({ error: 'Trade readiness data not available' }); }
});

/* ── Serve static frontend (production — Railway serves both API + frontend) ── */
const path = require('path');
const fs = require('fs');
let FRONTEND_ROOT = path.join(__dirname, '..');
if (!fs.existsSync(path.join(FRONTEND_ROOT, 'index.html'))) {
  FRONTEND_ROOT = process.cwd();
}
if (!fs.existsSync(path.join(FRONTEND_ROOT, 'index.html'))) {
  FRONTEND_ROOT = path.join(process.cwd(), '..');
}
console.log('[Static] Serving frontend from:', FRONTEND_ROOT);

// Root URL serves landing page — must be BEFORE express.static
app.get('/', (req, res) => {
  const landingPath = path.join(FRONTEND_ROOT, 'landing.html');
  if (fs.existsSync(landingPath)) return res.sendFile(landingPath);
  res.sendFile(path.join(FRONTEND_ROOT, 'index.html'));
});

// /app serves the main platform (login → dashboard)
app.get('/app', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(FRONTEND_ROOT, 'index.html'));
});

// Static files (CSS, JS, images) — skip index.html for root
// No caching for HTML/JS/CSS to prevent stale code issues during development
app.use(express.static(FRONTEND_ROOT, {
  index: false,
  setHeaders: function(res, filePath) {
    if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// SPA catch-all for app routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexPath = path.join(FRONTEND_ROOT, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  next();
});

/* ── 404 catch-all (API routes only — static files handled above) ── */
app.use((_req, res) => {
  res.status(404).json({ error: { type: 'not_found', message: 'Endpoint not found' } });
});

/* ── Global error handler — standardised response format ───────────── */
const { errorHandler, ApiError } = require('./middleware/error-handler');
app.use((err, req, res, _next) => {
  _errorCount++;
  if (err instanceof ApiError) {
    return errorHandler(err, req, res, _next);
  }
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ success: false, error: { code: 'CORS_ERROR', message: err.message } });
  }
  errorHandler(err, req, res, _next);
});

/* ── Start ────────────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`[Contraq API] Worker ${process.pid} listening on port ${PORT}`);
});
