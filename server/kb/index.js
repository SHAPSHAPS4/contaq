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
const { scoreRules, getMaxRulesForEndpoint, tokenise } = require('./rule-scorer');

const KB_VERSION = '8.0';
const KB_VERSION_DATE = '2026-04-04';
const KB_VERSION_SOURCES = 55;

/* ══════════════════════════════════════════════════════════════════
   SECTION DEFINITIONS
   ══════════════════════════════════════════════════════════════════ */

const KB_SECTIONS = {
  // CORE — always loaded for every KB-enriched endpoint (all trades)
  'KB-C01': { file: 'core/C01_drawing_standards.json', priority: 'critical', always: true, trades: ['all'] },
  'KB-C02': { file: 'core/C02_estimating_principles.json', priority: 'critical', always: true, trades: ['all'] },
  'KB-C03': { file: 'core/C03_uk_standards.json', priority: 'high', always: true, trades: ['all'] },
  'KB-C04': { file: 'core/C04_document_hierarchy.json', priority: 'high', always: true, trades: ['all'] },
  // MECHANICAL — pipework trades + ductwork + hvac + multi
  'KB-M01': { file: 'mechanical/M01_pipe_materials.json', priority: 'critical', always: false,
    trades: ['mechanical', 'pipework', 'plumbing', 'hvac', 'ductwork', 'insulation', 'multi'] },
  'KB-M02': { file: 'mechanical/M02_fittings_valves.json', priority: 'high', always: false,
    trades: ['mechanical', 'pipework', 'plumbing', 'hvac', 'insulation', 'multi'] },
  'KB-M03': { file: 'mechanical/M03_hvac_ductwork.json', priority: 'critical', always: false,
    trades: ['mechanical', 'ductwork', 'hvac', 'insulation', 'ventilation', 'multi'] },
  'KB-M04': { file: 'mechanical/M04_plant_equipment.json', priority: 'medium', always: false,
    trades: ['mechanical', 'pipework', 'plumbing', 'hvac', 'ductwork', 'ventilation', 'multi'] },
  // ELECTRICAL — electrical trades only (+ multi)
  'KB-E01': { file: 'electrical/E01_cable_types.json', priority: 'critical', always: false,
    trades: ['electrical', 'multi'] },
  'KB-E02': { file: 'electrical/E02_cable_containment.json', priority: 'critical', always: false,
    trades: ['electrical', 'multi'] },
  'KB-E03': { file: 'electrical/E03_distribution.json', priority: 'high', always: false,
    trades: ['electrical', 'multi'] },
  'KB-E04': { file: 'electrical/E04_lighting_power.json', priority: 'high', always: false,
    trades: ['electrical', 'multi'] },
  'KB-E05': { file: 'electrical/E05_specialist_systems.json', priority: 'medium', always: false,
    trades: ['electrical', 'fire', 'multi'] },
  // INSULATION — insulation + mechanical trades that need insulation context
  'KB-I01': { file: 'insulation/I01_pipe_insulation.json', priority: 'critical', always: false,
    trades: ['insulation', 'mechanical', 'pipework', 'plumbing', 'multi'] },
  'KB-I02': { file: 'insulation/I02_duct_insulation.json', priority: 'high', always: false,
    trades: ['insulation', 'ductwork', 'hvac', 'ventilation', 'multi'] },
  'KB-I03': { file: 'insulation/I03_equipment_insulation.json', priority: 'high', always: false,
    trades: ['insulation', 'mechanical', 'multi'] },
  'KB-I04': { file: 'insulation/I04_fire_specialist.json', priority: 'medium', always: false,
    trades: ['insulation', 'fire', 'mechanical', 'multi'] },
  // CONTRACTS — loaded for journal, EOT analysis, quote context
  'KB-CT01': { file: 'contracts/CT01_jct_nec_overview.json', priority: 'high', always: false, trades: ['all'] },
  'KB-CT02': { file: 'contracts/CT02_payment_retention.json', priority: 'high', always: false, trades: ['all'] },
  'KB-CT03': { file: 'contracts/CT03_variations_eot.json', priority: 'critical', always: false, trades: ['all'] },
  'KB-CT04': { file: 'contracts/CT04_disputes_termination.json', priority: 'medium', always: false, trades: ['all'] },
  // COMPLIANCE — loaded for CIS, journal, document analysis
  'KB-CP01': { file: 'compliance/CP01_cis_scheme.json', priority: 'high', always: false, trades: ['all'] },
  'KB-CP02': { file: 'compliance/CP02_vat_reverse_charge.json', priority: 'medium', always: false, trades: ['all'] },
  'KB-CP03': { file: 'compliance/CP03_cdm_health_safety.json', priority: 'medium', always: false, trades: ['all'] },
  'KB-CP04': { file: 'compliance/CP04_building_regs.json', priority: 'high', always: false,
    trades: ['insulation', 'fire', 'mechanical', 'ductwork', 'hvac', 'ventilation', 'plumbing', 'electrical', 'multi'] },
  // ENDPOINT CONTEXT PROMPTS — loaded first, sets the AI's role and task for each endpoint
  'KB-P01': { file: 'prompts/P01_drawing_extraction.json', priority: 'critical', always: false, trades: ['all'] },
  'KB-P02': { file: 'prompts/P02_journal_analysis.json', priority: 'critical', always: false, trades: ['all'] },
  'KB-P03': { file: 'prompts/P03_quote_analysis.json', priority: 'critical', always: false, trades: ['all'] },
  'KB-P04': { file: 'prompts/P04_spec_analysis.json', priority: 'critical', always: false, trades: ['all'] },
  // EXTRACTION RULES — always loaded (all trades)
  'KB-X01': { file: 'rules/X01_extraction_logic.json', priority: 'critical', always: true, trades: ['all'] },
  'KB-X02': { file: 'rules/X02_confidence_scoring.json', priority: 'critical', always: true, trades: ['all'] },
  'KB-X03': { file: 'rules/X03_conflict_resolution.json', priority: 'critical', always: true, trades: ['all'] },
  'KB-X04': { file: 'rules/X04_hallucination_prevention.json', priority: 'critical', always: true, trades: ['all'] },
  'KB-X05': { file: 'rules/X05_estimator_guidelines.json', priority: 'critical', always: true, trades: ['all'] },
};

