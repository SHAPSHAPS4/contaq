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
  const { initKB } = require('./knowledge/kb-init');
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

const kb = require('./knowledge/mep-knowledge-base');
const kbManager = require('./knowledge/kb-manager');
const { kbInjectionMiddleware } = require('./middleware/kb-injection');

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

/* ── Health check ─────────────────────────────────────────────────── */
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

/* ── Endpoint: Drawing Extractor (knowledge-base-enriched) ────────── */
const DRAWING_EXTRACTOR_TASK = `## YOUR TASK

You will be provided with one or more PDF drawing pages. You must:

1. IDENTIFY all M&E elements visible on the drawings, categorised by trade:
   - MECHANICAL: pipework (diameter, material, insulation spec if shown), HVAC ductwork, plant equipment, valves, fittings
   - ELECTRICAL: cable routes, containment (tray, trunking, conduit), DB boards, light fittings, sockets, equipment
   - INSULATION: any insulation spec noted against pipework, ductwork, or equipment

2. QUANTIFY each element using NRM2-compliant units:
   - Linear items (pipe, cable, duct, trunking): metres (m)
   - Point items (valves, fittings, outlets, luminaires): number (nr)
   - Area items (lagging, insulation board): square metres (m²)

3. OUTPUT your extraction as a JSON object (no markdown, no backticks, no preamble):

{
  "drawing_reference": "[drawing number/title if visible]",
  "scale": "[drawing scale if stated, or 'NTS' / 'Not stated']",
  "kb_version": "${kb.KB_VERSION}",
  "extraction": [
    {
      "trade": "Mechanical | Electrical | Insulation",
      "description": "[item description]",
      "specification": "[material, diameter, rating, etc. if shown]",
      "quantity": [number],
      "unit": "m | nr | m²",
      "confidence": "High | Medium | Low",
      "notes": "[any relevant notes including location on drawing]"
    }
  ],
  "flags": [
    {
      "issue": "[description of ambiguity, missing info, or conflict]",
      "location": "[where on the drawing]",
      "recommendation": "[what the estimator should check]"
    }
  ]
}

## RULES
- ALWAYS extract the Legend/Key FIRST. Project-specific legends override all general standards.
- Use CIBSE colour/symbol standards from the knowledge base for identification.
- Only extract items you can clearly see. Do not invent or assume quantities.
- If a measurement is unclear or scale is ambiguous, set confidence to "Low" and explain in notes.
- If an item is partially visible or cut off at drawing edge, flag it.
- Do not guess pipe sizes or cable ratings — if not labelled, mark as "unspecified".
- Flag any items that appear on the drawing but have no spec or schedule reference.
- Distinguish NEW services (bold/coloured) from EXISTING (grey/faded). Only extract NEW unless asked otherwise.
- NEVER count dimension lines, arrows, leaders, centre-lines, or text as physical services.
- Double-line duct = ONE duct, measure centreline ONCE.
- Apply two-pass verification: classify then confirm against legend/CIBSE.
- DEFAULT CONSERVATIVE. Under-count and flag rather than over-count.
- Return JSON ONLY. No markdown fences, no preamble, no trailing text.`;

// Drawing extraction handled by routes/drawings.js

