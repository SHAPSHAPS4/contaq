/**
 * Contraq KB Manager — Core Module
 *
 * Loads KB sections from JSON files, maps endpoints to sections,
 * manages token budgets, and persists learned rules.
 * Replaces the monolithic mep-knowledge-base.js approach.
 *
 * KB v7.2 — 47 sources, 21 section files
 */

const fs = require('node:fs');
const path = require('node:path');

const KB_VERSION = '7.2';
const KB_VERSION_DATE = '2026-03-19';
const KB_VERSION_SOURCES = 47;

/* ══════════════════════════════════════════════════════════════════
   SECTION DEFINITIONS
   ══════════════════════════════════════════════════════════════════ */

const KB_SECTIONS = {
  // CORE — always loaded for every KB-enriched endpoint
  'KB-C01': { file: 'core/C01_drawing_standards.json', priority: 'critical', always: true },
  'KB-C02': { file: 'core/C02_estimating_principles.json', priority: 'critical', always: true },
  'KB-C03': { file: 'core/C03_uk_standards.json', priority: 'high', always: true },
  'KB-C04': { file: 'core/C04_document_hierarchy.json', priority: 'high', always: true },
  // MECHANICAL
  'KB-M01': { file: 'mechanical/M01_pipe_materials.json', priority: 'critical', always: false },
  'KB-M02': { file: 'mechanical/M02_fittings_valves.json', priority: 'high', always: false },
  'KB-M03': { file: 'mechanical/M03_hvac_ductwork.json', priority: 'high', always: false },
  'KB-M04': { file: 'mechanical/M04_plant_equipment.json', priority: 'medium', always: false },
  // ELECTRICAL
  'KB-E01': { file: 'electrical/E01_cable_types.json', priority: 'critical', always: false },
  'KB-E02': { file: 'electrical/E02_cable_containment.json', priority: 'critical', always: false },
  'KB-E03': { file: 'electrical/E03_distribution.json', priority: 'high', always: false },
  'KB-E04': { file: 'electrical/E04_lighting_power.json', priority: 'high', always: false },
  'KB-E05': { file: 'electrical/E05_specialist_systems.json', priority: 'medium', always: false },
  // INSULATION
  'KB-I01': { file: 'insulation/I01_pipe_insulation.json', priority: 'critical', always: false },
  'KB-I02': { file: 'insulation/I02_duct_insulation.json', priority: 'high', always: false },
  'KB-I03': { file: 'insulation/I03_equipment_insulation.json', priority: 'high', always: false },
  'KB-I04': { file: 'insulation/I04_fire_specialist.json', priority: 'medium', always: false },
  // EXTRACTION RULES — always loaded
  'KB-X01': { file: 'rules/X01_extraction_logic.json', priority: 'critical', always: true },
  'KB-X02': { file: 'rules/X02_confidence_scoring.json', priority: 'critical', always: true },
  'KB-X03': { file: 'rules/X03_conflict_resolution.json', priority: 'critical', always: true },
  'KB-X04': { file: 'rules/X04_hallucination_prevention.json', priority: 'critical', always: true },
};

/* ══════════════════════════════════════════════════════════════════
   ENDPOINT → SECTIONS MAPPING
   ══════════════════════════════════════════════════════════════════ */