/* ══════════════════════════════════════════════════════════════════
   ENDPOINT → SECTIONS MAPPING
   ══════════════════════════════════════════════════════════════════ */

const ENDPOINT_SECTIONS = {
  '/api/drawings/extract': [
    'KB-P01',
    'KB-C01','KB-C02','KB-C03','KB-C04',
    'KB-M01','KB-M02','KB-M03','KB-M04',
    'KB-E01','KB-E02','KB-E03','KB-E04','KB-E05',
    'KB-I01','KB-I02','KB-I03','KB-I04',
    'KB-X01','KB-X02','KB-X03','KB-X04','KB-X05',
  ],
  '/api/specs/analyse': [
    'KB-P04',
    'KB-C01','KB-C02','KB-C03','KB-C04',
    'KB-M01','KB-M02','KB-M03','KB-M04',
    'KB-E01','KB-E02','KB-E03','KB-E04','KB-E05',
    'KB-I01','KB-I02','KB-I03','KB-I04',
    'KB-X02','KB-X03','KB-X04','KB-X05',
  ],
  '/api/takeoff/consolidate': [
    'KB-C02','KB-C03','KB-C04',
    'KB-X01','KB-X02','KB-X03','KB-X04','KB-X05',
  ],
  '/api/feedback/process': [
    'KB-X01','KB-X02','KB-X03','KB-X04',
  ],
  '/api/quotes/extract': [
    'KB-P03',
    'KB-C01','KB-C02','KB-C03','KB-C04',
    'KB-M01','KB-M02','KB-M03','KB-M04',
    'KB-E01','KB-E02','KB-E03','KB-E04','KB-E05',
    'KB-I01','KB-I02','KB-I03','KB-I04',
    'KB-X01','KB-X02','KB-X03','KB-X04','KB-X05',
  ],
  '/api/journal/analyse': [
    'KB-P02',
    'KB-C01','KB-C04',
    'KB-CT01','KB-CT02','KB-CT03','KB-CT04',
    'KB-CP03',
    'KB-X02','KB-X03','KB-X05',
  ],
  '/api/quote-files/analyse': [
    'KB-P03',
    'KB-C01','KB-C02','KB-C04',
    'KB-CT01','KB-CT02',
    'KB-CP01','KB-CP02',
    'KB-X02','KB-X04','KB-X05',
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
   Supports two modes:
   - Org-scoped (orgId provided): reads/writes Supabase learned_rules table
   - File-based (no orgId / demo): reads/writes local JSON files (legacy)
   ══════════════════════════════════════════════════════════════════ */

const L01_PATH = path.join(KB_BASE_PATH, 'learning/L01_learned_rules.json');
const L02_PATH = path.join(KB_BASE_PATH, 'learning/L02_pattern_errors.json');

/* ── File-based (legacy / demo fallback) ──────────────────── */

function loadDynamicSectionsFromFiles() {
  const dynamic = {};
  try { dynamic['KB-L01'] = JSON.parse(fs.readFileSync(L01_PATH, 'utf-8')); } catch { dynamic['KB-L01'] = { learned_rules: [], last_updated: null }; }
  try { dynamic['KB-L02'] = JSON.parse(fs.readFileSync(L02_PATH, 'utf-8')); } catch { dynamic['KB-L02'] = { pattern_errors: [], last_updated: null }; }
  return dynamic;
}

function persistLearnedRulesToFiles(newRules) {
  let existing = { learned_rules: [], last_updated: null };
  try { existing = JSON.parse(fs.readFileSync(L01_PATH, 'utf-8')); } catch {}

  const existingIds = new Set(existing.learned_rules.map(r => r.rule_id));
  const merged = [...existing.learned_rules];

  for (const rule of newRules) {
    // Ensure example fields are preserved
    const enriched = { ...rule };
    if (!enriched.example_before) enriched.example_before = '';
    if (!enriched.example_after) enriched.example_after = '';

    if (!existingIds.has(rule.rule_id)) {
      merged.push(enriched);
      console.log(`[KB] Persisted new learned rule (file): ${rule.rule_id}`);
    } else {
      const idx = merged.findIndex(r => r.rule_id === rule.rule_id);
      merged[idx] = enriched;
      console.log(`[KB] Updated learned rule (file): ${rule.rule_id}`);
    }
  }

  const updated = { learned_rules: merged, last_updated: new Date().toISOString(), total_rules: merged.length };
  const tmp = L01_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(updated, null, 2));
  fs.renameSync(tmp, L01_PATH);
  console.log(`[KB] KB-L01 file updated. Total rules: ${merged.length}`);
  return updated;
}

function persistPatternErrorToFiles(errorType, occurrences, heightenedAction) {
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
    console.log(`[KB] New pattern error registered (file): ${patternId} — ${errorType}`);
  }

  existing.last_updated = new Date().toISOString();
  const tmp = L02_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(existing, null, 2));
  fs.renameSync(tmp, L02_PATH);
  return existing;
}