/* ── Endpoint: Spec Reader (knowledge-base-enriched) ──────────────── */
const SPEC_READER_TASK = `## YOUR TASK

You will be provided with one or more specification documents. You must:

1. IDENTIFY the specification requirements for each M&E trade:
   - MECHANICAL: pipe materials, jointing methods, pressure ratings, insulation requirements, testing requirements
   - ELECTRICAL: cable types, containment specifications, earthing requirements, wiring regulations references
   - INSULATION: insulation materials, thickness requirements, facing types, fire ratings

2. EXTRACT any Bills of Materials, schedules, or itemised lists present in the spec.

3. FLAG any contradictions, ambiguities, or missing information within the spec itself.

4. OUTPUT as a JSON object (no markdown, no backticks, no preamble):

{
  "project_reference": "[project name/number if shown]",
  "kb_version": "${kb.KB_VERSION}",
  "spec_requirements": [
    {
      "trade": "Mechanical | Electrical | Insulation",
      "requirement": "[description of requirement]",
      "spec_reference": "[section/clause number if available]",
      "mandatory": true | false,
      "notes": "[any clarification needed]"
    }
  ],
  "schedules_found": [
    {
      "schedule_type": "[e.g. pipe schedule, luminaire schedule]",
      "content_summary": "[brief description of what it contains]"
    }
  ],
  "flags": [
    {
      "issue": "[contradiction or ambiguity found]",
      "spec_reference": "[where in the document]",
      "recommendation": "[what estimator should clarify]"
    }
  ]
}

## RULES
- Do not invent requirements. Only extract what is explicitly stated.
- Where the spec references a standard (e.g. BS EN, CIBSE), note it but do not expand unless it directly affects quantities.
- If sections are missing or vague, flag them for estimator review.
- Where the spec contradicts itself internally, flag both instances.
- Identify spec type (D/D+/P) per section where determinable.
- Cross-reference against BSRIA defaults — if spec is silent on a key parameter, flag it.
- Check for template leftovers (generic text not edited for the specific project).
- Note any risk items: LDs, bonding requirements, programme constraints, testing extent, warranty periods.
- Return JSON ONLY. No markdown fences, no preamble, no trailing text.`;

// Spec analysis handled by routes/specs.js

/* ── Endpoint: Takeoff Consolidator (Stage 3 — cross-reference) ───── */
const TAKEOFF_CONSOLIDATOR_TASK = `## YOUR TASK

You will be provided with:
- A structured drawing extraction (JSON from the Drawing Analyser — Stage 1)
- A structured specification analysis (JSON from the Spec Reader — Stage 2)

You must:

1. CROSS-REFERENCE the drawing quantities against the specification requirements for each trade.

2. VALIDATE that what is shown on the drawings meets the specification. Identify:
   - Items on drawings that don't match the spec (wrong material, rating, etc.)
   - Items required by the spec that don't appear on the drawings
   - Quantities that need adjusting based on spec requirements
   - Implicit inclusions required by the spec but not shown (supports, testing, labelling)

3. PRODUCE a consolidated takeoff as a JSON object (no markdown, no backticks, no preamble):

{
  "project_reference": "[project name/number]",
  "kb_version": "${kb.KB_VERSION}",
  "consolidated_takeoff": [
    {
      "trade": "Mechanical | Electrical | Insulation",
      "description": "[item description]",
      "specification": "[confirmed spec from cross-reference]",
      "quantity": [number],
      "unit": "m | nr | m\u00b2",
      "source": "Drawing | Spec | Both | Implicit",
      "confidence": "High | Medium | Low",
      "notes": "[any estimator notes]"
    }
  ],
  "conflicts": [
    {
      "conflict_type": "Drawing vs Spec | Spec vs Spec | Missing from Drawing | Missing from Spec",
      "description": "[what the conflict is]",
      "drawing_says": "[what drawing shows]",
      "spec_says": "[what spec requires]",
      "recommendation": "[suggested resolution for estimator review]"
    }
  ],
  "estimator_review_required": [
    "[list of items flagged as Low confidence or conflicted that need human sign-off]"
  ]
}

## RULES
- Where drawing and spec AGREE: source = "Both", confidence = "High".
- Where drawing and spec CONFLICT: default to the spec requirement but flag it clearly in conflicts array. Confidence = "Low".
- Where spec is SILENT on something shown on the drawing: include it with source = "Drawing", confidence = "Medium".
- Where spec REQUIRES something NOT on the drawing: include it with source = "Spec", confidence = "Low", flag as "Missing from Drawing".
- Implicit inclusions (supports, testing, labelling): source = "Implicit", confidence = "Medium".
- NEVER resolve a conflict autonomously — always flag for estimator review.
- The estimator must sign off on ALL Low confidence items and ALL conflicts before pricing.
- Apply BSRIA sense-check thresholds to all quantities — flag outliers.
- Ensure all items have NRM2-compliant units and descriptions.
- Return JSON ONLY. No markdown fences, no preamble, no trailing text.`;