const ENDPOINT_SECTIONS = {
  '/api/drawings/extract': [
    'KB-C01','KB-C02','KB-C03','KB-C04',
    'KB-M01','KB-M02','KB-M03','KB-M04',
    'KB-E01','KB-E02','KB-E03','KB-E04','KB-E05',
    'KB-I01','KB-I02','KB-I03','KB-I04',
    'KB-X01','KB-X02','KB-X03','KB-X04',
  ],
  '/api/specs/analyse': [
    'KB-C01','KB-C02','KB-C03','KB-C04',
    'KB-M01','KB-M02','KB-M03','KB-M04',
    'KB-E01','KB-E02','KB-E03','KB-E04','KB-E05',
    'KB-I01','KB-I02','KB-I03','KB-I04',
    'KB-X02','KB-X03','KB-X04',
  ],
  '/api/takeoff/consolidate': [
    'KB-C02','KB-C03','KB-C04',
    'KB-X01','KB-X02','KB-X03','KB-X04',
  ],
  '/api/feedback/process': [
    'KB-X01','KB-X02','KB-X03','KB-X04',
  ],
  '/api/quotes/extract': [
    'KB-C01','KB-C02','KB-C03','KB-C04',
    'KB-M01','KB-M02','KB-M03','KB-M04',
    'KB-E01','KB-E02','KB-E03','KB-E04','KB-E05',
    'KB-I01','KB-I02','KB-I03','KB-I04',
    'KB-X01','KB-X02','KB-X03','KB-X04',
  ],
  '/api/journal/analyse': [
    'KB-C01','KB-C04',
    'KB-X02','KB-X03',
  ],
  '/api/quote-files/analyse': [
    'KB-C01','KB-C04',
    'KB-X02','KB-X04',
  ],
};

/* ══════════════════════════════════════════════════════════════════
   KB CACHE
   ══════════════════════════════════════════════════════════════════ */

let _kbCache = {};
let _cacheLoaded = false;
const KB_BASE_PATH = path.join(__dirname, 'sections');

function loadKBCache() {
  if (_cacheLoaded) return;
  console.log('[KB] Loading sections into cache...');

  let loaded = 0, failed = 0;
  for (const [sectionId, config] of Object.entries(KB_SECTIONS)) {
    const filePath = path.join(KB_BASE_PATH, config.file);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      _kbCache[sectionId] = JSON.parse(raw);
      loaded++;
    } catch (err) {
      console.warn(`[KB] WARNING: Could not load ${sectionId} from ${config.file}: ${err.message}`);
      _kbCache[sectionId] = null;
      failed++;
    }
  }

  _cacheLoaded = true;
  console.log(`[KB] Cache ready. ${loaded} loaded, ${failed} failed.`);
}

/* ══════════════════════════════════════════════════════════════════
   DYNAMIC LEARNING (KB-L01, KB-L02)
   ══════════════════════════════════════════════════════════════════ */

const L01_PATH = path.join(KB_BASE_PATH, 'learning/L01_learned_rules.json');
const L02_PATH = path.join(KB_BASE_PATH, 'learning/L02_pattern_errors.json');

function loadDynamicSections() {
  const dynamic = {};
  try { dynamic['KB-L01'] = JSON.parse(fs.readFileSync(L01_PATH, 'utf-8')); } catch { dynamic['KB-L01'] = { learned_rules: [], last_updated: null }; }
  try { dynamic['KB-L02'] = JSON.parse(fs.readFileSync(L02_PATH, 'utf-8')); } catch { dynamic['KB-L02'] = { pattern_errors: [], last_updated: null }; }
  return dynamic;
}

function persistLearnedRules(newRules) {
  let existing = { learned_rules: [], last_updated: null };
  try { existing = JSON.parse(fs.readFileSync(L01_PATH, 'utf-8')); } catch {}

  const existingIds = new Set(existing.learned_rules.map(r => r.rule_id));
  const merged = [...existing.learned_rules];

  for (const rule of newRules) {
    if (!existingIds.has(rule.rule_id)) {
      merged.push(rule);
      console.log(`[KB] Persisted new learned rule: ${rule.rule_id}`);
    } else {
      const idx = merged.findIndex(r => r.rule_id === rule.rule_id);
      merged[idx] = rule;
      console.log(`[KB] Updated learned rule: ${rule.rule_id}`);
    }
  }

  const updated = { learned_rules: merged, last_updated: new Date().toISOString(), total_rules: merged.length };
  const tmp = L01_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(updated, null, 2));
  fs.renameSync(tmp, L01_PATH);
  console.log(`[KB] KB-L01 updated. Total rules: ${merged.length}`);
  return updated;
}

