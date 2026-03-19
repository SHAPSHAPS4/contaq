/**
 * KB Initialisation
 *
 * Run once at server startup (before accepting requests).
 * Ensures learning directory exists, seed files are present,
 * KB modules load correctly, and manager is ready.
 */

const fs = require('node:fs');
const path = require('node:path');

const LEARNING_DIR = path.join(__dirname, 'learning');
const RULES_FILE = path.join(LEARNING_DIR, 'learned-rules.json');
const PATTERNS_FILE = path.join(LEARNING_DIR, 'pattern-errors.json');

function initKB() {
  const kb = require('./mep-knowledge-base');
  console.log(`[KB Init] Starting KB v${kb.KB_VERSION} initialisation...`);

  // ── Ensure learning directory exists ────────────
  if (!fs.existsSync(LEARNING_DIR)) {
    fs.mkdirSync(LEARNING_DIR, { recursive: true });
    console.log('[KB Init] Created learning directory');
  }

  // ── Ensure KB-L01 (learned rules) exists ───────
  if (!fs.existsSync(RULES_FILE)) {
    fs.writeFileSync(RULES_FILE, JSON.stringify({
      learned_rules: [],
      last_updated: null,
      total_rules: 0
    }, null, 2));
    console.log('[KB Init] Initialised KB-L01 (empty learned rules)');
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8'));
      console.log(`[KB Init] KB-L01 loaded: ${(data.learned_rules || []).length} learned rules`);
    } catch (err) {
      console.warn('[KB Init] KB-L01 corrupted — resetting:', err.message);
      fs.writeFileSync(RULES_FILE, JSON.stringify({ learned_rules: [], last_updated: null, total_rules: 0 }, null, 2));
    }
  }

  // ── Ensure KB-L02 (pattern errors) exists ──────
  if (!fs.existsSync(PATTERNS_FILE)) {
    fs.writeFileSync(PATTERNS_FILE, JSON.stringify({
      pattern_errors: [],
      last_updated: null,
      total_patterns: 0
    }, null, 2));
    console.log('[KB Init] Initialised KB-L02 (empty pattern errors)');
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf-8'));
      console.log(`[KB Init] KB-L02 loaded: ${(data.pattern_errors || []).length} pattern errors`);
    } catch (err) {
      console.warn('[KB Init] KB-L02 corrupted — resetting:', err.message);
      fs.writeFileSync(PATTERNS_FILE, JSON.stringify({ pattern_errors: [], last_updated: null, total_patterns: 0 }, null, 2));
    }
  }

  // ── Validate KB modules load correctly ─────────
  const kbManager = require('./kb-manager');
  const stats = kbManager.getStats();
  console.log(`[KB Init] KB Manager: ${stats.total_formatters} formatters, ${stats.endpoints_mapped} endpoints mapped`);

  // ── Validate all KB section files exist ────────
  const expectedModules = [
    'kb-c01-drawing-standards', 'kb-c02-estimating-principles',
    'kb-c03-uk-standards', 'kb-c04-document-hierarchy',
    'kb-m01-pipe-materials', 'kb-m02-fittings-valves',
    'kb-m03-hvac-ductwork', 'kb-m04-mechanical-plant',
    'kb-e01-cable-types', 'kb-e02-containment',
    'kb-e03-electrical-equipment', 'kb-e04-lighting-small-power',
    'kb-e05-specialist-electrical',
    'kb-i01-pipe-insulation', 'kb-i02-duct-insulation',
    'kb-i03-equipment-insulation', 'kb-i04-fire-specialist-insulation',
    'kb-x01-extraction-logic', 'kb-x02-confidence-scoring',
    'kb-x03-conflict-resolution', 'kb-x04-hallucination-prevention'
  ];

  let missing = 0;
  for (const mod of expectedModules) {
    const filePath = path.join(__dirname, mod + '.js');
    if (!fs.existsSync(filePath)) {
      console.error(`[KB Init] MISSING MODULE: ${mod}.js`);
      missing++;
    }
  }

  if (missing > 0) {
    console.error(`[KB Init] WARNING: ${missing} KB module(s) missing. Extraction quality may be reduced.`);
  } else {
    console.log(`[KB Init] All ${expectedModules.length} KB modules verified.`);
  }

  // ── Test assembly for key endpoints ────────────
  const testEndpoints = ['/api/drawings/extract', '/api/specs/analyse', '/api/takeoff/consolidate', '/api/feedback/process'];
  for (const ep of testEndpoints) {
    try {
      const assembled = kbManager.assembleKB(ep);
      const tokens = kbManager.estimateTokens(assembled);
      console.log(`[KB Init] ${ep}: ${assembled.length} chars (~${tokens} tokens)`);
    } catch (err) {
      console.error(`[KB Init] FAILED to assemble KB for ${ep}:`, err.message);
    }
  }

  console.log(`[KB Init] KB v${kb.KB_VERSION} ready. ${kb.KB_VERSION_SOURCES} sources, ${stats.total_formatters} formatters.`);
  return {
    version: kb.KB_VERSION,
    sources: kb.KB_VERSION_SOURCES,
    modules: expectedModules.length,
    missing,
    learnedRules: stats.learned_rules,
    patternErrors: stats.pattern_errors
  };
}

module.exports = { initKB };