/* ── Org-scoped (Supabase database) ──────────────────────── */

let _db = null;
function _getDB() {
  if (!_db) {
    try { _db = require('../db/queries'); } catch (e) {
      console.error('[KB] Failed to load db/queries:', e.message);
      _db = null;
    }
  }
  if (_db && !_db.dbReady()) {
    console.warn('[KB] db/queries loaded but dbReady() returned false — Supabase not configured');
    return null;
  }
  return _db || null;
}

async function loadDynamicSectionsForOrg(orgId, trade) {
  const db = _getDB();
  if (!db) return loadDynamicSectionsFromFiles();

  try {
    // Load org-private rules
    const allRules = await db.getLearnedRules(orgId);
    const extractionRules = allRules.filter(r => r.rule_type !== 'pattern-error');
    const patternErrors = allRules.filter(r => r.rule_type === 'pattern-error');

    // Load trade collective rules (if org has opted in and trade is known)
    // Also always load 'all' trade rules (admin corrections applying to every trade)
    let collectiveRules = [];
    if (trade || true) {  // Always attempt — 'all' trade rules should load for everyone
      const collectiveEnabled = await db.isCollectiveLearningEnabled(orgId);
      if (collectiveEnabled) {
        const rawCollective = await db.getCollectiveRulesForTrade(trade || 'all');
        // Exclude rules originally shared by this org (they already have the org-private version)
        collectiveRules = rawCollective
          .filter(r => r.shared_by_org !== orgId && r.rule_type !== 'pattern-error')
          .map(r => ({
            rule_id: r.id,
            error_type: r.rule_type,
            trigger: r.trigger_text,
            action: r.action_text,
            reason: r.reason || '',
            date: r.shared_at ? r.shared_at.slice(0, 10) : '',
            example_before: r.example_before || '',
            example_after: r.example_after || '',
            occurrences: r.occurrences || 1,
            context_keywords: r.context_keywords || [],
            _source: 'trade-collective',
          }));
        if (collectiveRules.length > 0) {
          console.log(`[KB] Loaded ${collectiveRules.length} trade collective rules for ${trade}`);
        }
      }
    }

    return {
      'KB-L01': {
        learned_rules: extractionRules.map(r => ({
          rule_id: r.id,
          error_type: r.rule_type,
          trigger: r.trigger_text,
          action: r.action_text,
          reason: r.reason || '',
          date: r.created_at ? r.created_at.slice(0, 10) : '',
          example_before: r.example_before || '',
          example_after: r.example_after || '',
          occurrences: r.occurrences || 1,
          context_keywords: r.context_keywords || [],
          _source: 'org',
        })),
        last_updated: extractionRules[0]?.updated_at || null,
      },
      'KB-L02': {
        pattern_errors: patternErrors.map(r => ({
          pattern_id: r.id,
          error_type: r.trigger_text,
          occurrences: r.occurrences || 3,
          heightened_action: r.action_text,
          first_detected: r.created_at,
          last_triggered: r.updated_at,
        })),
        last_updated: patternErrors[0]?.updated_at || null,
      },
      'KB-L03': {
        collective_rules: collectiveRules,
        trade: trade,
        last_updated: collectiveRules[0]?.date || null,
      },
    };
  } catch (err) {
    console.error('[KB] Failed to load org rules from DB, falling back to files:', err.message);
    return loadDynamicSectionsFromFiles();
  }
}