function persistPatternError(errorType, occurrences, heightenedAction) {
  let existing = { pattern_errors: [], last_updated: null };
  try { existing = JSON.parse(fs.readFileSync(L02_PATH, 'utf-8')); } catch {}

  const found = existing.pattern_errors.find(p => p.error_type === errorType);
  if (found) {
    found.occurrences = occurrences;
    found.heightened_action = heightenedAction;
    found.last_triggered = new Date().toISOString();
  } else {
    const patternId = `PATTERN_${String(existing.pattern_errors.length + 1).padStart(3, '0')}`;
    existing.pattern_errors.push({
      pattern_id: patternId,
      error_type: errorType,
      occurrences,
      heightened_action: heightenedAction,
      first_detected: new Date().toISOString(),
      last_triggered: new Date().toISOString(),
    });
    console.log(`[KB] New pattern error registered: ${patternId} — ${errorType}`);
  }

  existing.last_updated = new Date().toISOString();
  const tmp = L02_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(existing, null, 2));
  fs.renameSync(tmp, L02_PATH);
  return existing;
}

/* ══════════════════════════════════════════════════════════════════
   PROMPT ASSEMBLER
   ══════════════════════════════════════════════════════════════════ */

function assembleKBPrompt(endpoint, options = {}) {
  loadKBCache();

  const { priorityFilter = null } = options;
  const sectionIds = ENDPOINT_SECTIONS[endpoint];
  if (!sectionIds) return '';

  const dynamic = loadDynamicSections();
  const assembled = [];

  // Static sections
  for (const sectionId of sectionIds) {
    const config = KB_SECTIONS[sectionId];
    if (!config) continue;
    if (priorityFilter && config.priority !== priorityFilter) continue;

    const content = _kbCache[sectionId];
    if (!content) {
      assembled.push(`\n[${sectionId} — NOT LOADED]\n`);
      continue;
    }

    assembled.push(formatSection(sectionId, content));
  }

  // Dynamic: Learned Rules
  const learnedRules = dynamic['KB-L01']?.learned_rules || [];
  if (learnedRules.length > 0) {
    assembled.push(formatLearnedRules(learnedRules));
  }

  // Dynamic: Pattern Errors
  const patternErrors = dynamic['KB-L02']?.pattern_errors || [];
  if (patternErrors.length > 0) {
    assembled.push(formatPatternErrors(patternErrors));
  }

  // Self-audit if rules exist
  if (learnedRules.length > 0) {
    assembled.push(getSelfAuditPrompt(learnedRules));
  }

  return assembled.join('\n\n');
}

/* ══════════════════════════════════════════════════════════════════
   FORMATTERS
   ══════════════════════════════════════════════════════════════════ */

function formatSection(sectionId, content) {
  // Handle wrapped format: { section_id, title, version, last_updated, data }
  const title = content.title || content.id || sectionId;
  const ver = content.version ? ` v${content.version}` : '';
  const payload = content.data || content; // Use .data if wrapped, raw content otherwise
  return `═══ ${sectionId}: ${title}${ver} ═══\n${JSON.stringify(payload, null, 2)}`;
}

function formatLearnedRules(rules) {
  const lines = rules.map(r => `  ${r.rule_id}: [${r.trigger}] → ${r.action}`);
  return `═══ KB-L01: LEARNED RULES (${rules.length} active) ═══
Applied from previous estimator feedback. Override defaults where they conflict.
${lines.join('\n')}`;
}

function formatPatternErrors(patterns) {
  const lines = patterns.map(p => `  ${p.pattern_id} [${p.error_type} — ${p.occurrences}x]: ${p.heightened_action}`);
  return `═══ KB-L02: PATTERN ERRORS (${patterns.length} active) ═══
These error types have occurred 3+ times. Apply heightened verification.
${lines.join('\n')}`;
}

