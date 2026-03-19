/**
 * KB Initialisation
 *
 * Run once at server startup before accepting requests.
 * Ensures all section files exist, learning directory is ready,
 * and cache is populated.
 */

const fs = require('node:fs');
const path = require('node:path');
const { loadKBCache, getMetadata, assembleKBPrompt, estimateTokens, KB_SECTIONS, KB_VERSION } = require('./index');

const SECTIONS_DIR = path.join(__dirname, 'sections');
const LEARNING_DIR = path.join(SECTIONS_DIR, 'learning');
const L01_PATH = path.join(LEARNING_DIR, 'L01_learned_rules.json');
const L02_PATH = path.join(LEARNING_DIR, 'L02_pattern_errors.json');

function initKB() {
  console.log(`[KB Init] Starting KB v${KB_VERSION} initialisation...`);

  // Ensure learning directory
  if (!fs.existsSync(LEARNING_DIR)) {
    fs.mkdirSync(LEARNING_DIR, { recursive: true });
    console.log('[KB Init] Created learning directory');
  }

  // Ensure L01
  if (!fs.existsSync(L01_PATH)) {
    fs.writeFileSync(L01_PATH, JSON.stringify({ learned_rules: [], last_updated: null, total_rules: 0 }, null, 2));
    console.log('[KB Init] Initialised KB-L01 (empty)');
  } else {
    try {
      const d = JSON.parse(fs.readFileSync(L01_PATH, 'utf-8'));
      console.log(`[KB Init] KB-L01: ${(d.learned_rules || []).length} learned rules`);
    } catch {
      fs.writeFileSync(L01_PATH, JSON.stringify({ learned_rules: [], last_updated: null, total_rules: 0 }, null, 2));
      console.warn('[KB Init] KB-L01 corrupted — reset');
    }
  }

  // Ensure L02
  if (!fs.existsSync(L02_PATH)) {
    fs.writeFileSync(L02_PATH, JSON.stringify({ pattern_errors: [], last_updated: null, total_patterns: 0 }, null, 2));
    console.log('[KB Init] Initialised KB-L02 (empty)');
  } else {
    try {
      const d = JSON.parse(fs.readFileSync(L02_PATH, 'utf-8'));
      console.log(`[KB Init] KB-L02: ${(d.pattern_errors || []).length} pattern errors`);
    } catch {
      fs.writeFileSync(L02_PATH, JSON.stringify({ pattern_errors: [], last_updated: null, total_patterns: 0 }, null, 2));
      console.warn('[KB Init] KB-L02 corrupted — reset');
    }
  }

  // Verify all section files exist
  let missing = 0;
  for (const [id, config] of Object.entries(KB_SECTIONS)) {
    const filePath = path.join(SECTIONS_DIR, config.file);
    if (!fs.existsSync(filePath)) {
      console.error(`[KB Init] MISSING: ${id} → ${config.file}`);
      missing++;
    }
  }

  if (missing > 0) {
    console.error(`[KB Init] WARNING: ${missing} section file(s) missing`);
  } else {
    console.log(`[KB Init] All ${Object.keys(KB_SECTIONS).length} section files verified`);
  }

  // Load cache
  loadKBCache();

  // Test assembly for key endpoints
  const testEndpoints = ['/api/drawings/extract', '/api/specs/analyse', '/api/takeoff/consolidate', '/api/feedback/process'];
  for (const ep of testEndpoints) {
    try {
      const assembled = assembleKBPrompt(ep);
      console.log(`[KB Init] ${ep}: ${assembled.length} chars (~${estimateTokens(assembled)} tokens)`);
    } catch (err) {
      console.error(`[KB Init] FAILED: ${ep}: ${err.message}`);
    }
  }

  const meta = getMetadata();
  console.log(`[KB Init] KB v${KB_VERSION} ready. ${meta.sections} sections, ${meta.sources} sources.`);
  return meta;
}

module.exports = { initKB };