async function persistLearnedRulesForOrg(orgId, newRules, userId, trade) {
  const db = _getDB();
  if (!db) return persistLearnedRulesToFiles(newRules);

  try {
    let persisted = 0;
    let sharedToCollective = 0;

    for (const rule of newRules) {
      const ruleType = rule.error_type || 'extraction';

      // Auto-extract context keywords from rule text for relevance scoring
      const ruleText = [rule.trigger || '', rule.action || '', rule.reason || ''].join(' ');
      const keywords = [...new Set(tokenise(ruleText))].slice(0, 30); // cap at 30 keywords

      // Save org-private copy
      await db.upsertLearnedRule(orgId, rule.rule_id, {
        rule_type: ruleType,
        trigger_text: rule.trigger,
        action_text: rule.action,
        reason: rule.reason || '',
        source_project: rule.project_ref || null,
        created_by: userId || null,
        example_before: rule.example_before || null,
        example_after: rule.example_after || null,
        context_keywords: keywords,
      });
      persisted++;

      // Auto-share non-pricing extraction rules to trade collective
      // Pricing rules are NEVER shared — commercial sensitivity
      if (trade && ruleType !== 'pricing') {
        try {
          console.log(`[KB] Sharing to trade collective: trade=${trade}, ruleType=${ruleType}, orgId=${orgId}`);
          await db.autoShareToCollective(orgId, {
            rule_type: ruleType,
            trigger_text: rule.trigger,
            action_text: rule.action,
            reason: rule.reason || '',
            example_before: rule.example_before || null,
            example_after: rule.example_after || null,
            context_keywords: keywords,
            created_by: userId || null,
          }, trade);
          sharedToCollective++;
          console.log(`[KB] Trade collective share succeeded for org ${orgId}`);
        } catch (shareErr) {
          console.error(`[KB] Auto-share to collective FAILED: ${shareErr.message}`, shareErr.stack);
        }
      } else {
        console.log(`[KB] Skipping collective share: trade=${trade}, ruleType=${ruleType}`);
      }

      console.log(`[KB] Persisted learned rule for org ${orgId}: ${rule.rule_id || rule.trigger} (${keywords.length} keywords)${sharedToCollective ? ' + collective' : ''}`);
    }
    return { persisted, shared_to_collective: sharedToCollective, org_id: orgId };
  } catch (err) {
    console.error('[KB] Failed to persist org rules to DB, falling back to files:', err.message);
    return persistLearnedRulesToFiles(newRules);
  }
}