function getSelfAuditPrompt(rules) {
  return `═══ SELF-AUDIT — RUN BEFORE PRODUCING OUTPUT ═══
Check extraction against all learned rules:
${rules.map(r => `  - [${r.rule_id}] ${r.trigger} → ${r.action}`).join('\n')}
Also verify:
1. Every quantity traceable to drawing/schedule
2. No specifications from memory without flagging
3. No quantities from schematics
4. All conflicts flagged
5. All revision clouds noted
6. Confidence scores on every item
7. Flags section populated
8. Title block extracted
If any check fails — correct before outputting.`;
}

/* ══════════════════════════════════════════════════════════════════
   TOKEN BUDGET
   ══════════════════════════════════════════════════════════════════ */

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function getKBPromptWithBudget(endpoint, tokenBudget) {
  // Try full assembly
  const full = assembleKBPrompt(endpoint);
  if (estimateTokens(full) <= tokenBudget) {
    return { prompt: full, truncated: false };
  }

  // Fallback: critical sections only
  console.warn(`[KB] Token budget exceeded for ${endpoint}. Falling back to critical sections only.`);
  const critical = assembleKBPrompt(endpoint, { priorityFilter: 'critical' });
  return {
    prompt: critical,
    truncated: true,
    warningMessage: 'Non-critical KB sections omitted due to token budget.'
  };
}

/* ══════════════════════════════════════════════════════════════════
   METADATA
   ══════════════════════════════════════════════════════════════════ */

function loadLearning() {
  const dynamic = loadDynamicSections();
  return {
    learnedRules: dynamic['KB-L01']?.learned_rules || [],
    patternErrors: dynamic['KB-L02']?.pattern_errors || []
  };
}

function saveLearning(rules, patterns) {
  const tmp1 = L01_PATH + '.tmp';
  const tmp2 = L02_PATH + '.tmp';
  fs.writeFileSync(tmp1, JSON.stringify({ learned_rules: rules, last_updated: new Date().toISOString(), total_rules: rules.length }, null, 2));
  fs.renameSync(tmp1, L01_PATH);
  fs.writeFileSync(tmp2, JSON.stringify({ pattern_errors: patterns, last_updated: new Date().toISOString(), total_patterns: patterns.length }, null, 2));
  fs.renameSync(tmp2, L02_PATH);
}

function processAndPersistFeedback(aiResponseText) {
  try {
    const cleaned = aiResponseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return;
    const result = JSON.parse(match[0]);

    const newRules = result.updated_rules || result.learned_rules || [];
    if (newRules.length > 0) persistLearnedRules(newRules);

    const newPatterns = result.pattern_errors || [];
    for (const pe of newPatterns) {
      persistPatternError(pe.error_type, pe.occurrences || 3, pe.heightened_action || `Triple-check ${pe.error_type} items.`);
    }
  } catch (err) {
    console.error('[KB] Failed to process feedback:', err.message);
  }
}

function getMetadata() {
  const dynamic = loadDynamicSections();
  const sectionVersions = {};
  for (const [id, cached] of Object.entries(_kbCache)) {
    if (cached) sectionVersions[id] = { title: cached.title || id, version: cached.version || '1.0' };
  }
  return {
    version: KB_VERSION,
    date: KB_VERSION_DATE,
    sources: KB_VERSION_SOURCES,
    sections: Object.keys(KB_SECTIONS).length,
    cached: Object.keys(_kbCache).filter(k => _kbCache[k]).length,
    learned_rules: (dynamic['KB-L01']?.learned_rules || []).length,
    pattern_errors: (dynamic['KB-L02']?.pattern_errors || []).length,
    endpoints: Object.keys(ENDPOINT_SECTIONS).length,
    section_versions: sectionVersions
  };
}

module.exports = {
  loadKBCache,
  assembleKBPrompt,
  getKBPromptWithBudget,
  persistLearnedRules,
  persistPatternError,
  getSelfAuditPrompt,
  estimateTokens,
  getMetadata,
  KB_VERSION,
  KB_VERSION_DATE,
  KB_VERSION_SOURCES,
  loadLearning,
  saveLearning,
  processAndPersistFeedback,
  KB_SECTIONS,
  ENDPOINT_SECTIONS,
};