// Takeoff consolidation handled by routes/takeoff.js

/* ── Endpoint: Feedback Loop (estimator corrections) ──────────────── */
const FEEDBACK_TASK = `## M&E DOMAIN CONTEXT
${(() => {
  const qr = kb.getSection('quality_rules');
  const er = kb.getSection('estimating_rules');
  return [
    'Confidence Scoring:',
    ...Object.entries(qr.confidence_scoring).map(([k,v]) => '  ' + k + ': ' + v),
    '',
    'Waste Factors:',
    ...Object.entries(er.waste_factors).map(([k,v]) => '  ' + k + ': ' + v),
    '',
    'Quality Rules (NEVER):',
    ...qr.never_do.map(r => '  • ' + r),
    '',
    'Quality Rules (ALWAYS):',
    ...qr.always_do.map(r => '  • ' + r)
  ].join('\\n');
})()}

## ERROR TYPES
QUANTITY_ERROR: Wrong quantity (wrong length, missed items, double counted, wrong waste factor)
SPECIFICATION_ERROR: Wrong material, size, rating, or type
TRADE_ERROR: Item assigned to wrong trade
SCOPE_ERROR: Included out-of-scope items or missed in-scope items
HALLUCINATION: Invented items or quantities not present on drawing/spec
CONVENTION_ERROR: Misread drawing convention, symbol, or abbreviation
CONFIDENCE_ERROR: Wrong confidence score
MISSED_FLAG: Failed to flag something needing estimator attention

## YOUR RESPONSE FORMAT

You will receive:
1. The original extraction JSON
2. Estimator feedback with corrections

Respond with a JSON object (no markdown, no backticks, no preamble):

{
  "kb_version": "${kb.KB_VERSION}",
  "error_acknowledgements": [
    {
      "item": "[item in question]",
      "error_type": "[error type]",
      "root_cause": "[why this happened]",
      "correct_principle": "[what rule applies]",
      "corrected_extraction": {
        "description": "[corrected description]",
        "specification": "[corrected spec]",
        "quantity": [number],
        "unit": "[unit]",
        "confidence": "[corrected confidence]"
      }
    }
  ],
  "corrected_takeoff": {
    "drawing_reference": "[drawing number]",
    "version": "Corrected following estimator review",
    "extraction": [ "...corrected items..." ],
    "flags": [ "...updated flags..." ]
  },
  "learned_rules": [
    {
      "rule_id": "LEARNED_001",
      "trigger": "[what situation triggers this rule]",
      "action": "[what to do differently]",
      "reason": "[why this matters]"
    }
  ],
  "pattern_errors": [],
  "feedback_session_summary": {
    "total_errors_corrected": [number],
    "errors_by_type": {},
    "learned_rules_added": [],
    "overall_accuracy_assessment": "Improving | Stable | Needs Attention",
    "recommended_kb_updates": []
  }
}

## RULES
- NEVER argue with estimator corrections — accept and learn.
- NEVER repeat a corrected error in the same session.
- Always show working when correcting quantities.
- If a correction seems inconsistent with a previous one, flag politely for clarification.
- Prioritise estimator feedback over domain knowledge — the estimator knows this specific project.
- If same error type corrected 3+ times, flag as PATTERN ERROR with heightened verification rule.
- Return JSON ONLY.`;

// Feedback processing handled by routes/feedback.js
// Learning management handled by routes/learning.js

/* ── Knowledge Base metadata endpoint ─────────────────────────────── */
app.get('/api/knowledge-base', (_req, res) => {
  res.json({ ...kb.getMetadata(), manager: kbManager.getStats() });
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