async function persistPatternErrorForOrg(orgId, errorType, occurrences, heightenedAction, userId) {
  const db = _getDB();
  if (!db) return persistPatternErrorToFiles(errorType, occurrences, heightenedAction);

  try {
    await db.upsertLearnedRule(orgId, null, {
      rule_type: 'pattern-error',
      trigger_text: errorType,
      action_text: heightenedAction,
      reason: `Auto-detected pattern — ${occurrences} occurrences`,
      occurrences: occurrences,
      created_by: userId || null,
    });
    console.log(`[KB] Pattern error persisted for org ${orgId}: ${errorType}`);
    return { org_id: orgId, error_type: errorType };
  } catch (err) {
    console.error('[KB] Failed to persist org pattern error to DB, falling back to files:', err.message);
    return persistPatternErrorToFiles(errorType, occurrences, heightenedAction);
  }
}

/* ── Unified interface (routes should call these) ─────────── */

function loadDynamicSections(orgId, trade) {
  if (orgId && orgId !== 'demo-org-id') {
    // Returns a promise — callers must await
    return loadDynamicSectionsForOrg(orgId, trade);
  }
  return loadDynamicSectionsFromFiles();
}

function persistLearnedRules(newRules, orgId, userId, trade) {
  if (orgId && orgId !== 'demo-org-id') {
    return persistLearnedRulesForOrg(orgId, newRules, userId, trade);
  }
  return persistLearnedRulesToFiles(newRules);
}

function persistPatternError(errorType, occurrences, heightenedAction, orgId, userId) {
  if (orgId && orgId !== 'demo-org-id') {
    return persistPatternErrorForOrg(orgId, errorType, occurrences, heightenedAction, userId);
  }
  return persistPatternErrorToFiles(errorType, occurrences, heightenedAction);
}

/* ══════════════════════════════════════════════════════════════════
   PROMPT ASSEMBLER
   ══════════════════════════════════════════════════════════════════ */

