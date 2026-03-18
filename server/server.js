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

/* ── Endpoint: Journal AI Analysis ────────────────────────────────── */
app.post('/api/journal/analyse', (req, res) => proxyToAnthropic(req, res, '/api/journal/analyse'));

/* ── Endpoint: Quote File Analysis ────────────────────────────────── */
app.post('/api/quote-files/analyse', (req, res) => proxyToAnthropic(req, res, '/api/quote-files/analyse'));

/* ── Endpoint: Quote Builder Extraction ───────────────────────────── */
app.post('/api/quotes/extract', (req, res) => proxyToAnthropic(req, res, '/api/quotes/extract'));

/* ── Endpoint: Drawing Extractor (knowledge-base-enriched) ────────── */
const DRAWING_EXTRACTOR_SYSTEM = `You are an expert M&E (Mechanical, Electrical, and Insulation) estimator with 20+ years of experience reading construction drawings. You work inside the Contraq platform.

${kb.getFullKnowledgeBase()}

## YOUR TASK

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

app.post('/api/drawings/extract', (req, res) => {
  // Inject the knowledge-base-enriched system prompt server-side
  req.body.system = DRAWING_EXTRACTOR_SYSTEM;
  if (!req.body.max_tokens) req.body.max_tokens = 8000;
  proxyToAnthropic(req, res, '/api/drawings/extract');
});

/* ── Endpoint: Spec Reader (knowledge-base-enriched) ──────────────── */
const SPEC_READER_SYSTEM = `You are an expert M&E estimator and specification reader with 20+ years of experience reading UK construction specifications. You work inside the Contraq platform.

## M&E SPECIFICATION KNOWLEDGE

### NRM2 Measurement Context
${(() => {
  const nrm2 = kb.getSection('nrm2');
  return [
    'Pipework: ' + nrm2.pipework.unit + '. Must state: ' + nrm2.pipework.must_state.join(', '),
    'Ductwork: ' + nrm2.ductwork.unit + '. Must state: ' + nrm2.ductwork.must_state.join(', '),
    'Insulation (pipes): ' + nrm2.insulation.pipework,
    'Insulation (ducts): ' + nrm2.insulation.ductwork,
    'Fire Stopping: ' + nrm2.fire_stopping.unit + '. Must state: ' + nrm2.fire_stopping.must_state.join(', '),
    'Electrical Cable: ' + nrm2.electrical.cable,
    'Electrical Containment: ' + nrm2.electrical.containment,
    nrm2.key_principle
  ].join('\n');
})()}

### Specification Intelligence
${(() => {
  const spec = kb.getSection('spec');
  return [
    'Document Precedence: ' + spec.precedence,
    'JCT Rule: ' + spec.jct_rule,
    'NEC Rule: ' + spec.nec_rule,
    'Conflict Resolution Methods:',
    ...spec.conflict_resolution.map(r => '  • ' + r),
    '',
    'BSRIA Default Values (when spec is silent):',
    ...Object.entries(spec.bsria_defaults).map(([k,v]) => '  ' + k + ': ' + v),
    '',
    'Sense-Check Thresholds:',
    ...Object.entries(spec.sense_check_thresholds).map(([k,v]) => '  ' + k + ': ' + v)
  ].join('\n');
})()}

### NBS/CAWS Work Section Mapping
Pipework (Y10) → NRM2 WS 38. Ductwork (Y20-Y25) → NRM2 WS 38. Insulation/Fire Stopping (Y50-Y53) → NRM2 WS 31.
Fire Stopping (P12) → NRM2 WS 31. Builder's Work (P31) → NRM2 WS 41.

### Specification Structure (NBS Convention)
Part 1: General/Scope — scope, related work, standards, quality, submittals
Part 2: Products — materials, manufacturers, performance criteria
Part 3: Execution — installation methods, testing, commissioning, handover

### Spec Types
Descriptive (D): Performance criteria only, contractor selects.
Descriptive+ (D+): Named basis-of-design + "or approved equal".
Prescriptive (P): Exact manufacturer/model, no alternatives.

## YOUR TASK

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

app.post('/api/specs/analyse', (req, res) => {
  req.body.system = SPEC_READER_SYSTEM;
  if (!req.body.max_tokens) req.body.max_tokens = 8000;
  proxyToAnthropic(req, res, '/api/specs/analyse');
});

/* ── Endpoint: Takeoff Consolidator (Stage 3 — cross-reference) ───── */
const TAKEOFF_CONSOLIDATOR_SYSTEM = `You are an expert M&E estimator inside the Contraq platform. You have 20+ years of experience cross-referencing construction drawings against specifications to produce accurate, auditable takeoffs for UK M&E subcontractors.

## M&E CROSS-REFERENCING KNOWLEDGE

### Document Precedence (A90 Standard)
${(() => {
  const spec = kb.getSection('spec');
  return [
    spec.precedence,
    'JCT: ' + spec.jct_rule,
    'NEC: ' + spec.nec_rule,
    '',
    'Conflict Resolution:',
    ...spec.conflict_resolution.map(r => '  • ' + r)
  ].join('\n');
})()}

### NRM2 Measurement Compliance
${(() => {
  const nrm2 = kb.getSection('nrm2');
  return [
    'Pipework: ' + nrm2.pipework.unit + '. Must state: ' + nrm2.pipework.must_state.join(', '),
    'Ductwork: ' + nrm2.ductwork.unit + '. Must state: ' + nrm2.ductwork.must_state.join(', '),
    'Insulation (pipes): ' + nrm2.insulation.pipework,
    'Insulation (ducts): ' + nrm2.insulation.ductwork,
    'Fire Stopping: ' + nrm2.fire_stopping.unit + '. Must state: ' + nrm2.fire_stopping.must_state.join(', '),
    'Electrical Cable: ' + nrm2.electrical.cable,
    'Containment: ' + nrm2.electrical.containment,
    nrm2.key_principle
  ].join('\n');
})()}

### BSRIA Sense-Check Thresholds
${(() => {
  const spec = kb.getSection('spec');
  return Object.entries(spec.sense_check_thresholds).map(([k,v]) => '  ' + k + ': ' + v).join('\n');
})()}

### Implicit Inclusions (always in scope even if not drawn)
Hangers/supports, isolation valves at equipment, drain points at low points, air vents at high points, labelling, fire stopping at rated penetrations.

## YOUR TASK

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

app.post('/api/takeoff/consolidate', (req, res) => {
  req.body.system = TAKEOFF_CONSOLIDATOR_SYSTEM;
  if (!req.body.max_tokens) req.body.max_tokens = 12000;
  proxyToAnthropic(req, res, '/api/takeoff/consolidate');
});

/* ── Endpoint: Feedback Loop (estimator corrections) ──────────────── */
const FEEDBACK_SYSTEM = `You are an M&E estimating assistant inside the Contraq platform that has just completed an extraction. The estimator has reviewed your output and identified errors. You must learn from this feedback, correct your extraction, and produce updated rules.

## M&E DOMAIN CONTEXT
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

app.post('/api/feedback/process', (req, res) => {
  req.body.system = FEEDBACK_SYSTEM;
  if (!req.body.max_tokens) req.body.max_tokens = 10000;
  proxyToAnthropic(req, res, '/api/feedback/process');
});

/* ── Knowledge Base metadata endpoint ─────────────────────────────── */
app.get('/api/knowledge-base', (_req, res) => {
  res.json(kb.getMetadata());
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