async function assembleKBPrompt(endpoint, options = {}) {
  loadKBCache();

  const { priorityFilter = null, orgId = null, trade = null, requestContext = null } = options;
  const sectionIds = ENDPOINT_SECTIONS[endpoint];
  if (!sectionIds) return '';

  // Load dynamic sections — org-scoped if orgId provided, trade-collective if trade known
  const dynamicResult = loadDynamicSections(orgId, trade);
  const dynamic = (dynamicResult && typeof dynamicResult.then === 'function')
    ? await dynamicResult
    : dynamicResult;

  const assembled = [];

  // Static sections (shared across all orgs — industry standards)
  // Trade-aware filtering: only load sections relevant to the user's trade
  let loadedCount = 0, skippedByTrade = 0;
  for (const sectionId of sectionIds) {
    const config = KB_SECTIONS[sectionId];
    if (!config) continue;
    if (priorityFilter && config.priority !== priorityFilter) continue;

    // Trade filter: skip sections not relevant to this user's trade
    // 'all' in trades means always load; sections with no trades field always load
    if (trade && config.trades && !config.trades.includes('all') && !config.trades.includes(trade)) {
      skippedByTrade++;
      continue;
    }

    const content = _kbCache[sectionId];
    if (!content) {
      assembled.push(`\n[${sectionId} — NOT LOADED]\n`);
      continue;
    }

    assembled.push(formatSection(sectionId, content));
    loadedCount++;
  }
  if (skippedByTrade > 0) {
    console.log(`[KB] Trade filter (${trade}): loaded ${loadedCount} sections, skipped ${skippedByTrade} irrelevant sections`);
  }

  // Dynamic: Org-Private Learned Rules (relevance-filtered)
  const allLearnedRules = dynamic['KB-L01']?.learned_rules || [];
  let learnedRules = allLearnedRules;

  if (allLearnedRules.length > 0 && requestContext) {
    const maxRules = getMaxRulesForEndpoint(endpoint);
    learnedRules = scoreRules(allLearnedRules, requestContext, { maxRules });
    if (allLearnedRules.length > learnedRules.length) {
      console.log(`[KB] Rule scorer: ${learnedRules.length}/${allLearnedRules.length} org rules selected for ${endpoint}`);
    }
  }

  if (learnedRules.length > 0) {
    assembled.push(formatLearnedRules(learnedRules));
  }

  // Dynamic: Trade Collective Rules (relevance-filtered, clearly labelled)
  const collectiveRules = dynamic['KB-L03']?.collective_rules || [];
  if (collectiveRules.length > 0) {
    let filteredCollective = collectiveRules;
    if (requestContext) {
      // Collective rules get half the slot budget of org rules (org rules take priority)
      const maxCollective = Math.max(3, Math.floor(getMaxRulesForEndpoint(endpoint) / 2));
      filteredCollective = scoreRules(collectiveRules, requestContext, { maxRules: maxCollective });
      if (collectiveRules.length > filteredCollective.length) {
        console.log(`[KB] Rule scorer: ${filteredCollective.length}/${collectiveRules.length} collective rules selected for ${endpoint}`);
      }
    }
    if (filteredCollective.length > 0) {
      assembled.push(formatCollectiveRules(filteredCollective, dynamic['KB-L03']?.trade));
    }
  }

  // Dynamic: Pattern Errors (org-scoped) — always include all (they're critical)
  const patternErrors = dynamic['KB-L02']?.pattern_errors || [];
  if (patternErrors.length > 0) {
    assembled.push(formatPatternErrors(patternErrors));
  }

  // Self-audit against all active rules (org + collective)
  const allActiveRules = [...learnedRules, ...collectiveRules];
  if (allActiveRules.length > 0) {
    assembled.push(getSelfAuditPrompt(allActiveRules));
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
  const compressed = compressPayload(payload);
  return `═══ ${sectionId}: ${title}${ver} ═══\n${JSON.stringify(compressed)}`;
}

/** Strip verbose reference data that doesn't help extraction accuracy */
function compressPayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(compressPayload);
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip large reference arrays that list every possible size — Claude knows standard sizes
    if (key === 'common_sizes' || key === 'common_sizes_mm' || key === 'conductor_sizes_mm2') continue;
    // Skip verbose gauge tables — Claude knows DW/144 gauge defaults
    if (key === 'gauge_by_size') continue;
    // Skip pressure class detail — not needed for quantity extraction
    if (key === 'airtightness_classes') continue;
    result[key] = compressPayload(value);
  }
  return result;
}

function formatLearnedRules(rules) {
  const lines = rules.map(r => {
    let line = `  ${r.rule_id}: [${r.trigger}] → ${r.action}`;
    // Include before/after example if available — gives Claude concrete context
    if (r.example_before && r.example_after) {
      line += `\n    BEFORE: ${r.example_before}`;
      line += `\n    AFTER:  ${r.example_after}`;
    }
    // Show relevance score if rule was scored (helps with debugging/transparency)
    if (r._relevanceScore !== undefined && r._relevanceScore < 1.0) {
      line += `  [relevance: ${(r._relevanceScore * 100).toFixed(0)}%]`;
    }
    return line;
  });
  return `═══ KB-L01: LEARNED RULES (${rules.length} active) ═══
Applied from previous estimator feedback. Override defaults where they conflict.
Where a BEFORE/AFTER example is given, use it as a concrete reference for the expected output format and level of detail.
${lines.join('\n')}`;
}

function formatCollectiveRules(rules, trade) {
  const lines = rules.map(r => {
    let line = `  ${r.rule_id}: [${r.trigger}] → ${r.action}`;
    if (r.example_before && r.example_after) {
      line += `\n    BEFORE: ${r.example_before}`;
      line += `\n    AFTER:  ${r.example_after}`;
    }
    return line;
  });
  const tradeName = (trade || 'unknown').toUpperCase();
  return `═══ KB-L03: TRADE COLLECTIVE RULES — ${tradeName} (${rules.length} active) ═══
These rules were contributed by other ${tradeName} contractors and verified across multiple projects.
They represent common corrections for this trade. Apply alongside org-specific rules.
If an org-specific rule (KB-L01) conflicts with a collective rule (KB-L03), the org-specific rule takes priority.
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

async function getKBPromptWithBudget(endpoint, tokenBudget, orgId, requestContext, trade) {
  // Try full assembly (org-scoped + trade-collective if available, relevance-filtered)
  const full = await assembleKBPrompt(endpoint, { orgId, trade, requestContext });
  if (estimateTokens(full) <= tokenBudget) {
    return { prompt: full, truncated: false };
  }

  // Fallback: critical sections only (still use relevance filter on rules)
  console.warn(`[KB] Token budget exceeded for ${endpoint}. Falling back to critical sections only.`);
  const critical = await assembleKBPrompt(endpoint, { priorityFilter: 'critical', orgId, trade, requestContext });
  return {
    prompt: critical,
    truncated: true,
    warningMessage: 'Non-critical KB sections omitted due to token budget.'
  };
}

/* ══════════════════════════════════════════════════════════════════
   METADATA
   ══════════════════════════════════════════════════════════════════ */

async function loadLearning(orgId) {
  const dynamicResult = loadDynamicSections(orgId);
  const dynamic = (dynamicResult && typeof dynamicResult.then === 'function')
    ? await dynamicResult
    : dynamicResult;
  return {
    learnedRules: dynamic['KB-L01']?.learned_rules || [],
    patternErrors: dynamic['KB-L02']?.pattern_errors || []
  };
}

async function saveLearning(rules, patterns, orgId) {
  if (orgId && orgId !== 'demo-org-id') {
    const db = _getDB();
    if (db) {
      // Clear existing and re-insert for this org
      await db.clearLearnedRules(orgId);
      for (const r of rules) {
        await db.saveLearnedRule(orgId, {
          rule_type: r.error_type || 'extraction',
          trigger_text: r.trigger,
          action_text: r.action,
          reason: r.reason || '',
        });
      }
      for (const p of patterns) {
        await db.saveLearnedRule(orgId, {
          rule_type: 'pattern-error',
          trigger_text: p.error_type,
          action_text: p.heightened_action,
          reason: `${p.occurrences || 3} occurrences`,
          occurrences: p.occurrences || 3,
        });
      }
      return;
    }
  }
  // File-based fallback
  const tmp1 = L01_PATH + '.tmp';
  const tmp2 = L02_PATH + '.tmp';
  fs.writeFileSync(tmp1, JSON.stringify({ learned_rules: rules, last_updated: new Date().toISOString(), total_rules: rules.length }, null, 2));
  fs.renameSync(tmp1, L01_PATH);
  fs.writeFileSync(tmp2, JSON.stringify({ pattern_errors: patterns, last_updated: new Date().toISOString(), total_patterns: patterns.length }, null, 2));
  fs.renameSync(tmp2, L02_PATH);
}

async function processAndPersistFeedback(aiResponseText, orgId, userId, trade) {
  try {
    const cleaned = aiResponseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return;
    const result = JSON.parse(match[0]);

    const newRules = result.updated_rules || result.learned_rules || [];
    if (newRules.length > 0) await persistLearnedRules(newRules, orgId, userId, trade);

    const newPatterns = result.pattern_errors || [];
    for (const pe of newPatterns) {
      await persistPatternError(pe.error_type, pe.occurrences || 3, pe.heightened_action || `Triple-check ${pe.error_type} items.`, orgId, userId);
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
  persistLearnedRulesToFiles,
  persistPatternErrorToFiles,
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
  // Re-export scorer for routes that need direct access
  scoreRules,
  extractContext: require('./rule-scorer').extractContext,
};
